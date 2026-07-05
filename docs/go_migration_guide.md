# MedicAI Backend - Go (Golang) Migration Guide 🚀

Ushbu qo'llanma mavjud Node.js (Express) backendini **Go** tiliga va **Gin** freymvorkiga o'tkazishni rejalashtirayotgan dasturchilar uchun to'liq yo'riqnoma hisoblanadi. Go tili statik tipli bo'lgani uchun tezroq va xavfsizrok hisoblanadi.

## 1. Kerakli texnologiyalar

Go versiyasini ishlash tartibida bo'lishiga ishonch hosil qiling (Go 1.20+ tavsiya etiladi). Loyihani quyidagi kutubxonalar bilan yaratamiz:
- **Web Framework:** [Gin Web Framework](https://gin-gonic.com/) (`github.com/gin-gonic/gin`)
- **CORS Middleware:** `github.com/gin-contrib/cors`
- **Environment Variables:** `github.com/joho/godotenv`
- **Google Gemini SDK:** `github.com/google/generative-ai-go/genai`

## 2. Loyiha papkalari tuzilishi

Quyidagicha tartibli loyiha tuzishni tavsiya etamiz:

```text
medicai-go-backend/
├── cmd/
│   └── server/
│       └── main.go         # Asosiy ishga tushiruvchi fayl (Express'ning index.ts muqobili)
├── internal/
│   ├── api/
│   │   ├── handlers.go     # Router logikasi (start, action, health)
│   │   └── models.go       # Structlar (TypeScript'dagi types.ts)
│   └── aiengine/
│       └── ai_service.go   # Gemini AI bilan ishlash (ai-engine.ts)
├── .env                    # Kalitlar
├── go.mod
└── go.sum
```

## 3. Asosiy modullarni dasturlash (Code Muqobillari)

### A. Ma'lumot turlari (models.go)
TypeScript interfayslari o'rniga Go dagi `struct`lardan foydalaniladi:

```go
package api

type PatientStats struct {
    HR   int     `json:"hr"`
    BP   string  `json:"bp"`
    Spo2 int     `json:"spo2"`
    RR   int     `json:"rr"`
    Temp float64 `json:"temp"`
    GCS  int     `json:"gcs"`
}

type VisualState struct {
    SplineState  string `json:"spline_state"`
    SkinColor    string `json:"skin_color"`
    MonitorSound string `json:"monitor_sound"`
}

type AIScenario struct {
    Title               string       `json:"title"`
    Description         string       `json:"description"`
    Difficulty          string       `json:"difficulty"`
    InitialPresentation string       `json:"initial_presentation"`
    Topic               string       `json:"topic"`
    PatientStats        PatientStats `json:"patient_stats"`
    VisualState         VisualState  `json:"visual_state"`
    TimeLimitMinutes    int          `json:"time_limit_minutes"`
}
```

### B. Gemini AI integratsiyasi (ai_service.go)
Go dagi Google SDK orqali lokal cache va instansiyalarni globallashtiramiz.

```go
package aiengine

import (
    "context"
    "fmt"
    "os"
    "github.com/google/generative-ai-go/genai"
    "google.golang.org/api/option"
)

var client *genai.Client
var model *genai.GenerativeModel

func InitGemini() error {
    apiKey := os.Getenv("GEMINI_API_KEY")
    if apiKey == "" {
        return fmt.Errorf("GEMINI_API_KEY topilmadi")
    }

    ctx := context.Background()
    c, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
    if err != nil {
        return err
    }
    
    client = c
    model = client.GenerativeModel("gemini-2.5-flash")
    model.ResponseMIMEType = "application/json"
    
    return nil
}

// GenerateScenario va ProcessAction kabi Go funksiyalari shunga asoslanib yoziladi:
// resp, err := model.GenerateContent(ctx, genai.Text(prompt))
```

### C. Server va CORS Sozlamalari (main.go)
Expressdagi `cors` funksiyalarini Gin `cors` middleware ga o'girish qismi:

```go
package main

import (
    "log"
    "os"
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    "github.com/joho/godotenv"
    "medicai/internal/api"
    "medicai/internal/aiengine"
)

func main() {
    if err := godotenv.Load(); err != nil {
        log.Println("INFO: .env fayli topilmadi, server o'zgaruvchilari ishlatiladi.")
    }

    // AI engine error check (Fail fast)
    if err := aiengine.InitGemini(); err != nil {
        log.Fatalf("FATAL ERROR: AI ishga tushirishda xatolik - %v", err)
    }

    router := gin.Default()

    // CORS Configuration
    config := cors.DefaultConfig()
    config.AllowOrigins = []string{"http://localhost:3000"} 
    if frontendURL := os.Getenv("FRONTEND_URL"); frontendURL != "" {
        config.AllowOrigins = append(config.AllowOrigins, frontendURL)
    }
    router.Use(cors.New(config))

    apiGroup := router.Group("/api")
    {
        apiGroup.GET("/health", api.HealthCheck)
        apiGroup.POST("/start", api.StartSimulation)
        apiGroup.POST("/action", api.ProcessAction)
    }

    port := os.Getenv("PORT")
    if port == "" {
        port = "4002"
    }
    
    router.Run(":" + port)
}
```

## 4. Muhim maslahatlar tahlili

1. **JSON Parsing xavfsizligi:** Go statik ravishda typelar ishlatadi. Shuning uchun Gemini modelidan qaytadan `json.Unmarshal()` qilayotganda kutilmagan javob formatlari uchun jiddiy xato (error handling) qaytarish e'tiborga olinishi lozim. Expressdagi kabi bo'sh ob'yekt kiritib (duck typing) yuborish o'xshamaydi.
2. **Kutubxonani yozish (Rate Limit):** Go muhitida `retries` va delay qilish `time.Sleep()` orqali sodda bo'ladi:
   ```go
   import "time"
   time.Sleep(15 * time.Second)
   ```
3. **Konkurentlik (Concurrency):** Agar bir vaqtda ko'plab mijozlar ulanishi kuzatilsa, model instansiyasi ishonchli (thread-safe) yoki go-routinelar orqali alohida murojaat etilishi mumkin.

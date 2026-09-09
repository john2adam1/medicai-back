# MedicAI — Professional Medical Simulation Platform

MedicAI — bu shifokorlar va tibbiyot talabalari uchun sun'iy intellekt (Gemini AI) asosida ishlovchi zamonaviy klinik simulyatsiya platformasi. Loyiha **Next.js Fullstack** arxitekturasida tuzilgan bo'lib, veb-interfeys va AI API serveri bitta loyihada birlashgan. Mobil ilova esa alohida Expo papkasida joylashgan.

---

## 📁 Loyiha Strukturasi

```text
medicai/
├── src/                      # Next.js Fullstack manba kodi
│   ├── app/                  # App Router sahifalari va API route'lari
│   │   ├── api/              # Server-side API endpointlar (start, action, recommendations, health)
│   │   ├── login/            # Kirish sahifasi
│   │   ├── register/         # Ro'yxatdan o'tish sahifasi
│   │   ├── profile/          # Profil va statistika
│   │   ├── layout.tsx        # Asosiy layout
│   │   └── page.tsx          # Asosiy simulyatsiya ekrani
│   ├── components/           # UI komponentlar (VitalMonitor, PatientVisualizer, ChatInterface...)
│   └── lib/                  # AI Engine dvigateli, Supabase, Store, Tiplar, i18n
│
├── public/                   # Statik resurslar va rasmlar
├── .env.example              # Muhit o'zgaruvchilari namunasi
├── next.config.ts            # Next.js konfiguratsiyasi
├── package.json              # Asosiy paketlar va scriptlar
└── tsconfig.json             # TypeScript konfiguratsiyasi
```

---

## 🚀 Tezkor Ishga Tushirish (Quick Start)

### 1. Paketlarni O'rnatish

```bash
npm install
```

---

### 2. Muhit O'zgaruvchilarini (.env.local) Sozlash

`.env.example` faylidan nusxa olib, `.env.local` faylini yarating:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sizning_supabase_proyekt_urlingiz
NEXT_PUBLIC_SUPABASE_ANON_KEY=sizning_supabase_anon_kalitingiz

# Gemini AI Engine (Server-side)
GEMINI_API_KEY=sizning_gemini_api_kalitingiz
```

---

### 3. Loyihani Ishga Tushirish

```bash
npm run dev
```

* **Veb-ilova va API:** [http://localhost:3000](http://localhost:3000)
* **Health check:** [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 🌐 Vercel-ga Deploy Qilish

Loyiha to'liq **Next.js Fullstack** bo'lgani uchun:
1. GitHub repozitoriyangizni Vercel-ga ulang.
2. Hech qanday "Root Directory" o'zgartirish shart emas (`./` turishi kifoya).
3. Vercel Environment Variables bo'limiga `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL` va `NEXT_PUBLIC_SUPABASE_ANON_KEY` ni kiriting.
4. **Deploy** tugmasini bosing — frontend ham, backend API route'lari ham avtomatik Vercel Serverless tizimida ishlaydi!

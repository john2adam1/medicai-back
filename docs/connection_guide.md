# Frontend va Backend-ni O'zaro Bog'lash Qo'llanmasi

Loyiha backend va frontend qismlarga ajratilgandan so'ng, ularni bir-biriga ulash quyidagi tartibda amalga oshiriladi.

## 1. Lokal Muhitda Bog'lash (Local Development)

Lokal kompyuterda backend va frontend bir vaqtda ishlashi uchun turli portlarda ishga tushiriladi va o'zaro `Environment Variables` (muhit o'zgaruvchilari) orqali bog'lanadi.

### A. Backend Sozlamalari (`medicai-back/.env`)
Backend loyihasining ildiz (root) papkasida `.env` fayli mavjud. U yerda quyidagi o'zgaruvchilar bo'lishi kerak:
```env
PORT=4002
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=Sening_Gemini_API_Kaliting
```
* **PORT:** Backend qaysi portda ishlashini belgilaydi (masalan, `4002`).
* **FRONTEND_URL:** CORS xatoligi chiqmasligi uchun qaysi frontend domenidan ruxsat berilishini belgilaydi (lokal Next.js uchun odatda `http://localhost:3000`).

### B. Frontend Sozlamalari (`medicai-front/.env.local`)
Frontend loyihasining ildiz (root) papkasida `.env.local` fayli bo'lishi lozim (agar yo'q bo'lsa yaratiladi):
```env
NEXT_PUBLIC_API_URL=http://localhost:4002/api
```
* **NEXT_PUBLIC_API_URL:** Zustan store (yoki boshqa api chaqiradigan joylar) so'rovlarni qaysi manzilga jo'natishini belgilaydi. Bu manzil backend manzili va porti bilan bir xil bo'lishi shart.

---

## 2. Server yoki Vercel (Production) Muhitida Bog'lash

Loyihani jamoatga taqdim etish (deploy qilish) uchun har ikkala qism ham alohida deploy qilinadi:

### A. Backend-ni Deploy Qilish (Vercel)
Backend-ni Vercel platformasida alohida loyiha qilib deploy qilishingiz mumkin.
1. `vercel.json` quyidagicha konfiguratsiya qilinadi:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/index.ts"
       }
     ]
   }
   ```
2. Vercel loyihasining **Environment Variables** sozlamalariga quyidagilarni kiritasiz:
   - `GEMINI_API_KEY`: Gemini API Kaliti
   - `FRONTEND_URL`: production frontend manzili (masalan, `https://medicai-front.vercel.app`)
3. Deploy bo'lgandan so'ng Vercel sizga backend uchun manzil beradi (masalan, `https://medicai-back.vercel.app`).

### B. Frontend-ni Deploy Qilish (Vercel)
1. Frontend loyihasini Vercel-da Next.js loyiha sifatida deploy qilasiz.
2. Vercel loyihasining **Environment Variables** sozlamalariga quyidagilarni kiritasiz:
   - `NEXT_PUBLIC_API_URL`: Backend deploy qilingan manzilning oxiriga `/api` qo'shilgan holi (masalan, `https://medicai-back.vercel.app/api`).

---

## 3. CORS Xavfsizlik Sozlamasi haqida

Backend kodimizda CORS (`cors` middleware) o'rnatilgan bo'lib, u faqat ruxsat etilgan domenlardangina kelgan so'rovlarni qabul qiladi:
- `http://localhost:3000` (yoki `.env` dagi `FRONTEND_URL` domeni)
- Barcha `https://*.vercel.app` subdomenlari

Shu sababli, agar CORS xatoliklari yuzaga kelsa, har doim backend qismidagi `FRONTEND_URL` hamda frontend qismidagi `NEXT_PUBLIC_API_URL` manzillarini to'g'ri sozlanganini tekshiring.

# MedicAI Simulation Backend API

Bu loyiha MedicAI simulyatsiya tizimining backend qismidir. U AI (Gemini) yordamida klinik holatlarni va shifokor xatti-harakatlarini baholovchi API hisoblanadi.

## Ishga Tushirish (Development)

1. **Kutubxonalarni o'rnatish:**
   ```bash
   npm install
   ```

2. **Environment variable faylini yaratish:**
   `.env.example` namunasidan foydalanib `.env` faylini yarating va quyidagi o'zgaruvchilarni kiriting:
   ```env
   PORT=4002
   GEMINI_API_KEY=Sizning_Gemini_API_Kalitingiz
   FRONTEND_URL=http://localhost:3000
   ```

3. **Lokal serverni ishga tushirish:**
   ```bash
   npm run dev
   ```
   Backend API `http://localhost:4002` (yoki belgilangan PORTda) ishga tushadi.

## Bog'lanish Qo'llanmasi

Tizim alohida frontend va backend dan iborat bo'lib, o'zaro veb-so'rovlar (REST API) orqali bog'lanadi. Ularni lokal va jonli (production) holatda qanday sozlash bo'yicha batafsil yo'riqnoma:
👉 **[Bog'lanish Qo'llanmasi (CORS, Vercel, Local)](./docs/connection_guide.md)**

## Loyiha Tuzilishi

* `/src/index.ts` — API marshrutlari (Express setup, CORS va server ishga tushishi).
* `/src/lib/ai-engine.ts` — Gemini API integratsiyasi (Scenario yaratish va xatti-harakatlarni baholash).
* `/src/lib/types.ts` — Loyiha ma'lumotlar turlari (TypeScript types).
* `/vercel.json` — Vercel-da standalone deploy qilish konfiguratsiyasi.

## Mavjud API Marshrutlari

* `POST /api/start` — Yangi ssenariyni generator qiladi.
* `POST /api/action` — Shifokor xatti-harakatini baholaydi va bemor holatini yangilaydi.
* `GET /api/health` — API ishlash holatini tekshirish.

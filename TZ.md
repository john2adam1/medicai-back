# 📋 TEXNIK TOPSHIRIQ (TZ): "MedicAI" PLATFORMASI

## 1. Loyiha Haqida Umumiy Ma'lumot
* **Loyiha nomi:** MedicAI — Professional Medical Simulation Platform
* **Maqsadi:** Shifokorlar, rezidentlar va tibbiyot talabalari uchun sun'iy intellekt (Gemini AI) yordamida klinik vaziyatlarni real vaqt rejimida simulyatsiya qilish, ularning amaliy va klinik ko'nikmalarini baholash hamda rivojlantirish.
* **Qamrovi:** Veb-platforma, mobil ilova va markaziy backend tizimi.

---

## 2. Foydalanuvchilar va Kirish Huquqlari
1. **Foydalanuvchi (Talaba / Rezident / Shifokor):**
   - Ro'yxatdan o'tish, profilni to'ldirish (yo'nalishi, bosqichi).
   - Klinik keyslarni yechish, bemor bilan interaktiv muloqot qilish, ko'rik va muolajalar buyurish.
   - Real vaqt rejimida bemorning hayotiy parametrlarini (Vital Signs) kuzatish.
   - Keys yakunida kengaytirilgan debriefing (tahlil), tavsiyalar va tegishli o'quv kurslari reklamasini olish.
   - Tangachalar (Coins) to'plash va ularni sovg'a/vaucherlarga almashtirish.
2. **Admin (Tizim administratori):**
   - Platforma foydalanuvchilarini ko'rish va boshqarish.
   - Klinik keyslar, ssenariylar va mavzular bazasini yuritish.
   - AI tizim ko'rsatmalari (Promptlar) va modellarini sozlash.
   - Reklama, hamkorlik takliflari va vaucherlar/mukofotlar tizimini boshqarish.
   - Tizim statistikasi, moliyaviy hisobotlar va xavfsizlik loglarini monitoring qilish.

---

## 3. Asosiy Modullar va Funksional Talablar

### 3.1. Klinik Simulyatsiya Tizimi (Simulation Lab)
* **Bemor Vizualizatsiyasi:** Bemorning jismoniy holati (tinch, og'riq, hushsiz, tirishish, koma va h.k.).
* **Vital Monitor (Real-vaqt ko'rsatkichlari):**
  - Puls (HR), Qon bosimi (BP), Kislorod saturatsiyasi (SpO2), Nafas chastotasi (RR), Tana harorati (Temp), Glazgo shkalasi (GCS).
  - Yurak urishi va kritik holatlar uchun monitor ovozlari (Audio feedback).
* **AI bilan Interaktiv Muloqot va Tibbiy Harakatlar:**
  - Bemor/hamroh bilan suhbat (anamnez yig'ish).
  - Fizikal ko'rik, laboratoriya tahlillari va instrumental tekshiruvlar buyurish.
  - Dori vositalari, doza va shoshilinch muolajalarni kiritish.
* **Sog'liq Shkalasi (Health Bar) va Taymer:**
  - Noto'g'ri/kechiktirilgan harakatlar bemor holatini yomonlashtiradi, to'g'ri harakatlar barqarorlashtiradi.
  - Shoshilinch vaziyatlar uchun cheklangan vaqt rejimi.

---

### 3.2. Debriefing (Natijalar Tahlili), Tavsiyalar va Kurslar Reklamasi
* **Tahliliy Hisobot:**
  - Qilingan to'g'ri va noto'g'ri qadamlar ketma-ketligi jadvali.
  - Xalqaro klinik protokollar va ko'rsatmalar (Clinical Guidelines) bo'yicha AI izohlari.
  - Foydalanuvchining shaxsiy bilim bo'shliqlarini (weak topics) aniqlash.
* **Targetli Kurslar Reklamasi va AI Tavsiyalari:**
  - Foydalanuvchi qaysi klinik mavzuda xato qilgan bo'lsa (masalan: EKG tahlili, anafilaksiya, kardiogen shok), sun'iy intellekt tahlilga mos ravishda aynan shu yo'nalishdagi o'quv kurslarini tavsiya/reklama qiladi.
  - Reklama hamkor o'quv markazlari bilan shartnoma asosida joylashtiriladi.
* **"Kurslar" Bo'limi (Mustaqil yoki Hamkorlik moduli):**
  - Platforma ichida videodarslar, PDF qo'llanmalar va testlarni o'z ichiga olgan pullik/bepul kurslar bo'limi.
  - **Imtiyoz mexanizmi:** Platforma orqali kurs xarid qilgan foydalanuvchiga alohida obuna sotib olish talab etilmaydi (yoki hamkor kursni sotib olganligini tasdiqlash orqali platformada bepul kirish/imtiyoz taqdim etiladi).

---

### 3.3. Gamifikatsiya, Tangachalar (Coins) va Limitlar Tizimi
* **Bepul Keyslar Limiti:**
  - Foydalanuvchiga kunlik yoki ro'yxatdan o'tganda ma'lum miqdorda bepul keys yechish imkoniyati (limit) beriladi.
  - **Muhim qoida:** Agar keys yomon yechilsa, to'plangan tangachalar kamaymaydi — faqat bepul keys yechish imkoniyati (urinishlar soni) kamayadi.
* **Tangachalar Jamg'arish (Reward System):**
  - Keys muvaffaqiyatli va to'g'ri klinik qarorlar bilan yakunlansa, ballariga mutanosib ravishda tangachalar (Coins) taqdim etiladi.
* **Tangalarni Sarflash va Sovg'alar (Voucher / Store):**
  - Yetarli miqdorda tangalar to'planganda foydalanuvchi ularni quyidagilarga almashtirishi mumkin:
    1. **1 oylik bepul Premium obuna.**
    2. **O'quv kurslari uchun vaucher / chegirma.**
    3. **Tibbiy buyumlar va tibbiy kiyimlar (forma) uchun hamkorlik vaucherlari.**

---

### 3.4. Admin Paneli (Admin Console)
* **Boshqaruv Paneli (Dashboard & Analytics):**
  - Foydalanuvchilar soni, faollik, kunlik bajarilgan simulyatsiyalar.
  - Eng ko'p xato qilinayotgan klinik mavzular statistikasi.
  - AI tokenlari sarfi va xarajatlar monitoringi.
* **Foydalanuvchilarni Boshqarish:**
  - Ro'yxat, bloklash/faollashtirish, balans (tangachalar) va faollik tarixi.
* **Klinik Keyslar va Ssenariylar Boshqaruvi:**
  - Yangi keyslar qo'shish, tahrirlash, qiyinchilik darajalari va toifalar (Kardiologiya, Terapiya va b.).
  - AI yordamida avtomatik yangi keyslar generatsiya qilish va admin tasdig'i.
* **AI Prompt va Model Sozlamalari:**
  - Gemini AI tizim ko'rsatmalari (System Prompts) va harorat (temperature) sozlamalari.
* **Hamkorlik, Reklama va Vaucherlar:**
  - Kurs reklamalarini boshqarish (bannerlar, yo'nalishlar, maqsadli mavzular).
  - Vaucherlar ro'yxati, tanga narxlari, hamkorlik shartlari.
* **Xavfsizlik va Tizim Loglari:**
  - Administrator harakatlari logi, tizim xatoliklari auditi.

---

## 4. Texnologik Stek

| Yo'nalish | Texnologiya | Izoh |
| :--- | :--- | :--- |
| **Backend** | **Go (Golang)** | Yuqori tezlik, parallel ishlash (concurrency), xavfsiz va samarali arxitektura |
| **Web Frontend** | Next.js / React | Admin panel va veb simulyatsiya interfeysi |
| **Mobil Ilova** | Mobil Ilova (iOS & Android) | Smartfonlar uchun maxsus moslashtirilgan interfeys |
| **Ma'lumotlar Bazasi** | PostgreSQL | Foydalanuvchilar, keyslar, tangachalar, tranzaksiyalar va tarix |
| **AI Dvigateli** | Google Gemini AI | Tibbiy simulyatsiya, bemor nutqi, debriefing va tavsiyalar |

---

## 5. Xavfsizlik va Ishlash Ko'rsatkichlari
* **Xavfsizlik:** JWT asosidagi avtorizatsiya, barcha so'rovlarni HTTPS orqali shifrlash, AI API kalitlarini faqat backendda saqlash.
* **Tezkorlik:** Go backend orqali API so'rovlarining 50-100ms ichida qaytishi; AI javoblarining kechikishini minimallashtirish (streaming orqali).
* **Ishonchlilik:** Tangalar hisobi va vaucherlar almashinuvi bo'yicha tranzaksiyalarning to'liq auditi (hech qanday xatolik bilan tangalar yo'qolmasligi yoki suiiste'mol qilinmasligi).

---

## 6. Kelgusi Bosqichlar
1. TZ bo'yicha yakuniy fikr va takliflarni tasdiqlash.
2. Go backend arxitekturasini (API marshrutlari va DB schema) loyihalash.
3. Simulyatsiya logikasi, tangachalar va debriefing integratsiyasini amalga oshirish.

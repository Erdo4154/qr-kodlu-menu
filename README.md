# 🍽️ QR Menü — React + TypeScript + Redux + FastAPI

Bir lokantanın QR kodla açılan dijital menüsü. Müşteri menüyü gezer, ürüne dokununca aynı sayfada açıklama/kalori/gramaj görür, fiyatlar her zaman görünürdür, sepete ekleyip masa numarasıyla sipariş gönderir. Restoran sahibi ise `/admin` sayfasından menüyü tamamen değiştirebilir.

Menü verisi artık `backend/` altındaki FastAPI servisinde (SQLite) tutulur — bir cihazda yapılan değişiklik, aynı backend'e bakan her cihazda görünür.

## Kurulum ve çalıştırma

İki parça var, ikisinin de aynı anda ayakta olması gerekir:

```bash
# 1) Backend (bir terminalde)
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows — macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload     # http://localhost:8000

# 2) Frontend (başka bir terminalde, proje kökünde)
npm install
npm run dev                   # http://localhost:5173
```

Detaylar (uçlar, PIN, deploy) için `backend/README.md`.

Yönetici paneli PIN'i: **1234** (backend'de `.env`'deki `ADMIN_PIN`; istemci kodunda artık hiç geçmiyor).

## Klasör yapısı

```
backend/                    → FastAPI servisi (bkz. backend/README.md)
src/
├── types.ts                → Tüm veri modelleri (Product, Category, MenuState...)
├── store/
│   ├── api.ts               → backend/'e yapılan tüm HTTP istekleri
│   ├── menuSlice.ts         → Menü verisi + düzenleme işlemleri (async thunk'larla API'ye bağlı)
│   ├── cartSlice.ts         → Sepet (ürün id + adet, tarayıcıda geçici)
│   ├── store.ts             → Redux store kurulumu
│   └── hooks.ts             → Tipli useSelector/useDispatch
├── pages/
│   ├── MenuPage.tsx         → Müşteri sayfası ("/")
│   └── AdminPage.tsx        → Yönetici paneli ("/admin", PIN korumalı, akordeon menü)
└── components/
    ├── Header.tsx           → Restoran adı, sepet ve yönetici düğmeleri
    ├── CategoryNav.tsx      → Yapışkan bölüm düğmeleri (tıklayınca kaydırır)
    ├── CategorySection.tsx  → Bir bölüm; kendi accent rengini taşır
    ├── ProductCard.tsx      → Ürün satırı; fiyat noktalı çizgiyle HER ZAMAN görünür
    ├── ProductModal.tsx     → Ürün detayı (açıklama, kcal, gramaj, fiyat)
    ├── CartModal.tsx        → Sepet + masa numarası + sipariş gönderme
    ├── ProductFormModal.tsx → Admin: ürün ekle/düzenle
    └── ConfirmModal.tsx     → Admin: silme/sıfırlama onayı
```

**Mimari ilke:** Veri Redux'ta, görünüm bileşenlerde. Sepet fiyat tutmaz, hep menüden okur; yönetici fiyatı değiştirince sepet toplamı da otomatik doğru olur.

## "Kullanıcı siteyi değiştirebilsin" nasıl çalışıyor?

Yönetici panelindeki her işlem bir Redux **async thunk**'ı tetikler (`src/store/menuSlice.ts`) → bu, `src/store/api.ts` üzerinden backend'e bir HTTP isteği atar → backend SQLite'a yazar → başarılı yanıt Redux state'ini günceller. Sayfa yenilense (hatta başka bir cihazdan açılsa) bile değişiklikler kalır, çünkü artık kaynak veri backend'dedir.

Yazma istekleri (`POST`/`PUT`/`DELETE`) `X-Admin-Pin` header'ıyla korunur; PIN'i backend doğrular (`backend/auth.py`) — istemci JS koduna hiç gömülmez.

## Siteyi internete koyma (domain + QR)

1. Projeyi GitHub'a yükleyin.
2. **Frontend:** [vercel.com](https://vercel.com) hesabı açın, "New Project" deyip depoyu seçin, Deploy'a basın. Size `projeniz.vercel.app` gibi ücretsiz bir adres verir.
3. **Backend:** Vercel sadece statik siteleri barındırır; FastAPI servisi ayrı bir yerde çalışmalı — [Render](https://render.com) veya [Railway](https://railway.app) ücretsiz katmanları uygundur (`backend/README.md`'de talimat var).
4. Backend'i deploy ettikten sonra Vercel projesinin ortam değişkenlerine `VITE_API_URL=https://sizin-backend-adresiniz` ekleyin ve yeniden deploy edin; backend'in `.env`'indeki `CORS_ORIGINS`'e de Vercel adresinizi ekleyin.
5. QR kod: `npm run qr` ile (bkz. `scripts/generate-qr.js`) veya ücretsiz bir QR üreticisiyle site adresinizi kodlayın. Çıkan görseli yazdırıp masaya koyun.

## Sunumda anlatabileceğiniz teknik kararlar

- **Redux Toolkit** ham Redux'a göre çok daha az kod yazdırır (`createSlice`, `createAsyncThunk`, Immer).
- **FastAPI + SQLModel**: Pydantic tabanlı otomatik doğrulama, otomatik Swagger dokümantasyonu (`/docs`), tip güvenli veritabanı modelleri — az kodla üretime yakın bir backend.
- **TypeScript** sayesinde ürün modeline alan eklerseniz (ör. alerjen) derleyici eksik yerleri gösterir.
- **Bootstrap** form/grid için, kimlik veren tasarım ise `index.css`'teki CSS değişkenleriyle: her bölüm tek bir `--accent` değişkeninden renklenir.
- Fiyatın karta noktalı çizgiyle bağlanması bilinçli bir tasarım kararı: klasik basılı lokanta menüsü hissi + "fiyat için dokunma zorunluluğu yok" şartı.

# Nar Lokantası — Menü API (FastAPI)

Frontend'deki `menuSlice.ts`'in localStorage yerine gerçek bir sunucuya
yazması için hazırlanmış backend. Veriler artık tarayıcıda değil, bu
sunucunun yönettiği bir SQLite veritabanında (`menu.db`) tutulur —
yani bir cihazda yapılan değişiklik, aynı `/api/menu` adresine bakan
her cihazda görünür.

## Kurulum ve çalıştırma

```bash
cd backend
python -m venv .venv                 # sanal ortam (bir kez)

# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt      # gerekli kütüphaneler (bir kez)

cp .env.example .env                 # PIN ve CORS adreslerini buradan ayarlayın

uvicorn main:app --reload            # http://localhost:8000
```

İlk açılışta veritabanı boşsa `seed.py`'deki örnek menüyle (frontend'deki
`src/data/menuData.ts` ile birebir aynı) otomatik doldurulur.

Sunucu ayaktayken `http://localhost:8000/docs` adresinde tüm uçları
deneyebileceğiniz otomatik (Swagger) arayüz açılır.

## Klasör yapısı

```
backend/
├── main.py         → FastAPI uygulaması ve tüm uçlar (routes)
├── models.py        → Veritabanı tabloları (Restaurant, Category, Product)
├── schemas.py         → İstek gövdeleri (create/update şekilleri)
├── database.py          → SQLite bağlantısı
├── seed.py                → Örnek menü verisi + sıfırlama
├── auth.py                  → PIN kontrolü (X-Admin-Pin header'ı)
└── requirements.txt
```

## Uçlar (endpoints)

| Metod | Yol | Açıklama | PIN gerekir mi? |
|---|---|---|---|
| GET | `/api/menu` | Tüm menüyü döner (`{restaurant, categories, products}`) | Hayır |
| POST | `/api/admin/verify` | `{pin}` doğru mu kontrol eder | Hayır |
| PUT | `/api/restaurant` | Restoran adı/slogan/kapak fotoğrafı | Evet |
| POST | `/api/categories` | Yeni bölüm ekler | Evet |
| PUT | `/api/categories/{id}` | Bölümü günceller | Evet |
| DELETE | `/api/categories/{id}` | Bölümü ve içindeki ürünleri siler | Evet |
| POST | `/api/products` | Yeni ürün ekler | Evet |
| PUT | `/api/products/{id}` | Ürünü günceller | Evet |
| DELETE | `/api/products/{id}` | Ürünü siler | Evet |
| POST | `/api/menu/reset` | Tüm menüyü örnek veriyle değiştirir | Evet |

PIN gerektiren uçlara istek atarken `X-Admin-Pin: 1234` header'ını
eklemeniz gerekir (değer `.env`'deki `ADMIN_PIN` ile aynı olmalı).

## Bir sonraki adım: frontend'e bağlamak

Bu backend şu an bağımsız çalışıyor; `src/store/menuSlice.ts` henüz
localStorage kullanmaya devam ediyor. Bağlamak için `loadInitialState`
fonksiyonunu `fetch('/api/menu')`'a, `saveMenuState`'i ilgili
POST/PUT/DELETE çağrılarına çevirmek yeterli — veri şekli (camelCase
alan adları) zaten birebir eşleşiyor.

## Canlıya alma (deploy)

Vercel sadece statik/frontend barındırır; bu Python sunucusu ayrı bir
yerde çalışmalı — [Render](https://render.com) veya
[Railway](https://railway.app) ücretsiz katmanları uygundur
(`uvicorn main:app --host 0.0.0.0 --port $PORT` ile başlatılır).
Adresi aldıktan sonra `.env`'deki `CORS_ORIGINS`'e Vercel adresinizi
eklemeyi unutmayın.

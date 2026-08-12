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

PIN gerektiren uçlara istek atarken `X-Admin-Pin: <PIN>` header'ını
eklemeniz gerekir (değer `.env`'deki `ADMIN_PIN` ile aynı olmalı).
`ADMIN_PIN` **zorunludur** — tanımlı değilse sunucu açılışta hata verip
durur (kodun içinde bilerek yedek/varsayılan bir değer yok, GitHub
public olduğu için biri okuyup deneyebilir). Aynı IP'den 60 saniye
içinde 5'ten fazla yanlış PIN denenirse o IP 5 dakika engellenir
(`auth.py`'deki basit kaba kuvvet koruması).

Frontend (`src/store/api.ts` ve `menuSlice.ts`) bu backend'i zaten
kullanıyor — `VITE_API_URL` ortam değişkeniyle adresini bulur
(yerelde varsayılan `http://localhost:8000`).

## Canlıya alma (deploy) — Render

Vercel sadece statik/frontend barındırır; bu Python sunucusu ayrı bir
yerde çalışmalı. `render.yaml` [Render](https://render.com) için hazır
bir "Blueprint": hesabınızı GitHub'a bağladıktan sonra Render panelinde
**New + → Blueprint** deyip bu depoyu seçmeniz yeterli, geri kalanı
(`build`/`start` komutları, `rootDir: backend`) dosyadan otomatik okunur.
Tek elle gireceğiniz şey `ADMIN_PIN` ortam değişkeni (panelde "Secret"
olarak sorulur).

Deploy bitince Render size `https://nar-lokantasi-api.onrender.com`
gibi bir adres verir. Sonra:

1. Vercel projenizde *Settings → Environment Variables*'a
   `VITE_API_URL=<render adresiniz>` ekleyip yeniden deploy edin.
2. Render'daki `CORS_ORIGINS` değişkeninin Vercel adresinizi
   içerdiğinden emin olun (`render.yaml`'da zaten var, adresiniz
   değişirse güncelleyin).

⚠️ **Render ücretsiz katmanının sınırı:** Disk kalıcı değildir — servis
15 dakika işlemsiz kalıp "uyuyup" tekrar uyandığında `menu.db` sıfırlanabilir.
Bir staj demosu için sorun değildir (`/api/menu/reset` zaten var), ama
gerçek bir restoranda kalıcı depolama için Render'ın ücretli disk
eklentisi ya da yönetilen bir Postgres (Render/Supabase) gerekir.

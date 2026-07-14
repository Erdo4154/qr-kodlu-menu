# 🍽️ QR Menü — React + TypeScript + Redux + Bootstrap

Bir lokantanın QR kodla açılan dijital menüsü. Müşteri menüyü gezer, ürüne dokununca aynı sayfada açıklama/kalori/gramaj görür, fiyatlar her zaman görünürdür, sepete ekleyip masa numarasıyla sipariş gönderir. Restoran sahibi ise ⚙️ yönetici panelinden menüyü tamamen değiştirebilir.

## Kurulum ve çalıştırma

```bash
npm install     # bağımlılıkları kur (bir kez)
npm run dev     # geliştirme sunucusu: http://localhost:5173
npm run build   # yayın için dist/ klasörünü üretir
```

Yönetici paneli PIN'i: **1234** (`src/components/AdminPanel.tsx` içinde `ADMIN_PIN`).

## Klasör yapısı

```
src/
├── types.ts              → Tüm veri modelleri (Product, Category...)
├── data/menuData.ts      → İlk açılıştaki örnek menü
├── store/
│   ├── menuSlice.ts      → Menü verisi + düzenleme işlemleri (localStorage'a kaydeder)
│   ├── cartSlice.ts      → Sepet (ürün id + adet)
│   ├── store.ts          → Redux store kurulumu
│   └── hooks.ts          → Tipli useSelector/useDispatch
└── components/
    ├── Header.tsx        → Restoran adı, sepet ve yönetici düğmeleri
    ├── CategoryNav.tsx   → Yapışkan bölüm düğmeleri (tıklayınca kaydırır)
    ├── CategorySection.tsx → Bir bölüm; kendi accent rengini taşır
    ├── ProductCard.tsx   → Ürün satırı; fiyat noktalı çizgiyle HER ZAMAN görünür
    ├── ProductModal.tsx  → Aynı sayfada açılan detay (açıklama, kcal, gramaj, fiyat)
    ├── CartDrawer.tsx    → Sepet + masa numarası + sipariş gönderme
    └── AdminPanel.tsx    → Menüyü düzenleme (PIN korumalı)
```

**Mimari ilke:** Veri Redux'ta, görünüm bileşenlerde. Sepet fiyat tutmaz, hep menüden okur; yönetici fiyatı değiştirince sepet toplamı da otomatik doğru olur.

## "Kullanıcı siteyi değiştirebilsin" nasıl çalışıyor?

Yönetici panelindeki her işlem bir Redux action'ı gönderir → `menuSlice` state'i günceller → `store.subscribe` yeni menüyü `localStorage`'a yazar. Sayfa yenilense bile değişiklikler kalır.

⚠️ **Önemli sınır:** localStorage sadece **o tarayıcıda** kalıcıdır. Yani telefonunuzda yaptığınız değişikliği müşterinin telefonu görmez. Staj sunumunda bunu bilerek söylemeniz artı puan: "Demo'da localStorage kullandım; gerçek üründe bir sonraki adım olarak Firebase/Supabase gibi bir veritabanına bağlanır." İsterseniz ikinci aşama olarak `menuSlice`'taki `loadInitialState` ve `saveMenuState` fonksiyonlarını Supabase'e istek atacak şekilde değiştirmeniz yeterli — mimari buna hazır.

## Siteyi internete koyma (domain + QR)

1. Projeyi GitHub'a yükleyin.
2. [vercel.com](https://vercel.com) veya [netlify.com](https://netlify.com) hesabı açın (ücretsiz), "New Project" deyip GitHub deposunu seçin. Vite'ı otomatik tanır; Deploy'a basın. Size `projeniz.vercel.app` gibi ücretsiz bir adres verir — QR menü için bu bile yeterlidir.
3. Kendi domaininiz için: bir kayıt firmasından (ör. isimtescil, GoDaddy, Namecheap) domain alın, Vercel'de *Settings → Domains* bölümüne ekleyin ve gösterilen DNS kayıtlarını domain panelinize girin. `.com.tr` yıllık ~150-300 TL civarındadır; staj demosu için ücretsiz `.vercel.app` adresi de kabul görür.
4. QR kod: site adresinizi ücretsiz bir QR üreticisine yazın (ör. Google'da "QR code generator") ya da tarayıcıda Chrome'un adres çubuğundaki "Paylaş → QR kodu oluştur" özelliğini kullanın. Çıkan görseli yazdırıp masaya koyun — telefon kamerası okutunca menü açılır.

## Sunumda anlatabileceğiniz teknik kararlar

- **Redux Toolkit** ham Redux'a göre çok daha az kod yazdırır (`createSlice`, Immer).
- **TypeScript** sayesinde ürün modeline alan eklerseniz (ör. alerjen) derleyici eksik yerleri gösterir.
- **Bootstrap** form/grid için, kimlik veren tasarım ise `index.css`'teki CSS değişkenleriyle: her bölüm tek bir `--accent` değişkeninden renklenir.
- Fiyatın karta noktalı çizgiyle bağlanması bilinçli bir tasarım kararı: klasik basılı lokanta menüsü hissi + "fiyat için dokunma zorunluluğu yok" şartı.

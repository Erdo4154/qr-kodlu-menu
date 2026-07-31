// ---------------------------------------------------------------
// types.ts — Projedeki tüm veri modelleri tek yerde tanımlanır.
// Yeni bir alan eklemek isterseniz (ör. alerjen bilgisi) önce
// buraya ekleyin; TypeScript eksik kalan yerleri size gösterir.
// ---------------------------------------------------------------

/** Menüdeki tek bir yiyecek/içecek */
export interface Product {
  id: string;
  categoryId: string; // Hangi bölüme ait (Category.id)
  name: string;
  description: string; // Ürünün ne olduğu (detayda gösterilir)
  calories: number;    // kcal
  grams: number;       // gramaj (içeceklerde ml gibi düşünebilirsiniz)
  price: number;       // TL
  emoji: string;       // Fotoğraf yüklenemezse gösterilecek simge
  image?: string;      // Ürün fotoğrafının URL adresi (boş bırakılabilir)
}

/** Menü bölümü: İçecekler, Sıcak Yemekler, Tatlılar... */
export interface Category {
  id: string;
  name: string;
  tagline: string; // Bölümün altındaki kısa açıklama
  accent: string;  // Bölüme özgü renk (her bölümün kendine has tasarımı)
  emoji: string;
}

/** Restoranın genel bilgileri (yönetici panelinden değiştirilebilir) */
export interface RestaurantInfo {
  name: string;
  slogan: string;
  heroImage?: string; // Üst şeritteki arka plan fotoğrafı (URL)
}

/** Sepetteki bir satır: ürün + adet */
export interface CartItem {
  productId: string;
  quantity: number;
}

/** Backend'in GET /api/menu ile döndürdüğü tam menü durumu. */
export interface MenuState {
  restaurant: RestaurantInfo;
  categories: Category[];
  products: Product[];
}

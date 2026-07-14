// ---------------------------------------------------------------
// menuData.ts — Uygulama ilk açıldığında yüklenen örnek menü.
// Kullanıcı yönetici panelinden değişiklik yaptığında bu veri
// yerine tarayıcının localStorage'ındaki güncel hali kullanılır.
//
// FOTOĞRAFLAR: Wikimedia Commons'tan alınmıştır (özgür lisanslı ve
// dış sitelerden bağlanmaya izin verir). "Special:FilePath" adresi,
// dosya adını verdiğinizde fotoğrafın kendisine yönlendirir;
// ?width=640 parametresi menü için yeterli boyutta küçültür.
// Restoran sahibi yönetici panelinden kendi fotoğraf URL'lerini
// yapıştırarak bunları değiştirebilir.
// ---------------------------------------------------------------
import type { Category, Product, RestaurantInfo } from "../types";

/** Commons dosya adını doğrudan resim adresine çevirir. */
const wiki = (fileName: string, width = 640) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${width}`;

export const initialRestaurant: RestaurantInfo = {
  name: "Nar Lokantası",
  slogan: "Ev yemeği",
  heroImage: wiki("Esnaf lokantası (Dishes in bain marie).jpg", 1200),
};

export const initialCategories: Category[] = [
  { id: "corbalar", name: "Çorbalar", tagline: "Güne buradan başlayın", accent: "#2F5D50", emoji: "🍲" },
  { id: "sicak", name: "Sıcak Yemekler", tagline: "Günün kazan yemekleri", accent: "#9E2B25", emoji: "🍛" },
  { id: "icecekler", name: "İçecekler", tagline: "Soğuk ve sıcak", accent: "#1F4E79", emoji: "🥤" },
  { id: "tatlilar", name: "Tatlılar", tagline: "Şerbetli ve sütlü", accent: "#B07D2B", emoji: "🍮" },
];

export const initialProducts: Product[] = [
  // --- Çorbalar ---
  {
    id: "p1", categoryId: "corbalar", name: "Mercimek Çorbası", emoji: "",
    image: wiki("Mercimek çorbasi.jpg"),
    description: "Kırmızı mercimek, soğan ve havuçla pişirilir; üzerine tereyağlı pul biber gezdirilir.",
    calories: 180, grams: 300, price: 60
  },
  {
    id: "p2", categoryId: "corbalar", name: "Ezogelin Çorbası", emoji: "",
    image: wiki("Ezogelin soup.jpg"),
    description: "Mercimek, bulgur ve pirinçle hazırlanan baharatlı klasik.",
    calories: 210, grams: 300, price: 65
  },

  // --- Sıcak Yemekler ---
  {
    id: "p3", categoryId: "sicak", name: "Kuru Fasulye & Pilav", emoji: "",
    image: wiki("Kuru fasulye ve pilav.jpg"),
    description: "Tereyağlı kuru fasulye, yanında tane tane pirinç pilavı ile.",
    calories: 620, grams: 400, price: 145
  },
  {
    id: "p4", categoryId: "sicak", name: "İzmir Köfte", emoji: "",
    image: wiki("Izmir köfte.jpg"),
    description: "Fırında patates ve domates sosuyla pişen el yapımı köfte.",
    calories: 540, grams: 350, price: 175
  },
  {
    id: "p5", categoryId: "sicak", name: "Sebze Türlüsü", emoji: "",
    image: wiki("Türlü ve pilav.jpg"),
    description: "Mevsim sebzeleriyle pişen türlü, yanında pilav ile.",
    calories: 380, grams: 380, price: 130
  },

  // --- İçecekler ---
  {
    id: "p6", categoryId: "icecekler", name: "Ayran", emoji: "",
    image: wiki("Ayran in a big glass.jpg"),
    description: "Günlük yoğurttan, açık ayran.",
    calories: 90, grams: 300, price: 30
  },
  {
    id: "p7", categoryId: "icecekler", name: "Şalgam Suyu", emoji: "",
    image: wiki("Şalgam suyu in market.jpg"),
    description: "Adana usulü, acılı veya acısız seçilebilir.",
    calories: 25, grams: 300, price: 35
  },
  {
    id: "p8", categoryId: "icecekler", name: "Çay", emoji: "",
    image: wiki("Turkish tea.jpg"),
    description: "İnce belli bardakta, demli.",
    calories: 2, grams: 150, price: 15
  },

  // --- Tatlılar ---
  {
    id: "p9", categoryId: "tatlilar", name: "Fırın Sütlaçı", emoji: "",
    image: wiki("Firinda sütlaç.jpg"),
    description: "Taş fırında üzeri kızartılmış, fındık ile servis edilir.",
    calories: 320, grams: 220, price: 85
  },
  {
    id: "p10", categoryId: "tatlilar", name: "Cevizli Baklava", emoji: "",
    image: wiki("Baklava displayed on a white plate.jpg"),
    description: "El açması yufkayla, bol cevizli ve şerbetli.",
    calories: 420, grams: 180, price: 120
  },
];

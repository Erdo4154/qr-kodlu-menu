// ---------------------------------------------------------------
// menuSlice.ts — Menünün tamamı (restoran bilgisi, bölümler,
// ürünler) burada tutulur. Yönetici panelindeki her düğme
// aslında buradaki bir "reducer"ı çağırır.
//
// Redux Toolkit'in createSlice'ı sayesinde state'i doğrudan
// değiştiriyormuş gibi yazabiliyoruz (arkada Immer kütüphanesi
// güvenli kopyalar oluşturur).
// ---------------------------------------------------------------
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Category, Product, RestaurantInfo } from "../types";
import { initialCategories, initialProducts, initialRestaurant } from "../data/menuData";

export interface MenuState {
  restaurant: RestaurantInfo;
  categories: Category[];
  products: Product[];
}

// Anahtardaki sürüm numarası (v2) bilerek artırıldı: örnek menüye
// fotoğraf eklendi ve eski kayıtlı verinin yenisiyle değişmesi gerekti.
const STORAGE_KEY = "qr-menu-state-v2";

/** Sayfa açılırken localStorage'da kayıtlı menü varsa onu yükle. */
function loadInitialState(): MenuState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as MenuState;
  } catch {
    // Bozuk kayıt varsa görmezden gel, varsayılan menüyle başla.
  }
  return {
    restaurant: initialRestaurant,
    categories: initialCategories,
    products: initialProducts,
  };
}

/** Store her değiştiğinde çağrılır (store.ts içinde). */
export function saveMenuState(state: MenuState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const menuSlice = createSlice({
  name: "menu",
  initialState: loadInitialState(),
  reducers: {
    // --- Restoran bilgisi ---
    updateRestaurant(state, action: PayloadAction<RestaurantInfo>) {
      state.restaurant = action.payload;
    },

    // --- Ürün işlemleri ---
    addProduct(state, action: PayloadAction<Omit<Product, "id">>) {
      // Benzersiz id: zaman damgası yeterince güvenlidir bu ölçekte.
      state.products.push({ ...action.payload, id: `p${Date.now()}` });
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) state.products[index] = action.payload;
    },
    deleteProduct(state, action: PayloadAction<string>) {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },

    // --- Bölüm işlemleri ---
    addCategory(state, action: PayloadAction<Omit<Category, "id">>) {
      state.categories.push({ ...action.payload, id: `c${Date.now()}` });
    },
    updateCategory(state, action: PayloadAction<Category>) {
      const index = state.categories.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) state.categories[index] = action.payload;
    },
    deleteCategory(state, action: PayloadAction<string>) {
      state.categories = state.categories.filter((c) => c.id !== action.payload);
      // Bölüm silinince içindeki ürünler de kaldırılır.
      state.products = state.products.filter((p) => p.categoryId !== action.payload);
    },

    /** Tüm menüyü fabrika ayarlarına döndür. */
    resetMenu() {
      localStorage.removeItem(STORAGE_KEY);
      return {
        restaurant: initialRestaurant,
        categories: initialCategories,
        products: initialProducts,
      };
    },
  },
});

export const {
  updateRestaurant,
  addProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  updateCategory,
  deleteCategory,
  resetMenu,
} = menuSlice.actions;

export default menuSlice.reducer;

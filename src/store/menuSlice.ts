// ---------------------------------------------------------------
// menuSlice.ts — Menünün tamamı (restoran bilgisi, bölümler,
// ürünler) burada tutulur. Veri artık backend'den (FastAPI) gelir;
// yönetici panelindeki her düğme aslında burada bir async thunk
// tetikler, o da backend/'e bir HTTP isteği atar.
//
// Yazma işlemleri (add/update/delete/reset) admin PIN'ini backend'e
// X-Admin-Pin header'ı olarak iletir — PIN artık istemci kodunda
// (bundle'da) değil, sadece sunucuda bilinir.
// ---------------------------------------------------------------
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Category, MenuState, Product, RestaurantInfo } from "../types";
import { api } from "./api";

export interface MenuSliceState extends MenuState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: MenuSliceState = {
  restaurant: { name: "", slogan: "" },
  categories: [],
  products: [],
  status: "idle",
  error: null,
};

// --- Okuma ---
export const fetchMenu = createAsyncThunk("menu/fetch", () => api.getMenu());

// --- Restoran ---
export const updateRestaurant = createAsyncThunk(
  "menu/updateRestaurant",
  ({ pin, data }: { pin: string; data: RestaurantInfo }) => api.updateRestaurant(pin, data)
);

// --- Bölümler ---
export const addCategory = createAsyncThunk(
  "menu/addCategory",
  ({ pin, data }: { pin: string; data: Omit<Category, "id"> }) => api.createCategory(pin, data)
);

export const updateCategory = createAsyncThunk(
  "menu/updateCategory",
  ({ pin, category }: { pin: string; category: Category }) => {
    const { id, ...data } = category;
    return api.updateCategory(pin, id, data);
  }
);

export const deleteCategory = createAsyncThunk(
  "menu/deleteCategory",
  async ({ pin, id }: { pin: string; id: string }) => {
    await api.deleteCategory(pin, id);
    return id;
  }
);

// --- Ürünler ---
export const addProduct = createAsyncThunk(
  "menu/addProduct",
  ({ pin, data }: { pin: string; data: Omit<Product, "id"> }) => api.createProduct(pin, data)
);

export const updateProduct = createAsyncThunk(
  "menu/updateProduct",
  ({ pin, product }: { pin: string; product: Product }) => {
    const { id, ...data } = product;
    return api.updateProduct(pin, id, data);
  }
);

export const deleteProduct = createAsyncThunk(
  "menu/deleteProduct",
  async ({ pin, id }: { pin: string; id: string }) => {
    await api.deleteProduct(pin, id);
    return id;
  }
);

// --- Sıfırlama ---
export const resetMenu = createAsyncThunk("menu/reset", ({ pin }: { pin: string }) => api.resetMenu(pin));

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.restaurant = action.payload.restaurant;
        state.categories = action.payload.categories;
        state.products = action.payload.products;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Menü yüklenemedi.";
      })

      .addCase(updateRestaurant.fulfilled, (state, action) => {
        state.restaurant = action.payload;
      })

      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.categories[index] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c.id !== action.payload);
        state.products = state.products.filter((p) => p.categoryId !== action.payload);
      })

      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.products[index] = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
      })

      .addCase(resetMenu.fulfilled, (state, action) => {
        state.restaurant = action.payload.restaurant;
        state.categories = action.payload.categories;
        state.products = action.payload.products;
      });
  },
});

export default menuSlice.reducer;

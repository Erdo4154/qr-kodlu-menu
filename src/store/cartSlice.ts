// ---------------------------------------------------------------
// cartSlice.ts — Müşterinin sepeti. Sadece ürün id'si ve adet
// tutulur; fiyat/isim gibi bilgiler her zaman menuSlice'tan
// okunur. Böylece yönetici fiyatı değiştirirse sepet de doğru
// toplamı gösterir (tek doğruluk kaynağı ilkesi).
// ---------------------------------------------------------------
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "../types";

interface CartState {
  items: CartItem[];
}

const initialState: CartState = { items: [] };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /** Ürünü sepete ekle; zaten varsa adedini bir artır. */
    addToCart(state, action: PayloadAction<string>) {
      const existing = state.items.find((i) => i.productId === action.payload);
      if (existing) existing.quantity += 1;
      else state.items.push({ productId: action.payload, quantity: 1 });
    },
    /** Adedi bir azalt; sıfıra inerse satırı kaldır. */
    decreaseQuantity(state, action: PayloadAction<string>) {
      const existing = state.items.find((i) => i.productId === action.payload);
      if (!existing) return;
      existing.quantity -= 1;
      if (existing.quantity <= 0) {
        state.items = state.items.filter((i) => i.productId !== action.payload);
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, decreaseQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

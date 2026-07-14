// ---------------------------------------------------------------
// store.ts — Redux store'un kurulduğu yer. İki dilimimiz var:
//   menu -> menünün kendisi (kalıcı, localStorage'a yazılır)
//   cart -> müşterinin sepeti (geçici, sayfa yenilenince sıfırlanır)
// ---------------------------------------------------------------
import { configureStore } from "@reduxjs/toolkit";
import menuReducer, { saveMenuState } from "./menuSlice";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    cart: cartReducer,
  },
});

// Menü her değiştiğinde tarayıcıya kaydet.
// Not: localStorage sadece o cihazda kalıcıdır. Gerçek bir üründe
// bu satırın yerini bir backend'e (ör. Supabase/Firebase) yapılan
// kayıt isteği alır — README'de anlatıldı.
store.subscribe(() => {
  saveMenuState(store.getState().menu);
});

// Bileşenlerde tip güvenliği için yardımcı tipler:
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

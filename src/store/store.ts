// ---------------------------------------------------------------
// store.ts — Redux store'un kurulduğu yer. İki dilimimiz var:
//   menu -> menünün kendisi (backend'den gelir, App.tsx açılışta çeker)
//   cart -> müşterinin sepeti (geçici, sayfa yenilenince sıfırlanır)
// ---------------------------------------------------------------
import { configureStore } from "@reduxjs/toolkit";
import menuReducer from "./menuSlice";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    cart: cartReducer,
  },
});

// Bileşenlerde tip güvenliği için yardımcı tipler:
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

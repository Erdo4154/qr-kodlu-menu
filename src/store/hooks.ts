// ---------------------------------------------------------------
// hooks.ts — useSelector/useDispatch'in tipli sürümleri.
// Bileşenlerde bunları kullanın; otomatik tamamlama çalışır.
// ---------------------------------------------------------------
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

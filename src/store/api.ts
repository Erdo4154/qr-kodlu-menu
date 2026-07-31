// ---------------------------------------------------------------
// api.ts — backend/ (FastAPI) ile konuşan tek yer. Adres VITE_API_URL
// ile ayarlanır; verilmezse yerel geliştirme sunucusunu varsayar.
// ---------------------------------------------------------------
import type { Category, MenuState, Product, RestaurantInfo } from "../types";

export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `İstek başarısız (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const adminHeaders = (pin: string): HeadersInit => ({ "X-Admin-Pin": pin });

export const api = {
  getMenu: () => request<MenuState>("/api/menu"),

  verifyPin: (pin: string) =>
    request<{ valid: boolean }>("/api/admin/verify", {
      method: "POST",
      body: JSON.stringify({ pin }),
    }),

  updateRestaurant: (pin: string, data: RestaurantInfo) =>
    request<RestaurantInfo>("/api/restaurant", {
      method: "PUT",
      headers: adminHeaders(pin),
      body: JSON.stringify(data),
    }),

  createCategory: (pin: string, data: Omit<Category, "id">) =>
    request<Category>("/api/categories", {
      method: "POST",
      headers: adminHeaders(pin),
      body: JSON.stringify(data),
    }),

  updateCategory: (pin: string, id: string, data: Omit<Category, "id">) =>
    request<Category>(`/api/categories/${id}`, {
      method: "PUT",
      headers: adminHeaders(pin),
      body: JSON.stringify(data),
    }),

  deleteCategory: (pin: string, id: string) =>
    request<void>(`/api/categories/${id}`, {
      method: "DELETE",
      headers: adminHeaders(pin),
    }),

  createProduct: (pin: string, data: Omit<Product, "id">) =>
    request<Product>("/api/products", {
      method: "POST",
      headers: adminHeaders(pin),
      body: JSON.stringify(data),
    }),

  updateProduct: (pin: string, id: string, data: Omit<Product, "id">) =>
    request<Product>(`/api/products/${id}`, {
      method: "PUT",
      headers: adminHeaders(pin),
      body: JSON.stringify(data),
    }),

  deleteProduct: (pin: string, id: string) =>
    request<void>(`/api/products/${id}`, {
      method: "DELETE",
      headers: adminHeaders(pin),
    }),

  resetMenu: (pin: string) =>
    request<MenuState>("/api/menu/reset", {
      method: "POST",
      headers: adminHeaders(pin),
    }),
};

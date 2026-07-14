import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite yapılandırması: React eklentisi yeterli.
export default defineConfig({
  plugins: [react()],
});

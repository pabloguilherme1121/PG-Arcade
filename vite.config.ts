import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
export default defineConfig(() => ({
  plugins: [react(), tailwind()],
  base: process.env.GITHUB_ACTIONS ? "/PG-Arcade/" : "/",
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
}));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // 👈 necessary if deploying to root domain like nomadgym.in
  build: {
    outDir: "dist",
    sourcemap: false, // 👈 smaller and more secure build
  },
});






import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
//del tailwind
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  resolve: {
  },
  optimizeDeps: {
    exclude: ["bcrypt"],
  },
});

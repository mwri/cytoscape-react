import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 800,
    outDir: "generated",
  },
  plugins: [react()],
  root: "demos/modern",
  server: {
    host: "127.0.0.1",
    port: 5174,
  },
});

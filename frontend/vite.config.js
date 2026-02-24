import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    build: {
          outDir: "dist",
          target: "esnext",
    },
    esbuild: {
          charset: "utf8",
    },
    server: {
          port: 5173,
    },
});

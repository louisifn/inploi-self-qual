import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  resolve: {
    alias: {
      // App-internal alias only. Workspace packages (@inploi/*) resolve via pnpm + exports.
      "@": path.resolve(__dirname, "./web"),
    },
  },
});

import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
const rawPort = process.env.PORT || "5173";
const port = Number(rawPort);
if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}
export default defineConfig({
  root: path.resolve(import.meta.dirname),
  // Production site is hosted at the domain root.
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(
        import.meta.dirname,
        "..",
        "..",
        "attached_assets",
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: path.resolve(
      import.meta.dirname,
      "dist/public",
    ),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port,
    strictPort: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    host: "0.0.0.0",
    port,
    strictPort: true,
  },
});

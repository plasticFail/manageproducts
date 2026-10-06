import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { writeFileSync, mkdirSync } from "node:fs";

// Single classic-script bundle for publishing as a claude.ai Artifact: dist-artifact/{index.html, app.js}.
// `npm run build:artifact`, then publish dist-artifact/index.html with files { "app.js": "dist-artifact/app.js" }.
export default defineConfig({
  plugins: [
    react(),
    {
      name: "artifact-index",
      closeBundle() {
        mkdirSync("dist-artifact", { recursive: true });
        writeFileSync("dist-artifact/index.html", `<title>Manage Products V2.2</title>\n<div id="root"></div>\n<script src="app.js"></script>\n`);
      },
    },
  ],
  define: { "process.env.NODE_ENV": '"production"' },
  build: {
    outDir: "dist-artifact",
    emptyOutDir: true,
    lib: { entry: "src/main.jsx", formats: ["iife"], name: "ManageProducts", fileName: () => "app.js" },
    chunkSizeWarningLimit: 4000,
  },
});

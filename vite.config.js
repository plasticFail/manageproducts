import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" so the built index.html works from any path (file://, artifact host, static hosting).
export default defineConfig({ base: "./", plugins: [react()] });

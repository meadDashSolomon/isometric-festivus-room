import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  root: "src/",
  publicDir: "../public",
  base: "./",
  plugins: [glsl()],
  build: {
    outDir: "../dist",
  },
});

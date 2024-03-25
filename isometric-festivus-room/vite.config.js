import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

export default {
  publicDir: "./public/",
  build: {
    outDir: "./dist",
  },
  plugins: [glsl()],
};

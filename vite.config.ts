import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content.ts"),
        popup: resolve(__dirname, "src/popup.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        format: "es",
        inlineDynamicImports: false,
      },
    },
    target: "chrome91", // Chrome拡張機能向けのターゲット
    minify: "esbuild",
  },
  publicDir: "public",
  define: {
    // 本番ビルド時はMODEをproductionに設定
    "import.meta.env.MODE": JSON.stringify(
      process.env.NODE_ENV === "production" ? "production" : "development"
    ),
  },
});


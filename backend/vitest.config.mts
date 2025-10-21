import { defineConfig } from "vitest/config";
import path from "path";

const config = defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: [path.resolve(__dirname, "config.ts"), "./tests/support/setup.ts"],
    isolate: true,
  },
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "./src"),
    },
  },
});

export default config;

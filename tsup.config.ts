import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  external: ["cytoscape", "cytoscape-dom-node", "react", "react-dom"],
  format: ["cjs", "esm"],
  outExtension: ({ format }) => ({
    js: format === "cjs" ? ".cjs" : ".mjs",
  }),
  sourcemap: true,
  target: "es2020",
});

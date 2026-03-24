import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    next:  "src/next/index.tsx",
  },
  format:          ["esm", "cjs"],
  dts:             true,
  splitting:       false,
  sourcemap:       true,
  clean:           true,
  external:        ["react", "react-dom", "next"],
  treeshake:       true,
  target:          "es2020",
})
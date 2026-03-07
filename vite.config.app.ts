import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import dts from "unplugin-dts/vite"
import analyzer from "vite-bundle-analyzer"
import devtoolsJson from "vite-plugin-devtools-json"
import { externalizeDeps } from "vite-plugin-externalize-deps"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

// eslint-disable-next-line @typescript-eslint/naming-convention -- Standard Node naming
const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: "/codemirror-markdown-tables",
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "CodemirrorMarkdownTables",
      fileName: "codemirror-markdown-tables",
    },
  },
  plugins: [
    svelte(),
    tsconfigPaths(),
    devtoolsJson(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
      bundleTypes: true,
      compilerOptions: {
        declarationMap: true,
      },
    }),
    analyzer({ enabled: false }),
    externalizeDeps(),
  ],
  test: {
    setupFiles: ["./testSupport/testSetup.ts"],
    coverage: {
      include: ["src/**/*"],
      exclude: [],
    },
  },
})

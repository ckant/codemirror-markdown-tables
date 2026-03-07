import { svelte } from "@sveltejs/vite-plugin-svelte"
import analyzer from "vite-bundle-analyzer"
import devtoolsJson from "vite-plugin-devtools-json"
import { viteSingleFile } from "vite-plugin-singlefile"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  base: "/codemirror-markdown-tables",
  build: {
    outDir: "demo",
  },
  plugins: [
    svelte(),
    tsconfigPaths(),
    devtoolsJson(),
    analyzer({ enabled: false }),
    viteSingleFile({ removeViteModuleLoader: true }),
  ],
})

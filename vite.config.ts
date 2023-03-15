/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    deps: {
      external: ['tree-sitter', 'tree-sitter-cpp']
    }
  },
})
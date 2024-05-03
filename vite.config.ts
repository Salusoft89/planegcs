/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    // fixes the tree-sitter import error
    poolOptions: {
      threads: {
        singleThread: true,
      }
    }
  },
})
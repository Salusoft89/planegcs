/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    // fixes the tree-sitter import error
    threads: false
  },
})
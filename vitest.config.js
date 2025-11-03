import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        '**/*.test.js',
        'knowledge-vault/.obsidian/'
      ]
    },
    include: [
      'tests/**/*.test.js',
      'src/**/*.test.js'
    ],
    // Obsidian/YAML関連のファイルパスを設定
    alias: {
      '@': './src',
      '@yaml': './knowledge-vault/_metrics',
      '@css': './knowledge-vault/_css'
    }
  }
}) 
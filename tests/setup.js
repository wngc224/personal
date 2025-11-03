import '@testing-library/jest-dom'

// DOM環境のモック設定
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// CSS Custom Properties のモック
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop) => {
      const cssVars = {
        '--color-primary': '#1976D2',
        '--color-success': '#2E7D32',
        '--color-warning': '#F57C00',
        '--color-error': '#D32F2F',
        '--font-family': 'Inter, system-ui, sans-serif'
      }
      return cssVars[prop] || ''
    }
  })
})

// Obsidian app API のモック
global.app = {
  loadYaml: vi.fn(),
  injectCss: vi.fn(),
  commands: {
    executeCommandById: vi.fn()
  }
}

// DataviewJS API のモック
global.dv = {
  io: {
    load: vi.fn()
  },
  date: vi.fn(() => ({
    toFormat: vi.fn(() => '2025-06-21 14:30')
  })),
  paragraph: vi.fn(),
  header: vi.fn()
}

// File system モック（テスト用）
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

global.loadTestYaml = (filename) => {
  const path = join(__dirname, '..', 'knowledge-vault', '_metrics', filename)
  return readFileSync(path, 'utf8')
}

// カスタムVitest matcher追加
expect.extend({
  toBeOneOf(received, validOptions) {
    const pass = validOptions.includes(received)
    return {
      message: () => `expected ${received} to be one of ${validOptions.join(', ')}`,
      pass
    }
  }
}) 
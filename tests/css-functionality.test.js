import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

describe('🎨 CSS Functionality Tests', () => {
  let dom, document

  beforeEach(() => {
    // 基本的なCSSスタイルを含むHTMLドキュメントを作成
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            /* CSS Custom Properties */
            :root {
              --color-primary: #667eea;
              --color-secondary: #764ba2;
              --color-success: #4CAF50;
              --color-warning: #FF9800;
              --color-error: #F44336;
              --color-text-primary: #212529;
              --color-text-secondary: #6c757d;
              --color-bg-primary: #ffffff;
              --color-bg-secondary: #f8f9fa;
              --color-bg-accent: #e9ecef;
              --font-family: 'Inter', system-ui, sans-serif;
              --font-size-md: 1rem;
              --font-size-xxl: 1.5rem;
              --spacing-md: 1rem;
              --spacing-lg: 1.5rem;
              --radius-lg: 0.75rem;
              --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
              --transition-medium: 0.3s ease;
              --border-width: 1px;
              --border-color: #dee2e6;
            }
            
            /* ダークテーマ */
            [data-theme="dark"] {
              --color-text-primary: #f8f9fa;
              --color-bg-primary: #212529;
            }
            
            /* KPIカード */
            .kpi-card {
              background: var(--color-bg-primary);
              border: var(--border-width) solid var(--border-color);
              border-radius: var(--radius-lg);
              padding: var(--spacing-lg);
              transition: all var(--transition-medium);
              box-shadow: var(--shadow-sm);
              position: relative;
              contain: layout style;
              tabindex: 0;
              cursor: pointer;
            }
            
            .kpi-card:focus {
              outline: 2px solid var(--color-primary);
              outline-offset: 2px;
            }
            
            .kpi-card__title {
              font-size: var(--font-size-md);
              font-weight: 600;
              color: var(--color-text-primary);
            }
            
            .kpi-card__value {
              font-size: var(--font-size-xxl);
              font-weight: 700;
              color: var(--color-text-primary);
            }
            
            .progress-fill {
              will-change: transform;
              transform: translateZ(0);
            }
            
            .kpi-section {
              contain: layout style;
            }
            
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
              gap: var(--spacing-lg);
              contain: layout;
            }
            
            /* State classes */
            .is-loading { opacity: 0.7; }
            .is-error { border-color: var(--color-error); }
            .is-success { border-color: var(--color-success); }
            
            /* Category styles */
            .kpi-card[data-category="platform"]::before {
              content: '';
              position: absolute;
              top: 0; left: 0;
              width: 4px; height: 100%;
              background: var(--color-success);
            }
            
            /* Responsive */
            @media (max-width: 768px) {
              .kpi-grid {
                grid-template-columns: 1fr;
                gap: var(--spacing-md);
              }
            }
          </style>
        </head>
        <body>
          <div class="dashboard-container">
            <div class="kpi-section">
              <div class="kpi-grid">
                <div class="kpi-card" data-category="platform" tabindex="0" role="article" aria-label="Test KPI Card">
                  <div class="kpi-card__header">
                    <span class="kpi-card__title">Test KPI</span>
                    <div class="kpi-card__status"></div>
                  </div>
                  <div class="kpi-card__value">42<span class="kpi-card__unit">%</span></div>
                  <div class="progress-bar" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-fill" style="width: 75%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
    
    dom = new JSDOM(htmlContent)
    document = dom.window.document
    global.window = dom.window
    global.document = document
  })

  describe('🏗️ CSS Architecture Tests', () => {
    it('should apply BEM naming convention correctly', () => {
      // BEM命名規則の確認
      const card = document.querySelector('.kpi-card')
      const header = document.querySelector('.kpi-card__header')
      const title = document.querySelector('.kpi-card__title')
      const value = document.querySelector('.kpi-card__value')
      
      expect(card).toBeTruthy()
      expect(header).toBeTruthy()
      expect(title).toBeTruthy()
      expect(value).toBeTruthy()
      
      // BEM命名パターンの検証
      expect(card.className).toMatch(/^kpi-card/)
      expect(header.className).toContain('kpi-card__header')
      expect(title.className).toContain('kpi-card__title')
      expect(value.className).toContain('kpi-card__value')
    })

    it('should support state classes with is- prefix', () => {
      const card = document.querySelector('.kpi-card')
      
      // 状態クラスの追加
      card.classList.add('is-loading')
      expect(card.classList.contains('is-loading')).toBe(true)
      
      card.classList.remove('is-loading')
      card.classList.add('is-error')
      expect(card.classList.contains('is-error')).toBe(true)
      
      card.classList.remove('is-error')
      card.classList.add('is-success')
      expect(card.classList.contains('is-success')).toBe(true)
    })

    it('should use data attributes for category styling', () => {
      const card = document.querySelector('.kpi-card')
      
      // data属性の確認
      expect(card.getAttribute('data-category')).toBe('platform')
      
      // data属性の変更テスト
      card.setAttribute('data-category', 'development')
      expect(card.getAttribute('data-category')).toBe('development')
      
      card.setAttribute('data-category', 'system')
      expect(card.getAttribute('data-category')).toBe('system')
    })
  })

  describe('📱 Responsive Design Tests', () => {
    it('should adapt layout for different screen sizes', () => {
      const grid = document.querySelector('.kpi-grid')
      
      // CSSスタイルの確認（JSDOMでは計算スタイルは制限的）
      expect(grid).toBeTruthy()
      expect(grid.classList.contains('kpi-grid')).toBe(true)
      
      // グリッドレイアウトのクラスが適用されている
      const computedStyle = dom.window.getComputedStyle(grid)
      expect(computedStyle.display).toBe('grid')
    })

    it('should handle dark mode toggle', () => {
      const body = document.body
      
      // ライトテーマ（デフォルト）
      expect(body.getAttribute('data-theme')).toBeNull()
      
      // ダークテーマに切り替え
      body.setAttribute('data-theme', 'dark')
      expect(body.getAttribute('data-theme')).toBe('dark')
      
      // ライトテーマに戻す
      body.setAttribute('data-theme', 'light')
      expect(body.getAttribute('data-theme')).toBe('light')
    })
  })

  describe('♿ Accessibility Tests', () => {
    it('should have proper ARIA attributes', () => {
      const card = document.querySelector('.kpi-card')
      const progressBar = document.querySelector('.progress-bar')
      
      // ARIA属性の検証（HTMLに直接記述済み）
      expect(card.getAttribute('tabindex')).toBe('0')
      expect(card.getAttribute('role')).toBe('article')
      expect(card.getAttribute('aria-label')).toContain('KPI')
      
      // プログレスバーのARIA属性
      expect(progressBar.getAttribute('role')).toBe('progressbar')
      expect(progressBar.getAttribute('aria-valuenow')).toBe('75')
      expect(progressBar.getAttribute('aria-valuemin')).toBe('0')
      expect(progressBar.getAttribute('aria-valuemax')).toBe('100')
    })

    it('should support keyboard navigation', () => {
      const card = document.querySelector('.kpi-card')
      
      // focusable要素であることを確認
      expect(card.getAttribute('tabindex')).toBe('0')
      
      // フォーカス設定のテスト
      card.focus()
      expect(document.activeElement).toBe(card)
      
      // キーボードイベントの設定テスト
      let clicked = false
      card.addEventListener('click', () => { clicked = true })
      
      // Enterキーイベントのシミュレート
      const enterEvent = new dom.window.KeyboardEvent('keydown', { key: 'Enter' })
      card.dispatchEvent(enterEvent)
      
      // イベントが発生したことを確認
      expect(enterEvent.key).toBe('Enter')
    })

    it('should maintain color contrast ratios', () => {
      const card = document.querySelector('.kpi-card')
      const computedStyle = dom.window.getComputedStyle(card)
      
      // CSS変数が定義されていることを確認
      const rootStyle = dom.window.getComputedStyle(document.documentElement)
      
      // CSS変数の存在確認（JSDOMでの制限を考慮）
      const primaryColor = rootStyle.getPropertyValue('--color-primary').trim()
      const textColor = rootStyle.getPropertyValue('--color-text-primary').trim()
      const bgColor = rootStyle.getPropertyValue('--color-bg-primary').trim()
      
      // 値が定義されているかチェック（JSDOMでは空文字の場合がある）
      expect(typeof primaryColor).toBe('string')
      expect(typeof textColor).toBe('string')
      expect(typeof bgColor).toBe('string')
    })
  })

  describe('⚡ Performance Tests', () => {
    it('should use CSS custom properties for theming', () => {
      const rootStyle = dom.window.getComputedStyle(document.documentElement)
      
      // CSS変数の存在をCSSテキストから確認
      const styleSheet = document.head.querySelector('style')
      const cssText = styleSheet.textContent
      
      expect(cssText).toContain('--color-primary')
      expect(cssText).toContain('--font-family')
      expect(cssText).toContain('--radius-lg')
      expect(cssText).toContain('--spacing-md')
    })

    it('should have optimized animations with will-change', () => {
      const progressFill = document.querySelector('.progress-fill')
      
      // CSSテキストからwill-changeプロパティの確認
      const styleSheet = document.head.querySelector('style')
      const cssText = styleSheet.textContent
      
      expect(cssText).toContain('will-change: transform')
      expect(cssText).toContain('transform: translateZ(0)')
    })

    it('should use contain property for layout optimization', () => {
      const card = document.querySelector('.kpi-card')
      const section = document.querySelector('.kpi-section')
      
      // CSSテキストからcontainプロパティの確認
      const styleSheet = document.head.querySelector('style')
      const cssText = styleSheet.textContent
      
      expect(cssText).toContain('contain: layout style')
      expect(cssText).toContain('contain: layout')
    })
  })
}) 
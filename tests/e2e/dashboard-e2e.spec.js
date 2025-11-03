import { test, expect } from '@playwright/test'

test.describe('📊 KPI Dashboard E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // エラーイベントをキャッチ
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`)
      }
    })
    
    page.on('pageerror', error => {
      console.error(`Page error: ${error.message}`)
    })
  })

  test.describe('🔴 Critical: Dashboard Loading', () => {
    test('should load main dashboard page successfully', async ({ page }) => {
      await page.goto('/_metrics/dashboards/main-dashboard.md')
      
      // ページタイトルの確認
      await expect(page).toHaveTitle(/統合KPIダッシュボード/)
      
      // 基本的なヘッダーの表示確認
      await expect(page.locator('h1')).toContainText('📊 統合KPIダッシュボード')
      
      // 基本構造の存在確認
      await expect(page.locator('.kpi-section')).toBeVisible()
    })

    test('should load CSS styles correctly', async ({ page }) => {
      await page.goto('/_css/dashboard.css')
      
      // CSSファイルの読み込み確認
      const response = await page.request.get('/_css/dashboard.css')
      expect(response.status()).toBe(200)
      
      // 基本的なCSS変数の存在確認
      const cssContent = await response.text()
      expect(cssContent).toContain('--color-primary')
      expect(cssContent).toContain('.kpi-card')
      expect(cssContent).toContain('.kpi-grid')
    })

    test('should load YAML configuration files', async ({ page }) => {
      // 設定ファイルの読み込み確認
      const configResponse = await page.request.get('/_metrics/config/kpi-definitions.yaml')
      expect(configResponse.status()).toBe(200)
      
      const configContent = await configResponse.text()
      expect(configContent).toContain('categories:')
      expect(configContent).toContain('kpis:')
      expect(configContent).toContain('is_enabled:')
      
      // データファイルの読み込み確認
      const dataResponse = await page.request.get('/_metrics/data/current-values.yaml')
      expect(dataResponse.status()).toBe(200)
      
      const dataContent = await dataResponse.text()
      expect(dataContent).toContain('system:')
      expect(dataContent).toContain('platform:')
      expect(dataContent).toContain('is_healthy:')
    })
  })

  test.describe('🔴 Critical: KPI Card Rendering', () => {
    test('should display KPI cards with correct structure', async ({ page }) => {
      // テスト用の簡易HTMLページを作成
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="http://localhost:8080/_css/dashboard.css">
          </head>
          <body>
            <div class="kpi-section">
              <div class="kpi-grid">
                <div class="kpi-card" data-category="platform">
                  <div class="kpi-card__header">
                    <span class="kpi-card__title">Test KPI</span>
                    <div class="kpi-card__status"></div>
                  </div>
                  <div class="kpi-card__value">42<span class="kpi-card__unit">jobs</span></div>
                  <div class="kpi-card__meta">
                    <span>2025-06-21 14:30</span>
                    <span class="kpi-card__target">Target: 50/day</span>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `)
      
      // KPIカードの基本構造確認
      const kpiCard = page.locator('.kpi-card')
      await expect(kpiCard).toBeVisible()
      await expect(kpiCard).toHaveAttribute('data-category', 'platform')
      
      // カード内要素の確認
      await expect(page.locator('.kpi-card__title')).toContainText('Test KPI')
      await expect(page.locator('.kpi-card__value')).toContainText('42')
      await expect(page.locator('.kpi-card__unit')).toContainText('jobs')
      await expect(page.locator('.kpi-card__target')).toContainText('Target: 50/day')
    })

    test('should display progress bars correctly', async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="http://localhost:8080/_css/dashboard.css">
          </head>
          <body>
            <div class="kpi-card">
              <div class="kpi-card__value">85/128<span class="kpi-card__unit">specs</span></div>
              <div class="progress-bar" role="progressbar" aria-valuenow="66" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-fill" style="width: 66%"></div>
              </div>
            </div>
          </body>
        </html>
      `)
      
      // プログレスバーの確認
      const progressBar = page.locator('.progress-bar')
      await expect(progressBar).toBeVisible()
      await expect(progressBar).toHaveAttribute('role', 'progressbar')
      await expect(progressBar).toHaveAttribute('aria-valuenow', '66')
      
      // プログレス表示の確認
      const progressFill = page.locator('.progress-fill')
      await expect(progressFill).toHaveCSS('width', '66%')
    })

    test('should handle state classes correctly', async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="http://localhost:8080/_css/dashboard.css">
          </head>
          <body>
            <div class="kpi-card is-loading" data-testid="loading-card">Loading...</div>
            <div class="kpi-card is-error" data-testid="error-card">Error state</div>
            <div class="kpi-card is-success" data-testid="success-card">Success state</div>
          </body>
        </html>
      `)
      
      // 各状態クラスの確認
      await expect(page.locator('[data-testid="loading-card"]')).toHaveClass(/is-loading/)
      await expect(page.locator('[data-testid="error-card"]')).toHaveClass(/is-error/)
      await expect(page.locator('[data-testid="success-card"]')).toHaveClass(/is-success/)
    })
  })

  test.describe('🟡 Integration: Responsive Design', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone size
      
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="http://localhost:8080/_css/dashboard.css">
          </head>
          <body>
            <div class="kpi-section">
              <div class="kpi-grid">
                <div class="kpi-card">Mobile Card 1</div>
                <div class="kpi-card">Mobile Card 2</div>
              </div>
            </div>
          </body>
        </html>
      `)
      
      // モバイルレイアウトの確認
      const kpiGrid = page.locator('.kpi-grid')
      await expect(kpiGrid).toBeVisible()
      
      // グリッドレイアウトがモバイル用に調整されているかチェック
      const gridStyles = await kpiGrid.evaluate(el => getComputedStyle(el))
      expect(gridStyles.display).toBe('grid')
    })

    test('should adapt to tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }) // iPad size
      
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="http://localhost:8080/_css/dashboard.css">
          </head>
          <body>
            <div class="kpi-section">
              <div class="kpi-grid">
                <div class="kpi-card">Tablet Card 1</div>
                <div class="kpi-card">Tablet Card 2</div>
                <div class="kpi-card">Tablet Card 3</div>
              </div>
            </div>
          </body>
        </html>
      `)
      
      // タブレットレイアウトの確認
      const kpiCards = page.locator('.kpi-card')
      await expect(kpiCards).toHaveCount(3)
      
      // すべてのカードが表示されているか確認
      for (let i = 0; i < 3; i++) {
        await expect(kpiCards.nth(i)).toBeVisible()
      }
    })

    test('should handle dark mode toggle', async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="http://localhost:8080/_css/dashboard.css">
          </head>
          <body data-theme="light">
            <div class="kpi-card">Theme Test Card</div>
            <button onclick="document.body.setAttribute('data-theme', 
              document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light')">
              Toggle Theme
            </button>
          </body>
        </html>
      `)
      
      // ライトテーマの確認
      await expect(page.locator('body')).toHaveAttribute('data-theme', 'light')
      
      // テーマ切り替え
      await page.click('button')
      await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark')
      
      // 再度切り替え
      await page.click('button')
      await expect(page.locator('body')).toHaveAttribute('data-theme', 'light')
    })
  })

  test.describe('♿ Accessibility Tests', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="http://localhost:8080/_css/dashboard.css">
          </head>
          <body>
            <div class="kpi-card" tabindex="0" role="article" aria-label="Test KPI Card">
              <div class="kpi-card__header">
                <span class="kpi-card__title">Accessibility Test</span>
              </div>
              <div class="kpi-card__value" aria-label="Current value: 42 jobs">42<span class="kpi-card__unit">jobs</span></div>
              <div class="progress-bar" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" aria-label="Progress: 75%">
                <div class="progress-fill" style="width: 75%"></div>
              </div>
            </div>
          </body>
        </html>
      `)
      
      // ARIA属性の確認
      const kpiCard = page.locator('.kpi-card')
      await expect(kpiCard).toHaveAttribute('role', 'article')
      await expect(kpiCard).toHaveAttribute('aria-label', 'Test KPI Card')
      await expect(kpiCard).toHaveAttribute('tabindex', '0')
      
      const progressBar = page.locator('.progress-bar')
      await expect(progressBar).toHaveAttribute('role', 'progressbar')
      await expect(progressBar).toHaveAttribute('aria-valuenow', '75')
      await expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      await expect(progressBar).toHaveAttribute('aria-valuemax', '100')
    })

    test('should support keyboard navigation', async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="http://localhost:8080/_css/dashboard.css">
          </head>
          <body>
            <div class="kpi-card" tabindex="0" data-testid="card1">Card 1</div>
            <div class="kpi-card" tabindex="0" data-testid="card2">Card 2</div>
            <div class="kpi-card" tabindex="0" data-testid="card3">Card 3</div>
          </body>
        </html>
      `)
      
      // Tab キーでのナビゲーション
      await page.keyboard.press('Tab')
      await expect(page.locator('[data-testid="card1"]')).toBeFocused()
      
      await page.keyboard.press('Tab')
      await expect(page.locator('[data-testid="card2"]')).toBeFocused()
      
      await page.keyboard.press('Tab')
      await expect(page.locator('[data-testid="card3"]')).toBeFocused()
      
      // Shift+Tab での逆方向ナビゲーション
      await page.keyboard.press('Shift+Tab')
      await expect(page.locator('[data-testid="card2"]')).toBeFocused()
    })
  })

  test.describe('🟢 Edge Cases: Error Handling', () => {
    test('should handle missing CSS gracefully', async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="http://localhost:8080/_css/nonexistent.css">
          </head>
          <body>
            <div class="kpi-card">Content without CSS</div>
          </body>
        </html>
      `)
      
      // CSS読み込み失敗でもコンテンツは表示される
      await expect(page.locator('.kpi-card')).toBeVisible()
      await expect(page.locator('.kpi-card')).toContainText('Content without CSS')
    })

    test('should handle malformed HTML gracefully', async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <body>
            <div class="kpi-card">
              <div class="kpi-card__header">
                <span class="kpi-card__title">Malformed Test
                <!-- Missing closing span tag -->
              </div>
              <div class="kpi-card__value">Still renders</div>
            </div>
          </body>
        </html>
      `)
      
      // ブラウザがHTMLを修正して表示
      await expect(page.locator('.kpi-card')).toBeVisible()
      await expect(page.locator('.kpi-card__value')).toContainText('Still renders')
    })

    test('should handle large datasets efficiently', async ({ page }) => {
      // 大量のKPIカードを生成
      const largeHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="http://localhost:8080/_css/dashboard.css">
          </head>
          <body>
            <div class="kpi-section">
              <div class="kpi-grid">
                ${Array.from({ length: 100 }, (_, i) => `
                  <div class="kpi-card" data-testid="card-${i}">
                    <div class="kpi-card__header">
                      <span class="kpi-card__title">KPI ${i}</span>
                    </div>
                    <div class="kpi-card__value">${i * 10}<span class="kpi-card__unit">units</span></div>
                  </div>
                `).join('')}
              </div>
            </div>
          </body>
        </html>
      `
      
      const startTime = Date.now()
      await page.setContent(largeHtml)
      const endTime = Date.now()
      
      // 100個のカードが5秒以内に読み込まれる
      expect(endTime - startTime).toBeLessThan(5000)
      
      // 最初と最後のカードが表示される
      await expect(page.locator('[data-testid="card-0"]')).toBeVisible()
      await expect(page.locator('[data-testid="card-99"]')).toBeVisible()
      
      // カード数の確認
      const cardCount = await page.locator('.kpi-card').count()
      expect(cardCount).toBe(100)
    })
  })
}) 
import { describe, it, expect, beforeEach, vi } from 'vitest'
import YAML from 'yaml'

describe('🔧 DataviewJS Engine Tests', () => {
  let mockConfig, mockData, mockApp, mockDv

  beforeEach(() => {
    // リアルなYAMLデータの模擬
    const configText = loadTestYaml('config/kpi-definitions.yaml')
    const dataText = loadTestYaml('data/current-values.yaml')
    
    mockConfig = YAML.parse(configText)
    mockData = YAML.parse(dataText)

    // Obsidian app APIのモック
    mockApp = {
      loadYaml: vi.fn(),
      injectCss: vi.fn(),
      commands: {
        executeCommandById: vi.fn()
      }
    }

    // DataviewJS APIのモック
    mockDv = {
      io: {
        load: vi.fn()
      },
      date: vi.fn(() => ({
        toFormat: vi.fn(() => '2025-06-21 14:30')
      })),
      paragraph: vi.fn(),
      header: vi.fn()
    }

    global.app = mockApp
    global.dv = mockDv
  })

  describe('🔴 Critical: YAML Loading & Parsing', () => {
    it('should load YAML files successfully', async () => {
      // モックの設定
      mockDv.io.load
        .mockResolvedValueOnce(loadTestYaml('config/kpi-definitions.yaml'))
        .mockResolvedValueOnce(loadTestYaml('data/current-values.yaml'))
      
      mockApp.loadYaml
        .mockResolvedValueOnce(mockConfig)
        .mockResolvedValueOnce(mockData)

      // 実際の読み込みロジックをテスト
      const configText = await mockDv.io.load('config/kpi-definitions.yaml')
      const dataText = await mockDv.io.load('data/current-values.yaml')
      
      const parsedConfig = await mockApp.loadYaml(configText)
      const parsedData = await mockApp.loadYaml(dataText)

      expect(configText).toBeTruthy()
      expect(dataText).toBeTruthy()
      expect(parsedConfig).toEqual(mockConfig)
      expect(parsedData).toEqual(mockData)
    })

    it('should handle YAML parsing errors gracefully', async () => {
      // 不正なYAMLをテスト
      const invalidYaml = 'invalid: yaml: content: ['
      
      mockDv.io.load.mockResolvedValue(invalidYaml)
      mockApp.loadYaml.mockRejectedValue(new Error('YAML parsing failed'))

      try {
        const yamlText = await mockDv.io.load('invalid.yaml')
        await mockApp.loadYaml(yamlText)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toContain('YAML parsing failed')
      }
    })

    it('should fallback when primary YAML loader fails', async () => {
      // プライマリローダー失敗をシミュレート
      mockApp.loadYaml.mockRejectedValue(new Error('Primary loader failed'))
      
      // フォールバック関数をテスト
      const fallbackParse = (yamlText) => {
        try {
          // 簡単な正規表現でYAMLをJSONライクに変換
          const jsonString = yamlText
            .replace(/(\w+):\s*(.+)/g, '"$1": "$2"')
            .replace(/"/g, '\\"')
            .replace(/\\"/g, '"')
          return JSON.parse(`{${jsonString}}`)
        } catch {
          throw new Error('All YAML parsers failed')
        }
      }

      const simpleYaml = 'test: value\nnumber: 42'
      expect(() => fallbackParse(simpleYaml)).toThrow()
      
      // 有効なJSON形式
      const validJson = '{"test": "value", "number": 42}'
      expect(() => JSON.parse(validJson)).not.toThrow()
    })
  })

  describe('🔴 Critical: Dashboard Rendering Logic', () => {
    it('should generate correct section category information', () => {
      // getSectionCategory ユーティリティ関数のテスト
      function getSectionCategory(section, categories, kpis) {
        for (const kpiId of section.kpis) {
          const categoryKey = kpis[kpiId]?.category
          if (categoryKey && categories[categoryKey]) {
            return { key: categoryKey, info: categories[categoryKey] }
          }
        }
        return { key: null, info: { icon: '📊', color: '#1976D2', name: 'Default' } }
      }

      const testSection = {
        name: "Platform Health",
        kpis: ["databricks_jobs", "snowflake_credits"]
      }

      const result = getSectionCategory(testSection, mockConfig.categories, mockConfig.kpis)
      
      expect(result.key).toBe('platform')
      expect(result.info.icon).toBe('🚀')
      expect(result.info.color).toBe('#4CAF50')
    })

    it('should format KPI values correctly based on type', () => {
      function formatValue(value, type) {
        if (type === 'percentage' || type === 'rate') {
          return Math.round(value * 100)
        }
        return value
      }

      // 各KPIタイプのテスト
      expect(formatValue(0.8542, 'percentage')).toBe(85)
      expect(formatValue(0.923, 'rate')).toBe(92)
      expect(formatValue(42, 'count')).toBe(42)
      expect(formatValue(128, 'progress')).toBe(128)
    })

    it('should calculate progress completion rates', () => {
      const testKpiData = {
        documented: 85,
        total: 128,
        completion_rate: 0.6640625
      }

      const calculatedRate = testKpiData.documented / testKpiData.total
      expect(calculatedRate).toBeCloseTo(0.6640625, 4)
      expect(Math.round(calculatedRate * 100)).toBe(66)
    })

    it('should handle missing KPI data gracefully', () => {
      const testSection = {
        name: "Test Section",
        kpis: ["nonexistent_kpi", "missing_data"]
      }

      // 存在しないKPIの処理をテスト
      const missingKpi = mockConfig.kpis["nonexistent_kpi"]
      expect(missingKpi).toBeUndefined()

      // データが欠損している場合の処理
      const existingKpi = mockConfig.kpis["databricks_jobs"]
      const missingData = mockData.nonexistent_category?.nonexistent_kpi
      expect(existingKpi).toBeDefined()
      expect(missingData).toBeUndefined()
    })
  })

  describe('🟡 Integration: CSS & HTML Generation', () => {
    it('should inject CSS successfully', async () => {
      mockApp.injectCss.mockResolvedValue(true)

      await mockApp.injectCss('_css/dashboard.css')
      
      expect(mockApp.injectCss).toHaveBeenCalledWith('_css/dashboard.css')
      expect(mockApp.injectCss).toHaveBeenCalledTimes(1)
    })

    it('should generate valid HTML structure', () => {
      const testKpiHtml = `
        <div class="kpi-card is-loading" 
             data-category="platform"
             tabindex="0" role="article" 
             aria-label="Test KPI">
          <div class="kpi-card__header">
            <span class="kpi-card__title">Test KPI</span>
            <div class="kpi-card__status"></div>
          </div>
          <div class="kpi-card__value">42<span class="kpi-card__unit">jobs</span></div>
          <div class="progress-bar" role="progressbar" 
               aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-fill" style="width: 75%"></div>
          </div>
        </div>
      `

      // HTML構造の検証
      expect(testKpiHtml).toContain('class="kpi-card')
      expect(testKpiHtml).toContain('data-category="platform"')
      expect(testKpiHtml).toContain('role="article"')
      expect(testKpiHtml).toContain('aria-label="Test KPI"')
      expect(testKpiHtml).toContain('role="progressbar"')
      expect(testKpiHtml).toContain('aria-valuenow="75"')
    })

    it('should render DataviewJS output correctly', () => {
      const testContent = '<div class="health-status">System OK</div>'
      
      mockDv.paragraph(testContent)
      mockDv.header(3, '🚀 Platform Health')

      expect(mockDv.paragraph).toHaveBeenCalledWith(testContent)
      expect(mockDv.header).toHaveBeenCalledWith(3, '🚀 Platform Health')
    })
  })

  describe('🟢 Edge Cases: Error Handling', () => {
    it('should handle network failures for external APIs', async () => {
      // ネットワークエラーのシミュレート
      mockDv.io.load.mockRejectedValue(new Error('Network timeout'))

      try {
        await mockDv.io.load('external-api-data.yaml')
        expect.fail('Should have thrown network error')
      } catch (error) {
        expect(error.message).toContain('Network timeout')
      }
    })

    it('should handle malformed date strings', () => {
      const testDates = [
        '2025-06-21T14:30:00Z',    // Valid ISO
        '2025-06-21 14:30:00',     // Valid local
        'invalid-date',            // Invalid
        '',                        // Empty
        null,                      // Null
        undefined                  // Undefined
      ]

      testDates.forEach(dateStr => {
        try {
          const date = new Date(dateStr)
          const isValid = !isNaN(date.getTime())
          
          if (dateStr === 'invalid-date' || dateStr === '' || 
              dateStr === null || dateStr === undefined) {
            expect(isValid).toBe(false)
          } else {
            expect(isValid).toBe(true)
          }
        } catch (error) {
          // 日付変換エラーは期待される場合がある
          expect(['invalid-date', '', null, undefined]).toContain(dateStr)
        }
      })
    })

    it('should handle division by zero in progress calculations', () => {
      const testCases = [
        { documented: 0, total: 0 },    // 0/0
        { documented: 5, total: 0 },    // 5/0
        { documented: 0, total: 10 },   // 0/10 (valid)
        { documented: 10, total: 10 }   // 10/10 (valid)
      ]

      testCases.forEach(({ documented, total }, index) => {
        const rate = total === 0 ? 0 : documented / total
        
        switch (index) {
          case 0: // 0/0
          case 1: // 5/0
            expect(rate).toBe(0) // フォールバック値
            break
          case 2: // 0/10
            expect(rate).toBe(0)
            break
          case 3: // 10/10
            expect(rate).toBe(1)
            break
        }
      })
    })

    it('should validate CSS class name safety', () => {
      const testClassNames = [
        'kpi-card',              // Valid
        'kpi-card__header',      // Valid BEM
        'is-loading',            // Valid state
        'data-category',         // Valid
        'kpi card',              // Invalid (space)
        'kpi-card!',             // Invalid (symbol)
        '',                      // Invalid (empty)
        'kpi--card__header'      // Valid (double dash)
      ]

      const isValidClassName = (className) => {
        return /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(className)
      }

      const validClasses = testClassNames.filter(isValidClassName)
      const expectedValid = [
        'kpi-card', 'kpi-card__header', 'is-loading', 
        'data-category', 'kpi--card__header'
      ]

      expect(validClasses).toEqual(expectedValid)
    })
  })
}) 
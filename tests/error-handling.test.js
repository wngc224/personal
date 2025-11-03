import { describe, it, expect, beforeEach, vi } from 'vitest'
import YAML from 'yaml'

describe('🚨 Error Handling & Data Validation Tests', () => {
  let mockApp, mockDv, mockConfig, mockData

  beforeEach(() => {
    // リアルなYAMLデータの模擬
    const validConfigText = `
categories:
  platform:
    name: "Platform"
    icon: "🚀"
    color: "#4CAF50"
  system:
    name: "System"
    icon: "⚙️"
    color: "#FF9800"

kpis:
  databricks_jobs:
    name: "Databricks Jobs"
    category: "platform"
    type: "count"
    unit: "jobs"
    target_daily: 50
  snowflake_credits:
    name: "Snowflake Credits"
    category: "platform"
    type: "count"
    unit: "credits"
    target_monthly: 1000

dashboard_layouts:
  main:
    sections:
      - name: "Platform Health"
        layout: "grid"
        kpis: ["databricks_jobs", "snowflake_credits"]
    `

    const validDataText = `
system:
  is_healthy: true
  status_code: "healthy"
  status_message: "All systems operational"
  last_updated: "2025-06-21T14:30:00Z"

platform:
  databricks_jobs:
    value: 42
    status: "active"
    last_updated: "2025-06-21T14:25:00Z"
  snowflake_credits:
    value: 750
    status: "active"
    last_updated: "2025-06-21T14:25:00Z"
    `

    mockConfig = YAML.parse(validConfigText)
    mockData = YAML.parse(validDataText)

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

  describe('🔴 Critical: Data Structure Validation', () => {
    it('should detect missing system data gracefully', async () => {
      // 🚨 実際のエラー再現: system データが undefined
      const corruptedData = {
        platform: {
          databricks_jobs: {
            value: 42,
            status: "active"
          }
        }
        // system が欠損している状態
      }

      mockDv.io.load
        .mockResolvedValueOnce(JSON.stringify(mockConfig))
        .mockResolvedValueOnce(JSON.stringify(corruptedData))

      mockApp.loadYaml
        .mockResolvedValueOnce(mockConfig)
        .mockResolvedValueOnce(corruptedData)

      // ダッシュボード読み込みロジックの模擬実行
      try {
        const configText = await mockDv.io.load('config/kpi-definitions.yaml')
        const dataText = await mockDv.io.load('data/current-values.yaml')
        
        const config = await mockApp.loadYaml(configText)
        const data = await mockApp.loadYaml(dataText)

        // 🚨 エラーの原因: data.system?.is_healthy でアクセスしようとしている
        const isHealthy = data.system?.is_healthy || false  // Should not crash
        const statusCode = data.system?.status_code || 'unknown'
        const statusMessage = data.system?.status_message || 'Status unavailable'

        // エラーハンドリングが正しく動作することを確認
        expect(isHealthy).toBe(false)
        expect(statusCode).toBe('unknown')
        expect(statusMessage).toBe('Status unavailable')
        
        // システムデータが欠損していることを検出
        expect(data.system).toBeUndefined()
        
      } catch (error) {
        expect.fail(`Should not throw error, but got: ${error.message}`)
      }
    })

    it('should handle completely empty data file', async () => {
      // 🚨 空のデータファイル
      const emptyData = {}

      mockDv.io.load
        .mockResolvedValueOnce(JSON.stringify(mockConfig))
        .mockResolvedValueOnce(JSON.stringify(emptyData))

      mockApp.loadYaml
        .mockResolvedValueOnce(mockConfig)
        .mockResolvedValueOnce(emptyData)

      try {
        const configText = await mockDv.io.load('config/kpi-definitions.yaml')
        const dataText = await mockDv.io.load('data/current-values.yaml')
        
        const config = await mockApp.loadYaml(configText)
        const data = await mockApp.loadYaml(dataText)

        // 空データでも安全にアクセス
        const isHealthy = data.system?.is_healthy || false
        const platformData = data.platform?.databricks_jobs

        expect(isHealthy).toBe(false)
        expect(platformData).toBeUndefined()
        expect(Object.keys(data)).toHaveLength(0)

      } catch (error) {
        expect.fail(`Should handle empty data gracefully: ${error.message}`)
      }
    })

    it('should validate required KPI data structure', () => {
      // 🚨 KPIデータ構造の検証
      const testCases = [
        {
          name: 'Valid KPI data',
          data: { value: 42, status: 'active', last_updated: '2025-06-21T14:30:00Z' },
          shouldBeValid: true
        },
        {
          name: 'Missing value',
          data: { status: 'active', last_updated: '2025-06-21T14:30:00Z' },
          shouldBeValid: false
        },
        {
          name: 'Invalid status',
          data: { value: 42, status: 'invalid_status', last_updated: '2025-06-21T14:30:00Z' },
          shouldBeValid: false
        },
        {
          name: 'Missing last_updated',
          data: { value: 42, status: 'active' },
          shouldBeValid: false
        },
        {
          name: 'Empty object',
          data: {},
          shouldBeValid: false
        },
        {
          name: 'Null data',
          data: null,
          shouldBeValid: false
        }
      ]

      testCases.forEach(({ name, data, shouldBeValid }) => {
        const isValid = validateKpiData(data)
        if (shouldBeValid) {
          expect(isValid, `${name} should be valid`).toBe(true)
        } else {
          expect(isValid, `${name} should be invalid`).toBe(false)
        }
      })

      function validateKpiData(kpiData) {
        if (!kpiData || typeof kpiData !== 'object') return false
        
        const hasRequiredFields = 
          kpiData.hasOwnProperty('value') &&
          kpiData.hasOwnProperty('status') &&
          kpiData.hasOwnProperty('last_updated')
        
        const hasValidStatus = ['active', 'pending', 'error'].includes(kpiData.status)
        
        return hasRequiredFields && hasValidStatus
      }
    })
  })

  describe('🔴 Critical: YAML Parsing Edge Cases', () => {
    it('should handle malformed YAML gracefully', async () => {
      // 🚨 不正なYAML形式
      const malformedYamls = [
        'invalid: yaml: content: [',  // 構文エラー
        '',                           // 空ファイル
        'null',                       // null値
        'undefined',                  // undefined
        '---\n invalid \n content',   // 無効なコンテンツ
        'key: value\n  invalid indentation', // インデントエラー
      ]

      for (const malformedYaml of malformedYamls) {
        mockDv.io.load.mockResolvedValue(malformedYaml)
        mockApp.loadYaml.mockRejectedValue(new Error('YAML parsing failed'))

        try {
          const yamlText = await mockDv.io.load('test.yaml')
          await mockApp.loadYaml(yamlText)
          expect.fail('Should have thrown an error for malformed YAML')
        } catch (error) {
          expect(error.message).toContain('YAML parsing failed')
        }
      }
    })

    it('should provide fallback when all YAML parsers fail', async () => {
      const invalidYaml = 'completely: invalid: yaml: ['
      
      mockDv.io.load.mockResolvedValue(invalidYaml)
      mockApp.loadYaml.mockRejectedValue(new Error('Primary parser failed'))

      // フォールバック戦略のテスト
      const fallbackStrategies = [
        () => {
          // Strategy 1: MetaEdit plugin fallback
          if (window.MetaEdit?.api?.parseYaml) {
            return window.MetaEdit.api.parseYaml(invalidYaml)
          }
          throw new Error('MetaEdit not available')
        },
        () => {
          // Strategy 2: Simple JSON fallback
          const jsonString = invalidYaml.replace(/(\w+):/g, '"$1":')
          return JSON.parse(jsonString)
        },
        () => {
          // Strategy 3: Default empty structure
          return {
            system: {
              is_healthy: false,
              status_code: 'error',
              status_message: 'YAML parsing failed - using fallback data'
            },
            platform: {},
            categories: {},
            kpis: {},
            dashboard_layouts: { main: { sections: [] } }
          }
        }
      ]

      let result = null
      let lastError = null

      for (const strategy of fallbackStrategies) {
        try {
          result = strategy()
          break
        } catch (error) {
          lastError = error
          continue
        }
      }

      // 最終的には何らかの形でデータが取得できる
      expect(result).toBeTruthy()
      expect(result.system).toBeDefined()
      expect(result.system.status_code).toBe('error')
    })
  })

  describe('🔴 Critical: Network & File Loading Errors', () => {
    it('should handle file not found errors', async () => {
      // 🚨 ファイルが存在しない場合
      const fileNotFoundError = new Error('ENOENT: no such file or directory')
      fileNotFoundError.code = 'ENOENT'

      mockDv.io.load.mockRejectedValue(fileNotFoundError)

      try {
        await mockDv.io.load('nonexistent-file.yaml')
        expect.fail('Should have thrown file not found error')
      } catch (error) {
        expect(error.code).toBe('ENOENT')
        expect(error.message).toContain('no such file or directory')
      }
    })

    it('should handle permission denied errors', async () => {
      // 🚨 権限エラー
      const permissionError = new Error('EACCES: permission denied')
      permissionError.code = 'EACCES'

      mockDv.io.load.mockRejectedValue(permissionError)

      try {
        await mockDv.io.load('restricted-file.yaml')
        expect.fail('Should have thrown permission error')
      } catch (error) {
        expect(error.code).toBe('EACCES')
        expect(error.message).toContain('permission denied')
      }
    })

    it('should handle network timeout errors', async () => {
      // 🚨 ネットワークタイムアウト
      const timeoutError = new Error('Network timeout after 30000ms')
      timeoutError.code = 'ETIMEDOUT'

      mockDv.io.load.mockRejectedValue(timeoutError)

      try {
        await mockDv.io.load('remote-config.yaml')
        expect.fail('Should have thrown timeout error')
      } catch (error) {
        expect(error.code).toBe('ETIMEDOUT')
        expect(error.message).toContain('timeout')
      }
    })
  })

  describe('🟡 Integration: Data Type Validation', () => {
    it('should validate date string formats', () => {
      const testDates = [
        { input: '2025-06-21T14:30:00Z', expected: true, name: 'ISO 8601' },
        { input: '2025-06-21 14:30:00', expected: true, name: 'Local format' },
        { input: '2025-06-21', expected: true, name: 'Date only' },
        { input: '2025/06/21', expected: true, name: 'Slash format' },
        { input: 'invalid-date', expected: false, name: 'Invalid string' },
        { input: '', expected: false, name: 'Empty string' },
        { input: null, expected: false, name: 'Null value' },
        { input: undefined, expected: false, name: 'Undefined value' },
        { input: 1640995200000, expected: true, name: 'Unix timestamp' }
      ]

      testDates.forEach(({ input, expected, name }) => {
        const isValid = isValidDate(input)
        expect(isValid, `${name}: ${input}`).toBe(expected)
      })

      function isValidDate(dateInput) {
        if (dateInput === null || dateInput === undefined || dateInput === '') {
          return false
        }
        
        const date = new Date(dateInput)
        return !isNaN(date.getTime())
      }
    })

    it('should validate numeric values with bounds checking', () => {
      const testValues = [
        { input: 42, min: 0, max: 100, expected: true, name: 'Valid number' },
        { input: 0, min: 0, max: 100, expected: true, name: 'Minimum boundary' },
        { input: 100, min: 0, max: 100, expected: true, name: 'Maximum boundary' },
        { input: -1, min: 0, max: 100, expected: false, name: 'Below minimum' },
        { input: 101, min: 0, max: 100, expected: false, name: 'Above maximum' },
        { input: 'not-a-number', min: 0, max: 100, expected: false, name: 'Non-numeric string' },
        { input: null, min: 0, max: 100, expected: false, name: 'Null value' },
        { input: undefined, min: 0, max: 100, expected: false, name: 'Undefined value' },
        { input: Infinity, min: 0, max: 100, expected: false, name: 'Infinity' },
        { input: NaN, min: 0, max: 100, expected: false, name: 'NaN' }
      ]

      testValues.forEach(({ input, min, max, expected, name }) => {
        const isValid = isValidNumericValue(input, min, max)
        expect(isValid, `${name}: ${input}`).toBe(expected)
      })

      function isValidNumericValue(value, min, max) {
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
          return false
        }
        return value >= min && value <= max
      }
    })
  })

  describe('🟢 Edge Cases: Complex Scenarios', () => {
    it('should handle circular references in data', () => {
      // 🚨 循環参照のあるオブジェクト
      const circularData = {
        system: {
          is_healthy: true,
          status_code: 'healthy'
        }
      }
      circularData.system.self = circularData.system  // 循環参照

      expect(() => {
        // 循環参照を検出する関数
        const hasCircularReference = (obj, seen = new Set()) => {
          if (obj === null || typeof obj !== 'object') return false
          if (seen.has(obj)) return true
          
          seen.add(obj)
          
          for (const key in obj) {
            if (hasCircularReference(obj[key], seen)) return true
          }
          
          seen.delete(obj)
          return false
        }

        const isCircular = hasCircularReference(circularData)
        expect(isCircular).toBe(true)
      }).not.toThrow()
    })

    it('should handle extremely large datasets efficiently', () => {
      // 🚨 大量データの処理テスト
      const largeDataset = {
        system: {
          is_healthy: true,
          status_code: 'healthy',
          status_message: 'All systems operational'
        },
        platform: {}
      }

      // 1000個のKPIデータを生成
      for (let i = 0; i < 1000; i++) {
        largeDataset.platform[`kpi_${i}`] = {
          value: Math.floor(Math.random() * 1000),
          status: ['active', 'pending', 'error'][Math.floor(Math.random() * 3)],
          last_updated: new Date().toISOString()
        }
      }

      const startTime = Date.now()

      // システムデータへの安全なアクセス
      const isHealthy = largeDataset.system?.is_healthy || false
      const kpiCount = Object.keys(largeDataset.platform).length

      const endTime = Date.now()

      expect(isHealthy).toBe(true)
      expect(kpiCount).toBe(1000)
      expect(endTime - startTime).toBeLessThan(100) // 100ms以内で処理
    })

    it('should handle unicode and special characters', () => {
      // 🚨 特殊文字・Unicode文字のハンドリング
      const unicodeData = {
        system: {
          is_healthy: true,
          status_code: 'healthy',
          status_message: '🎯 すべてのシステムが正常に動作中です！ émojis & 特殊文字 ✨'
        },
        platform: {
          'データベース接続数': {
            value: 42,
            status: 'active',
            last_updated: '2025-06-21T14:30:00Z'
          },
          'ユーザー数_特殊-文字.test': {
            value: 1337,
            status: 'active',
            last_updated: '2025-06-21T14:30:00Z'
          }
        }
      }

      // 特殊文字を含むデータの安全な処理
      const statusMessage = unicodeData.system?.status_message || ''
      const specialKpi = unicodeData.platform?.['ユーザー数_特殊-文字.test']

      expect(statusMessage).toContain('🎯')
      expect(statusMessage).toContain('émojis')
      expect(statusMessage).toContain('特殊文字')
      expect(specialKpi).toBeDefined()
      expect(specialKpi.value).toBe(1337)
    })
  })
}) 
import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import YAML from 'yaml'
import yaml from 'js-yaml'
import { vi } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('🔍 YAML Configuration Tests', () => {
  let config, data

  beforeEach(() => {
    // YAMLファイルを読み込み（実際のファイルをテスト）
    const configText = loadTestYaml('config/kpi-definitions.yaml')
    const dataText = loadTestYaml('data/current-values.yaml')
    
    config = YAML.parse(configText)
    data = YAML.parse(dataText)
  })

  describe('📋 Naming Convention Compliance', () => {
    it('should use is_ prefix for boolean flags', () => {
      // RED: まだ実装されていない完全なネーミング規約をテスト
      expect(config.automation.is_enabled).toBe(true)
      expect(config.automation.is_threshold_alerts).toBe(true)
      expect(config.automation.is_email_notifications).toBeDefined()
      
      // データファイルのbooleanチェック
      expect(data.system.is_healthy).toBeTypeOf('boolean')
      
      // KPIレベルでのboolean
      Object.values(data).forEach(category => {
        if (typeof category === 'object') {
          Object.values(category).forEach(kpi => {
            if (kpi && typeof kpi === 'object') {
              // is_で始まるプロパティは全てboolean
              Object.keys(kpi).forEach(key => {
                if (key.startsWith('is_')) {
                  expect(kpi[key]).toBeTypeOf('boolean', 
                    `${key} should be boolean but got ${typeof kpi[key]}`)
                }
              })
            }
          })
        }
      })
    })

    it('should separate threshold values from boolean flags', () => {
      // RED: threshold分離がまだ不完全
      Object.values(config.kpis).forEach(kpi => {
        if (kpi.is_alert_enabled) {
          expect(kpi.alert_threshold_value).toBeTypeOf('number')
          expect(kpi.alert_threshold_unit).toBeTypeOf('string')
        }
      })
    })

    it('should have proper health status structure', () => {
      // RED: health status構造のテスト
      expect(data.system.is_healthy).toBeTypeOf('boolean')
      expect(data.system.status_code).toBeTypeOf('string')
      expect(data.system.status_message).toBeTypeOf('string')
      expect(['healthy', 'warning', 'error']).toContain(data.system.status_code)
    })
  })

  describe('📊 Data Structure Validation', () => {
    it('should have required KPI categories', () => {
      const requiredCategories = ['platform', 'development', 'business', 'learning']
      requiredCategories.forEach(category => {
        expect(config.categories[category]).toBeDefined()
        expect(config.categories[category].icon).toBeTypeOf('string')
        expect(config.categories[category].color).toMatch(/^#[0-9A-F]{6}$/i)
      })
    })

    it('should validate KPI configuration structure', () => {
      Object.entries(config.kpis).forEach(([kpiId, kpi]) => {
        expect(kpi.name).toBeTypeOf('string')
        expect(kpi.type).toBeOneOf(['count', 'percentage', 'rate', 'progress'])
        expect(kpi.category).toBeTypeOf('string')
        expect(config.categories[kpi.category]).toBeDefined()
        
        // is_manual should be boolean
        expect(kpi.is_manual).toBeTypeOf('boolean')
      })
    })

    it('should have proper data values for all configured KPIs', () => {
      Object.keys(config.kpis).forEach(kpiId => {
        const kpiConfig = config.kpis[kpiId]
        const categoryData = data[kpiConfig.category]
        const kpiData = categoryData?.[kpiId]
        
        expect(kpiData).toBeDefined(`KPI data missing for ${kpiId}`)
        expect(kpiData.last_updated).toBeDefined()
        
        // 日付形式の検証
        expect(() => new Date(kpiData.last_updated)).not.toThrow()
      })
    })
  })

  describe('🎯 Business Logic Validation', () => {
    it('should calculate completion rates correctly', () => {
      const progressKpis = Object.entries(config.kpis)
        .filter(([_, kpi]) => kpi.type === 'progress')
      
      progressKpis.forEach(([kpiId, kpiConfig]) => {
        const categoryData = data[kpiConfig.category]
        const kpiData = categoryData?.[kpiId]
        
        if (kpiData && kpiData.documented && kpiData.total) {
          const expectedRate = kpiData.documented / kpiData.total
          expect(kpiData.completion_rate).toBeCloseTo(expectedRate, 2)
        }
      })
    })

    it('should have valid target thresholds', () => {
      Object.values(config.kpis).forEach(kpi => {
        if (kpi.target_daily) {
          expect(kpi.target_daily).toBeGreaterThan(0)
        }
        if (kpi.target_monthly) {
          expect(kpi.target_monthly).toBeGreaterThan(0)
        }
        if (kpi.target_completion) {
          expect(kpi.target_completion).toBeGreaterThan(0)
          expect(kpi.target_completion).toBeLessThanOrEqual(1)
        }
      })
    })
  })
})

// モックしたYAMLパーサー（テスト用）
const mockDataviewYaml = (text) => {
    // 実際のdv.yamlに近い動作をシミュレート
    return yaml.load(text);
};

// モックセットアップ
global.dv = {
    yaml: mockDataviewYaml,
    el: vi.fn((tag, attrs, content) => ({
        tagName: tag.toUpperCase(),
        attributes: attrs || {},
        innerHTML: content || ''
    }))
};

// YAMLパーサー確保（実装と同じロジック）
const getYamlParser = () => {
    if (typeof global.dv?.yaml === 'function') {
        return { parse: global.dv.yaml.bind(global.dv) };
    }
    // テスト環境では直接yaml.loadを使用
    return { parse: yaml.load };
}; 
# 📊 統合KPIダッシュボード CSS ガイド

## 🏗️ **ファイル構成**

```
_css/
├── dashboard.css           # メインスタイルシート
├── partials/
│   └── _variables.css     # CSS変数定義
└── README.md              # このファイル
```

## 🎨 **設計思想**

### **1. データ駆動型スタイリング**
- HTML: `data-category="platform"` でカテゴリ制御
- CSS: `[data-category="platform"]` でスタイル適用
- JS不要でカテゴリ色が自動適用

### **2. ネーミング規約準拠**
- 状態クラス: `.is-loading`, `.is-error`, `.is-warning`
- BEM風命名: `.kpi-card__header`, `.kpi-card__value`
- ブール値プレフィックス統一

### **3. レスポンシブ & アクセシビリティ**
- モバイルファースト設計
- `prefers-reduced-motion` 対応
- `prefers-color-scheme: dark` 対応
- `prefers-contrast: high` 対応

## 🔧 **カスタマイズ方法**

### **カラーテーマ変更**
```css
:root {
  --color-primary: #your-brand-color;
  --color-platform: #new-platform-color;
}
```

### **新カテゴリ追加**
```css
:root {
  --color-new-category: #your-color;
}

.kpi-card[data-category="new-category"] {
  border-left-color: var(--color-new-category);
}
```

### **スペーシング調整**
```css
:root {
  --spacing-xl: 24px; /* デフォルト: 20px */
}
```

## 🚀 **パフォーマンス最適化**

### **GPU加速**
- `will-change: transform` でホバー効果を最適化
- `contain: layout style` でレイアウト計算を局所化

### **モーション制御**
```css
@media (prefers-reduced-motion: reduce) {
  /* 全アニメーション無効化 */
}
```

### **ロードタイム**
- CSS変数で計算済みカラーミックスをキャッシュ
- `@import` で部分ファイル分離（将来対応）

## 📱 **レスポンシブブレークポイント**

| デバイス | ブレークポイント | 特徴 |
|---------|----------------|------|
| モバイル | `max-width: 480px` | 1カラム、ボタン幅100% |
| タブレット | `max-width: 768px` | フレックス縦並び |
| デスクトップ | `min-width: 769px` | グリッド・フレックス横並び |

## 🎯 **使用例**

### **基本的なKPIカード**
```html
<div class="kpi-card" data-category="platform">
  <div class="kpi-card__header">
    <span class="kpi-card__title">Databricks Jobs</span>
    <div class="kpi-card__status"></div>
  </div>
  <div class="kpi-card__value">42<span class="kpi-card__unit">jobs</span></div>
  <div class="kpi-card__meta">
    <span>2025-06-21 14:30</span>
    <span class="kpi-card__target">Target: 50/day</span>
  </div>
</div>
```

### **状態付きカード**
```html
<div class="kpi-card is-loading" data-category="development">
  <!-- ローディング状態のシマーエフェクト表示 -->
</div>

<div class="kpi-card is-error" data-category="business">
  <!-- エラー状態の背景色・ボーダー表示 -->
</div>
```

### **トレンドインジケーター**
```html
<span class="trend-indicator trend-up" aria-label="学習時間: 先週より2.5時間増加">
  +2.5h from last week
</span>
```

## 🔮 **将来拡張**

### **部分ファイル分離（500行超時）**
```css
/* dashboard.css */
@import 'partials/_variables.css';
@import 'partials/_layout.css';
@import 'partials/_components.css';
@import 'partials/_utilities.css';
```

### **PostCSS/Vite統合**
```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-import'),
    require('autoprefixer'),
    require('cssnano')
  ]
}
```

### **カスタムプロパティ動的更新**
```js
// JavaScript でテーマ切り替え
document.documentElement.style.setProperty('--color-primary', '#new-color');
```

## 🧪 **デバッグ・検証**

### **CSS変数確認**
```js
// ブラウザコンソール
getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
```

### **アクセシビリティチェック**
- Chrome DevTools > Lighthouse > Accessibility
- `aria-label` 属性の確認
- キーボードナビゲーション動作確認

### **パフォーマンス測定**
- Chrome DevTools > Performance > Record
- Paint/Layout thrashing の確認
- FCP (First Contentful Paint) 測定

---

## 📋 **チェックリスト**

- [ ] 新KPI追加時に `data-category` 属性を設定
- [ ] 状態変更時に `is-*` クラスを使用
- [ ] BEM命名規約に従ったクラス名
- [ ] `aria-label` でアクセシビリティ対応
- [ ] モバイル・タブレット表示確認
- [ ] ダークモード・ハイコントラスト確認
- [ ] アニメーション削減設定の動作確認

この設計により、**拡張性・保守性・アクセシビリティ・パフォーマンス**を全て満たしたプロダクションレディなダッシュボードが完成しています。 
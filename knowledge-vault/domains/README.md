# Knowledge Vault Domains

知識管理システムの各専門領域（ドメイン）の概要。段階的な専門性向上と実務での活用を目指します。

## 🎯 全体コンセプト

6つの専門ドメインによる**多階層オペレーティングシステム**として設計：

```
実装レベル     ← A&F_acc, Accounting
     ↕
技術基盤レベル  ← DataPlatforms  
     ↕
設計レベル     ← SoftwareDesign
     ↕
意思決定レベル  ← DecisionScience
     ↕
横断・基盤     ← General
```

## 📁 ドメイン一覧

### 🏢 **業務・実装ドメイン**
- **[[A&F_acc]]** - 自社システム専用ドメイン（IFRS/JGAAP等）
- **[[Accounting]]** - 一般会計ドメイン（IFRS/JGAAP等）

### 🔧 **技術・データドメイン**  
- **[[DataPlatforms]]** - データプラットフォーム専門ドメイン（Databricks/Snowflake）

### 🏗️ **設計・アーキテクチャドメイン**
- **[[SoftwareDesign]]** - 言語・業界を超える設計原則ドメイン

### 🎯 **意思決定・戦略ドメイン**
- **[[DecisionScience]]** - 意思決定理論・フレームワークドメイン

### 🌐 **横断・基盤ドメイン**
- **[[General]]** - 汎用・横断的知識ドメイン

## 🔗 ドメイン間連携マトリックス

| 連携元 \ 連携先 | A&F_acc | Accounting | DataPlatforms | SoftwareDesign | DecisionScience | General |
|----------------|---------|------------|---------------|----------------|-----------------|---------|
| **A&F_acc** | - | 会計基準参照 | データ分析基盤 | API設計パターン | システム改善判断 | 学習管理 |
| **Accounting** | 実装事例 | - | 財務データ処理 | ドメインモデリング | 投資評価 | 概念理解 |
| **DataPlatforms** | データソース | 財務指標 | - | Event Sourcing | データ活用優先順位 | 技術選択 |
| **SoftwareDesign** | 設計根拠 | モデル設計 | アーキテクチャ | - | 設計意思決定 | 抽象化 |
| **DecisionScience** | 業務判断 | 投資判断 | 技術選択 | パターン選択 | - | 学習計画 |
| **General** | 基礎知識 | 基礎理論 | 基盤知識 | 基本原則 | 基本理論 | - |

## 🎓 学習・活用ルート例

### 新卒・エントリーレベル（6ヶ月）
```
General → Accounting → SoftwareDesign基礎 → A&F_acc実践
```

### 中堅エンジニア（1年）  
```
DataPlatforms → SoftwareDesign応用 → DecisionScience → 組織改善提案
```

### シニア・マネージャー（継続）
```
DecisionScience → 全ドメイン横断活用 → 戦略立案・組織設計
```

## 📊 統合KPI・成果指標

### 個人レベル
- **専門ドメイン習熟度**: 各ドメインでのスキルレベル
- **横断活用力**: ドメイン間連携の実践回数
- **アウトプット創出**: 記事・発表・指導の実績

### チーム・組織レベル  
- **意思決定品質**: DecisionScienceフレームワーク活用効果
- **設計品質**: SoftwareDesignパターン適用による改善
- **データ活用**: DataPlatforms連携による業務効率化

## 🚀 全体進化ロードマップ

### Phase 1: 基盤構築（6ヶ月）
- [ ] 各ドメインの基本構造・テンプレート整備
- [ ] ドメイン間リンク・連携パターン確立
- [ ] 初期知識・事例の蓄積

### Phase 2: 実践検証（6ヶ月）
- [ ] 実プロジェクトでの各ドメイン活用
- [ ] フレームワーク・パターンの効果測定
- [ ] ベストプラクティス・改善パターン抽出

### Phase 3: 組織展開（継続）
- [ ] チーム・組織での知識共有システム化
- [ ] 外部発信・コミュニティ貢献
- [ ] 新技術・理論の継続的取り込み

## 🔧 実践的活用例

### 🎯 **プロジェクト企画・実行**
1. **DecisionScience**: ICE/AHPで優先順位決定
2. **SoftwareDesign**: アーキテクチャパターン選択
3. **DataPlatforms**: 技術基盤設計
4. **A&F_acc**: 具体実装・運用

### 📈 **継続改善サイクル**
1. **General**: 基礎知識・理論の習得
2. **DecisionScience**: 改善フレームワーク適用
3. **各専門ドメイン**: 具体的改善実装
4. **振り返り・知識更新**: 全ドメインでの学び反映

### 🏗️ **組織能力向上**
1. **SoftwareDesign**: 設計力・技術的判断力向上
2. **DecisionScience**: 意思決定プロセス改善
3. **DataPlatforms**: データ活用文化醸成
4. **実務ドメイン**: 業務専門性向上

---

**最終更新**: 2025-06-21  
**メンテナンス責任**: Knowledge Architecture Team  
**全体設計思想**: 段階的専門性向上と実務直結

## 📊 ドメイン横断 Dataview クエリ

### ドメイン別ノート数分析
```dataview
TABLE length(rows) as "ノート数", 
      length(filter(rows.file.tags, (t) => contains(t, "domain/"))) as "タグ付き"
FROM "domains"
WHERE file.name != "README"
GROUP BY split(file.folder, "/")[1] as "ドメイン"
SORT length(rows) desc
```

### 会計関連ノート（複数ドメイン横断）
```dataview
TABLE file.folder as "場所", tags as "タグ"
FROM "domains"
WHERE contains(tags, "domain/accounting") OR contains(file.folder, "Accounting")
SORT file.mtime desc
```

### 要件⇔プロセス 関連づけ漏れ
```dataview
LIST FROM "domains/A&F_acc/20_Permanent/Requirements"
WHERE length(covers_process) = 0 OR !covers_process
```

### 独自原則の適用プロセス一覧
```dataview
TABLE applied_in as "適用プロセス", tags as "タグ"
FROM "domains/A&F_acc/20_Permanent/Principles"
WHERE length(applied_in) > 0
```

### 高優先度インシデント
```dataview
TABLE severity as "重要度", status as "ステータス", assignee as "担当者"
FROM "domains/A&F_acc/30_Projects/Incidents"
WHERE contains(severity, "Critical") OR contains(severity, "High")
WHERE !contains(status, "Closed")
SORT severity desc, created desc
```

### アクティブジョブ一覧
```dataview
TABLE schedule as "スケジュール", owner as "所有者", priority as "優先度"
FROM "domains/A&F_acc/30_Projects/Jobs"
WHERE contains(status, "Active")
SORT priority desc, file.name asc
```

### 最近更新されたドキュメント（全ドメイン）
```dataview
TABLE file.folder as "ドメイン", file.mtime as "更新日時"
FROM "domains"
WHERE file.mtime >= date(today) - dur(7 days)
SORT file.mtime desc
LIMIT 20
```

### ドメイン別タグ使用状況
```dataview
TABLE length(filter(file.tags, (t) => contains(t, "concept/"))) as "concept",
      length(filter(file.tags, (t) => contains(t, "principle/"))) as "principle",
      length(filter(file.tags, (t) => contains(t, "doc/"))) as "doc",
      length(filter(file.tags, (t) => contains(t, "job/"))) as "job"
FROM "domains"
GROUP BY split(file.folder, "/")[1] as "ドメイン"
```

### 孤立ノート検出（リンクなし）
```dataview
LIST FROM "domains"
WHERE length(file.outlinks) = 0 AND length(file.inlinks) = 0
WHERE file.name != "README"
SORT file.ctime desc
LIMIT 10
```

## 🏷️ 統一タグ設計

| ドメイン | プレフィックス | 用途 | 例 |
|----------|----------------|------|---|
| **共通** | `domain/` | ドメイン分類 | `domain/accounting`, `domain/system` |
| **General** | `general/` | 汎用知識分類 | `general/methodology` |
| **Accounting** | `concept/`, `standard/` | 会計概念・基準 | `concept/accrual-basis` |
| **A&F_acc** | `principle/`, `job/`, `process/`, `table/`, `bug/` | システム固有 | `job/9015` |

## 🔄 新ドメイン追加手順

1. `_domain_template/` をコピー
2. ドメイン名でリネーム
3. `README.md` の `{{DOMAIN_NAME}}` 等を置換
4. ドメイン固有のタグプレフィックス定義
5. 必要に応じて専用テンプレート作成
6. このREADMEにドメイン追加 
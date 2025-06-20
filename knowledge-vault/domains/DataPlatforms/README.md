# DataPlatforms Domain

> **統一データプラットフォーム学習ドメイン**  
> Databricks & Snowflake の比較学習による専門性向上を目指す

## 🎯 ドメインの目的

このドメインは、現代の主要データプラットフォームである **Databricks** と **Snowflake** の両方を体系的に学習し、比較することで、データエンジニアリング・データアナリティクス分野での専門性を高めることを目的としています。

### 特徴

- **比較学習アプローチ**: 2つのプラットフォームを同時に学ぶことで理解を深化
- **実践重視**: 実際の認定資格取得を通じた具体的なスキル習得
- **アーキテクチャ重視**: 単なる操作ではなく、設計思想から理解
- **2025年最新情報**: AI統合、オープンスタンダード対応など最新トレンドを反映

## 📁 ディレクトリ構造

```
DataPlatforms/
├── README.md                          # このファイル
├── Getting_Started.md                 # 30分クイックスタート
├── _templates/                        # テンプレート集
│   ├── Certification_Study_Note.md
│   ├── Technology_Comparison.md
│   └── Hands_on_Lab_Note.md
├── 10_Literature/                     # 外部資料・文献
│   ├── Certification_Materials/
│   ├── Databricks_Official_Docs/
│   ├── Snowflake_Documentation/
│   └── Industry_Comparisons/
├── 20_Permanent/                      # 恒久的知識
│   ├── Concepts/                      # 基本概念
│   │   └── Data_Warehouse_vs_Lakehouse.md
│   ├── Comparisons/                   # プラットフォーム比較
│   │   └── Databricks_vs_Snowflake_Overview.md
│   ├── Databricks/                    # Databricks専門知識
│   │   ├── Architecture/
│   │   ├── Best_Practices/
│   │   ├── Features/
│   │   ├── Unity_Catalog_Implementation_Guide.md
│   │   ├── Delta_Lake_Advanced_Operations.md
│   │   ├── Mosaic_AI_Implementation_Guide.md
│   │   └── Spark_Performance_Tuning_Advanced.md
│   ├── Snowflake/                     # Snowflake専門知識
│   │   ├── Architecture/
│   │   ├── Best_Practices/
│   │   ├── Features/
│   │   ├── Snowflake_Performance_Optimization_Techniques.md
│   │   └── Snowflake_Cortex_AI_Implementation.md
│   └── Best_Practices/                # 共通ベストプラクティス
│       ├── README.md                               # 🆕 Best Practices統括ガイド
│       ├── Data_Platform_Investigation_Playbook.md    # 🆕 実務調査手法（共通）
│       ├── Advanced_Data_Architecture_Patterns.md     # 🆕 高度なアーキテクチャ
│       ├── Snowflake_Advanced_SQL_Patterns.md         # 🆕 Snowflake高度SQLパターン
│       └── Databricks_Investigation_Techniques.md     # 🆕 Databricks調査・デバッグ技法
├── 30_Projects/                       # 実践プロジェクト
│   ├── Certification/                 # 認定資格取得
│   │   ├── Databricks_Cert_Journey/
│   │   │   └── Databricks_Certified_Data_Engineer_Associate.md
│   │   └── Snowflake_Cert_Journey/
│   │       └── SnowPro_Core_Certification.md
│   ├── Hands_on_Labs/                 # ハンズオンラボ
│   └── POC_Projects/                  # 概念実証プロジェクト
└── 90_Archive/                        # アーカイブ
```

## 🚀 クイックスタート

### 1. 30分で全体像を把握
```dataview
TABLE WITHOUT ID
    file.link as "📄 ファイル",
    difficulty as "🎯 難易度",
    round(reading_time) + "分" as "⏱️ 読了時間"
FROM "knowledge-vault/domains/DataPlatforms"
WHERE file.name = "Getting_Started"
```

### 2. 基本概念の理解
```dataview
TABLE WITHOUT ID
    file.link as "📄 概念",
    tags as "🏷️ タグ",
    difficulty as "🎯 難易度"
FROM "knowledge-vault/domains/DataPlatforms/20_Permanent/Concepts"
SORT file.name ASC
```

### 3. プラットフォーム比較
```dataview
TABLE WITHOUT ID
    file.link as "📄 比較項目",
    platforms as "🔄 対象PF",
    last_updated as "📅 更新日"
FROM "knowledge-vault/domains/DataPlatforms/20_Permanent/Comparisons"
SORT last_updated DESC
```

## 📚 学習の進め方

### 初心者向け（1-2ヶ月）
1. **基本概念の理解**
   - [[Data_Warehouse_vs_Lakehouse]] - アーキテクチャの基本
   - [[Getting_Started]] - 30分概要把握

2. **プラットフォーム比較**
   - [[Databricks_vs_Snowflake_Overview]] - 両PFの全体比較

3. **ハンズオン開始**
   - 各PFの無料トライアル活用
   - 基本的なSQL、データロードを体験

### 中級者向け（3-6ヶ月）
1. **認定資格取得**
   - [[Databricks_Certified_Data_Engineer_Associate]]
   - [[SnowPro_Core_Certification]]

2. **実践的機能の習得**
   - [[Unity_Catalog_Implementation_Guide]] - ガバナンス実装
   - [[Snowflake_Performance_Optimization_Techniques]] - 性能最適化

3. **調査スキルの向上**
   - [[01_General_Investigation_Methods]] - 一般的な調査手法の習得

### 上級者向け（6ヶ月以上）
1. **AI/ML統合**
   - [[Mosaic_AI_Implementation_Guide]] - Databricks AI実装
   - [[Snowflake_Cortex_AI_Implementation]] - Snowflake AI実装

2. **高度なアーキテクチャ**
   - [[04_Advanced_Data_Architecture_Patterns]] - エンタープライズパターン

3. **アドバンス技術**
   - [[Delta_Lake_Advanced_Operations]] - Delta Lake運用
   - [[Spark_Performance_Tuning_Advanced]] - Spark最適化

## 📊 学習進捗ダッシュボード

### 認定資格進捗
```dataview
TABLE WITHOUT ID
    certification_name as "🎓 認定資格",
    study_progress + "%" as "📈 進捗",
    target_exam_date as "📅 試験予定",
    status as "📍 ステータス"
FROM "knowledge-vault/domains/DataPlatforms/30_Projects/Certification"
WHERE certification_name
SORT target_exam_date ASC
```

### 技術習得レベル
```dataview
TABLE WITHOUT ID
    technology as "🔧 技術",
    skill_level as "⭐ レベル",
    last_practiced as "📅 最終実践"
FROM "knowledge-vault/domains/DataPlatforms"
WHERE technology AND skill_level
SORT last_practiced DESC
```

### 最近の学習活動
```dataview
TABLE WITHOUT ID
    file.link as "📄 ファイル",
    file.mtime as "📅 更新日",
    tags as "🏷️ タグ"
FROM "knowledge-vault/domains/DataPlatforms"
WHERE file.mtime >= date(today) - dur(7 days)
SORT file.mtime DESC
LIMIT 10
```

## 🏆 マイルストーン

### Phase 1: 基礎固め（1-2ヶ月）
- [ ] Data Warehouse vs Lakehouse の概念理解
- [ ] 両プラットフォームの特徴・違い把握
- [ ] 基本的なSQL、データ操作の実習

### Phase 2: 専門スキル（3-4ヶ月）
- [ ] Databricks Certified Data Engineer Associate 取得
- [ ] SnowPro Core Certification 取得
- [ ] Unity Catalog、Snowflake Security の実装経験

### Phase 3: 実践応用（5-6ヶ月）
- [ ] リアルプロジェクトでの両PF活用
- [ ] AI/ML パイプライン構築経験
- [ ] パフォーマンス最適化の実践

### Phase 4: エキスパート（6ヶ月以上）
- [ ] アーキテクチャ設計・レビュー能力
- [ ] 組織への技術導入・指導
- [ ] 業界動向の把握・予測

## 🔧 実践的なスキル習得

### 調査・トラブルシューティング
```dataview
TABLE WITHOUT ID
    file.link as "📄 手法",
    implementation_status as "✅ 実装状況",
    experience_level as "🎯 経験レベル"
FROM "knowledge-vault/domains/DataPlatforms/20_Permanent/Best_Practices"
WHERE contains(tags, "methodology") OR contains(tags, "investigation")
```

### アーキテクチャパターン
```dataview
TABLE WITHOUT ID
    file.link as "📄 パターン",
    difficulty as "🎯 難易度",
    implementation_status as "✅ 状況"
FROM "knowledge-vault/domains/DataPlatforms/20_Permanent/Best_Practices"
WHERE contains(tags, "architecture")
```

## 📈 KPI・成果指標

### 学習KPI
- **認定資格取得数**: 目標 2資格/年
- **ハンズオン実施**: 目標 月2回以上
- **技術記事作成**: 目標 月1記事
- **実プロジェクト適用**: 目標 3ヶ月に1プロジェクト

### スキルレベル評価
- **Databricks習熟度**: 1(初心者) ↔ 5(エキスパート)
- **Snowflake習熟度**: 1(初心者) ↔ 5(エキスパート)
- **アーキテクチャ設計**: 1(初心者) ↔ 5(エキスパート)
- **トラブルシューティング**: 1(初心者) ↔ 5(エキスパート)

## 🔗 外部リソース

### 公式ドキュメント
- [Databricks Documentation](https://docs.databricks.com/)
- [Snowflake Documentation](https://docs.snowflake.com/)

### 認定資格
- [Databricks Certifications](https://www.databricks.com/learn/certification)
- [Snowflake Certifications](https://www.snowflake.com/certifications/)

### コミュニティ
- [Databricks Community](https://community.databricks.com/)
- [Snowflake Community](https://community.snowflake.com/)

## 🆕 新着・更新情報

### 2025年6月更新
- ✅ **一般調査手法**: [[01_General_Investigation_Methods]] 追加
- ✅ **Databricks調査技法**: [[02_Databricks_Investigation_Methods]] 追加
- ✅ **Snowflake調査手法**: [[03_Snowflake_Investigation_Methods]] 追加
- ✅ **高度なアーキテクチャパターン**: [[04_Advanced_Data_Architecture_Patterns]] 追加
- ✅ **Best Practices統括ガイド**: ファイル間の関係性・学習ルート明確化
- ✅ **AI統合実装ガイド**: Databricks Mosaic AI、Snowflake Cortex AI の詳細実装
- ✅ **2025年最新認定情報**: Unity Catalog OSS、Generation 2 対応

### 次回更新予定
- 🔄 **マルチクラウド展開パターン**
- 🔄 **コスト最適化戦略**
- 🔄 **データガバナンス実装事例**

---

**作成日**: 2025-06-20  
**最終更新**: 2025-06-20  
**メンテナンス担当**: Data Engineering Team 
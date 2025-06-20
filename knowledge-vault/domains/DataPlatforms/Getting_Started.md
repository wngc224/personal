---
tags:
  - domain/data-platform
  - getting-started
  - quick-start
created: 2025-06-20
modified: 2025-06-20
---

# DataPlatforms ドメイン - Getting Started 🚀

## 👋 ようこそ DataPlatforms ドメインへ！

このドメインでは**Databricks**と**Snowflake**を中心としたクラウドデータプラットフォームの学習・実践・資格取得を体系的にサポートします。

## 🎯 学習目標

- [ ] **技術理解**: 各プラットフォームの特徴・アーキテクチャの習得
- [ ] **比較分析**: 技術選択の判断力養成
- [ ] **資格取得**: Databricks & Snowflake認定の取得
- [ ] **実践経験**: ハンズオンによる実務スキル向上

## 📋 クイックスタート（30分で開始）

### Step 1: 基本概念の理解 (10分)
まずは基本概念を理解しましょう：
- [[20_Permanent/Concepts/Data_Warehouse_vs_Lakehouse]] - データアーキテクチャの基礎
- [[20_Permanent/Comparisons/Databricks_vs_Snowflake_Overview]] - プラットフォーム比較

### Step 2: 学習パスの選択 (5分)
あなたの目標に応じて学習パスを選択：

**🎓 資格取得重視**
- [[30_Projects/Certification/Databricks_Cert_Journey/Databricks_Certified_Data_Engineer_Associate]] - Databricks資格
- [[30_Projects/Certification/Snowflake_Cert_Journey/SnowPro_Core_Certification]] - Snowflake資格

**🛠️ 技術習得重視**
- `20_Permanent/Databricks/` - Databricks技術詳細
- `20_Permanent/Snowflake/` - Snowflake技術詳細

### Step 3: 実践環境のセットアップ (15分)
無料で始められる環境を用意：

**Databricks**
- [Databricks Community Edition](https://community.cloud.databricks.com/) - 無料アカウント作成
- 制限: クラスター1つ、ストレージ15GB

**Snowflake**
- [Snowflake 30-day Trial](https://signup.snowflake.com/) - 30日間フル機能
- $400分のクレジット付与

## 📅 推奨学習スケジュール

### 🔰 初心者向け（3ヶ月プラン）

**Month 1: 基礎固め**
- Week 1-2: データプラットフォーム概念理解
- Week 3-4: 1つのプラットフォーム選択・基礎学習

**Month 2: 実践体験**
- Week 1-2: ハンズオンラボ・基本操作
- Week 3-4: サンプルプロジェクト実装

**Month 3: 資格対策**
- Week 1-2: 模擬試験・弱点補強
- Week 3-4: 資格試験受験

### 🎯 経験者向け（1ヶ月プラン）

**Week 1: 比較分析**
- 両プラットフォームの技術比較
- 用途別最適解の理解

**Week 2-3: 実践深堀り**
- 高度な機能・ベストプラクティス
- パフォーマンスチューニング

**Week 4: 認定取得**
- 集中的な試験対策
- 資格試験受験

## 🛠️ よく使うテンプレート

### 新しい学習を始める時
```markdown
# 今日から始めるなら：

1. [[_templates/Certification_Study_Note]] テンプレートを使用
2. 目標資格と学習期間を設定
3. 週次レビューで進捗確認
```

### 技術比較を行う時
```markdown
# 比較分析するなら：

1. [[_templates/Technology_Comparison]] テンプレートを使用
2. 比較軸を明確に定義
3. 客観的なメトリクスで評価
```

### 実習記録を残す時
```markdown
# ハンズオン実施後：

1. [[_templates/Hands_on_Lab_Note]] テンプレートを使用
2. トラブルシューティング詳細を記録
3. 学習ポイントを言語化
```

## 📊 進捗確認ダッシュボード

### 現在の学習状況
```dataview
TABLE cert_name as "資格", progress as "進捗", target_date as "目標日"
FROM "domains/DataPlatforms/30_Projects/Certification"
WHERE contains(tags, "cert/")
SORT target_date asc
```

### 今週の学習計画
```dataview
LIST FROM "domains/DataPlatforms"
WHERE contains(tags, "week-plan")
SORT file.mtime desc
LIMIT 5
```

### 完了済み実習
```dataview
TABLE platform as "プラットフォーム", completion_status as "状況"
FROM "domains/DataPlatforms/30_Projects/Hands_on_Labs"
WHERE contains(completion_status, "Completed")
SORT file.mtime desc
```

## 🔗 重要リンク集

### 公式リソース
- [Databricks Academy](https://academy.databricks.com/) - 無料公式トレーニング
- [Snowflake University](https://university.snowflake.com/) - 無料公式コース
- [Databricks Community](https://community.databricks.com/) - Q&Aフォーラム
- [Snowflake Community](https://community.snowflake.com/) - 技術情報共有

### 学習支援ツール
- [Databricks SQL Editor](https://docs.databricks.com/sql/index.html) - オンラインSQL環境
- [Snowflake Worksheets](https://docs.snowflake.com/en/user-guide/ui-snowsight-worksheets.html) - WebベースSQL環境

## 💡 学習のコツ

### 📚 効果的な学習方法
1. **比較学習**: 2つのプラットフォームを対比して理解
2. **実践重視**: 理論だけでなく必ずハンズオンで確認
3. **アウトプット**: 学んだことをノートにまとめる
4. **コミュニティ活用**: 疑問は積極的にフォーラムで質問

### ⚠️ よくある失敗パターン
- **理論偏重**: ハンズオンを軽視して概念理解が浅い
- **完璧主義**: 全て理解してから次に進もうとして停滞
- **孤独学習**: コミュニティを活用せず効率が悪い

## 🎓 卒業時の到達目標

DataPlatformsドメインを修了した時、あなたは：

- [ ] **技術選択力**: ビジネス要件に応じた最適プラットフォーム選択
- [ ] **実装能力**: データパイプライン・分析環境の構築
- [ ] **問題解決力**: パフォーマンス・コスト最適化
- [ ] **認定資格**: 客観的なスキル証明の取得

---

**🚀 準備ができたら、早速始めましょう！**

次のアクション：[[Your_First_Lab_Setup]] で実践環境を構築

---

**最終更新**: 2025-01-27  
**メンテナー**: DataPlatforms Learning Team 
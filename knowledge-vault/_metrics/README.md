# 📊 統合KPIダッシュボード基盤

> **拡張可能・構造的・優れたUIUXのメトリクス管理システム**  
> Obsidian Vault + External APIs + GitHub Actions による包括的KPI追跡

## 🎯 システム概要

この統合KPIダッシュボード基盤は、個人・チーム・組織レベルでの重要指標を一元管理し、データドリブンな意思決定を支援します。

### ✨ 主要機能

- **📊 リアルタイムダッシュボード**: 美しく直感的なDataviewJS製ダッシュボード
- **🔄 自動データ収集**: Databricks・Snowflake等のAPI連携
- **📝 手動更新**: QuickAdd・CLI・直接編集による簡単操作
- **📈 履歴追跡**: 時系列データ・トレンド分析・週次スナップショット
- **⚙️ 完全自動化**: GitHub Actionsによる日次更新・通知
- **🎨 拡張可能設計**: 新しいKPI・データソースの容易な追加

## 🏗️ アーキテクチャ

```
📊 統合KPIダッシュボード基盤
├── Configuration Layer    # 🔧 設定・定義管理
│   ├── KPI定義YAML
│   ├── ダッシュボードレイアウト
│   └── API連携設定
├── Data Layer             # 💾 データ管理
│   ├── 現在値YAML
│   ├── 履歴データ
│   └── スナップショット
├── Collection Layer       # 📥 データ収集
│   ├── 外部API連携
│   ├── Vault内メトリクス集計
│   └── 手動更新システム
├── Processing Layer       # ⚙️ データ処理
│   ├── 集約・計算
│   ├── 検証・クリーニング
│   └── トレンド分析
├── Presentation Layer     # 🎨 UI/UX
│   ├── メインダッシュボード
│   ├── 週次レビュー
│   └── クイックアクション
└── Automation Layer       # 🤖 自動化
    ├── GitHub Actions
    ├── スケジュール管理
    └── 通知システム
```

## 📁 ディレクトリ構造

```
knowledge-vault/_metrics/
├── config/                         # 設定ファイル
│   └── kpi-definitions.yaml       # KPI定義・設定
├── data/                           # データファイル
│   └── current-values.yaml        # 現在のKPI値
├── dashboards/                     # ダッシュボード
│   ├── main-dashboard.md          # メインダッシュボード
│   └── weekly-review.md           # 週次レビュー
├── historical/                     # 履歴データ
│   └── YYYYMMDD-snapshot.yaml     # 日次スナップショット
├── logs/                          # ログファイル
│   └── collector.log              # 収集ログ
└── templates/                     # テンプレート
    └── manual-update-guide.md     # 手動更新ガイド

scripts/
├── collectors/                     # データ収集
│   └── external-apis.py           # 外部API収集
├── processors/                     # データ処理
│   └── trend-analyzer.py          # トレンド分析
└── utils/                         # ユーティリティ
    └── manual-kpi-updater.py      # 手動更新CLI

.github/workflows/
└── kpi-auto-update.yml            # 自動更新ワークフロー
```

## 🚀 セットアップ手順

### 1️⃣ **前提条件**

- Obsidian + Dataview プラグイン
- Python 3.8+ 
- Git & GitHub リポジトリ
- 外部サービスアカウント（Databricks、Snowflake等）

### 2️⃣ **基本インストール**

```bash
# 1. 依存関係インストール
pip install -r requirements.txt

# 2. 実行権限付与
chmod +x scripts/**/*.py

# 3. 初期設定確認
python scripts/utils/manual-kpi-updater.py status
```

### 3️⃣ **Obsidianプラグイン設定**

必要なプラグイン：
- **Dataview**: ダッシュボード表示
- **QuickAdd**: 手動更新ボタン
- **Templater**: マクロ実行
- **Buttons**: インタラクティブUI

### 4️⃣ **外部API設定**

#### GitHub Secrets設定
```bash
# Databricks
DATABRICKS_TOKEN=your_token_here
DATABRICKS_WORKSPACE_URL=https://your-workspace.databricks.com

# Snowflake
SNOWFLAKE_USER=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
```

#### 環境変数（ローカル開発用）
```bash
# .env ファイル作成
cp .env.example .env
# 各値を設定
```

## 📊 使用方法

### **📈 ダッシュボード閲覧**

1. [[main-dashboard|📊 メインダッシュボード]]を開く
2. リアルタイムでKPI状況を確認
3. クイックアクションで即座に更新

### **📝 手動更新**

#### QuickAdd使用（推奨）
```
Ctrl+P → "QuickAdd" → "+1 Batch Documentation"
```

#### CLI使用
```bash
# バッチ仕様書完了を記録
python scripts/utils/manual-kpi-updater.py increment --kpi batch_documentation

# 学習時間2時間を記録
python scripts/utils/manual-kpi-updater.py increment --kpi study_hours --amount 2
```

### **🔄 自動更新**

GitHub Actionsが以下を自動実行：
- **日次**: 24:00に外部API更新
- **週次**: 日曜日にスナップショット作成
- **月次**: 月初にレポート生成

## 📊 KPI一覧

### 🚀 **Platform**
- **Databricks Jobs**: アクティブジョブ数（API自動取得）
- **Snowflake Credits**: 日次クレジット消費（API自動取得）

### 📦 **Development**
- **Batch Documentation**: 仕様書文書化進捗（手動更新）
- **Incidents Resolved**: インシデント解決率（手動更新）
- **Test Pass Rate**: テスト合格率（API取得）

### 🎓 **Learning**
- **Study Hours**: 月次学習時間（手動更新）
- **Certifications**: 取得資格数（手動更新）
- **Vocabulary Learned**: 習得語彙数（手動更新）

### 💼 **Business**
- **Decisions Made**: 意思決定記録数（Vault自動集計）
- **Pattern Applications**: 設計パターン適用数（Vault自動集計）

## 🎨 カスタマイズ

### **新しいKPIの追加**

1. `config/kpi-definitions.yaml` にKPI定義を追加
2. `data/current-values.yaml` に初期値を設定
3. 必要に応じて収集ロジックを実装

例：
```yaml
# config/kpi-definitions.yaml
new_kpi:
  category: "custom"
  name: "Custom Metric"
  type: "counter"
  unit: "items"
  collection_method: "manual"
```

### **新しいデータソースの追加**

1. `scripts/collectors/` に新しい収集スクリプトを追加
2. GitHub Actionsワークフローに収集ステップを追加
3. 必要な認証情報をSecretsに設定

## 🔧 メンテナンス

### **日常チェック**

```bash
# システム状況確認
python scripts/utils/manual-kpi-updater.py status

# ログ確認
tail -f knowledge-vault/_metrics/logs/collector.log

# GitHub Actions確認
# GitHubリポジトリの Actions タブで実行状況を確認
```

### **トラブルシューティング**

よくある問題と解決方法は [[templates/manual-update-guide#トラブルシューティング|手動更新ガイド]] を参照してください。

## 📈 パフォーマンス指標

### **システム指標**
- **ダッシュボード読み込み時間**: <2秒
- **API応答時間**: <10秒
- **データ更新頻度**: 日次自動 + リアルタイム手動
- **履歴保持期間**: 90日

### **品質指標**
- **データ整合性**: 99.9%
- **自動更新成功率**: 95%+
- **ユーザー操作エラー率**: <1%

## 🔗 関連リンク

### **ダッシュボード**
- **[[dashboards/main-dashboard|📊 メインダッシュボード]]**
- **[[dashboards/weekly-review|📅 週次レビュー]]**

### **設定・データ**
- **[[config/kpi-definitions|⚙️ KPI設定]]**
- **[[data/current-values|📁 現在データ]]**

### **ガイド・ドキュメント**
- **[[templates/manual-update-guide|📝 手動更新ガイド]]**

### **外部リンク**
- **[Dataview Plugin](https://github.com/blacksmithgu/obsidian-dataview)**
- **[QuickAdd Plugin](https://github.com/chhoumann/quickadd)**
- **[Databricks API Documentation](https://docs.databricks.com/dev-tools/api/index.html)**
- **[Snowflake SQL API](https://docs.snowflake.com/en/developer-guide/sql-api/index.html)**

## 🏆 ベストプラクティス

### **日常運用**
1. **朝の確認（5分）**: ダッシュボードで前日の状況確認
2. **作業完了時（1分）**: QuickAddで即座にKPI更新
3. **週次レビュー（15分）**: トレンド分析・目標進捗確認

### **データ品質**
1. **一貫性**: 同じ基準でのデータ入力
2. **適時性**: 作業完了と同時にKPI更新
3. **正確性**: 定期的なデータ検証・修正

### **拡張性**
1. **段階的追加**: 小さなKPIから開始し、徐々に拡張
2. **標準化**: 共通パターンによる新KPI追加
3. **ドキュメント化**: 変更内容の明確な記録

---

**作成日**: 2025-06-21  
**最終更新**: 2025-06-21  
**開発チーム**: Knowledge Architecture Team  
**バージョン**: 1.0.0 
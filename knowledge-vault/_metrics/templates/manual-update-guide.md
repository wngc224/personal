# 📝 KPI手動更新ガイド

> **統合KPIダッシュボードの手動操作方法**  
> QuickAdd、CLI、直接編集による更新手順

## 🎯 概要

このガイドでは、統合KPIダッシュボードで手動更新可能なメトリクスの操作方法を説明します。

### 🔄 更新可能なKPI

| KPI名 | カテゴリ | 更新方法 | 単位 |
|-------|---------|----------|------|
| **Batch Documentation** | Development | Progress | specs |
| **Incidents Resolved** | Development | Manual | incidents |
| **Study Hours** | Learning | Accumulator | hours |
| **Certifications** | Learning | Counter | certs |
| **Vocabulary Learned** | Learning | Counter | words |

## 🚀 更新方法一覧

### 1️⃣ **QuickAdd使用（推奨）**

#### 設定手順
1. QuickAddプラグインをインストール
2. 以下の設定を `.obsidian/plugins/quickadd/data.json` に追加：

```json
{
  "choices": [
    {
      "id": "kpi-batch-doc",
      "name": "📦 +1 Batch Documentation",
      "type": "macro",
      "command": true,
      "macroId": "kpi-increment-batch"
    },
    {
      "id": "kpi-study-hour", 
      "name": "🎓 +1 Study Hour",
      "type": "macro",
      "command": true,
      "macroId": "kpi-increment-study"
    },
    {
      "id": "kpi-vocab",
      "name": "📚 +10 Vocabulary",
      "type": "macro", 
      "command": true,
      "macroId": "kpi-increment-vocab"
    }
  ],
  "macros": [
    {
      "id": "kpi-increment-batch",
      "name": "Increment Batch Documentation",
      "commands": [
        {
          "id": "templater-obsidian:templater-cli",
          "name": "Templater CLI",
          "settings": {
            "command": "python scripts/utils/manual-kpi-updater.py increment --kpi batch_documentation --amount 1"
          }
        }
      ]
    }
  ]
}
```

#### 使用方法
- `Ctrl+P` → "QuickAdd" → 該当するコマンドを選択
- または設定したホットキーを使用

### 2️⃣ **CLI使用**

#### 基本コマンド
```bash
# KPI一覧表示
python scripts/utils/manual-kpi-updater.py list

# 現在の状況確認
python scripts/utils/manual-kpi-updater.py status

# 値を増加（+1）
python scripts/utils/manual-kpi-updater.py increment --kpi batch_documentation

# 値を指定量増加
python scripts/utils/manual-kpi-updater.py increment --kpi study_hours --amount 2

# 値を直接設定
python scripts/utils/manual-kpi-updater.py set --kpi test_pass_rate --value 0.95
```

#### 実用例
```bash
# 📦 バッチ仕様書を1件完了
python scripts/utils/manual-kpi-updater.py increment --kpi batch_documentation

# 🎓 学習時間を2時間追加
python scripts/utils/manual-kpi-updater.py increment --kpi study_hours --amount 2

# 📚 語彙を50個追加
python scripts/utils/manual-kpi-updater.py increment --kpi vocabulary_learned --amount 50

# 🎯 資格取得を記録
python scripts/utils/manual-kpi-updater.py increment --kpi certifications

# 🐛 インシデント解決を記録
python scripts/utils/manual-kpi-updater.py increment --kpi incidents_resolved
```

### 3️⃣ **YAML直接編集**

#### ファイル場所
`knowledge-vault/_metrics/data/current-values.yaml`

#### 編集例
```yaml
# 学習時間を更新
learning:
  study_hours:
    monthly: 25  # ← この値を変更
    daily_average: 1.2
    last_updated: "2025-06-21T12:00:00Z"  # ← 更新時刻も変更
    collection_method: "manual"
    status: "active"
```

**⚠️ 注意**: 直接編集時は必ず `last_updated` も更新してください。

## 🎮 **Obsidianボタン使用**

### Buttonsプラグイン設定

ノート内に以下を挿入：

```button
name 📦 +1 Documentation
type command
action QuickAdd: +1 Batch Documentation
color blue
```

```button
name 🎓 +1 Study Hour  
type command
action QuickAdd: +1 Study Hour
color orange
```

```button
name 📚 +10 Vocabulary
type command
action QuickAdd: +10 Vocabulary
color green
```

```button
name 📊 Refresh Dashboard
type command
action Dataview: Refresh All Views
color purple
```
```

### 結果
📦 +1 Documentation | 🎓 +1 Study Hour | 📚 +10 Vocabulary | 📊 Refresh Dashboard

## 🔧 **Templaterマクロ**

### ファイル: `_templates/kpi-functions.js`

```javascript
// KPI増分更新関数
async function incrementKPI(kpiName, amount = 1) {
    try {
        const { exec } = require('child_process');
        const command = `python scripts/utils/manual-kpi-updater.py increment --kpi ${kpiName} --amount ${amount}`;
        
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    new Notice(`❌ KPI更新エラー: ${error.message}`);
                    reject(error);
                } else {
                    new Notice(`✅ ${kpiName} を ${amount} 増加しました`);
                    resolve(stdout);
                }
            });
        });
    } catch (error) {
        new Notice(`❌ KPI更新失敗: ${error.message}`);
        throw error;
    }
}

// テンプレート内で使用
module.exports = {
    incrementBatchDoc: () => incrementKPI('batch_documentation', 1),
    incrementStudyHour: () => incrementKPI('study_hours', 1), 
    incrementVocab: () => incrementKPI('vocabulary_learned', 10),
    incrementCert: () => incrementKPI('certifications', 1)
};
```

### 使用例
```markdown
<%* await tp.user.incrementBatchDoc() %>
<%* await tp.user.incrementStudyHour() %>
```

## 📊 **更新後の確認方法**

### 1. ダッシュボードの確認
[[_metrics/dashboards/main-dashboard|メインダッシュボード]]を開いて更新を確認

### 2. Dataviewの強制更新
`Ctrl+P` → "Dataview: Refresh All Views"

### 3. CLI状況確認
```bash
python scripts/utils/manual-kpi-updater.py status
```

## 🎯 **日常的な更新フロー**

### 朝の振り返り（5分）
```bash
# 前日の学習時間を記録
python scripts/utils/manual-kpi-updater.py increment --kpi study_hours --amount 2

# 完了したタスクを記録  
python scripts/utils/manual-kpi-updater.py increment --kpi batch_documentation --amount 3
```

### 週次レビュー（10分）
```bash
# 状況確認
python scripts/utils/manual-kpi-updater.py status

# 取得した資格があれば記録
python scripts/utils/manual-kpi-updater.py increment --kpi certifications
```

## 🚨 **トラブルシューティング**

### よくある問題

#### 1. "KPI not found" エラー
**原因**: KPI名の間違い  
**解決**: `python scripts/utils/manual-kpi-updater.py list` で正確な名前を確認

#### 2. ダッシュボードが更新されない
**原因**: Dataviewキャッシュ  
**解決**: `Ctrl+P` → "Dataview: Refresh All Views"

#### 3. 権限エラー
**原因**: ファイル書き込み権限  
**解決**: Obsidianを管理者権限で実行

#### 4. Python実行エラー
**原因**: 依存関係の不足  
**解決**: `pip install pyyaml` を実行

### ログの確認
```bash
# 詳細ログの確認
tail -f knowledge-vault/_metrics/logs/collector.log
```

## 🔗 **関連リンク**

- **[[_metrics/dashboards/main-dashboard|📊 メインダッシュボード]]**
- **[[_metrics/config/kpi-definitions|⚙️ KPI設定]]**
- **[[_metrics/data/current-values|📁 現在データ]]**
- **[📚 QuickAdd Documentation](https://github.com/chhoumann/quickadd)**
- **[🔧 Templater Documentation](https://silentvoid13.github.io/Templater/)**

---

**作成日**: 2025-06-21  
**最終更新**: 2025-06-21  
**メンテナンス**: KPI Team 
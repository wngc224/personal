# 知的生産フロー Vault

このVaultは「Obsidian×Cursor知的生産フロー企画書」に基づいて構築されています。

## 📁 フォルダ構造

```
knowledge-vault/
├── 00_Inbox/          # 未整理の情報（即座に記録）
├── 10_Fleeting/       # Fleeting Notes（一時的なメモ）
├── 20_Literature/     # Literature Notes（外部ソースの要約）
├── 30_Permanent/      # Permanent Notes（自分の知識・洞察）
├── 40_Index/          # Index Notes（テーマ別インデックス）
├── 50_Templates/      # テンプレート集
├── 60_Attachments/    # 画像・ファイル添付
└── 70_Archive/        # アーカイブ
```

## 🔄 ワークフロー

### 1. **Capture** (取り込み)
- 新しい情報は `00_Inbox/` に即座に記録
- `Fleeting Note` テンプレートを使用

### 2. **Curate** (整理)
- Inbox → `10_Fleeting/` へ移動・整理
- 価値ある情報は `Literature Note` テンプレートで `20_Literature/` へ

### 3. **Compose** (創造)
- 自分の考察・洞察を `Permanent Note` として `30_Permanent/` に作成
- Cursorでの草稿生成・再構成

### 4. **Connect** (関連付け)
- ノート間のリンクを作成
- `Index Note` で関連ノートを整理

## 📝 テンプレート使用方法

- `Ctrl/Cmd + T` でテンプレート挿入
- 各テンプレートは `50_Templates/` に格納

## 🔗 推奨プラグイン

### コアプラグイン
- [ ] Daily Notes
- [ ] Templates
- [ ] Note Composer
- [ ] Outgoing Links

### コミュニティプラグイン
- [ ] QuickAdd
- [ ] Dataview
- [ ] Templater
- [ ] Linter
- [ ] Auto Link Title

## 🚀 Daily Routine

### 毎朝 (5分)
1. Daily Note作成
2. 前日のInbox整理

### 毎夕 (10分)
1. 今日の学びをPermanent Noteに昇格
2. 関連ノートのリンク追加

### 週次 (30分)
1. 週報生成（Cursor使用）
2. Index Noteの更新
3. アーカイブ整理

## 🎯 Cursor連携

このVaultはCursorでも開けるよう設計されています：

```bash
# Cursorでこのフォルダを開く
cursor .
```

### よく使うCursorプロンプト
- `フォルダ "20_Literature" 配下の .md に #literature を付与して`
- `今週の Permanent Notes を要約し週報を作成して`
- `キーワード「〇〇」に関連するノートを一覧化して`

---

**作成日**: 2024年  
**バージョン**: 1.0  
**基づく企画書**: [Obsidian×Cursor知的生産フロー企画書](../obsidian-cursor-knowledge-production-flow.md) 
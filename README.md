# 知的生産フロー Vault

このVaultは「**Obsidian×Cursor知的生産フロー**」に基づいて構築された知的生産プラットフォームです。  
日々のキャプチャから価値ある知識への昇格、AI協働によるアウトプット加速を実現します。

## 📁 プロジェクト構造

```
/Users/maoikawa/works/personal/
├── README.md          # 📋 プロジェクト案内（このファイル）
├── docs/              # 📚 詳細ドキュメント
│   └── ops_manual.md  # 🛠️ 運用定義書（完全版）
├── .gitignore         # 🔧 Git除外設定
└── knowledge-vault/   # 🧠 Obsidian Vault本体
    ├── 00_Capture/    # 統合受け皿（Inbox + Fleeting）
    ├── 10_Literature/ # 外部ソース要約
    ├── 20_Permanent/  # 自分の知識・洞察（永久保存）
    ├── 30_Projects/   # 進行中アウトプット
    ├── 90_Archive/    # 完了・死蔵ノート
    ├── _templates/    # テンプレート集
    ├── assets/        # 添付ファイル（ノート直下分散）
    └── .obsidian/     # 設定・プラグイン
```

## 🚀 クイックスタート

### 1. Obsidianでknowledge-vaultを開く
```bash
# ターミナルでknowledge-vaultディレクトリに移動
cd knowledge-vault
```
1. Obsidianを起動
2. "Open folder as vault" から `knowledge-vault/` を選択
3. 必須プラグインの有効化を確認：
   - **Dataview** (>= 0.5.63) - 動的クエリ・JS有効化必須
   - **Templater** (>= 1.17) - 高度テンプレート・frontmatter自動挿入
   - **QuickAdd** (>= 0.9.8) - 高速キャプチャ・Macro設定
   - **Periodic Notes** (>= 0.8.0) - 日次/週次ノート

### 2. Cursorとの協働開始
```bash
# knowledge-vault内でCursorを起動
cursor .
```

### 3. CCP-Cycle（運用フロー）
- **Capture**: `⌘⇧I` で即座にキャプチャ → `00_Capture/`
- **Curate**: 毎朝5分、価値判定して適切なフォルダに移動
- **Compose**: Cursorで複数ノートから記事・レポート生成
- **Connect**: `[[]]` でリンク追加、孤立ノート解消

## 📑 詳細ドキュメント

| ドキュメント | 内容 | 対象読者 |
|-------------|------|----------|
| [**運用定義書**](docs/ops_manual.md) | CCPサイクル詳細、KPI、バックアップ手順、自動化設定 | 全運用メンバー |
| `knowledge-vault/README.md` | Vault内の詳細説明 | Obsidian利用者 |

### 主要KPI目標
- 📊 **週間キャプチャ**: 35件以上（日平均5件）
- 📈 **Permanent昇格**: 週7件以上（日平均1件）  
- 🔗 **リンク密度**: ノートあたり平均3リンク以上
- 🎯 **孤立ノート率**: 10%以下

## 🔧 よくある問題と解決方法

| 症状 | 原因 | 解決方法 |
|------|------|----------|
| Dataviewクエリが表示されない | JS無効 | 設定→Dataview→"Enable JavaScript Queries"をON |
| `⌘⇧I`でキャプチャできない | QuickAdd未設定 | QuickAdd→Macro→"Capture"設定を確認 |
| Cursorがファイルを認識しない | WD間違い | `cd knowledge-vault`後に`cursor .`実行 |
| 添付が期待した場所に保存されない | Files&Links設定 | "Subfolder"→"assets"、場所→"Same folder"確認 |
| プラグインが動作しない | バージョン問題 | Community Plugins→各プラグイン最新版に更新 |

## 📊 日常運用チェック

### 毎朝（5分）- Curate
```dataview
LIST FROM "00_Capture"
WHERE !contains(file.tags, "#processed")
SORT file.mtime desc
```

### 毎夕（5分）- Connect
```dataview
TABLE length(file.outlinks) as "発信", length(file.inlinks) as "被リンク"
FROM "20_Permanent"
WHERE length(file.outlinks) = 0 OR length(file.inlinks) = 0
SORT file.mtime desc
LIMIT 10
```

### 週次（30分）- Compose & Archive
```dataview
LIST FROM "30_Projects"
WHERE !contains(file.tags, "#completed")
SORT file.mtime desc
```

## 🛠️ 環境情報

| 項目 | 詳細 |
|------|------|
| **対象Vault** | `/Users/maoikawa/works/personal/knowledge-vault` |
| **Git管理** | Private Repository推奨 |
| **自動化** | GitHub Actions（backup.yml, lint.yml予定） |
| **拡張予定** | PARA方式、DuckDB分析、GitHub Pages |

## 🔄 変更管理

詳細な変更手順は [運用定義書](docs/ops_manual.md) の「11. 変更管理」を参照してください。

## 📝 開発者向け情報

- **Markdown Lint**: コード品質維持のため、将来的に `markdown-lint.yml` を導入予定
  - ルール詳細は [.markdownlint.yml](.markdownlint.yml) を参照（作成時）
  - 行長120文字、Front-Matter必須などの独自ルールを設定予定
- **Conventional Commits**: コミットメッセージは `feat:`, `fix:`, `docs:` 等の規約に準拠
- **Git運用**: 詳細は [運用定義書](docs/ops_manual.md) の「3.3 Git運用」を参照

---

**バージョン**: 3.0（構造最適化版）  
**作成日**: 2025年5月25日  
**最終更新**: 2025年5月25日  
**ステータス**: 運用開始準備完了 ✅  
**運用開始**: knowledge-vault をObsidianで開いてスタート 
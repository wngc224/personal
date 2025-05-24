# Obsidian Vault - 知的生産フロー

このフォルダは **Obsidian×Cursor知的生産フロー** の実行環境です。  
**Obsidianで直接開いて使用** してください。

## 📁 Vault構造（CCP-Cycle対応）

```
knowledge-vault/
├── 00_Capture/    # 統合受け皿（Inbox + Fleeting Notes）
├── 10_Literature/ # Literature Notes（外部ソース要約）
├── 20_Permanent/  # Permanent Notes（自分の知識・洞察）
├── 30_Projects/   # 進行中プロジェクト・アウトプット
├── 90_Archive/    # 完了・死蔵ノート
├── _templates/    # テンプレート集
├── assets/        # 添付ファイル（ノート直下分散方式）
└── .obsidian/     # 設定・プラグイン
```

## 🚀 Obsidianでの開始方法

1. **Obsidianを起動**
2. **"Open folder as vault"** → この`knowledge-vault/`フォルダを選択  
3. **プラグイン有効化確認**:
   - Dataview (>= 0.5.63) - JS有効化必須
   - QuickAdd (>= 0.9.8) - `⌘⇧I`キャプチャ設定
   - Templater (>= 1.17) 
   - Periodic Notes (>= 0.8.0)

## 🔄 CCP-Cycle運用

| フェーズ | 操作 | 所要時間 |
|---------|------|----------|
| **Capture** | `⌘⇧I` → `00_Capture/` | 瞬時 |
| **Curate** | 価値判定 → 適切フォルダへ移動 | 朝5分 |
| **Compose** | Cursor連携でアウトプット生成 | 随時 |
| **Connect** | `[[]]`リンク追加・孤立解消 | 夕5分 |

## 📊 日常チェック

### 未処理キャプチャ確認
```dataview
LIST FROM "00_Capture"
WHERE !contains(file.tags, "#processed")
SORT file.mtime desc
```

### 孤立ノート確認  
```dataview
TABLE length(file.outlinks) as "発信", length(file.inlinks) as "被リンク"
FROM "20_Permanent"
WHERE length(file.outlinks) = 0 OR length(file.inlinks) = 0
LIMIT 5
```

## 🛠️ Cursor連携

```bash
# このVaultでCursor起動
cd knowledge-vault
cursor .
```

## 📚 詳細情報

運用手順・Git管理・モバイル対応・タグ設計などの詳細は：  
**[運用定義書](../docs/ops_manual.md)** を参照してください。

---

**バージョン**: 2.0（統一構造対応）  
**最終更新**: 2025年5月25日  
**Obsidian推奨バージョン**: >= 1.4.0 
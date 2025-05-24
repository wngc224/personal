# Obsidian×Cursor 知的生産フロー 運用定義書

## 0. メタ情報

| 項目    | 内容                           |
| ----- | ---------------------------- |
| バージョン | v1.1 （構造最適化版）                |
| 作成日   | 2025‑05‑25                   |
| 更新日   | 2025‑05‑25                   |
| 作成者   | ChatGPT（claude-3.5-sonnet）／Oikawa Masaya 監修 |
| 想定読者  | 本 Vault を運用・保守する全メンバー        |
| 関連文書  | [README.md](../README.md) - プロジェクト概要・クイックスタート |

---

## 1. 目的・背景

本書は、**Obsidian×Cursor** を核とした知的生産プラットフォームの運用ルールを明文化し、

* 日々のキャプチャから価値ある知識への昇格
* AI 協働によるアウトプット加速
* Git による履歴一元化とリスク低減
  を安定して実現することを目的とする。

## 2. スコープ

* 対象 Vault: `/Users/maoikawa/works/personal/knowledge-vault`
* 利用ツール: Obsidian (Desktop/Mobile), Cursor, Git & GitHub, Dataview, QuickAdd, Templater, Periodic Notes
* 連携自動化: GitHub Actions, DuckDB（任意）, CI バックアップ
* 運用フェーズ: Capture → Curate → Compose → Connect（以下 CCP‑Cycle と呼ぶ）

## 3. 環境構成

### 3.1 フォルダ構造（決定版）

```
/Users/maoikawa/works/personal/
├── README.md          # 📋 プロジェクト案内（軽量版・玄関口）
├── docs/              # 📚 詳細ドキュメント
│   └── ops_manual.md  # 🛠️ 運用定義書（このファイル・完全版）
├── .gitignore         # 🔧 Git除外設定（統一済み）
└── knowledge-vault/   # 🧠 Obsidian Vault本体
    ├── 00_Capture/    # 統合受け皿（Inbox + Fleeting）
    ├── 10_Literature/ # 外部ソース要約
    ├── 20_Permanent/  # 自分の知識・洞察（永久保存）
    ├── 30_Projects/   # 進行中アウトプット（PARA 拡張時の P）
    ├── 90_Archive/    # 完了・死蔵
    ├── _templates/    # テンプレート集
    ├── assets/        # 添付（ノート直下フォルダ方式）
    └── .obsidian/     # 設定・プラグイン
```

**役割分担**:
- **ルートレベル**: プロジェクト管理・ドキュメント・Git設定
- **knowledge-vault/**: Obsidian作業エリア（実際のノート管理）

### 3.2 プラグイン & バージョン管理

| 種別        | プラグイン                   | 用途       | バージョン固定     | 備考                            |
| --------- | ----------------------- | -------- | ----------- | ----------------------------- |
| Core      | Templates / Daily Notes | テンプレ／日次  | Obsidian 標準 |                               |
| Community | Dataview                | 動的クエリ    | `>= 0.5.63` | JS Queries 有効化必須              |
|           | QuickAdd                | 高速キャプチャ  | `>= 0.9.8`  | Macro "Capture → 00\_Capture" |
|           | Templater               | 高度テンプレ   | `>= 1.17`   | frontmatter 自動挿入              |
|           | Periodic Notes          | 日次/週次ノート | `>= 0.8.0`  | Daily Note 00:00 JST          |

> **プラグイン更新は `plugins-dev` ブランチ上で検証後、`main` にマージすること。**

### 3.3 Git 運用

* **リポジトリ**: `github.com/<org>/knowledge-vault` (Private)
* **主要ブランチ**: `main`（運用） / `plugins-dev`（検証）
* **コミット規約**: Conventional Commits (`feat:`, `fix:`, `docs:` など)
* **タグ**: `v1.0-original` (旧構造), 月次リリースタグ `2025-05-R` 等

### 3.4 自動化

| 名称                          | トリガ                     | 内容                                |
| --------------------------- | ----------------------- | --------------------------------- |
| **backup.yml**              | `push`                  | Vault を ZIP → GitHub Artifacts 保存 |
| **markdown-lint.yml**       | `push`                  | markdownlint CLI で規約違反チェック        |
| **weekly\_report.yml** (予定) | `schedule`（日曜23:55 JST） | Cursor CLI→週報生成→PR 作成             |

---

## 4. CCP‑Cycle 運用フロー

### 4.1 Capture

| 項目     | 規定                                                   |
| ------ | ---------------------------------------------------- |
| 保存先    | `00_Capture/`                                        |
| テンプレート | `_templates/Fleeting Note.md`                        |
| タグ     | `#inbox` 外部情報 / `#fleeting` アイデア / `#processed` 処理済み |
| ツール    | QuickAdd Macro `⌘⇧I`（Desktop）, Obsidian Mobile 新規ノート |

### 4.2 Curate（毎朝 5 min）

1. Dataview クエリで未処理リストを表示
2. 内容分類

   * 価値高 → `10_Literature` or `20_Permanent` へ **Move**
   * 低価値／重複 → `90_Archive` へ **Move** または削除
3. `#processed` 追加

### 4.3 Compose（随時）

* Cursor を起動 (`cursor .`) → コマンドパレット `AI Prompt: Draft blog from selected notes`
* 出力を `30_Projects/<project-name>/draft.md` に保存

### 4.4 Connect（毎夕 10 min + 週次 30 min）

* `[[` 補完でリンク追加、`⌥⌘K` でバックリンク確認
* Dataview クエリで**孤立ノート**抽出 → 最低 1 リンク付与
* Graph View or Excalibrain でマクロ観察

---

## 5. ルーティン作業詳細

### 5.1 日次

| 時刻  | 作業                                    | 所要    |
| --- | ------------------------------------- | ----- |
| 出社後 | Daily Note 作成 (`⌘P` › Periodic Notes) | 1 min |
|     | `00_Capture` 整理 (Curate)              | 5 min |
| 退勤前 | 今日の学びを Permanent 化                    | 5 min |
|     | グラフでリンク増強                             | 5 min |

### 5.2 週次（日曜）

1. Cursor で週報テンプレ Prompt 実行
2. Dataview による KPI 収集
3. `90_Archive` 整理、未使用タグ監査
4. GitHub Pages へ Weekly Digest Push（自動化予定）

### 5.3 月次（最終営業日）

* プラグイン更新テスト → `plugins-dev` → `main`
* タグ／メタデータ整合性チェック (`dashboard.md`)
* PARA 拡張要否レビュー（Projects が 10 を超えたら）

---

## 6. KPI とダッシュボード

| 指標            | 目標値    | 取得方法                                  |
| ------------- | ------ | ------------------------------------- |
| 週間 Captures   | 35↑    | Dataview `pages("00_Capture").length` |
| Permanent 昇格数 | ≥7 / 週 | Dataview JS                           |
| 平均リンク密度       | ≥3     | Dataview JS `file.outlinks.length`    |
| 孤立ノート率        | ≤10 %  | 同上                                    |

`dashboard.md` に Dataview JS で自動生成し、Sparklines で推移を可視化する。

---

## 7. タグ運用ポリシー

| カテゴリ | 接頭辞                   | 例            | 備考         |
| ---- | --------------------- | ------------ | ---------- |
| 状態   | `#inbox` `#processed` |              | フロー管理      |
| 種別   | `#lit` `#permanent`   |              | ノートタイプ     |
| テーマ  | 自由（英単語推奨）             | `#SQL` `#AI` | 監査ツールで孤立検出 |
| 時間   | `#2025` `#W22`        |              | 週次リポート連携   |

**タグの新設時は README に 1 行追記し、二重タグを避ける。**

---

## 8. バックアップ & 復旧

| ケース      | 手順                                      |
| -------- | --------------------------------------- |
| 誤削除      | `git checkout <file>^` で直前版復元           |
| Vault 破損 | GitHub Actions Artifacts から ZIP 取得 → 解凍 |
| 設定紛失     | `.obsidian/` を過去コミットから復元                |

---

## 9. セキュリティ・権限

* リポジトリは **Private**、招待は Owner 承認制
* PC/Mobile いずれも **パスコード + GitHub 2FA**
* 添付ファイルに機密文書を置く場合、`assets/secrets/` 下に格納し `.gitattributes` で Git LFS 管理

---

## 10. 変更管理

1. Issue or Discussion に改善提案を登録
2. `plugins-dev` または `ops-update` ブランチ作成
3. PR → Review → Merge → Release タグ

---

## 11. 今後の拡張ロードマップ

| 時期     | 施策              | 詳細                                           |
| ------ | --------------- | -------------------------------------------- |
| Week 3 | AI マクロ量産        | Cursor `cursor.json` にプリセット追加                |
| Week 4 | GitHub Pages 公開 | `docs/` ブランチ配信 → Custom Domain (optional)    |
| Week 5 | DuckDBダッシュボード   | ノートメタを SQL 解析、BI ツールへ連携                      |
| Week 6 | PARA フル導入       | `40_Areas` `50_Resources` 新設、Dataview MOC 更新 |

---

## 12. 問題管理 & サポート窓口

* 運用上の質問・障害は GitHub Issues ラベル`ops` で起票
* 緊急復旧（データ喪失など）は Slack `#vault-ops` で @here コール

---

### 付録 A. Dataview クエリ集（サンプル）

```dataview
TABLE file.mtime AS 更新日, length(file.outlinks) AS out, length(file.inlinks) AS in
FROM "20_Permanent"
WHERE length(file.outlinks) = 0 OR length(file.inlinks) = 0
SORT file.mtime desc
```

```dataviewjs
// 今週追加された Permanent の件数を表示
const w = dv.date("today").weekNumber;
const cnt = dv.pages("20_Permanent").filter(p => p.file.cday.weekNumber === w).length;
dv.paragraph(`**今週のPermanent: ${cnt} 件**`);
```

---

> **本書の更新方法**
>
> 1. canmore 上で修正 → `git add docs/ops_manual.md`
> 2. `docs:` コミットメッセージで push → Review → Merge

---

**以上** 
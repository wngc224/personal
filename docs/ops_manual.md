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

### 3.3 Git 運用（統一リポジトリ方式）

#### 3.3.1 リポジトリ構成

**単一リポジトリ管理**:
```
/Users/maoikawa/works/personal/ (Git Repository)
├── .git/              # 📋 統一Git管理
├── README.md          # プロジェクト案内
├── docs/              # 運用ドキュメント
├── .gitignore         # 除外設定
└── knowledge-vault/   # Obsidian Vault本体
    ├── .obsidian/     # 設定・プラグイン（追跡対象）
    ├── 00_Capture/    # ノート管理
    └── ...
```

#### 3.3.2 ブランチ戦略

| ブランチ名 | 用途 | 保護レベル | マージ条件 |
|----------|------|----------|----------|
| `main` | 本番運用・日常作業 | 保護 | 直接コミット可（個人利用） |
| `plugins-dev` | プラグイン更新テスト | 検証用 | PR→Review→Merge |
| `feature/xxxx` | 大型機能追加 | 開発用 | PR→Review→Merge |
| `hotfix/xxxx` | 緊急修正 | 修正用 | 即座にマージ |

#### 3.3.3 コミット規約（Conventional Commits）

**フォーマット**: `<type>(<scope>): <description>`

| Type | 用途 | 例 |
|------|------|---|
| `feat` | 新機能・ノート追加 | `feat(capture): add new meeting notes template` |
| `fix` | バグ修正・リンク修正 | `fix(permanent): correct broken internal links` |
| `docs` | ドキュメント更新 | `docs(readme): update installation instructions` |
| `refactor` | 構造変更・整理 | `refactor(vault): reorganize literature notes by topic` |
| `chore` | 設定・メンテナンス | `chore(obsidian): update plugin configurations` |
| `style` | フォーマット・タグ統一 | `style(tags): standardize tag naming convention` |

**コミット例**:
```bash
git commit -m "feat(permanent): add machine learning fundamentals note

- Cover supervised vs unsupervised learning
- Include practical examples with datasets
- Link to related literature notes
- Add #AI #ML tags for discoverability"
```

#### 3.3.4 日常Git運用フロー

**毎日の作業サイクル**:
```bash
# 1. 朝：最新状態に同期
git pull origin main

# 2. ノート作業・編集（Obsidian/Cursor）
# ...作業...

# 3. 夕方：変更をコミット
git add .
git status  # 変更確認
git commit -m "feat(capture): add daily meeting insights"

# 4. リモートへプッシュ
git push origin main
```

#### 3.3.5 複数デバイス同期戦略

**PC ↔ Mobile 同期**:
```bash
# PCで作業終了時
git add . && git commit -m "chore: sync daily progress" && git push

# Mobileで作業開始前（Git対応アプリ使用時）
git pull origin main

# Mobile編集後
git add . && git commit -m "feat(capture): mobile quick notes" && git push
```

**同期対象・非同期対象**:
- ✅ **同期**: `.md`ファイル、テンプレート、プラグイン設定
- ❌ **非同期**: `workspace.json`（デバイス固有設定）、キャッシュファイル

#### 3.3.6 プラグイン管理Git戦略

**更新テストフロー**:
```bash
# 1. テスト用ブランチ作成
git checkout -b plugins-dev
git pull origin main

# 2. プラグイン更新（Obsidian内）
# Community Plugins → Update

# 3. 動作確認
# Dataview/QuickAdd/Templater テスト実行

# 4. 問題なければマージ
git add .obsidian/community-plugins.json
git commit -m "chore(plugins): update dataview to v0.5.65"
git checkout main
git merge plugins-dev
git push origin main

# 5. ブランチ削除
git branch -d plugins-dev
```

#### 3.3.7 リモートリポジトリ設定

**推奨設定**:
- **GitHub Private Repository** 推奨
- **リポジトリ名**: `knowledge-production-system`
- **説明**: `Obsidian×Cursor knowledge production flow with CCP-Cycle`

**初回設定**:
```bash
# リモート追加
git remote add origin https://github.com/<username>/knowledge-production-system.git

# 初回プッシュ
git push -u origin main

# 以降は短縮形
git push
git pull
```

#### 3.3.8 自動バックアップ設定

**.github/workflows/backup.yml**:
```yaml
name: Daily Vault Backup
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 15 * * *'  # 毎日24:00 JST

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Create backup
        run: |
          zip -r vault-backup-$(date +%Y%m%d).zip knowledge-vault/
      - name: Upload backup
        uses: actions/upload-artifact@v3
        with:
          name: vault-backup-$(date +%Y%m%d)
          path: vault-backup-*.zip
          retention-days: 30
```

#### 3.3.9 緊急時復旧手順

| シナリオ | 対応手順 | 所要時間 |
|---------|---------|---------|
| **ファイル誤削除** | `git checkout HEAD~1 -- <file>` | 1分 |
| **大量ファイル破損** | `git reset --hard HEAD~1` | 3分 |
| **リポジトリ破損** | GitHub→Clone新規 | 5分 |
| **設定全損失** | Actions Artifacts→ZIP復元 | 10分 |

**復旧コマンド例**:
```bash
# 特定ファイル復旧
git checkout HEAD~1 -- knowledge-vault/20_Permanent/重要なノート.md

# 1つ前のコミットに戻る
git reset --hard HEAD~1

# 完全リセット（最新リモート状態）
git fetch origin
git reset --hard origin/main
```

#### 3.3.10 セキュリティ・権限管理

**アクセス制御**:
- **Private Repository** 必須
- **2FA認証** 有効化
- **Personal Access Token** 使用（パスワード認証廃止）

**機密ファイル管理**:
```bash
# .gitattributes（LFS管理）
*.pdf filter=lfs diff=lfs merge=lfs -text
*.docx filter=lfs diff=lfs merge=lfs -text
assets/confidential/** filter=lfs diff=lfs merge=lfs -text

# .gitignore追加項目
knowledge-vault/assets/private/
knowledge-vault/assets/confidential/
**/.DS_Store
```

#### 3.3.11 運用チェックリスト

**日次**:
- [ ] `git status` で変更確認
- [ ] 意味のあるコミットメッセージ作成
- [ ] `git push` で同期

**週次**:
- [ ] `git log --oneline -n 10` でコミット履歴確認
- [ ] 未追跡ファイル確認（`git status`）
- [ ] `.gitignore` 適用チェック

**月次**:
- [ ] プラグイン更新（`plugins-dev` ブランチ）
- [ ] GitHub Actions ログ確認
- [ ] リモートリポジトリ容量チェック

### 3.4 自動化・CI/CD

前述の3.3.8で設定したGitHub Actionsに加えて、以下の自動化を段階的に導入予定：

| 名称 | トリガ | 内容 | 実装状況 |
|------|--------|------|----------|
| **backup.yml** | `push` + 日次 | Vault を ZIP → GitHub Artifacts 保存 | ✅ 設定済み |
| **markdown-lint.yml** | `push` | markdownlint CLI で規約違反チェック | 🔄 予定 |
| **weekly-report.yml** | 日曜23:55 JST | Cursor CLI→週報生成→PR 作成 | 🔄 予定 |
| **tag-audit.yml** | 月次 | 未使用タグ検出・重複タグ統合提案 | 🔄 予定 |

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
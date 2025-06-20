# Domains 管理

## ドメイン一覧

### 現在のドメイン
- **[[General]]** - 汎用・横断的知識ドメイン
- **[[Accounting]]** - 一般会計ドメイン（IFRS/JGAAP等）
- **[[A&F_acc]]** - 自社システム専用ドメイン

### 拡張可能設計
新ドメイン追加時は `_domain_template/` をコピーして使用

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
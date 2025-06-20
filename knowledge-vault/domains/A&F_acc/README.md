# A&F_acc ドメイン

## ドメイン概要
自社システム「A&F_acc」専用ドメイン - 自社製品の固有仕様、設計、運用、障害管理を体系的に管理します。確定仕様と変化する運用情報を明確に分離し、システム開発・運用に必要な全情報を管理します。

## フォルダ構成
```
A&F_acc/
├── 10_Literature/     # 社内仕様抜粋・競合調査・参考URL
├── 20_Permanent/      # 固定仕様・長期保存文書（"真実のソース"）
│   ├── Principles/    # 独自設計思想（principle/* タグ）
│   ├── Requirements/  # 要件定義書（doc/requirement）
│   └── Designs/       # ★詳細設計の"真実のソース"
│       ├── Tables/    # テーブル定義（table/* タグ）
│       ├── Modules/   # API・バッチ仕様（doc/design）
│       └── Processes/ # ★確定した処理設計書（process/* タグ）
├── 30_Projects/       # 変化の激しい実装・運用メモ
│   ├── Jobs/          # ジョブ運転・調整ログ（job/** タグ）
│   ├── ProcessesWIP/  # まだ確定前のロジック検討（process/wip タグ）
│   └── Incidents/     # 障害・バグ概要（bug/** タグ）
├── 90_Archive/        # システム関連アーカイブ
└── _templates/        # システム専用テンプレート
```

## タグ設計
| プレフィックス | 用途 | 例 |
|---------------|------|---|
| `principle/` | 独自設計思想 | `principle/cumulative-diff`, `principle/batch-first` |
| `doc/` | 文書種別 | `doc/requirement`, `doc/design` |
| `table/` | テーブル仕様 | `table/tb_equity_detail`, `table/tb_journal` |
| `job/` | ジョブ・バッチID | `job/9015`, `job/daily_closing` |
| `process/` | 確定処理仕様 | `process/f01_b2470`, `process/equity_calc` |
| `process/wip` | 検討中ロジック | `process/wip/new_logic` |
| `bug/` | 障害チケット番号 | `bug/1234`, `bug/critical_001` |
| `domain/system` | ドメイン識別 | `domain/system` |

## 管理対象

### 20_Permanent（固定仕様）
- システム固有の要件定義
- データベース設計（テーブル・インデックス）
- API・バッチ処理の詳細設計
- **確定した処理ロジック仕様**（Designs/Processes）
- 独自ビジネスロジック・アルゴリズム

### 30_Projects（変化する情報）
- ジョブ運転・調整履歴
- **検討中の処理ロジック**（ProcessesWIP）
- 障害・インシデント管理
- パフォーマンスチューニング履歴

## 設計思想
- **確定 vs 検討中の分離**: 
  - `20_Permanent/Designs/Processes/` - 確定した処理設計書
  - `30_Projects/ProcessesWIP/` - まだ検討中のロジック
- **真実のソース**: Designs配下が設計の最終形
- **運用との分離**: 実装・運用メモは30_Projectsで管理

## 特徴
- **内部固有**: A&F_accシステム専用の知識
- **実装詳細**: 具体的なコード・SQL・設定を含む
- **段階管理**: 検討中→確定→運用の段階を明確に分離

## 関連ドメイン
- [[domains/Accounting]] - 会計概念・基準を実装での参照
- [[domains/General]] - 汎用開発手法の適用

## Dataview クエリ

### 要件⇔プロセス関連チェック
```dataview
LIST FROM "domains/A&F_acc/20_Permanent/Requirements"
WHERE length(covers_process) = 0 OR !covers_process
```

### 確定処理設計書一覧
```dataview
TABLE process_id as "処理ID", requirement as "関連要件"
FROM "domains/A&F_acc/20_Permanent/Designs/Processes"
WHERE contains(tags, "process/")
SORT process_id asc
```

### 検討中ロジック一覧
```dataview
LIST FROM "domains/A&F_acc/30_Projects/ProcessesWIP"
WHERE contains(tags, "process/wip")
SORT file.mtime desc
```

### アクティブジョブ監視
```dataview
TABLE schedule as "スケジュール", owner as "所有者", priority as "優先度"
FROM "domains/A&F_acc/30_Projects/Jobs"
WHERE contains(status, "Active")
SORT priority desc
```

### 高優先度インシデント
```dataview
TABLE severity as "重要度", status as "ステータス", assignee as "担当者"
FROM "domains/A&F_acc/30_Projects/Incidents"
WHERE contains(severity, "Critical") OR contains(severity, "High")
WHERE !contains(status, "Closed")
SORT created desc
```

### テーブル設計一覧
```dataview
TABLE type as "種別", table as "テーブル名"
FROM "domains/A&F_acc/20_Permanent/Designs"
WHERE contains(type, "table")
SORT table asc
``` 
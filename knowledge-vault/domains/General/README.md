# General ドメイン

## ドメイン概要
汎用的・横断的な知識を管理するドメインです。既存の知識管理システムから移行されたファイルと、ドメインを横断する汎用的な知識を管理します。

## フォルダ構成
```
General/
├── 10_Literature/     # ドメイン横断的な文献・参考資料
├── 20_Permanent/      # 汎用的な永久知識
├── 30_Projects/       # ドメイン横断プロジェクト
├── 90_Archive/        # 汎用アーカイブ
└── _templates/        # 汎用テンプレート
```

## タグ設計
| プレフィックス | 用途 | 例 |
|---------------|------|---|
| `general/` | 汎用知識分類 | `general/methodology`, `general/template` |
| `domain/general` | ドメイン識別 | `domain/general` |

## 管理対象
- 知識管理の方法論
- 汎用的なテンプレート
- ドメインを横断する概念
- 既存システムから移行されたファイル

## 関連ドメイン
- [[domains/Accounting]] - 会計関連でGeneral知識を参照
- [[domains/A&F_acc]] - システム開発でGeneral手法を活用

## Dataview クエリ
```dataview
LIST FROM "domains/General"
WHERE contains(tags, "domain/general")
SORT file.mtime desc
``` 
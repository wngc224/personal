# {{DOMAIN_NAME}} ドメイン

## ドメイン概要
<!-- このドメインの目的と管理対象 -->

## フォルダ構成
```
{{DOMAIN_NAME}}/
├── 10_Literature/     # 外部文献・参考資料
├── 20_Permanent/      # 固定化された知識・仕様
├── 30_Projects/       # 進行中のプロジェクト・変化する情報
├── 90_Archive/        # 完了・死蔵ノート
└── _templates/        # ドメイン専用テンプレート
```

## タグ設計
<!-- このドメインで使用するタグプレフィックス -->
| プレフィックス | 用途 | 例 |
|---------------|------|---|
| `{{domain_prefix}}/` | ドメイン固有分類 | `{{domain_prefix}}/category` |
| `domain/{{domain_key}}` | ドメイン識別 | `domain/{{domain_key}}` |

## テンプレート
<!-- 利用可能なテンプレート -->
- [ ] Basic Note.md - 基本ノート
- [ ] {{Custom Template}}.md - ドメイン固有テンプレート

## 運用ルール
<!-- このドメイン固有の運用ルール -->

## 関連ドメイン
<!-- 他ドメインとの関連性 -->
- [[domains/General]] - 汎用知識との関連
- [[domains/{{OTHER_DOMAIN}}]] - 他ドメインとの関連

## Dataview クエリ
<!-- ドメイン固有のクエリ例 -->
```dataview
LIST FROM "domains/{{DOMAIN_NAME}}"
WHERE contains(tags, "domain/{{domain_key}}")
``` 
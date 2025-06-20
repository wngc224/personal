# Accounting ドメイン

## ドメイン概要
一般会計ドメイン - IFRS、JGAAP等の普遍的な会計知識を管理します。外部基準に基づく概念や原則を体系的に整理し、システムを超えて再利用可能な会計知識を蓄積します。

## フォルダ構成
```
Accounting/
├── 10_Literature/     # IFRS・論文・基準書・外部資料
├── 20_Permanent/      # 会計概念辞書（永久保存）
│   └── Concepts/      # 会計概念（concept/* タグ）
├── 30_Projects/       # 会計関連プロジェクト
├── 90_Archive/        # 会計関連アーカイブ
└── _templates/        # 会計専用テンプレート
```

## タグ設計
| プレフィックス | 用途 | 例 |
|---------------|------|---|
| `concept/` | 会計概念 | `concept/accrual-basis`, `concept/revenue-recognition` |
| `standard/` | 会計基準 | `standard/ifrs15`, `standard/jgaap` |
| `domain/accounting` | ドメイン識別 | `domain/accounting` |

## 管理対象
- IFRS・JGAAP等の会計基準
- 会計概念・原則
- 会計理論・学術論文
- 外部機関発行の会計ガイダンス
- 普遍的な会計知識

## 特徴
- **普遍性**: システムや組織を超えて適用可能な知識
- **外部準拠**: 公的機関・標準化団体の基準に基づく
- **理論的**: 学術的・理論的な背景を重視

## 関連ドメイン
- [[domains/A&F_acc]] - 会計概念のシステム実装での適用
- [[domains/General]] - 汎用知識との関連

## Dataview クエリ

### 会計概念一覧
```dataview
TABLE source as "出典", related_standards as "関連基準"
FROM "domains/Accounting/20_Permanent/Concepts"
WHERE contains(tags, "concept/")
SORT file.name asc
```

### 基準別文献
```dataview
LIST FROM "domains/Accounting/10_Literature"
WHERE contains(tags, "standard/")
GROUP BY filter(tags, (t) => contains(t, "standard/"))[0]
``` 
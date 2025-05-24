---
tags: [_meta]
---

# タグ体系辞書

## 🏷️ 初期タグセット（改訂版）

| レイヤ                     | プレフィックス付きタグ                                         | 代表ノート例 / 補足                  |
| ----------------------- | --------------------------------------------------- | ---------------------------- |
| **ドメイン**<br>(最低 1 つ付与)  | `tech/databricks`                                   | Databricks Lakehouse の構築メモ   |
|                         | `tech/snowflake`                                    | Snowflake Data Cloud のクエリ最適化 |
|                         | `tech/sql`                                          | ANSI SQL ベストプラクティス           |
|                         | `tech/ai`                                           | LLM・AutoML・生成 AI             |
|                         | `tech/architecture`                                 | DWH/ETL/マイクロサービスなど設計図        |
|                         | `tech/table-driven`                                 | テーブル駆動開発（TDD）・パラメータ駆動        |
|                         | `business/consulting/strategy`                      | 全社戦略・中計策定支援                  |
|                         | `business/consulting/operations`                    | 業務改革・BPR                     |
|                         | `business/consulting/digital`                       | DX 推進・デジタル組織設計               |
|                         | `business/consulting/data-analytics`                | データ利活用ロードマップ策定               |
|                         | `lang/zh`                                           | 中国語学習全般（親タグ）                 |
|                         | `lang/en`                                           | 英語学習全般                       |
| **サブトピック**<br>(必要に応じ追加) | `lang/zh/grammar`                                   | 文法メモ                         |
|                         | `lang/zh/vocab`                                     | 語彙・イディオム                     |
|                         | `tech/ai/llm`                                       | GPT、Claude 等                 |
|                         | `tech/architecture/event-driven`                    | イベント駆動アーキ                    |
| **ファセット**<br>(属性タグ)     | `type/literature` / `type/permanent` / `type/fleeting` | ノート種別（Zettelkasten 階層）       |
|                         | `level/beginner` / `level/intermediate` / `level/advanced` | 難易度や深度                       |
|                         | `source/book` / `source/article` / `source/video`  | 情報源                          |
|                         | `project/databricks-migration`                     | Databricks 移行案件             |
|                         | `project/client-abc`                                | ABC社コンサル案件                   |
|                         | `role/consultant` / `role/engineer`                 | 立場・視点                        |
|                         | `time/2025` / `time/W22`                            | 年・週（KPI 集計用）                 |
| **状態**<br>(フロー管理)       | `#inbox` / `#processed`                             | 構造化タグの外。平タグのまま               |

## 💡 **使い方のコツ**

* まずは **ドメインタグを必須** にし、必要に応じてサブトピックを増やす。
* コンサル案件ノートなら `business/consulting/operations` + `project/xxx` を併用。
* "英語で書いた Databricks 資料" → `tech/databricks` + `lang/en` + `type/literature`。
* テーブル駆動設計ノート → `tech/table-driven` + `tech/architecture` で多面的検索が可能。

このセットでスタートすれば **検索性と拡張性のバランス** が取れ、実データ増加後も Tag Glossary に行追加するだけでスムーズにスケールします。

---

**更新履歴**:

| 更新日 | バージョン | 主な変更 |
|--------|-----------|---------|
| 2025-05-25 | v1.0 | 初版作成 |
| 2025-06-XX | v1.1 | 詳細ドメインタグ・使い方のコツ追加 |

- タグ追加時はこのファイルも更新する

**参考**: [運用定義書 8.タグ運用ポリシー](../../docs/ops_manual.md#8-タグ運用ポリシー構造化管理) 
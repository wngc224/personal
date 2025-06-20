---
tags: 
  - decision-log
  - dsc/{{decision_category}}
  - framework/{{used_framework}}
  - domain/decision-science
decision_title: "{{decision_title}}"
decision_category: "{{decision_type}}" # Strategic/Operational/Technical/Investment
decision_maker: "{{decision_maker}}"
stakeholders: [{{stakeholder_list}}]
decision_date: {{decision_date}}
review_date: {{review_date}}
created: {{date}}
modified: {{date}}
status: "{{decision_status}}" # Proposed/Under Review/Decided/Implemented/Reviewed
outcome: "{{actual_outcome}}" # Success/Partial Success/Failure/TBD
confidence_level: {{confidence}} # 0.0-1.0
impact_estimate: {{impact}} # 1-5
effort_estimate: {{effort}} # 1-5
framework_used: "{{framework_name}}"
---

# {{decision_title}} - 意思決定ログ

## 🎯 意思決定概要

| 項目 | 詳細 |
|------|------|
| **決定事項** | {{decision_title}} |
| **カテゴリ** | {{decision_type}} |
| **決定者** | {{decision_maker}} |
| **関係者** | {{stakeholder_list}} |
| **決定日** | {{decision_date}} |
| **実装期限** | {{implementation_deadline}} |
| **レビュー予定** | {{review_date}} |

## 📋 コンテキスト・背景

### 現状・課題
{{current_situation}}

### 決定が必要になった理由
{{decision_trigger}}

### 制約・前提条件
- **時間制約**: {{time_constraint}}
- **予算制約**: {{budget_constraint}}
- **技術制約**: {{technical_constraint}}
- **組織制約**: {{organizational_constraint}}

### ステークホルダーの関心事
| ステークホルダー | 主な関心事 | 影響度 | 巻き込み方 |
|-----------------|-----------|--------|-----------|
| {{stakeholder1}} | {{concern1}} | {{impact_level1}} | {{engagement1}} |
| {{stakeholder2}} | {{concern2}} | {{impact_level2}} | {{engagement2}} |
| {{stakeholder3}} | {{concern3}} | {{impact_level3}} | {{engagement3}} |

## 🔍 選択肢・オプション

### オプション1: {{option1_name}}
**概要**: {{option1_description}}

**メリット**:
- {{option1_pro1}}
- {{option1_pro2}}
- {{option1_pro3}}

**デメリット**:
- {{option1_con1}}
- {{option1_con2}}
- {{option1_con3}}

**コスト・工数**: {{option1_cost}}  
**リスク**: {{option1_risk}}

### オプション2: {{option2_name}}
**概要**: {{option2_description}}

**メリット**:
- {{option2_pro1}}
- {{option2_pro2}}
- {{option2_pro3}}

**デメリット**:
- {{option2_con1}}
- {{option2_con2}}
- {{option2_con3}}

**コスト・工数**: {{option2_cost}}  
**リスク**: {{option2_risk}}

### オプション3: {{option3_name}}
**概要**: {{option3_description}}

**メリット**:
- {{option3_pro1}}
- {{option3_pro2}}
- {{option3_pro3}}

**デメリット**:
- {{option3_con1}}
- {{option3_con2}}
- {{option3_con3}}

**コスト・工数**: {{option3_cost}}  
**リスク**: {{option3_risk}}

## 📊 評価・分析

### 使用フレームワーク: {{framework_name}}

#### ICE/RICE評価（該当する場合）
| オプション | Impact | Confidence | Ease | 総合スコア |
|-----------|--------|------------|------|-----------|
| {{option1_name}} | {{ice1_i}} | {{ice1_c}} | {{ice1_e}} | {{ice1_total}} |
| {{option2_name}} | {{ice2_i}} | {{ice2_c}} | {{ice2_e}} | {{ice2_total}} |
| {{option3_name}} | {{ice3_i}} | {{ice3_c}} | {{ice3_e}} | {{ice3_total}} |

#### 多基準評価（AHP等）
| 評価基準 | 重み | Opt1 | Opt2 | Opt3 |
|----------|------|------|------|------|
| {{criterion1}} | {{weight1}} | {{opt1_score1}} | {{opt2_score1}} | {{opt3_score1}} |
| {{criterion2}} | {{weight2}} | {{opt1_score2}} | {{opt2_score2}} | {{opt3_score2}} |
| {{criterion3}} | {{weight3}} | {{opt1_score3}} | {{opt2_score3}} | {{opt3_score3}} |
| **総合** | **1.0** | **{{opt1_total}}** | **{{opt2_total}}** | **{{opt3_total}}** |

### リスク評価
| リスク項目 | 発生確率 | 影響度 | リスクレベル | 対策 |
|-----------|----------|--------|-------------|-----|
| {{risk1}} | {{prob1}} | {{impact1}} | {{level1}} | {{mitigation1}} |
| {{risk2}} | {{prob2}} | {{impact2}} | {{level2}} | {{mitigation2}} |
| {{risk3}} | {{prob3}} | {{impact3}} | {{level3}} | {{mitigation3}} |

## ✅ 決定内容

### 選択したオプション
**決定**: {{selected_option}}

### 決定理由
{{decision_rationale}}

### 実装計画
1. **Phase 1** ({{phase1_timeline}}): {{phase1_activities}}
2. **Phase 2** ({{phase2_timeline}}): {{phase2_activities}}
3. **Phase 3** ({{phase3_timeline}}): {{phase3_activities}}

### 成功指標・KPI
- **{{kpi1}}**: {{kpi1_target}}
- **{{kpi2}}**: {{kpi2_target}}
- **{{kpi3}}**: {{kpi3_target}}

### 中止・変更条件
- {{abort_condition1}}
- {{abort_condition2}}
- {{abort_condition3}}

## 🎯 実装・追跡

### 実装状況
- [ ] {{implementation_milestone1}}
- [ ] {{implementation_milestone2}}
- [ ] {{implementation_milestone3}}
- [ ] {{implementation_milestone4}}

### 実績・結果
| KPI | 目標 | 実績 | 達成率 | 備考 |
|-----|------|------|--------|------|
| {{kpi1}} | {{kpi1_target}} | {{kpi1_actual}} | {{kpi1_achievement}} | {{kpi1_note}} |
| {{kpi2}} | {{kpi2_target}} | {{kpi2_actual}} | {{kpi2_achievement}} | {{kpi2_note}} |
| {{kpi3}} | {{kpi3_target}} | {{kpi3_actual}} | {{kpi3_achievement}} | {{kpi3_note}} |

### 予期しない結果・副作用
{{unexpected_outcomes}}

## 🔄 振り返り・学び（レビュー時記入）

### 意思決定プロセスの評価
- **フレームワーク有効性**: {{framework_effectiveness}}
- **情報収集の十分性**: {{information_adequacy}}
- **ステークホルダー参加**: {{stakeholder_engagement_quality}}
- **意思決定速度**: {{decision_speed}}

### 今回の学び・気づき
- {{lesson_learned1}}
- {{lesson_learned2}}
- {{lesson_learned3}}

### 改善点・次回への提言
- {{improvement1}}
- {{improvement2}}
- {{improvement3}}

### 類似決定への示唆
{{implications_for_similar_decisions}}

## 🔗 関連情報

### 関連する意思決定
- **[[{{related_decision1}}]]**: {{relation1_description}}
- **[[{{related_decision2}}]]**: {{relation2_description}}

### 参考にした情報・分析
- **[[{{reference1}}]]**: {{ref1_description}}
- **[[{{reference2}}]]**: {{ref2_description}}

### 影響を受けるドメイン・プロジェクト
- **[[A&F_acc/{{affected_project1}}]]**: {{impact1_description}}
- **[[DataPlatforms/{{affected_project2}}]]**: {{impact2_description}}

## 📈 意思決定メトリクス

### 決定品質指標
- **予測精度**: {{prediction_accuracy}}
- **実装成功率**: {{implementation_success_rate}}
- **ステークホルダー満足度**: {{stakeholder_satisfaction}}
- **決定から実装までの期間**: {{decision_to_implementation_time}}

### フレームワーク評価
- **{{framework_name}}適用度**: {{framework_application_score}}
- **定量化レベル**: {{quantification_level}}
- **バイアス対策実施**: {{bias_mitigation_level}}

---

**決定者**: {{decision_maker}}  
**記録者**: {{recorder}}  
**最終更新**: {{date}}  
**次回レビュー**: {{next_review_date}}  
**アーカイブ予定**: {{archive_date}} 
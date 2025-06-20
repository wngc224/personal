---
tags:
  - tech/unity-catalog
  - platform/databricks
  - implementation/guide
  - governance/data
  - domain/data-platform
created: 2025-06-20
modified: 2025-06-20
difficulty: "Advanced"
implementation_status: "Production Ready"
version: "2025"
---

# Unity Catalog実装ガイド（2025年版）

## 🎯 概要

Unity CatalogはDatabricksの統一ガバナンス層として、メタデータ管理、アクセス制御、データリネージュを提供します。2025年にオープンソース化され、エンタープライズ版とOSS版の選択が可能になりました。

## 🏗️ アーキテクチャ概要

### Unity Catalog階層構造
```
Metastore (メタストア)
├── Catalog (カタログ)
│   ├── Schema (スキーマ)
│   │   ├── Tables (テーブル)
│   │   ├── Views (ビュー)
│   │   ├── Functions (関数)
│   │   └── Models (MLモデル)
│   └── Volumes (ボリューム)
└── External Locations (外部ロケーション)
```

### コンポーネント詳細
- **Metastore**: 最上位のコンテナ、Databricksワークスペースに割り当て
- **Catalog**: データオブジェクトの論理グループ化
- **Schema**: テーブル・ビューの名前空間
- **Volume**: 非構造化データ用マネージドストレージ

## 🆚 OSS版 vs エンタープライズ版比較

| 機能 | OSS版 | エンタープライズ版 |
|------|-------|-------------------|
| **基本ガバナンス** | ✅ メタデータ管理 | ✅ 完全機能 |
| **アクセス制御** | ⚠️ 基本RBAC | ✅ ABAC + 高度RBAC |
| **データリネージュ** | ⚠️ 基本追跡 | ✅ エンドツーエンド |
| **Unity Catalog UI** | ❌ 制限あり | ✅ フル機能 |
| **Delta Sharing** | ✅ 基本機能 | ✅ 高度な共有 |
| **監査ログ** | ⚠️ 基本ログ | ✅ 詳細監査 |
| **API統合** | ✅ REST API | ✅ 全API + SDK |

## 🚀 実装手順

### 1. Metastore作成

#### エンタープライズ版
```sql
-- Account管理者として実行
CREATE METASTORE my_metastore
  STORAGE ROOT 's3://my-unity-catalog-bucket/metastore/'
  REGION 'us-west-2';

-- ワークスペースに割り当て
ALTER METASTORE my_metastore 
  ASSIGN WORKSPACE '1234567890123456';
```

#### OSS版（Docker環境）
```bash
# Unity Catalog OSS サーバー起動
docker run -d \
  --name unity-catalog \
  -p 8080:8080 \
  -v $(pwd)/unity-catalog-data:/opt/unity-catalog/data \
  unitycatalog/unitycatalog:latest

# 接続確認
curl http://localhost:8080/api/1.0/unity-catalog/metastores
```

### 2. Catalog & Schema設定

```sql
-- カタログ作成
CREATE CATALOG production_data
  COMMENT 'Production data catalog';

-- スキーマ作成
USE CATALOG production_data;
CREATE SCHEMA sales
  COMMENT 'Sales department data';

-- データベースプロパティ設定
ALTER CATALOG production_data
  SET PROPERTIES ('department' = 'analytics', 'tier' = 'production');
```

### 3. 外部ロケーション設定

```sql
-- 外部ロケーション作成（ストレージクレデンシャル必要）
CREATE STORAGE CREDENTIAL my_s3_credential
  USING AWS (
    AWS_ACCESS_KEY_ID = '${aws_access_key}',
    AWS_SECRET_ACCESS_KEY = '${aws_secret_key}'
  )
  COMMENT 'S3 access credentials';

-- 外部ロケーション定義
CREATE EXTERNAL LOCATION my_s3_location
  URL 's3://my-data-bucket/external-data/'
  WITH (STORAGE CREDENTIAL my_s3_credential)
  COMMENT 'External S3 data location';
```

## 🔐 アクセス制御実装

### 1. 基本権限設定

```sql
-- カタログレベル権限
GRANT USE CATALOG ON CATALOG production_data TO `data_analysts`;
GRANT CREATE SCHEMA ON CATALOG production_data TO `data_engineers`;

-- スキーマレベル権限
GRANT USE SCHEMA ON SCHEMA production_data.sales TO `sales_team`;
GRANT CREATE TABLE ON SCHEMA production_data.sales TO `data_engineers`;

-- テーブルレベル権限
GRANT SELECT ON TABLE production_data.sales.customers TO `analysts_group`;
GRANT ALL PRIVILEGES ON TABLE production_data.sales.orders TO `data_engineers`;
```

### 2. 高度なアクセス制御（ABAC）

```sql
-- 属性ベースアクセス制御例
CREATE ROW FILTER customer_region_filter
  ON production_data.sales.customers
  FOR ROWS WHERE region = current_user_region();

-- 動的データマスキング
CREATE FUNCTION mask_pii(input STRING)
  RETURNS STRING
  RETURN CASE 
    WHEN is_member('pii_readers') THEN input
    ELSE '***MASKED***'
  END;

-- カラムマスク適用
ALTER TABLE production_data.sales.customers
  ALTER COLUMN email SET MASK mask_pii(email);
```

### 3. サービスプリンシパル設定

```python
# Databricks SDK使用例
from databricks.sdk import WorkspaceClient
from databricks.sdk.service import iam

w = WorkspaceClient()

# サービスプリンシパル作成
sp = w.service_principals.create(
    display_name="ETL Service Principal",
    external_id="etl-service-001"
)

# 権限付与
w.permissions.set(
    request_object_type="catalog",
    request_object_id="production_data",
    access_control_list=[
        iam.AccessControlRequest(
            service_principal_name=sp.external_id,
            permission_level=iam.PermissionLevel.CAN_USE
        )
    ]
)
```

## 📊 データリネージュとメタデータ管理

### 1. リネージュ追跡設定

```python
# Spark設定でリネージュ有効化
spark.conf.set("spark.databricks.lineage.enabled", "true")
spark.conf.set("spark.databricks.lineage.log.level", "INFO")

# カスタムリネージュ追加
from pyspark.sql import DataFrame

def track_transformation(df: DataFrame, transformation_name: str) -> DataFrame:
    """データ変換のリネージュを追跡"""
    df.sparkSession.sql(f"""
        CREATE OR REPLACE TEMPORARY VIEW {transformation_name}_lineage AS
        SELECT 
            '{transformation_name}' as transformation,
            current_timestamp() as executed_at,
            current_user() as executed_by
    """)
    return df
```

### 2. メタデータ管理

```sql
-- テーブルコメント・タグ設定
ALTER TABLE production_data.sales.customers
  SET TBLPROPERTIES (
    'delta.feature.allowColumnDefaults' = 'supported',
    'quality.tier' = 'gold',
    'pii.contains' = 'true',
    'retention.days' = '2555'  -- 7年間保持
  );

-- カラムレベルメタデータ
ALTER TABLE production_data.sales.customers 
  ALTER COLUMN customer_id 
  COMMENT 'Unique customer identifier (PK)';

-- ビジネス用語集設定
CREATE OR REPLACE FUNCTION production_data.common.customer_lifetime_value(
  customer_id STRING
) RETURNS DOUBLE
LANGUAGE SQL
COMMENT 'Calculates customer lifetime value based on historical purchases'
AS $$
  SELECT SUM(order_total) 
  FROM production_data.sales.orders 
  WHERE customer_id = customer_id
$$;
```

## 🔄 Delta Sharing実装

### 1. 共有設定

```sql
-- Delta Sharing用共有作成
CREATE SHARE sales_data_share
  COMMENT 'Shared sales data for partners';

-- テーブルを共有に追加
ALTER SHARE sales_data_share
  ADD TABLE production_data.sales.public_metrics;

-- 受信者に共有付与
GRANT SELECT ON SHARE sales_data_share TO RECIPIENT 'partner-company';
```

### 2. 外部からのDelta Sharing受信

```python
import delta_sharing

# 共有プロファイル設定
profile_path = "/path/to/share.profile"

# 共有データ読み込み
shared_df = delta_sharing.load_as_spark(
    url=f"{profile_path}#sales_data_share.production_data.public_metrics"
)

# パンダスDataFrameとして読み込み
pandas_df = delta_sharing.load_as_pandas(
    url=f"{profile_path}#sales_data_share.production_data.public_metrics",
    limit=1000
)
```

## 🛠️ 運用・監視

### 1. 監査ログ分析

```sql
-- Unity Catalogアクセス監査
SELECT 
    event_time,
    user_identity.email as user_email,
    service_name,
    action_name,
    request_params.catalog_name,
    request_params.schema_name,
    response.error_code
FROM system.access.audit
WHERE service_name = 'unityCatalog'
    AND event_date >= current_date() - interval 7 days
    AND action_name IN ('getTable', 'createTable', 'deleteTable')
ORDER BY event_time DESC;
```

### 2. パフォーマンス監視

```python
# Unity Catalogメタデータクエリ最適化
def optimize_catalog_queries():
    """Unity Catalogメタデータクエリの最適化"""
    
    # メタストア統計更新
    spark.sql("ANALYZE TABLE EXTENDED production_data.sales.customers")
    
    # Delta統計収集
    spark.sql("""
        OPTIMIZE production_data.sales.orders
        ZORDER BY (order_date, customer_id)
    """)
    
    # Vacuum実行（古いファイル削除）
    spark.sql("""
        VACUUM production_data.sales.orders RETAIN 168 HOURS
    """)

# 定期実行設定
from datetime import datetime, timedelta

def schedule_maintenance():
    """定期メンテナンス実行"""
    current_hour = datetime.now().hour
    
    if current_hour == 2:  # 深夜2時に実行
        optimize_catalog_queries()
        print(f"Maintenance completed at {datetime.now()}")
```

### 3. データ品質監視

```sql
-- データ品質チェック関数
CREATE OR REPLACE FUNCTION check_data_quality(
    catalog_name STRING,
    schema_name STRING,
    table_name STRING
) RETURNS STRING
LANGUAGE PYTHON
AS $$
import json

def main(catalog_name, schema_name, table_name):
    table_path = f"{catalog_name}.{schema_name}.{table_name}"
    
    # 基本統計取得
    stats = spark.sql(f"DESCRIBE EXTENDED {table_path}").collect()
    
    # NULL値チェック
    null_check = spark.sql(f"""
        SELECT 
            COUNT(*) as total_rows,
            COUNT(CASE WHEN customer_id IS NULL THEN 1 END) as null_customer_ids
        FROM {table_path}
    """).collect()[0]
    
    quality_score = 100 - (null_check['null_customer_ids'] / null_check['total_rows'] * 100)
    
    return json.dumps({
        'table': table_path,
        'quality_score': round(quality_score, 2),
        'total_rows': null_check['total_rows'],
        'null_rate': round(null_check['null_customer_ids'] / null_check['total_rows'] * 100, 2)
    })
$$;

-- 品質チェック実行
SELECT check_data_quality('production_data', 'sales', 'customers');
```

## ⚠️ トラブルシューティング

### 1. 一般的な問題と解決法

#### 権限エラー
```sql
-- 権限確認
SHOW GRANTS ON CATALOG production_data;
SHOW GRANTS ON SCHEMA production_data.sales;

-- 権限不足の場合
GRANT USE CATALOG ON CATALOG production_data TO `username`;
```

#### メタストア接続問題
```python
# 接続状態確認
def check_metastore_connection():
    try:
        catalogs = spark.sql("SHOW CATALOGS").collect()
        print(f"Connected to metastore. Found {len(catalogs)} catalogs.")
        return True
    except Exception as e:
        print(f"Metastore connection failed: {e}")
        return False

# 修復試行
def repair_metastore_connection():
    spark.sql("REFRESH METASTORE")
    spark.catalog.refreshTable("system.information_schema.catalogs")
```

### 2. パフォーマンス問題

```sql
-- メタデータクエリ最適化
-- 問題: SHOW TABLES が遅い
-- 解決: 特定スキーマを指定
SHOW TABLES IN production_data.sales;

-- 問題: 大量のファイルによる遅延
-- 解決: Deltaテーブル最適化
OPTIMIZE production_data.sales.orders;

-- 問題: メタデータ同期遅延
-- 解決: 強制同期
REFRESH TABLE production_data.sales.customers;
```

### 3. データ整合性問題

```python
def validate_unity_catalog_integrity():
    """Unity Catalogデータ整合性チェック"""
    
    # 外部テーブルの存在確認
    external_tables = spark.sql("""
        SELECT table_catalog, table_schema, table_name, table_type
        FROM system.information_schema.tables
        WHERE table_type = 'EXTERNAL'
    """).collect()
    
    integrity_issues = []
    
    for table in external_tables:
        try:
            # テーブルアクセス確認
            spark.sql(f"""
                SELECT COUNT(*) FROM {table.table_catalog}.{table.table_schema}.{table.table_name} LIMIT 1
            """).collect()
        except Exception as e:
            integrity_issues.append({
                'table': f"{table.table_catalog}.{table.table_schema}.{table.table_name}",
                'error': str(e)
            })
    
    return integrity_issues
```

## 📋 ベストプラクティス

### 1. 命名規則
```python
# 推奨命名パターン
NAMING_CONVENTIONS = {
    'catalog': 'environment_domain',  # prod_sales, dev_analytics
    'schema': 'data_layer',          # raw, processed, curated
    'table': 'entity_type',          # customers_dim, orders_fact
    'column': 'snake_case',          # customer_id, order_total
}

# 例
# prod_sales.curated.customers_dim
# dev_analytics.raw.web_events_fact
```

### 2. 環境分離戦略
```sql
-- 環境別カタログ構成
CREATE CATALOG dev_analytics;
CREATE CATALOG staging_analytics;
CREATE CATALOG prod_analytics;

-- 共通スキーマ構造
-- {env}_analytics.raw      -- 生データ
-- {env}_analytics.processed -- 変換済みデータ  
-- {env}_analytics.curated   -- ビジネス向けデータ
-- {env}_analytics.sandbox   -- 実験用データ
```

### 3. セキュリティ設計
```sql
-- 最小権限の原則
-- 読み取り専用グループ
CREATE GROUP data_readers;
GRANT USE CATALOG ON CATALOG prod_analytics TO data_readers;
GRANT USE SCHEMA ON SCHEMA prod_analytics.curated TO data_readers;
GRANT SELECT ON SCHEMA prod_analytics.curated TO data_readers;

-- データエンジニアグループ
CREATE GROUP data_engineers;
GRANT ALL PRIVILEGES ON CATALOG dev_analytics TO data_engineers;
GRANT CREATE SCHEMA ON CATALOG staging_analytics TO data_engineers;
```

## 🔗 関連リソース

### 内部リンク
- [[Databricks_Data_Intelligence_Platform_2025]] - プラットフォーム概要
- [[Delta_Lake_Advanced_Features]] - Delta Lake詳細機能
- [[MLflow_Model_Management]] - MLモデル管理

### 外部リンク
- [Unity Catalog OSS GitHub](https://github.com/unitycatalog/unitycatalog)
- [Databricks Unity Catalog Documentation](https://docs.databricks.com/data-governance/unity-catalog/)
- [Delta Sharing Specification](https://github.com/delta-io/delta-sharing)

---

**実装難易度**: Advanced  
**推奨チーム**: Data Engineering + Platform Team  
**想定実装期間**: 4-8週間  
**メンテナンス頻度**: 月次 
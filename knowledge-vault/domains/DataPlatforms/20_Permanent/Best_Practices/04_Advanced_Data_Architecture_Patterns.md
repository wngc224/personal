---
tags:
  - architecture/patterns
  - data-engineering
  - best-practices
  - medallion-architecture
  - event-driven
  - microservices
  - domain/data-platform
created: 2025-06-20
modified: 2025-06-20
difficulty: "Advanced"
implementation_status: "Production Ready"
version: "2025"
experience_level: "実践検証済み"
---

# 高度なデータアーキテクチャパターン（2025年版）

## 🎯 概要

現代のデータプラットフォームで実証済みの高度なアーキテクチャパターンを体系化。メダリオンアーキテクチャ、イベント駆動設計、マイクロサービス統合、リアルタイム処理パターンなど、エンタープライズレベルで成功しているパターンを実装レベルで解説します。

## 🥉 メダリオンアーキテクチャ（詳細実装）

### 1. Bronze層：生データ取り込み

#### Databricks での Bronze層実装
```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
from delta.tables import DeltaTable

class BronzeLayerProcessor:
    def __init__(self, catalog="data_platform", schema="bronze"):
        self.catalog = catalog
        self.schema = schema
        self.spark = SparkSession.getActiveSession()
        
    def ingest_streaming_data(self, source_path, table_name, checkpoint_path):
        """ストリーミングデータ取り込み（Bronze層）"""
        
        # Auto Loader設定
        bronze_stream = (self.spark.readStream
            .format("cloudFiles")
            .option("cloudFiles.format", "json")
            .option("cloudFiles.inferColumnTypes", "true")
            .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
            .option("cloudFiles.includeExistingFiles", "false")
            .load(source_path)
            .withColumn("_ingestion_timestamp", current_timestamp())
            .withColumn("_source_file", input_file_name())
            .withColumn("_processing_date", current_date())
        )
        
        # Delta Live Tablesスタイルの品質チェック
        quality_checked_stream = bronze_stream.withColumn(
            "_data_quality_flags",
            struct(
                # Null チェック
                when(col("user_id").isNull(), "missing_user_id").otherwise(None).alias("user_id_check"),
                # フォーマットチェック
                when(col("email").rlike("^[^@]+@[^@]+\\.[^@]+$"), None).otherwise("invalid_email").alias("email_check"),
                # 範囲チェック
                when(col("amount") < 0, "negative_amount").otherwise(None).alias("amount_check")
            )
        )
        
        # Bronze テーブルに書き込み
        bronze_query = (quality_checked_stream.writeStream
            .format("delta")
            .outputMode("append")
            .option("checkpointLocation", checkpoint_path)
            .option("mergeSchema", "true")
            .trigger(processingTime="1 minute")
            .toTable(f"{self.catalog}.{self.schema}.{table_name}")
        )
        
        return bronze_query
    
    def setup_change_data_feed(self, table_name):
        """Change Data Feed有効化"""
        
        self.spark.sql(f"""
            ALTER TABLE {self.catalog}.{self.schema}.{table_name}
            SET TBLPROPERTIES (
                'delta.enableChangeDataFeed' = 'true',
                'delta.columnMapping.mode' = 'name'
            )
        """)

# 使用例
bronze_processor = BronzeLayerProcessor()
```

#### Snowflake での Bronze層実装
```sql
-- Bronze層テーブル作成（Snowflake）
CREATE OR REPLACE TABLE bronze.raw_events (
    event_data VARIANT,
    event_timestamp TIMESTAMP_NTZ,
    source_system STRING,
    ingestion_timestamp TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    file_name STRING,
    row_number INTEGER,
    data_quality_score FLOAT
) USING ICEBERG;

-- ストリーミング取り込みパイプ
CREATE OR REPLACE PIPE bronze_ingestion_pipe
AUTO_INGEST = TRUE
AWS_SNS_TOPIC = 'arn:aws:sns:region:account:topic'
AS
COPY INTO bronze.raw_events (event_data, event_timestamp, source_system, file_name, row_number)
FROM (
    SELECT 
        $1 as event_data,
        TO_TIMESTAMP($1:timestamp::STRING) as event_timestamp,
        'application_logs' as source_system,
        METADATA$FILENAME as file_name,
        METADATA$FILE_ROW_NUMBER as row_number
    FROM @bronze_stage/raw_events/
)
FILE_FORMAT = (TYPE = JSON STRIP_OUTER_ARRAY = TRUE);

-- データ品質スコア計算
CREATE OR REPLACE TASK calculate_data_quality_scores
    WAREHOUSE = 'BRONZE_WH'
    SCHEDULE = '5 MINUTE'
WHEN
    SYSTEM$STREAM_HAS_DATA('bronze_events_stream')
AS
    UPDATE bronze.raw_events
    SET data_quality_score = (
        CASE WHEN event_data:user_id IS NOT NULL THEN 0.3 ELSE 0 END +
        CASE WHEN event_data:timestamp IS NOT NULL THEN 0.3 ELSE 0 END +
        CASE WHEN event_data:event_type IS NOT NULL THEN 0.2 ELSE 0 END +
        CASE WHEN TRY_PARSE_JSON(event_data) IS NOT NULL THEN 0.2 ELSE 0 END
    )
    WHERE ingestion_timestamp >= dateadd(minute, -10, current_timestamp())
        AND data_quality_score IS NULL;
```

### 2. Silver層：クレンジングと標準化

#### 高度なSilver層変換
```python
class SilverLayerProcessor:
    def __init__(self, catalog="data_platform", schema="silver"):
        self.catalog = catalog
        self.schema = schema
        self.spark = SparkSession.getActiveSession()
    
    def create_silver_transformation(self, bronze_table, silver_table):
        """Bronze→Silver変換ロジック"""
        
        # Bronze層データ読み込み
        bronze_df = self.spark.readStream \
            .format("delta") \
            .option("readChangeFeed", "true") \
            .option("startingVersion", "latest") \
            .table(f"{self.catalog}.bronze.{bronze_table}")
        
        # データクレンジングと標準化
        silver_df = bronze_df \
            .filter(col("_change_type").isin(["insert", "update_postimage"])) \
            .select(
                # 主キー正規化
                regexp_replace(lower(col("user_id")), "[^a-z0-9]", "").alias("user_id_clean"),
                
                # タイムスタンプ標準化
                to_timestamp(col("event_timestamp"), "yyyy-MM-dd HH:mm:ss").alias("event_timestamp_utc"),
                
                # JSON フラット化
                get_json_object(col("event_data"), "$.event_type").alias("event_type"),
                get_json_object(col("event_data"), "$.amount").cast("decimal(10,2)").alias("amount"),
                
                # データ品質フラグ
                when(col("_data_quality_flags.user_id_check").isNull() &
                     col("_data_quality_flags.email_check").isNull() &
                     col("_data_quality_flags.amount_check").isNull(), True)
                .otherwise(False).alias("is_high_quality"),
                
                # メタデータ保持
                col("_ingestion_timestamp"),
                col("_source_file"),
                current_timestamp().alias("_silver_processed_at")
            ) \
            .withColumn("_silver_processing_date", current_date())
        
        # 重複除去ロジック
        deduplicated_df = silver_df \
            .withWatermark("event_timestamp_utc", "10 minutes") \
            .dropDuplicates(["user_id_clean", "event_timestamp_utc", "event_type"])
        
        # Silver テーブルに書き込み
        silver_query = deduplicated_df.writeStream \
            .format("delta") \
            .outputMode("append") \
            .option("checkpointLocation", f"/tmp/checkpoints/silver_{silver_table}") \
            .option("mergeSchema", "true") \
            .trigger(processingTime="2 minutes") \
            .toTable(f"{self.catalog}.silver.{silver_table}")
        
        return silver_query
    
    def implement_scd_type2(self, source_table, target_table, business_keys, track_columns):
        """SCD Type 2 実装"""
        
        # 現在のターゲットテーブル
        if self.spark.catalog.tableExists(f"{self.catalog}.silver.{target_table}"):
            target_df = self.spark.table(f"{self.catalog}.silver.{target_table}")
        else:
            # 初回作成時
            schema = StructType([
                StructField("surrogate_key", StringType(), False),
                StructField("business_key", StringType(), False),
                StructField("effective_date", TimestampType(), False),
                StructField("end_date", TimestampType(), True),
                StructField("is_current", BooleanType(), False)
            ] + [StructField(col, StringType(), True) for col in track_columns])
            
            target_df = self.spark.createDataFrame([], schema)
        
        # ソースデータ
        source_df = self.spark.table(f"{self.catalog}.silver.{source_table}") \
            .withColumn("surrogate_key", expr("uuid()")) \
            .withColumn("effective_date", current_timestamp()) \
            .withColumn("end_date", lit(None).cast(TimestampType())) \
            .withColumn("is_current", lit(True))
        
        # SCD Type 2 マージロジック
        delta_table = DeltaTable.forName(self.spark, f"{self.catalog}.silver.{target_table}")
        
        delta_table.alias("target").merge(
            source_df.alias("source"),
            " AND ".join([f"target.{key} = source.{key}" for key in business_keys])
        ).whenMatchedUpdate(
            condition="target.is_current = true AND (" + 
                     " OR ".join([f"target.{col} != source.{col}" for col in track_columns]) + ")",
            set={
                "end_date": "current_timestamp()",
                "is_current": "false"
            }
        ).whenNotMatchedInsert(
            values={
                col: f"source.{col}" for col in source_df.columns
            }
        ).execute()

# 使用例
silver_processor = SilverLayerProcessor()
```

### 3. Gold層：ビジネスロジック適用

#### 高度なGold層集約
```python
class GoldLayerProcessor:
    def __init__(self, catalog="data_platform", schema="gold"):
        self.catalog = catalog
        self.schema = schema
        self.spark = SparkSession.getActiveSession()
    
    def create_business_aggregations(self):
        """ビジネス集約テーブル作成"""
        
        # 顧客行動分析テーブル
        customer_behavior_sql = f"""
        CREATE OR REPLACE TABLE {self.catalog}.{self.schema}.customer_behavior_metrics
        USING DELTA
        PARTITIONED BY (analysis_date)
        AS
        WITH customer_daily_activity AS (
            SELECT 
                user_id_clean,
                DATE(event_timestamp_utc) as activity_date,
                COUNT(*) as total_events,
                COUNT(DISTINCT event_type) as unique_event_types,
                SUM(CASE WHEN event_type = 'purchase' THEN amount ELSE 0 END) as daily_purchase_amount,
                COUNT(CASE WHEN event_type = 'purchase' THEN 1 END) as purchase_count,
                FIRST_VALUE(event_timestamp_utc) OVER (
                    PARTITION BY user_id_clean, DATE(event_timestamp_utc) 
                    ORDER BY event_timestamp_utc
                ) as first_activity_time,
                LAST_VALUE(event_timestamp_utc) OVER (
                    PARTITION BY user_id_clean, DATE(event_timestamp_utc) 
                    ORDER BY event_timestamp_utc 
                    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
                ) as last_activity_time
            FROM {self.catalog}.silver.user_events
            WHERE is_high_quality = true
                AND event_timestamp_utc >= current_date() - interval 90 days
            GROUP BY user_id_clean, DATE(event_timestamp_utc)
        ),
        customer_metrics AS (
            SELECT 
                user_id_clean,
                activity_date,
                total_events,
                unique_event_types,
                daily_purchase_amount,
                purchase_count,
                UNIX_TIMESTAMP(last_activity_time) - UNIX_TIMESTAMP(first_activity_time) as session_duration_seconds,
                
                -- 過去30日間の行動パターン
                AVG(total_events) OVER (
                    PARTITION BY user_id_clean 
                    ORDER BY activity_date 
                    ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
                ) as avg_daily_events_30d,
                
                -- 購買パターン分析
                SUM(daily_purchase_amount) OVER (
                    PARTITION BY user_id_clean 
                    ORDER BY activity_date 
                    ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
                ) as total_purchase_amount_30d,
                
                -- エンゲージメントスコア
                (total_events * 0.3 + unique_event_types * 0.2 + purchase_count * 0.5) as engagement_score
            FROM customer_daily_activity
        )
        SELECT 
            *,
            current_date() as analysis_date,
            current_timestamp() as created_at
        FROM customer_metrics
        """
        
        self.spark.sql(customer_behavior_sql)
    
    def create_real_time_kpis(self):
        """リアルタイムKPIテーブル"""
        
        # リアルタイムKPI計算
        kpi_stream = self.spark.readStream \
            .format("delta") \
            .option("readChangeFeed", "true") \
            .table(f"{self.catalog}.silver.user_events") \
            .filter(col("_change_type") == "insert") \
            .withWatermark("event_timestamp_utc", "5 minutes") \
            .groupBy(
                window(col("event_timestamp_utc"), "1 minute"),
                col("event_type")
            ).agg(
                count("*").alias("event_count"),
                countDistinct("user_id_clean").alias("unique_users"),
                avg("amount").alias("avg_amount"),
                sum("amount").alias("total_amount")
            ).select(
                col("window.start").alias("window_start"),
                col("window.end").alias("window_end"),
                col("event_type"),
                col("event_count"),
                col("unique_users"),
                col("avg_amount"),
                col("total_amount"),
                current_timestamp().alias("processed_at")
            )
        
        # リアルタイムKPIテーブルに書き込み
        kpi_query = kpi_stream.writeStream \
            .format("delta") \
            .outputMode("append") \
            .option("checkpointLocation", "/tmp/checkpoints/realtime_kpis") \
            .toTable(f"{self.catalog}.{self.schema}.realtime_kpis")
        
        return kpi_query

# 使用例
gold_processor = GoldLayerProcessor()
gold_processor.create_business_aggregations()
```

## 🔄 イベント駆動アーキテクチャ

### 1. Event Sourcing パターン

#### イベントストア実装
```python
from pyspark.sql.types import *
import uuid
from datetime import datetime

class EventStore:
    def __init__(self, catalog="events", schema="store"):
        self.catalog = catalog
        self.schema = schema
        self.spark = SparkSession.getActiveSession()
        self.setup_event_store()
    
    def setup_event_store(self):
        """イベントストアテーブル設定"""
        
        event_store_ddl = f"""
        CREATE TABLE IF NOT EXISTS {self.catalog}.{self.schema}.events (
            event_id STRING NOT NULL,
            aggregate_id STRING NOT NULL,
            aggregate_type STRING NOT NULL,
            event_type STRING NOT NULL,
            event_version INTEGER NOT NULL,
            event_data MAP<STRING, STRING>,
            event_metadata MAP<STRING, STRING>,
            event_timestamp TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
        ) USING DELTA
        PARTITIONED BY (aggregate_type, DATE(event_timestamp))
        TBLPROPERTIES (
            'delta.enableChangeDataFeed' = 'true',
            'delta.autoOptimize.optimizeWrite' = 'true',
            'delta.autoOptimize.autoCompact' = 'true'
        )
        """
        
        self.spark.sql(event_store_ddl)
        
        # イベントストリームテーブル
        event_stream_ddl = f"""
        CREATE TABLE IF NOT EXISTS {self.catalog}.{self.schema}.event_stream (
            stream_position BIGINT,
            event_id STRING,
            aggregate_id STRING,
            aggregate_type STRING,
            event_type STRING,
            event_data MAP<STRING, STRING>,
            processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
        ) USING DELTA
        TBLPROPERTIES (
            'delta.enableChangeDataFeed' = 'true'
        )
        """
        
        self.spark.sql(event_stream_ddl)
    
    def append_event(self, aggregate_id, aggregate_type, event_type, event_data, metadata=None):
        """新しいイベントを追加"""
        
        event_id = str(uuid.uuid4())
        event_timestamp = datetime.now()
        
        # 最新バージョン取得
        current_version = self.spark.sql(f"""
            SELECT COALESCE(MAX(event_version), 0) as max_version
            FROM {self.catalog}.{self.schema}.events
            WHERE aggregate_id = '{aggregate_id}'
        """).collect()[0]['max_version']
        
        new_version = current_version + 1
        
        # イベント挿入
        event_df = self.spark.createDataFrame([{
            'event_id': event_id,
            'aggregate_id': aggregate_id,
            'aggregate_type': aggregate_type,
            'event_type': event_type,
            'event_version': new_version,
            'event_data': event_data or {},
            'event_metadata': metadata or {},
            'event_timestamp': event_timestamp
        }])
        
        event_df.write.mode("append").saveAsTable(f"{self.catalog}.{self.schema}.events")
        
        return event_id
    
    def get_aggregate_events(self, aggregate_id, from_version=1):
        """集約の全イベント取得"""
        
        return self.spark.sql(f"""
            SELECT *
            FROM {self.catalog}.{self.schema}.events
            WHERE aggregate_id = '{aggregate_id}'
                AND event_version >= {from_version}
            ORDER BY event_version
        """)
    
    def create_projection(self, projection_name, event_handler_func):
        """イベントプロジェクション作成"""
        
        # イベントストリーム読み込み
        events_stream = self.spark.readStream \
            .format("delta") \
            .option("readChangeFeed", "true") \
            .option("startingVersion", "latest") \
            .table(f"{self.catalog}.{self.schema}.events")
        
        # プロジェクション処理
        projection_stream = events_stream \
            .filter(col("_change_type") == "insert") \
            .select("*") \
            .writeStream \
            .foreachBatch(event_handler_func) \
            .outputMode("update") \
            .option("checkpointLocation", f"/tmp/checkpoints/projection_{projection_name}") \
            .start()
        
        return projection_stream

# 顧客集約の例
class CustomerAggregate:
    def __init__(self, event_store: EventStore):
        self.event_store = event_store
        self.aggregate_type = "customer"
    
    def register_customer(self, customer_id, email, name):
        """顧客登録イベント"""
        
        event_data = {
            'email': email,
            'name': name,
            'registration_date': datetime.now().isoformat()
        }
        
        return self.event_store.append_event(
            aggregate_id=customer_id,
            aggregate_type=self.aggregate_type,
            event_type="customer_registered",
            event_data=event_data
        )
    
    def update_customer_profile(self, customer_id, **updates):
        """顧客プロファイル更新イベント"""
        
        return self.event_store.append_event(
            aggregate_id=customer_id,
            aggregate_type=self.aggregate_type,
            event_type="customer_profile_updated",
            event_data=updates
        )
    
    def reconstruct_customer_state(self, customer_id):
        """イベントから顧客状態を再構築"""
        
        events = self.event_store.get_aggregate_events(customer_id).collect()
        
        customer_state = {}
        
        for event in events:
            if event['event_type'] == 'customer_registered':
                customer_state.update(event['event_data'])
            elif event['event_type'] == 'customer_profile_updated':
                customer_state.update(event['event_data'])
        
        return customer_state
```

### 2. CQRS (Command Query Responsibility Segregation)

#### コマンド・クエリ分離実装
```python
class CQRSArchitecture:
    def __init__(self, catalog="cqrs"):
        self.catalog = catalog
        self.spark = SparkSession.getActiveSession()
        self.event_store = EventStore()
        
    def setup_command_side(self):
        """コマンド側（書き込み）セットアップ"""
        
        # コマンドハンドラー
        command_handlers = {
            'create_order': self.handle_create_order,
            'update_order': self.handle_update_order,
            'cancel_order': self.handle_cancel_order
        }
        
        return command_handlers
    
    def setup_query_side(self):
        """クエリ側（読み込み）セットアップ"""
        
        # 読み取り専用ビューの作成
        order_summary_view = f"""
        CREATE OR REPLACE VIEW {self.catalog}.query.order_summary AS
        SELECT 
            order_id,
            customer_id,
            order_status,
            total_amount,
            created_date,
            last_updated,
            items_count,
            shipping_address
        FROM {self.catalog}.projections.order_read_model
        WHERE is_active = true
        """
        
        customer_orders_view = f"""
        CREATE OR REPLACE VIEW {self.catalog}.query.customer_orders AS
        SELECT 
            customer_id,
            COUNT(*) as total_orders,
            SUM(total_amount) as total_spent,
            AVG(total_amount) as avg_order_value,
            MAX(created_date) as last_order_date,
            COUNT(CASE WHEN order_status = 'completed' THEN 1 END) as completed_orders
        FROM {self.catalog}.projections.order_read_model
        WHERE is_active = true
        GROUP BY customer_id
        """
        
        self.spark.sql(order_summary_view)
        self.spark.sql(customer_orders_view)
    
    def handle_create_order(self, command_data):
        """注文作成コマンドハンドラー"""
        
        order_id = command_data['order_id']
        customer_id = command_data['customer_id']
        items = command_data['items']
        
        # ビジネスロジック検証
        if not self.validate_customer(customer_id):
            raise ValueError("Invalid customer")
        
        if not self.validate_inventory(items):
            raise ValueError("Insufficient inventory")
        
        # イベント生成
        event_data = {
            'order_id': order_id,
            'customer_id': customer_id,
            'items': str(items),  # JSON文字列として保存
            'total_amount': str(sum(item['price'] * item['quantity'] for item in items)),
            'order_status': 'created'
        }
        
        return self.event_store.append_event(
            aggregate_id=order_id,
            aggregate_type="order",
            event_type="order_created",
            event_data=event_data
        )
    
    def create_read_model_projections(self):
        """読み取りモデルプロジェクション作成"""
        
        def update_order_projection(batch_df, batch_id):
            """注文プロジェクション更新"""
            
            # 注文イベントのみフィルタ
            order_events = batch_df.filter(col("aggregate_type") == "order")
            
            for row in order_events.collect():
                event_type = row['event_type']
                event_data = row['event_data']
                order_id = row['aggregate_id']
                
                if event_type == 'order_created':
                    # 新規注文レコード挿入
                    self.spark.sql(f"""
                        INSERT INTO {self.catalog}.projections.order_read_model
                        VALUES (
                            '{order_id}',
                            '{event_data['customer_id']}',
                            '{event_data['order_status']}',
                            {event_data['total_amount']},
                            current_timestamp(),
                            current_timestamp(),
                            {len(eval(event_data['items']))},
                            null,
                            true
                        )
                    """)
                
                elif event_type == 'order_updated':
                    # 既存注文更新
                    self.spark.sql(f"""
                        UPDATE {self.catalog}.projections.order_read_model
                        SET 
                            order_status = '{event_data.get('order_status', 'unknown')}',
                            last_updated = current_timestamp()
                        WHERE order_id = '{order_id}'
                    """)
        
        # プロジェクション実行
        projection_query = self.event_store.create_projection(
            "order_read_model", 
            update_order_projection
        )
        
        return projection_query
```

## 🏗️ マイクロサービス統合パターン

### 1. Saga パターン実装

#### 分散トランザクション管理
```python
from enum import Enum
from typing import List, Dict, Any
import json

class SagaStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    COMPENSATING = "compensating"
    COMPENSATED = "compensated"

class SagaOrchestrator:
    def __init__(self, catalog="sagas", schema="orchestration"):
        self.catalog = catalog
        self.schema = schema
        self.spark = SparkSession.getActiveSession()
        self.setup_saga_tables()
    
    def setup_saga_tables(self):
        """Sagaテーブル設定"""
        
        saga_instances_ddl = f"""
        CREATE TABLE IF NOT EXISTS {self.catalog}.{self.schema}.saga_instances (
            saga_id STRING NOT NULL,
            saga_type STRING NOT NULL,
            status STRING NOT NULL,
            current_step INTEGER DEFAULT 0,
            saga_data MAP<STRING, STRING>,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
            completed_at TIMESTAMP,
            error_message STRING
        ) USING DELTA
        PARTITIONED BY (saga_type, DATE(started_at))
        """
        
        saga_steps_ddl = f"""
        CREATE TABLE IF NOT EXISTS {self.catalog}.{self.schema}.saga_steps (
            saga_id STRING NOT NULL,
            step_number INTEGER NOT NULL,
            step_name STRING NOT NULL,
            service_name STRING NOT NULL,
            action_type STRING NOT NULL,  -- 'action' or 'compensation'
            status STRING NOT NULL,
            request_data MAP<STRING, STRING>,
            response_data MAP<STRING, STRING>,
            executed_at TIMESTAMP,
            error_message STRING
        ) USING DELTA
        PARTITIONED BY (service_name, DATE(executed_at))
        """
        
        self.spark.sql(saga_instances_ddl)
        self.spark.sql(saga_steps_ddl)
    
    def define_order_processing_saga(self):
        """注文処理Saga定義"""
        
        saga_definition = {
            'saga_type': 'order_processing',
            'steps': [
                {
                    'step_number': 1,
                    'step_name': 'validate_order',
                    'service_name': 'order_service',
                    'action': 'validate_order',
                    'compensation': 'invalidate_order'
                },
                {
                    'step_number': 2,
                    'step_name': 'reserve_inventory',
                    'service_name': 'inventory_service',
                    'action': 'reserve_items',
                    'compensation': 'release_items'
                },
                {
                    'step_number': 3,
                    'step_name': 'process_payment',
                    'service_name': 'payment_service',
                    'action': 'charge_payment',
                    'compensation': 'refund_payment'
                },
                {
                    'step_number': 4,
                    'step_name': 'confirm_order',
                    'service_name': 'order_service',
                    'action': 'confirm_order',
                    'compensation': 'cancel_order'
                }
            ]
        }
        
        return saga_definition
    
    def start_saga(self, saga_type: str, saga_data: Dict[str, Any]) -> str:
        """Saga開始"""
        
        saga_id = str(uuid.uuid4())
        
        # Sagaインスタンス作成
        saga_instance = self.spark.createDataFrame([{
            'saga_id': saga_id,
            'saga_type': saga_type,
            'status': SagaStatus.PENDING.value,
            'current_step': 0,
            'saga_data': saga_data
        }])
        
        saga_instance.write.mode("append").saveAsTable(f"{self.catalog}.{self.schema}.saga_instances")
        
        # Saga実行開始
        self.execute_saga(saga_id)
        
        return saga_id
    
    def execute_saga(self, saga_id: str):
        """Saga実行"""
        
        # Sagaインスタンス取得
        saga_instance = self.spark.sql(f"""
            SELECT *
            FROM {self.catalog}.{self.schema}.saga_instances
            WHERE saga_id = '{saga_id}'
        """).collect()[0]
        
        saga_type = saga_instance['saga_type']
        current_step = saga_instance['current_step']
        
        # Saga定義取得
        if saga_type == 'order_processing':
            saga_definition = self.define_order_processing_saga()
        else:
            raise ValueError(f"Unknown saga type: {saga_type}")
        
        # 次のステップ実行
        if current_step < len(saga_definition['steps']):
            next_step = saga_definition['steps'][current_step]
            success = self.execute_step(saga_id, next_step, saga_instance['saga_data'])
            
            if success:
                # 次のステップに進む
                self.update_saga_progress(saga_id, current_step + 1)
                
                # 全ステップ完了チェック
                if current_step + 1 >= len(saga_definition['steps']):
                    self.complete_saga(saga_id)
                else:
                    # 次のステップを実行
                    self.execute_saga(saga_id)
            else:
                # 補償開始
                self.start_compensation(saga_id, saga_definition, current_step)
    
    def execute_step(self, saga_id: str, step_definition: Dict, saga_data: Dict) -> bool:
        """ステップ実行"""
        
        try:
            # サービス呼び出しのシミュレーション
            # 実際の実装では、マイクロサービスのAPIを呼び出す
            service_response = self.call_microservice(
                step_definition['service_name'],
                step_definition['action'],
                saga_data
            )
            
            # ステップ結果記録
            step_record = self.spark.createDataFrame([{
                'saga_id': saga_id,
                'step_number': step_definition['step_number'],
                'step_name': step_definition['step_name'],
                'service_name': step_definition['service_name'],
                'action_type': 'action',
                'status': 'completed',
                'request_data': saga_data,
                'response_data': service_response,
                'executed_at': datetime.now()
            }])
            
            step_record.write.mode("append").saveAsTable(f"{self.catalog}.{self.schema}.saga_steps")
            
            return service_response.get('success', False)
            
        except Exception as e:
            # エラー記録
            error_record = self.spark.createDataFrame([{
                'saga_id': saga_id,
                'step_number': step_definition['step_number'],
                'step_name': step_definition['step_name'],
                'service_name': step_definition['service_name'],
                'action_type': 'action',
                'status': 'failed',
                'request_data': saga_data,
                'response_data': {},
                'executed_at': datetime.now(),
                'error_message': str(e)
            }])
            
            error_record.write.mode("append").saveAsTable(f"{self.catalog}.{self.schema}.saga_steps")
            
            return False
    
    def call_microservice(self, service_name: str, action: str, data: Dict) -> Dict:
        """マイクロサービス呼び出し（シミュレーション）"""
        
        # 実際の実装では、REST API、gRPC、またはメッセージキューを使用
        simulated_responses = {
            'order_service': {
                'validate_order': {'success': True, 'order_valid': True},
                'confirm_order': {'success': True, 'order_confirmed': True}
            },
            'inventory_service': {
                'reserve_items': {'success': True, 'items_reserved': True},
                'release_items': {'success': True, 'items_released': True}
            },
            'payment_service': {
                'charge_payment': {'success': True, 'payment_id': 'pay_123'},
                'refund_payment': {'success': True, 'refund_id': 'ref_123'}
            }
        }
        
        return simulated_responses.get(service_name, {}).get(action, {'success': False})

# 使用例
saga_orchestrator = SagaOrchestrator()
order_data = {
    'order_id': 'order_123',
    'customer_id': 'customer_456',
    'items': '[{"product_id": "prod_1", "quantity": 2, "price": 10.00}]',
    'total_amount': '20.00'
}
saga_id = saga_orchestrator.start_saga('order_processing', order_data)
```

## 📊 リアルタイム処理パターン

### 1. Kappa Architecture 実装

#### ストリーミング中心アーキテクチャ
```python
class KappaArchitecture:
    def __init__(self, catalog="realtime", schema="processing"):
        self.catalog = catalog
        self.schema = schema
        self.spark = SparkSession.getActiveSession()
    
    def setup_streaming_pipeline(self):
        """ストリーミングパイプライン設定"""
        
        # 1. 生イベント取り込み
        raw_events_stream = self.spark.readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", "kafka-broker:9092") \
            .option("subscribe", "raw-events") \
            .option("startingOffsets", "latest") \
            .load()
        
        # 2. イベント解析とルーティング
        parsed_events = raw_events_stream.select(
            from_json(col("value").cast("string"), self.get_event_schema()).alias("event"),
            col("timestamp").alias("kafka_timestamp"),
            col("offset"),
            col("partition")
        ).select(
            col("event.*"),
            col("kafka_timestamp"),
            col("offset"),
            col("partition")
        )
        
        # 3. 複数の処理パスに分岐
        self.create_real_time_aggregations(parsed_events)
        self.create_anomaly_detection(parsed_events)
        self.create_user_session_tracking(parsed_events)
        
    def create_real_time_aggregations(self, events_stream):
        """リアルタイム集約処理"""
        
        # 分単位集約
        minute_aggregations = events_stream \
            .withWatermark("event_timestamp", "5 minutes") \
            .groupBy(
                window(col("event_timestamp"), "1 minute"),
                col("event_type"),
                col("user_segment")
            ).agg(
                count("*").alias("event_count"),
                countDistinct("user_id").alias("unique_users"),
                avg("amount").alias("avg_amount"),
                sum("amount").alias("total_amount"),
                collect_list("event_id").alias("event_ids")
            ).select(
                col("window.start").alias("window_start"),
                col("window.end").alias("window_end"),
                col("event_type"),
                col("user_segment"),
                col("event_count"),
                col("unique_users"),
                col("avg_amount"),
                col("total_amount"),
                size(col("event_ids")).alias("events_in_window"),
                current_timestamp().alias("processed_at")
            )
        
        # 集約結果をDeltaテーブルとKafkaに出力
        minute_agg_query = minute_aggregations.writeStream \
            .foreachBatch(self.write_to_multiple_sinks) \
            .outputMode("append") \
            .option("checkpointLocation", "/tmp/checkpoints/minute_aggregations") \
            .trigger(processingTime="30 seconds") \
            .start()
        
        return minute_agg_query
    
    def write_to_multiple_sinks(self, batch_df, batch_id):
        """複数の出力先への書き込み"""
        
        # 1. Delta テーブルに保存（長期保存・分析用）
        batch_df.write \
            .format("delta") \
            .mode("append") \
            .saveAsTable(f"{self.catalog}.{self.schema}.minute_aggregations")
        
        # 2. Kafka に送信（ダウンストリーム処理用）
        batch_df.select(
            to_json(struct("*")).alias("value"),
            col("event_type").alias("key")
        ).write \
            .format("kafka") \
            .option("kafka.bootstrap.servers", "kafka-broker:9092") \
            .option("topic", "aggregated-metrics") \
            .mode("append") \
            .save()
        
        # 3. Redis に保存（リアルタイムダッシュボード用）
        # 実装省略（Redis connector使用）
    
    def create_anomaly_detection(self, events_stream):
        """リアルタイム異常検知"""
        
        # 統計的異常検知
        anomaly_detection = events_stream \
            .filter(col("event_type") == "purchase") \
            .withWatermark("event_timestamp", "10 minutes") \
            .groupBy(
                window(col("event_timestamp"), "5 minutes", "1 minute"),
                col("user_id")
            ).agg(
                count("*").alias("purchase_count"),
                sum("amount").alias("total_amount"),
                avg("amount").alias("avg_amount"),
                stddev("amount").alias("stddev_amount")
            ).withColumn(
                "is_anomaly",
                when(
                    (col("purchase_count") > 10) |  # 異常な購入頻度
                    (col("total_amount") > 1000) |  # 異常な購入金額
                    (col("avg_amount") > col("stddev_amount") * 3), True  # 統計的異常
                ).otherwise(False)
            ).filter(col("is_anomaly") == True)
        
        # 異常アラート送信
        anomaly_query = anomaly_detection.writeStream \
            .foreachBatch(self.send_anomaly_alerts) \
            .outputMode("append") \
            .option("checkpointLocation", "/tmp/checkpoints/anomaly_detection") \
            .trigger(processingTime="1 minute") \
            .start()
        
        return anomaly_query
    
    def send_anomaly_alerts(self, batch_df, batch_id):
        """異常アラート送信"""
        
        for row in batch_df.collect():
            alert_data = {
                'alert_type': 'purchase_anomaly',
                'user_id': row['user_id'],
                'window_start': row['window']['start'].isoformat(),
                'window_end': row['window']['end'].isoformat(),
                'purchase_count': row['purchase_count'],
                'total_amount': float(row['total_amount']),
                'severity': 'high' if row['total_amount'] > 1000 else 'medium'
            }
            
            # アラートテーブルに保存
            alert_df = self.spark.createDataFrame([alert_data])
            alert_df.write.mode("append").saveAsTable(f"{self.catalog}.{self.schema}.anomaly_alerts")
            
            # 外部アラートシステムに送信（Slack、PagerDuty等）
            # 実装省略

# 使用例
kappa_arch = KappaArchitecture()
kappa_arch.setup_streaming_pipeline()
```

## 🔗 関連リソース

### 内部リンク
- [[01_General_Investigation_Methods]] - 一般調査手法
- [[02_Databricks_Investigation_Methods]] - Databricks調査手法  
- [[03_Snowflake_Investigation_Methods]] - Snowflake調査手法
- [[Databricks_Data_Intelligence_Platform_2025]] - Databricks詳細
- [[Snowflake_AI_Data_Cloud_Architecture_2025]] - Snowflake詳細

### 外部リンク
- [Medallion Architecture Best Practices](https://www.databricks.com/glossary/medallion-architecture)
- [Event Sourcing Pattern](https://microservices.io/patterns/data/event-sourcing.html)
- [CQRS Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)

---

**実装難易度**: Advanced  
**推奨チーム**: Data Engineering + Software Architecture  
**想定実装期間**: 8-16週間  
**運用成熟度**: 6-12ヶ月 
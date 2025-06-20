---
tags:
  - tech/spark
  - platform/databricks
  - performance-tuning
  - optimization
  - domain/data-platform
created: 2025-06-20
modified: 2025-06-20
difficulty: "Advanced"
implementation_status: "Production Ready"
version: "2025"
---

# Spark高度な性能チューニング（2025年版）

## 🎯 概要

Apache Sparkの性能最適化は、適切な設定、クエリ最適化、リソース管理の組み合わせです。2025年のDatabricks環境では、Photon Engine、Adaptive Query Execution (AQE)、Dynamic Partition Pruningなど最新の最適化機能を活用して、大幅な性能向上を実現できます。

## ⚡ Photon Engine最適化

### 1. Photon設定と有効化

#### 基本設定
```python
from pyspark.sql import SparkSession
from pyspark.conf import SparkConf

# Photon最適化設定
def create_photon_optimized_spark():
    """Photon最適化Sparkセッション作成"""
    
    conf = SparkConf() \
        .set("spark.databricks.photon.enabled", "true") \
        .set("spark.databricks.photon.mode", "enhanced") \
        .set("spark.databricks.adaptive.enabled", "true") \
        .set("spark.databricks.adaptive.coalescePartitions.enabled", "true") \
        .set("spark.databricks.adaptive.advisoryPartitionSizeInBytes", "128MB") \
        .set("spark.sql.adaptive.skewJoin.enabled", "true") \
        .set("spark.sql.adaptive.localShuffleReader.enabled", "true")
    
    spark = SparkSession.builder \
        .appName("PhotonOptimizedApp") \
        .config(conf=conf) \
        .getOrCreate()
    
    return spark

spark = create_photon_optimized_spark()
```

#### Photon互換性チェック
```python
def check_photon_compatibility(df):
    """PhotonエンジンサポートチェックD"""
    
    # クエリプランの確認
    explain_output = df.explain(extended=True)
    
    # Photon対応操作の確認
    photon_supported_ops = [
        "Filter", "Project", "Aggregate", "Sort", "Exchange",
        "BroadcastHashJoin", "SortMergeJoin", "HashAggregate"
    ]
    
    compatibility_report = {
        "photon_supported": True,
        "unsupported_operations": [],
        "optimization_suggestions": []
    }
    
    # プランの分析（簡略化版）
    plan_lines = str(explain_output).split('\n')
    for line in plan_lines:
        if any(unsupported in line for unsupported in ["UDF", "Python", "CustomFunction"]):
            compatibility_report["photon_supported"] = False
            compatibility_report["unsupported_operations"].append(line.strip())
    
    # 最適化提案
    if not compatibility_report["photon_supported"]:
        compatibility_report["optimization_suggestions"].extend([
            "Replace UDFs with built-in Spark functions",
            "Convert Python UDFs to Scala UDFs or SQL expressions",
            "Use vectorized operations instead of row-by-row processing"
        ])
    
    return compatibility_report

# 使用例
sales_df = spark.table("sales_data")
compatibility = check_photon_compatibility(sales_df)
print(f"Photon Compatible: {compatibility['photon_supported']}")
```

### 2. Photon最適化技法

#### ベクトル化操作の活用
```python
from pyspark.sql.functions import *
from pyspark.sql.types import *

def vectorized_data_processing(df):
    """ベクトル化操作による高速化"""
    
    # ❌ 非効率: UDFを使用
    # def calculate_discount(amount):
    #     if amount > 1000:
    #         return amount * 0.1
    #     elif amount > 500:
    #         return amount * 0.05
    #     else:
    #         return 0
    # 
    # discount_udf = udf(calculate_discount, DoubleType())
    # result = df.withColumn("discount", discount_udf(col("amount")))
    
    # ✅ 効率的: ベクトル化された条件分岐
    result = df.withColumn(
        "discount",
        when(col("amount") > 1000, col("amount") * 0.1)
        .when(col("amount") > 500, col("amount") * 0.05)
        .otherwise(0)
    ).withColumn(
        "final_amount",
        col("amount") - col("discount")
    )
    
    return result

# 集約操作の最適化
def optimized_aggregations(df):
    """Photon最適化された集約操作"""
    
    # 複数の集約を一度に実行
    result = df.groupBy("region", "product_category") \
        .agg(
            count("*").alias("order_count"),
            sum("amount").alias("total_sales"),
            avg("amount").alias("avg_order_value"),
            min("order_date").alias("first_order"),
            max("order_date").alias("last_order"),
            countDistinct("customer_id").alias("unique_customers"),
            # パーセンタイル計算（Photon最適化済み）
            expr("percentile_approx(amount, 0.5)").alias("median_amount"),
            expr("percentile_approx(amount, array(0.25, 0.75))").alias("quartiles")
        )
    
    return result

# 使用例
optimized_df = vectorized_data_processing(sales_df)
aggregated_df = optimized_aggregations(sales_df)
```

## 🧠 Adaptive Query Execution (AQE)

### 1. AQE詳細設定

#### 高度なAQE設定
```python
def configure_advanced_aqe():
    """高度なAQE設定"""
    
    # AQE詳細パラメータ
    spark.conf.set("spark.sql.adaptive.enabled", "true")
    spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
    spark.conf.set("spark.sql.adaptive.coalescePartitions.minPartitionNum", "1")
    spark.conf.set("spark.sql.adaptive.coalescePartitions.initialPartitionNum", "200")
    
    # パーティションサイズの動的調整
    spark.conf.set("spark.sql.adaptive.advisoryPartitionSizeInBytes", "128MB")
    spark.conf.set("spark.sql.adaptive.coalescePartitions.minPartitionSize", "20MB")
    
    # スキュー結合最適化
    spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
    spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor", "5")
    spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "256MB")
    
    # ローカルシャッフル最適化
    spark.conf.set("spark.sql.adaptive.localShuffleReader.enabled", "true")
    
    # 実行時統計収集
    spark.conf.set("spark.sql.adaptive.optimizer.excludedRules", "")
    
    print("Advanced AQE configuration applied")

configure_advanced_aqe()
```

#### AQE効果の測定
```python
import time
import json

def measure_aqe_performance(query_func, iterations=3):
    """AQE性能測定"""
    
    results = {"with_aqe": [], "without_aqe": []}
    
    # AQE有効時の測定
    spark.conf.set("spark.sql.adaptive.enabled", "true")
    for i in range(iterations):
        start_time = time.time()
        df = query_func()
        df.count()  # アクション実行
        execution_time = time.time() - start_time
        results["with_aqe"].append(execution_time)
    
    # AQE無効時の測定
    spark.conf.set("spark.sql.adaptive.enabled", "false")
    for i in range(iterations):
        start_time = time.time()
        df = query_func()
        df.count()  # アクション実行
        execution_time = time.time() - start_time
        results["without_aqe"].append(execution_time)
    
    # AQE再有効化
    spark.conf.set("spark.sql.adaptive.enabled", "true")
    
    # 結果分析
    avg_with_aqe = sum(results["with_aqe"]) / len(results["with_aqe"])
    avg_without_aqe = sum(results["without_aqe"]) / len(results["without_aqe"])
    
    improvement = ((avg_without_aqe - avg_with_aqe) / avg_without_aqe) * 100
    
    performance_report = {
        "avg_time_with_aqe": avg_with_aqe,
        "avg_time_without_aqe": avg_without_aqe,
        "improvement_percentage": improvement,
        "raw_results": results
    }
    
    return performance_report

# テストクエリ例
def complex_join_query():
    """複雑な結合クエリ"""
    large_table = spark.table("large_sales_data")
    dimension_table = spark.table("customer_dimension")
    
    result = large_table.join(
        dimension_table,
        large_table.customer_id == dimension_table.customer_id,
        "inner"
    ).groupBy("region", "customer_segment") \
     .agg(sum("amount").alias("total_sales"))
    
    return result

# 性能測定実行
# performance_report = measure_aqe_performance(complex_join_query)
```

### 2. 動的パーティション最適化

#### パーティション数の自動調整
```python
def dynamic_partition_optimization(df, target_partition_size_mb=128):
    """動的パーティション最適化"""
    
    # データサイズ推定
    df.cache()  # キャッシュして正確なサイズを取得
    
    # パーティション数計算
    total_size_bytes = df.rdd.map(lambda row: len(str(row))).sum()
    total_size_mb = total_size_bytes / (1024 * 1024)
    optimal_partitions = max(1, int(total_size_mb / target_partition_size_mb))
    
    print(f"Data size: {total_size_mb:.2f} MB")
    print(f"Current partitions: {df.rdd.getNumPartitions()}")
    print(f"Optimal partitions: {optimal_partitions}")
    
    # パーティション調整
    if df.rdd.getNumPartitions() > optimal_partitions * 2:
        # パーティション数が多すぎる場合は結合
        optimized_df = df.coalesce(optimal_partitions)
    elif df.rdd.getNumPartitions() < optimal_partitions:
        # パーティション数が少なすぎる場合は分割
        optimized_df = df.repartition(optimal_partitions)
    else:
        optimized_df = df
    
    df.unpersist()  # キャッシュクリア
    
    return optimized_df

def analyze_partition_distribution(df):
    """パーティション分散分析"""
    
    # 各パーティションのサイズ分析
    def partition_size(iterator):
        size = sum(len(str(row)) for row in iterator)
        return [size]
    
    partition_sizes = df.rdd.mapPartitions(partition_size).collect()
    
    analysis = {
        "num_partitions": len(partition_sizes),
        "total_size_bytes": sum(partition_sizes),
        "avg_partition_size_mb": (sum(partition_sizes) / len(partition_sizes)) / (1024 * 1024),
        "min_partition_size_mb": min(partition_sizes) / (1024 * 1024),
        "max_partition_size_mb": max(partition_sizes) / (1024 * 1024),
        "size_variance": {
            "coefficient_of_variation": (
                (sum((s - sum(partition_sizes) / len(partition_sizes)) ** 2 for s in partition_sizes) / len(partition_sizes)) ** 0.5
            ) / (sum(partition_sizes) / len(partition_sizes))
        }
    }
    
    # スキュー判定
    analysis["has_skew"] = analysis["size_variance"]["coefficient_of_variation"] > 0.5
    
    return analysis
```

## 🔧 メモリとリソース最適化

### 1. メモリ設定の最適化

#### 動的メモリ配分
```python
def optimize_spark_memory_config(data_characteristics):
    """データ特性に基づくメモリ最適化"""
    
    # データ特性分析
    is_cache_heavy = data_characteristics.get("cache_heavy", False)
    has_large_shuffles = data_characteristics.get("large_shuffles", False)
    uses_broadcasting = data_characteristics.get("uses_broadcasting", False)
    
    memory_configs = {}
    
    if is_cache_heavy:
        # キャッシュ重要な処理
        memory_configs.update({
            "spark.sql.execution.arrow.pyspark.enabled": "true",
            "spark.sql.execution.arrow.maxRecordsPerBatch": "10000",
            "spark.serializer": "org.apache.spark.serializer.KryoSerializer",
            "spark.sql.adaptive.enabled": "true",
            "spark.sql.adaptive.coalescePartitions.enabled": "true"
        })
    
    if has_large_shuffles:
        # 大きなシャッフル処理
        memory_configs.update({
            "spark.sql.shuffle.partitions": "200",
            "spark.sql.adaptive.shuffle.targetPostShuffleInputSize": "128MB",
            "spark.sql.adaptive.skewJoin.enabled": "true"
        })
    
    if uses_broadcasting:
        # ブロードキャスト最適化
        memory_configs.update({
            "spark.sql.autoBroadcastJoinThreshold": "200MB",
            "spark.sql.broadcastTimeout": "600"
        })
    
    # 設定適用
    for key, value in memory_configs.items():
        spark.conf.set(key, value)
    
    return memory_configs

# 使用例
data_profile = {
    "cache_heavy": True,
    "large_shuffles": True,
    "uses_broadcasting": False
}
applied_configs = optimize_spark_memory_config(data_profile)
```

#### メモリ使用量監視
```python
def monitor_memory_usage():
    """リアルタイムメモリ監視"""
    
    # Spark UI情報取得
    sc = spark.sparkContext
    status_tracker = sc.statusTracker()
    
    # Executor情報
    executor_infos = status_tracker.getExecutorInfos()
    
    memory_stats = {
        "total_executors": len(executor_infos),
        "total_memory_mb": sum(info.maxMemory for info in executor_infos) / (1024 * 1024),
        "total_memory_used_mb": sum(info.memoryUsed for info in executor_infos) / (1024 * 1024),
        "executor_details": []
    }
    
    for info in executor_infos:
        executor_detail = {
            "executor_id": info.executorId,
            "host": info.host,
            "max_memory_mb": info.maxMemory / (1024 * 1024),
            "memory_used_mb": info.memoryUsed / (1024 * 1024),
            "memory_utilization": (info.memoryUsed / info.maxMemory) * 100 if info.maxMemory > 0 else 0,
            "disk_used_mb": info.diskUsed / (1024 * 1024),
            "active_tasks": info.activeTasks,
            "total_tasks": info.totalTasks
        }
        memory_stats["executor_details"].append(executor_detail)
    
    # 全体使用率
    memory_stats["overall_utilization"] = (
        memory_stats["total_memory_used_mb"] / memory_stats["total_memory_mb"] * 100
        if memory_stats["total_memory_mb"] > 0 else 0
    )
    
    return memory_stats

def memory_pressure_alert(threshold_percent=80):
    """メモリ圧迫アラート"""
    
    memory_stats = monitor_memory_usage()
    
    alerts = []
    
    # 全体メモリ使用率チェック
    if memory_stats["overall_utilization"] > threshold_percent:
        alerts.append({
            "type": "high_overall_memory_usage",
            "severity": "warning",
            "message": f"Overall memory usage: {memory_stats['overall_utilization']:.1f}%"
        })
    
    # 個別Executor チェック
    for executor in memory_stats["executor_details"]:
        if executor["memory_utilization"] > threshold_percent:
            alerts.append({
                "type": "high_executor_memory_usage",
                "severity": "warning",
                "executor_id": executor["executor_id"],
                "host": executor["host"],
                "utilization": executor["memory_utilization"],
                "message": f"Executor {executor['executor_id']} memory usage: {executor['memory_utilization']:.1f}%"
            })
    
    return alerts

# 監視実行
memory_status = monitor_memory_usage()
alerts = memory_pressure_alert()
```

### 2. I/O最適化

#### ファイル形式とコーデック最適化
```python
def optimize_file_operations():
    """ファイル操作最適化設定"""
    
    # Delta Lake最適化設定
    spark.conf.set("spark.databricks.delta.optimizeWrite.enabled", "true")
    spark.conf.set("spark.databricks.delta.autoCompact.enabled", "true")
    spark.conf.set("spark.databricks.delta.autoCompact.minNumFiles", "50")
    
    # Parquet最適化
    spark.conf.set("spark.sql.parquet.compression.codec", "snappy")
    spark.conf.set("spark.sql.parquet.mergeSchema", "false")
    spark.conf.set("spark.sql.parquet.filterPushdown", "true")
    spark.conf.set("spark.sql.parquet.recordLevelFilter.enabled", "true")
    
    # I/O最適化
    spark.conf.set("spark.sql.files.maxPartitionBytes", "128MB")
    spark.conf.set("spark.sql.files.openCostInBytes", "4MB")
    
    print("File I/O optimization settings applied")

def benchmark_file_formats(df, base_path):
    """ファイル形式別性能ベンチマーク"""
    
    formats_to_test = ["parquet", "delta", "orc"]
    results = {}
    
    for fmt in formats_to_test:
        file_path = f"{base_path}/{fmt}_test"
        
        # 書き込み性能測定
        start_time = time.time()
        if fmt == "delta":
            df.write.format("delta").mode("overwrite").save(file_path)
        else:
            df.write.format(fmt).mode("overwrite").save(file_path)
        write_time = time.time() - start_time
        
        # 読み込み性能測定
        start_time = time.time()
        if fmt == "delta":
            read_df = spark.read.format("delta").load(file_path)
        else:
            read_df = spark.read.format(fmt).load(file_path)
        read_df.count()  # アクション実行
        read_time = time.time() - start_time
        
        # ファイルサイズ取得
        file_info = spark.sql(f"DESCRIBE DETAIL '{file_path}'").collect()
        file_size_mb = file_info[0]["sizeInBytes"] / (1024 * 1024) if file_info else 0
        
        results[fmt] = {
            "write_time_seconds": write_time,
            "read_time_seconds": read_time,
            "file_size_mb": file_size_mb,
            "compression_ratio": df.count() / file_size_mb if file_size_mb > 0 else 0
        }
    
    return results

optimize_file_operations()
```

## 🔍 JOIN最適化

### 1. 高度なJOIN戦略

#### 自動JOIN最適化
```python
def optimize_join_strategy(left_df, right_df, join_keys, join_type="inner"):
    """JOIN戦略自動最適化"""
    
    # データサイズ推定
    left_count = left_df.count()
    right_count = right_df.count()
    
    # カーディナリティ推定
    left_cardinality = left_df.select(join_keys).distinct().count()
    right_cardinality = right_df.select(join_keys).distinct().count()
    
    join_stats = {
        "left_table_size": left_count,
        "right_table_size": right_count,
        "left_key_cardinality": left_cardinality,
        "right_key_cardinality": right_cardinality,
        "size_ratio": left_count / right_count if right_count > 0 else float('inf')
    }
    
    # JOIN戦略決定
    if min(left_count, right_count) < 10000:
        # 小さなテーブルはブロードキャスト
        strategy = "broadcast"
        if left_count < right_count:
            optimized_result = right_df.join(broadcast(left_df), join_keys, join_type)
        else:
            optimized_result = left_df.join(broadcast(right_df), join_keys, join_type)
    
    elif abs(left_cardinality - right_cardinality) / max(left_cardinality, right_cardinality) > 0.8:
        # カーディナリティが大きく異なる場合は、bucketed join
        strategy = "bucketed"
        # バケット数を最適化
        bucket_count = min(200, max(left_cardinality, right_cardinality) // 1000)
        optimized_result = left_df.join(right_df, join_keys, join_type)
    
    else:
        # 標準のsort-merge join
        strategy = "sort_merge"
        optimized_result = left_df.join(right_df, join_keys, join_type)
    
    join_stats["recommended_strategy"] = strategy
    
    return optimized_result, join_stats

def detect_join_skew(df, join_key):
    """JOIN スキュー検出"""
    
    # キー分布分析
    key_distribution = df.groupBy(join_key) \
        .count() \
        .orderBy(desc("count"))
    
    key_stats = key_distribution.agg(
        count("*").alias("unique_keys"),
        avg("count").alias("avg_count"),
        max("count").alias("max_count"),
        min("count").alias("min_count"),
        stddev("count").alias("stddev_count")
    ).collect()[0]
    
    # スキュー判定
    skew_ratio = key_stats["max_count"] / key_stats["avg_count"] if key_stats["avg_count"] > 0 else 0
    is_skewed = skew_ratio > 5  # 最大値が平均の5倍以上
    
    skew_analysis = {
        "is_skewed": is_skewed,
        "skew_ratio": skew_ratio,
        "unique_keys": key_stats["unique_keys"],
        "max_count": key_stats["max_count"],
        "avg_count": key_stats["avg_count"],
        "coefficient_of_variation": key_stats["stddev_count"] / key_stats["avg_count"] if key_stats["avg_count"] > 0 else 0
    }
    
    if is_skewed:
        # スキューしたキーの特定
        skewed_keys = key_distribution.filter(col("count") > key_stats["avg_count"] * 3).collect()
        skew_analysis["skewed_keys"] = [(row[join_key], row["count"]) for row in skewed_keys[:10]]
    
    return skew_analysis
```

### 2. スキュー対応JOIN

#### サルト技法によるスキュー対応
```python
from pyspark.sql.functions import rand, floor, lit

def salted_join(left_df, right_df, join_key, salt_buckets=10):
    """サルト技法によるスキュー対応JOIN"""
    
    # サルト値追加
    salted_left = left_df.withColumn(
        "salt", 
        floor(rand() * salt_buckets).cast("int")
    ).withColumn(
        "salted_key",
        concat(col(join_key), lit("_"), col("salt"))
    )
    
    # 右テーブルを複製してサルト値を付与
    salted_right = right_df.select("*") \
        .crossJoin(
            spark.range(salt_buckets).select(col("id").alias("salt"))
        ) \
        .withColumn(
            "salted_key",
            concat(col(join_key), lit("_"), col("salt"))
        )
    
    # サルトキーでJOIN
    result = salted_left.join(
        salted_right,
        "salted_key",
        "inner"
    ).drop("salt", "salted_key")
    
    return result

def isolated_skew_join(left_df, right_df, join_key, skewed_keys):
    """スキューキー分離JOIN"""
    
    # スキューキーと通常キーを分離
    skewed_condition = col(join_key).isin(skewed_keys)
    
    # 通常キーのデータ
    left_normal = left_df.filter(~skewed_condition)
    right_normal = right_df.filter(~skewed_condition)
    
    # スキューキーのデータ
    left_skewed = left_df.filter(skewed_condition)
    right_skewed = right_df.filter(skewed_condition)
    
    # 通常キーは標準JOIN
    normal_result = left_normal.join(right_normal, join_key, "inner")
    
    # スキューキーはブロードキャスト（右テーブルが小さい場合）
    if right_skewed.count() < 100000:
        skewed_result = left_skewed.join(broadcast(right_skewed), join_key, "inner")
    else:
        # サルト技法を適用
        skewed_result = salted_join(left_skewed, right_skewed, join_key)
    
    # 結果をUNION
    final_result = normal_result.union(skewed_result)
    
    return final_result
```

## 📊 クエリ最適化とSQL調整

### 1. CBO（Cost-Based Optimizer）活用

#### 統計情報管理
```python
def comprehensive_table_analysis(table_name):
    """包括的テーブル統計分析"""
    
    # 基本統計収集
    spark.sql(f"ANALYZE TABLE {table_name} COMPUTE STATISTICS")
    
    # カラム統計収集
    df = spark.table(table_name)
    columns = df.columns
    
    # 数値カラムの詳細統計
    numeric_columns = [
        field.name for field in df.schema.fields 
        if field.dataType.typeName() in ['integer', 'long', 'double', 'float', 'decimal']
    ]
    
    if numeric_columns:
        for col_name in numeric_columns:
            spark.sql(f"ANALYZE TABLE {table_name} COMPUTE STATISTICS FOR COLUMNS {col_name}")
    
    # 文字列カラムの統計
    string_columns = [
        field.name for field in df.schema.fields 
        if field.dataType.typeName() == 'string'
    ]
    
    statistics_report = {
        "table_name": table_name,
        "total_columns": len(columns),
        "numeric_columns": len(numeric_columns),
        "string_columns": len(string_columns),
        "row_count": df.count(),
        "estimated_size_mb": 0  # 実際の実装では正確なサイズを取得
    }
    
    # カラム別統計
    column_stats = {}
    for col_name in numeric_columns[:5]:  # 上位5カラムのみ
        stats = df.select(
            count(col_name).alias("non_null_count"),
            countDistinct(col_name).alias("distinct_count"),
            min(col_name).alias("min_value"),
            max(col_name).alias("max_value"),
            avg(col_name).alias("avg_value"),
            stddev(col_name).alias("stddev_value")
        ).collect()[0]
        
        column_stats[col_name] = {
            "cardinality": stats["distinct_count"],
            "null_ratio": 1 - (stats["non_null_count"] / statistics_report["row_count"]),
            "min_value": stats["min_value"],
            "max_value": stats["max_value"],
            "avg_value": stats["avg_value"],
            "stddev": stats["stddev_value"]
        }
    
    statistics_report["column_statistics"] = column_stats
    
    return statistics_report

def optimize_query_with_cbo(query_sql):
    """CBO最適化クエリ実行"""
    
    # CBO有効化
    spark.conf.set("spark.sql.cbo.enabled", "true")
    spark.conf.set("spark.sql.cbo.joinReorder.enabled", "true")
    spark.conf.set("spark.sql.cbo.planStats.enabled", "true")
    
    # クエリ実行前の最適化ヒント
    optimized_query = f"""
    /*+ 
        REPARTITION(customer_id),
        COALESCE(10)
    */
    {query_sql}
    """
    
    # 実行計画分析
    df = spark.sql(query_sql)
    
    # コスト分析
    explain_string = df.explain(mode="cost")
    
    return df, explain_string
```

### 2. 高度なSQL最適化

#### 述語プッシュダウン最適化
```python
def optimize_predicate_pushdown():
    """述語プッシュダウン最適化例"""
    
    # ❌ 非効率: JOIN後にフィルタ
    inefficient_query = """
    SELECT c.customer_id, c.name, o.total_amount
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.order_date >= '2024-01-01' 
      AND c.region = 'US'
    """
    
    # ✅ 効率的: 事前フィルタ + JOIN
    efficient_query = """
    WITH filtered_customers AS (
        SELECT customer_id, name 
        FROM customers 
        WHERE region = 'US'
    ),
    filtered_orders AS (
        SELECT customer_id, total_amount
        FROM orders 
        WHERE order_date >= '2025-01-01'
    )
    SELECT c.customer_id, c.name, o.total_amount
    FROM filtered_customers c
    JOIN filtered_orders o ON c.customer_id = o.customer_id
    """
    
    return efficient_query

def column_pruning_optimization():
    """カラムプルーニング最適化"""
    
    # ❌ 非効率: 不要カラム選択
    inefficient_df = spark.sql("SELECT * FROM large_table") \
        .join(spark.sql("SELECT * FROM dimension_table"), "key") \
        .select("key", "value1", "value2")
    
    # ✅ 効率的: 必要カラムのみ選択
    efficient_df = spark.sql("SELECT key, value1, value2, join_key FROM large_table") \
        .join(
            spark.sql("SELECT join_key, dimension_value FROM dimension_table"),
            "join_key"
        ) \
        .select("key", "value1", "value2", "dimension_value")
    
    return efficient_df

def window_function_optimization():
    """ウィンドウ関数最適化"""
    
    from pyspark.sql.window import Window
    
    # ウィンドウ仕様の再利用
    customer_window = Window.partitionBy("customer_id").orderBy("order_date")
    region_window = Window.partitionBy("region").orderBy("total_sales")
    
    # 最適化されたウィンドウ関数使用
    optimized_df = spark.table("sales_data") \
        .withColumn("row_number", row_number().over(customer_window)) \
        .withColumn("running_total", sum("amount").over(customer_window)) \
        .withColumn("regional_rank", rank().over(region_window))
    
    return optimized_df
```

## 🔗 関連リソース

### 内部リンク
- [[Databricks_Data_Intelligence_Platform_2025]] - プラットフォーム概要
- [[Delta_Lake_Advanced_Operations]] - Delta Lake最適化
- [[Mosaic_AI_Implementation_Guide]] - AI/ML統合

### 外部リンク
- [Spark Performance Tuning Guide](https://spark.apache.org/docs/latest/tuning.html)
- [Databricks Performance Best Practices](https://docs.databricks.com/optimizations/)
- [Photon Engine Documentation](https://docs.databricks.com/runtime/photon.html)

---

**実装難易度**: Advanced  
**推奨チーム**: Data Engineering + Performance Engineering  
**想定実装期間**: 3-6週間  
**パフォーマンス向上**: 2-10x（ワークロードにより変動） 
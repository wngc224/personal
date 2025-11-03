#!/usr/bin/env python3
"""
External API Data Collector for KPI Dashboard
拡張可能・エラーハンドリング・ログ機能付きデータ収集システム
"""

import os
import sys
import yaml
import json
import requests
import snowflake.connector
from datetime import datetime, timezone
import logging
from typing import Dict, Any, Optional
from pathlib import Path

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('_metrics/logs/collector.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class KPICollector:
    """拡張可能なKPIデータ収集システム"""
    
    def __init__(self, config_path: str = "knowledge-vault/_metrics/config/kpi-definitions.yaml"):
        self.config_path = Path(config_path)
        self.data_path = Path("knowledge-vault/_metrics/data/current-values.yaml")
        self.config = self._load_config()
        self.data = self._load_current_data()
        
    def _load_config(self) -> Dict[str, Any]:
        """設定ファイルの読み込み"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"設定ファイル読み込みエラー: {e}")
            raise
    
    def _load_current_data(self) -> Dict[str, Any]:
        """現在データの読み込み"""
        try:
            with open(self.data_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"データファイル読み込みエラー: {e}")
            raise
    
    def _save_data(self) -> None:
        """データファイルの保存"""
        try:
            # メタデータの更新
            self.data['meta']['last_updated'] = datetime.now(timezone.utc).isoformat()
            
            with open(self.data_path, 'w', encoding='utf-8') as f:
                yaml.dump(self.data, f, default_flow_style=False, allow_unicode=True)
            
            logger.info("データファイル更新完了")
        except Exception as e:
            logger.error(f"データファイル保存エラー: {e}")
            raise
    
    def collect_databricks_jobs(self) -> Optional[int]:
        """Databricks Jobs数を取得"""
        try:
            token = os.getenv('DATABRICKS_TOKEN')
            workspace_url = os.getenv('DATABRICKS_WORKSPACE_URL')
            
            if not token or not workspace_url:
                logger.warning("Databricks認証情報が設定されていません")
                return None
            
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                f"{workspace_url}/api/2.1/jobs/list",
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            
            jobs_data = response.json()
            job_count = len(jobs_data.get('jobs', []))
            
            # データ更新
            self.data['platform']['databricks_jobs'].update({
                'value': job_count,
                'last_updated': datetime.now(timezone.utc).isoformat(),
                'status': 'active'
            })
            
            logger.info(f"Databricks Jobs取得成功: {job_count}件")
            return job_count
            
        except requests.RequestException as e:
            logger.error(f"Databricks API エラー: {e}")
            return None
        except Exception as e:
            logger.error(f"Databricks データ取得エラー: {e}")
            return None
    
    def collect_snowflake_credits(self) -> Optional[float]:
        """Snowflake日次クレジット使用量を取得"""
        try:
            # 環境変数から接続情報を取得
            connection_params = {
                'user': os.getenv('SNOWFLAKE_USER'),
                'password': os.getenv('SNOWFLAKE_PASSWORD'),
                'account': os.getenv('SNOWFLAKE_ACCOUNT'),
                'warehouse': os.getenv('SNOWFLAKE_WAREHOUSE', 'COMPUTE_WH'),
                'database': 'SNOWFLAKE',
                'schema': 'ACCOUNT_USAGE'
            }
            
            if not all([connection_params['user'], connection_params['password'], connection_params['account']]):
                logger.warning("Snowflake認証情報が設定されていません")
                return None
            
            # Snowflake接続
            conn = snowflake.connector.connect(**connection_params)
            cursor = conn.cursor()
            
            # 日次クレジット使用量クエリ
            query = """
            SELECT COALESCE(SUM(credits_used_compute), 0) as daily_credits
            FROM snowflake.account_usage.warehouse_metering_history 
            WHERE start_time::date = CURRENT_DATE()
            """
            
            cursor.execute(query)
            result = cursor.fetchone()
            daily_credits = float(result[0]) if result and result[0] else 0.0
            
            # 接続クリーンアップ
            cursor.close()
            conn.close()
            
            # データ更新
            self.data['platform']['snowflake_credits'].update({
                'value': daily_credits,
                'last_updated': datetime.now(timezone.utc).isoformat(),
                'status': 'active'
            })
            
            logger.info(f"Snowflake Credits取得成功: {daily_credits}")
            return daily_credits
            
        except snowflake.connector.Error as e:
            logger.error(f"Snowflake接続エラー: {e}")
            return None
        except Exception as e:
            logger.error(f"Snowflake データ取得エラー: {e}")
            return None
    
    def collect_vault_metrics(self) -> Dict[str, int]:
        """Vault内のメトリクスを自動集計"""
        vault_path = Path("knowledge-vault")
        metrics = {
            'decisions_made': 0,
            'pattern_applications': 0,
            'total_notes': 0
        }
        
        try:
            # 意思決定ログのカウント
            for domain_path in vault_path.glob("domains/*/30_Projects/Decisions/**/*.md"):
                if domain_path.is_file():
                    metrics['decisions_made'] += 1
            
            # パターン適用事例のカウント
            for pattern_path in vault_path.glob("domains/SoftwareDesign/**/*Pattern*.md"):
                if pattern_path.is_file():
                    metrics['pattern_applications'] += 1
            
            # 全ノート数
            for note in vault_path.glob("**/*.md"):
                if note.is_file() and not note.name.startswith('.'):
                    metrics['total_notes'] += 1
            
            # データ更新
            timestamp = datetime.now(timezone.utc).isoformat()
            
            self.data['business']['decisions_made'].update({
                'total': metrics['decisions_made'],
                'last_updated': timestamp,
                'status': 'active'
            })
            
            self.data['business']['pattern_applications'].update({
                'total': metrics['pattern_applications'],
                'last_updated': timestamp,
                'status': 'active'
            })
            
            logger.info(f"Vault メトリクス取得完了: {metrics}")
            return metrics
            
        except Exception as e:
            logger.error(f"Vault メトリクス取得エラー: {e}")
            return metrics
    
    def run_collection(self, targets: Optional[list] = None) -> None:
        """データ収集の実行"""
        logger.info("=== KPIデータ収集開始 ===")
        
        if targets is None:
            targets = ['databricks', 'snowflake', 'vault']
        
        results = {}
        
        # Databricks
        if 'databricks' in targets:
            results['databricks_jobs'] = self.collect_databricks_jobs()
        
        # Snowflake
        if 'snowflake' in targets:
            results['snowflake_credits'] = self.collect_snowflake_credits()
        
        # Vault
        if 'vault' in targets:
            results['vault_metrics'] = self.collect_vault_metrics()
        
        # データ保存
        self._save_data()
        
        # 結果サマリー
        logger.info("=== データ収集完了 ===")
        for key, value in results.items():
            if value is not None:
                logger.info(f"{key}: {value}")
            else:
                logger.warning(f"{key}: 取得失敗")

def main():
    """メイン実行関数"""
    try:
        # ログディレクトリ作成
        log_dir = Path("knowledge-vault/_metrics/logs")
        log_dir.mkdir(parents=True, exist_ok=True)
        
        # コレクターインスタンス作成・実行
        collector = KPICollector()
        
        # コマンドライン引数で収集対象を指定可能
        targets = sys.argv[1:] if len(sys.argv) > 1 else None
        
        collector.run_collection(targets)
        
    except Exception as e:
        logger.error(f"実行エラー: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 
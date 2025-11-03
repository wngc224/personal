#!/usr/bin/env python3
"""
Manual KPI Updater - CLI Tool
手動KPI更新用のインタラクティブCLIツール
"""

import sys
import yaml
import argparse
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional
import logging

# ログ設定
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

class ManualKPIUpdater:
    """手動KPI更新システム"""
    
    def __init__(self):
        self.config_path = Path("knowledge-vault/_metrics/config/kpi-definitions.yaml")
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
            self.data['meta']['last_updated'] = datetime.now(timezone.utc).isoformat()
            
            with open(self.data_path, 'w', encoding='utf-8') as f:
                yaml.dump(self.data, f, default_flow_style=False, allow_unicode=True)
            
            logger.info("データファイル更新完了")
        except Exception as e:
            logger.error(f"データファイル保存エラー: {e}")
            raise
    
    def increment_kpi(self, kpi_name: str, amount: int = 1) -> bool:
        """KPI値を増分更新（入力検証強化版）"""
        try:
            # 入力値検証
            if not isinstance(amount, (int, float)) or amount <= 0:
                logger.error(f"Invalid amount: {amount}. Must be positive number.")
                return False
            
            if not isinstance(kpi_name, str) or not kpi_name.strip():
                logger.error(f"Invalid KPI name: {kpi_name}")
                return False
                
            # KPI設定を検索
            kpi_config = None
            category_key = None
            
            for cat_key, cat_data in self.data.items():
                if cat_key in ['meta', 'system']:
                    continue
                if kpi_name in cat_data:
                    kpi_config = self.config['kpis'].get(kpi_name)
                    category_key = cat_key
                    break
            
            if not kpi_config or not category_key:
                logger.error(f"KPI '{kpi_name}' が見つかりません")
                return False
            
            kpi_data = self.data[category_key][kpi_name]
            
            # KPIタイプに応じた更新処理
            if kpi_config['type'] == 'counter':
                if 'total' in kpi_data:
                    kpi_data['total'] += amount
                    kpi_data['monthly'] = kpi_data.get('monthly', 0) + amount
                else:
                    kpi_data['value'] = kpi_data.get('value', 0) + amount
                    
            elif kpi_config['type'] == 'accumulator':
                kpi_data['monthly'] = kpi_data.get('monthly', 0) + amount
                
            elif kpi_config['type'] == 'progress':
                if 'documented' in kpi_data:
                    kpi_data['documented'] += amount
                    kpi_data['completion_rate'] = kpi_data['documented'] / kpi_data['total']
                    
            # 更新時刻を記録
            kpi_data['last_updated'] = datetime.now(timezone.utc).isoformat()
            
            # データ保存
            self._save_data()
            
            logger.info(f"✅ {kpi_config['name']} を {amount} 増加しました")
            return True
            
        except Exception as e:
            logger.error(f"KPI更新エラー: {e}")
            return False
    
    def set_kpi_value(self, kpi_name: str, value: float) -> bool:
        """KPI値を直接設定（入力検証強化版）"""
        try:
            # 入力値検証
            if not isinstance(value, (int, float)):
                logger.error(f"Invalid value: {value}. Must be a number.")
                return False
                
            if not isinstance(kpi_name, str) or not kpi_name.strip():
                logger.error(f"Invalid KPI name: {kpi_name}")
                return False
                
            # KPI設定を検索
            kpi_config = None
            category_key = None
            
            for cat_key, cat_data in self.data.items():
                if cat_key in ['meta', 'system']:
                    continue
                if kpi_name in cat_data:
                    kpi_config = self.config['kpis'].get(kpi_name)
                    category_key = cat_key
                    break
            
            if not kpi_config or not category_key:
                logger.error(f"KPI '{kpi_name}' が見つかりません")
                return False
            
            kpi_data = self.data[category_key][kpi_name]
            
            # 値の設定
            if 'value' in kpi_data:
                kpi_data['value'] = value
            elif 'monthly' in kpi_data:
                kpi_data['monthly'] = value
            else:
                logger.error(f"KPI '{kpi_name}' の値を設定できません")
                return False
            
            # 更新時刻を記録
            kpi_data['last_updated'] = datetime.now(timezone.utc).isoformat()
            
            # データ保存
            self._save_data()
            
            logger.info(f"✅ {kpi_config['name']} を {value} に設定しました")
            return True
            
        except Exception as e:
            logger.error(f"KPI設定エラー: {e}")
            return False
    
    def show_status(self) -> None:
        """現在のKPI状況を表示"""
        print("\n📊 === 現在のKPI状況 ===")
        
        for category_key, category_data in self.data.items():
            if category_key in ['meta', 'system']:
                continue
                
            category_config = None
            for cat_name, cat_info in self.config['categories'].items():
                if cat_name == category_key:
                    category_config = cat_info
                    break
            
            if category_config:
                print(f"\n{category_config['icon']} {category_config['name']}")
                print("-" * 40)
                
                for kpi_name, kpi_data in category_data.items():
                    kpi_config = self.config['kpis'].get(kpi_name, {})
                    display_name = kpi_config.get('name', kpi_name)
                    
                    # 値の表示形式を決定
                    if 'total' in kpi_data and 'documented' in kpi_data:
                        value_str = f"{kpi_data['documented']}/{kpi_data['total']}"
                    elif 'value' in kpi_data:
                        value_str = str(kpi_data['value'])
                    elif 'monthly' in kpi_data:
                        value_str = str(kpi_data['monthly'])
                    else:
                        value_str = "N/A"
                    
                    unit = kpi_config.get('unit', '')
                    last_updated = kpi_data.get('last_updated', 'Unknown')
                    
                    print(f"  • {display_name}: {value_str} {unit}")
                    print(f"    更新: {last_updated}")
    
    def list_available_kpis(self) -> None:
        """更新可能なKPIの一覧を表示"""
        print("\n📝 === 手動更新可能なKPI ===")
        
        manual_kpis = [
            kpi_name for kpi_name, kpi_config in self.config['kpis'].items()
            if kpi_config.get('is_manual', False) == True
        ]
        
        for i, kpi_name in enumerate(manual_kpis, 1):
            kpi_config = self.config['kpis'][kpi_name]
            print(f"{i:2d}. {kpi_config['name']} ({kpi_name})")
            print(f"     説明: {kpi_config['description']}")
            print(f"     タイプ: {kpi_config['type']}")

def main():
    """メイン実行関数"""
    parser = argparse.ArgumentParser(description="手動KPI更新ツール")
    parser.add_argument('action', choices=['increment', 'set', 'status', 'list'], 
                       help='実行するアクション')
    parser.add_argument('--kpi', '-k', help='更新するKPI名')
    parser.add_argument('--amount', '-a', type=int, default=1, help='増分値 (increment用)')
    parser.add_argument('--value', '-v', type=float, help='設定値 (set用)')
    
    args = parser.parse_args()
    
    updater = ManualKPIUpdater()
    
    try:
        if args.action == 'status':
            updater.show_status()
            
        elif args.action == 'list':
            updater.list_available_kpis()
            
        elif args.action == 'increment':
            if not args.kpi:
                logger.error("--kpi オプションが必要です")
                sys.exit(1)
            success = updater.increment_kpi(args.kpi, args.amount)
            sys.exit(0 if success else 1)
            
        elif args.action == 'set':
            if not args.kpi or args.value is None:
                logger.error("--kpi と --value オプションが必要です")
                sys.exit(1)
            success = updater.set_kpi_value(args.kpi, args.value)
            sys.exit(0 if success else 1)
            
    except KeyboardInterrupt:
        print("\n操作がキャンセルされました")
        sys.exit(1)
    except Exception as e:
        logger.error(f"実行エラー: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 
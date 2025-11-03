#!/usr/bin/env python3
"""
KPI型定義モジュール
ネーミング規約に基づいた型安全なデータ構造定義
"""

from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any, List, Union
from pydantic import BaseModel, Field, validator


class KPICategory(str, Enum):
    """KPIカテゴリ（区分）"""
    PLATFORM = "platform"
    DEVELOPMENT = "development" 
    LEARNING = "learning"
    BUSINESS = "business"


class KPIType(str, Enum):
    """KPIタイプ"""
    COUNTER = "counter"
    GAUGE = "gauge"
    PROGRESS = "progress"
    RATE = "rate"
    PERCENTAGE = "percentage"
    ACCUMULATOR = "accumulator"


class KPIStatus(str, Enum):
    """KPIステータス"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"


class SystemStatus(str, Enum):
    """システムステータスコード"""
    HEALTHY = "healthy"
    WARNING = "warning"
    ERROR = "error"
    MAINTENANCE = "maintenance"
    UNKNOWN = "unknown"


# === 基本型定義 ===

class KPIConfiguration(BaseModel):
    """KPI設定（ネーミング規約準拠）"""
    category: KPICategory
    name: str
    description: str
    type: KPIType
    unit: str
    
    # ブール値（is_プレフィックス）
    is_manual: bool = Field(description="手動収集かどうか")
    is_alert_enabled: bool = Field(default=False, description="アラート有効かどうか")
    
    # 閾値（分離設計）
    alert_threshold_value: Optional[float] = Field(default=None, description="アラート閾値")
    
    # ターゲット値
    target_daily: Optional[float] = None
    target_monthly: Optional[float] = None
    target_yearly: Optional[float] = None
    target_completion: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    target_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    target_resolution_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    
    # API設定（API収集の場合）
    api_config: Optional[Dict[str, Any]] = None
    source_query: Optional[str] = None
    components: Optional[Dict[str, Any]] = None
    
    @validator('is_manual', 'is_alert_enabled')
    def validate_boolean_naming(cls, v, field):
        """ブール値フィールドの命名規約チェック"""
        field_name = field.name
        if not field_name.startswith(('is_', 'has_', 'can_', 'should_', 'will_')):
            raise ValueError(f"Boolean field '{field_name}' should start with 'is_', 'has_', 'can_', etc.")
        return v


class KPIValue(BaseModel):
    """KPI値データ（ネーミング規約準拠）"""
    # 基本値
    value: Optional[float] = None
    total: Optional[int] = None
    documented: Optional[int] = None
    monthly: Optional[float] = None
    daily_average: Optional[float] = None
    
    # プログレス関連
    completion_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    
    # レート関連
    opened: Optional[int] = None
    closed: Optional[int] = None
    in_progress: Optional[int] = None
    resolution_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    
    # メタデータ
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    status: KPIStatus = Field(default=KPIStatus.ACTIVE)
    collection_method: Optional[str] = Field(default="unknown", description="データ収集方法")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class SystemInfo(BaseModel):
    """システム情報（ネーミング規約準拠）"""
    # ヘルスステータス（分離設計）
    is_healthy: bool = Field(description="システムが健康かどうか")
    status_code: SystemStatus = Field(description="詳細ステータスコード")
    status_message: str = Field(description="ステータスメッセージ")
    
    # バックアップ・整合性
    last_backup: datetime
    is_data_integrity_verified: bool = Field(description="データ整合性検証済みかどうか")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class CategoryInfo(BaseModel):
    """カテゴリ情報"""
    name: str
    description: str
    color: str = Field(regex=r'^#[0-9A-Fa-f]{6}$')
    icon: str


class AutomationConfig(BaseModel):
    """自動化設定（ネーミング規約準拠）"""
    # スケジュール
    collection_schedule: Dict[str, str]
    
    # 通知設定（is_プレフィックス）
    notifications: 'NotificationConfig'
    
    # バックアップ設定
    backup: 'BackupConfig'


class NotificationConfig(BaseModel):
    """通知設定（ネーミング規約準拠）"""
    is_threshold_alerts: bool = Field(description="閾値アラート有効")
    is_daily_summary: bool = Field(description="日次サマリー有効")
    is_weekly_report: bool = Field(description="週次レポート有効")


class BackupConfig(BaseModel):
    """バックアップ設定（ネーミング規約準拠）"""
    is_enabled: bool = Field(description="バックアップ有効")
    retention_days: int = Field(gt=0, description="保持日数")
    is_historical_compression: bool = Field(description="履歴圧縮有効")


# === 複合型定義 ===

class KPIDataCollection(BaseModel):
    """KPIデータ集合"""
    platform: Dict[str, KPIValue] = Field(default_factory=dict)
    development: Dict[str, KPIValue] = Field(default_factory=dict)
    learning: Dict[str, KPIValue] = Field(default_factory=dict)
    business: Dict[str, KPIValue] = Field(default_factory=dict)
    system: SystemInfo
    
    class Config:
        extra = "forbid"  # 追加フィールドを禁止


class KPIConfigCollection(BaseModel):
    """KPI設定集合"""
    meta: Dict[str, Any]
    categories: Dict[str, CategoryInfo]
    kpis: Dict[str, KPIConfiguration]
    dashboard_layouts: Dict[str, Any]
    automation: AutomationConfig
    ui_config: Optional[Dict[str, Any]] = None
    
    class Config:
        extra = "forbid"


# === バリデーション用ヘルパー ===

class KPIValidator:
    """KPI関連バリデーション"""
    
    @staticmethod
    def validate_boolean_naming(data: Dict[str, Any]) -> List[str]:
        """ブール値フィールドの命名規約チェック"""
        errors = []
        
        def check_dict(obj: Any, path: str = "") -> None:
            if not isinstance(obj, dict):
                return
                
            for key, value in obj.items():
                current_path = f"{path}.{key}" if path else key
                
                if isinstance(value, bool):
                    if not key.startswith(('is_', 'has_', 'can_', 'should_', 'will_')):
                        errors.append(f"Boolean field '{current_path}' should use naming convention (is_*, has_*, etc.)")
                
                elif isinstance(value, dict):
                    check_dict(value, current_path)
                elif isinstance(value, list):
                    for i, item in enumerate(value):
                        if isinstance(item, dict):
                            check_dict(item, f"{current_path}[{i}]")
        
        check_dict(data)
        return errors
    
    @staticmethod
    def validate_category_naming(categories: List[str]) -> List[str]:
        """カテゴリ命名規約チェック"""
        errors = []
        valid_categories = {e.value for e in KPICategory}
        
        for category in categories:
            if category not in valid_categories:
                errors.append(f"Invalid category '{category}'. Use: {', '.join(valid_categories)}")
        
        return errors


# === TypeScript型定義生成用 ===

def generate_typescript_types() -> str:
    """TypeScript型定義を生成"""
    return '''
// Auto-generated TypeScript types from Python Pydantic models

export type KPICategory = 'platform' | 'development' | 'learning' | 'business';
export type KPIType = 'counter' | 'gauge' | 'progress' | 'rate' | 'percentage' | 'accumulator';
export type KPIStatus = 'active' | 'inactive' | 'error' | 'pending';
export type SystemStatus = 'healthy' | 'warning' | 'error' | 'maintenance' | 'unknown';

export interface KPIConfiguration {
  category: KPICategory;
  name: string;
  description: string;
  type: KPIType;
  unit: string;
  
  // ネーミング規約準拠ブール値
  is_manual: boolean;
  is_alert_enabled: boolean;
  
  // 閾値（分離設計）
  alert_threshold_value?: number;
  
  // ターゲット値
  target_daily?: number;
  target_monthly?: number;
  target_yearly?: number;
  target_completion?: number;
  target_rate?: number;
  target_resolution_rate?: number;
}

export interface KPIValue {
  value?: number;
  total?: number;
  documented?: number;
  monthly?: number;
  daily_average?: number;
  completion_rate?: number;
  opened?: number;
  closed?: number;
  in_progress?: number;
  resolution_rate?: number;
  last_updated: string;
  status: KPIStatus;
  collection_method?: string;
}

export interface SystemInfo {
  is_healthy: boolean;
  status_code: SystemStatus;
  status_message: string;
  last_backup: string;
  is_data_integrity_verified: boolean;
}

export interface NotificationConfig {
  is_threshold_alerts: boolean;
  is_daily_summary: boolean;
  is_weekly_report: boolean;
}

export interface BackupConfig {
  is_enabled: boolean;
  retention_days: number;
  is_historical_compression: boolean;
}
'''


# === 便利関数 ===

def load_kpi_data(yaml_data: Dict[str, Any]) -> KPIDataCollection:
    """YAMLデータからKPIデータコレクションを生成"""
    return KPIDataCollection.parse_obj(yaml_data)


def load_kpi_config(yaml_data: Dict[str, Any]) -> KPIConfigCollection:
    """YAMLデータからKPI設定コレクションを生成"""
    return KPIConfigCollection.parse_obj(yaml_data)


def validate_kpi_yaml(yaml_data: Dict[str, Any]) -> List[str]:
    """KPI YAMLデータの包括的バリデーション"""
    errors = []
    
    # ネーミング規約チェック
    errors.extend(KPIValidator.validate_boolean_naming(yaml_data))
    
    # カテゴリチェック
    if 'kpis' in yaml_data:
        categories = [kpi.get('category') for kpi in yaml_data['kpis'].values() if kpi.get('category')]
        errors.extend(KPIValidator.validate_category_naming(categories))
    
    # Pydanticバリデーション
    try:
        if 'kpis' in yaml_data:
            load_kpi_config(yaml_data)
        else:
            load_kpi_data(yaml_data)
    except Exception as e:
        errors.append(f"Pydantic validation error: {e}")
    
    return errors


if __name__ == "__main__":
    # 型定義のテスト
    print("🔍 KPI Type Definitions")
    print("Categories:", [e.value for e in KPICategory])
    print("Types:", [e.value for e in KPIType])
    print("Status:", [e.value for e in KPIStatus])
    
    # TypeScript型定義出力
    print("\n📝 TypeScript Types:")
    print(generate_typescript_types()) 
"""
Custom JSON encoder for Flask to handle domain objects and enum serialization
"""
import json
from enum import Enum
from datetime import datetime, date
from typing import Any
from decimal import Decimal

class CustomJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder that handles various Python types for API responses"""
    
    def default(self, obj: Any) -> Any:
        # Handle enum types
        if isinstance(obj, Enum):
            return obj.value
        
        # Handle datetime and date objects
        elif isinstance(obj, (datetime, date)):
            return obj.isoformat()
        
        # Handle Decimal types
        elif isinstance(obj, Decimal):
            return float(obj)
        
        # Handle objects with __dict__ (custom classes)
        elif hasattr(obj, '__dict__'):
            return {
                '_type': obj.__class__.__name__,
                **{k: v for k, v in obj.__dict__.items() 
                   if not k.startswith('_')}
            }
        
        # Handle objects with to_dict method
        elif hasattr(obj, 'to_dict'):
            return obj.to_dict()
        
        # Handle objects with to_json method  
        elif hasattr(obj, 'to_json'):
            return obj.to_json()
        
        # Fall back to default encoder
        return super().default(obj)
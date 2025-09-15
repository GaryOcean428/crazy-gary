"""
HuggingFace model endpoint configurations for crazy-gary deployment
Centralized configuration for user's specific HuggingFace inference endpoints
"""
import os
from typing import Dict, Any, Optional
from enum import Enum

class ModelProvider(Enum):
    HUGGINGFACE = "huggingface"

class ModelEndpointConfig:
    """Configuration for a HuggingFace model endpoint"""
    
    def __init__(self, 
                 name: str, 
                 provider: ModelProvider,
                 model_id: str,
                 base_url: str,
                 api_key_env: str,
                 default_params: Optional[Dict[str, Any]] = None,
                 max_tokens: int = 4096,
                 context_window: int = 8192):
        self.name = name
        self.provider = provider
        self.model_id = model_id
        self.base_url = base_url
        self.api_key_env = api_key_env
        self.default_params = default_params or {}
        self.max_tokens = max_tokens
        self.context_window = context_window
        
    @property
    def api_key(self) -> Optional[str]:
        """Get API key from environment"""
        return os.getenv(self.api_key_env)
    
    @property
    def is_available(self) -> bool:
        """Check if endpoint is available (has API key)"""
        return self.api_key is not None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "name": self.name,
            "provider": self.provider.value,
            "model_id": self.model_id,
            "base_url": self.base_url,
            "api_key_available": self.is_available,
            "max_tokens": self.max_tokens,
            "context_window": self.context_window,
            "default_params": self.default_params
        }

# HuggingFace model endpoint configurations for user's specific models
MODEL_ENDPOINTS = {
    "120b": ModelEndpointConfig(
        name="GPT-OSS 120B Crazy Gary",
        provider=ModelProvider.HUGGINGFACE,
        model_id="bartowski/huizimao_gpt-oss-120b-uncensored-bf16-GGUF",
        base_url=os.getenv('HF_BASE_URL_120B', ''),
        api_key_env="HUGGINGFACE_API_KEY",
        max_tokens=4096,
        context_window=8192,
        default_params={
            "temperature": 0.7,
            "top_p": 0.9
        }
    ),
    "20b": ModelEndpointConfig(
        name="OpenAI GPT-OSS 20B Abliterated",
        provider=ModelProvider.HUGGINGFACE,
        model_id="DavidAU/OpenAi-GPT-oss-20b-abliterated-uncensored-NEO-Imatrix-gguf",
        base_url=os.getenv('HF_BASE_URL_20B', ''),
        api_key_env="HUGGINGFACE_API_KEY",
        max_tokens=4096,
        context_window=8192,
        default_params={
            "temperature": 0.7,
            "top_p": 0.9
        }
    )
}

def get_available_models() -> Dict[str, ModelEndpointConfig]:
    """Get all model endpoints that have API keys configured"""
    return {k: v for k, v in MODEL_ENDPOINTS.items() if v.is_available}

def get_model_config(model_key: str) -> Optional[ModelEndpointConfig]:
    """Get configuration for a specific model"""
    return MODEL_ENDPOINTS.get(model_key)

def get_models_by_provider(provider: ModelProvider) -> Dict[str, ModelEndpointConfig]:
    """Get all models for a specific provider"""
    return {k: v for k, v in MODEL_ENDPOINTS.items() if v.provider == provider}

def get_model_status() -> Dict[str, Dict[str, Any]]:
    """Get status of all configured models"""
    return {k: v.to_dict() for k, v in MODEL_ENDPOINTS.items()}
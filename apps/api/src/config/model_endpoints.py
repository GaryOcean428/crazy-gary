"""
Model endpoint configurations for crazy-gary deployment
Centralized configuration for all AI model endpoints and providers
"""
import os
from typing import Dict, Any, Optional
from enum import Enum

class ModelProvider(Enum):
    ANTHROPIC = "anthropic"
    OPENAI = "openai"
    HUGGINGFACE = "huggingface"
    TOGETHER = "together"
    GROQ = "groq"

class ModelEndpointConfig:
    """Configuration for a single model endpoint"""
    
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

# Model endpoint configurations as mentioned in the problem statement
MODEL_ENDPOINTS = {
    "120b": ModelEndpointConfig(
        name="Claude 3 Opus",
        provider=ModelProvider.ANTHROPIC,
        model_id="claude-3-opus-20240229",
        base_url="https://api.anthropic.com/v1/messages",
        api_key_env="ANTHROPIC_API_KEY",
        max_tokens=4096,
        context_window=200000,
        default_params={
            "temperature": 0.7,
            "top_p": 0.9
        }
    ),
    "20b": ModelEndpointConfig(
        name="GPT-4 Turbo",
        provider=ModelProvider.OPENAI,
        model_id="gpt-4-turbo-preview",
        base_url="https://api.openai.com/v1/chat/completions",
        api_key_env="OPENAI_API_KEY",
        max_tokens=4096,
        context_window=128000,
        default_params={
            "temperature": 0.7,
            "top_p": 1.0
        }
    ),
    "gpt-4o": ModelEndpointConfig(
        name="GPT-4o",
        provider=ModelProvider.OPENAI,
        model_id="gpt-4o",
        base_url="https://api.openai.com/v1/chat/completions", 
        api_key_env="OPENAI_API_KEY",
        max_tokens=4096,
        context_window=128000,
        default_params={
            "temperature": 0.7,
            "top_p": 1.0
        }
    ),
    "claude-3-haiku": ModelEndpointConfig(
        name="Claude 3 Haiku",
        provider=ModelProvider.ANTHROPIC,
        model_id="claude-3-haiku-20240307",
        base_url="https://api.anthropic.com/v1/messages",
        api_key_env="ANTHROPIC_API_KEY",
        max_tokens=4096,
        context_window=200000,
        default_params={
            "temperature": 0.7,
            "top_p": 0.9
        }
    ),
    "mixtral": ModelEndpointConfig(
        name="Mixtral 8x7B",
        provider=ModelProvider.TOGETHER,
        model_id="mistralai/Mixtral-8x7B-Instruct-v0.1",
        base_url="https://api.together.xyz/v1/chat/completions",
        api_key_env="TOGETHER_API_KEY",
        max_tokens=4096,
        context_window=32768,
        default_params={
            "temperature": 0.7,
            "top_p": 0.9
        }
    ),
    "llama-70b": ModelEndpointConfig(
        name="Llama 2 70B",
        provider=ModelProvider.TOGETHER,
        model_id="meta-llama/Llama-2-70b-chat-hf",
        base_url="https://api.together.xyz/v1/chat/completions",
        api_key_env="TOGETHER_API_KEY",
        max_tokens=4096,
        context_window=4096,
        default_params={
            "temperature": 0.7,
            "top_p": 0.9
        }
    ),
    "groq-mixtral": ModelEndpointConfig(
        name="Mixtral 8x7B (Groq)",
        provider=ModelProvider.GROQ,
        model_id="mixtral-8x7b-32768",
        base_url="https://api.groq.com/openai/v1/chat/completions",
        api_key_env="GROQ_API_KEY",
        max_tokens=4096,
        context_window=32768,
        default_params={
            "temperature": 0.7,
            "top_p": 1.0
        }
    ),
    "groq-llama": ModelEndpointConfig(
        name="Llama 3 70B (Groq)",
        provider=ModelProvider.GROQ,
        model_id="llama3-70b-8192",
        base_url="https://api.groq.com/openai/v1/chat/completions",
        api_key_env="GROQ_API_KEY",
        max_tokens=4096,
        context_window=8192,
        default_params={
            "temperature": 0.7,
            "top_p": 1.0
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
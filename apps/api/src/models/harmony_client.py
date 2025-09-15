"""
Harmony client for interfacing with HuggingFace models
"""
import os
import json
import asyncio
import aiohttp
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from enum import Enum
from .endpoint_manager import HuggingFaceEndpointManager, EndpointStatus

class ModelType(Enum):
    MODEL_120B = "120b"
    MODEL_20B = "20b"

@dataclass
class ModelSettings:
    model: str = "120b"
    temperature: float = 0.7
    top_p: float = 0.9
    top_k: int = 50
    max_tokens: int = 2048
    presence_penalty: float = 0.0
    frequency_penalty: float = 0.0
    seed: Optional[int] = None

@dataclass
class Content:
    type: str
    text: Optional[str] = None
    value: Optional[Dict[str, Any]] = None
    url: Optional[str] = None
    alt: Optional[str] = None
    steps: Optional[List[str]] = None
    name: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    id: Optional[str] = None
    tool_call_id: Optional[str] = None
    result: Optional[Any] = None
    error: Optional[str] = None

@dataclass
class Message:
    role: str
    content: List[Content]
    timestamp: Optional[str] = None
    id: Optional[str] = None

@dataclass
class Tool:
    name: str
    description: str
    parameters: Dict[str, Any]

@dataclass
class HarmonyMessage:
    messages: List[Message]
    tools: Optional[List[Tool]] = None
    settings: Optional[ModelSettings] = None
    metadata: Optional[Dict[str, Any]] = None

class HarmonyClient:
    def __init__(self):
        self.hf_120b_url = os.getenv('HF_BASE_URL_120B')
        self.hf_20b_url = os.getenv('HF_BASE_URL_20B')
        self.hf_api_key = os.getenv('HUGGINGFACE_API_KEY')
        
        # Allow initialization without API key for graceful degradation
        self._available = bool(self.hf_api_key)
        if not self._available:
            print("⚠️ HUGGINGFACE_API_KEY not set - HarmonyClient will be disabled")
        
        self.session = None
        self.endpoint_manager = None
    
    def is_available(self) -> bool:
        """Check if HarmonyClient is available (has required API key)."""
        return self._available
    
    async def __aenter__(self):
        if not self._available:
            return self
        self.session = aiohttp.ClientSession()
        self.endpoint_manager = HuggingFaceEndpointManager()
        await self.endpoint_manager.__aenter__()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.endpoint_manager:
            await self.endpoint_manager.__aexit__(exc_type, exc_val, exc_tb)
        if self.session:
            await self.session.close()
    
    def _get_model_url(self, model_type: str) -> str:
        """Get the appropriate model URL based on type"""
        if model_type == ModelType.MODEL_120B.value:
            if not self.hf_120b_url:
                raise ValueError("HF_BASE_URL_120B environment variable is required")
            return self.hf_120b_url
        elif model_type == ModelType.MODEL_20B.value:
            if not self.hf_20b_url:
                raise ValueError("HF_BASE_URL_20B environment variable is required")
            return self.hf_20b_url
        else:
            raise ValueError(f"Unknown model type: {model_type}")
    
    def _prepare_headers(self) -> Dict[str, str]:
        """Prepare headers for HuggingFace API requests"""
        return {
            'Authorization': f'Bearer {self.hf_api_key}',
            'Content-Type': 'application/json',
        }
    
    def _convert_messages_to_hf_format(self, messages: List[Message]) -> List[Dict[str, str]]:
        """Convert Harmony messages to HuggingFace format"""
        hf_messages = []
        
        for message in messages:
            # Extract text content from message
            text_content = []
            for content in message.content:
                if content.type == 'text' and content.text:
                    text_content.append(content.text)
                elif content.type == 'plan' and content.text:
                    text_content.append(f"Plan: {content.text}")
                    if content.steps:
                        text_content.append(f"Steps: {', '.join(content.steps)}")
            
            if text_content:
                hf_messages.append({
                    'role': message.role,
                    'content': ' '.join(text_content)
                })
        
        return hf_messages
    
    def _prepare_hf_payload(self, messages: List[Message], settings: ModelSettings) -> Dict[str, Any]:
        """Prepare payload for HuggingFace API"""
        hf_messages = self._convert_messages_to_hf_format(messages)
        
        payload = {
            'messages': hf_messages,
            'temperature': settings.temperature,
            'top_p': settings.top_p,
            'max_tokens': settings.max_tokens,
            'stream': False,
        }
        
        # Add optional parameters if they're not default values
        if settings.presence_penalty != 0.0:
            payload['presence_penalty'] = settings.presence_penalty
        if settings.frequency_penalty != 0.0:
            payload['frequency_penalty'] = settings.frequency_penalty
        if settings.seed is not None:
            payload['seed'] = settings.seed
        
        return payload
    
    async def _make_request(self, url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Make HTTP request to HuggingFace API"""
        if not self.session:
            raise RuntimeError("Client session not initialized. Use async context manager.")
        
        headers = self._prepare_headers()
        
        try:
            async with self.session.post(url, json=payload, headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error_text = await response.text()
                    raise Exception(f"API request failed with status {response.status}: {error_text}")
        except aiohttp.ClientError as e:
            raise Exception(f"Network error: {str(e)}")
    
    async def is_model_available(self, model_type: str) -> bool:
        """Check if a model is available"""
        if not self._available or not self.endpoint_manager:
            return False
        
        try:
            # First ensure the endpoint is awake
            is_awake = await self.endpoint_manager.ensure_endpoint_awake(model_type)
            if not is_awake:
                return False
            
            # Update activity tracking
            self.endpoint_manager.update_activity(model_type)
            return True
        except Exception:
            return False
    
    async def generate_response(self, harmony_message: HarmonyMessage) -> HarmonyMessage:
        """Generate response using HuggingFace models with fallback"""
        if not self._available:
            # Return a graceful degradation response
            harmony_message.response = {
                'status': 'error',
                'error': 'HarmonyClient unavailable - HUGGINGFACE_API_KEY not configured',
                'message': 'AI model integration is currently unavailable. Please configure HUGGINGFACE_API_KEY environment variable.'
            }
            return harmony_message
            
        messages = harmony_message.messages
        settings = harmony_message.settings or ModelSettings()
        tools = harmony_message.tools or []
        
        # Try primary model first
        try:
            if settings.model == ModelType.MODEL_120B.value:
                if await self.is_model_available(ModelType.MODEL_120B.value):
                    response = await self._generate_with_model(messages, settings, ModelType.MODEL_120B.value)
                    return self._create_response_message(harmony_message, response, ModelType.MODEL_120B.value)
        except Exception as e:
            print(f"120B model failed: {e}")
        
        # Fallback to 20B model
        try:
            if await self.is_model_available(ModelType.MODEL_20B.value):
                fallback_settings = ModelSettings(**asdict(settings))
                fallback_settings.model = ModelType.MODEL_20B.value
                response = await self._generate_with_model(messages, fallback_settings, ModelType.MODEL_20B.value)
                return self._create_response_message(harmony_message, response, ModelType.MODEL_20B.value)
        except Exception as e:
            print(f"20B model also failed: {e}")
            raise Exception("Both 120B and 20B models are unavailable")
    
    async def _generate_with_model(self, messages: List[Message], settings: ModelSettings, model_type: str) -> Dict[str, Any]:
        """Generate response with specific model"""
        url = self._get_model_url(model_type)
        payload = self._prepare_hf_payload(messages, settings)
        return await self._make_request(url, payload)
    
    def _create_response_message(self, original_message: HarmonyMessage, api_response: Dict[str, Any], model_used: str) -> HarmonyMessage:
        """Create Harmony response message from API response"""
        # Extract response content
        response_text = ""
        if 'choices' in api_response and api_response['choices']:
            choice = api_response['choices'][0]
            if 'message' in choice and 'content' in choice['message']:
                response_text = choice['message']['content']
        
        # Create response message
        response_content = [Content(type='text', text=response_text)]
        response_message = Message(
            role='assistant',
            content=response_content,
            timestamp=None,  # Will be set by the adapter
            id=None  # Will be set by the adapter
        )
        
        # Create new harmony message with response
        new_messages = original_message.messages + [response_message]
        
        # Update metadata
        metadata = original_message.metadata or {}
        metadata.update({
            'model_used': model_used,
            'usage': api_response.get('usage', {}),
            'finish_reason': api_response.get('choices', [{}])[0].get('finish_reason', 'unknown')
        })
        
        return HarmonyMessage(
            messages=new_messages,
            tools=original_message.tools,
            settings=original_message.settings,
            metadata=metadata
        )
    
    def create_user_message(self, text: str) -> Message:
        """Create a user message from text"""
        return Message(
            role='user',
            content=[Content(type='text', text=text)],
            timestamp=None,
            id=None
        )
    
    def create_plan_message(self, plan_text: str, steps: Optional[List[str]] = None) -> Message:
        """Create a plan message"""
        return Message(
            role='assistant',
            content=[Content(type='plan', text=plan_text, steps=steps)],
            timestamp=None,
            id=None
        )
    
    def extract_text_content(self, message: Message) -> str:
        """Extract text content from a message"""
        text_parts = []
        for content in message.content:
            if content.type == 'text' and content.text:
                text_parts.append(content.text)
            elif content.type == 'plan' and content.text:
                text_parts.append(content.text)
        return ' '.join(text_parts)


    
    # Endpoint Management Methods
    async def wake_endpoint(self, model_type: str) -> bool:
        """Wake up a specific endpoint"""
        if not self.endpoint_manager:
            return False
        return await self.endpoint_manager.wake_endpoint(model_type)
    
    async def sleep_endpoint(self, model_type: str) -> bool:
        """Put a specific endpoint to sleep"""
        if not self.endpoint_manager:
            return False
        return await self.endpoint_manager.sleep_endpoint(model_type)
    
    async def get_endpoint_status(self, model_type: str) -> str:
        """Get the status of a specific endpoint"""
        if not self.endpoint_manager:
            return "unknown"
        status = await self.endpoint_manager.get_endpoint_status(model_type)
        return status.value
    
    async def get_all_endpoint_status(self) -> Dict[str, Any]:
        """Get status of all endpoints"""
        if not self.endpoint_manager:
            return {}
        return await self.endpoint_manager.get_all_endpoint_status()
    
    async def wake_all_endpoints(self) -> Dict[str, bool]:
        """Wake up all endpoints"""
        if not self.endpoint_manager:
            return {}
        return await self.endpoint_manager.wake_all_endpoints()
    
    async def sleep_all_endpoints(self) -> Dict[str, bool]:
        """Put all endpoints to sleep"""
        if not self.endpoint_manager:
            return {}
        return await self.endpoint_manager.sleep_all_endpoints()


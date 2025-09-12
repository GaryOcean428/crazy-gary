"""
HuggingFace Inference Endpoint Manager
Handles wake-up, sleep, and status monitoring of inference endpoints
"""
import os
import asyncio
import aiohttp
import time
from typing import Dict, Any, Optional, List
from enum import Enum
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

class EndpointStatus(Enum):
    RUNNING = "running"
    SLEEPING = "sleeping"
    STARTING = "starting"
    STOPPING = "stopping"
    UNKNOWN = "unknown"
    ERROR = "error"

@dataclass
class EndpointInfo:
    name: str
    url: str
    status: EndpointStatus
    last_activity: Optional[float] = None
    wake_time: Optional[float] = None
    sleep_time: Optional[float] = None

class HuggingFaceEndpointManager:
    def __init__(self):
        self.hf_api_key = os.getenv('HUGGINGFACE_API_KEY')
        self.hf_120b_url = os.getenv('HF_BASE_URL_120B')
        self.hf_20b_url = os.getenv('HF_BASE_URL_20B')
        
        # Extract endpoint names from URLs for management API calls
        self.hf_120b_endpoint = self._extract_endpoint_name(self.hf_120b_url)
        self.hf_20b_endpoint = self._extract_endpoint_name(self.hf_20b_url)
        
        if not self.hf_api_key:
            raise ValueError("HUGGINGFACE_API_KEY environment variable is required")
        
        self.session = None
        self.endpoints = {
            '120b': EndpointInfo(
                name=self.hf_120b_endpoint,
                url=self.hf_120b_url,
                status=EndpointStatus.UNKNOWN
            ),
            '20b': EndpointInfo(
                name=self.hf_20b_endpoint,
                url=self.hf_20b_url,
                status=EndpointStatus.UNKNOWN
            )
        }
        
        # Auto-sleep timeout (15 minutes)
        self.auto_sleep_timeout = 15 * 60  # 15 minutes in seconds
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def _extract_endpoint_name(self, url: str) -> str:
        """Extract endpoint name from HuggingFace URL"""
        if not url:
            return ""
        
        # Expected format: https://endpoints.huggingface.co/GaryOcean/endpoints/endpoint-name
        parts = url.split('/')
        if len(parts) >= 2:
            return parts[-1]  # Get the last part as endpoint name
        return ""
    
    def _get_management_headers(self) -> Dict[str, str]:
        """Get headers for HuggingFace management API"""
        return {
            'Authorization': f'Bearer {self.hf_api_key}',
            'Content-Type': 'application/json',
        }
    
    def _get_inference_headers(self) -> Dict[str, str]:
        """Get headers for HuggingFace inference API"""
        return {
            'Authorization': f'Bearer {self.hf_api_key}',
            'Content-Type': 'application/json',
        }
    
    async def get_endpoint_status(self, model_type: str) -> EndpointStatus:
        """Get the current status of an endpoint"""
        if model_type not in self.endpoints:
            return EndpointStatus.UNKNOWN
        
        endpoint_info = self.endpoints[model_type]
        endpoint_name = endpoint_info.name
        
        if not endpoint_name:
            logger.warning(f"No endpoint name found for model {model_type}")
            return EndpointStatus.UNKNOWN
        
        try:
            # Use HuggingFace management API to check endpoint status
            management_url = f"https://api.endpoints.huggingface.co/v2/endpoint/{endpoint_name}"
            headers = self._get_management_headers()
            
            async with self.session.get(management_url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    status_str = data.get('compute', {}).get('status', 'unknown').lower()
                    
                    # Map HuggingFace status to our enum
                    status_mapping = {
                        'running': EndpointStatus.RUNNING,
                        'sleeping': EndpointStatus.SLEEPING,
                        'starting': EndpointStatus.STARTING,
                        'stopping': EndpointStatus.STOPPING,
                        'scaled-to-zero': EndpointStatus.SLEEPING,
                        'initializing': EndpointStatus.STARTING,
                    }
                    
                    status = status_mapping.get(status_str, EndpointStatus.UNKNOWN)
                    endpoint_info.status = status
                    return status
                else:
                    logger.error(f"Failed to get endpoint status: {response.status}")
                    return EndpointStatus.ERROR
        
        except Exception as e:
            logger.error(f"Error checking endpoint status: {e}")
            return EndpointStatus.ERROR
    
    async def wake_endpoint(self, model_type: str) -> bool:
        """Wake up a sleeping endpoint"""
        if model_type not in self.endpoints:
            logger.error(f"Unknown model type: {model_type}")
            return False
        
        endpoint_info = self.endpoints[model_type]
        
        try:
            # First check current status
            current_status = await self.get_endpoint_status(model_type)
            
            if current_status == EndpointStatus.RUNNING:
                logger.info(f"Endpoint {model_type} is already running")
                return True
            
            if current_status == EndpointStatus.STARTING:
                logger.info(f"Endpoint {model_type} is already starting")
                return await self._wait_for_endpoint_ready(model_type)
            
            # Wake up the endpoint by making a simple inference request
            logger.info(f"Waking up endpoint {model_type}...")
            endpoint_info.wake_time = time.time()
            
            # Make a minimal inference request to wake up the endpoint
            wake_payload = {
                "inputs": "wake up",
                "parameters": {
                    "max_new_tokens": 1,
                    "temperature": 0.1
                }
            }
            
            headers = self._get_inference_headers()
            
            async with self.session.post(
                endpoint_info.url, 
                json=wake_payload, 
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=300)  # 5 minute timeout for wake-up
            ) as response:
                # We don't care about the response content, just that the endpoint wakes up
                if response.status in [200, 503]:  # 503 might be returned while starting
                    logger.info(f"Wake-up request sent to {model_type}")
                    return await self._wait_for_endpoint_ready(model_type)
                else:
                    logger.error(f"Failed to wake endpoint {model_type}: {response.status}")
                    return False
        
        except Exception as e:
            logger.error(f"Error waking endpoint {model_type}: {e}")
            return False
    
    async def sleep_endpoint(self, model_type: str) -> bool:
        """Put an endpoint to sleep (scale to zero)"""
        if model_type not in self.endpoints:
            logger.error(f"Unknown model type: {model_type}")
            return False
        
        endpoint_info = self.endpoints[model_type]
        endpoint_name = endpoint_info.name
        
        if not endpoint_name:
            logger.warning(f"No endpoint name found for model {model_type}")
            return False
        
        try:
            # Use HuggingFace management API to scale endpoint to zero
            management_url = f"https://api.endpoints.huggingface.co/v2/endpoint/{endpoint_name}/scale-to-zero"
            headers = self._get_management_headers()
            
            async with self.session.post(management_url, headers=headers) as response:
                if response.status in [200, 202]:
                    logger.info(f"Sleep request sent to endpoint {model_type}")
                    endpoint_info.sleep_time = time.time()
                    endpoint_info.status = EndpointStatus.STOPPING
                    return True
                else:
                    logger.error(f"Failed to sleep endpoint {model_type}: {response.status}")
                    return False
        
        except Exception as e:
            logger.error(f"Error sleeping endpoint {model_type}: {e}")
            return False
    
    async def _wait_for_endpoint_ready(self, model_type: str, max_wait_time: int = 300) -> bool:
        """Wait for an endpoint to become ready"""
        start_time = time.time()
        
        while time.time() - start_time < max_wait_time:
            status = await self.get_endpoint_status(model_type)
            
            if status == EndpointStatus.RUNNING:
                logger.info(f"Endpoint {model_type} is now running")
                return True
            elif status == EndpointStatus.ERROR:
                logger.error(f"Endpoint {model_type} encountered an error")
                return False
            
            # Wait before checking again
            await asyncio.sleep(10)
        
        logger.error(f"Timeout waiting for endpoint {model_type} to become ready")
        return False
    
    async def is_endpoint_available(self, model_type: str) -> bool:
        """Check if an endpoint is available for inference"""
        try:
            status = await self.get_endpoint_status(model_type)
            return status == EndpointStatus.RUNNING
        except Exception:
            return False
    
    async def ensure_endpoint_awake(self, model_type: str) -> bool:
        """Ensure an endpoint is awake and ready for inference"""
        if await self.is_endpoint_available(model_type):
            # Update last activity time
            self.endpoints[model_type].last_activity = time.time()
            return True
        
        # Try to wake it up
        return await self.wake_endpoint(model_type)
    
    async def get_all_endpoint_status(self) -> Dict[str, Dict[str, Any]]:
        """Get status of all endpoints"""
        status_info = {}
        
        for model_type in self.endpoints.keys():
            endpoint_info = self.endpoints[model_type]
            current_status = await self.get_endpoint_status(model_type)
            
            status_info[model_type] = {
                'status': current_status.value,
                'url': endpoint_info.url,
                'last_activity': endpoint_info.last_activity,
                'wake_time': endpoint_info.wake_time,
                'sleep_time': endpoint_info.sleep_time,
                'auto_sleep_in': self._get_auto_sleep_countdown(model_type)
            }
        
        return status_info
    
    def _get_auto_sleep_countdown(self, model_type: str) -> Optional[int]:
        """Get countdown until auto-sleep (in seconds)"""
        endpoint_info = self.endpoints[model_type]
        
        if endpoint_info.last_activity:
            elapsed = time.time() - endpoint_info.last_activity
            remaining = self.auto_sleep_timeout - elapsed
            return max(0, int(remaining)) if remaining > 0 else 0
        
        return None
    
    async def sleep_all_endpoints(self) -> Dict[str, bool]:
        """Sleep all endpoints"""
        results = {}
        
        for model_type in self.endpoints.keys():
            results[model_type] = await self.sleep_endpoint(model_type)
        
        return results
    
    async def wake_all_endpoints(self) -> Dict[str, bool]:
        """Wake all endpoints"""
        results = {}
        
        for model_type in self.endpoints.keys():
            results[model_type] = await self.wake_endpoint(model_type)
        
        return results
    
    def update_activity(self, model_type: str):
        """Update the last activity time for an endpoint"""
        if model_type in self.endpoints:
            self.endpoints[model_type].last_activity = time.time()


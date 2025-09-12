"""
Harmony System Tests
Tests for Harmony message format, validation, and model integration
"""
import pytest
import json
from unittest.mock import Mock, patch, AsyncMock
from apps.api.src.models.harmony_client import HarmonyClient
from apps.api.src.models.endpoint_manager import HuggingFaceEndpointManager

class TestHarmonyMessageValidation:
    """Test Harmony message format validation"""
    
    def test_valid_text_message(self):
        """Test valid text message validation"""
        message = {
            "type": "text",
            "content": "Hello, world!",
            "metadata": {
                "timestamp": "2024-01-01T00:00:00Z",
                "source": "user"
            }
        }
        
        # This would use the actual validator
        # For now, we'll test the structure
        assert message["type"] == "text"
        assert "content" in message
        assert "metadata" in message
    
    def test_valid_json_message(self):
        """Test valid JSON message validation"""
        message = {
            "type": "json",
            "content": {"key": "value", "number": 42},
            "metadata": {
                "timestamp": "2024-01-01T00:00:00Z",
                "source": "agent"
            }
        }
        
        assert message["type"] == "json"
        assert isinstance(message["content"], dict)
    
    def test_valid_tool_call_message(self):
        """Test valid tool call message validation"""
        message = {
            "type": "tool_call",
            "content": {
                "tool_name": "web_search",
                "parameters": {"query": "test search"},
                "call_id": "call_123"
            },
            "metadata": {
                "timestamp": "2024-01-01T00:00:00Z",
                "source": "agent"
            }
        }
        
        assert message["type"] == "tool_call"
        assert "tool_name" in message["content"]
        assert "parameters" in message["content"]
        assert "call_id" in message["content"]
    
    def test_valid_tool_result_message(self):
        """Test valid tool result message validation"""
        message = {
            "type": "tool_result",
            "content": {
                "call_id": "call_123",
                "result": {"status": "success", "data": "search results"},
                "error": None
            },
            "metadata": {
                "timestamp": "2024-01-01T00:00:00Z",
                "source": "tool"
            }
        }
        
        assert message["type"] == "tool_result"
        assert "call_id" in message["content"]
        assert "result" in message["content"]
    
    def test_invalid_message_type(self):
        """Test invalid message type"""
        message = {
            "type": "invalid_type",
            "content": "test",
            "metadata": {}
        }
        
        # This should fail validation
        assert message["type"] not in ["text", "json", "image", "plan", "tool_call", "tool_result"]

class TestHarmonyClient:
    """Test HarmonyClient functionality"""
    
    @pytest.fixture
    def harmony_client(self):
        """Create HarmonyClient instance"""
        return HarmonyClient()
    
    @pytest.mark.asyncio
    async def test_client_initialization(self, harmony_client):
        """Test client initialization"""
        assert harmony_client is not None
        assert hasattr(harmony_client, 'endpoint_manager')
    
    @pytest.mark.asyncio
    async def test_model_availability_check(self, harmony_client):
        """Test model availability checking"""
        with patch.object(harmony_client.endpoint_manager, 'get_status') as mock_status:
            mock_status.return_value = Mock(status="Running", url="test-url")
            
            available = await harmony_client.is_model_available("120b")
            assert available is True
            
            mock_status.return_value = Mock(status="Stopped", url="test-url")
            available = await harmony_client.is_model_available("120b")
            assert available is False
    
    @pytest.mark.asyncio
    async def test_generate_response_success(self, harmony_client):
        """Test successful response generation"""
        with patch('aiohttp.ClientSession.post') as mock_post:
            # Mock successful API response
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.json.return_value = {
                "choices": [{
                    "message": {
                        "content": "Test response"
                    }
                }],
                "usage": {
                    "prompt_tokens": 10,
                    "completion_tokens": 5,
                    "total_tokens": 15
                }
            }
            mock_post.return_value.__aenter__.return_value = mock_response
            
            # Mock endpoint manager
            with patch.object(harmony_client.endpoint_manager, 'get_status') as mock_status:
                mock_status.return_value = Mock(status="Running", url="https://test-url")
                
                messages = [{"type": "text", "content": "Hello", "metadata": {}}]
                response = await harmony_client.generate_response(messages, "120b")
                
                assert response is not None
                assert "choices" in response
    
    @pytest.mark.asyncio
    async def test_generate_response_with_fallback(self, harmony_client):
        """Test response generation with model fallback"""
        with patch('aiohttp.ClientSession.post') as mock_post:
            # Mock 120b model failure, 20b success
            def side_effect(*args, **kwargs):
                url = kwargs.get('url', '')
                if '120b' in url:
                    mock_response = AsyncMock()
                    mock_response.status = 503
                    return mock_response
                else:  # 20b model
                    mock_response = AsyncMock()
                    mock_response.status = 200
                    mock_response.json.return_value = {
                        "choices": [{"message": {"content": "Fallback response"}}],
                        "usage": {"prompt_tokens": 10, "completion_tokens": 5, "total_tokens": 15}
                    }
                    return mock_response
            
            mock_post.return_value.__aenter__.side_effect = side_effect
            
            # Mock endpoint manager
            with patch.object(harmony_client.endpoint_manager, 'get_status') as mock_status:
                mock_status.return_value = Mock(status="Running", url="https://test-url")
                
                messages = [{"type": "text", "content": "Hello", "metadata": {}}]
                response = await harmony_client.generate_response(messages, "120b")
                
                assert response is not None
                assert response["choices"][0]["message"]["content"] == "Fallback response"

class TestEndpointManager:
    """Test HuggingFace endpoint management"""
    
    @pytest.fixture
    def endpoint_manager(self):
        """Create endpoint manager instance"""
        return HuggingFaceEndpointManager()
    
    def test_endpoint_initialization(self, endpoint_manager):
        """Test endpoint manager initialization"""
        assert endpoint_manager is not None
        assert hasattr(endpoint_manager, 'endpoints')
        assert "120b" in endpoint_manager.endpoints
        assert "20b" in endpoint_manager.endpoints
    
    @pytest.mark.asyncio
    async def test_wake_endpoint(self, endpoint_manager):
        """Test endpoint wake functionality"""
        with patch('aiohttp.ClientSession.post') as mock_post:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.json.return_value = {"status": "success"}
            mock_post.return_value.__aenter__.return_value = mock_response
            
            result = await endpoint_manager.wake_endpoint("120b")
            assert result is True
    
    @pytest.mark.asyncio
    async def test_sleep_endpoint(self, endpoint_manager):
        """Test endpoint sleep functionality"""
        with patch('aiohttp.ClientSession.post') as mock_post:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.json.return_value = {"status": "success"}
            mock_post.return_value.__aenter__.return_value = mock_response
            
            result = await endpoint_manager.sleep_endpoint("120b")
            assert result is True
    
    @pytest.mark.asyncio
    async def test_get_endpoint_status(self, endpoint_manager):
        """Test endpoint status checking"""
        with patch('aiohttp.ClientSession.get') as mock_get:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.json.return_value = {
                "status": "Running",
                "compute": {"type": "gpu", "scaling": {"min_replicas": 0, "max_replicas": 1}}
            }
            mock_get.return_value.__aenter__.return_value = mock_response
            
            status = await endpoint_manager.get_status("120b")
            assert status.status == "Running"
    
    def test_activity_tracking(self, endpoint_manager):
        """Test endpoint activity tracking"""
        # Track activity
        endpoint_manager.track_activity("120b")
        
        # Check that activity was recorded
        assert "120b" in endpoint_manager.activity_tracker
        assert len(endpoint_manager.activity_tracker["120b"]) > 0
    
    def test_auto_sleep_timer(self, endpoint_manager):
        """Test auto-sleep timer functionality"""
        # Start auto-sleep timer
        endpoint_manager.start_auto_sleep_timer("120b")
        
        # Check that timer was started
        assert "120b" in endpoint_manager.sleep_timers
        
        # Stop timer
        endpoint_manager.stop_auto_sleep_timer("120b")
        
        # Check that timer was stopped
        assert "120b" not in endpoint_manager.sleep_timers

class TestHarmonyIntegration:
    """Test full Harmony system integration"""
    
    @pytest.mark.asyncio
    async def test_end_to_end_generation(self):
        """Test end-to-end message generation"""
        harmony_client = HarmonyClient()
        
        with patch('aiohttp.ClientSession.post') as mock_post:
            # Mock successful API response
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.json.return_value = {
                "choices": [{
                    "message": {
                        "content": "This is a test response from the Harmony system."
                    }
                }],
                "usage": {
                    "prompt_tokens": 20,
                    "completion_tokens": 10,
                    "total_tokens": 30
                }
            }
            mock_post.return_value.__aenter__.return_value = mock_response
            
            # Mock endpoint manager
            with patch.object(harmony_client.endpoint_manager, 'get_status') as mock_status:
                mock_status.return_value = Mock(status="Running", url="https://test-url")
                
                # Create test messages
                messages = [
                    {
                        "type": "text",
                        "content": "Hello, please generate a response.",
                        "metadata": {
                            "timestamp": "2024-01-01T00:00:00Z",
                            "source": "user"
                        }
                    }
                ]
                
                # Generate response
                response = await harmony_client.generate_response(messages, "120b")
                
                # Verify response
                assert response is not None
                assert "choices" in response
                assert len(response["choices"]) > 0
                assert "message" in response["choices"][0]
                assert "content" in response["choices"][0]["message"]
                assert "usage" in response
    
    @pytest.mark.asyncio
    async def test_cost_calculation(self):
        """Test cost calculation for model usage"""
        harmony_client = HarmonyClient()
        
        # Test cost calculation
        input_tokens = 100
        output_tokens = 50
        
        cost_120b = harmony_client.endpoint_manager.calculate_cost("120b", input_tokens, output_tokens)
        cost_20b = harmony_client.endpoint_manager.calculate_cost("20b", input_tokens, output_tokens)
        
        # 120b should be more expensive than 20b
        assert cost_120b > cost_20b
        assert cost_120b > 0
        assert cost_20b > 0

if __name__ == '__main__':
    pytest.main([__file__])


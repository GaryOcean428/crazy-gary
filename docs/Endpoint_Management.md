# Endpoint Management

This document describes the endpoint management system for HuggingFace inference endpoints in the Crazy-Gary application.

## Overview

The endpoint management system provides functionality to:
- Monitor endpoint status (running, sleeping, starting, stopping)
- Wake up sleeping endpoints on demand
- Put endpoints to sleep to save costs
- Track activity and auto-sleep timers
- Handle automatic fallback between 120B and 20B models

## Architecture

### Components

1. **HuggingFaceEndpointManager**: Core class that manages endpoint lifecycle
2. **HarmonyClient**: Integrates endpoint management with model inference
3. **Endpoints API**: REST API for endpoint control
4. **Auto-sleep**: Automatic scaling to zero after 15 minutes of inactivity

### Endpoint States

- **RUNNING**: Endpoint is active and ready for inference
- **SLEEPING**: Endpoint is scaled to zero (sleeping)
- **STARTING**: Endpoint is waking up
- **STOPPING**: Endpoint is scaling down
- **UNKNOWN**: Status cannot be determined
- **ERROR**: Endpoint encountered an error

## API Endpoints

### Get All Endpoint Status
```
GET /api/endpoints/status
```

Response:
```json
{
  "success": true,
  "endpoints": {
    "120b": {
      "status": "running",
      "url": "https://endpoints.huggingface.co/...",
      "last_activity": 1694567890,
      "wake_time": 1694567800,
      "sleep_time": null,
      "auto_sleep_in": 850
    },
    "20b": {
      "status": "sleeping",
      "url": "https://endpoints.huggingface.co/...",
      "last_activity": null,
      "wake_time": null,
      "sleep_time": 1694567700,
      "auto_sleep_in": null
    }
  }
}
```

### Get Specific Endpoint Status
```
GET /api/endpoints/status/{model_type}
```

Parameters:
- `model_type`: Either "120b" or "20b"

### Wake Up All Endpoints
```
POST /api/endpoints/wake
```

### Wake Up Specific Endpoint
```
POST /api/endpoints/wake/{model_type}
```

### Sleep All Endpoints
```
POST /api/endpoints/sleep
```

### Sleep Specific Endpoint
```
POST /api/endpoints/sleep/{model_type}
```

## Usage Examples

### Python Client Usage

```python
from src.models.harmony_client import HarmonyClient

async def manage_endpoints():
    async with HarmonyClient() as client:
        # Check status
        status = await client.get_all_endpoint_status()
        print(f"Endpoint status: {status}")
        
        # Wake up 120B model
        success = await client.wake_endpoint('120b')
        if success:
            print("120B endpoint is waking up")
        
        # Sleep all endpoints
        results = await client.sleep_all_endpoints()
        print(f"Sleep results: {results}")
```

### Frontend JavaScript Usage

```javascript
// Check endpoint status
const response = await fetch('/api/endpoints/status');
const data = await response.json();
console.log('Endpoint status:', data.endpoints);

// Wake up 120B endpoint
await fetch('/api/endpoints/wake/120b', { method: 'POST' });

// Sleep all endpoints
await fetch('/api/endpoints/sleep', { method: 'POST' });
```

## Cost Management

### Auto-Sleep Feature

- Endpoints automatically scale to zero after 15 minutes of inactivity
- Activity is tracked on every inference request
- Countdown timer shows remaining time before auto-sleep

### Manual Control

- Administrators can manually sleep endpoints to save costs
- Endpoints can be woken up on-demand when needed
- Batch operations allow managing all endpoints at once

### Best Practices

1. **Wake endpoints before heavy usage**: If you know you'll be making many requests, wake the endpoint first
2. **Sleep endpoints after sessions**: Manually sleep endpoints when done to save costs
3. **Monitor activity**: Use the status API to track endpoint usage and costs
4. **Use fallback strategy**: The system automatically falls back from 120B to 20B if needed

## Error Handling

### Common Scenarios

1. **Endpoint not responding**: System will attempt fallback to alternative model
2. **Wake-up timeout**: 5-minute timeout for endpoint wake-up process
3. **Management API errors**: Graceful degradation with error logging

### Retry Logic

- Automatic retry for transient network errors
- Exponential backoff for repeated failures
- Circuit breaker pattern for persistent issues

## Monitoring

### Metrics Tracked

- Endpoint status changes
- Wake-up and sleep operations
- Activity timestamps
- Error rates and types
- Cost implications

### Logging

All endpoint operations are logged with:
- Timestamp
- Operation type (wake/sleep/status)
- Model type
- Success/failure status
- Error details (if any)

## Configuration

### Environment Variables

```bash
# Required
HUGGINGFACE_API_KEY=your_api_key
HF_BASE_URL_120B=https://endpoints.huggingface.co/GaryOcean/endpoints/gpt-oss-120b-crazy-gary
HF_BASE_URL_20B=https://endpoints.huggingface.co/GaryOcean/endpoints/gpt-oss-20b-crazy-gary

# Optional
ENDPOINT_WAKE_TIMEOUT=300  # 5 minutes
ENDPOINT_AUTO_SLEEP=900    # 15 minutes
```

### Endpoint URLs

The system extracts endpoint names from the full URLs for management API calls. Ensure URLs follow the expected format:
```
https://endpoints.huggingface.co/{username}/endpoints/{endpoint-name}
```

## Security

- All management operations require valid HuggingFace API key
- CORS is configured for frontend access
- Rate limiting prevents abuse
- Audit logging for all operations


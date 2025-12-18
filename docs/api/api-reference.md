# API Reference

## Base Information

- **Base URL**: `https://crazy-gary-api.railway.app`
- **Protocol**: HTTPS only
- **Content-Type**: `application/json`
- **Authentication**: Bearer JWT tokens
- **API Version**: 1.0.0

## Authentication

All endpoints (except health checks) require authentication via Bearer tokens:

```http
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

## Health Check Endpoints

### GET /health
Basic health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "crazy-gary-api",
  "version": "1.0.0",
  "environment": "production",
  "railway_env": "production",
  "timestamp": 1640995200.123
}
```

### GET /health/ready
Readiness check - verifies environment variables.

**Response (200):**
```json
{
  "status": "ready"
}
```

**Response (503):**
```json
{
  "status": "not ready",
  "missing_env_vars": ["HUGGINGFACE_API_KEY"]
}
```

### GET /health/live
Liveness check - simple alive/dead status.

**Response:**
```json
{
  "status": "alive"
}
```

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "fullName": "John Doe"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2023-12-17T10:30:00Z",
    "last_login": "2023-12-17T10:30:00Z"
  }
}
```

**Error Responses:**
- `400`: Invalid input or weak password
- `409`: User already exists

### POST /api/auth/login
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2023-12-17T10:30:00Z",
    "last_login": "2023-12-17T10:30:00Z"
  }
}
```

**Error Response:**
- `401`: Invalid credentials

### POST /api/auth/refresh
Refresh access token using refresh token.

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

### GET /api/auth/me
Get current user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2023-12-17T10:30:00Z",
    "last_login": "2023-12-17T10:30:00Z"
  }
}
```

### PUT /api/auth/me
Update current user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Jane Doe"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane Doe",
    "created_at": "2023-12-17T10:30:00Z",
    "last_login": "2023-12-17T10:30:00Z"
  }
}
```

### POST /api/auth/change-password
Change user password.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "current_password": "OldPassword123",
  "new_password": "NewSecurePassword456"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

### GET /api/auth/validate
Validate current token and get user info.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response (401):**
```json
{
  "valid": false
}
```

## User Management Endpoints

### GET /api/users
Get all users (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2023-12-17T10:30:00Z"
  },
  {
    "id": 2,
    "username": "janedoe",
    "email": "jane@example.com",
    "created_at": "2023-12-17T11:00:00Z"
  }
]
```

### POST /api/users
Create new user (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com"
}
```

**Response (201):**
```json
{
  "id": 3,
  "username": "newuser",
  "email": "newuser@example.com",
  "created_at": "2023-12-17T12:00:00Z"
}
```

### GET /api/users/{user_id}
Get specific user by ID.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `user_id` (integer): User ID

**Response (200):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "created_at": "2023-12-17T10:30:00Z"
}
```

### PUT /api/users/{user_id}
Update user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `user_id` (integer): User ID

**Request Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

**Response (200):**
```json
{
  "id": 1,
  "username": "newusername",
  "email": "newemail@example.com",
  "created_at": "2023-12-17T10:30:00Z"
}
```

### DELETE /api/users/{user_id}
Delete user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `user_id` (integer): User ID

**Response (204):** No content

## Agent Orchestration Endpoints

### POST /api/tasks
Create new agent task.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Analyze code repository",
  "description": "Scan the repository for potential security vulnerabilities and suggest improvements",
  "model": "gpt-oss-120b",
  "priority": "high"
}
```

**Response (201):**
```json
{
  "task_id": "task_123e4567-e89b-12d3-a456-426614174000",
  "status": "created"
}
```

**Parameters:**
- `title` (string, required): Task title
- `description` (string, required): Detailed task description
- `model` (string, optional): AI model to use (default: gpt-oss-120b)
- `priority` (string, optional): Task priority (low, medium, high, critical)

### GET /api/tasks
Get all tasks for current user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (string, optional): Filter by status (created, running, completed, failed, stopped)
- `limit` (integer, optional): Number of tasks to return (default: 50)
- `offset` (integer, optional): Number of tasks to skip (default: 0)

**Response (200):**
```json
[
  {
    "id": "task_123e4567-e89b-12d3-a456-426614174000",
    "title": "Analyze code repository",
    "description": "Scan the repository for potential security vulnerabilities",
    "status": "running",
    "model": "gpt-oss-120b",
    "priority": "high",
    "progress": 45,
    "created_at": "2023-12-17T10:30:00Z",
    "updated_at": "2023-12-17T10:45:00Z"
  }
]
```

### GET /api/tasks/{task_id}
Get specific task details.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `task_id` (string): Task ID

**Response (200):**
```json
{
  "id": "task_123e4567-e89b-12d3-a456-426614174000",
  "title": "Analyze code repository",
  "description": "Scan the repository for potential security vulnerabilities",
  "status": "running",
  "model": "gpt-oss-120b",
  "priority": "high",
  "progress": 45,
  "created_at": "2023-12-17T10:30:00Z",
  "updated_at": "2023-12-17T10:45:00Z",
  "result": null,
  "error": null
}
```

### POST /api/tasks/{task_id}/start
Start executing a created task.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `task_id` (string): Task ID

**Response (200):**
```json
{
  "status": "started"
}
```

### POST /api/tasks/{task_id}/stop
Stop a running task.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `task_id` (string): Task ID

**Response (200):**
```json
{
  "status": "stopped"
}
```

### POST /api/chat
Send message to AI agent.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "message": "What can you help me with?",
  "context": "I'm working on a Python web application"
}
```

**Response (200):**
```json
{
  "response": "I can help you with various aspects of Python web development including...",
  "task_id": "task_123e4567-e89b-12d3-a456-426614174000"
}
```

### GET /api/stats
Get agent statistics.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "total_tasks": 150,
  "active_tasks": 5,
  "completed_tasks": 140,
  "failed_tasks": 5,
  "average_completion_time": 45.2,
  "success_rate": 0.967
}
```

## Endpoint Management Endpoints

### GET /api/endpoints/status
Get status of all HuggingFace inference endpoints.

**Response (200):**
```json
{
  "success": true,
  "endpoints": {
    "120b": {
      "status": "running",
      "url": "https://endpoints.huggingface.co/GaryOcean/endpoints/gpt-oss-120b-crazy-gary",
      "last_activity": 1640995200,
      "wake_time": 1640994800,
      "sleep_time": null,
      "auto_sleep_in": 850
    },
    "20b": {
      "status": "sleeping",
      "url": "https://endpoints.huggingface.co/GaryOcean/endpoints/gpt-oss-20b-crazy-gary",
      "last_activity": null,
      "wake_time": null,
      "sleep_time": 1640994000,
      "auto_sleep_in": null
    }
  }
}
```

### GET /api/endpoints/status/{model_type}
Get status of specific endpoint.

**Path Parameters:**
- `model_type` (string): Either "120b" or "20b"

**Response (200):**
```json
{
  "status": "running",
  "url": "https://endpoints.huggingface.co/GaryOcean/endpoints/gpt-oss-120b-crazy-gary",
  "last_activity": 1640995200,
  "wake_time": 1640994800,
  "sleep_time": null,
  "auto_sleep_in": 850
}
```

### POST /api/endpoints/wake
Wake up all sleeping endpoints.

**Response (200):**
```json
{
  "success": true,
  "message": "All endpoints wake operation initiated"
}
```

### POST /api/endpoints/wake/{model_type}
Wake up specific endpoint.

**Path Parameters:**
- `model_type` (string): Either "120b" or "20b"

**Response (200):**
```json
{
  "success": true,
  "message": "120B endpoint wake operation initiated"
}
```

### POST /api/endpoints/sleep
Put all running endpoints to sleep.

**Response (200):**
```json
{
  "success": true,
  "message": "All endpoints sleep operation initiated"
}
```

### POST /api/endpoints/sleep/{model_type}
Put specific endpoint to sleep.

**Path Parameters:**
- `model_type` (string): Either "120b" or "20b"

**Response (200):**
```json
{
  "success": true,
  "message": "120B endpoint sleep operation initiated"
}
```

## MCP Integration Endpoints

### GET /api/mcp/tools
Get all available MCP tools.

**Response (200):**
```json
[
  {
    "name": "search_code",
    "description": "Search through code repositories",
    "schema": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Search query"
        },
        "repository": {
          "type": "string",
          "description": "Repository URL or path"
        }
      },
      "required": ["query"]
    },
    "client": "github"
  }
]
```

### GET /api/mcp/tools/{client_name}
Get tools for specific MCP client.

**Path Parameters:**
- `client_name` (string): MCP client name

**Response (200):**
```json
[
  {
    "name": "search_code",
    "description": "Search through code repositories",
    "schema": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Search query"
        },
        "repository": {
          "type": "string",
          "description": "Repository URL or path"
        }
      },
      "required": ["query"]
    },
    "client": "github"
  }
]
```

### GET /api/mcp/tools/search
Search for MCP tools.

**Query Parameters:**
- `query` (string, required): Search query

**Response (200):**
```json
[
  {
    "name": "search_code",
    "description": "Search through code repositories",
    "schema": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Search query"
        },
        "repository": {
          "type": "string",
          "description": "Repository URL or path"
        }
      },
      "required": ["query"]
    },
    "client": "github"
  }
]
```

### POST /api/mcp/execute
Execute MCP tool.

**Request Body:**
```json
{
  "tool_name": "search_code",
  "client_name": "github",
  "parameters": {
    "query": "security vulnerability",
    "repository": "owner/repo"
  }
}
```

**Response (200):**
```json
{
  "result": {
    "files": [
      {
        "path": "src/auth.py",
        "matches": [
          {
            "line": 45,
            "content": "password = input('Password: ')  # Security issue: no validation"
          }
        ]
      }
    ]
  },
  "success": true
}
```

### GET /api/mcp/status
Get MCP integration status.

**Response (200):**
```json
{
  "status": "healthy",
  "connected_clients": ["github", "filesystem", "web"],
  "available_tools": 25,
  "last_health_check": "2023-12-17T12:00:00Z"
}
```

## Heavy Orchestration Endpoints

### POST /api/heavy/orchestrate
Start heavy orchestration workflow.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "workflow": [
    {
      "step": 1,
      "tool": "code_analyzer",
      "parameters": {
        "target": "src/",
        "type": "security"
      }
    },
    {
      "step": 2,
      "tool": "report_generator",
      "parameters": {
        "format": "pdf",
        "include_recommendations": true
      }
    }
  ],
  "config": {
    "timeout": 3600,
    "parallel": false
  }
}
```

**Response (200):**
```json
{
  "orchestration_id": "orch_123e4567-e89b-12d3-a456-426614174000",
  "status": "started",
  "total_steps": 2,
  "estimated_duration": 300
}
```

### GET /api/heavy/progress
Get orchestration progress.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `orchestration_id` (string, optional): Specific orchestration to check

**Response (200):**
```json
{
  "orchestration_id": "orch_123e4567-e89b-12d3-a456-426614174000",
  "progress": 45.5,
  "status": "running",
  "current_step": 1,
  "total_steps": 2,
  "steps": [
    {
      "step": 1,
      "name": "Code Analysis",
      "status": "completed",
      "progress": 100,
      "duration": 120
    },
    {
      "step": 2,
      "name": "Report Generation",
      "status": "running",
      "progress": 50,
      "duration": 80
    }
  ],
  "estimated_time_remaining": 150
}
```

### GET /api/heavy/tools
Get available orchestration tools.

**Response (200):**
```json
[
  {
    "name": "code_analyzer",
    "description": "Analyze code for security, performance, and quality issues",
    "category": "analysis",
    "parameters": {
      "target": {
        "type": "string",
        "description": "Target directory or file",
        "required": true
      },
      "type": {
        "type": "string",
        "enum": ["security", "performance", "quality", "all"],
        "description": "Analysis type",
        "required": true
      }
    }
  },
  {
    "name": "report_generator",
    "description": "Generate reports in various formats",
    "category": "reporting",
    "parameters": {
      "format": {
        "type": "string",
        "enum": ["pdf", "html", "json"],
        "description": "Output format",
        "required": true
      },
      "include_recommendations": {
        "type": "boolean",
        "description": "Include recommendations in report",
        "required": false
      }
    }
  }
]
```

### POST /api/heavy/tools/execute
Execute specific orchestration tool.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "tool_name": "code_analyzer",
  "parameters": {
    "target": "src/",
    "type": "security"
  }
}
```

**Response (200):**
```json
{
  "result": {
    "vulnerabilities": [
      {
        "file": "src/auth.py",
        "line": 45,
        "severity": "high",
        "type": "SQL Injection",
        "description": "User input directly concatenated into SQL query"
      }
    ],
    "summary": {
      "total_issues": 5,
      "high_severity": 2,
      "medium_severity": 2,
      "low_severity": 1
    }
  },
  "execution_time": 45.2,
  "success": true
}
```

## Monitoring Endpoints

### GET /api/monitoring/health
Basic health monitoring.

**Response (200):**
```json
{
  "status": "healthy",
  "service": "crazy-gary",
  "timestamp": "2023-12-17T12:00:00Z"
}
```

### GET /api/monitoring/health/detailed
Detailed health monitoring.

**Response (200):**
```json
{
  "overall": {
    "status": "healthy",
    "service": "crazy-gary",
    "timestamp": "2023-12-17T12:00:00Z"
  },
  "components": {
    "database": {
      "status": "healthy",
      "last_check": "2023-12-17T12:00:00Z",
      "response_time": 15.2
    },
    "redis": {
      "status": "healthy",
      "last_check": "2023-12-17T12:00:00Z",
      "response_time": 5.1
    },
    "huggingface_api": {
      "status": "degraded",
      "last_check": "2023-12-17T12:00:00Z",
      "response_time": 2500.0,
      "error_rate": 0.05
    }
  }
}
```

### GET /api/monitoring/metrics
Get system performance metrics.

**Response (200):**
```json
{
  "cpu": {
    "usage": 45.2,
    "load_average": [1.2, 1.1, 0.9]
  },
  "memory": {
    "used": 2048,
    "total": 8192,
    "usage_percent": 25.0
  },
  "disk": {
    "used": 51200,
    "total": 102400,
    "usage_percent": 50.0
  },
  "network": {
    "bytes_sent": 1024000,
    "bytes_received": 2048000,
    "packets_sent": 1000,
    "packets_received": 2000
  },
  "requests": {
    "total": 15000,
    "successful": 14700,
    "failed": 300,
    "average_response_time": 125.5
  }
}
```

### GET /api/monitoring/logs/requests
Get recent HTTP request logs.

**Query Parameters:**
- `limit` (integer, optional): Number of logs to return (default: 100)
- `start_time` (string, optional): ISO 8601 timestamp to start from

**Response (200):**
```json
[
  {
    "timestamp": "2023-12-17T12:00:00Z",
    "method": "POST",
    "path": "/api/tasks",
    "status_code": 201,
    "response_time": 145.2,
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.100"
  }
]
```

### GET /api/monitoring/logs/errors
Get recent error logs.

**Query Parameters:**
- `level` (string, optional): Filter by log level (error, warning, info)
- `limit` (integer, optional): Number of logs to return (default: 100)

**Response (200):**
```json
[
  {
    "timestamp": "2023-12-17T12:00:00Z",
    "level": "error",
    "message": "Database connection timeout",
    "stack_trace": "Traceback (most recent call last)...",
    "component": "database",
    "request_id": "req_123e4567"
  }
]
```

### GET /api/monitoring/alerts
Get active system alerts.

**Response (200):**
```json
[
  {
    "id": "alert_123e4567",
    "type": "performance",
    "severity": "medium",
    "message": "High CPU usage detected (>80%)",
    "timestamp": "2023-12-17T12:00:00Z",
    "component": "system",
    "acknowledged": false
  }
]
```

## Comprehensive Monitoring Endpoints

### GET /api/monitoring/health/dashboard
Get monitoring dashboard data.

**Response (200):**
```json
{
  "health": {
    "status": "healthy",
    "service": "crazy-gary",
    "timestamp": "2023-12-17T12:00:00Z"
  },
  "metrics": {
    "cpu": {"usage": 45.2},
    "memory": {"usage_percent": 25.0},
    "requests": {"total": 15000}
  },
  "alerts": [
    {
      "id": "alert_123e4567",
      "severity": "medium",
      "message": "High CPU usage",
      "timestamp": "2023-12-17T12:00:00Z"
    }
  ],
  "incidents": []
}
```

### GET /api/monitoring/incidents
Get system incidents.

**Query Parameters:**
- `status` (string, optional): Filter by status (open, investigating, resolved)
- `severity` (string, optional): Filter by severity (low, medium, high, critical)
- `limit` (integer, optional): Number of incidents to return (default: 50)

**Response (200):**
```json
[
  {
    "id": "inc_123e4567",
    "title": "Database performance degradation",
    "status": "investigating",
    "severity": "medium",
    "created_at": "2023-12-17T11:30:00Z",
    "updated_at": "2023-12-17T12:00:00Z",
    "description": "Database queries taking longer than normal",
    "assignee": "admin@crazy-gary.com"
  }
]
```

### POST /api/monitoring/incidents
Create new incident.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "API endpoint returning 500 errors",
  "description": "The /api/tasks endpoint is returning 500 errors",
  "severity": "high"
}
```

**Response (201):**
```json
{
  "id": "inc_123e4567",
  "status": "open"
}
```

## Observability Endpoints

### GET /api/observability/metrics
Get observability metrics.

**Response (200):**
```json
{
  "traces": {
    "total": 1000,
    "error_rate": 0.02,
    "average_latency": 145.5
  },
  "spans": {
    "total": 5000,
    "db_spans": 2000,
    "external_spans": 500
  },
  "events": {
    "total": 2500,
    "agent_events": 1000,
    "task_events": 1500
  }
}
```

### GET /api/observability/traces/active
Get currently active traces.

**Query Parameters:**
- `limit` (integer, optional): Number of traces to return (default: 50)

**Response (200):**
```json
[
  {
    "trace_id": "trace_123e4567",
    "span_id": "span_123e4567",
    "operation_name": "create_task",
    "start_time": "2023-12-17T12:00:00Z",
    "duration": 145.2,
    "tags": {
      "user_id": "1",
      "model": "gpt-oss-120b"
    }
  }
]
```

### GET /api/observability/events/stream
Stream real-time events (Server-Sent Events).

**Response:**
```
data: {"event": "task_created", "data": {"task_id": "task_123", "user_id": "1"}}

data: {"event": "task_completed", "data": {"task_id": "task_123", "duration": 145.2}}
```

## Error Handling

### Standard Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Response Format

```json
{
  "error": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details",
    "validation_errors": ["Email is required", "Password too short"]
  },
  "timestamp": "2023-12-17T12:00:00Z",
  "request_id": "req_123e4567"
}
```

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| AUTH_REQUIRED | Authentication token missing or invalid | Include valid Bearer token |
| TOKEN_EXPIRED | Access token has expired | Refresh token or re-login |
| INVALID_CREDENTIALS | Email or password incorrect | Check credentials |
| USER_EXISTS | User already registered | Use different email |
| VALIDATION_ERROR | Request data validation failed | Check request format |
| RATE_LIMIT_EXCEEDED | Too many requests | Wait and retry |
| ENDPOINT_UNAVAILABLE | HuggingFace endpoint not available | Try different model or wait |
| TASK_NOT_FOUND | Task ID does not exist | Verify task ID |
| INSUFFICIENT_PERMISSIONS | User lacks required permissions | Contact administrator |

## Rate Limiting

### Rate Limit Headers

All responses include rate limiting information:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 3600
```

### Rate Limits by Endpoint Type

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 10 requests | 1 hour |
| General API | 1000 requests | 1 hour |
| Endpoint Management | 100 requests | 1 hour |
| Monitoring | 500 requests | 1 hour |

### Handling Rate Limits

When you receive a 429 status code:

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 300
}
```

Wait `retry_after` seconds before making another request.

## Pagination

For endpoints that return lists, use query parameters:

- `limit` (integer): Number of items per page (default: 50, max: 100)
- `offset` (integer): Number of items to skip (default: 0)

### Pagination Response Format

```json
{
  "items": [...],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

## WebSocket Support

The API supports WebSocket connections for real-time features:

### Connection URL
```
wss://crazy-gary-api.railway.app/socket.io/
```

### Authentication
Authenticate WebSocket connections by including the JWT token in the query parameters:

```
wss://crazy-gary-api.railway.app/socket.io/?token=<your-jwt-token>
```

### Event Types

- `task_update`: Task status or progress changed
- `orchestration_update`: Heavy orchestration progress update
- `system_alert`: New system alert generated
- `health_status`: System health status change

### Example WebSocket Usage

```javascript
const socket = io('https://crazy-gary-api.railway.app', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('task_update', (data) => {
  console.log('Task updated:', data);
  updateTaskProgress(data.task_id, data.progress);
});

socket.on('system_alert', (data) => {
  console.log('New alert:', data);
  showAlert(data.message, data.severity);
});
```
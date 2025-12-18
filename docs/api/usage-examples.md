# API Usage Examples & Tutorials

This document provides practical examples and tutorials for using the Crazy-Gary API effectively.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication Tutorial](#authentication-tutorial)
3. [Task Management Examples](#task-management-examples)
4. [Endpoint Management Examples](#endpoint-management-examples)
5. [Real-World Use Cases](#real-world-use-cases)
6. [Integration Examples](#integration-examples)
7. [Best Practices](#best-practices)

## Getting Started

### Prerequisites

Before using the Crazy-Gary API, ensure you have:

1. **Valid API Access**: Sign up at [Crazy-Gary](https://crazy-gary.com) to get API credentials
2. **HTTP Client**: Any HTTP client (cURL, Postman, or programmatic client)
3. **JSON Knowledge**: Basic understanding of JSON format
4. **Authentication Setup**: Understanding of JWT tokens

### Quick Test

Test your API access with a simple health check:

```bash
curl -X GET https://crazy-gary-api.railway.app/health
```

**Expected Response:**
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

## Authentication Tutorial

### Step 1: User Registration

Create a new user account:

```bash
curl -X POST https://crazy-gary-api.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "password": "SecurePassword123",
    "fullName": "John Developer"
  }'
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "developer@example.com",
    "name": "John Developer",
    "created_at": "2023-12-17T10:30:00Z",
    "last_login": "2023-12-17T10:30:00Z"
  }
}
```

### Step 2: Store Tokens

Store the tokens securely (example in JavaScript):

```javascript
const tokens = {
  access: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  refresh: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  expiresAt: Date.now() + (3600 * 1000) // 1 hour from now
};

// Store in secure storage (localStorage for demo, use secure storage in production)
localStorage.setItem('crazyGaryTokens', JSON.stringify(tokens));
```

### Step 3: Use Token in Requests

```bash
# Save the token to a variable for reuse
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Test authenticated request
curl -X GET https://crazy-gary-api.railway.app/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Step 4: Token Refresh

When your token expires, refresh it:

```bash
curl -X POST https://crazy-gary-api.railway.app/api/auth/refresh \
  -H "Authorization: Bearer $REFRESH_TOKEN"
```

## Task Management Examples

### Creating Your First Task

```bash
curl -X POST https://crazy-gary-api.railway.app/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Analyze Python Codebase",
    "description": "Scan the repository for security vulnerabilities and performance issues",
    "model": "gpt-oss-120b",
    "priority": "high"
  }'
```

**Response:**
```json
{
  "task_id": "task_123e4567-e89b-12d3-a456-426614174000",
  "status": "created"
}
```

### Starting Task Execution

```bash
curl -X POST https://crazy-gary-api.railway.app/api/tasks/task_123e4567-e89b-12d3-a456-426614174000/start \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "status": "started"
}
```

### Monitoring Task Progress

```bash
# Get task details
curl -X GET https://crazy-gary-api.railway.app/api/tasks/task_123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer $TOKEN"

# Get all tasks
curl -X GET https://crazy-gary-api.railway.app/api/tasks \
  -H "Authorization: Bearer $TOKEN"
```

**Task Response:**
```json
{
  "id": "task_123e4567-e89b-12d3-a456-426614174000",
  "title": "Analyze Python Codebase",
  "description": "Scan the repository for security vulnerabilities and performance issues",
  "status": "running",
  "model": "gpt-oss-120b",
  "priority": "high",
  "progress": 65,
  "created_at": "2023-12-17T10:30:00Z",
  "updated_at": "2023-12-17T10:45:00Z",
  "result": null,
  "error": null
}
```

### Chat with AI Agent

```bash
curl -X POST https://crazy-gary-api.railway.app/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How can I optimize this Python function for better performance?",
    "context": "I have a function that processes large datasets and it\'s running slowly"
  }'
```

**Response:**
```json
{
  "response": "To optimize your Python function for processing large datasets, consider these approaches:\n\n1. **Use vectorized operations with NumPy**...\n\n2. **Implement parallel processing**...\n\n3. **Profile your code**...",
  "task_id": "task_789e4567-e89b-12d3-a456-426614174001"
}
```

## Endpoint Management Examples

### Check Endpoint Status

```bash
curl -X GET https://crazy-gary-api.railway.app/api/endpoints/status
```

**Response:**
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

### Wake Up Sleeping Endpoints

```bash
# Wake up all endpoints
curl -X POST https://crazy-gary-api.railway.app/api/endpoints/wake

# Wake up specific endpoint
curl -X POST https://crazy-gary-api.railway.app/api/endpoints/wake/120b
```

### Cost-Effective Endpoint Management

```bash
#!/bin/bash
# cost-effective-endpoint-management.sh

# Check current status
echo "Checking endpoint status..."
STATUS=$(curl -s https://crazy-gary-api.railway.app/api/endpoints/status)
echo "$STATUS" | jq '.'

# Get current hour (for usage pattern analysis)
CURRENT_HOUR=$(date +%H)

# If it's outside peak hours (9 AM - 6 PM) and endpoints are running, consider sleeping them
if [ "$CURRENT_HOW" -lt 9 ] || [ "$CURRENT_HOUR" -gt 18 ]; then
    echo "Outside peak hours. Checking if endpoints should be slept..."
    
    # Check if any endpoints are running
    RUNNING_ENDPOINTS=$(echo "$STATUS" | jq '.endpoints | to_entries[] | select(.value.status == "running") | .key')
    
    if [ ! -z "$RUNNING_ENDPOINTS" ]; then
        echo "Found running endpoints outside peak hours: $RUNNING_ENDPOINTS"
        echo "Consider running: curl -X POST https://crazy-gary-api.railway.app/api/endpoints/sleep"
    fi
fi

# Check auto-sleep countdown
AUTO_SLEEP_120B=$(echo "$STATUS" | jq '.endpoints."120b".auto_sleep_in')
if [ "$AUTO_SLEEP_120B" != "null" ] && [ "$AUTO_SLEEP_120B" -lt 300 ]; then
    echo "120B endpoint will auto-sleep in $AUTO_SLEEP_120B seconds"
fi
```

## Real-World Use Cases

### Use Case 1: Automated Code Review System

Build an automated code review system that analyzes pull requests:

```javascript
// automated-code-review.js

class CodeReviewBot {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseURL = 'https://crazy-gary-api.railway.app';
  }

  async reviewPullRequest(prData) {
    try {
      // Create analysis task
      const task = await this.createTask({
        title: `Code Review: ${prData.title}`,
        description: `Analyze the code changes in pull request #${prData.number} for:
          - Security vulnerabilities
          - Performance issues
          - Code quality
          - Best practices compliance
          - Documentation completeness`,
        priority: 'high'
      });

      console.log(`Started code review task: ${task.task_id}`);

      // Monitor task progress
      const result = await this.monitorTask(task.task_id);
      
      if (result.status === 'completed') {
        await this.postReviewComments(prData, result.result);
      }

      return result;
    } catch (error) {
      console.error('Code review failed:', error);
    }
  }

  async createTask(taskData) {
    const response = await fetch(`${this.baseURL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    return response.json();
  }

  async monitorTask(taskId, maxWaitTime = 1800) { // 30 minutes max
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime * 1000) {
      const response = await fetch(`${this.baseURL}/api/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      });

      const task = await response.json();
      
      if (task.status === 'completed') {
        return task;
      } else if (task.status === 'failed') {
        throw new Error(`Task failed: ${task.error}`);
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new Error('Task monitoring timeout');
  }

  async postReviewComments(prData, reviewResult) {
    // Post automated review comments to GitHub
    // This would integrate with GitHub API
    console.log('Posting review comments...');
  }
}

// Usage
const bot = new CodeReviewBot('your-api-token');

// Example GitHub webhook handler
app.post('/webhook/github', async (req, res) => {
  if (req.body.action === 'opened' && req.body.pull_request) {
    await bot.reviewPullRequest(req.body.pull_request);
  }
  res.status(200).end();
});
```

### Use Case 2: DevOps Monitoring Dashboard

Create a comprehensive monitoring dashboard:

```python
# monitoring-dashboard.py

import requests
import json
import time
from datetime import datetime, timedelta
import matplotlib.pyplot as plt

class CrazyGaryMonitor:
    def __init__(self, api_token):
        self.api_token = api_token
        self.base_url = "https://crazy-gary-api.railway.app"
        self.headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        }
    
    def get_system_health(self):
        """Get overall system health status"""
        try:
            response = requests.get(f"{self.base_url}/api/monitoring/health/detailed")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Failed to get system health: {e}")
            return None
    
    def get_endpoint_status(self):
        """Get status of all endpoints"""
        try:
            response = requests.get(f"{self.base_url}/api/endpoints/status")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Failed to get endpoint status: {e}")
            return None
    
    def get_task_statistics(self):
        """Get task execution statistics"""
        try:
            response = requests.get(f"{self.base_url}/api/stats", headers=self.headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Failed to get task statistics: {e}")
            return None
    
    def monitor_endpoint_costs(self, hours=24):
        """Monitor endpoint costs by tracking wake/sleep cycles"""
        status_history = []
        
        for i in range(hours):
            status = self.get_endpoint_status()
            if status:
                timestamp = datetime.now() - timedelta(hours=hours-i)
                status_history.append({
                    'timestamp': timestamp,
                    'status': status['endpoints']
                })
            time.sleep(60)  # Check every minute
        
        return status_history
    
    def generate_cost_report(self, status_history):
        """Generate cost optimization report"""
        running_hours = {'120b': 0, '20b': 0}
        
        for entry in status_history:
            for model, endpoint_status in entry['status'].items():
                if endpoint_status['status'] == 'running':
                    running_hours[model] += 1/60  # Convert minutes to hours
        
        cost_estimate = {
            '120b_model_hours': running_hours['120b'],
            '20b_model_hours': running_hours['20b'],
            'estimated_cost_120b': running_hours['120b'] * 0.50,  # $0.50/hour
            'estimated_cost_20b': running_hours['20b'] * 0.20,    # $0.20/hour
            'total_estimated_cost': (running_hours['120b'] * 0.50) + (running_hours['20b'] * 0.20),
            'recommendations': []
        }
        
        # Add recommendations
        if running_hours['120b'] > 8:
            cost_estimate['recommendations'].append(
                "High usage of 120B model detected. Consider optimizing tasks to use 20B model where possible."
            )
        
        if running_hours['120b'] + running_hours['20b'] < 4:
            cost_estimate['recommendations'].append(
                "Low usage detected. Consider implementing auto-sleep policies."
            )
        
        return cost_estimate
    
    def create_monitoring_report(self):
        """Create comprehensive monitoring report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'system_health': self.get_system_health(),
            'endpoint_status': self.get_endpoint_status(),
            'task_stats': self.get_task_statistics(),
            'recommendations': []
        }
        
        # Add recommendations based on health status
        if report['system_health']:
            if report['system_health']['overall']['status'] != 'healthy':
                report['recommendations'].append(
                    "System health is not optimal. Check component statuses."
                )
        
        # Add endpoint recommendations
        if report['endpoint_status']:
            for model, status in report['endpoint_status']['endpoints'].items():
                if status['auto_sleep_in'] and status['auto_sleep_in'] < 300:
                    report['recommendations'].append(
                        f"{model} endpoint will auto-sleep in {status['auto_sleep_in']} seconds."
                    )
        
        return report

# Usage
monitor = CrazyGaryMonitor('your-api-token')

# Generate monitoring report
report = monitor.create_monitoring_report()
print(json.dumps(report, indent=2))

# Monitor costs over 24 hours
cost_history = monitor.monitor_endpoint_costs(hours=24)
cost_report = monitor.generate_cost_report(cost_history)
print("Cost Report:", json.dumps(cost_report, indent=2))
```

### Use Case 3: Intelligent Task Queue

Build an intelligent task queue system:

```typescript
// intelligent-task-queue.ts

interface TaskDefinition {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_duration: number; // in seconds
  required_model: 'gpt-oss-120b' | 'gpt-oss-20b';
  dependencies?: string[]; // task IDs that must complete first
}

class IntelligentTaskQueue {
  private tasks: Map<string, TaskDefinition> = new Map();
  private runningTasks: Set<string> = new Set();
  private completedTasks: Set<string> = new Set();
  private taskQueue: string[] = [];
  private maxConcurrentTasks: number = 3;

  constructor(private apiClient: CrazyGaryClient) {}

  async addTask(task: TaskDefinition): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.tasks.set(taskId, task);
    
    // Check dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      const unmetDependencies = task.dependencies.filter(dep => 
        !this.completedTasks.has(dep)
      );
      
      if (unmetDependencies.length > 0) {
        console.log(`Task ${taskId} waiting for dependencies: ${unmetDependencies}`);
        return taskId;
      }
    }
    
    this.taskQueue.push(taskId);
    this.processQueue();
    
    return taskId;
  }

  private async processQueue() {
    while (this.runningTasks.size < this.maxConcurrentTasks && this.taskQueue.length > 0) {
      const taskId = this.taskQueue.shift()!;
      await this.executeTask(taskId);
    }
  }

  private async executeTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    this.runningTasks.add(taskId);

    try {
      console.log(`Starting task: ${task.title}`);
      
      // Check endpoint availability and wake if needed
      await this.ensureEndpointAvailability(task.required_model);
      
      // Create and start task
      const apiTask = await this.apiClient.createTask(task.title, task.description);
      await this.apiClient.startTask(apiTask.task_id);
      
      // Monitor task progress
      const result = await this.monitorTask(apiTask.task_id, task.estimated_duration);
      
      if (result.status === 'completed') {
        this.completedTasks.add(taskId);
        console.log(`Task completed: ${task.title}`);
        
        // Check if any waiting tasks can now proceed
        this.processQueue();
      }
      
    } catch (error) {
      console.error(`Task failed: ${task.title}`, error);
    } finally {
      this.runningTasks.delete(taskId);
      this.processQueue();
    }
  }

  private async ensureEndpointAvailability(model: string) {
    const status = await this.apiClient.getEndpointStatus(model);
    
    if (status.status === 'sleeping') {
      console.log(`Waking up ${model} endpoint...`);
      await this.apiClient.wakeEndpoint(model);
      
      // Wait for endpoint to be ready
      await this.waitForEndpointReady(model);
    }
  }

  private async waitForEndpointReady(model: string, maxWaitTime = 300) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime * 1000) {
      const status = await this.apiClient.getEndpointStatus(model);
      
      if (status.status === 'running') {
        console.log(`${model} endpoint is ready`);
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    throw new Error(`${model} endpoint did not become ready in time`);
  }

  private async monitorTask(taskId: string, estimatedDuration: number) {
    const startTime = Date.now();
    const maxWaitTime = Math.max(estimatedDuration * 2, 600); // At least 10 minutes
    
    while (Date.now() - startTime < maxWaitTime * 1000) {
      const task = await this.apiClient.getTask(taskId);
      
      if (task.status === 'completed' || task.status === 'failed') {
        return task;
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // Check every 10 seconds
    }
    
    throw new Error(`Task monitoring timeout after ${maxWaitTime} seconds`);
  }

  getQueueStatus() {
    return {
      queued: this.taskQueue.length,
      running: this.runningTasks.size,
      completed: this.completedTasks.size,
      total: this.tasks.size
    };
  }
}

// Usage
const queue = new IntelligentTaskQueue(apiClient);

// Add tasks with dependencies
await queue.addTask({
  title: "Initialize Project",
  description: "Set up project structure and dependencies",
  priority: "critical",
  estimated_duration: 300,
  required_model: "gpt-oss-20b"
});

await queue.addTask({
  title: "Security Audit",
  description: "Perform comprehensive security audit",
  priority: "high",
  estimated_duration: 1800,
  required_model: "gpt-oss-120b",
  dependencies: [] // Will start immediately
});

await queue.addTask({
  title: "Performance Optimization",
  description: "Optimize application performance",
  priority: "medium",
  estimated_duration: 1200,
  required_model: "gpt-oss-120b",
  dependencies: ["security-audit-task-id"] // Will wait for security audit
});

// Monitor queue
setInterval(() => {
  const status = queue.getQueueStatus();
  console.log('Queue Status:', status);
}, 30000);
```

## Integration Examples

### Integration with GitHub Actions

Create a GitHub Actions workflow that uses the Crazy-Gary API:

```yaml
# .github/workflows/crazy-gary-analysis.yml
name: Crazy-Gary Code Analysis

on:
  pull_request:
    types: [opened, synchronize]
  push:
    branches: [main]

jobs:
  analyze-code:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: |
        pip install requests
    
    - name: Run Crazy-Gary Analysis
      env:
        CRAZY_GARY_API_TOKEN: ${{ secrets.CRAZY_GARY_API_TOKEN }}
      run: |
        python scripts/crazy-gary-analysis.py
        
    - name: Comment on PR
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          const analysis = fs.readFileSync('analysis-results.json', 'utf8');
          const results = JSON.parse(analysis);
          
          let comment = '## 🔍 Crazy-Gary Code Analysis Results\n\n';
          
          if (results.security_issues > 0) {
            comment += `⚠️ **Security Issues Found**: ${results.security_issues}\n`;
          }
          
          if (results.performance_issues > 0) {
            comment += `🚀 **Performance Issues Found**: ${results.performance_issues}\n`;
          }
          
          comment += `\n📊 **Analysis Summary**:\n`;
          comment += `- Total Issues: ${results.total_issues}\n`;
          comment += `- Files Analyzed: ${results.files_analyzed}\n`;
          comment += `- Analysis Time: ${results.analysis_time}s\n`;
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: comment
          });
```

### Integration with Slack

Send notifications to Slack:

```python
# slack-notifications.py

import requests
import json
from datetime import datetime

class SlackNotifier:
    def __init__(self, webhook_url, api_token):
        self.webhook_url = webhook_url
        self.api_token = api_token
        self.base_url = "https://crazy-gary-api.railway.app"
        self.headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        }
    
    def notify_task_completion(self, task_id):
        """Notify when a task is completed"""
        # Get task details
        response = requests.get(f"{self.base_url}/api/tasks/{task_id}", headers=self.headers)
        task = response.json()
        
        # Create Slack message
        message = {
            "text": f"✅ Task Completed: {task['title']}",
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Task Completed*\n*{task['title']}*\n\n{task['description']}"
                    }
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": f"Model: {task['model']} | Priority: {task['priority']} | Duration: {task.get('duration', 'N/A')}"
                        }
                    ]
                }
            ]
        }
        
        self.send_message(message)
    
    def notify_system_alert(self, alert):
        """Notify system alerts"""
        color = {
            'low': '#36a64f',
            'medium': '#ff9500', 
            'high': '#ff0000',
            'critical': '#8B0000'
        }.get(alert['severity'], '#36a64f')
        
        message = {
            "text": f"🚨 System Alert: {alert['message']}",
            "attachments": [
                {
                    "color": color,
                    "fields": [
                        {
                            "title": "Severity",
                            "value": alert['severity'],
                            "short": True
                        },
                        {
                            "title": "Component",
                            "value": alert.get('component', 'Unknown'),
                            "short": True
                        },
                        {
                            "title": "Timestamp",
                            "value": datetime.fromtimestamp(alert['timestamp']).strftime('%Y-%m-%d %H:%M:%S'),
                            "short": False
                        }
                    ]
                }
            ]
        }
        
        self.send_message(message)
    
    def send_message(self, message):
        """Send message to Slack"""
        try:
            response = requests.post(self.webhook_url, json=message)
            response.raise_for_status()
            print("Message sent to Slack successfully")
        except Exception as e:
            print(f"Failed to send Slack message: {e}")

# Usage
notifier = SlackNotifier('your-slack-webhook', 'your-api-token')

# Monitor tasks and send notifications
def monitor_tasks():
    while True:
        try:
            # Get recent tasks
            response = requests.get(f"{notifier.base_url}/api/tasks", headers=notifier.headers)
            tasks = response.json()
            
            # Check for newly completed tasks
            for task in tasks:
                if task['status'] == 'completed' and not task.get('notified'):
                    notifier.notify_task_completion(task['id'])
                    # Mark as notified (you'd implement this)
            
            time.sleep(60)  # Check every minute
            
        except Exception as e:
            print(f"Monitoring error: {e}")
            time.sleep(300)  # Wait 5 minutes on error
```

### Integration with Prometheus

Export metrics for Prometheus:

```python
# prometheus-metrics.py

from prometheus_client import start_http_server, Gauge, Counter, Histogram
import requests
import time
import threading

# Define metrics
task_counter = Counter('crazy_gary_tasks_total', 'Total tasks created', ['status', 'model', 'priority'])
task_duration = Histogram('crazy_gary_task_duration_seconds', 'Task execution duration', ['model'])
endpoint_status = Gauge('crazy_gary_endpoint_status', 'Endpoint status (1=running, 0=sleeping)', ['model'])
system_health = Gauge('crazy_gary_system_health', 'System health status (1=healthy, 0=unhealthy)')
api_requests_total = Counter('crazy_gary_api_requests_total', 'Total API requests', ['method', 'endpoint', 'status'])

class MetricsCollector:
    def __init__(self, api_token, collection_interval=30):
        self.api_token = api_token
        self.base_url = "https://crazy-gary-api.railway.app"
        self.headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        }
        self.collection_interval = collection_interval
        self.running = False
    
    def collect_metrics(self):
        """Collect metrics from Crazy-Gary API"""
        while self.running:
            try:
                self.collect_task_metrics()
                self.collect_endpoint_metrics()
                self.collect_system_health()
                time.sleep(self.collection_interval)
            except Exception as e:
                print(f"Error collecting metrics: {e}")
                time.sleep(self.collection_interval)
    
    def collect_task_metrics(self):
        """Collect task-related metrics"""
        try:
            # Get task statistics
            response = requests.get(f"{self.base_url}/api/stats", headers=self.headers)
            stats = response.json()
            
            # Update counters
            task_counter.labels(status='total', model='all', priority='all')._value._value = stats['total_tasks']
            task_counter.labels(status='active', model='all', priority='all')._value._value = stats['active_tasks']
            task_counter.labels(status='completed', model='all', priority='all')._value._value = stats['completed_tasks']
            task_counter.labels(status='failed', model='all', priority='all')._value._value = stats['failed_tasks']
            
            # Get recent tasks for duration metrics
            response = requests.get(f"{self.base_url}/api/tasks", headers=self.headers)
            tasks = response.json()
            
            for task in tasks:
                if task['status'] == 'completed' and task.get('duration'):
                    task_duration.labels(model=task['model']).observe(task['duration'])
                    
        except Exception as e:
            print(f"Error collecting task metrics: {e}")
    
    def collect_endpoint_metrics(self):
        """Collect endpoint-related metrics"""
        try:
            response = requests.get(f"{self.base_url}/api/endpoints/status")
            data = response.json()
            
            for model, status_info in data['endpoints'].items():
                is_running = 1 if status_info['status'] == 'running' else 0
                endpoint_status.labels(model=model).set(is_running)
                
        except Exception as e:
            print(f"Error collecting endpoint metrics: {e}")
    
    def collect_system_health(self):
        """Collect system health metrics"""
        try:
            response = requests.get(f"{self.base_url}/api/monitoring/health")
            health = response.json()
            
            is_healthy = 1 if health['status'] == 'healthy' else 0
            system_health.set(is_healthy)
            
        except Exception as e:
            print(f"Error collecting system health: {e}")
            system_health.set(0)
    
    def start(self):
        """Start metrics collection"""
        self.running = True
        self.thread = threading.Thread(target=self.collect_metrics)
        self.thread.daemon = True
        self.thread.start()
    
    def stop(self):
        """Stop metrics collection"""
        self.running = False

# Start Prometheus metrics server
start_http_server(8000)

# Start metrics collection
collector = MetricsCollector('your-api-token', collection_interval=30)
collector.start()

print("Prometheus metrics server started on port 8000")
print("Metrics collection started")

# Keep the script running
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    collector.stop()
    print("Metrics collection stopped")
```

## Best Practices

### 1. Error Handling

Always implement proper error handling:

```typescript
async function safeAPICall<T>(operation: () => Promise<T>): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      // Redirect to login
      window.location.href = '/login';
      return null;
    } else if (error instanceof RateLimitError) {
      // Handle rate limiting
      await new Promise(resolve => setTimeout(resolve, error.retryAfter * 1000));
      return await operation(); // Retry
    } else {
      // Log other errors
      console.error('API call failed:', error);
      return null;
    }
  }
}
```

### 2. Request Batching

Batch multiple requests when possible:

```typescript
class RequestBatcher {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private batchSize = 10;
  private batchTimeout = 1000; // 1 second

  async addRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processBatch();
    });
  }

  private async processBatch() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      
      await Promise.allSettled(batch.map(request => request()));

      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.batchTimeout));
      }
    }

    this.processing = false;
  }
}
```

### 3. Caching

Implement caching for frequently accessed data:

```typescript
class APICache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    
    this.cache.delete(key);
    return null;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new APICache();

async function getCachedTask(taskId: string) {
  const cacheKey = `task_${taskId}`;
  let task = cache.get(cacheKey);
  
  if (!task) {
    task = await apiClient.getTask(taskId);
    cache.set(cacheKey, task);
  }
  
  return task;
}
```

### 4. Connection Pooling

For high-throughput applications, implement connection pooling:

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class ConnectionPool:
    def __init__(self, base_url, token, pool_size=10):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
        
        # Configure connection pooling
        adapter = HTTPAdapter(
            pool_connections=pool_size,
            pool_maxsize=pool_size,
            max_retries=Retry(
                total=3,
                backoff_factor=0.1,
                status_forcelist=[429, 500, 502, 503, 504]
            )
        )
        
        self.session.mount('http://', adapter)
        self.session.mount('https://', adapter)
        
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get(self, endpoint):
        return self.session.get(f"{self.base_url}{endpoint}", headers=self.headers)
    
    def post(self, endpoint, json_data):
        return self.session.post(f"{self.base_url}{endpoint}", 
                                headers=self.headers, json=json_data)
```

### 5. Monitoring and Alerting

Implement comprehensive monitoring:

```typescript
class APIMonitor {
  private metrics = {
    requests: { total: 0, success: 0, errors: 0 },
    responseTime: [],
    errorTypes: new Map<string, number>()
  };

  async makeRequest<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    this.metrics.requests.total++;

    try {
      const result = await operation();
      this.metrics.requests.success++;
      
      // Record response time
      const responseTime = Date.now() - startTime;
      this.metrics.responseTime.push(responseTime);
      
      // Keep only last 1000 response times
      if (this.metrics.responseTime.length > 1000) {
        this.metrics.responseTime.shift();
      }
      
      return result;
    } catch (error) {
      this.metrics.requests.errors++;
      
      const errorType = error.constructor.name;
      this.metrics.errorTypes.set(
        errorType,
        (this.metrics.errorTypes.get(errorType) || 0) + 1
      );
      
      throw error;
    }
  }

  getMetrics() {
    const avgResponseTime = this.metrics.responseTime.length > 0
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length
      : 0;

    return {
      total_requests: this.metrics.requests.total,
      success_rate: this.metrics.requests.total > 0 
        ? this.metrics.requests.success / this.metrics.requests.total 
        : 0,
      average_response_time: avgResponseTime,
      error_distribution: Object.fromEntries(this.metrics.errorTypes)
    };
  }

  shouldAlert(): boolean {
    const metrics = this.getMetrics();
    
    return (
      metrics.success_rate < 0.95 || // Less than 95% success rate
      metrics.average_response_time > 5000 || // More than 5 seconds average
      metrics.total_requests > 1000 // High request volume
    );
  }
}
```

This comprehensive guide provides real-world examples and best practices for using the Crazy-Gary API effectively. Each example includes error handling, monitoring, and production-ready patterns.
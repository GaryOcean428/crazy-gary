# API Versioning Documentation

## Overview

This document describes the Crazy-Gary API versioning strategy, version lifecycle, migration guides, and deprecation policies.

## Versioning Strategy

### Version Format

Crazy-Gary API uses **Semantic Versioning (SemVer)**:

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes that require migration
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes and minor improvements

Current API version: **v1.0.0**

### Version Discovery

#### Version Header
All responses include version information:

```http
X-API-Version: 1.0.0
X-API-Version-Supported: 1.0.0,1.1.0,2.0.0
X-API-Deprecated: false
```

#### Version Endpoint
Get available API versions:

```http
GET /api/versions
```

**Response:**
```json
{
  "current": "1.0.0",
  "supported": ["1.0.0", "1.1.0", "2.0.0"],
  "deprecated": [],
  "deprecated_message": "Version 1.0.0 will be deprecated on 2024-12-31"
}
```

## Version Lifecycle

### Active Versions

| Version | Status | Release Date | End of Life | Support Level |
|---------|--------|--------------|-------------|---------------|
| 1.0.0 | Stable | 2023-12-17 | 2024-12-31 | Full Support |
| 1.1.0 | Beta | 2024-01-15 | 2025-01-15 | Full Support |
| 2.0.0 | Alpha | 2024-02-01 | 2025-02-01 | Limited Support |

### Version States

#### Alpha
- **Purpose**: Early testing of major features
- **Support**: Limited (no SLA)
- **Breaking Changes**: Expected and documented
- **Stability**: Low

#### Beta
- **Purpose**: Feature-complete testing
- **Support**: Full (with SLA)
- **Breaking Changes**: May occur with notice
- **Stability**: Medium

#### Stable
- **Purpose**: Production-ready
- **Support**: Full (with SLA)
- **Breaking Changes**: Only in major versions
- **Stability**: High

#### Deprecated
- **Purpose**: Legacy support during migration
- **Support**: Maintenance only
- **Breaking Changes**: Security fixes only
- **Stability**: High but discouraged

## Request Versioning

### Header-Based Versioning

Specify API version using the `Accept` header:

```http
GET /api/tasks
Accept: application/vnd.crazy-gary.v1.0.0+json
Authorization: Bearer <token>
```

### URL Path Versioning

Version can be specified in the URL path:

```http
GET /v1/api/tasks
Authorization: Bearer <token>
```

### Query Parameter Versioning

Version can be specified as a query parameter:

```http
GET /api/tasks?api_version=1.0.0
Authorization: Bearer <token>
```

### Version Precedence

Version selection follows this precedence:

1. **Accept Header** (highest priority)
2. **URL Path**
3. **Query Parameter**
4. **Default Version** (lowest priority)

### Version Negotiation Example

```typescript
class VersionNegotiator {
  private supportedVersions = ['1.0.0', '1.1.0', '2.0.0'];
  
  negotiateVersion(request: Request): string {
    // Check Accept header
    const acceptHeader = request.headers.get('Accept');
    if (acceptHeader) {
      const version = this.extractVersionFromHeader(acceptHeader);
      if (version && this.isSupported(version)) {
        return version;
      }
    }
    
    // Check URL path
    const urlPath = request.url;
    const pathVersion = this.extractVersionFromPath(urlPath);
    if (pathVersion && this.isSupported(pathVersion)) {
      return pathVersion;
    }
    
    // Check query parameter
    const url = new URL(request.url);
    const queryVersion = url.searchParams.get('api_version');
    if (queryVersion && this.isSupported(queryVersion)) {
      return queryVersion;
    }
    
    // Return default version
    return this.supportedVersions[0];
  }
  
  private extractVersionFromHeader(accept: string): string | null {
    // Parse Accept header for version
    const match = accept.match(/vnd\.crazy-gary\.v(\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
  }
  
  private extractVersionFromPath(path: string): string | null {
    // Extract version from URL path
    const match = path.match(/\/v(\d+)\//);
    return match ? `${match[1]}.0.0` : null;
  }
  
  private isSupported(version: string): boolean {
    return this.supportedVersions.includes(version);
  }
}
```

## Breaking Changes Policy

### What Constitutes a Breaking Change

#### Major Breaking Changes
- **Endpoint Removal**: Removing or renaming endpoints
- **Parameter Changes**: Adding required parameters, changing parameter types
- **Response Structure Changes**: Changing JSON response format
- **Authentication Changes**: Modifying auth requirements
- **Status Code Changes**: Changing HTTP status codes
- **Validation Rule Changes**: Making validation stricter

#### Minor Breaking Changes
- **New Required Headers**: Adding required headers
- **New Required Query Parameters**: Adding required query params
- **Response Field Additions**: Adding required response fields
- **Deprecation Warnings**: Adding deprecation notices

### Change Notification Process

#### 90-Day Notice Period
Major breaking changes are announced 90 days in advance:

```http
X-API-Deprecation-Notice: true
X-API-Deprecation-Date: 2024-03-17T00:00:00Z
X-API-Deprecation-Version: 1.0.0
X-API-Migration-Guide: https://docs.crazy-gary.com/migration/v1-to-v2
```

#### Deprecation Headers
Deprecated endpoints include deprecation headers:

```http
HTTP/1.1 200 OK
X-API-Deprecated: true
X-API-Deprecation-Date: 2024-03-17T00:00:00Z
X-API-Replacement-Endpoint: /v2/api/tasks
Deprecation: version="1.0.0", date="Wed, 17 Mar 2024 00:00:00 GMT"
```

## Version Migration Guides

### Migration from v1.0.0 to v1.1.0

#### New Features in v1.1.0

**Enhanced Task Management**
- New task filtering options
- Improved progress tracking
- Batch task operations

#### Migration Steps

**1. Update Version Header**
```typescript
// v1.0.0
const response = await fetch('/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
});

// v1.1.0
const response = await fetch('/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.crazy-gary.v1.1.0+json'
  }
});
```

**2. Update Response Handling**
```typescript
// v1.0.0 response structure
{
  "tasks": [...],
  "total": 100
}

// v1.1.0 response structure
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  },
  "meta": {
    "has_next": true,
    "has_prev": false
  }
}
```

**3. Use New Filtering Options**
```typescript
// v1.1.0 - Enhanced filtering
const response = await fetch('/api/tasks?status=high&page=1&per_page=10', {
  headers=completed&priority: {
    ' ${token}`,
   Authorization': `Bearer 'Accept': 'application/vnd.crazy-gary.v1.1.0+json'
  }
});
```

### Migration from v1.x to v2.0.0

#### Breaking Changes in v2.0.0

**1. Authentication Changes**
```typescript
// v1.x
{
  "token": "jwt_token",
  "refresh_token": "refresh_token"
}

// v2.0.0
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

**2. Response Format Changes**
```typescript
// v1.x
{
  "success": true,
  "data": {...}
}

// v2.0.0
{
  "status": "success",
  "result": {...}
}
```

**3. Endpoint Changes**
```typescript
// v1.x
POST /api/auth/register
POST /api/auth/login

// v2.0.0
POST /api/v2/auth/register
POST /api/v2/auth/login
```

#### Complete Migration Example

```typescript
class CrazyGaryAPIClientV2 {
  private baseURL = 'https://crazy-gary-api.railway.app';
  private version = '2.0.0';
  
  constructor(private token: string) {}
  
  async login(email: string, password: string) {
    // v2.0.0 authentication
    const response = await fetch(`${this.baseURL}/api/v2/auth/login`, {
      method: 'POST',
      headers: {
        'Accept': `application/vnd.crazy-gary.v${this.version}+json`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // v2.0.0 response structure
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      user: data.user
    };
  }
  
  async createTask(taskData: any) {
    // v2.0.0 task creation
    const response = await fetch(`${this.baseURL}/api/v2/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': `application/vnd.crazy-gary.v${this.version}+json`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });
    
    if (!response.ok) {
      throw new Error(`Task creation failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // v2.0.0 response structure
    return {
      taskId: data.result.id,
      status: data.result.status,
      createdAt: data.result.created_at
    };
  }
}

// Migration wrapper
class CrazyGaryAPIClient {
  private v1Client: any;
  private v2Client: CrazyGaryAPIClientV2;
  
  constructor(token: string, version: string = '1.0.0') {
    if (version.startsWith('1.')) {
      this.v1Client = new CrazyGaryAPIClientV1(token);
    } else if (version.startsWith('2.')) {
      this.v2Client = new CrazyGaryAPIClientV2(token);
    } else {
      throw new Error(`Unsupported API version: ${version}`);
    }
  }
  
  async login(email: string, password: string) {
    if (this.v2Client) {
      return this.v2Client.login(email, password);
    } else {
      return this.v1Client.login(email, password);
    }
  }
  
  // Add more methods as needed...
}
```

## Version Testing

### Automated Version Testing

```typescript
class VersionCompatibilityTester {
  private testCases: VersionTestCase[] = [
    {
      version: '1.0.0',
      endpoint: '/api/tasks',
      method: 'GET',
      expectedStatus: 200,
      requiredHeaders: ['Authorization']
    },
    {
      version: '1.1.0',
      endpoint: '/api/tasks',
      method: 'GET',
      expectedStatus: 200,
      requiredHeaders: ['Authorization', 'Accept']
    },
    {
      version: '2.0.0',
      endpoint: '/api/v2/tasks',
      method: 'GET',
      expectedStatus: 200,
      requiredHeaders: ['Authorization', 'Accept']
    }
  ];
  
  async runCompatibilityTests(): Promise<TestResults> {
    const results: TestResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
    
    for (const testCase of this.testCases) {
      try {
        const result = await this.runTest(testCase);
        if (result.passed) {
          results.passed++;
        } else {
          results.failed++;
          results.errors.push(result.error);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(error.message);
      }
    }
    
    return results;
  }
  
  private async runTest(testCase: VersionTestCase): Promise<TestResult> {
    const url = `${this.baseURL}${testCase.endpoint}`;
    const headers: Record<string, string> = {};
    
    // Add required headers
    for (const header of testCase.requiredHeaders) {
      switch (header) {
        case 'Authorization':
          headers['Authorization'] = `Bearer ${this.token}`;
          break;
        case 'Accept':
          headers['Accept'] = `application/vnd.crazy-gary.v${testCase.version}+json`;
          break;
      }
    }
    
    const response = await fetch(url, {
      method: testCase.method,
      headers
    });
    
    if (response.status === testCase.expectedStatus) {
      return { passed: true };
    } else {
      return { 
        passed: false, 
        error: `Expected ${testCase.expectedStatus}, got ${response.status}` 
      };
    }
  }
}

interface VersionTestCase {
  version: string;
  endpoint: string;
  method: string;
  expectedStatus: number;
  requiredHeaders: string[];
}

interface TestResult {
  passed: boolean;
  error?: string;
}

interface TestResults {
  passed: number;
  failed: number;
  errors: string[];
}
```

### Manual Version Testing

```bash
#!/bin/bash
# version-test.sh

BASE_URL="https://crazy-gary-api.railway.app"
TOKEN="your-jwt-token"

# Test v1.0.0
echo "Testing API v1.0.0..."
response=$(curl -s -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.crazy-gary.v1.0.0+json" \
  "$BASE_URL/api/tasks")

status_code="${response: -3}"
if [ "$status_code" = "200" ]; then
  echo "✅ v1.0.0: PASSED"
else
  echo "❌ v1.0.0: FAILED (HTTP $status_code)"
fi

# Test v1.1.0
echo "Testing API v1.1.0..."
response=$(curl -s -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.crazy-gary.v1.1.0+json" \
  "$BASE_URL/api/tasks")

status_code="${response: -3}"
if [ "$status_code" = "200" ]; then
  echo "✅ v1.1.0: PASSED"
else
  echo "❌ v1.1.0: FAILED (HTTP $status_code)"
fi

# Test v2.0.0
echo "Testing API v2.0.0..."
response=$(curl -s -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.crazy-gary.v2.0.0+json" \
  "$BASE_URL/api/v2/tasks")

status_code="${response: -3}"
if [ "$status_code" = "200" ]; then
  echo "✅ v2.0.0: PASSED"
else
  echo "❌ v2.0.0: FAILED (HTTP $status_code)"
fi
```

## Version Monitoring

### Version Usage Tracking

```typescript
class VersionMonitor {
  private usageStats = new Map<string, VersionStats>();
  
  trackAPICall(version: string, method: string, endpoint: string, statusCode    const key = `${version: number) {
}:${endpoint}:${method}`;
    
    if (!this.usageStats.has(key)) {
      this.usageStats.set(key, {
        version,
        endpoint,
        method,
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageResponseTime: 0,
        firstCall: Date.now(),
        lastCall: Date.now()
      });
    }
    
    const stats = this.usageStats.get(key)!;
    stats.totalCalls++;
    
    if (statusCode >= 200 && statusCode < 300) {
      stats.successfulCalls++;
    } else {
      stats.failedCalls++;
    }
    
    stats.lastCall = Date.now();
    
    // Send to monitoring service
    this.sendStats(stats);
  }
  
  getVersionAdoption(): VersionAdoption {
    const adoption: VersionAdoption = {
      versions: {},
      totalCalls: 0,
      recommendation: ''
    };
    
    for (const stats of this.usageStats.values()) {
      if (!adoption.versions[stats.version]) {
        adoption.versions[stats.version] = {
          version: stats.version,
          calls: 0,
          successRate: 0,
          averageResponseTime: 0
        };
      }
      
      const versionStats = adoption.versions[stats.version];
      versionStats.calls += stats.totalCalls;
      versionStats.successRate = stats.successfulCalls / stats.totalCalls;
      versionStats.averageResponseTime = stats.averageResponseTime;
      
      adoption.totalCalls += stats.totalCalls;
    }
    
    // Generate recommendation
    adoption.recommendation = this.generateAdoptionRecommendation(adoption);
    
    return adoption;
  }
  
  private generateAdoptionRecommendation(adoption: VersionAdoption): string {
    const versions = Object.values(adoption.versions);
    const latestVersion = versions.reduce((latest, current) => 
      current.version > latest.version ? current : latest
    );
    
    const latestAdoptionRate = latestVersion.calls / adoption.totalCalls;
    
    if (latestAdoptionRate < 0.5) {
      return `Consider migrating to ${latestVersion.version}. Current adoption: ${(latestAdoptionRate * 100).toFixed(1)}%`;
    }
    
    return `Good adoption of ${latestVersion.version}. ${(latestAdoptionRate * 100).toFixed(1)}% of requests use this version.`;
  }
  
  private sendStats(stats: VersionStats): void {
    // Send to monitoring service
    fetch('/api/monitoring/version-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(stats)
    }).catch(error => {
      console.error('Failed to send version stats:', error);
    });
  }
}

interface VersionStats {
  version: string;
  endpoint: string;
  method: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageResponseTime: number;
  firstCall: number;
  lastCall: number;
}

interface VersionAdoption {
  versions: Record<string, VersionStats>;
  totalCalls: number;
  recommendation: string;
}
```

### Deprecation Warnings

```typescript
class DeprecationWarningSystem {
  private warnings = new Map<string, DeprecationWarning>();
  
  registerDeprecation(version: string, endpoint: string, replacement?: string) {
    this.warnings.set(`${version}:${endpoint}`, {
      version,
      endpoint,
      replacement,
      announcementDate: Date.now(),
      deprecationDate: this.calculateDeprecationDate(),
      eolDate: this.calculateEOLDate(),
      severity: this.calculateSeverity(version)
    });
  }
  
  checkDeprecationWarning(version: string, endpoint: string): DeprecationWarning | null {
    return this.warnings.get(`${version}:${endpoint}`) || null;
  }
  
  getDeprecationWarningsForVersion(version: string): DeprecationWarning[] {
    return Array.from(this.warnings.values())
      .filter(warning => warning.version === version);
  }
  
  private calculateDeprecationDate(): number {
    return Date.now() + (90 * 24 * 60 * 60 * 1000); // 90 days from now
  }
  
  private calculateEOLDate(): number {
    return Date.now() + (180 * 24 * 60 * 60 * 1000); // 180 days from now
  }
  
  private calculateSeverity(version: string): 'low' | 'medium' | 'high' {
    const [major, minor] = version.split('.').map(Number);
    
    if (major === 1 && minor === 0) return 'medium';
    if (major === 1 && minor === 1) return 'low';
    return 'high';
  }
}

interface DeprecationWarning {
  version: string;
  endpoint: string;
  replacement?: string;
  announcementDate: number;
  deprecationDate: number;
  eolDate: number;
  severity: 'low' | 'medium' | 'high';
}
```

## Migration Tools

### Automated Migration Script

```python
# migration-tool.py

import json
import requests
from typing import Dict, Any, List

class APIMigrationTool:
    def __init__(self, source_version: str, target_version: str, api_token: str):
        self.source_version = source_version
        self.target_version = target_version
        self.api_token = api_token
        self.base_url = "https://crazy-gary-api.railway.app"
        self.migration_rules = self.load_migration_rules()
    
    def load_migration_rules(self) -> Dict[str, Any]:
        """Load version-specific migration rules"""
        return {
            "1.0.0_to_1.1.0": {
                "header_changes": {
                    "Accept": "application/vnd.crazy-gary.v1.1.0+json"
                },
                "response_transformations": {
                    "tasks": "data",
                    "total": "pagination.total"
                }
            },
            "1.x_to_2.0.0": {
                "endpoint_mapping": {
                    "/api/tasks": "/api/v2/tasks",
                    "/api/auth/login": "/api/v2/auth/login"
                },
                "header_changes": {
                    "Accept": "application/vnd.crazy-gary.v2.0.0+json"
                },
                "response_transformations": {
                    "success": "status",
                    "data": "result"
                },
                "auth_changes": {
                    "token": "access_token",
                    "expires_in": "expires_in"
                }
            }
        }
    
    def migrate_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Migrate a request to the target version"""
        # Apply endpoint mapping
        migrated_endpoint = self.apply_endpoint_mapping(endpoint)
        
        # Apply header changes
        migrated_headers = self.apply_header_changes(kwargs.get('headers', {}))
        
        # Make the migrated request
        response = requests.request(
            method,
            f"{self.base_url}{migrated_endpoint}",
            headers=migrated_headers,
            **kwargs
        )
        
        # Transform response if needed
        if response.ok:
            response_data = response.json()
            migrated_data = self.transform_response(response_data)
            return migrated_data
        else:
            response.raise_for_status()
    
    def apply_endpoint_mapping(self, endpoint: str) -> str:
        """Apply endpoint mapping based on migration rules"""
        rule_key = f"{self.source_version}_to_{self.target_version}"
        mapping = self.migration_rules.get(rule_key, {}).get("endpoint_mapping", {})
        
        return mapping.get(endpoint, endpoint)
    
    def apply_header_changes(self, headers: Dict[str, str]) -> Dict[str, str]:
        """Apply header changes based on migration rules"""
        rule_key = f"{self.source_version}_to_{self.target_version}"
        header_changes = self.migration_rules.get(rule_key, {}).get("header_changes", {})
        
        migrated_headers = headers.copy()
        migrated_headers.update(header_changes)
        
        return migrated_headers
    
    def transform_response(self, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform response data based on migration rules"""
        rule_key = f"{self.source_version}_to_{self.target_version}"
        transformations = self.migration_rules.get(rule_key, {}).get("response_transformations", {})
        
        return self.apply_transformations(response_data, transformations)
    
    def apply_transformations(self, data: Dict[str, Any], transformations: Dict[str, str]) -> Dict[str, Any]:
        """Apply transformations to nested data structures"""
        transformed = {}
        
        for key, value in data.items():
            new_key = transformations.get(key, key)
            
            if isinstance(value, dict):
                transformed[new_key] = self.apply_transformations(value, transformations)
            elif isinstance(value, list):
                transformed[new_key] = [
                    self.apply_transformations(item, transformations) if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                transformed[new_key] = value
        
        return transformed
    
    def generate_migration_report(self, test_endpoints: List[str]) -> Dict[str, Any]:
        """Generate a migration compatibility report"""
        report = {
            "migration": f"{self.source_version} -> {self.target_version}",
            "timestamp": datetime.now().isoformat(),
            "endpoints": [],
            "overall_success": True,
            "recommendations": []
        }
        
        for endpoint in test_endpoints:
            endpoint_report = {
                "endpoint": endpoint,
                "status": "unknown",
                "issues": [],
                "warnings": []
            }
            
            try:
                # Test migration
                response = self.migrate_request("GET", endpoint)
                endpoint_report["status"] = "success"
                endpoint_report["response_structure"] = list(response.keys()) if isinstance(response, dict) else "non-dict"
                
            except Exception as e:
                endpoint_report["status"] = "failed"
                endpoint_report["issues"].append(str(e))
                report["overall_success"] = False
            
            report["endpoints"].append(endpoint_report)
        
        # Generate recommendations
        report["recommendations"] = self.generate_recommendations(report)
        
        return report
    
    def generate_recommendations(self, report: Dict[str, Any]) -> List[str]:
        """Generate migration recommendations based on report"""
        recommendations = []
        
        if not report["overall_success"]:
            recommendations.append("Some endpoints failed migration. Review and fix issues before proceeding.")
        
        failed_endpoints = [ep for ep in report["endpoints"] if ep["status"] == "failed"]
        if failed_endpoints:
            recommendations.append(f"Focus on fixing failed endpoints: {[ep['endpoint'] for ep in failed_endpoints]}")
        
        recommendations.append("Test all migrated endpoints thoroughly before deploying to production.")
        recommendations.append("Monitor API usage after migration to ensure compatibility.")
        
        return recommendations

# Usage example
migration_tool = APIMigrationTool("1.0.0", "2.0.0", "your-api-token")

# Test specific endpoints
test_endpoints = ["/api/tasks", "/api/auth/me", "/api/monitoring/health"]
report = migration_tool.generate_migration_report(test_endpoints)

print(json.dumps(report, indent=2))
```

This comprehensive versioning documentation ensures smooth transitions between API versions while maintaining backward compatibility and providing clear migration paths.
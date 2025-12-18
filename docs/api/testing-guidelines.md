# API Testing Guidelines

## Overview

This document provides comprehensive guidelines for testing the Crazy-Gary API, including unit tests, integration tests, end-to-end tests, and performance testing.

## Testing Strategy

### Testing Pyramid

```
                    /\
                   /  \
                  / E2E \
                 /  Tests \
                /__________\
               /            \
              /  Integration \
             /    Tests      \
            /________________\
           /                  \
          /    Unit Tests     \
         /____________________\
```

1. **Unit Tests** (70%): Test individual functions and components
2. **Integration Tests** (20%): Test API endpoints and data flow
3. **End-to-End Tests** (10%): Test complete user workflows

## Unit Testing

### Test Structure

```typescript
// test-utils/api-tester.ts
import fetch from 'node-fetch';

export interface TestConfig {
  baseURL: string;
  authToken?: string;
  timeout?: number;
}

export interface TestCase {
  name: string;
  method: string;
  endpoint: string;
  headers?: Record<string, string>;
  body?: any;
  expectedStatus: number;
  expectedResponse?: any;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

export class APITester {
  private config: TestConfig;
  private testResults: TestResult[] = [];

  constructor(config: TestConfig) {
    this.config = {
      timeout: 30000,
      ...config
    };
  }

  async runTest(testCase: TestCase): Promise<TestResult> {
    const result: TestResult = {
      name: testCase.name,
      passed: false,
      duration: 0,
      error: null
    };

    const startTime = Date.now();

    try {
      // Setup
      if (testCase.setup) {
        await testCase.setup();
      }

      // Execute request
      const response = await this.makeRequest(testCase);
      
      // Validate response
      await this.validateResponse(response, testCase);
      
      // Validate response body if specified
      if (testCase.expectedResponse) {
        await this.validateResponseBody(response, testCase.expectedResponse);
      }

      result.passed = true;
    } catch (error) {
      result.error = error.message;
    } finally {
      // Teardown
      if (testCase.teardown) {
        await testCase.teardown();
      }
      
      result.duration = Date.now() - startTime;
      this.testResults.push(result);
    }

    return result;
  }

  private async makeRequest(testCase: TestCase): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...testCase.headers
    };

    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;
    }

    const options: RequestInit = {
      method: testCase.method,
      headers
    };

    if (testCase.body) {
      options.body = JSON.stringify(testCase.body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseURL}${testCase.endpoint}`, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async validateResponse(response: Response, testCase: TestCase): Promise<void> {
    if (response.status !== testCase.expectedStatus) {
      const responseBody = await response.text();
      throw new Error(
        `Expected status ${testCase.expectedStatus}, got ${response.status}. Response: ${responseBody}`
      );
    }
  }

  private async validateResponseBody(response: Response, expectedBody: any): Promise<void> {
    const responseBody = await response.json();
    
    // Deep comparison
    if (JSON.stringify(responseBody) !== JSON.stringify(expectedBody)) {
      throw new Error(
        `Response body mismatch.\nExpected: ${JSON.stringify(expectedBody, null, 2)}\nGot: ${JSON.stringify(responseBody, null, 2)}`
      );
    }
  }

  getResults(): TestResult[] {
    return this.testResults;
  }

  getSummary(): TestSummary {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = total - passed;
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);

    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      totalDuration,
      averageDuration: total > 0 ? totalDuration / total : 0
    };
  }
}

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error: string | null;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  totalDuration: number;
  averageDuration: number;
}
```

### Authentication Tests

```typescript
// test/auth.test.ts
import { APITester, TestCase } from '../utils/api-tester';

const tester = new APITester({
  baseURL: 'https://crazy-gary-api.railway.app'
});

describe('Authentication Tests', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    const userData = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      fullName: 'Test User'
    };

    const response = await fetch(`${tester.baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      const data = await response.json();
      authToken = data.token;
      testUser = data.user;
    }
  });

  afterAll(async () => {
    // Clean up test user if needed
    if (authToken) {
      await fetch(`${tester.baseURL}/api/users/${testUser.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    }
  });

  test('should register new user', async () => {
    const testCase: TestCase = {
      name: 'User Registration',
      method: 'POST',
      endpoint: '/api/auth/register',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: `newuser-${Date.now()}@example.com`,
        password: 'NewPassword123!',
        fullName: 'New User'
      },
      expectedStatus: 201
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);
  });

  test('should login with valid credentials', async () => {
    const testCase: TestCase = {
      name: 'User Login',
      method: 'POST',
      endpoint: '/api/auth/login',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: testUser.email,
        password: 'TestPassword123!'
      },
      expectedStatus: 200,
      expectedResponse: {
        token: expect.any(String),
        refresh_token: expect.any(String),
        expires_in: expect.any(Number),
        user: {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name
        }
      }
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);
  });

  test('should reject login with invalid credentials', async () => {
    const testCase: TestCase = {
      name: 'Invalid Login',
      method: 'POST',
      endpoint: '/api/auth/login',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: testUser.email,
        password: 'WrongPassword'
      },
      expectedStatus: 401
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);
  });

  test('should get user profile with valid token', async () => {
    const testCase: TestCase = {
      name: 'Get User Profile',
      method: 'GET',
      endpoint: '/api/auth/me',
      expectedStatus: 200,
      expectedResponse: {
        user: {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name
        }
      }
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);
  });

  test('should reject request without authentication', async () => {
    const testCase: TestCase = {
      name: 'No Authentication',
      method: 'GET',
      endpoint: '/api/auth/me',
      expectedStatus: 401
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);
  });

  test('should validate token correctly', async () => {
    const testCase: TestCase = {
      name: 'Token Validation',
      method: 'GET',
      endpoint: '/api/auth/validate',
      expectedStatus: 200,
      expectedResponse: {
        valid: true,
        user: {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name
        }
      }
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);
  });
});
```

### Task Management Tests

```typescript
// test/tasks.test.ts
import { APITester, TestCase } from '../utils/api-tester';

const tester = new APITester({
  baseURL: 'https://crazy-gary-api.railway.app',
  authToken: 'test-auth-token' // Set this in beforeAll
});

describe('Task Management Tests', () => {
  let createdTaskId: string;

  test('should create a new task', async () => {
    const testCase: TestCase = {
      name: 'Create Task',
      method: 'POST',
      endpoint: '/api/tasks',
      body: {
        title: 'Test Task',
        description: 'This is a test task for API testing',
        model: 'gpt-oss-120b',
        priority: 'medium'
      },
      expectedStatus: 201,
      expectedResponse: {
        task_id: expect.any(String),
        status: 'created'
      }
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);

    // Extract task ID for later tests
    if (result.passed) {
      // You'd need to modify APITester to return the response data
      // For now, we'll assume it's available
    }
  });

  test('should start task execution', async () => {
    // First create a task
    const createResponse = await fetch(`${tester.baseURL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tester.config.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Task for Execution',
        description: 'Testing task execution',
        model: 'gpt-oss-20b',
        priority: 'low'
      })
    });

    const createData = await createResponse.json();
    createdTaskId = createData.task_id;

    const testCase: TestCase = {
      name: 'Start Task',
      method: 'POST',
      endpoint: `/api/tasks/${createdTaskId}/start`,
      expectedStatus: 200,
      expectedResponse: {
        status: 'started'
      }
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);
  });

  test('should get task details', async () => {
    const testCase: TestCase = {
      name: 'Get Task Details',
      method: 'GET',
      endpoint: `/api/tasks/${createdTaskId}`,
      expectedStatus: 200,
      expectedResponse: {
        id: createdTaskId,
        title: 'Test Task for Execution',
        status: expect.any(String)
      }
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);
  });

  test('should get all tasks', async () => {
    const testCase: TestCase = {
      name: 'Get All Tasks',
      method: 'GET',
      endpoint: '/api/tasks',
      expectedStatus: 200,
      expectedResponse: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          status: expect.any(String)
        })
      ])
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);
  });

  test('should stop a running task', async () => {
    const testCase: TestCase = {
      name: 'Stop Task',
      method: 'POST',
      endpoint: `/api/tasks/${createdTaskId}/stop`,
      expectedStatus: 200,
      expectedResponse: {
        status: 'stopped'
      }
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);
  });

  test('should chat with AI agent', async () => {
    const testCase: TestCase = {
      name: 'Chat with Agent',
      method: 'POST',
      endpoint: '/api/chat',
      body: {
        message: 'Hello, can you help me?',
        context: 'I am testing the API'
      },
      expectedStatus: 200,
      expectedResponse: {
        response: expect.any(String)
      }
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);
  });
});
```

### Error Handling Tests

```typescript
// test/errors.test.ts
import { APITester, TestCase } from '../utils/api-tester';

const tester = new APITester({
  baseURL: 'https://crazy-gary-api.railway.app'
});

describe('Error Handling Tests', () => {
  test('should return 400 for invalid request data', async () => {
    const testCase: TestCase = {
      name: 'Invalid Request Data',
      method: 'POST',
      endpoint: '/api/tasks',
      body: {
        // Missing required fields
        title: 'Test'
      },
      expectedStatus: 400,
      expectedResponse: {
        error: expect.any(String),
        code: expect.any(String)
      }
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);
  });

  test('should return 401 for missing authentication', async () => {
    const testCase: TestCase = {
      name: 'Missing Authentication',
      method: 'GET',
      endpoint: '/api/auth/me',
      expectedStatus: 401,
      expectedResponse: {
        error: expect.any(String),
        code: expect.stringMatching(/AUTH_REQUIRED|TOKEN_EXPIRED/)
      }
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);
  });

  test('should return 404 for non-existent resource', async () => {
    const testCase: TestCase = {
      name: 'Resource Not Found',
      method: 'GET',
      endpoint: '/api/tasks/non-existent-task-id',
      expectedStatus: 404,
      expectedResponse: {
        error: expect.any(String),
        code: 'TASK_NOT_FOUND'
      }
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);
  });

  test('should return 422 for validation errors', async () => {
    const testCase: TestCase = {
      name: 'Validation Error',
      method: 'POST',
      endpoint: '/api/auth/register',
      body: {
        email: 'invalid-email', // Invalid email format
        password: '123', // Too short
        fullName: 'Test User'
      },
      expectedStatus: 400,
      expectedResponse: {
        error: expect.any(String),
        details: {
          validation_errors: expect.arrayContaining([
            expect.stringContaining('email'),
            expect.stringContaining('password')
          ])
        }
      }
    };

    const result = await tester.runTest(testCase);
    expect(result.passed).toBe(true);
  });
});
```

## Integration Testing

### API Integration Tests

```typescript
// integration/api-integration.test.ts
import { APITester } from '../utils/api-tester';

describe('API Integration Tests', () => {
  const tester = new APITester({
    baseURL: 'https://crazy-gary-api.railway.app'
  });

  test('complete user workflow', async () => {
    let authToken: string;
    let userId: string;

    // 1. Register user
    const registerResponse = await fetch(`${tester.baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `integration-test-${Date.now()}@example.com`,
        password: 'IntegrationTest123!',
        fullName: 'Integration Test User'
      })
    });

    expect(registerResponse.status).toBe(201);
    const registerData = await registerResponse.json();
    authToken = registerData.token;
    userId = registerData.user.id;

    // Update tester config
    tester.config.authToken = authToken;

    // 2. Create task
    const taskResponse = await fetch(`${tester.baseURL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Integration Test Task',
        description: 'Testing complete workflow',
        model: 'gpt-oss-120b',
        priority: 'high'
      })
    });

    expect(taskResponse.status).toBe(201);
    const taskData = await taskResponse.json();
    const taskId = taskData.task_id;

    // 3. Start task
    const startResponse = await fetch(`${tester.baseURL}/api/tasks/${taskId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(startResponse.status).toBe(200);

    // 4. Monitor task progress
    let taskCompleted = false;
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max

    while (!taskCompleted && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

      const statusResponse = await fetch(`${tester.baseURL}/api/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'completed' || statusData.status === 'failed') {
        taskCompleted = true;
        expect(['completed', 'failed']).toContain(statusData.status);
      }

      attempts++;
    }

    expect(taskCompleted).toBe(true);

    // 5. Get statistics
    const statsResponse = await fetch(`${tester.baseURL}/api/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(statsResponse.status).toBe(200);
    const statsData = await statsResponse.json();
    expect(statsData).toHaveProperty('total_tasks');
    expect(statsData).toHaveProperty('active_tasks');

    // 6. Update profile
    const profileResponse = await fetch(`${tester.baseURL}/api/auth/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Updated Integration Test User'
      })
    });

    expect(profileResponse.status).toBe(200);

    // 7. Clean up
    const deleteResponse = await fetch(`${tester.baseURL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(deleteResponse.status).toBe(204);
  });

  test('endpoint management workflow', async () => {
    // 1. Check endpoint status
    const statusResponse = await fetch(`${tester.baseURL}/api/endpoints/status`);
    expect(statusResponse.status).toBe(200);
    const statusData = await statusResponse.json();
    
    expect(statusData).toHaveProperty('endpoints');
    expect(statusData.endpoints).toHaveProperty('120b');
    expect(statusData.endpoints).toHaveProperty('20b');

    // 2. Get specific endpoint status
    const specificStatusResponse = await fetch(`${tester.baseURL}/api/endpoints/status/120b`);
    expect(specificStatusResponse.status).toBe(200);
    const specificStatusData = await specificStatusResponse.json();
    
    expect(specificStatusData).toHaveProperty('status');
    expect(['running', 'sleeping', 'starting', 'stopping']).toContain(specificStatusData.status);

    // 3. If endpoint is sleeping, wake it up
    if (specificStatusData.status === 'sleeping') {
      const wakeResponse = await fetch(`${tester.baseURL}/api/endpoints/wake/120b`, {
        method: 'POST'
      });

      expect(wakeResponse.status).toBe(200);
      const wakeData = await wakeResponse.json();
      expect(wakeData.success).toBe(true);

      // Wait for endpoint to be ready
      let endpointReady = false;
      let attempts = 0;
      const maxAttempts = 60; // 10 minutes max

      while (!endpointReady && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

        const readyCheckResponse = await fetch(`${tester.baseURL}/api/endpoints/status/120b`);
        const readyCheckData = await readyCheckResponse.json();

        if (readyCheckData.status === 'running') {
          endpointReady = true;
        }

        attempts++;
      }

      expect(endpointReady).toBe(true);

      // 4. Sleep the endpoint back
      const sleepResponse = await fetch(`${tester.baseURL}/api/endpoints/sleep/120b`, {
        method: 'POST'
      });

      expect(sleepResponse.status).toBe(200);
    }
  });
});
```

## End-to-End Testing

### E2E Test Suite

```typescript
// e2e/user-journey.test.ts
import { chromium, Browser, Page } from 'playwright';

describe('End-to-End User Journey', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  test('complete user registration and task creation journey', async () => {
    const testEmail = `e2e-test-${Date.now()}@example.com`;
    const testPassword = 'E2ETest123!';

    // 1. Navigate to the application
    await page.goto('https://crazy-gary-web.app');
    
    // 2. Register new user
    await page.click('[data-testid="register-link"]');
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', testPassword);
    await page.fill('[data-testid="fullname-input"]', 'E2E Test User');
    await page.click('[data-testid="register-button"]');

    // Wait for registration to complete
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 30000 });
    
    // Verify we're on the dashboard
    expect(await page.textContent('[data-testid="dashboard-title"]')).toContain('Dashboard');

    // 3. Create a new task
    await page.click('[data-testid="create-task-button"]');
    await page.fill('[data-testid="task-title-input"]', 'E2E Test Task');
    await page.fill('[data-testid="task-description-input"]', 'This is an end-to-end test task');
    await page.selectOption('[data-testid="task-priority-select"]', 'medium');
    await page.click('[data-testid="create-task-submit-button"]');

    // Wait for task to be created
    await page.waitForSelector('[data-testid="task-created-success"]', { timeout: 10000 });
    
    // 4. Monitor task progress
    await page.waitForSelector('[data-testid="task-status-running"]', { timeout: 30000 });
    
    // Wait for task completion (or timeout after 5 minutes)
    await page.waitForSelector('[data-testid="task-status-completed"], [data-testid="task-status-failed"]', { 
      timeout: 300000 
    });

    // 5. View task results
    await page.click('[data-testid="view-task-results-button"]');
    await page.waitForSelector('[data-testid="task-results"]', { timeout: 10000 });
    
    // Verify results are displayed
    expect(await page.textContent('[data-testid="task-results"]')).toBeTruthy();

    // 6. Update profile
    await page.click('[data-testid="profile-menu"]');
    await page.click('[data-testid="profile-settings"]');
    await page.fill('[data-testid="profile-name-input"]', 'Updated E2E Test User');
    await page.click('[data-testid="save-profile-button"]');

    // Verify profile update
    await page.waitForSelector('[data-testid="profile-update-success"]', { timeout: 5000 });

    // 7. Check statistics
    await page.click('[data-testid="statistics-tab"]');
    await page.waitForSelector('[data-testid="task-statistics"]', { timeout: 10000 });
    
    // Verify statistics are displayed
    expect(await page.textContent('[data-testid="total-tasks"]')).toBeTruthy();

    // 8. Logout
    await page.click('[data-testid="logout-button"]');
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 10000 });
    
    // Verify we're back at login
    expect(await page.textContent('[data-testid="login-title"]')).toContain('Login');
  });
});
```

## Performance Testing

### Load Testing

```typescript
// performance/load-test.ts
import { APITester } from '../utils/api-tester';

interface LoadTestConfig {
  concurrentUsers: number;
  duration: number; // in seconds
  rampUpTime: number; // in seconds
  endpoint: string;
  method: string;
  body?: any;
}

class LoadTester {
  private results: LoadTestResult[] = [];
  private running = false;

  async runLoadTest(config: LoadTestConfig): Promise<LoadTestSummary> {
    this.running = true;
    this.results = [];

    const startTime = Date.now();
    const endTime = startTime + (config.duration * 1000);
    const rampUpInterval = config.rampUpTime / config.concurrentUsers;

    console.log(`Starting load test: ${config.concurrentUsers} users for ${config.duration}s`);

    // Ramp up users
    const userPromises: Promise<void>[] = [];
    for (let i = 0; i < config.concurrentUsers; i++) {
      const userPromise = this.simulateUser(config, startTime + (i * rampUpInterval * 1000), endTime);
      userPromises.push(userPromise);
    }

    // Wait for all users to complete
    await Promise.all(userPromises);

    this.running = false;

    return this.generateSummary(config);
  }

  private async simulateUser(config: LoadTestConfig, userStartTime: number, testEndTime: number): Promise<void> {
    const tester = new APITester({
      baseURL: 'https://crazy-gary-api.railway.app',
      authToken: 'test-token' // In real tests, get proper auth
    });

    // Wait for user start time
    const now = Date.now();
    if (userStartTime > now) {
      await new Promise(resolve => setTimeout(resolve, userStartTime - now));
    }

    while (Date.now() < testEndTime && this.running) {
      const startTime = Date.now();

      try {
        const response = await this.makeRequest(config, tester);
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.results.push({
          timestamp: endTime,
          duration,
          statusCode: response.status,
          success: response.status < 400,
          userId: this.getCurrentUserId()
        });

        // Throttle requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        this.results.push({
          timestamp: Date.now(),
          duration: Date.now() - startTime,
          statusCode: 0,
          success: false,
          userId: this.getCurrentUserId(),
          error: error.message
        });
      }
    }
  }

  private async makeRequest(config: LoadTestConfig, tester: APITester): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (tester.config.authToken) {
      headers['Authorization'] = `Bearer ${tester.config.authToken}`;
    }

    const options: RequestInit = {
      method: config.method,
      headers
    };

    if (config.body) {
      options.body = JSON.stringify(config.body);
    }

    return fetch(`${tester.config.baseURL}${config.endpoint}`, options);
  }

  private getCurrentUserId(): string {
    // In a real implementation, you'd track individual user IDs
    return 'anonymous';
  }

  private generateSummary(config: LoadTestConfig): LoadTestSummary {
    const successfulRequests = this.results.filter(r => r.success);
    const failedRequests = this.results.filter(r => !r.success);

    const durations = successfulRequests.map(r => r.duration).sort((a, b) => a - b);
    const totalRequests = this.results.length;
    const totalDuration = Math.max(...this.results.map(r => r.timestamp)) - Math.min(...this.results.map(r => r.timestamp));
    
    return {
      config,
      totalRequests,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      successRate: (successfulRequests.length / totalRequests) * 100,
      requestsPerSecond: totalRequests / (totalDuration / 1000),
      averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      median[Math.floor(dResponseTime: durationsurations.length / 2)],
      p95ResponseTime: durations[Math.floor(durations.length * 0.95)],
      p99ResponseTime: durations[Math.floor(durations.length * 0.99)],
      maxResponseTime: Math.max(...durations),
      minResponseTime: Math.min(...durations),
      statusCodeDistribution: this.getStatusCodeDistribution(),
      errors: failedRequests.map(r => r.error).filter(Boolean)
    };
  }

  private getStatusCodeDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    for (const result of this.results) {
      const statusCode = result.statusCode.toString();
      distribution[statusCode] = (distribution[statusCode] || 0) + 1;
    }
    
    return distribution;
  }
}

interface LoadTestResult {
  timestamp: number;
  duration: number;
  statusCode: number;
  success: boolean;
  userId: string;
  error?: string;
}

interface LoadTestSummary {
  config: LoadTestConfig;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  medianResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  statusCodeDistribution: Record<string, number>;
  errors: string[];
}

// Usage
async function runPerformanceTests() {
  const loadTester = new LoadTester();

  // Test task creation under load
  const taskLoadTest = await loadTester.runLoadTest({
    concurrentUsers: 10,
    duration: 60, // 1 minute
    rampUpTime: 10,
    endpoint: '/api/tasks',
    method: 'POST',
    body: {
      title: 'Load Test Task',
      description: 'This is a load test task',
      priority: 'low'
    }
  });

  console.log('Load Test Results:', taskLoadTest);

  // Test task retrieval under load
  const retrievalLoadTest = await loadTester.runLoadTest({
    concurrentUsers: 20,
    duration: 120, // 2 minutes
    rampUpTime: 20,
    endpoint: '/api/tasks',
    method: 'GET'
  });

  console.log('Retrieval Load Test Results:', retrievalLoadTest);
}
```

## Test Data Management

### Test Database Setup

```typescript
// test-utils/test-data-manager.ts
export class TestDataManager {
  private static instance: TestDataManager;
  private baseURL: string;
  private adminToken: string;

  constructor(baseURL: string, adminToken: string) {
    this.baseURL = baseURL;
    this.adminToken = adminToken;
  }

  static getInstance(baseURL: string, adminToken: string): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager(baseURL, adminToken);
    }
    return TestDataManager.instance;
  }

  async createTestUser(overrides: Partial<any> = {}): Promise<any> {
    const userData = {
      email: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
      password: 'TestPassword123!',
      fullName: 'Test User',
      ...overrides
    };

    const response = await fetch(`${this.baseURL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create test user: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      ...data.user,
      token: data.token,
      refreshToken: data.refresh_token
    };
  }

  async createTestTask(userToken: string, overrides: Partial<any> = {}): Promise<any> {
    const taskData = {
      title: `Test Task ${Date.now()}`,
      description: 'This is a test task',
      model: 'gpt-oss-120b',
      priority: 'medium',
      ...overrides
    };

    const response = await fetch(`${this.baseURL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create test task: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async cleanupTestUser(userId: string, userToken: string): Promise<void> {
    try {
      await fetch(`${this.baseURL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
    } catch (error) {
      console.warn(`Failed to cleanup test user ${userId}:`, error);
    }
  }

  async setupTestData(): Promise<TestDataSet> {
    const testUser = await this.createTestUser();
    const testTask = await this.createTestTask(testUser.token);

    return {
      user: testUser,
      task: testTask
    };
  }

  async cleanupTestData(testData: TestDataSet): Promise<void> {
    await this.cleanupTestUser(testData.user.id, testData.user.token);
  }
}

interface TestDataSet {
  user: any;
  task: any;
}
```

### Test Environment Configuration

```typescript
// test-utils/test-config.ts
export interface TestEnvironment {
  name: string;
  baseURL: string;
  adminToken: string;
  databaseUrl: string;
  timeout: number;
  retries: number;
}

export const TEST_ENVIRONMENTS: Record<string, TestEnvironment> = {
  development: {
    name: 'Development',
    baseURL: 'http://localhost:8080',
    adminToken: 'dev-admin-token',
    databaseUrl: 'sqlite:///test.db',
    timeout: 30000,
    retries: 3
  },
  staging: {
    name: 'Staging',
    baseURL: 'https://crazy-gary-staging.railway.app',
    adminToken: process.env.STAGING_ADMIN_TOKEN || '',
    databaseUrl: process.env.STAGING_DATABASE_URL || '',
    timeout: 60000,
    retries: 5
  },
  production: {
    name: 'Production',
    baseURL: 'https://crazy-gary-api.railway.app',
    adminToken: process.env.PRODUCTION_ADMIN_TOKEN || '',
    databaseUrl: process.env.PRODUCTION_DATABASE_URL || '',
    timeout: 120000,
    retries: 10
  }
};

export function getTestEnvironment(): TestEnvironment {
  const env = process.env.TEST_ENV || 'development';
  const testEnv = TEST_ENVIRONMENTS[env];
  
  if (!testEnv) {
    throw new Error(`Unknown test environment: ${env}`);
  }
  
  return testEnv;
}
```

## Test Reporting

### Test Report Generator

```typescript
// test-utils/test-reporter.ts
import * as fs from 'fs';
import * as path from 'path';

export interface TestReport {
  timestamp: string;
  environment: string;
  summary: TestSummary;
  testSuites: TestSuiteReport[];
  performanceMetrics: PerformanceMetrics;
  coverage: CoverageReport;
  recommendations: string[];
}

export interface TestSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  passRate: number;
  totalDuration: number;
  averageDuration: number;
}

export interface TestSuiteReport {
  name: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  testResults: TestResultReport[];
}

export interface TestResultReport {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshots?: string[];
  logs?: string[];
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
  errorRate: number;
}

export interface CoverageReport {
  lines: number;
  functions: number;
  branches: number;
  statements: number;
}

export class TestReporter {
  private reports: TestReport[] = [];

  addTestSuite(suiteName: string, results: TestResult[]): void {
    const suiteReport: TestSuiteReport = {
      name: suiteName,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: results.reduce((sum, r) => sum + r.duration, 0),
      testResults: results.map(r => ({
        name: r.name,
        status: r.passed ? 'passed' : 'failed',
        duration: r.duration,
        error: r.error || undefined
      }))
    };

    // Add to current report
    // Implementation depends on your reporting structure
  }

  generateHTMLReport(outputPath: string): void {
    const report = this.generateReport();
    
    const html = this.generateHTML(report);
    
    fs.writeFileSync(outputPath, html);
    console.log(`Test report generated: ${outputPath}`);
  }

  generateJSONReport(outputPath: string): void {
    const report = this.generateReport();
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`Test report generated: ${outputPath}`);
  }

  private generateReport(): TestReport {
    // Aggregate all test suite results
    const allSuites = this.reports.flatMap(r => r.testSuites);
    const allResults = allSuites.flatMap(s => s.testResults);
    
    const summary: TestSummary = {
      totalTests: allResults.length,
      passedTests: allResults.filter(r => r.status === 'passed').length,
      failedTests: allResults.filter(r => r.status === 'failed').length,
      skippedTests: allResults.filter(r => r.status === 'skipped').length,
      passRate: allResults.length > 0 ? 
        (allResults.filter(r => r.status === 'passed').length / allResults.length) * 100 : 0,
      totalDuration: allSuites.reduce((sum, s) => sum + s.duration, 0),
      averageDuration: allSuites.length > 0 ? 
        allSuites.reduce((sum, s) => sum + s.duration, 0) / allSuites.length : 0
    };

    return {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test',
      summary,
      testSuites: allSuites,
      performanceMetrics: this.calculatePerformanceMetrics(allResults),
      coverage: this.getCoverageReport(),
      recommendations: this.generateRecommendations(summary)
    };
  }

  private calculatePerformanceMetrics(results: TestResultReport[]): PerformanceMetrics {
    const durations = results.map(r => r.duration).sort((a, b) => a - b);
    const totalDuration = durations.reduce((a, b) => a + b, 0);
    
    return {
      averageResponseTime: durations.length > 0 ? totalDuration / durations.length : 0,
      p95ResponseTime: durations[Math.floor(durations.length * 0.95)] || 0,
      p99ResponseTime: durations[Math.floor(durations.length * 0.99)] || 0,
      throughput: results.length / (totalDuration / 1000), // requests per second
      errorRate: (results.filter(r => r.status === 'failed').length / results.length) * 100
    };
  }

  private getCoverageReport(): CoverageReport {
    // In a real implementation, you'd read coverage from your coverage tool
    return {
      lines: 85,
      functions: 92,
      branches: 78,
      statements: 87
    };
  }

  private generateRecommendations(summary: TestSummary): string[] {
    const recommendations: string[] = [];
    
    if (summary.passRate < 95) {
      recommendations.push('Test pass rate is below 95%. Review failed tests and fix underlying issues.');
    }
    
    if (summary.averageDuration > 5000) {
      recommendations.push('Average test duration is high. Consider optimizing slow tests.');
    }
    
    recommendations.push('Continue monitoring test performance and coverage.');
    
    return recommendations;
  }

  private generateHTML(report: TestReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crazy-Gary API Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e9f4ff; padding: 15px; border-radius: 5px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .metric-label { font-size: 12px; color: #666; }
        .test-suite { margin: 20px 0; border: 1px solid #ddd; border-radius: 5px; }
        .test-suite-header { background: #f9f9f9; padding: 10px; border-bottom: 1px solid #ddd; }
        .test-result { padding: 10px; border-bottom: 1px solid #eee; }
        .test-result.passed { background: #f0fff0; }
        .test-result.failed { background: #fff0f0; }
        .error { color: #d32f2f; font-family: monospace; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Crazy-Gary API Test Report</h1>
        <p>Generated: ${report.timestamp}</p>
        <p>Environment: ${report.environment}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <div class="metric-value">${report.summary.totalTests}</div>
            <div class="metric-label">Total Tests</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.summary.passedTests}</div>
            <div class="metric-label">Passed</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.summary.failedTests}</div>
            <div class="metric-label">Failed</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.summary.passRate.toFixed(1)}%</div>
            <div class="metric-label">Pass Rate</div>
        </div>
        <div class="metric">
            <div class="metric-value">${(report.summary.totalDuration / 1000).toFixed(1)}s</div>
            <div class="metric-label">Total Duration</div>
        </div>
    </div>

    <h2>Test Suites</h2>
    ${report.testSuites.map(suite => `
        <div class="test-suite">
            <div class="test-suite-header">
                <h3>${suite.name}</h3>
                <p>${suite.passedTests}/${suite.totalTests} tests passed (${((suite.passedTests / suite.totalTests) * 100).toFixed(1)}%)</p>
            </div>
            ${suite.testResults.map(result => `
                <div class="test-result ${result.status}">
                    <strong>${result.name}</strong> - ${result.status} (${result.duration}ms)
                    ${result.error ? `<div class="error">${result.error}</div>` : ''}
                </div>
            `).join('')}
        </div>
    `).join('')}

    <h2>Performance Metrics</h2>
    <div class="summary">
        <div class="metric">
            <div class="metric-value">${report.performanceMetrics.averageResponseTime.toFixed(0)}ms</div>
            <div class="metric-label">Avg Response Time</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.performanceMetrics.p95ResponseTime.toFixed(0)}ms</div>
            <div class="metric-label">P95 Response Time</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.performanceMetrics.throughput.toFixed(1)}</div>
            <div class="metric-label">Req/sec</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.performanceMetrics.errorRate.toFixed(1)}%</div>
            <div class="metric-label">Error Rate</div>
        </div>
    </div>

    <h2>Recommendations</h2>
    <div class="recommendations">
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>
    `;
  }
}
```

## CI/CD Integration

### GitHub Actions Test Workflow

```yaml
# .github/workflows/api-tests.yml
name: API Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit
      env:
        TEST_ENV: development
        API_BASE_URL: http://localhost:8080
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: unit-test-results
        path: test-results/

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        TEST_ENV: staging
        API_BASE_URL: ${{ secrets.STAGING_API_URL }}
        STAGING_ADMIN_TOKEN: ${{ secrets.STAGING_ADMIN_TOKEN }}
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
    
    - name: Upload integration test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: integration-test-results
        path: test-results/

  load-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run load tests
      run: npm run test:load
      env:
        API_BASE_URL: ${{ secrets.PRODUCTION_API_URL }}
        ADMIN_TOKEN: ${{ secrets.PRODUCTION_ADMIN_TOKEN }}
    
    - name: Upload load test results
      uses: actions/upload-artifact@v3
      with:
        name: load-test-results
        path: load-test-results/

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright
      run: npx playwright install --with-deps
    
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        API_BASE_URL: ${{ secrets.STAGING_WEB_URL }}
    
    - name: Upload E2E test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: e2e-test-results
        path: test-results/

  coverage:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests with coverage
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella

  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Run security scan
      run: |
        npm audit --audit-level moderate
        npm run security:scan
    
    - name: Upload security scan results
      uses: actions/upload-artifact@v3
      with:
        name: security-scan-results
        path: security-scan-results/
```

This comprehensive testing guide ensures that your Crazy-Gary API integration is thoroughly tested across all layers, from unit tests to end-to-end user journeys, with proper reporting and CI/CD integration.
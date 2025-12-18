# 🚀 Developer Onboarding Guide

Welcome to the Crazy-Gary development team! This comprehensive guide will help you get up to speed quickly and become a productive contributor to our autonomous agentic AI system.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Architecture Overview](#project-architecture-overview)
4. [Coding Standards & Best Practices](#coding-standards--best-practices)
5. [Debugging & Troubleshooting](#debugging--troubleshooting)
6. [Testing Strategies](#testing-strategies)
7. [Git Workflow & Branching Strategy](#git-workflow--branching-strategy)
8. [Deployment & CI/CD](#deployment--cicd)
9. [Performance Optimization](#performance-optimization)
10. [Security Guidelines](#security-guidelines)
11. [Common Development Tasks](#common-development-tasks)
12. [FAQ & Resources](#faq--resources)

---

## 🚀 Quick Start

Get up and running in under 15 minutes with our automated setup:

```bash
# 1. Clone the repository
git clone https://github.com/GaryOcean428/crazy-gary.git
cd crazy-gary

# 2. Automated setup (installs dependencies, sets up hooks, configures environment)
npm run setup

# 3. Start development servers
npm run dev

# 4. Open your browser
open http://localhost:5173  # Frontend
open http://localhost:3000  # Backend API
```

### 🎯 Verification Checklist

After setup, verify everything is working:

- [ ] Frontend loads at `http://localhost:5173`
- [ ] Backend API responds at `http://localhost:3000/health`
- [ ] You can register a new user account
- [ ] Quality gates are installed (`npm run hooks:status`)
- [ ] Tests pass (`npm run test`)

---

## 🛠️ Development Environment Setup

### Prerequisites

Install these tools on your system:

#### Required Software

| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| **Node.js** | 18+ | Frontend development | [nodejs.org](https://nodejs.org) |
| **Python** | 3.10+ | Backend development | [python.org](https://python.org) |
| **Docker** | Latest | Containerization | [docker.com](https://docker.com) |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com) |
| **PostgreSQL** | 13+ | Database | [postgresql.org](https://postgresql.org) |

#### Optional Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| **Railway CLI** | Deployment management | `npm install -g @railway/cli` |
| **Postman** | API testing | [postman.com](https://postman.com) |
| **VS Code** | Recommended IDE | [code.visualstudio.com](https://code.visualstudio.com) |
| **GitHub Desktop** | Git GUI | [desktop.github.com](https://desktop.github.com) |

### Environment Configuration

#### 1. Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Configure these key variables:

```env
# Required - Security
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here

# Required - Database
DATABASE_URL=postgresql://username:password@localhost:5432/crazy_gary_dev

# Required - AI Model Endpoints
HUGGINGFACE_API_KEY=your-huggingface-key
HF_BASE_URL_120B=https://your-120b-endpoint.hf.co
HF_BASE_URL_20B=https://your-20b-endpoint.hf.co

# Optional - External Services
OPENAI_API_KEY=your-openai-key
OPENROUTER_API_KEY=your-openrouter-key
SENTRY_DSN=your-sentry-dsn

# Optional - Development
NODE_ENV=development
DEBUG=crazy-gary:*
RATE_LIMIT_RPS=10
```

#### 2. IDE Configuration

For VS Code users, we recommend these extensions:

```json
{
  "recommendations": [
    "ms-python.python",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json"
  ]
}
```

#### 3. Project-Specific Setup

Install and configure project tooling:

```bash
# Install all dependencies
npm install

# Set up quality gates and pre-commit hooks
npm run hooks:install:enhanced

# Verify installation
npm run quality:validate
```

### 🐳 Docker Development

For consistent development environments:

```bash
# Start all services with Docker
docker-compose up --build

# Start specific service
docker-compose up web

# View logs
docker-compose logs -f api

# Rebuild and restart
docker-compose down && docker-compose up --build
```

---

## 🏗️ Project Architecture Overview

### System Architecture

Crazy-Gary follows a modern microservices architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Flask)       │◄──►│  (PostgreSQL)   │
│   Port: 5173    │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  AI Models      │    │   MCP Tools     │    │   Monitoring    │
│  (HuggingFace)  │    │  (External)     │    │   (Observability)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

#### Frontend (`apps/web/`)
- **Framework**: React 19 + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: React Context + Custom Hooks
- **Routing**: React Router v6
- **Build Tool**: Vite

**Key Features**:
- Responsive design with mobile-first approach
- Dark/light theme support
- Real-time updates via WebSocket
- Comprehensive accessibility (WCAG 2.1 AA)

#### Backend (`apps/api/`)
- **Framework**: Flask + SQLAlchemy
- **Authentication**: JWT with Redis sessions
- **Async**: asyncio for concurrent operations
- **API**: RESTful with WebSocket support

**Key Features**:
- Multi-agent orchestration engine
- MCP (Model Context Protocol) integration
- Real-time monitoring and observability
- Comprehensive security middleware

#### Database Schema

```sql
-- Core Tables
users               -- User authentication and profiles
agent_tasks         -- Task management and tracking
model_endpoints     -- AI model configuration
harmony_messages    -- Message format standardization
monitoring_events   -- System observability
security_logs       -- Security audit trail
```

### Data Flow

1. **User Request**: Frontend sends request to Backend API
2. **Authentication**: JWT validation and session management
3. **Task Processing**: Heavy orchestration creates agent tasks
4. **Tool Execution**: MCP tools are discovered and executed
5. **AI Integration**: Models process requests and generate responses
6. **Real-time Updates**: WebSocket pushes updates to frontend
7. **Monitoring**: All actions logged for observability

---

## 📝 Coding Standards & Best Practices

### Code Quality Standards

We enforce strict quality gates to maintain high code standards:

#### TypeScript/JavaScript Standards

```typescript
// ✅ Good: Clear naming and proper typing
interface TaskCreationRequest {
  readonly prompt: string;
  readonly priority: TaskPriority;
  readonly tools?: ReadonlyArray<string>;
}

// ✅ Good: Functional programming patterns
const processTasks = (tasks: Task[]): Task[] =>
  tasks
    .filter(task => task.status === 'pending')
    .sort((a, b) => a.priority - b.priority)
    .map(task => ({ ...task, processedAt: new Date() }));

// ✅ Good: Error handling with proper types
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  if (error instanceof ValidationError) {
    return { success: false, error: error.message };
  }
  throw error; // Re-throw unexpected errors
}
```

#### Python Standards

```python
# ✅ Good: Type hints and proper error handling
from typing import Optional, Dict, Any
from dataclasses import dataclass

@dataclass
class AgentTask:
    prompt: str
    task_id: str
    priority: int = 1
    
    def execute(self) -> Dict[str, Any]:
        try:
            result = self._run_heavy_orchestration()
            return {"status": "success", "result": result}
        except Exception as e:
            logger.error(f"Task {self.task_id} failed: {e}")
            return {"status": "error", "error": str(e)}
```

### Code Organization

#### File Structure Standards

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── layout/         # Layout components (header, sidebar, etc.)
│   └── features/       # Feature-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Route components
├── contexts/           # React context providers
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

#### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `UserDashboard.tsx` |
| **Hooks** | camelCase + 'use' prefix | `useAuth.ts` |
| **Utilities** | camelCase | `formatCurrency.ts` |
| **Constants** | UPPER_SNAKE_CASE | `API_ENDPOINTS.ts` |
| **Types/Interfaces** | PascalCase | `UserProfile.ts` |
| **Files** | kebab-case | `user-profile.ts` |

### Performance Guidelines

#### Frontend Performance

```typescript
// ✅ Good: Memoize expensive computations
const expensiveValue = useMemo(() => {
  return data.items.reduce((acc, item) => acc + item.value, 0);
}, [data.items]);

// ✅ Good: Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// ✅ Good: Proper dependency arrays
useEffect(() => {
  const subscription = api.subscribe(eventHandler);
  return () => subscription.unsubscribe();
}, [eventHandler]);
```

#### Backend Performance

```python
# ✅ Good: Async operations for I/O
import asyncio

async def process_multiple_requests(requests: List[Request]) -> List[Response]:
    tasks = [process_single_request(req) for req in requests]
    return await asyncio.gather(*tasks)

# ✅ Good: Connection pooling
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30
)
```

### Documentation Standards

#### Code Documentation

```typescript
/**
 * Creates a new agent task with the specified parameters.
 * 
 * @param prompt - The natural language prompt for the task
 * @param options - Configuration options for task execution
 * @returns Promise that resolves with the created task
 * 
 * @example
 * ```typescript
 * const task = await createAgentTask("Analyze sales data", {
 *   priority: Priority.HIGH,
 *   tools: ["data_analyzer", "chart_generator"]
 * });
 * ```
 */
async function createAgentTask(
  prompt: string,
  options: TaskOptions = {}
): Promise<AgentTask> {
  // Implementation here
}
```

---

## 🐛 Debugging & Troubleshooting

### Development Debugging

#### Frontend Debugging

**React Developer Tools**:
- Install React DevTools browser extension
- Use Component tab to inspect component tree
- Use Profiler tab to analyze performance

**Common Issues**:

```typescript
// Issue: State updates not reflecting
// ❌ Wrong: Direct state mutation
user.name = "New Name";

// ✅ Correct: Use setState
setUser(prev => ({ ...prev, name: "New Name" }));

// Issue: Infinite re-renders
// ❌ Wrong: Missing dependency array
useEffect(() => {
  fetchUserData();
}, []); // Missing userId dependency

// ✅ Correct: Proper dependencies
useEffect(() => {
  fetchUserData(userId);
}, [userId]);
```

**Debug Logging**:

```typescript
// Add debug logs for troubleshooting
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data);
  }
};

// Use in components
debugLog('User data loaded', { userId: user.id, tasks: tasks.length });
```

#### Backend Debugging

**Python Debugging**:

```python
import logging
import pdb  # Python debugger

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def debug_agent_task(task_id: str):
    # Set breakpoint for interactive debugging
    pdb.set_trace()
    
    logger.debug(f"Processing task: {task_id}")
    
    # Continue execution
    continue  # or 'n' for next line in debugger
```

**Flask Debug Mode**:

```python
# Enable debug mode for development
if __name__ == '__main__':
    app.run(
        debug=True,
        host='0.0.0.0',
        port=3000,
        use_reloader=False  # Avoid double execution in debug mode
    )
```

### Common Issues & Solutions

#### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Connect to database directly
psql -h localhost -U username -d crazy_gary_dev

# Check connection pool
SELECT * FROM pg_stat_activity;
```

#### API Integration Issues

```bash
# Test API endpoints
curl -X GET http://localhost:3000/health

# Test with authentication
curl -H "Authorization: Bearer $JWT_TOKEN" \
     http://localhost:3000/api/user/profile
```

#### Docker Issues

```bash
# Clean restart
docker-compose down -v
docker system prune -f
docker-compose up --build

# Check container logs
docker-compose logs -f api
docker-compose logs -f web

# Enter container for debugging
docker-compose exec api bash
```

### Monitoring & Observability

#### Health Check Endpoints

```bash
# Basic health check
curl http://localhost:3000/health

# Readiness probe
curl http://localhost:3000/health/ready

# Liveness probe
curl http://localhost:3000/health/live
```

#### Structured Logging

```python
# Configure structured logging
import structlog

logger = structlog.get_logger()

def log_api_request(request_id: str, endpoint: str, status: int):
    logger.info(
        "api_request",
        request_id=request_id,
        endpoint=endpoint,
        status_code=status,
        timestamp=time.time()
    )
```

---

## 🧪 Testing Strategies

### Testing Philosophy

We follow a comprehensive testing pyramid:

```
        /\
       /  \     E2E Tests (10%)
      / E2E \
     /______\
    /        \
   /  Unit   \  Integration Tests (30%)
  /  Tests   \
 /__________\
/            \
/  Unit      \  Unit Tests (60%)
/  Tests     \
/____________\
```

### Unit Testing

#### Frontend Unit Tests

```typescript
// Example: Component testing with Jest + React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskManager } from './TaskManager';

describe('TaskManager', () => {
  it('should create a new task when form is submitted', () => {
    render(<TaskManager />);
    
    const input = screen.getByPlaceholderText('Enter task description');
    const submitButton = screen.getByText('Create Task');
    
    fireEvent.change(input, { target: { value: 'Test task' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });
});
```

#### Backend Unit Tests

```python
# Example: Python testing with pytest
import pytest
from unittest.mock import Mock, patch
from src.models.agent_loop import AgentLoop

@pytest.fixture
def agent_loop():
    return AgentLoop()

def test_create_task(agent_loop):
    task_data = {
        "prompt": "Analyze sales data",
        "priority": 1
    }
    
    task = agent_loop.create_task(**task_data)
    
    assert task.prompt == "Analyze sales data"
    assert task.priority == 1
    assert task.status == "pending"

@patch('src.services.external_api.HuggingFaceAPI')
def test_model_communication(mock_hf_api):
    mock_hf_api.return_value.generate.return_value = "Mock response"
    
    result = agent_loop.send_to_model("Test prompt")
    
    assert result == "Mock response"
    mock_hf_api.return_value.generate.assert_called_once()
```

### Integration Testing

#### API Integration Tests

```typescript
// Frontend API integration tests
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { TaskManager } from './TaskManager';

const server = setupServer(
  rest.post('/api/tasks', (req, res, ctx) => {
    return res(ctx.json({ id: '123', status: 'created' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('should create task via API', async () => {
  render(<TaskManager />);
  
  fireEvent.click(screen.getByText('Create Task'));
  
  await waitFor(() => {
    expect(screen.getByText('Task created successfully')).toBeInTheDocument();
  });
});
```

#### Database Integration Tests

```python
# Backend integration tests with test database
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.models.user import User
from src.database.base import Base

@pytest.fixture
def test_db():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_user_creation(test_db):
    user = User(email="test@example.com", password="hashed_password")
    test_db.add(user)
    test_db.commit()
    
    assert user.id is not None
    assert user.email == "test@example.com"
```

### End-to-End Testing

#### Playwright E2E Tests

```typescript
// Example: Full user workflow test
import { test, expect } from '@playwright/test';

test('complete user workflow', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:5173');
  
  // Register new user
  await page.click('text=Register');
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'securePassword123');
  await page.click('[data-testid=register-button]');
  
  // Verify registration success
  await expect(page.locator('text=Welcome')).toBeVisible();
  
  // Create and complete a task
  await page.click('[data-testid=new-task]');
  await page.fill('[data-testid=task-prompt]', 'Analyze this data');
  await page.click('[data-testid=create-task]');
  
  // Verify task appears in dashboard
  await expect(page.locator('text=Analyze this data')).toBeVisible();
  
  // Wait for task completion
  await page.waitForSelector('[data-testid=task-completed]', { timeout: 30000 });
});
```

### Test Configuration

#### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-setup.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### Pytest Configuration (`pytest.ini`)

```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    --verbose
    --tb=short
    --cov=src
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=80
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test TaskManager.test.tsx

# Run tests in watch mode
npm run test -- --watch

# Run backend tests
cd apps/api && python -m pytest

# Run E2E tests
npm run test:e2e

# Run visual regression tests
npm run test:visual
```

---

## 🌿 Git Workflow & Branching Strategy

### Branching Strategy

We use **Git Flow** with some modifications:

```
main (production)
├── develop (integration)
├── feature/ (new features)
├── bugfix/ (bug fixes)
├── hotfix/ (urgent production fixes)
└── release/ (release preparation)
```

### Branch Naming Conventions

| Branch Type | Naming Pattern | Example |
|-------------|----------------|---------|
| **Feature** | `feature/short-description` | `feature/user-dashboard` |
| **Bugfix** | `bugfix/issue-description` | `bugfix/login-validation` |
| **Hotfix** | `hotfix/urgent-fix` | `hotfix/security-patch` |
| **Release** | `release/version` | `release/v1.2.0` |

### Commit Message Standards

We use **Conventional Commits** format:

```
type(scope): subject

body (optional)

footer (optional)
```

#### Commit Types

| Type | Description | Example |
|------|-------------|---------|
| **feat** | New feature | `feat(auth): add OAuth2 login` |
| **fix** | Bug fix | `fix(api): resolve memory leak` |
| **docs** | Documentation | `docs(readme): update setup guide` |
| **style** | Code formatting | `style(css): fix indentation` |
| **refactor** | Code refactoring | `refactor(components): simplify logic` |
| **test** | Add/modify tests | `test(api): add integration tests` |
| **chore** | Maintenance | `chore(deps): update dependencies` |

#### Examples

```bash
feat(frontend): add real-time task updates

- Implement WebSocket connection for live task status
- Add optimistic updates for better UX
- Handle connection failures gracefully

Closes #123
```

```bash
fix(backend): resolve race condition in task creation

- Add database transaction for task creation
- Implement proper locking mechanism
- Add unit tests for concurrent scenarios

Fixes #456
```

### Development Workflow

#### 1. Start New Feature

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/user-settings

# Set up upstream tracking
git push -u origin feature/user-settings
```

#### 2. Development Process

```bash
# Make small, focused commits
git add .
git commit -m "feat(settings): add user profile form"

# Push regularly
git push origin feature/user-settings

# Keep branch updated
git fetch origin
git rebase origin/main
```

#### 3. Code Review Process

1. **Self-Review**: Ensure code passes all quality checks
2. **PR Creation**: Create pull request with clear description
3. **Review**: Address feedback and make requested changes
4. **Testing**: Ensure all tests pass in CI/CD
5. **Merge**: Squash and merge when approved

#### 4. Quality Gates

Before pushing, ensure all checks pass:

```bash
# Run quality gates
npm run quality:pre-commit

# If issues found, fix them:
npm run lint:fix
npm run format
npm run type-check
```

### Pull Request Guidelines

#### PR Template

```markdown
## 📝 Description
Brief description of changes made

## 🎯 Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## 🧪 Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] E2E tests pass

## 📋 Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)

## 📸 Screenshots (if applicable)
Add screenshots for UI changes
```

### Handling Merge Conflicts

```bash
# Update your branch with main
git checkout feature/user-settings
git fetch origin
git rebase origin/main

# If conflicts occur:
# 1. Resolve conflicts in files
# 2. Mark as resolved
git add .
git rebase --continue

# If you need to abort:
git rebase --abort

# Push resolved conflicts
git push --force-with-lease origin feature/user-settings
```

---

## 🚀 Deployment & CI/CD

### Railway Deployment

Crazy-Gary is optimized for Railway deployment with comprehensive automation.

#### Prerequisites

- Railway CLI: `npm install -g @railway/cli`
- GitHub repository connected to Railway
- Railway project created

#### Deployment Process

```bash
# 1. Login to Railway
railway login

# 2. Link to project
railway link

# 3. Deploy backend
cd apps/api
railway deploy

# 4. Deploy frontend
cd ../../apps/web
railway deploy
```

#### Environment Configuration

Configure these environment variables in Railway dashboard:

**Required Variables**:
```env
SECRET_KEY=your-production-secret
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=${{Postgres.DATABASE_URL}}
HUGGINGFACE_API_KEY=your-api-key
HF_BASE_URL_120B=your-120b-endpoint
HF_BASE_URL_20B=your-20b-endpoint
```

**Optional Variables**:
```env
NODE_ENV=production
SENTRY_DSN=your-sentry-dsn
OPENAI_API_KEY=your-openai-key
OPENROUTER_API_KEY=your-openrouter-key
```

### CI/CD Pipeline

We use GitHub Actions for automated CI/CD:

#### Workflow Triggers

- **Push to `main`**: Full deployment pipeline
- **Push to `develop`**: Staging deployment
- **Pull Request**: Automated testing and quality checks
- **Release tags**: Production deployment

#### Pipeline Stages

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Stage 1: Quality Checks
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run quality gates
        run: npm run quality:pre-commit
      
      - name: Run tests
        run: npm run test:coverage

  # Stage 2: Build
  build:
    needs: quality-checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build applications
        run: |
          npm run build:api
          npm run build:web

  # Stage 3: Deploy
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        run: railway deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### Deployment Strategies

#### Blue-Green Deployment

For zero-downtime deployments:

```bash
# Deploy to staging environment first
railway deploy --environment staging

# Run smoke tests
npm run test:smoke

# If tests pass, promote to production
railway promote staging production
```

#### Rollback Strategy

```bash
# Quick rollback to previous version
railway rollback

# Or specific deployment
railway rollback <deployment-id>

# Monitor rollback success
railway status
```

### Monitoring & Alerts

#### Health Check Integration

```bash
# Configure Railway health checks
railway health-check --path /health --interval 30s

# Monitor deployment status
railway status --follow
```

#### Automated Alerts

Set up alerts for:
- Deployment failures
- High error rates (>5%)
- Response time > 2 seconds
- Memory usage > 80%

---

## ⚡ Performance Optimization

### Frontend Performance

#### Bundle Optimization

```typescript
// Lazy loading for better initial load times
const HeavyDashboard = lazy(() => import('./pages/HeavyDashboard'));
const TaskManager = lazy(() => import('./pages/TaskManager'));

// Code splitting by routes
const AppRouter = () => (
  <Routes>
    <Route path="/dashboard" element={<HeavyDashboard />} />
    <Route path="/tasks" element={<TaskManager />} />
  </Routes>
);
```

#### Caching Strategy

```typescript
// API response caching
const useCachedAPI = <T>(key: string, fetcher: () => Promise<T>) => {
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  });
};

// Component memoization
const TaskItem = memo(({ task }: { task: Task }) => {
  return <div>{task.title}</div>;
});
```

#### Performance Monitoring

```typescript
// Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric: any) => {
  // Send to your analytics service
  console.log(metric);
};

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Backend Performance

#### Database Optimization

```python
# Connection pooling
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Query optimization with indexing
class AgentTask(db.Model):
    __tablename__ = 'agent_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)
    status = db.Column(db.String(20), index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Composite index for common queries
    __table_args__ = (
        db.Index('idx_user_status_created', 'user_id', 'status', 'created_at'),
    )
```

#### Async Operations

```python
import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor

async def process_multiple_models(prompt: str) -> Dict[str, str]:
    """Process prompt with multiple AI models concurrently."""
    
    async with aiohttp.ClientSession() as session:
        tasks = [
            call_model_api(session, '120b', prompt),
            call_model_api(session, '20b', prompt),
            call_model_api(session, 'gpt4', prompt),
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return {
            '120b': results[0] if not isinstance(results[0], Exception) else None,
            '20b': results[1] if not isinstance(results[1], Exception) else None,
            'gpt4': results[2] if not isinstance(results[2], Exception) else None,
        }

# Use thread pool for CPU-intensive operations
def cpu_intensive_task(data: List[Dict]) -> List[Dict]:
    with ThreadPoolExecutor(max_workers=4) as executor:
        return list(executor.map(process_item, data))
```

#### Caching Layer

```python
import redis
import json
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_result(expiration=300):  # 5 minutes default
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            redis_client.setex(
                cache_key, 
                expiration, 
                json.dumps(result, default=str)
            )
            return result
        return wrapper
    return decorator

@cache_result(expiration=600)  # 10 minutes
async def get_user_tasks(user_id: int) -> List[Dict]:
    # Expensive database query
    return await db.fetch_user_tasks(user_id)
```

### Performance Testing

#### Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test configuration
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/health"
      - post:
          url: "/api/tasks"
          json:
            prompt: "Test load scenario"
EOF

# Run load test
artillery run load-test.yml
```

#### Performance Monitoring

```bash
# Monitor application performance
npm run performance:monitor

# Check bundle size
npm run check-bundle

# Analyze bundle
npm run analyze:bundle
```

---

## 🔒 Security Guidelines

### Security First Approach

Security is embedded in every aspect of development. Follow these guidelines:

### Authentication & Authorization

#### JWT Security

```python
# Secure JWT configuration
from flask_jwt_extended import JWTManager

jwt = JWTManager(app)

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.environ['JWT_SECRET_KEY']
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
app.config['JWT_ALGORITHM'] = 'HS256'

# Token blacklist for logout
blacklist = set()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return jti in blacklist
```

#### Password Security

```python
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
import string

def create_secure_password(length=16):
    """Generate a cryptographically secure random password."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

def hash_password(password: str) -> str:
    return generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

def verify_password(password: str, hashed: str) -> bool:
    return check_password_hash(hashed, password)
```

### Input Validation & Sanitization

#### Frontend Validation

```typescript
// Use Zod for runtime type checking
import { z } from 'zod';

const TaskSchema = z.object({
  prompt: z.string().min(1).max(1000),
  priority: z.number().min(1).max(5),
  tools: z.array(z.string()).max(10),
});

const createTask = (data: unknown) => {
  const result = TaskSchema.safeParse(data);
  
  if (!result.success) {
    throw new ValidationError(result.error.errors);
  }
  
  return result.data;
};
```

#### Backend Validation

```python
from marshmallow import Schema, fields, validate, ValidationError
import bleach

class TaskSchema(Schema):
    prompt = fields.Str(required=True, validate=validate.Length(min=1, max=1000))
    priority = fields.Int(validate=validate.Range(min=1, max=5))
    tools = fields.List(fields.Str(), validate=validate.Length(max=10))
    
    def clean_prompt(self, prompt: str) -> str:
        # Sanitize HTML input
        return bleach.clean(prompt, tags=[], strip=True)

def validate_task_data(data: dict) -> TaskSchema:
    schema = TaskSchema()
    try:
        return schema.load(data)
    except ValidationError as err:
        raise ValueError(f"Invalid data: {err.messages}")
```

### API Security

#### Rate Limiting

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/tasks', methods=['POST'])
@limiter.limit("10 per minute")
@jwt_required()
def create_task():
    # Implementation here
    pass
```

#### CORS Configuration

```python
from flask_cors import CORS

CORS(app, 
     origins=['https://yourdomain.com'],
     methods=['GET', 'POST', 'PUT', 'DELETE'],
     allow_headers=['Content-Type', 'Authorization'],
     credentials=True)
```

#### Request Logging & Monitoring

```python
import structlog
from flask import request

logger = structlog.get_logger()

@app.before_request
def log_request_info():
    logger.info(
        "request_started",
        method=request.method,
        path=request.path,
        remote_addr=request.remote_addr,
        user_agent=request.headers.get('User-Agent'),
        request_id=request.headers.get('X-Request-ID')
    )
```

### Data Protection

#### Encryption at Rest

```python
from cryptography.fernet import Fernet
import base64

class DataEncryption:
    def __init__(self, key: str):
        self.cipher = Fernet(key.encode())
    
    def encrypt(self, data: str) -> str:
        encrypted = self.cipher.encrypt(data.encode())
        return base64.urlsafe_b64encode(encrypted).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        decoded = base64.urlsafe_b64decode(encrypted_data.encode())
        decrypted = self.cipher.decrypt(decoded)
        return decrypted.decode()

# Usage for sensitive data
encryption = DataEncryption(os.environ['ENCRYPTION_KEY'])
encrypted_token = encryption.encrypt(sensitive_data)
```

#### Secure Headers

```python
from flask_talisman import Talisman

Talisman(app, 
         force_https=True,
         strict_transport_security=True,
         content_security_policy={
             'default-src': "'self'",
             'script-src': "'self' 'unsafe-inline'",
             'style-src': "'self' 'unsafe-inline'",
         })
```

### Security Testing

#### Dependency Scanning

```bash
# Regular security audits
npm audit --audit-level moderate

# Automated security scanning
npm run security:scan

# Python dependency check
pip install safety
safety check
```

#### Security Test Cases

```python
import pytest
from flask import url_for

class TestSecurity:
    
    def test_sql_injection_protection(self, client):
        """Test protection against SQL injection."""
        malicious_input = "'; DROP TABLE users; --"
        response = client.post('/api/tasks', 
                             json={'prompt': malicious_input})
        assert response.status_code != 500
    
    def test_xss_protection(self, client):
        """Test protection against XSS attacks."""
        xss_payload = "<script>alert('xss')</script>"
        response = client.post('/api/tasks',
                             json={'prompt': xss_payload})
        # Ensure script tags are escaped in response
        assert '<script>' not in response.get_data(as_text=True)
    
    def test_rate_limiting(self, client):
        """Test rate limiting enforcement."""
        # Make many requests quickly
        for _ in range(100):
            response = client.get('/api/tasks')
        # Should eventually be rate limited
        assert response.status_code in [429, 503]
```

### Security Best Practices

#### Environment Security

```bash
# Never commit secrets
echo ".env" >> .gitignore

# Use environment-specific secrets
export DEV_SECRET_KEY="dev-secret"
export PROD_SECRET_KEY="prod-secret"

# Rotate secrets regularly
# Update database passwords every 90 days
# Update API keys every 6 months
```

#### Code Security Review

Before merging, ensure:
- [ ] No hardcoded secrets or API keys
- [ ] All inputs are validated and sanitized
- [ ] Authentication is required for protected endpoints
- [ ] Authorization checks are in place
- [ ] Rate limiting is implemented
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies are up to date
- [ ] Security headers are configured

---

## 🛠️ Common Development Tasks

### Setting Up Development Environment

```bash
# Complete setup script
./scripts/setup-dev.sh

# This script will:
# 1. Install all dependencies
# 2. Set up environment variables
# 3. Initialize database
# 4. Install pre-commit hooks
# 5. Start development servers
```

### Adding New Features

#### 1. Create Feature Branch

```bash
git checkout -b feature/new-feature-name
```

#### 2. Develop Component

```typescript
// Create new component
// src/components/features/new-feature/NewFeature.tsx
import React from 'react';

interface NewFeatureProps {
  title: string;
  onAction: () => void;
}

export const NewFeature: React.FC<NewFeatureProps> = ({ title, onAction }) => {
  return (
    <div className="new-feature">
      <h3>{title}</h3>
      <button onClick={onAction}>Execute</button>
    </div>
  );
};
```

#### 3. Add API Endpoint

```python
# apps/api/src/routes/new_feature.py
from flask import Blueprint, request, jsonify
from ..middleware.auth import jwt_required

bp = Blueprint('new_feature', __name__, url_prefix='/api/new-feature')

@bp.route('/', methods=['POST'])
@jwt_required()
def create_feature():
    data = request.get_json()
    
    # Validate input
    # Process request
    # Return response
    
    return jsonify({'success': True, 'data': result})
```

#### 4. Write Tests

```typescript
// src/__tests__/features/new-feature.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NewFeature } from '../components/features/new-feature/NewFeature';

describe('NewFeature', () => {
  it('should render and respond to user interaction', () => {
    const mockAction = jest.fn();
    render(<NewFeature title="Test Feature" onAction={mockAction} />);
    
    fireEvent.click(screen.getByText('Execute'));
    
    expect(mockAction).toHaveBeenCalledTimes(1);
  });
});
```

### Database Operations

#### Creating Migrations

```bash
# Generate new migration
cd apps/api
flask db migrate -m "Add new feature table"

# Apply migration
flask db upgrade
```

#### Migration Example

```python
# migrations/versions/xxx_add_feature_table.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table('feature_table',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )
    op.create_index('idx_feature_name', 'feature_table', ['name'])

def downgrade():
    op.drop_index('idx_feature_name')
    op.drop_table('feature_table')
```

### API Development

#### RESTful Endpoint Pattern

```python
# Standard CRUD operations
class FeatureResource:
    
    @staticmethod
    @bp.route('/<int:feature_id>', methods=['GET'])
    @jwt_required()
    def get_feature(feature_id):
        """Get single feature by ID."""
        feature = Feature.query.get_or_404(feature_id)
        return jsonify(feature.to_dict())
    
    @staticmethod
    @bp.route('/', methods=['POST'])
    @jwt_required()
    def create_feature():
        """Create new feature."""
        data = request.get_json()
        
        # Validation
        # Creation
        # Response
        
        return jsonify(feature.to_dict()), 201
    
    @staticmethod
    @bp.route('/<int:feature_id>', methods=['PUT'])
    @jwt_required()
    def update_feature(feature_id):
        """Update existing feature."""
        feature = Feature.query.get_or_404(feature_id)
        data = request.get_json()
        
        # Update logic
        
        return jsonify(feature.to_dict())
    
    @staticmethod
    @bp.route('/<int:feature_id>', methods=['DELETE'])
    @jwt_required()
    def delete_feature(feature_id):
        """Delete feature."""
        feature = Feature.query.get_or_404(feature_id)
        
        # Deletion logic
        
        return '', 204
```

### Testing Workflows

#### Running Test Suites

```bash
# Quick test during development
npm run test:fast

# Full test suite with coverage
npm run test:coverage

# Specific test file
npm test UserProfile.test.tsx

# Test in watch mode
npm run test -- --watch

# Backend tests
cd apps/api && python -m pytest -v

# E2E tests
npm run test:e2e
```

#### Debugging Tests

```typescript
// Add debug output to tests
it('should handle complex scenario', async () => {
  console.log('Debug: Starting test scenario');
  
  const result = await complexOperation();
  
  console.log('Debug: Result:', result);
  console.log('Debug: Assertions starting');
  
  expect(result.status).toBe('success');
  expect(result.data).toBeDefined();
  
  console.log('Debug: Test completed successfully');
});
```

### Performance Optimization Tasks

#### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze:bundle

# Check for large dependencies
npm run analyze:deps

# Performance monitoring
npm run performance:monitor
```

#### Database Optimization

```python
# Add database indexes for common queries
class OptimizedQuery:
    
    @staticmethod
    def get_user_tasks_efficient(user_id: int, limit: int = 50):
        """Optimized query with proper indexing."""
        return db.session.query(AgentTask)\
            .filter(AgentTask.user_id == user_id)\
            .order_by(AgentTask.created_at.desc())\
            .limit(limit)\
            .all()
```

### Deployment Tasks

#### Pre-deployment Checklist

```bash
# Before deploying, ensure:
npm run quality:pre-commit        # Quality gates pass
npm run test:coverage             # Tests pass with good coverage
npm run security:scan            # Security scan passes
npm run build:production         # Production build succeeds

# Database migrations ready
flask db migrate -m "Production deployment"
flask db upgrade
```

#### Post-deployment Verification

```bash
# Verify deployment
curl -f http://your-domain.com/health

# Check logs
railway logs --tail 100

# Run smoke tests
npm run test:smoke
```

---

## ❓ FAQ & Resources

### Frequently Asked Questions

#### Getting Started

**Q: I'm new to the project. Where should I start?**
A: Begin with the [Quick Start](#quick-start) section, then read through the [Project Architecture](#project-architecture-overview). Set up your development environment using the automated setup script.

**Q: What IDE do you recommend?**
A: VS Code with the recommended extensions (see [IDE Configuration](#ide-configuration)). We also support PyCharm for Python development and WebStorm for frontend work.

**Q: How long does initial setup take?**
A: With the automated setup script, typically 10-15 minutes. Manual setup takes 30-45 minutes depending on your system.

#### Development Workflow

**Q: When should I create a new branch?**
A: Create a new branch for every feature, bug fix, or improvement. Follow the naming conventions in [Git Workflow](#git-workflow--branching-strategy).

**Q: How often should I commit?**
A: Make small, focused commits frequently (every few hours of work). Each commit should represent a logical unit of change.

**Q: What if my pull request fails CI/CD?**
A: Check the CI/CD logs for specific failures. Common issues include linting errors, test failures, or security scan failures. Fix the issues and push again.

#### Technical Questions

**Q: How do I debug API issues?**
A: Use the health check endpoints (`/health`, `/health/ready`, `/health/live`), check structured logs, and use the debugging tools described in [Debugging & Troubleshooting](#debugging--troubleshooting).

**Q: How do I add a new database table?**
A: Create a migration using Flask-Migrate, add the model to the appropriate module, and update the database schema. See [Database Operations](#database-operations) for examples.

**Q: How do I test my changes locally?**
A: Run `npm run dev` to start all services, use `npm run test` for testing, and `npm run quality:pre-commit` for quality checks before committing.

#### Performance & Security

**Q: How do I optimize my code for performance?**
A: Follow the guidelines in [Performance Optimization](#performance-optimization), use lazy loading for React components, implement caching strategies, and profile your code regularly.

**Q: What should I do if I discover a security vulnerability?**
A: Report it immediately to the security team via the private security email. Do not create a public issue. Follow the responsible disclosure process.

### Useful Resources

#### Documentation Links

- **[Project README](../README.md)** - Overview and quick start
- **[API Documentation](./API.md)** - Complete API reference
- **[Architecture Decisions](./ADR/)** - Technical decision records
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Testing Guide](./TESTING_STRATEGY.md)** - Testing best practices
- **[Security Guide](./SECURITY.md)** - Security policies and procedures

#### External Resources

**Learning Materials**:
- [React Documentation](https://react.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/tutorial/)

**Tools & Services**:
- [Railway Documentation](https://docs.railway.app/)
- [HuggingFace Documentation](https://huggingface.co/docs)
- [MCP Documentation](https://spec.modelcontextprotocol.io/)

**Development Tools**:
- [VS Code Extensions](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Postman API Platform](https://www.postman.com/)

### Community & Support

#### Getting Help

1. **Internal Slack Channels**:
   - `#dev-help` - General development questions
   - `#backend` - Backend-specific issues
   - `#frontend` - Frontend-specific issues
   - `#devops` - Infrastructure and deployment
   - `#security` - Security-related discussions

2. **Office Hours**:
   - Monday/Wednesday 2-3 PM - Senior developer availability
   - Friday 1-2 PM - Architecture discussions

3. **Documentation**:
   - Check this guide first
   - Search existing issues in GitHub
   - Review architectural decision records

#### Contributing Back

**Ways to Contribute**:
- Fix bugs and create pull requests
- Improve documentation
- Add new tests
- Optimize performance
- Enhance security measures
- Mentor new developers

**Contribution Process**:
1. Check the [contribution guidelines](../CONTRIBUTING.md)
2. Look for issues labeled `good-first-issue`
3. Follow the coding standards and quality gates
4. Write comprehensive tests
5. Update documentation as needed

### Troubleshooting Common Issues

#### Environment Issues

**Problem**: `npm install` fails with permission errors
```bash
# Solution: Fix npm permissions
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Python virtual environment issues
```bash
# Solution: Recreate virtual environment
cd apps/api
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Problem**: Database connection fails
```bash
# Solution: Check PostgreSQL status and connection
sudo systemctl status postgresql
psql -h localhost -U postgres -d crazy_gary_dev
```

#### Development Server Issues

**Problem**: Frontend doesn't start
```bash
# Solution: Clear cache and restart
npm run clean
npm install
npm run dev
```

**Problem**: Backend API not responding
```bash
# Solution: Check logs and restart
cd apps/api
source venv/bin/activate
python src/main.py
```

#### Git Issues

**Problem**: Merge conflicts
```bash
# Solution: Resolve conflicts properly
git status
# Edit conflicting files
git add .
git commit -m "resolve merge conflicts"
```

**Problem**: Accidentally committed to wrong branch
```bash
# Solution: Move commits to correct branch
git branch feature-branch
git reset --hard HEAD~1  # Remove from current branch
git checkout feature-branch
```

### Performance Tips

#### Development Speed
- Use `npm run dev` to start all services simultaneously
- Enable hot reloading for faster iteration
- Use `npm run quality:fast` for quick quality checks
- Set up aliases in your shell for common commands

#### Code Quality
- Run `npm run lint:fix` automatically before commits
- Use TypeScript strict mode for better type safety
- Write tests alongside new features
- Monitor bundle size with `npm run check-bundle`

#### Debugging Efficiency
- Use browser developer tools for frontend debugging
- Enable debug logging in development
- Use Postman for API testing
- Set breakpoints in your IDE for backend debugging

---

## 🎉 Welcome to the Team!

You're now equipped with all the knowledge needed to become a productive member of the Crazy-Gary development team. Remember:

- **Ask questions** - There are no stupid questions
- **Follow standards** - They exist to help everyone
- **Write tests** - Your future self will thank you
- **Document your work** - Help others understand your changes
- **Stay curious** - Technology evolves, keep learning

Happy coding! 🚀

---

*Last updated: December 17, 2025*
*Version: 1.0*
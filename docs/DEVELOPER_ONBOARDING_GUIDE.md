<<<<<<< HEAD
# 🚀 Developer Onboarding Guide

Welcome to the Crazy-Gary development team! This comprehensive guide will help you get up to speed quickly and become a productive contributor to our autonomous agentic AI system.
=======
# 🚀 Crazy-Gary Developer Onboarding Guide

Welcome to the Crazy-Gary autonomous agentic AI system! This comprehensive guide will help you get up and running quickly as a productive developer on our team.
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Development Environment Setup](#development-environment-setup)
<<<<<<< HEAD
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
=======
3. [Project Architecture](#project-architecture)
4. [Coding Standards](#coding-standards)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Performance](#performance)
9. [Security](#security)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e

---

## 🚀 Quick Start

<<<<<<< HEAD
Get up and running in under 15 minutes with our automated setup:
=======
### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.10+ ([Download](https://python.org/))
- **Git** ([Download](https://git-scm.com/))
- **Docker** (optional, for containerized development)
- **Railway CLI** (optional, for deployment)

### 5-Minute Setup
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e

```bash
# 1. Clone the repository
git clone https://github.com/GaryOcean428/crazy-gary.git
cd crazy-gary

<<<<<<< HEAD
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
=======
# 2. Install dependencies
npm install
cd apps/web && npm install
cd ../../apps/api && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start development servers
npm run dev  # Starts frontend on port 5173
# In another terminal:
cd apps/api && source venv/bin/activate && python src/main.py  # Starts API on port 8000

# 5. Visit the application
open http://localhost:5173
```

### Verify Installation

Run our automated setup verification:

```bash
npm run setup:verify
```

Expected output:
```
✅ Node.js version: 18.17.0
✅ Python version: 3.11.5
✅ Dependencies installed
✅ Environment configured
✅ Development servers can start
```
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e

---

## 🛠️ Development Environment Setup

<<<<<<< HEAD
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
=======
### 1. Repository Setup

```bash
# Clone with proper git configuration
git clone https://github.com/GaryOcean428/crazy-gary.git
cd crazy-gary

# Configure git
git config user.name "Your Name"
git config user.email "your.email@company.com"

# Set up pre-commit hooks
npm run hooks:install:enhanced
```

### 2. Environment Configuration

Create your environment file:
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e

```bash
cp .env.example .env
```

<<<<<<< HEAD
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
=======
Configure the following variables:

```env
# API Configuration
API_BASE_URL=http://localhost:8000
API_KEY=your_api_key_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/crazy_gary

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_jwt_secret_here
SECRET_KEY=your_secret_key_here

# External Services
HUGGINGFACE_API_TOKEN=your_hf_token
OPENAI_API_KEY=your_openai_key
OPENROUTER_API_KEY=your_openrouter_key

# Development
NODE_ENV=development
VITE_API_URL=http://localhost:8000
```

### 3. IDE Configuration

#### VS Code (Recommended)

Install recommended extensions:

```bash
# Install recommended extensions
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-python.python
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-typescript-next
```

Recommended VS Code settings:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

#### WebStorm/IntelliJ

1. Enable ESLint and Prettier integration
2. Configure TypeScript for the project
3. Set up Python virtual environment
4. Enable auto-save and formatting

### 4. Development Tools

#### Recommended Browser Extensions

- **React Developer Tools**
- **Redux DevTools**
- **axe DevTools** (accessibility)
- **Lighthouse**
- **JSON Viewer**

#### Command Line Tools

```bash
# Install global development tools
npm install -g @vitejs/cli typescript
pip install black flake8 mypy

# Railway CLI (for deployment)
npm install -g @railway/cli
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e
```

---

<<<<<<< HEAD
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
=======
## 🏗️ Project Architecture

### Overview

Crazy-Gary is a full-stack autonomous agentic AI system with the following architecture:

```
crazy-gary/
├── apps/
│   ├── web/              # React frontend (Vite + TypeScript)
│   ├── api/              # Python Flask backend
│   └── mobile/           # React Native mobile app (future)
├── packages/             # Shared packages
│   ├── ui/               # Shared UI components
│   ├── utils/            # Shared utilities
│   └── types/            # Shared TypeScript types
├── docs/                 # Documentation
├── scripts/              # Build and deployment scripts
└── tests/                # End-to-end tests
```

### Frontend Architecture (React + TypeScript)

```
apps/web/src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Button, Input, etc.)
│   ├── layout/          # Layout components (Header, Sidebar)
│   └── features/        # Feature-specific components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── contexts/            # React contexts
├── types/               # TypeScript type definitions
└── styles/              # Global styles and Tailwind config
```

### Backend Architecture (Python + Flask)

```
apps/api/src/
├── routes/              # API route handlers
├── models/              # Database models
├── services/            # Business logic services
├── middleware/          # Request/response middleware
├── utils/               # Utility functions
└── config/              # Configuration files
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e
```

### Data Flow

<<<<<<< HEAD
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
=======
```
User Interface (React)
       ↓
API Client (Axios + Zod validation)
       ↓
Backend API (Flask + SQLAlchemy)
       ↓
Database (PostgreSQL + Redis cache)
       ↓
External Services (AI models, MCP tools)
```

### Key Technologies

#### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **React Router** - Navigation
- **React Query** - Data fetching
- **Zustand** - State management

#### Backend
- **Flask** - Web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Celery** - Background tasks
- **Flask-JWT-Extended** - Authentication

#### DevOps
- **GitHub Actions** - CI/CD
- **Railway** - Deployment platform
- **Docker** - Containerization
- **ESLint + Prettier** - Code formatting
- **Husky** - Git hooks

---

## 📝 Coding Standards

### TypeScript/JavaScript Standards

#### Code Style

```typescript
// ✅ Good: Clear naming and proper typing
interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
}

// ✅ Good: Use meaningful variable names
const getAuthenticatedUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('authToken')
  if (!token) return null
  
  try {
    return await userService.validateToken(token)
  } catch (error) {
    console.error('Token validation failed:', error)
    return null
  }
}

// ❌ Bad: Poor naming and unclear types
const data = await fetch('/api/user')
const user = data.json()
```

#### Component Structure

```typescript
// ✅ Good: Well-structured React component
interface ComponentProps {
  title: string
  onSubmit: (data: FormData) => Promise<void>
  className?: string
}

export const MyComponent: React.FC<ComponentProps> = ({
  title,
  onSubmit,
  className = ''
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = useCallback(async (data: FormData) => {
    setLoading(true)
    setError(null)
    
    try {
      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [onSubmit])
  
  return (
    <div className={cn('component-base', className)}>
      <h2>{title}</h2>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Form onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
```

#### Error Handling

```typescript
// ✅ Good: Comprehensive error handling
const fetchUserData = async (userId: string): Promise<UserData> => {
  try {
    const response = await apiClient.get(`/users/${userId}`)
    return userDataSchema.parse(response.data)
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        throw new NotFoundError(`User ${userId} not found`)
      }
      if (error.response?.status >= 500) {
        throw new ServerError('Internal server error')
      }
      throw new ApiError(error.response?.data?.message || 'API request failed')
    }
    throw new Error('Network error occurred')
  }
}
```

### Python Standards

#### Code Style

```python
# ✅ Good: Clear naming and proper typing
from typing import Optional, List
from dataclasses import dataclass

@dataclass
class UserProfile:
    id: str
    email: str
    name: str
    role: str
    created_at: datetime

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "created_at": self.created_at.isoformat()
        }

# ✅ Good: Proper error handling
def get_user_by_id(user_id: str) -> Optional[UserProfile]:
    try:
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return None
        return UserProfile(
            id=str(user.id),
            email=user.email,
            name=user.name,
            role=user.role,
            created_at=user.created_at
        )
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching user {user_id}: {e}")
        raise DatabaseError("Failed to fetch user data")
```

#### API Design

```python
# ✅ Good: RESTful API with proper status codes
@user_bp.route('/users/<user_id>', methods=['GET'])
def get_user(user_id: str):
    try:
        user = user_service.get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'data': user.to_dict()
        }), 200
        
    except ValidationError as e:
        return jsonify({
            'success': False,
            'error': 'Invalid user ID format',
            'details': str(e)
        }), 400
        
    except DatabaseError as e:
        logger.error(f"Database error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500
```

### Git Standards

#### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
# Good commit messages
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(api): resolve user data serialization issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(components): add unit tests for UserProfile component"
```

#### Branch Strategy

```
main (production)
├── develop (integration)
    ├── feature/user-authentication
    ├── feature/task-management
    └── bugfix/login-error
```

**Branch naming:**
- `feature/short-description`
- `bugfix/short-description`
- `hotfix/critical-fix`
- `release/version-number`

---

## 🔄 Development Workflow

### Daily Development

1. **Start your day**
   ```bash
   git pull origin main
   npm run quality:summary  # Check system status
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Develop with quality gates**
   ```bash
   # Quality gates run automatically on commit
   # Manual check:
   npm run quality:pre-commit
   ```

4. **Test your changes**
   ```bash
   npm run test          # Unit tests
   npm run test:e2e      # End-to-end tests
   npm run test:coverage # Coverage report
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use the PR template
   - Include screenshots/videos for UI changes
   - Ensure all checks pass
   - Request code review

### Code Review Process

#### For Authors

1. **Self-review first**
   - Run all tests
   - Check code coverage
   - Verify accessibility
   - Test on different devices

2. **PR Description**
   ```markdown
   ## What
   Brief description of changes
   
   ## Why
   Problem this solves
   
   ## How
   Implementation approach
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] E2E tests pass
   - [ ] Manual testing completed
   - [ ] Accessibility tested
   
   ## Screenshots
   (if applicable)
   ```

3. **Address feedback**
   - Reply to all comments
   - Make requested changes
   - Re-request review when ready

#### For Reviewers

1. **Review checklist**
   - [ ] Code quality and standards
   - [ ] Test coverage and quality
   - [ ] Security considerations
   - [ ] Performance impact
   - [ ] Accessibility compliance
   - [ ] Documentation updates

2. **Feedback types**
   - 🔴 **Blocking**: Must be fixed before merge
   - 🟡 **Important**: Should be addressed but not blocking
   - 🟢 **Suggestion**: Nice to have improvements

---

## 🧪 Testing

### Testing Strategy
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e

We follow a comprehensive testing pyramid:

```
<<<<<<< HEAD
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
=======
        /\       E2E Tests (Playwright)
       /  \      - User journeys
      / E2E\     - Cross-browser
     /______\    - Visual regression
    /        \   
   /  Unit   \  Unit Tests (Jest/Vitest)
  /  Tests   \ - Components
 /   + IT   \ - Functions
/___________\- Utilities
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e
```

### Unit Testing

<<<<<<< HEAD
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
=======
#### Frontend Tests

```typescript
// ✅ Good: Component test
import { render, screen, fireEvent } from '@testing-library/react'
import { UserProfile } from './UserProfile'

describe('UserProfile', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  }
  
  it('renders user information correctly', () => {
    render(<UserProfile user={mockUser} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })
  
  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn()
    render(<UserProfile user={mockUser} onEdit={onEdit} />)
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(mockUser)
  })
})
```

#### Backend Tests

```python
# ✅ Good: API endpoint test
import pytest
from flask import Flask

@pytest.fixture
def app():
    app = create_app('testing')
    app.config['TESTING'] = True
    return app

@pytest.fixture
def client(app: Flask):
    return app.test_client()

def test_get_user_success(client):
    """Test successful user retrieval"""
    response = client.get('/api/users/123')
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert 'user' in data
    assert data['user']['id'] == '123'

def test_get_user_not_found(client):
    """Test user not found"""
    response = client.get('/api/users/999')
    
    assert response.status_code == 404
    data = response.get_json()
    assert data['success'] is False
    assert 'User not found' in data['error']
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e
```

### Integration Testing

<<<<<<< HEAD
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
=======
```typescript
// ✅ Good: API integration test
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { render, screen, waitFor } from '@testing-library/react'
import { UserList } from './UserList'

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json({
        users: [
          { id: '1', name: 'John', email: 'john@example.com' },
          { id: '2', name: 'Jane', email: 'jane@example.com' }
        ]
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('loads and displays users', async () => {
  render(<UserList />)
  
  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
  })
})
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e
```

### End-to-End Testing

<<<<<<< HEAD
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
=======
```typescript
// ✅ Good: Playwright E2E test
import { test, expect } from '@playwright/test'

test.describe('User Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid=email]', 'user@example.com')
    await page.fill('[data-testid=password]', 'password123')
    await page.click('[data-testid=login-button]')
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid=user-menu]')).toBeVisible()
  })
  
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid=email]', 'invalid@example.com')
    await page.fill('[data-testid=password]', 'wrongpassword')
    await page.click('[data-testid=login-button]')
    
    await expect(page.locator('[data-testid=error-message]')).toBeVisible()
    await expect(page.locator('[data-testid=error-message]')).toContainText('Invalid credentials')
  })
})
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e
```

### Running Tests

```bash
<<<<<<< HEAD
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
=======
# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# Visual regression tests
npm run test:visual

# Accessibility tests
npm run test:a11y

# Performance tests
npm run test:performance
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e
```

---

<<<<<<< HEAD
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
=======
## 🐛 Debugging

### Frontend Debugging

#### Browser DevTools

1. **Elements Tab**
   - Inspect HTML structure
   - Modify CSS in real-time
   - Check responsive design

2. **Console Tab**
   ```javascript
   // Debug components
   console.log('Component rendered', props)
   
   // Debug state
   console.log('Current state:', this.state)
   
   // Debug performance
   console.time('operation')
   // ... operation
   console.timeEnd('operation')
   ```

3. **Sources Tab**
   - Set breakpoints
   - Step through code
   - Watch variables

4. **Network Tab**
   - Monitor API requests
   - Check response times
   - Verify request/response data

#### React DevTools

- **Components Tab**
  - Inspect component hierarchy
  - View props and state
  - Profile component performance

- **Profiler Tab**
  - Record performance
  - Identify render bottlenecks
  - Analyze component updates

#### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Jest Tests",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Backend Debugging

#### Flask Debugging

```python
# Enable debug mode
app.config['DEBUG'] = True

# Use Flask debug toolbar
from flask_debugtoolbar import DebugToolbarExtension
toolbar = DebugToolbarExtension(app)

# Debug SQLAlchemy queries
app.config['SQLALCHEMY_ECHO'] = True
```

#### Python Debugging

```python
# Use pdb for debugging
import pdb; pdb.set_trace()  # Set breakpoint

# Use ipdb for better debugging
import ipdb; ipdb.set_trace()  # Enhanced debugger

# Log debugging info
import logging
logging.debug(f"Processing user: {user_id}")
```

### Database Debugging

#### PostgreSQL

```sql
-- Enable query logging
SHOW log_statement;
SHOW log_min_duration_statement;

-- Analyze slow queries
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Check indexes
\d users
```

#### SQLAlchemy Debugging

```python
# Enable SQL logging
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Query debugging
result = User.query.filter_by(email='test@example.com')
print(str(result.statement))  # Print SQL query
```

### Common Issues

#### CORS Issues

```typescript
// Frontend: Check API URL
const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true
})

// Backend: Configure CORS
from flask_cors import CORS
CORS(app, origins=["http://localhost:5173"])
```

#### Authentication Issues

```typescript
// Check token storage
console.log('Auth token:', localStorage.getItem('authToken'))

// Debug token validation
const token = localStorage.getItem('authToken')
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]))
  console.log('Token payload:', payload)
}
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e
```

---

<<<<<<< HEAD
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
=======
## ⚡ Performance

### Frontend Performance

#### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npm run analyze

# Check bundle size limits
npm run check-bundle
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e
```

#### Performance Monitoring

```typescript
<<<<<<< HEAD
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
=======
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  // Send to analytics service
  console.log(metric)
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

#### Optimization Techniques

```typescript
// Code splitting
const LazyComponent = lazy(() => import('./LazyComponent'))

// Memoization
const MemoizedComponent = memo(({ data }) => {
  return <ExpensiveComponent data={data} />
})

// Virtual scrolling
import { FixedSizeList as List } from 'react-window'

const VirtualizedList = ({ items }) => (
  <List
    height={400}
    itemCount={items.length}
    itemSize={35}
  >
    {({ index, style }) => (
      <div style={style}>
        {items[index]}
      </div>
    )}
  </List>
)
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e
```

### Backend Performance

#### Database Optimization

```python
<<<<<<< HEAD
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
=======
# Use database indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

# Optimize queries
# ❌ Bad: N+1 query problem
users = User.query.all()
for user in users:
    print(user.tasks.count())  # This runs N+1 queries

# ✅ Good: Eager loading
users = User.query.options(joinedload(User.tasks)).all()
for user in users:
    print(len(user.tasks))  # Single query

# ✅ Good: Use select_related for foreign keys
users = User.query.select_related('profile').all()
```

#### Caching

```python
# Redis caching
from flask_caching import Cache

cache = Cache(app, config={
    'CACHE_TYPE': 'redis',
    'CACHE_REDIS_URL': 'redis://localhost:6379'
})

@cache.memoize(timeout=300)
def get_user_data(user_id: str):
    # Expensive operation
    return User.query.get(user_id).to_dict()

# Cache invalidation
@user_bp.route('/users/<user_id>', methods=['PUT'])
def update_user(user_id: str):
    # Update user logic
    cache.delete_memoized(get_user_data, user_id)
    return jsonify({'success': True})
```

#### Background Tasks

```python
# Celery for background tasks
from celery import Celery

celery = Celery('crazy_gary')

@celery.task
def process_heavy_computation(data):
    # Expensive operation
    return result

# Use in API endpoint
@api_bp.route('/process', methods=['POST'])
def start_processing():
    task = process_heavy_computation.delay(data)
    return jsonify({'task_id': task.id}), 202
```

---

## 🔒 Security

### Frontend Security

#### Content Security Policy

```typescript
// Vite config for CSP
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-eval'"], // Remove in production
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", "data:", "https:"],
  'connect-src': ["'self'", "https://api.example.com"]
}
```

#### XSS Prevention

```typescript
// ✅ Good: Use DOMPurify for user content
import DOMPurify from 'dompurify'

const sanitizeHTML = (dirty: string) => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  })
}

// ✅ Good: Use textContent instead of innerHTML
// ❌ Bad
element.innerHTML = userInput

// ✅ Good
element.textContent = userInput
```

#### CSRF Protection

```typescript
// Add CSRF token to requests
const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL,
  headers: {
    'X-CSRF-Token': getCsrfToken()
  }
})

function getCsrfToken(): string {
  const meta = document.querySelector('meta[name="csrf-token"]')
  return meta?.getAttribute('content') || ''
}
```

### Backend Security

#### Input Validation

```python
from marshmallow import Schema, fields, validate

class UserRegistrationSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=128)
    )
    name = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=100)
    )

@user_bp.route('/register', methods=['POST'])
def register_user():
    schema = UserRegistrationSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            'success': False,
            'errors': err.messages
        }), 400
    
    # Process valid data
    return jsonify({'success': True}), 201
```

#### SQL Injection Prevention

```python
# ✅ Good: Use SQLAlchemy ORM (prevents SQL injection)
user = User.query.filter_by(email=email).first()

# ❌ Bad: String concatenation (vulnerable)
query = f"SELECT * FROM users WHERE email = '{email}'"
```

#### Authentication & Authorization

```python
from flask_jwt_extended import jwt_required, get_jwt_identity

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'user': user.to_dict()
    })

# Role-based access control
from functools import wraps

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/admin/users', methods=['GET'])
@admin_required()
def admin_list_users():
    # Admin-only functionality
    pass
```

---

## 🚢 Deployment

### Environment Setup

#### Production Environment Variables

```env
# Production .env
NODE_ENV=production
VITE_API_URL=https://api.crazy-gary.com

# Database
DATABASE_URL=postgresql://user:pass@prod-db:5432/crazy_gary

# Redis
REDIS_URL=redis://prod-redis:6379

# Security
JWT_SECRET=your-super-secure-jwt-secret
SECRET_KEY=your-super-secure-secret-key

# External Services
HUGGINGFACE_API_TOKEN=your_hf_token
OPENAI_API_KEY=your_openai_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

### Railway Deployment

#### 1. Prepare for Deployment

```bash
# Build production version
npm run build:production

# Run tests
npm run test:coverage
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e

# Check bundle size
npm run check-bundle

<<<<<<< HEAD
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
=======
# Run security audit
npm audit --audit-level moderate
```

#### 2. Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Set environment variables
railway variables set NODE_ENV=production
railway variables set VITE_API_URL=https://your-app.railway.app

# Deploy
railway up
```

#### 3. Post-Deployment Verification

```bash
# Check deployment status
railway status

# View logs
railway logs

# Open application
railway open
```

### Docker Deployment

#### Dockerfile (Frontend)

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:production

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Dockerfile (Backend)

```dockerfile
# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "src.main:app"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: ./apps/web
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://api:8000
    depends_on:
      - api

  api:
    build: ./apps/api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/crazy_gary
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=crazy_gary
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e
```

---

<<<<<<< HEAD
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
=======
## 🛠️ Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# TypeScript errors
npm run type-check

# ESLint errors
npm run lint:fix

# Build errors
npm run clean && npm run build
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e
```

#### Development Server Issues

<<<<<<< HEAD
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
=======
```bash
# Port already in use
lsof -ti:5173 | xargs kill -9

# Clean restart
npm run clean
npm run dev
```

#### Database Connection Issues

```python
# Test database connection
from app import db
try:
    db.engine.execute('SELECT 1')
    print("Database connection successful")
except Exception as e:
    print(f"Database connection failed: {e}")
```

#### API Connection Issues

```bash
# Test API endpoint
curl -X GET http://localhost:8000/api/health

# Check CORS configuration
curl -X OPTIONS http://localhost:8000/api/users \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET"
```

### Getting Help

1. **Check Documentation**
   - API documentation: `/docs/api`
   - Component documentation: `/docs/components`
   - Architecture docs: `/docs/architecture`

2. **Run Diagnostics**
   ```bash
   npm run diagnostics
   ```

3. **Check Logs**
   ```bash
   # Frontend logs
   npm run logs:frontend
   
   # Backend logs
   npm run logs:backend
   ```

4. **Ask for Help**
   - Slack: #engineering-help
   - GitHub Issues: [Create Issue](https://github.com/GaryOcean428/crazy-gary/issues)
   - Team: engineering@company.com

---

## ❓ FAQ

### General Questions

**Q: What's the recommended IDE?**
A: VS Code with recommended extensions. See [IDE Configuration](#ide-configuration).

**Q: How do I add a new page?**
A: Create a component in `apps/web/src/pages/`, add route in `App.tsx`, and update navigation.

**Q: How do I add a new API endpoint?**
A: Create route handler in `apps/api/src/routes/`, add to main app, update API client.

### Development Questions

**Q: Why are my changes not showing?**
A: Check if development server is running, clear browser cache, verify build completed.

**Q: How do I test my changes?**
A: Run `npm run test` for unit tests, `npm run test:e2e` for integration tests.

**Q: How do I debug API issues?**
A: Use browser Network tab, check API logs, verify CORS configuration.

### Deployment Questions

**Q: How do I deploy my changes?**
A: Push to main branch, GitHub Actions will deploy to Railway automatically.

**Q: How do I rollback a deployment?**
A: Use Railway dashboard or `railway rollback` command.

**Q: How do I check deployment status?**
A: Run `railway status` or check GitHub Actions tab.

---

## 📚 Additional Resources

### Documentation
- [API Documentation](./API_DOCUMENTATION.md)
- [Component Library](./COMPONENTS.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Security Guide](./SECURITY.md)
- [Performance Guide](./PERFORMANCE.md)

### External Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Playwright](https://playwright.dev/)

### Tools
- [GitHub Repository](https://github.com/GaryOcean428/crazy-gary)
- [Railway Dashboard](https://railway.app/)
- [Sentry Error Tracking](https://sentry.io/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

**Welcome to the team! 🎉**

We're excited to have you on board. If you have any questions or need help, don't hesitate to reach out to the team. We're here to support you in becoming a productive and successful contributor to Crazy-Gary.

Happy coding! 🚀
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e

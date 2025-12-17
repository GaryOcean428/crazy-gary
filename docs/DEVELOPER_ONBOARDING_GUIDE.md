# 🚀 Crazy-Gary Developer Onboarding Guide

Welcome to the Crazy-Gary autonomous agentic AI system! This comprehensive guide will help you get up and running quickly as a productive developer on our team.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Development Environment Setup](#development-environment-setup)
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

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.10+ ([Download](https://python.org/))
- **Git** ([Download](https://git-scm.com/))
- **Docker** (optional, for containerized development)
- **Railway CLI** (optional, for deployment)

### 5-Minute Setup

```bash
# 1. Clone the repository
git clone https://github.com/GaryOcean428/crazy-gary.git
cd crazy-gary

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

---

## 🛠️ Development Environment Setup

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

```bash
cp .env.example .env
```

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
```

---

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
```

### Data Flow

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

We follow a comprehensive testing pyramid:

```
        /\       E2E Tests (Playwright)
       /  \      - User journeys
      / E2E\     - Cross-browser
     /______\    - Visual regression
    /        \   
   /  Unit   \  Unit Tests (Jest/Vitest)
  /  Tests   \ - Components
 /   + IT   \ - Functions
/___________\- Utilities
```

### Unit Testing

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
```

### Integration Testing

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
```

### End-to-End Testing

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
```

### Running Tests

```bash
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
```

---

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
```

---

## ⚡ Performance

### Frontend Performance

#### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npm run analyze

# Check bundle size limits
npm run check-bundle
```

#### Performance Monitoring

```typescript
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
```

### Backend Performance

#### Database Optimization

```python
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

# Check bundle size
npm run check-bundle

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
```

---

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
```

#### Development Server Issues

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

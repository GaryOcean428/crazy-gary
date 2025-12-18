# Comprehensive Contributor Handbook

## Welcome to the Crazy Gary Community! 🎉

This handbook is your complete guide to contributing to the Crazy Gary project. Whether you're making your first contribution or you're a seasoned contributor, this handbook will help you understand our processes, standards, and community culture.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Quick Start Guide](#quick-start-guide)
3. [Contribution Workflows](#contribution-workflows)
4. [Code Standards and Guidelines](#code-standards-and-guidelines)
5. [Testing and Quality Assurance](#testing-and-quality-assurance)
6. [Documentation Guidelines](#documentation-guidelines)
7. [Community Participation](#community-participation)
8. [Recognition and Progression](#recognition-and-progression)
9. [Troubleshooting and Support](#troubleshooting-and-support)
10. [Resources and References](#resources-and-references)

---

## Getting Started

### What is Crazy Gary?

Crazy Gary is a modern, full-stack web application built with React, TypeScript, Python, and FastAPI. We focus on:

- **User Experience**: Intuitive and accessible interfaces
- **Performance**: Fast, responsive applications
- **Quality**: High standards for code and testing
- **Community**: Welcoming and inclusive development environment
- **Innovation**: Cutting-edge technologies and best practices

### Why Contribute to Crazy Gary?

#### For Your Career
- **Skill Development**: Learn modern web development practices
- **Portfolio Building**: Showcase your contributions publicly
- **Networking**: Connect with other developers and companies
- **Recognition**: Earn badges, certifications, and community recognition
- **Mentorship**: Learn from experienced developers

#### For the Community
- **Open Source Impact**: Help build tools that benefit everyone
- **Knowledge Sharing**: Contribute to documentation and learning resources
- **Problem Solving**: Tackle real-world challenges
- **Innovation**: Be part of developing new features and improvements

#### For Personal Satisfaction
- **Learning**: Continuous learning and skill development
- **Giving Back**: Contribute to the open-source community
- **Collaboration**: Work with developers worldwide
- **Recognition**: Be appreciated for your contributions

### Community Values

Our community is built on these core values:

🤝 **Collaboration**: We work together to achieve common goals
🌟 **Excellence**: We strive for high quality in everything we do
🚀 **Innovation**: We embrace new ideas and technologies
💡 **Learning**: We support continuous learning and growth
🌍 **Inclusion**: We welcome contributors of all backgrounds
🎯 **Impact**: We focus on creating meaningful contributions

---

## Quick Start Guide

### Prerequisites

Before you start contributing, make sure you have:

- **Git**: Version control system
- **Node.js 18+**: JavaScript runtime and npm/pnpm
- **Python 3.9+**: Python runtime
- **Docker**: For database and services
- **Code Editor**: VS Code recommended
- **GitHub Account**: For version control and collaboration

### 5-Minute Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/your-username/crazy-gary.git
cd crazy-gary

# 2. Install dependencies
npm install

# 3. Set up development environment
cp .env.example .env
./scripts/setup-dev.sh

# 4. Start development servers
npm run dev

# 5. Open browser
# Visit http://localhost:3000
```

### Your First Contribution

Ready to make your first contribution? Here are some beginner-friendly options:

#### Option 1: Fix a Typo (2 minutes)
1. Find a typo in documentation or comments
2. Create a branch: `git checkout -b fix/typo-description`
3. Fix the typo
4. Submit PR with description: `fix(docs): correct typo in README`

#### Option 2: Add a Test (10 minutes)
1. Find a function without tests
2. Write a simple test case
3. Run tests to verify they pass
4. Submit PR: `test(api): add test for user validation`

#### Option 3: Improve Documentation (15 minutes)
1. Find unclear or missing documentation
2. Improve the explanation or add examples
3. Verify documentation renders correctly
4. Submit PR: `docs(api): add example for authentication`

#### Option 4: Fix a Bug (30 minutes)
1. Find a "good first issue" in GitHub
2. Reproduce the bug locally
3. Implement the fix
4. Add a test case
5. Submit PR: `fix(ui): resolve button alignment on mobile`

---

## Contribution Workflows

### Feature Development Workflow

#### 1. Planning Phase
```markdown
## Feature Planning Checklist

### Requirements Gathering
- [ ] User story clearly defined
- [ ] Acceptance criteria established
- [ ] Technical requirements documented
- [ ] Dependencies identified

### Design Review
- [ ] Architecture reviewed with team
- [ ] UI/UX design approved
- [ ] API design finalized
- [ ] Database schema approved (if needed)

### Technical Planning
- [ ] Implementation approach defined
- [ ] Testing strategy planned
- [ ] Documentation plan created
- [ ] Rollback strategy defined
```

#### 2. Development Phase
```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/user-dashboard-improvements

# Development workflow
npm run dev              # Start development servers
npm test -- --watch      # Run tests in watch mode
npm run lint             # Check code style
npm run typecheck        # Verify TypeScript types

# Commit frequently with clear messages
git add .
git commit -m "feat(ui): add user dashboard statistics widget"
git commit -m "feat(api): implement statistics endpoint"
git commit -m "test(ui): add tests for dashboard widget"
```

#### 3. Review Phase
```markdown
## Pre-Review Checklist

### Code Quality
- [ ] All tests pass locally
- [ ] Code follows style guidelines
- [ ] TypeScript compilation successful
- [ ] No console.log or debug statements
- [ ] Proper error handling implemented

### Testing
- [ ] Unit tests for new functionality
- [ ] Integration tests for API changes
- [ ] E2E tests for user workflows
- [ ] Test coverage maintained or improved

### Documentation
- [ ] Code comments for complex logic
- [ ] API documentation updated
- [ ] User-facing documentation updated
- [ ] Migration guide created (if breaking changes)
```

#### 4. Deployment Phase
```bash
# After PR approval and merge
git checkout develop
git pull origin develop

# Update your local branch
git branch -d feature/user-dashboard-improvements

# Next feature development
git checkout -b feature/next-feature
```

### Bug Fix Workflow

#### 1. Issue Triage
```markdown
## Bug Report Analysis

### Reproducibility
- [ ] Can reproduce the bug consistently?
- [ ] Bug occurs in multiple environments?
- [ ] Steps to reproduce are clear?

### Impact Assessment
- [ ] How many users affected?
- [ ] Severity level (Critical/High/Medium/Low)?
- [ ] Workaround available?

### Root Cause Analysis
- [ ] Understand why bug occurs?
- [ ] Identify where in code it happens?
- [ ] Determine fix approach?
```

#### 2. Fix Implementation
```bash
# Create bug fix branch
git checkout -b fix/memory-leak-user-service

# Quick fix with tests
# ... implement fix ...

# Verify fix works
npm test                    # Run relevant tests
npm run test:performance    # Check performance
npm run lint               # Verify code style

# Commit fix
git commit -m "fix(api): resolve memory leak in user service

Resolves issue where user service connections weren't properly
closed, causing memory leaks in production.

Closes #123"
```

### Documentation Workflow

#### 1. Documentation Planning
```markdown
## Documentation Strategy

### Audience Identification
- [ ] Target audience defined (users/developers/contributors)
- [ ] Knowledge level assessed (beginner/intermediate/advanced)
- [ ] Use cases documented

### Content Planning
- [ ] Outline structure and sections
- [ ] Identify required examples and screenshots
- [ ] Plan interactive elements if needed
- [ ] Consider multi-language support
```

#### 2. Writing Process
```markdown
## Documentation Writing Guidelines

### Structure
- Clear headings and navigation
- Logical flow from simple to complex
- Consistent terminology throughout

### Content
- Active voice and clear language
- Practical examples and code snippets
- Screenshots for UI documentation
- Links to related documentation

### Quality
- Technical accuracy verified
- Spelling and grammar checked
- Links tested and working
- Accessibility guidelines followed
```

---

## Code Standards and Guidelines

### Frontend Standards (React/TypeScript)

#### Component Structure
```typescript
// Good component structure
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children
}) => {
  const baseClasses = 'btn';
  const variantClasses = `btn--${variant}`;
  const sizeClasses = `btn--${size}`;
  const disabledClasses = disabled ? 'btn--disabled' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

#### State Management
```typescript
// Good state management with hooks
export const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchUserProfile()
      .then(setUser)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <UserNotFound />;
  
  return <UserProfileView user={user} />;
};
```

#### Error Handling
```typescript
// Comprehensive error handling
export const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const handleError = (error: Error) => {
      setHasError(true);
      setError(error);
      
      // Log to monitoring service
      logError(error, { context: 'ErrorBoundary' });
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <p>An error occurred while loading this component.</p>
        <button onClick={() => window.location.reload()}>
          Reload page
        </button>
        {process.env.NODE_ENV === 'development' && (
          <details>
            <summary>Error details</summary>
            <pre>{error?.stack}</pre>
          </details>
        )}
      </div>
    );
  }
  
  return <>{children}</>;
};
```

### Backend Standards (Python/FastAPI)

#### API Design
```python
# Good API design with FastAPI
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import List, Optional

router = APIRouter(prefix="/api/users", tags=["users"])

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    created_at: datetime

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> UserResponse:
    """Create a new user account."""
    # Validate unique email
    existing_user = await get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    user = await create_user_record(db, user_data, hashed_password)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        created_at=user.created_at
    )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> UserResponse:
    """Get user by ID (requires authentication)."""
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        created_at=user.created_at
    )
```

#### Error Handling
```python
# Comprehensive error handling
from fastapi import Request
import logging

logger = logging.getLogger(__name__)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with proper logging."""
    logger.warning(
        f"HTTP exception: {exc.status_code} - {exc.detail}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "status_code": exc.status_code,
            "detail": exc.detail
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "type": "http_error"
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    logger.error(
        f"Unexpected error: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "exception_type": type(exc).__name__,
            "traceback": traceback.format_exc()
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": 500,
                "message": "Internal server error",
                "type": "internal_error"
            }
        }
    )
```

#### Database Operations
```python
# Good database practices
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List, Optional

class UserRepository:
    def __init__(self, db: Session):
        self.db = db
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email with proper error handling."""
        try:
            stmt = select(User).where(User.email == email)
            result = await self.db.execute(stmt)
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            logger.error(f"Database error getting user by email: {e}")
            raise DatabaseError("Failed to retrieve user")
    
    async def create_user(self, user_data: dict) -> User:
        """Create user with transaction handling."""
        try:
            async with self.db.begin():
                user = User(**user_data)
                self.db.add(user)
                await self.db.flush()  # Get ID without committing
                return user
        except IntegrityError as e:
            logger.error(f"Integrity error creating user: {e}")
            raise ValidationError("User with this email already exists")
        except SQLAlchemyError as e:
            logger.error(f"Database error creating user: {e}")
            raise DatabaseError("Failed to create user")
    
    async def get_users_paginated(
        self, 
        limit: int = 20, 
        offset: int = 0
    ) -> tuple[List[User], int]:
        """Get users with pagination and count."""
        try:
            # Get total count
            count_stmt = select(func.count(User.id))
            total_result = await self.db.execute(count_stmt)
            total = total_result.scalar()
            
            # Get paginated results
            stmt = select(User).offset(offset).limit(limit)
            result = await self.db.execute(stmt)
            users = result.scalars().all()
            
            return users, total
        except SQLAlchemyError as e:
            logger.error(f"Database error getting users: {e}")
            raise DatabaseError("Failed to retrieve users")
```

---

## Testing and Quality Assurance

### Testing Pyramid

```
                    /\
                   /  \     E2E Tests (10%)
                  / E2E \   - Critical user journeys
                 /------\   - Real browser testing
                /        \
               /  Integration\  - Component interactions
              /  Tests (20%) \ - API integrations
             /--------------\
            /     Unit Tests \ - Individual functions
           /     (70%)       \ - Components & utilities
```

### Unit Testing

#### Frontend Testing
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserForm } from './UserForm';
import { UserService } from '../services/UserService';

jest.mock('../services/UserService');

describe('UserForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit form with valid data', async () => {
    const mockCreateUser = jest.fn();
    UserService.createUser = mockCreateUser.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      name: 'Test User'
    });

    render(<UserForm />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test User' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Verify submission
    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User'
      });
    });
    
    // Verify success message
    expect(screen.getByText(/user created successfully/i)).toBeInTheDocument();
  });

  it('should show validation errors for invalid data', () => {
    render(<UserForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    const mockCreateUser = jest.fn();
    UserService.createUser = mockCreateUser.mockRejectedValue(
      new Error('Network error')
    );

    render(<UserForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test User' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/failed to create user/i)).toBeInTheDocument();
    });
  });
});
```

#### Backend Testing
```python
# API testing with pytest
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from src.main import app
from src.models.user import User
from src.schemas.user import UserCreate

client = TestClient(app)

class TestUserAPI:
    @pytest.mark.asyncio
    async def test_create_user_success(self):
        user_data = {
            "email": "test@example.com",
            "name": "Test User",
            "password": "securepassword"
        }
        
        with patch('src.services.user_service.UserService.create_user') as mock_create:
            mock_create.return_value = User(
                id=1,
                email="test@example.com",
                name="Test User"
            )
            
            response = client.post("/api/users/", json=user_data)
            
            assert response.status_code == 201
            data = response.json()
            assert data["email"] == "test@example.com"
            assert data["name"] == "Test User"
            assert "password" not in data  # Password should not be returned
            mock_create.assert_called_once()
    
    def test_create_user_duplicate_email(self):
        user_data = {
            "email": "existing@example.com",
            "name": "Test User",
            "password": "securepassword"
        }
        
        with patch('src.services.user_service.UserService.create_user') as mock_create:
            mock_create.side_effect = ValueError("Email already exists")
            
            response = client.post("/api/users/", json=user_data)
            
            assert response.status_code == 409
            data = response.json()
            assert "Email already exists" in data["detail"]
    
    @pytest.mark.asyncio
    async def test_get_user_success(self):
        with patch('src.services.user_service.UserService.get_user_by_id') as mock_get:
            mock_get.return_value = User(
                id=1,
                email="test@example.com",
                name="Test User"
            )
            
            response = client.get("/api/users/1")
            
            assert response.status_code == 200
            data = response.json()
            assert data["email"] == "test@example.com"
            assert data["name"] == "Test User"
```

### Integration Testing

#### API Integration
```python
# Integration testing with test database
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.database import Base, get_db
from src.main import app
from src.models.user import User

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client():
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides = {}

class TestUserIntegration:
    def test_full_user_lifecycle(self, client, db):
        # Create user
        create_response = client.post("/api/users/", json={
            "email": "integration@test.com",
            "name": "Integration Test",
            "password": "testpassword"
        })
        assert create_response.status_code == 201
        user_id = create_response.json()["id"]
        
        # Get user
        get_response = client.get(f"/api/users/{user_id}")
        assert get_response.status_code == 200
        user_data = get_response.json()
        assert user_data["email"] == "integration@test.com"
        
        # Update user
        update_response = client.put(f"/api/users/{user_id}", json={
            "name": "Updated Integration Test"
        })
        assert update_response.status_code == 200
        assert update_response.json()["name"] == "Updated Integration Test"
        
        # Delete user
        delete_response = client.delete(f"/api/users/{user_id}")
        assert delete_response.status_code == 204
        
        # Verify deletion
        get_deleted_response = client.get(f"/api/users/{user_id}")
        assert get_deleted_response.status_code == 404
```

### End-to-End Testing

#### User Workflow Testing
```typescript
// E2E testing with Playwright
import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test('complete registration process', async ({ page }) => {
    // Navigate to registration
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[data-testid="email"]', 'e2e-test@example.com');
    await page.fill('[data-testid="name"]', 'E2E Test User');
    await page.fill('[data-testid="password"]', 'SecurePass123!');
    await page.fill('[data-testid="confirm-password"]', 'SecurePass123!');
    
    // Accept terms
    await page.check('[data-testid="accept-terms"]');
    
    // Submit form
    await page.click('[data-testid="register-button"]');
    
    // Verify success
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]'))
      .toContainText('Welcome, E2E Test User');
    
    // Verify user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Verify logout
    await expect(page).toHaveURL('/login');
  });

  test('registration validation', async ({ page }) => {
    await page.goto('/register');
    
    // Try to submit empty form
    await page.click('[data-testid="register-button"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="email-error"]'))
      .toContainText('Email is required');
    await expect(page.locator('[data-testid="name-error"]'))
      .toContainText('Name is required');
    await expect(page.locator('[data-testid="password-error"]'))
      .toContainText('Password is required');
    
    // Test email validation
    await page.fill('[data-testid="email"]', 'invalid-email');
    await page.blur('[data-testid="email"]');
    
    await expect(page.locator('[data-testid="email-error"]'))
      .toContainText('Please enter a valid email');
    
    // Test password validation
    await page.fill('[data-testid="password"]', 'weak');
    await page.blur('[data-testid="password"]');
    
    await expect(page.locator('[data-testid="password-error"]'))
      .toContainText('Password must be at least 8 characters');
  });
});
```

### Test Coverage and Quality

#### Coverage Requirements
```bash
# Run tests with coverage
npm run test:coverage

# Coverage thresholds
# Frontend: 80% minimum for new code
# Backend: 85% minimum for new code
# Integration: All critical paths covered
# E2E: All user workflows covered
```

#### Test Quality Checklist
```markdown
## Test Quality Guidelines

### Naming
- [ ] Test names describe the behavior being tested
- [ ] Use descriptive test descriptions
- [ ] Group related tests in describe blocks

### Structure
- [ ] Follow AAA pattern (Arrange, Act, Assert)
- [ ] Keep tests small and focused
- [ ] Use appropriate test doubles (mocks, stubs, spies)

### Coverage
- [ ] Test happy path scenarios
- [ ] Test error and edge cases
- [ ] Test boundary conditions
- [ ] Test error handling

### Maintainability
- [ ] Tests are independent and can run in any order
- [ ] Use meaningful test data
- [ ] Avoid test implementation details
- [ ] Keep tests simple and readable
```

---

## Documentation Guidelines

### Documentation Types

#### API Documentation
```typescript
/**
 * Creates a new user account
 * 
 * This endpoint allows you to create a new user account with email and password.
 * The password will be automatically hashed before storage.
 * 
 * @param userData - User registration information
 * @param userData.email - User's email address (must be unique)
 * @param userData.name - User's full name
 * @param userData.password - User's password (minimum 8 characters)
 * @param options - Optional settings
 * @param options.sendWelcomeEmail - Send welcome email (default: true)
 * @param options.verifyEmail - Require email verification (default: true)
 * 
 * @returns Promise that resolves to the created user object
 * 
 * @throws {ValidationError} When user data is invalid
 * @throws {DuplicateEmailError} When email already exists
 * @throws {DatabaseError} When database operation fails
 * 
 * @example
 * ```typescript
 * const user = await createUser({
 *   email: 'john@example.com',
 *   name: 'John Doe',
 *   password: 'securepassword123'
 * }, {
 *   sendWelcomeEmail: true,
 *   verifyEmail: false
 * });
 * 
 * console.log(`User created: ${user.id}`);
 * ```
 * 
 * @example
 * ```bash
 * curl -X POST "https://api.crazygary.com/api/users" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "email": "john@example.com",
 *     "name": "John Doe",
 *     "password": "securepassword123"
 *   }'
 * ```
 */
export async function createUser(
  userData: UserData,
  options: CreateUserOptions = {}
): Promise<User> {
  // Implementation
}
```

#### User Documentation
```markdown
# User Registration Guide

This guide walks you through creating a new account on Crazy Gary.

## Prerequisites

Before you begin, ensure you have:
- A valid email address
- A secure password (minimum 8 characters)
- Access to your email for verification

## Step-by-Step Registration

### 1. Navigate to Registration
1. Go to the Crazy Gary homepage
2. Click the "Sign Up" button in the top-right corner
3. You'll be redirected to the registration page

### 2. Fill Registration Form
Complete all required fields:

**Email Address**
- Use a valid email address you have access to
- This will be your login username
- We'll send a verification email to this address

**Full Name**
- Enter your real name or preferred display name
- This will be visible to other users
- You can change this later in your profile settings

**Password**
- Choose a strong password (minimum 8 characters)
- Include at least one number and one special character
- Avoid using passwords from other websites

**Confirm Password**
- Re-enter your password exactly as typed above
- This helps prevent typos

### 3. Accept Terms
- Read our Terms of Service and Privacy Policy
- Check the "I agree to the Terms of Service" checkbox
- You must agree to continue

### 4. Submit Registration
1. Click the "Create Account" button
2. You'll see a success message
3. Check your email for a verification link

### 5. Verify Your Email
1. Check your email inbox (and spam folder)
2. Look for an email from "Crazy Gary Team"
3. Click the verification link in the email
4. You'll be redirected to the dashboard

## Troubleshooting

### Email Not Received
- Check your spam/junk folder
- Wait up to 5 minutes for delivery
- Try registering again with the same email
- Contact support if problems persist

### Verification Link Not Working
- Make sure you clicked the complete link
- Try copying and pasting the URL
- Verification links expire after 24 hours
- Request a new verification email

### Password Requirements
- Minimum 8 characters
- At least one number (0-9)
- At least one special character (!@#$%^&*)
- Cannot contain your email address

## Next Steps

After successful registration:
1. [Complete your profile](./profile-setup.md)
2. [Explore the dashboard](./dashboard-guide.md)
3. [Learn about key features](./features-overview.md)

## Getting Help

If you encounter issues:
- Check our [FAQ](./faq.md)
- Search [existing issues](https://github.com/owner/repo/issues)
- [Contact support](./contact-support.md)
```

#### Developer Documentation
```markdown
# Development Setup Guide

This guide helps you set up a local development environment for Crazy Gary.

## Prerequisites

- Node.js 18 or higher
- Python 3.9 or higher
- PostgreSQL 13 or higher
- Redis 6 or higher
- Docker and Docker Compose
- Git

## Quick Setup

### 1. Clone Repository
```bash
git clone https://github.com/owner/crazy-gary.git
cd crazy-gary
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
cd apps/api
pip install -r requirements.txt
cd ../..
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
# DATABASE_URL=postgresql://user:password@localhost:5432/crazygary_dev
# REDIS_URL=redis://localhost:6379/0
# JWT_SECRET=your-secret-key
```

### 4. Database Setup
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Create database
createdb crazygary_dev

# Run migrations
cd apps/api
alembic upgrade head
cd ../..
```

### 5. Start Development Servers
```bash
# Start all services
npm run dev

# Or start individually
npm run dev:frontend    # React dev server on :3000
npm run dev:backend     # FastAPI dev server on :8000
npm run dev:docs        # Documentation site on :4000
```

## Development Workflow

### Making Changes
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm test`
4. Commit with clear messages: `git commit -m "feat: add new feature"`
5. Push and create PR: `git push origin feature/your-feature`

### Code Quality
- **Linting**: Run `npm run lint` to check code style
- **Type Checking**: Run `npm run typecheck` for TypeScript
- **Testing**: Run `npm test` for unit tests
- **E2E Tests**: Run `npm run test:e2e` for end-to-end tests

### Debugging
- **Frontend**: Use React DevTools and browser console
- **Backend**: Use Python debugger or logging
- **Database**: Use PostgreSQL client or admin tools
- **API**: Use Swagger UI at `/docs`

## Common Issues

### Port Already in Use
```bash
# Kill process using port
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Database Connection Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d
createdb crazygary_dev
alembic upgrade head
```

### Dependency Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# For Python
pip install --upgrade -r requirements.txt
```

## Project Structure

```
crazy-gary/
├── apps/
│   ├── frontend/          # React frontend
│   ├── api/              # FastAPI backend
│   └── docs/             # Documentation site
├── packages/             # Shared packages
├── scripts/             # Build and deployment scripts
└── tests/               # Test suites
```

## Next Steps

- Read our [contribution guidelines](./CONTRIBUTION_GUIDELINES.md)
- Check out [good first issues](https://github.com/owner/repo/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
- Join our [Discord community](https://discord.gg/crazygary)
```

### Documentation Standards

#### Writing Style Guide
```markdown
## Writing Style Guidelines

### Voice and Tone
- **Use active voice**: "Click the button" not "The button should be clicked"
- **Be conversational but professional**: Write as if explaining to a colleague
- **Use second person**: "You can..." instead of "Users can..."
- **Be positive**: "Here's how to..." instead of "Here's why this doesn't work..."

### Structure
- **Start with summary**: Brief overview of what the section covers
- **Use clear headings**: Hierarchical structure with descriptive titles
- **Break up content**: Use lists, code blocks, and examples
- **End with next steps**: Tell readers what to do next

### Code Examples
- **Always test examples**: Ensure code examples actually work
- **Include comments**: Explain what's happening in the code
- **Show output**: Include expected results when relevant
- **Use realistic data**: Don't use obvious fake data

### Accessibility
- **Descriptive link text**: "Read the API documentation" not "Click here"
- **Alt text for images**: Describe what's shown in screenshots
- **High contrast**: Ensure text is readable
- **Semantic HTML**: Use proper heading hierarchy
```

---

## Community Participation

### Communication Channels

#### GitHub Issues
- **Bug Reports**: Report problems with the software
- **Feature Requests**: Suggest new functionality
- **Questions**: Ask for help or clarification
- **Discussions**: General community discussions

#### Discord Server
- **Real-time Chat**: Quick questions and discussions
- **Voice Channels**: Video calls and pair programming
- **Community Events**: Regular meetups and discussions
- **Direct Support**: Private help from community members

#### GitHub Discussions
- **General**: Community-wide announcements and discussions
- **Show and Tell**: Share projects using Crazy Gary
- **Q&A**: Ask questions and get help from the community
- **Ideas**: Brainstorm new features and improvements

### Community Guidelines

#### Be Respectful
- Treat all community members with respect
- Disagree with ideas, not people
- Provide constructive feedback
- Welcome newcomers and help them get started

#### Be Helpful
- Answer questions when you can
- Share your knowledge and experience
- Guide newcomers to resources
- Point others to relevant documentation

#### Be Constructive
- Focus on solutions, not problems
- Provide specific, actionable feedback
- Offer alternatives when suggesting changes
- Acknowledge good work and contributions

#### Be Patient
- Remember that everyone was a beginner once
- Explain concepts clearly and simply
- Help troubleshoot step by step
- Don't expect immediate expertise

### Getting Help

#### Before Asking for Help
1. **Check Documentation**: Look for relevant guides
2. **Search Existing Issues**: See if your question was answered
3. **Try to Reproduce**: Gather information about the problem
4. **Collect Details**: Note error messages, steps to reproduce, environment

#### How to Ask Good Questions
```markdown
## Good Question Format

### Problem Description
Clear description of what you're trying to achieve and what's not working.

### Environment
- OS: [e.g., macOS 12.0, Windows 10, Ubuntu 20.04]
- Browser: [e.g., Chrome 95.0, Firefox 93.0]
- Version: [e.g., v1.2.3]
- Other relevant details

### Steps to Reproduce
1. Step one
2. Step two
3. Step three

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Error Messages
Paste any error messages or console output

### What You've Tried
List any troubleshooting steps you've already attempted
```

#### Where to Ask
- **Quick Questions**: Discord #help channel
- **Technical Issues**: GitHub Issues with bug report template
- **Feature Requests**: GitHub Issues with feature request template
- **General Discussion**: GitHub Discussions
- **Private Matters**: Email maintainers directly

### Mentoring and Being Mentored

#### For Mentors
- **Be Patient**: Remember your own learning journey
- **Ask Questions**: Help mentees think through problems
- **Share Resources**: Point to relevant documentation and tutorials
- **Encourage Independence**: Guide them to find answers themselves
- **Celebrate Success**: Acknowledge progress and achievements

#### For Mentees
- **Be Proactive**: Come prepared with specific questions
- **Try First**: Attempt to solve problems before asking
- **Take Notes**: Write down solutions for future reference
- **Ask Follow-ups**: Clarify anything you don't understand
- **Give Back**: Help others once you're more experienced

---

## Recognition and Progression

### Contribution Levels

#### Bronze Contributor (10+ contributions)
- Basic understanding of project structure
- Can follow established patterns
- Makes quality contributions
- Participates positively in community

#### Silver Contributor (50+ contributions)
- Leads development of features
- Reviews code constructively
- Mentors newer contributors
- Understands project architecture

#### Gold Contributor (100+ contributions)
- Makes significant architectural contributions
- Leads major initiatives
- Strong technical and leadership skills
- Influences project direction

#### Platinum Contributor (200+ contributions)
- Exceptional impact on project
- Technical leadership and vision
- Community building and advocacy
- Strategic thinking and execution

### Certification Process

#### Application Requirements
- Meet minimum contribution thresholds
- Demonstrate quality and consistency
- Show positive community engagement
- Provide portfolio of best work

#### Evaluation Process
1. **Self-Assessment**: Complete online assessment
2. **Portfolio Review**: Submit best contributions
3. **Peer Evaluation**: Community member feedback
4. **Technical Interview**: 30-60 minute discussion
5. **Final Decision**: Maintainer approval

#### Benefits of Certification
- Public recognition and badges
- Enhanced profile and credibility
- Leadership and mentorship opportunities
- Conference speaking opportunities
- Career advancement benefits

### Recognition Programs

#### Monthly Recognition
- **Feature of the Month**: Best new feature
- **Bug Hunter of the Month**: Most impactful bug fixes
- **Documentation Star**: Best documentation contributions
- **Community Helper**: Most helpful community support
- **Rising Star**: Outstanding new contributor

#### Annual Awards
- **Contributor of the Year**: Overall top contributor
- **Innovation Award**: Most creative solution
- **Community Champion**: Best community building
- **Technical Excellence**: Outstanding technical work
- **Mentor of the Year**: Best mentoring contributions

---

## Troubleshooting and Support

### Common Development Issues

#### Environment Setup Problems
```bash
# Node.js version issues
nvm install 18
nvm use 18

# Dependency installation fails
rm -rf node_modules package-lock.json
npm install

# Python environment issues
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Database connection issues
docker-compose down -v
docker-compose up -d
createdb crazygary_dev
```

#### Development Server Issues
```bash
# Port already in use
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9

# Build errors
npm run clean
npm install
npm run build

# TypeScript errors
npm run typecheck -- --noEmit
```

#### Testing Issues
```bash
# Tests not running
npm test -- --verbose

# Test coverage issues
npm run test:coverage -- --coverage

# E2E test failures
npm run test:e2e -- --headed

# Flaky tests
npm run test:retry -- --retries=3
```

### Getting Help

#### Self-Help Resources
1. **Documentation**: Check relevant guides first
2. **FAQ**: Common questions and answers
3. **Troubleshooting Guides**: Step-by-step solutions
4. **Search**: Use GitHub search and Discord history

#### Community Support
1. **Discord**: Real-time help in #help channel
2. **GitHub Issues**: Detailed technical support
3. **Discussions**: Community Q&A
4. **Office Hours**: Weekly live help sessions

#### Professional Support
1. **Email**: support@crazygary.com for urgent issues
2. **Private Messages**: Contact maintainers directly
3. **Emergency Contact**: For security or critical issues

---

## Resources and References

### Essential Links

#### Project Resources
- **Repository**: https://github.com/owner/crazy-gary
- **Documentation**: https://docs.crazygary.com
- **Website**: https://crazygary.com
- **Demo**: https://demo.crazygary.com

#### Community Channels
- **Discord**: https://discord.gg/crazygary
- **GitHub Discussions**: https://github.com/owner/crazy-gary/discussions
- **Twitter**: https://twitter.com/crazygaryproject
- **LinkedIn**: https://linkedin.com/company/crazygary

#### Support Resources
- **FAQ**: https://docs.crazygary.com/faq
- **Troubleshooting**: https://docs.crazygary.com/troubleshooting
- **Contact Support**: https://docs.crazygary.com/contact
- **Security**: security@crazygary.com

### Learning Resources

#### Frontend Development
- **React Documentation**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Testing Library**: https://testing-library.com

#### Backend Development
- **FastAPI Tutorial**: https://fastapi.tiangolo.com/tutorial
- **Python Best Practices**: https://docs.python-guide.org
- **SQLAlchemy**: https://docs.sqlalchemy.org
- **Pytest Guide**: https://docs.pytest.org

#### DevOps and Tools
- **Docker Documentation**: https://docs.docker.com
- **Git Documentation**: https://git-scm.com/docs
- **GitHub Actions**: https://docs.github.com/actions
- **PostgreSQL Tutorial**: https://www.postgresql.org/docs

### Tools and Extensions

#### Recommended VS Code Extensions
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Thunder Client**: API testing
- **GitLens**: Git enhancements
- **Error Lens**: Inline error display

#### Development Tools
- **Postman**: API testing and documentation
- **TablePlus**: Database management
- **Docker Desktop**: Container management
- **GitHub Desktop**: Git GUI client
- **Sourcetree**: Visual Git client

### Project Governance

#### Decision Making
- **Maintainers**: Make final technical decisions
- **Contributors**: Propose and discuss changes
- **Community**: Provide feedback and input
- **Users**: Influence feature priorities

#### Communication
- **RFC Process**: Request for Comments for major changes
- **Community Calls**: Monthly open discussions
- **Working Groups**: Specialized topic discussions
- **Anonymous Feedback**: Input without identification

---

## Welcome to the Community!

We're thrilled to have you join the Crazy Gary community! Whether you're fixing your first bug, writing your first test, or proposing a major feature, every contribution makes a difference.

### Quick Reference

#### First Steps
1. Read this handbook completely
2. Set up your development environment
3. Find a "good first issue" to work on
4. Join our Discord community
5. Introduce yourself in the #introductions channel

#### Getting Help
- **Quick questions**: Discord #help channel
- **Technical issues**: GitHub Issues
- **General discussion**: GitHub Discussions
- **Urgent matters**: Email maintainers

#### Staying Updated
- Watch the repository for updates
- Join our Discord server
- Follow our social media channels
- Attend monthly community calls

### Our Commitment to You

We're committed to providing:
- **Welcoming Environment**: Everyone is welcome to contribute
- **Clear Guidance**: Comprehensive documentation and support
- **Fair Recognition**: Your contributions will be acknowledged
- **Growth Opportunities**: Paths for advancement and leadership
- **Respectful Interaction**: Professional and inclusive community

### Your Commitment to the Community

We ask that you:
- **Be Respectful**: Treat all community members with respect
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Patient**: Help newcomers learn and grow
- **Be Inclusive**: Welcome and support diverse contributors
- **Be Professional**: Maintain high standards of conduct

## Thank You!

Thank you for choosing to contribute to Crazy Gary. Your time, skills, and enthusiasm help make this project better for everyone. We're excited to see what you'll build and how you'll help grow our community.

**Happy coding! 🚀**

---

*This handbook is a living document. If you have suggestions for improvements or notice something that's outdated, please let us know through GitHub Issues or Discord. Your feedback helps make this resource better for everyone.*
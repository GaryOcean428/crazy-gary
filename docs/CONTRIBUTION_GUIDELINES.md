# 🤝 Crazy-Gary Contribution Guidelines

Thank you for your interest in contributing to Crazy-Gary! This guide will help you understand our contribution process, standards, and expectations.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Types of Contributions](#types-of-contributions)
3. [Development Setup](#development-setup)
4. [Contribution Process](#contribution-process)
5. [Code Standards](#code-standards)
6. [Testing Requirements](#testing-requirements)
7. [Documentation](#documentation)
8. [Review Process](#review-process)
9. [Community Guidelines](#community-guidelines)
10. [Recognition](#recognition)

---

## 🚀 Getting Started

### Before You Begin

1. **Read the Code of Conduct**: We expect all contributors to follow our [Code of Conduct](./CODE_OF_CONDUCT.md)

2. **Understand the Project**: Review our [README.md](../README.md) and [Architecture Guide](./ARCHITECTURE.md)

3. **Join the Community**: 
   - GitHub Discussions for questions
   - GitHub Issues for bug reports
   - Slack: #crazy-gary-dev for real-time help

### Ways to Contribute

- 🐛 **Bug Fixes**: Fix issues in the codebase
- ✨ **Features**: Add new functionality
- 📚 **Documentation**: Improve docs, examples, guides
- 🎨 **UI/UX**: Design improvements, accessibility fixes
- 🧪 **Tests**: Add or improve test coverage
- 🔧 **Tools**: Development tools, scripts, utilities
- 💬 **Community**: Help other users, triage issues

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- Git
- VS Code (recommended)

### Quick Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/crazy-gary.git
cd crazy-gary

# 2. Add upstream remote
git remote add upstream https://github.com/GaryOcean428/crazy-gary.git

# 3. Install dependencies
npm install
cd apps/web && npm install
cd ../../apps/api && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# 4. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 5. Install pre-commit hooks
npm run hooks:install:enhanced

# 6. Verify setup
npm run setup:verify
```

### Development Workflow

```bash
# 1. Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes
# ... code, test, iterate ...

# 4. Run quality checks
npm run quality:pre-commit

# 5. Commit your changes
git add .
git commit -m "feat: add your feature description"

# 6. Push to your fork
git push origin feature/your-feature-name

# 7. Create Pull Request
# Use GitHub UI to create PR from your fork
```

---

## 🔄 Contribution Process

### 1. Choose Your Contribution

#### For Bug Fixes
- Check existing issues first
- Create new issue if needed
- Ask for assignment if you want to work on it

#### For Features
- Discuss in GitHub Discussions first
- Create feature request issue
- Wait for team feedback before implementing

#### For Documentation
- Browse our [documentation](../docs/)
- Look for areas that need improvement
- Check documentation issues labeled `good-first-issue`

### 2. Planning Your Changes

Before coding, consider:

- **Scope**: Keep changes focused and manageable
- **Dependencies**: Are there related changes needed?
- **Testing**: How will you test your changes?
- **Documentation**: What docs need updating?

### 3. Implementation

Follow our [Development Guide](./DEVELOPER_ONBOARDING_GUIDE.md) for detailed implementation guidelines.

### 4. Testing Your Changes

```bash
# Run all tests
npm run test

# Run specific test types
npm run test:unit
npm run test:e2e
npm run test:coverage

# Run accessibility tests
npm run test:a11y

# Run performance tests
npm run test:performance
```

### 5. Creating the Pull Request

#### PR Template

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
- [ ] Performance impact assessed

## Screenshots/Videos
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

#### PR Title

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat: add new task management feature`
- `fix: resolve login redirect issue`
- `docs: update API documentation`
- `test: add unit tests for UserProfile`
- `refactor: simplify authentication logic`
- `chore: update dependencies`

---

## 📝 Code Standards

### TypeScript/JavaScript

#### Code Style

```typescript
// ✅ Good: Clear naming and proper typing
interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
}

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

// ✅ Good: Error handling
const fetchUserData = async (userId: string): Promise<UserData> => {
  try {
    const response = await apiClient.get(`/users/${userId}`)
    return userDataSchema.parse(response.data)
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      throw new NotFoundError(`User ${userId} not found`)
    }
    throw new ApiError('Failed to fetch user data')
  }
}
```

#### Component Structure

```typescript
// ✅ Good: Well-structured component
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

### Python Standards

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
            'error': 'Invalid user ID format'
        }), 400
        
    except DatabaseError as e:
        logger.error(f"Database error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500
```

### File Organization

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── contexts/            # React contexts
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

---

## 🧪 Testing Requirements

### Test Coverage Goals

- **Line Coverage**: ≥ 80%
- **Branch Coverage**: ≥ 75%
- **Function Coverage**: ≥ 80%

### Writing Tests

#### Unit Tests

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

#### API Tests

```python
# ✅ Good: API endpoint test
import pytest

@pytest.fixture
def app():
    app = create_app('testing')
    app.config['TESTING'] = True
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_get_user_success(client):
    """Test successful user retrieval"""
    response = client.get('/api/users/123')
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert 'user' in data
    assert data['user']['id'] == '123'
```

### Running Tests

```bash
# All tests
npm run test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Accessibility tests
npm run test:a11y

# Performance tests
npm run test:performance
```

---

## 📚 Documentation

### What to Document

#### Code Documentation

```typescript
// ✅ Good: Document complex logic
/**
 * Calculates the optimal workout plan based on user preferences and history.
 * 
 * @param userPreferences - User's workout preferences and goals
 * @param workoutHistory - Historical workout data for the user
 * @param availableEquipment - Equipment available to the user
 * @returns Optimized workout plan or null if calculation fails
 * 
 * @throws {ValidationError} If userPreferences contain invalid data
 * @throws {InsufficientDataError} If workoutHistory is too sparse
 */
export const calculateOptimalWorkout = (
  userPreferences: UserPreferences,
  workoutHistory: WorkoutHistory[],
  availableEquipment: Equipment[]
): WorkoutPlan | null => {
  // Implementation
}
```

#### API Documentation

```python
# ✅ Good: Document API endpoints
@user_bp.route('/users/<user_id>/workouts', methods=['POST'])
def create_workout(user_id: str):
    """
    Create a new workout for the specified user.
    
    Args:
        user_id: The unique identifier of the user
        
    Request Body:
        {
            "type": "strength",
            "exercises": [
                {
                    "name": "bench_press",
                    "sets": 3,
                    "reps": 10,
                    "weight": 135
                }
            ],
            "notes": "Feeling strong today!"
        }
        
    Returns:
        201: Workout created successfully
        {
            "success": True,
            "workout": {
                "id": "uuid",
                "user_id": "user_id",
                "type": "strength",
                "created_at": "2023-01-01T00:00:00Z"
            }
        }
        
    Raises:
        400: Invalid workout data
        404: User not found
        500: Database error
    """
    pass
```

### Documentation Types

1. **Code Documentation**: Inline comments, JSDoc, docstrings
2. **API Documentation**: OpenAPI/Swagger specs
3. **User Documentation**: Guides, tutorials, FAQs
4. **Developer Documentation**: Architecture, setup, deployment

---

## 👥 Review Process

### For Authors

#### Before Requesting Review

1. **Self-review checklist**
   - [ ] Code follows style guidelines
   - [ ] All tests pass
   - [ ] Test coverage meets requirements
   - [ ] Documentation updated
   - [ ] No console.logs or debug code
   - [ ] Performance impact assessed
   - [ ] Accessibility considered
   - [ ] Security implications reviewed

2. **PR Description**
   - Clear explanation of changes
   - Screenshots/videos for UI changes
   - Breaking changes documented
   - Testing instructions

#### During Review

- Respond to all comments
- Make requested changes
- Re-request review when ready
- Be patient and professional

### For Reviewers

#### Review Checklist

- [ ] **Code Quality**: Style, readability, maintainability
- [ ] **Functionality**: Does it solve the stated problem?
- [ ] **Tests**: Adequate test coverage and quality
- [ ] **Security**: No security vulnerabilities
- [ ] **Performance**: No obvious performance issues
- [ ] **Accessibility**: UI changes are accessible
- [ ] **Documentation**: Code and docs are clear

#### Feedback Types

- 🔴 **Blocking**: Must be fixed before merge
- 🟡 **Important**: Should be addressed but not blocking
- 🟢 **Suggestion**: Nice to have improvements

#### Review Guidelines

1. **Be constructive**: Provide specific, actionable feedback
2. **Be respectful**: Focus on code, not the person
3. **Be thorough**: Check all aspects of the change
4. **Be timely**: Review within 24 hours when possible

---

## 🌟 Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Our Code of Conduct applies to all community spaces.

### Communication

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome people of all backgrounds and experience levels
- **Be constructive**: Provide helpful, specific feedback
- **Be patient**: Help newcomers learn and grow

### Issue Guidelines

#### Bug Reports

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 96.0]
- Version: [e.g. 1.2.3]
```

#### Feature Requests

```markdown
## Problem Statement
What problem does this solve?

## Proposed Solution
How should this work?

## Alternative Solutions
Any alternative approaches considered?

## Additional Context
Any other relevant information
```

### Triage Process

Issues are triaged based on:
- **Priority**: Critical, High, Medium, Low
- **Effort**: Small, Medium, Large
- **Impact**: How many users affected

---

## 🏆 Recognition

### Contributor Levels

#### 🌟 New Contributor
- First merged PR
- Welcome to the team!

#### 🌟🌟 Regular Contributor
- 5+ merged PRs
- Consistent quality contributions

#### 🌟🌟🌟 Experienced Contributor
- 15+ merged PRs
- Mentors new contributors
- Participates in design discussions

#### 🌟🌟🌟🌟 Core Contributor
- 30+ merged PRs
- Has merge permissions
- Helps maintain project health

#### 🌟🌟🌟🌟🌟 Maintainer
- Project leadership role
- Sets technical direction
- Manages releases

### Recognition Methods

1. **GitHub Contributors**: Listed in README
2. **Release Notes**: Acknowledged in changelogs
3. **Annual Report**: Featured in yearly review
4. **Swag**: Special t-shirts for top contributors
5. **Speaking Opportunities**: Conference talk nominations

### Hall of Fame

Outstanding contributions are recognized in our Hall of Fame:

- **Bug Hunter**: Most effective bug reports
- **Documentation Champion**: Best documentation improvements
- **Test Master**: Highest test coverage contributions
- **Performance Optimizer**: Best performance improvements
- **Accessibility Advocate**: Best accessibility contributions

---

## 🎯 Getting Help

### Before Asking

1. Check existing documentation
2. Search existing issues
3. Check GitHub Discussions
4. Try to reproduce the issue

### Where to Ask

1. **GitHub Discussions**: General questions, feature discussions
2. **GitHub Issues**: Bug reports, specific problems
3. **Slack**: Real-time help (#crazy-gary-dev)
4. **Email**: security@company.com (security issues only)

### How to Ask Good Questions

```markdown
## Context
What are you trying to accomplish?

## What You've Tried
What have you already attempted?

## What You Expected
What did you expect to happen?

## What Actually Happened
What actually happened?

## Additional Info
Environment, screenshots, error messages, etc.
```

---

## 📖 Additional Resources

### Learning Materials

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Testing Library](https://testing-library.com/docs/)
- [Python Testing](https://docs.python.org/3/library/unittest.html)

### Tools

- [VS Code Extensions](../.vscode/extensions.json)
- [Pre-commit Hooks](./PRE_COMMIT_HOOKS.md)
- [GitHub CLI](https://cli.github.com/)

### External Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)

---

**Thank you for contributing to Crazy-Gary! 🚀**

Your contributions help make this project better for everyone. We're excited to see what you'll build!

If you have any questions about contributing, please don't hesitate to reach out to the team.

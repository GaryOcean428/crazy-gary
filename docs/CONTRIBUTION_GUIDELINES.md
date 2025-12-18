<<<<<<< HEAD
# Contribution Guidelines

Welcome to the Crazy Gary project! This document provides comprehensive guidelines for all types of contributions to our open-source project.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Code Contribution Process](#code-contribution-process)
3. [Commit Message Conventions](#commit-message-conventions)
4. [Pull Request Process](#pull-request-process)
5. [Code Review Guidelines](#code-review-guidelines)
6. [Testing Requirements](#testing-requirements)
7. [Documentation Contributions](#documentation-contributions)
8. [Issue Reporting](#issue-reporting)
9. [Community Guidelines](#community-guidelines)
10. [Release Process](#release-process)
11. [Developer Progression](#developer-progression)
12. [Recognition System](#recognition-system)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Python 3.9+
- Git
- Docker (for local development)
- Railway CLI (for deployment)

### Development Environment Setup

```bash
# Clone the repository
git clone https://github.com/your-org/crazy-gary.git
cd crazy-gary

# Install root dependencies
npm install

# Set up pre-commit hooks
./scripts/install-hooks.sh

# Initialize development environment
./scripts/setup-dev.sh
```

### Project Structure Overview

```
crazy-gary/
├── apps/
│   ├── api/          # Python FastAPI backend
│   ├── web/          # React frontend
│   └── frontend/     # Shared frontend components
├── packages/         # Shared packages
├── docs/            # Documentation
├── scripts/         # Automation scripts
└── tests/           # Test suites
```

## Code Contribution Process

### Branch Strategy

We use a modified Git Flow approach:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual feature branches
- `hotfix/*` - Emergency fixes for production
- `release/*` - Release preparation branches

### Contribution Workflow

1. **Create a feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow coding standards (see [code-quality.md](code-quality.md))
   - Write tests for new functionality
   - Update documentation as needed

3. **Commit your changes**
   - Use conventional commit messages (see below)
   - Ensure all tests pass
   - Run quality checks

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Standards

#### Frontend (TypeScript/React)
- Use TypeScript strictly with strict mode enabled
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling
- Implement proper error boundaries
- Follow accessibility guidelines (WCAG 2.1 AA)

#### Backend (Python)
- Follow PEP 8 style guidelines
- Use type hints for all functions
- Implement proper error handling
- Use async/await for I/O operations
- Follow REST API conventions

#### General
- Write self-documenting code with clear naming
- Add comments for complex logic only
- Keep functions focused and small
- Use meaningful variable and function names

## Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect meaning (formatting, missing semi colons, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### Examples

```bash
feat(auth): add OAuth2 authentication support

Implement OAuth2 flow for third-party authentication providers
including Google, GitHub, and Microsoft integration.

Closes #123

fix(api): resolve memory leak in data processing

The batch processing function was not properly closing database
connections, causing memory leaks in production.

BREAKING CHANGE: The process_batch function signature has changed
```

## Pull Request Process

### PR Requirements

1. **Descriptive Title**: Use conventional commit format
2. **Detailed Description**: Explain what, why, and how
3. **Link to Issues**: Reference any related issues
4. **Screenshots/Demos**: For UI changes or new features
5. **Testing**: All tests must pass
6. **Code Coverage**: Maintain or improve coverage
7. **Documentation**: Update docs for new features

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed
=======
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
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
<<<<<<< HEAD
- [ ] No breaking changes (or properly documented)
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs
2. **Reviewer Assignment**: Based on code ownership
3. **Review Timeline**: 48 hours for first review
4. **Approval**: 2 approvals required for main branch
5. **Merge**: Squash and merge preferred

## Code Review Guidelines

### For Reviewers

#### What to Look For

1. **Functionality**: Does the code do what it's supposed to do?
2. **Readability**: Is the code easy to understand?
3. **Performance**: Are there any obvious performance issues?
4. **Security**: Are there any security vulnerabilities?
5. **Testing**: Are there adequate tests?
6. **Documentation**: Is the code and its changes well-documented?

#### Review Style

- Be constructive and specific
- Focus on the code, not the person
- Ask questions to understand intent
- Suggest alternatives when possible
- Acknowledge good work

#### Example Feedback

```
✅ Good: "Consider using a Map instead of an array for O(1) lookup performance"

❌ Bad: "This is slow and wrong"
```

### For Contributors

#### How to Respond to Reviews

1. **Thank reviewers** for their time and feedback
2. **Ask questions** if feedback is unclear
3. **Make requested changes** or explain why you disagree
4. **Update the PR** with changes
5. **Re-request review** when ready

#### Common Review Comments

- "Can you add tests for this case?"
- "Consider extracting this into a separate function"
- "This might be more readable with early returns"
- "Let's discuss this approach in our next sync"

## Testing Requirements

### Testing Pyramid

```
        /\
       /  \     E2E Tests (10%)
      / E2E \   - Critical user journeys
     /------\
    /        \
   /  Integration \
  /  Tests (20%)   \
 /------------------\
/     Unit Tests     \
/     (70%)          \
/--------------------\
```

### Test Types

#### Unit Tests
- **Frontend**: Jest + React Testing Library
- **Backend**: pytest + pytest-asyncio
- **Coverage**: Minimum 80% for new code
- **Scope**: Individual functions and components

#### Integration Tests
- **Frontend**: API integration with MSW
- **Backend**: Database and external service integration
- **Scope**: Component interactions and API endpoints

#### E2E Tests
- **Tool**: Playwright
- **Scope**: Critical user journeys
- **Environments**: Staging and production

### Test Setup and Execution

```bash
# Run all tests
npm test

# Run specific test suites
=======
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
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e
npm run test:unit
npm run test:integration
npm run test:e2e

<<<<<<< HEAD
# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Testing Standards

1. **Test Naming**: Use descriptive test names that explain the scenario
2. **Arrange-Act-Assert**: Structure tests clearly
3. **Isolation**: Tests should be independent
4. **Mocking**: Mock external dependencies
5. **Edge Cases**: Test error conditions and edge cases
6. **Maintainability**: Keep tests simple and focused

## Documentation Contributions

### Documentation Types

1. **API Documentation**: Auto-generated from code
2. **User Guides**: End-user focused documentation
3. **Developer Guides**: Technical implementation details
4. **Architecture Decision Records (ADRs)**: Design decisions
5. **Code Comments**: Inline code documentation

### Documentation Standards

- **Clarity**: Write for your audience
- **Completeness**: Cover all necessary information
- **Currency**: Keep documentation up-to-date
- **Consistency**: Use consistent formatting and style
- **Examples**: Include practical examples

### Documentation Process

1. **Identify**: What needs documentation?
2. **Research**: Gather information from code and discussions
3. **Write**: Create clear, comprehensive documentation
4. **Review**: Have others review for accuracy
5. **Maintain**: Keep documentation current

## Issue Reporting

### Issue Templates

#### Bug Report
```markdown
**Bug Description**
Clear description of the bug

**Environment**
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 95.0]
- Version: [e.g. 1.2.3]

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable
```

#### Feature Request
```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you've considered

**Additional context**
Screenshots, mockups, etc.
```

### Issue Guidelines

1. **Search First**: Check if the issue already exists
2. **Use Templates**: Fill out the appropriate template
3. **Be Specific**: Provide clear, actionable information
4. **Include Context**: Environment, steps, expected vs actual
5. **Label Appropriately**: Use relevant labels

## Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. We do not tolerate harassment or discrimination in any form.

#### Expected Behavior

- Be respectful and considerate
- Be collaborative and supportive
- Focus on constructive feedback
- Respect different viewpoints
- Show empathy towards other community members

#### Unacceptable Behavior

- Harassment, discrimination, or offensive language
- Personal attacks or trolling
- Publishing private information without permission
- Any conduct that could reasonably be considered inappropriate

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General discussions and Q&A
- **Discord**: Real-time chat and collaboration
- **Email**: Security issues and private matters

### Getting Help

1. **Check Documentation**: Review relevant guides first
2. **Search Issues**: Look for similar questions/problems
3. **Ask in Discussions**: General questions and help
4. **Contact Maintainers**: For sensitive or urgent matters

## Release Process

### Version Numbering

We follow [Semantic Versioning (SemVer)](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Schedule

- **Patch Releases**: Weekly (as needed)
- **Minor Releases**: Monthly
- **Major Releases**: Quarterly

### Release Process

1. **Feature Freeze**: Stop accepting new features
2. **Testing**: Comprehensive testing in staging
3. **Documentation**: Update release notes
4. **Release Branch**: Create release branch
5. **Tag Release**: Tag the release version
6. **Deploy**: Deploy to production
7. **Post-Release**: Monitor and address issues

### Release Automation

```bash
# Create release
npm run release -- --release-as minor

# This will:
# - Update version numbers
# - Generate changelog
# - Create git tag
# - Push changes
```

## Developer Progression

### Progression Path

```
Junior Developer
    ↓
Mid-level Developer
    ↓
Senior Developer
    ↓
Tech Lead
    ↓
Maintainer
```

### Criteria for Progression

#### Junior → Mid-level
- Consistent quality contributions
- Completes assigned tasks independently
- Shows initiative in learning
- Participates in code reviews
- Writes adequate tests

#### Mid-level → Senior
- Leads feature development
- Mentors junior developers
- Contributes to architecture decisions
- Improves development processes
- Cross-team collaboration

#### Senior → Tech Lead
- Technical leadership on projects
- Makes architectural decisions
- Mentors team members
- Coordinates with other teams
- Represents team in planning

#### Tech Lead → Maintainer
- Long-term project commitment
- Community involvement
- Technical excellence
- Process improvement leadership
- Vision and strategy contribution

### Certification Program

#### Frontend Developer Certification
- React/TypeScript proficiency
- Accessibility compliance (WCAG 2.1)
- Performance optimization
- Testing strategies
- Modern tooling (Vite, Playwright)

#### Backend Developer Certification
- Python/FastAPI expertise
- Database design and optimization
- API security practices
- Scalability patterns
- Monitoring and observability

#### Full-Stack Developer Certification
- Both frontend and backend certifications
- DevOps and deployment knowledge
- System architecture understanding
- Cross-platform development

## Recognition System

### Contribution Tracking

We maintain a transparent system to recognize contributor contributions:

#### Metrics Tracked
- Code contributions (commits, PRs)
- Code reviews performed
- Issues opened and resolved
- Documentation contributions
- Community support (discussions, answers)
- Mentorship and guidance

#### Recognition Levels

🥉 **Bronze Contributor**
- 10+ meaningful contributions
- Shows engagement with community

🥈 **Silver Contributor**
- 50+ meaningful contributions
- Regular code reviewer
- Community helper

🥇 **Gold Contributor**
- 100+ meaningful contributions
- Technical leadership
- Mentors others

⭐ **Platinum Contributor**
- 200+ meaningful contributions
- Project maintainer
- Vision contributor

🏆 **Hall of Fame**
- Exceptional long-term contribution
- Significant impact on project direction
- Community leadership

### Benefits

- Public recognition in release notes
- Profile badge on GitHub
- Priority in project discussions
- Early access to new features
- Speaking opportunities at events
- Exclusive contributor merchandise

### Annual Awards

- **Rising Star**: Outstanding new contributor
- **Code Quality**: Best code quality improvements
- **Community Champion**: Best community support
- **Innovation Award**: Most innovative contribution
- **Mentor of the Year**: Best mentorship contributions

## Getting Help

### Resources

- **Documentation**: [docs/](./) directory
- **API Reference**: Auto-generated from code
- **FAQ**: Common questions and answers
- **Troubleshooting**: Common issues and solutions

### Contact Information

- **Maintainers**: Listed in MAINTAINERS.md
- **Security Issues**: security@project.com
- **General Questions**: GitHub Discussions
- **Emergency**: Check emergency-contacts.md

---

Thank you for contributing to Crazy Gary! Your participation helps make this project better for everyone.

**Questions?** Don't hesitate to reach out through GitHub Discussions or contact the maintainers.
=======
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
>>>>>>> d8a38d4aed4f9316de58ec6d6b5ae08fca56e20e

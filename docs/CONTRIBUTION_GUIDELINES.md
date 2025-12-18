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

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
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
npm run test:unit
npm run test:integration
npm run test:e2e

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
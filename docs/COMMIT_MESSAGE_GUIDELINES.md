# Commit Message Guidelines

## Overview

This document defines our commit message conventions based on the [Conventional Commits](https://www.conventionalcommits.org/) specification. Consistent commit messages help maintain a clear project history and enable automated release processes.

## Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Commit Types

### Primary Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | A new feature | `feat(auth): add OAuth2 login` |
| `fix` | A bug fix | `fix(api): resolve memory leak` |
| `docs` | Documentation changes | `docs(readme): update installation steps` |
| `style` | Code formatting (no logic change) | `style(css): format button styles` |
| `refactor` | Code refactoring (no behavior change) | `refactor(auth): extract validation logic` |
| `perf` | Performance improvements | `perf(api): optimize database queries` |
| `test` | Adding or updating tests | `test(auth): add login flow tests` |

### Supporting Types

| Type | Description | Example |
|------|-------------|---------|
| `build` | Build system changes | `build(deps): update webpack to v5` |
| `ci` | CI/CD configuration changes | `ci: add automated security scans` |
| `chore` | Maintenance tasks | `chore: update dependencies` |
| `revert` | Revert previous commit | `revert: feat(auth): add OAuth2 login` |

## Commit Scopes

### Frontend Scopes
- `ui` - User interface changes
- `component` - React component changes
- `page` - Page-level changes
- `hook` - Custom React hooks
- `router` - Routing changes
- `theme` - Styling and theming
- `accessibility` - A11y improvements

### Backend Scopes
- `api` - API endpoint changes
- `auth` - Authentication/authorization
- `model` - Data model changes
- `database` - Database-related changes
- `middleware` - Middleware modifications
- `service` - Business logic services
- `validation` - Input validation changes

### Infrastructure Scopes
- `deploy` - Deployment configuration
- `docker` - Container-related changes
- `config` - Configuration files
- `security` - Security-related changes
- `monitoring` - Monitoring and logging

### Cross-Cutting Scopes
- `docs` - Documentation changes
- `test` - Testing infrastructure
- `workflow` - Development workflow
- `performance` - Performance optimizations

## Commit Message Examples

### Feature Commits

```bash
feat(auth): implement JWT token refresh mechanism

- Add token refresh endpoint to auth service
- Implement automatic token refresh in frontend
- Add token expiration warning dialog
- Update auth middleware to handle expired tokens

Closes #123
```

### Bug Fix Commits

```bash
fix(api): resolve race condition in user creation

The user creation endpoint was creating duplicate users due to
a race condition in the database transaction. Added proper
locking mechanism to prevent concurrent inserts.

Fixes #456
```

### Documentation Commits

```bash
docs(api): add authentication guide

- Document JWT token usage
- Add example API calls with authentication
- Include error response codes
- Link to related security documentation

Refs #789
```

### Refactoring Commits

```bash
refactor(ui): extract reusable form components

Moved common form logic into custom hooks and created
reusable FormField component to reduce code duplication
across authentication forms.

No functional changes intended.
```

### Performance Commits

```bash
perf(database): optimize user query performance

- Added index on frequently queried user fields
- Optimized N+1 query in user posts fetching
- Reduced database connection pool size
- Implemented query result caching

Performance improvement: 40% faster page load times
```

## Commit Body Guidelines

### Body Content

The commit body should explain **what** and **why** rather than **how**:

❌ **Bad:**
```bash
feat(api): update user model

Changed the user model to include new fields and updated
the database schema. Also updated the API endpoints to
handle the new fields.
```

✅ **Good:**
```bash
feat(api): add user profile fields

Extend user model to support profile pictures and bio
information to enable richer user profiles. This enables
users to personalize their accounts and improves user
engagement metrics.

- Add avatar_url and bio fields to user model
- Create migration to update existing users
- Update API responses to include profile data
- Update frontend to display new profile information
```

### Body Formatting

- Use bullet points for multiple changes
- Start each bullet with a verb (Add, Update, Remove, etc.)
- Keep lines under 72 characters for readability
- Use imperative mood (Add, Fix, Update, not Added, Fixed, Updated)

## Commit Footer Guidelines

### Breaking Changes

```bash
feat(api): change authentication token format

BREAKING CHANGE: Authentication tokens now use JWT format
instead of session cookies. Clients must update their
authentication logic.

Migration guide: See docs/authentication-migration.md
```

### Issue References

```bash
fix(ui): resolve button alignment issue

Closes #123
Fixes #456
Resolves #789
```

### Related Commits

```bash
docs: update API documentation

Refs #123
See also: #456, #789
```

## Pre-commit Hooks

### Installation

The project includes pre-commit hooks to ensure commit message quality:

```bash
# Install pre-commit hooks
./scripts/install-hooks.sh
```

### Validation Rules

Our commit message validator checks for:

1. **Type**: Must be one of the defined types
2. **Scope**: Must be a valid scope (if provided)
3. **Subject**: Must not be empty and follow length guidelines
4. **Format**: Must follow the conventional commit format

### Manual Validation

Before committing, validate your message:

```bash
# Check commit message format
./scripts/commit-msg.sh "your commit message"
```

## Commit Message Templates

### Feature Template

```bash
feat(scope): brief description of feature

Longer description explaining the purpose and impact
of this feature. Include technical details and user
benefits.

- Bullet point 1
- Bullet point 2
- Bullet point 3

Closes #issue_number
```

### Bug Fix Template

```bash
fix(scope): brief description of bug

Explain what was wrong and how this fix resolves it.
Include the root cause if relevant.

Fixes #issue_number
```

### Refactor Template

```bash
refactor(scope): brief description of refactor

Explain what was changed and why. Mention any
performance or maintainability improvements.

No functional changes intended.
```

## Common Mistakes to Avoid

### 1. Vague Subject Lines

❌ **Bad:**
```bash
fix: fix things
update: updates
improvement: improvements
```

✅ **Good:**
```bash
fix(api): resolve authentication timeout issue
update(readme): add installation prerequisites
improvement(perf): reduce bundle size by 30%
```

### 2. Missing Context

❌ **Bad:**
```bash
feat: new feature
```

✅ **Good:**
```bash
feat(dashboard): add real-time user metrics widget

Implement WebSocket connection to display live user
activity metrics in the admin dashboard.
```

### 3. Mixed Concerns

❌ **Bad:**
```bash
feat(api): add user endpoint and fix styling issues
```

✅ **Good:**
```bash
feat(api): add user management endpoint
fix(ui): resolve responsive styling issues
```

### 4. Improper Breaking Change Format

❌ **Bad:**
```bash
feat: major API changes

This breaks existing functionality.
```

✅ **Good:**
```bash
feat(api): restructure user endpoints

BREAKING CHANGE: User endpoints moved from /api/v1/users
to /api/v2/users. Update client implementations accordingly.

Migration guide: docs/api-v2-migration.md
```

## Automated Tools

### Commit Message Linting

Our CI pipeline includes commit message linting:

```bash
# Local validation
npm run commitlint

# With auto-fix for formatting issues
npm run commitlint -- --fix
```

### Conventional Commits Configuration

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [2, "always", [
      "feat", "fix", "docs", "style", "refactor",
      "perf", "test", "build", "ci", "chore", "revert"
    ]],
    "scope-enum": [2, "always", [
      "ui", "component", "page", "hook", "router",
      "api", "auth", "model", "database", "service",
      "deploy", "docker", "config", "security"
    ]],
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "subject-max-length": [2, "never", 72],
    "body-max-line-length": [2, "never", 72]
  }
}
```

## Best Practices

### 1. Write Atomic Commits

Each commit should represent a single logical change:

✅ **Good:** One feature per commit
```bash
feat(auth): add Google OAuth provider
```

❌ **Bad:** Multiple features in one commit
```bash
feat: add Google OAuth and fix bugs and update docs
```

### 2. Use Active Voice

✅ **Good:**
```bash
Add user authentication
Implement file upload
Optimize database queries
```

❌ **Bad:**
```bash
Added user authentication
File upload implementation
Database query optimization
```

### 3. Be Descriptive but Concise

✅ **Good:**
```bash
feat(api): add pagination to user list endpoint
```

❌ **Bad:**
```bash
feat(api): add pagination functionality to the user listing endpoint that allows users to browse through large datasets more efficiently
```

### 4. Reference Issues

Always reference related issues in your commit messages:

```bash
feat(auth): add two-factor authentication

Implement TOTP-based 2FA for user accounts with QR code
setup and backup codes for account recovery.

Closes #123
Refs #456
```

## Tool Integration

### IDE Integration

#### VS Code
Install the "Conventional Commits" extension for autocomplete and validation.

#### IntelliJ IDEA
Configure commit message templates in Settings → Version Control → Commit Templates.

### Git Hooks

Our pre-commit hooks ensure message quality:

```bash
#!/bin/bash
# .git/hooks/commit-msg

commit_message_file=$1
commit_message=$(cat "$commit_message_file")

# Run commit message validation
npm run commitlint -- --edit "$commit_message_file"
```

### Automated Changelog Generation

Our changelog is automatically generated from commit messages:

```bash
# Generate changelog
npm run changelog

# Generate specific version changelog
npm run changelog -- --from=v1.2.0 --to=v1.3.0
```

## Review and Enforcement

### Code Review Process

Reviewers should check:

1. **Message Format**: Follows conventional commits
2. **Clarity**: Message clearly describes the change
3. **Scope**: Appropriate scope is used
4. **Breaking Changes**: Properly documented
5. **Issue References**: Related issues are linked

### Continuous Integration

Our CI pipeline validates:

- Commit message format
- Type and scope validity
- Breaking change documentation
- Issue reference format

## Migration Guide

### Converting Existing Commits

If migrating from a different commit message style:

```bash
# Interactive rebase to rewrite commit messages
git rebase -i HEAD~10

# Use search and replace to convert
git filter-branch --msg-filter 'sed "s/^feature:/feat:/g"' HEAD~10
```

### Gradual Migration

1. **Phase 1**: Use commit message validation (warnings only)
2. **Phase 2**: Enable strict validation for new branches
3. **Phase 3**: Enforce on all branches

---

## Summary

Good commit messages are crucial for:

- **Maintainability**: Easy to understand project history
- **Automation**: Enable automated processes
- **Collaboration**: Help team members understand changes
- **Documentation**: Serve as project documentation

Remember: **Your future self and teammates will thank you for clear, consistent commit messages.**
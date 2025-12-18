# Pull Request Guidelines

## Overview

This document defines our pull request (PR) process, ensuring all contributions meet our quality standards and can be efficiently reviewed and merged.

## PR Process Overview

```
1. Create Feature Branch
2. Make Changes
3. Write Tests
4. Update Documentation
5. Self-Review
6. Create PR
7. CI/CD Checks
8. Code Review
9. Address Feedback
10. Merge
```

## Before Creating a PR

### Checklist

- [ ] All tests pass locally
- [ ] Code follows style guidelines
- [ ] New code has adequate test coverage
- [ ] Documentation is updated
- [ ] No console.log or debug statements
- [ ] No TODO/FIXME comments (unless documented)
- [ ] Breaking changes are documented
- [ ] Performance impact is considered

### Quality Gates

All PRs must pass these automated checks:

```bash
# Run quality gates locally before PR
./scripts/quality-gates-summary.sh

# This runs:
# - Linting (ESLint/flake8)
# - Type checking (TypeScript/mypy)
# - Unit tests
# - Security scans
# - Performance benchmarks
```

## Creating a Pull Request

### PR Template

Use our standardized PR template:

```markdown
## Description
Brief description of what this PR does and why it's needed.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring (no functional changes)
- [ ] Test improvements

## Changes Made
List the specific changes made in this PR:

### Added
- Feature A: Brief description
- Utility function: Brief description

### Changed
- Component B: Brief description of changes
- API endpoint: Brief description of changes

### Removed
- Deprecated function: Brief description
- Unused code: Brief description

### Fixed
- Bug in Component C: Brief description
- Memory leak: Brief description

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if applicable)

### Test Coverage
- [ ] New code has >80% test coverage
- [ ] Critical paths are tested
- [ ] Edge cases are covered
- [ ] Error scenarios are tested

## Documentation
- [ ] Code is self-documenting
- [ ] Complex logic has inline comments
- [ ] API changes are documented
- [ ] User-facing changes are documented
- [ ] README is updated (if needed)

## Breaking Changes
If this PR contains breaking changes:

- [ ] Migration guide is included
- [ ] Deprecation warnings are added
- [ ] Version bump follows semantic versioning
- [ ] Migration timeline is specified

## Screenshots/Demos
Include screenshots or GIFs for:
- UI changes
- New features
- Bug fixes (before/after)

## Checklist
- [ ] Self-review completed
- [ ] Code follows project style guidelines
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console.log/debug statements
- [ ] Performance impact assessed
- [ ] Security considerations addressed

## Related Issues
- Closes #issue_number
- Fixes #issue_number
- Relates to #issue_number

## Additional Notes
Any additional information for reviewers.
```

### PR Title Format

Use conventional commit format:

```
<type>(<scope>): <description>

Examples:
feat(auth): add OAuth2 authentication
fix(api): resolve memory leak in user service
docs(readme): update installation instructions
perf(ui): optimize component rendering
```

## PR Categories

### Feature PRs
```markdown
feat(api): add user management endpoints

- GET /api/users - List users with pagination
- POST /api/users - Create new user
- GET /api/users/:id - Get specific user
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

Includes proper validation, error handling, and tests.
```

### Bug Fix PRs
```markdown
fix(ui): resolve button alignment on mobile

Fixed responsive layout issue where buttons were
overlapping on screens smaller than 768px.

Before: [screenshot]
After: [screenshot]

Tested on:
- iOS Safari
- Chrome Mobile
- Firefox Mobile
```

### Documentation PRs
```markdown
docs(api): add authentication guide

Added comprehensive guide covering:
- JWT token usage
- API authentication examples
- Error response codes
- Security best practices

Includes code examples and curl commands.
```

## Review Process

### Reviewer Assignment

PRs are automatically assigned based on:

1. **Code ownership**: Files modified determine primary reviewer
2. **Domain expertise**: Relevant team members
3. **Load balancing**: Distribute review workload
4. **Availability**: Online team members

### Review Timeline

| PR Type | First Review | Full Review | Merge |
|---------|--------------|-------------|-------|
| Bug Fix | 4 hours | 24 hours | 24 hours |
| Documentation | 2 hours | 12 hours | 12 hours |
| Feature | 24 hours | 72 hours | 72 hours |
| Major Changes | 48 hours | 1 week | 1 week |

### Review Checklist

#### Functionality Review
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Performance impact is acceptable
- [ ] Security considerations are addressed

#### Code Quality Review
- [ ] Code follows style guidelines
- [ ] Functions are small and focused
- [ ] Naming is clear and consistent
- [ ] Comments explain complex logic
- [ ] No dead code or TODOs

#### Testing Review
- [ ] Adequate test coverage
- [ ] Tests are meaningful and maintainable
- [ ] Critical paths are tested
- [ ] Integration tests cover interactions
- [ ] E2E tests verify user flows

#### Documentation Review
- [ ] API changes are documented
- [ ] User-facing changes are explained
- [ ] Code comments are helpful
- [ ] Examples are provided
- [ ] Breaking changes are noted

## Review Styles and Feedback

### Constructive Feedback

✅ **Good Examples:**
```
"This approach looks good. Consider extracting this logic 
into a separate utility function to improve reusability."

"I noticed this could cause performance issues with large 
datasets. Have you considered adding pagination here?"

"Nice work on the error handling! One suggestion: we could 
make the error messages more user-friendly."
```

❌ **Avoid:**
```
"This is wrong."
"Better approach would be..."
"This doesn't work."
```

### Types of Reviews

#### Approve
```
✅ Code looks good and ready to merge
```

#### Request Changes
```
⚠️ Some changes needed before merging:

1. Add unit tests for the new authentication logic
2. Update error messages to be more descriptive  
3. Consider adding rate limiting to prevent abuse

These changes will improve code quality and user experience.
```

#### Comment
```
💬 General feedback without blocking merge:

This is a good start! Some ideas for future enhancement:
- Add caching for frequently accessed data
- Consider adding webhook support
- Implement audit logging for security
```

### Responding to Reviews

#### Addressing Feedback

1. **Thank reviewers** for their time
2. **Ask questions** if feedback is unclear
3. **Make requested changes** or explain disagreement
4. **Re-request review** when changes are ready
5. **Mark resolved comments** when addressed

#### Example Response
```
Thanks for the thorough review! 

✅ Implemented suggestions:
- Extracted validation logic into utils/validation.ts
- Added comprehensive error handling with user-friendly messages
- Implemented rate limiting (100 requests/minute)

❓ Question about the caching suggestion:
Do you think Redis would be better than in-memory caching 
for the user profile data? I'd like to discuss this approach.

Ready for another review!
```

## Automated Checks

### CI/CD Pipeline

Our automated pipeline runs:

1. **Code Quality**
   - ESLint (Frontend)
   - flake8 (Backend)
   - TypeScript compilation
   - Security scanning (Snyk)

2. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests
   - Test coverage reports

3. **Build Process**
   - Dependency installation
   - Build compilation
   - Asset optimization

4. **Deployment Validation**
   - Docker image building
   - Smoke tests
   - Performance benchmarks

### Check Status

| Check | Required | Timeout | Description |
|-------|----------|---------|-------------|
| ✅ CI | Required | 10 min | All automated tests |
| 🔍 CodeQL | Required | 5 min | Security analysis |
| 📊 Coverage | Required | 3 min | Test coverage >80% |
| 🎨 Linting | Required | 2 min | Code style compliance |
| 🔧 Build | Required | 5 min | Successful compilation |
| 🚀 Deploy | Optional | 15 min | Staging deployment |

### Handling Check Failures

#### Common Failures

1. **Test Failures**
   ```bash
   # Run tests locally to debug
   npm test
   
   # Run specific failing test
   npm test -- --testNamePattern="test_name"
   ```

2. **Linting Errors**
   ```bash
   # Auto-fix linting issues
   npm run lint -- --fix
   
   # Check specific file
   npx eslint path/to/file.js
   ```

3. **Type Errors**
   ```bash
   # Check TypeScript compilation
   npx tsc --noEmit
   
   # Fix type issues
   # See: https://www.typescriptlang.org/docs/
   ```

4. **Coverage Issues**
   ```bash
   # Check coverage report
   npm run test:coverage
   
   # Focus on uncovered lines
   # Add missing test cases
   ```

## PR Merging

### Merge Strategies

We use **Squash and Merge** for most PRs:

✅ **Benefits:**
- Clean commit history
- One logical commit per feature
- Easier to revert changes
- Better changelog generation

### Merge Requirements

#### Standard PRs
- [ ] All required checks pass
- [ ] At least 2 approvals from code owners
- [ ] No blocking review comments
- [ ] Documentation updated

#### Critical PRs
- [ ] All standard requirements
- [ ] Security review completed
- [ ] Performance impact assessed
- [ ] Migration plan documented

### Merge Process

1. **Final Review**: Last reviewer approves
2. **Squash**: Combine all commits into one
3. **Merge**: Integrate into target branch
4. **Cleanup**: Delete feature branch
5. **Notification**: Update linked issues

### Post-Merge

```bash
# After merge, the feature branch can be deleted
git checkout develop
git pull origin develop
git branch -d feature/your-feature-name
```

## Special PR Types

### Breaking Changes

PRs that introduce breaking changes require:

- **Extended Review Period**: 1 week minimum
- **Migration Guide**: Step-by-step upgrade instructions
- **Deprecation Warnings**: For future removal
- **Version Bump**: Follow semantic versioning
- **Testing**: Extensive compatibility testing

### Hotfix PRs

For production bugs:

- **Priority**: Immediate review
- **Scope**: Minimal changes only
- **Testing**: Quick but thorough testing
- **Documentation**: Brief explanation
- **Backport**: Consider merging to release branches

### Documentation PRs

- **Review Time**: Same-day review
- **Technical Review**: Not always required
- **Style Check**: Follow documentation guidelines
- **Accuracy**: Verify all examples work
- **Completeness**: Cover all relevant topics

## Large PRs

### When to Split a PR

Consider splitting if:
- More than 500 lines of code changed
- Multiple unrelated features
- Affects many components
- Takes more than 2 hours to review

### Handling Large Changes

1. **Break into smaller PRs** when possible
2. **Use PR series** for dependent changes
3. **Provide overview** of the complete change
4. **Request specific reviewers** for different parts
5. **Schedule review sessions** for complex changes

### Example: Multi-PR Feature

```
PR 1: feat(auth): add user registration endpoint
PR 2: feat(ui): add registration form component  
PR 3: feat(auth): add email verification
PR 4: feat(ui): add verification flow
PR 5: feat: integrate registration and verification
```

## Best Practices

### For Contributors

1. **Small, Focused PRs**: Easier to review and merge
2. **Clear Descriptions**: Help reviewers understand context
3. **Self-Review**: Catch obvious issues before requesting review
4. **Responsive**: Address feedback promptly
5. **Patient**: Allow adequate time for thorough review

### For Reviewers

1. **Timely Reviews**: Don't let PRs languish
2. **Constructive Feedback**: Be specific and helpful
3. **Focus on Important Issues**: Don't nitpick style
4. **Ask Questions**: Seek to understand intent
5. **Share Knowledge**: Help contributors learn

### For Maintainers

1. **Consistent Process**: Apply standards fairly
2. **Clear Communication**: Set expectations
3. **Quality Focus**: Maintain high standards
4. **Community Building**: Welcome new contributors
5. **Process Improvement**: Evolve guidelines based on experience

---

## Summary

Effective pull requests:

- **Improve Code Quality**: Through review and discussion
- **Share Knowledge**: Help team members learn
- **Prevent Bugs**: Catch issues before production
- **Maintain Standards**: Keep codebase consistent
- **Build Community**: Welcome and guide contributors

Remember: **A good PR is one that's easy to review and merge quickly.**
# Crazy Gary Pre-commit Hooks with Quality Gates

This document describes the comprehensive pre-commit hooks system implemented for the Crazy Gary application to ensure code quality, security, and consistency.

## Overview

The pre-commit hooks system provides multiple layers of quality gates that run automatically before commits and pushes to ensure:

- **Code Quality**: TypeScript compilation, linting, formatting
- **Security**: Vulnerability scanning, secret detection, security best practices
- **Testing**: Unit tests, coverage reporting, integration checks
- **Performance**: Bundle size monitoring, complexity analysis
- **Documentation**: Consistent commit messages, code documentation
- **Standards**: Conventional commits, coding standards compliance

## Architecture

```
├── .git/hooks/
│   ├── pre-commit          # Main pre-commit quality checks
│   ├── commit-msg          # Commit message validation
│   └── pre-push           # Comprehensive pre-push testing
├── scripts/
│   ├── pre-commit.sh      # Pre-commit quality gate implementation
│   ├── commit-msg.sh      # Commit message validation
│   └── pre-push.sh        # Pre-push comprehensive testing
├── .lintstagedrc.json     # Lint-staged configuration
├── .quality-gates.json    # Quality gates configuration
├── .cspell.json          # Spell checking configuration
└── commitlint.config.json # Commit message linting rules
```

## Pre-commit Hook (`.git/hooks/pre-commit`)

Runs automatically before each commit to ensure code quality.

### Checks Performed

1. **TypeScript Compilation**
   - Verifies all TypeScript files compile without errors
   - Runs `npm run type-check` in the web app workspace
   - Fails commit if compilation errors are found

2. **ESLint Code Quality**
   - Runs ESLint on all staged TypeScript/JavaScript files
   - Enforces coding standards and best practices
   - Fails commit if linting errors are found

3. **Prettier Code Formatting**
   - Checks if code follows Prettier formatting rules
   - Auto-formats files if needed
   - Fails commit if formatting issues cannot be auto-fixed

4. **Unit Tests (Conditional)**
   - Only runs if test files have been modified
   - Executes unit tests using Vitest
   - Fails commit if tests fail

5. **Security Scanning**
   - Detects hardcoded secrets, passwords, and API keys
   - Checks for console.log statements (development leftovers)
   - Validates TODO/FIXME comments

6. **Code Complexity Analysis**
   - Basic complexity checks for nested functions
   - Identifies potentially problematic code patterns
   - Warns about high complexity code

7. **File Size Validation**
   - Warns about large files (>50KB)
   - Prevents accidental addition of binary files

8. **Auto-formatting**
   - Automatically formats code using Prettier
   - Adds formatted files back to staging

### Usage

The pre-commit hook runs automatically when you execute `git commit`. If any quality gate fails, the commit is blocked and you must fix the issues.

```bash
# Make changes
git add .
git commit -m "feat: add new feature"

# If quality gates fail, fix issues and try again
git commit -m "feat: add new feature"
```

## Commit Message Validation (`.git/hooks/commit-msg`)

Validates commit messages against conventional commits format.

### Conventional Commit Format

```
<type>(<scope>): <subject>
```

### Valid Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit
- `security`: Security improvements
- `deps`: Dependency updates

### Examples

```bash
# Good commit messages
git commit -m "feat(auth): add user authentication"
git commit -m "fix(api): resolve memory leak in endpoint"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(components): simplify button component"

# Bad commit messages (will be rejected)
git commit -m "fixed bug"
git commit -m "update"
git commit -m "stuff"
```

## Pre-push Hook (`.git/hooks/pre-push`)

Runs comprehensive tests before allowing pushes to remote repositories.

### Checks Performed

1. **Full TypeScript Compilation**
   - Runs production build to ensure everything compiles
   - Verifies build artifacts are generated correctly

2. **Complete Linting**
   - Runs full ESLint check across entire codebase
   - Ensures no linting violations exist

3. **Full Test Suite with Coverage**
   - Executes all unit tests
   - Generates coverage reports
   - Enforces coverage thresholds:
     - Lines: ≥80%
     - Branches: ≥75%
     - Functions: ≥80%

4. **Bundle Size Analysis**
   - Checks production bundle size
   - Validates build artifacts exist and are reasonable size

5. **Security Audit**
   - Runs npm audit for known vulnerabilities
   - Allows manual override for non-critical issues

6. **Performance Validation**
   - Basic performance checks
   - Import optimization analysis

7. **Dead Code Detection**
   - Identifies potentially unused code
   - Checks for unused imports

8. **Python Code Quality** (API component)
   - Validates Python syntax
   - Ensures no syntax errors in API code

### Usage

The pre-push hook runs automatically when you execute `git push`. If any test fails, the push is blocked.

```bash
git push origin main

# If comprehensive tests fail, fix issues and try again
git push origin main
```

## Configuration Files

### `.lintstagedrc.json`

Configures lint-staged to run quality checks on staged files:

```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "npm run type-check"
  ],
  "*.{js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ]
}
```

### `.quality-gates.json`

Defines quality gates and thresholds:

```json
{
  "version": "0.3",
  "packages": {
    "apps/web": {
      "maxSizeKB": 500
    },
    "packages/*": {
      "maxSizeKB": 200
    }
  },
  "rules": {
    "no-console": "error",
    "complexity": ["error", 10],
    "max-depth": ["error", 4]
  }
}
```

### `.cspell.json`

Configures spell checking for code and documentation:

```json
{
  "version": "0.2",
  "language": "en",
  "words": ["CrazyGary", "minimax", "vite", "..."],
  "ignorePaths": ["node_modules/**", "dist/**", "..."]
}
```

## Manual Execution

You can manually run quality checks using the provided scripts:

```bash
# Run pre-commit checks manually
bash scripts/pre-commit.sh

# Run commit message validation
bash scripts/commit-msg.sh .git/COMMIT_EDITMSG

# Run pre-push comprehensive tests
bash scripts/pre-push.sh

# Run individual checks
npm run type-check          # TypeScript compilation
npm run lint                # ESLint checking
npm run format              # Code formatting
npm run test:coverage       # Tests with coverage
npm run build:production    # Production build
```

## Bypassing Hooks

In rare cases, you may need to bypass quality gates:

```bash
# Skip pre-commit hooks (not recommended)
git commit --no-verify -m "message"

# Skip commit message validation (not recommended)
git commit --no-verify -m "message"

# Skip pre-push hooks (not recommended)
git push --no-verify origin main
```

**Warning**: Bypassing quality gates should only be done in exceptional circumstances and should be reviewed by a senior developer.

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   chmod +x scripts/*.sh
   ```

2. **Command Not Found**
   - Ensure all required tools are installed: npm, node, python3
   - Check PATH environment variable

3. **Hook Not Running**
   - Verify hooks are executable: `ls -la .git/hooks/`
   - Check script permissions and syntax

4. **Tests Failing**
   - Run tests manually to see detailed output
   - Check test coverage requirements
   - Fix failing tests before committing

### Getting Help

If you encounter issues with the pre-commit hooks:

1. Check the script output for specific error messages
2. Run individual checks manually to isolate the problem
3. Review configuration files for syntax errors
4. Consult the project documentation or ask team members

## Benefits

The pre-commit hooks system provides several benefits:

- **Consistency**: Ensures all code follows the same standards
- **Quality**: Prevents low-quality code from entering the repository
- **Security**: Catches security issues before they reach production
- **Performance**: Monitors bundle size and code complexity
- **Documentation**: Enforces good commit practices
- **Automation**: Reduces manual review burden
- **Education**: Helps developers learn best practices through automated feedback

## Future Enhancements

Potential future improvements to the quality gates system:

- Integration with external security scanners (Snyk, SonarQube)
- Performance regression detection
- Accessibility testing (axe-core integration)
- Dependency vulnerability scanning
- Code duplication detection (jscpd)
- API documentation generation
- GraphQL schema validation
- Database migration testing

---

For more information about the Crazy Gary project, see the main [README.md](./README.md).
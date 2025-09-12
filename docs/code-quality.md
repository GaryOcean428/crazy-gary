# Code Quality Guide

This document outlines the code quality standards and practices for the Crazy-Gary project.

## Type Safety & Standards

### TypeScript Configuration

- Use `strict: true` in all `tsconfig.json` files
- Enable all strict type checking options
- Use explicit return types for all functions
- Avoid `any` type; use `unknown` when necessary

### Python Configuration

- Use `mypy --strict` for type checking
- Use `pydantic` for data validation and schemas
- Use `black` for code formatting
- Use `isort` for import sorting
- Use `ruff` for linting

## Code Organization

### Separation of Concerns

- **Agents**: Core agentic logic and task execution
- **Harmony Adapter**: Message format handling and validation
- **MCP Clients**: External tool integration
- **Database Layer**: Data persistence and retrieval

### Interface-First Design

- Define TypeScript/Python interfaces before implementation
- Use Zod schemas for runtime validation
- Document all public APIs

## Error Handling

### Error Boundaries

- Implement error boundaries for tool calls
- Use retry mechanisms with exponential backoff
- Provide graceful fallbacks for model failures

### Logging

- Use structured logging (JSON format)
- Include trace IDs for request correlation
- Log all tool calls and responses
- Redact sensitive information

## Testing

### Unit Tests

- Test all core functions and components
- Use Jest for TypeScript/JavaScript
- Use Pytest for Python
- Aim for >80% code coverage

### Integration Tests

- Test MCP client integrations
- Test model fallback mechanisms
- Test authentication flows

### Smoke Tests

- Test complete user workflows
- Login → run task → return transcript
- Automated in CI/CD pipeline

## Best Practices

### General

- Prefer composition over inheritance
- Write self-documenting code
- Use meaningful variable and function names
- Keep functions small and focused

### Documentation

- Use JSDoc for TypeScript functions
- Use docstrings for Python functions
- Document all public APIs
- Maintain up-to-date README files

### Security

- Never commit secrets to repository
- Use environment variables for configuration
- Validate all user inputs
- Implement rate limiting
- Use HTTPS in production

## CI/CD Pipeline

### Required Checks

1. Lint check (ESLint, Ruff)
2. Type check (TypeScript, mypy)
3. Unit tests
4. Integration tests
5. Build verification
6. Security scan

### Deployment

- All checks must pass before deployment
- Use automated deployment with rollback capability
- Monitor application health post-deployment


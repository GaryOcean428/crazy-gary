# 🛠️ Crazy-Gary Developer Guide

This guide provides developers with the information they need to contribute to, extend, and maintain the Crazy-Gary platform.

## 🏗️ **Codebase Structure**

Crazy-Gary uses a monorepo architecture managed with `pnpm` workspaces.

```
crazy-gary/
├── apps/
│   ├── api/          # Backend Flask API
│   └── web/          # Frontend React application
├── packages/
│   ├── harmony-adapter/  # TypeScript types for Harmony message format
│   └── mcp-clients/      # TypeScript clients for MCP services
├── infra/
│   └── docker/       # Docker configurations for services
├── docs/             # Project documentation
├── tests/            # Python test suites for the backend
└── tools/            # Directory for custom, hot-swappable Heavy tools
```

### **Key Components**
- **`apps/api`**: The core backend logic, including the agent loop, Heavy orchestration, API routes, and database models.
- **`apps/web`**: The complete React frontend, including all pages, components, and hooks.
- **`packages/harmony-adapter`**: Defines the standardized `Harmony` message format used for all AI and tool communication.
- **`packages/mcp-clients`**: Contains the clients for interacting with external MCP services like Browserbase, Disco, and Supabase.
- **`tools/`**: A special directory where you can add custom Python-based tools that will be automatically discovered by the Heavy orchestration engine.

## 🤝 **Contributing Guide**

We welcome contributions! Please follow these steps to contribute.

1. **Fork the Repository**: Create your own fork of the `GaryOcean428/crazy-gary` repository.
2. **Create a Branch**: Make a new branch for your feature or bug fix (`git checkout -b feature/my-new-feature`).
3. **Make Changes**: Implement your changes, following the project's code quality standards.
4. **Add Tests**: Write unit or integration tests for any new functionality.
5. **Ensure Checks Pass**: Run the linter, type checker, and test suites to ensure everything is working correctly.
   ```bash
   # In apps/api
   pytest

   # In apps/web
   pnpm run lint
   pnpm run type-check
   ```
6. **Submit a Pull Request**: Push your branch to your fork and open a pull request to the main repository.

## 🧪 **Testing Guide**

The project includes a comprehensive suite of tests for the backend API.

### **Running Tests**
To run the full test suite, navigate to the `tests` directory and use `pytest`:

```bash
cd tests
pytest
```

### **Test Structure**
- **`test_auth.py`**: Tests for user registration, login, and authentication.
- **`test_harmony.py`**: Tests for the Harmony message format and model interactions.
- **`test_heavy.py`**: Tests for the Heavy multi-agent orchestration.
- **`test_mcp.py`**: Tests for MCP tool discovery and execution.

### **Adding New Tests**
When adding new features, please include corresponding tests. Create new test files in the `tests` directory following the `test_*.py` naming convention.

## 🔧 **Extending the Tool System**

Crazy-Gary features a powerful, hot-swappable tool system. You can easily add new tools for the Heavy orchestration engine to use.

### **Creating a Custom Heavy Tool**
1. **Create a Python File**: Add a new Python file to the `tools/` directory (e.g., `my_custom_tool.py`).
2. **Define the Tool Class**: Create a class that inherits from `BaseTool`.
3. **Implement Required Attributes**:
   - `name`: A unique, descriptive name for the tool.
   - `description`: A detailed explanation of what the tool does and when to use it.
4. **Implement the `_run` Method**: This method contains the core logic of your tool.

**Example (`tools/weather_tool.py`):**
```python
from tools.base import BaseTool
import requests

class WeatherTool(BaseTool):
    name = "get_weather_forecast"
    description = "Get the current weather forecast for a specific location. Use this for any questions about weather."

    def _run(self, location: str) -> str:
        try:
            # In a real implementation, you would use a weather API
            return f"The weather in {location} is sunny and 75 degrees."
        except Exception as e:
            return f"Error getting weather: {e}"
```

5. **Automatic Discovery**: The Heavy orchestrator will automatically discover and load your new tool at runtime. No further configuration is needed!

## 🏛️ **Architectural Decisions (ADRs)**

All major architectural decisions are documented in the `docs/ADR` directory. These documents provide the rationale behind key technical choices.

- **ADR-001**: Harmony & Model Strategy
- **ADR-002**: MCP Tool Orchestration
- **ADR-003**: Authentication & Session Model
- **ADR-004**: Observability & Limits
- **ADR-005**: Deployment & Scaling

## 🔒 **Security Considerations**

- **Never Commit Secrets**: Keep all API keys, passwords, and other secrets in your `.env` file. Never commit them to the repository.
- **Input Validation**: All user input is validated and sanitized on both the frontend and backend to prevent XSS and other injection attacks.
- **Dependencies**: Regularly update dependencies to patch security vulnerabilities.

---

*Happy developing!*


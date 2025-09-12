# Crazy-Gary: Agentic Application Platform

Crazy-Gary is a production-ready agentic application that enables users to issue open-ended tasks with autonomous planning, tool selection, execution, and verification using the Harmony message format, HuggingFace models, and MCP integrations.

## Features

- **Autonomous Task Execution**: AI agents that can plan, execute, and verify complex tasks
- **Harmony Message Format**: Standardized communication protocol for all interactions
- **Model Orchestration**: Primary 120B model with 20B fallback for reliability
- **MCP Integration**: Seamless integration with Disco, Browserbase, and Supabase MCPs
- **Human-in-the-Loop**: Checkpoints for user approval and intervention
- **Real-time Streaming**: Live updates during task execution
- **Comprehensive Observability**: Logging, metrics, and error tracking
- **Production Ready**: Containerized deployment with health checks and scaling

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   MCPs          │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (External)    │
│                 │    │                 │    │                 │
│ • Task Console  │    │ • Agent Loop    │    │ • Disco         │
│ • Settings      │    │ • Harmony Core  │    │ • Browserbase   │
│ • Transcripts   │    │ • Model Router  │    │ • Supabase      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crazy-gary
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and endpoints
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Open the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000

## Configuration

### Required Environment Variables

```bash
# Hugging Face Models
HF_BASE_URL_120B=https://endpoints.huggingface.co/GaryOcean/endpoints/gpt-oss-120b-crazy-gary
HF_BASE_URL_20B=https://endpoints.huggingface.co/GaryOcean/endpoints/gpt-oss-20b-crazy-gary
HUGGINGFACE_API_KEY=your_api_key

# MCP Endpoints
SUPABASE_MCP_ENDPOINT=your_supabase_endpoint
DISCO_MCP_ENDPOINT=your_disco_endpoint
BROWSERBASE_MCP_ENDPOINT=your_browserbase_endpoint

# Application
JWT_SECRET=your_jwt_secret
```

See [Environment Setup Guide](docs/env-setup.md) for complete configuration details.

## Usage

### Creating a Task

1. **Open the Task Console**
2. **Enter your goal** in natural language
3. **Review the generated plan**
4. **Approve or modify** the plan
5. **Monitor execution** in real-time
6. **Review results** and transcripts

### Example Tasks

- "Research the latest developments in AI and create a summary report"
- "Find and compare prices for laptops under $1000"
- "Create a presentation about renewable energy trends"
- "Analyze website performance and suggest improvements"

## Development

### Project Structure

```
crazy-gary/
├── apps/
│   ├── web/          # Frontend application
│   └── api/          # Backend API
├── packages/
│   ├── harmony-adapter/  # Harmony message format
│   └── mcp-clients/      # MCP client implementations
├── infra/
│   └── docker/       # Docker configurations
├── docs/             # Documentation
└── tests/            # Test suites
```

### Available Scripts

```bash
npm run dev          # Start development servers
npm run build        # Build all packages
npm run test         # Run test suites
npm run lint         # Lint code
npm run type-check   # Type checking
```

### Code Quality

This project enforces strict code quality standards:

- **TypeScript**: Strict mode enabled
- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **Testing**: Unit and integration tests
- **Type Safety**: Full type coverage

See [Code Quality Guide](docs/code-quality.md) for detailed standards.

## Deployment

### Railway (Recommended)

1. **Connect your repository** to Railway
2. **Set environment variables** in Railway dashboard
3. **Deploy** automatically on push to main branch

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual services
docker build -f infra/docker/Dockerfile.api -t crazy-gary-api .
docker build -f infra/docker/Dockerfile.web -t crazy-gary-web .
```

## Documentation

- [Design Document](docs/Design_Doc.md)
- [Architecture Decision Records](docs/ADR/)
- [Code Quality Guide](docs/code-quality.md)
- [Environment Setup](docs/env-setup.md)
- [Sequence Diagrams](docs/Sequence_Diagrams.md)

## Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests** for new functionality
5. **Ensure all checks pass**
6. **Submit a pull request**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or contributions, please:

- **Open an issue** on GitHub
- **Check the documentation** in the `docs/` directory
- **Review existing issues** before creating new ones

## Acknowledgments

- Inspired by the agent0ai/agent-zero project
- Built with modern web technologies and best practices
- Powered by OpenAI's GPT-OSS models


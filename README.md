# 🚀 Crazy-Gary: Heavy-Powered Autonomous Agentic AI System

![Crazy-Gary UI](https://i.imgur.com/your-screenshot-url.png)

**Crazy-Gary** is a production-ready, open-source autonomous agentic AI system designed for complex task execution. It combines a powerful multi-agent orchestration engine with a flexible tool integration system, enabling it to tackle open-ended challenges with intelligent planning, execution, and verification.

Built with a modern tech stack and a focus on security, scalability, and user experience, Crazy-Gary provides a comprehensive platform for building and deploying autonomous AI agents.

## ✨ **Core Features**

### **🧠 Multi-Agent Orchestration (Heavy Mode)**
- **Parallel Intelligence**: Dynamically spawns 4-8 specialized agents to work in parallel on complex queries.
- **Dynamic Question Generation**: AI automatically creates custom research questions for each agent, ensuring comprehensive analysis.
- **Intelligent Synthesis**: Uses a 120B parameter model to intelligently combine multiple agent perspectives into a unified, high-quality answer.
- **Real-time Progress**: Live visual feedback during multi-agent execution, showing the status of each agent.

### **🤖 Autonomous Agent Loop**
- **Task Planning**: Generates step-by-step execution plans using available tools and AI models.
- **Tool Selection**: Intelligently routes tasks to the most appropriate tools from the MCP (Model Context Protocol) ecosystem.
- **Task Execution**: Handles multi-step task processing with robust error handling and recovery.
- **State Management**: Complete lifecycle tracking for all agentic tasks, from creation to completion.

### **🛠️ Extensible Tool System (MCP)**
- **Hot-Swappable Tools**: Automatically discovers and loads tools from a flexible, extensible architecture.
- **MCP Integration**: Seamlessly connects to a wide range of external services through the Model Context Protocol:
  - **Browserbase**: Cloud browser automation for web scraping and interaction.
  - **Disco**: On-demand WebContainer development environments.
  - **Supabase**: Database management, authentication, and storage.
- **Custom Tools**: Easily extend the system by adding new tools to the `tools` directory.

### **🎨 Modern & Responsive UI**
- **Beautiful Interface**: Built with React, TailwindCSS, and shadcn/ui for a modern, intuitive user experience.
- **Dark Theme**: Professional dark theme with light/system mode options.
- **Comprehensive Dashboards**: Real-time monitoring of system health, model status, task progress, and costs.
- **Full Responsiveness**: Optimized for both desktop and mobile devices.

### **🔒 Security & Safety**
- **JWT Authentication**: Secure, token-based authentication with password hashing and protected routes.
- **Multi-Tier Rate Limiting**: Tiered rate limits (Free, Pro, Enterprise) to prevent abuse and manage costs.
- **Content Safety**: Proactive detection and blocking of harmful, illegal, or inappropriate content.
- **Cost Management**: Real-time token usage tracking, cost estimation, and budget limits.

### **📊 Observability & Monitoring**
- **Real-time Metrics**: Comprehensive monitoring of system, application, and performance metrics.
- **Health Checks**: Detailed health status for all system components, including database and external services.
- **Structured Logging**: Centralized, structured logging for easy debugging and auditing.
- **Monitoring Dashboard**: A dedicated UI for visualizing system health, performance, and alerts.

## 🛠️ **Tech Stack**

- **Backend**: Flask, SQLAlchemy, Flask-JWT-Extended, asyncio
- **Frontend**: React 19, Vite, TailwindCSS, shadcn/ui, React Router
- **AI Models**: HuggingFace Inference Endpoints (120B & 20B), OpenRouter, OpenAI
- **Orchestration**: `make-it-heavy` multi-agent framework
- **Tools (MCP)**: Browserbase, Disco, Supabase
- **Database**: PostgreSQL
- **Deployment**: Railway, Docker, Nixpacks

## 🚀 **Getting Started**

### **Quick Setup (Recommended)**
```bash
git clone https://github.com/GaryOcean428/crazy-gary.git
cd crazy-gary

# Automated development environment setup
npm run setup
```

### **Prerequisites (for manual setup)**
- Python 3.10+
- Node.js 18+
- Docker
- Railway CLI (optional, for deployment)

### **1. Clone the Repository**
```bash
git clone https://github.com/GaryOcean428/crazy-gary.git
cd crazy-gary
```

### **2. Set Up Environment Variables**
Copy the example environment file and fill in your API keys and configuration details:
```bash
cp .env.example .env
```

Key variables to configure:
- `SECRET_KEY` & `JWT_SECRET_KEY`
- `DATABASE_URL` (if not using Railway)
- `HUGGINGFACE_API_TOKEN` & endpoint URLs
- `OPENAI_API_KEY`
- `OPENROUTER_API_KEY`
- MCP service keys (Browserbase, Disco, Supabase)

### **3. Install Dependencies**

**Backend (Flask):**
```bash
cd apps/api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Frontend (React):**
```bash
cd apps/web
pnpm install
```

### **4. Run the Application**

**Start the Backend API:**
```bash
cd apps/api
source venv/bin/activate
python src/main.py
```
The API will be available at `http://localhost:3000`.

**Start the Frontend UI:**
```bash
cd apps/web
pnpm run dev
```
The frontend will be available at `http://localhost:5173`.

### **5. Create a User Account**
Navigate to `http://localhost:5173/register` to create your first user account.

## 🛠️ **Developer Tools**

Crazy-Gary includes comprehensive developer tools for quality assurance and optimization:

### **Quality Assurance**
```bash
npm run lint         # Code linting (0 errors enforced)
npm run type-check   # TypeScript compilation
npm run test         # Full test suite
npm run pre-commit   # Complete quality check
```

### **Performance Optimization**
```bash
npm run performance  # Bundle analysis & optimization tips
npm run build        # Production build with metrics
```

### **Security & Audit**
```bash
npm run security     # Security setup & audit
npm run audit        # Dependency vulnerability scan
```

### **Development Setup**
```bash
npm run setup        # Automated environment setup
npm run clean        # Clean build artifacts
npm run format       # Code formatting
```

## 📊 **Quality Metrics**

- **✅ Zero Linting Errors**: Strict code quality enforcement
- **✅ 100% Build Success**: All packages build cleanly
- **✅ TypeScript Compliance**: Full type safety
- **✅ Performance Optimized**: <500KB main bundle
- **✅ Security Hardened**: Comprehensive security measures

- **Agent Chat**: Interact with the single-agent system for straightforward tasks.
- **Heavy Mode**: Use the multi-agent orchestration for complex research and analysis.
- **Task Manager**: Monitor the progress of all active and completed tasks.
- **Model Control**: Manage your HuggingFace model endpoints to control costs.
- **MCP Tools**: Explore the available tools for web automation, development, and database tasks.

## 🚢 **Deployment**

This project is optimized for deployment on **Railway**. 

> **🔥 NEW: Railway Deployment Master Cheat Sheet!**  
> **📖 See [RAILWAY_DEPLOYMENT_CHEAT_SHEET.md](./RAILWAY_DEPLOYMENT_CHEAT_SHEET.md) for comprehensive troubleshooting of the 6 most common Railway deployment issues and their solutions.**

A comprehensive deployment guide is available in `RAILWAY_DEPLOYMENT.md`.

Key steps:
1. Connect your GitHub repository to a new Railway project.
2. Set the root directory of the service to `apps/api`.
3. Add a PostgreSQL database service.
4. Configure all required environment variables in the Railway dashboard.

Railway will automatically build and deploy the application using the provided `railpack.json` configurations.

## 📖 **Usage**

A complete testing checklist is available in `TESTING_CHECKLIST.md`. To run the automated tests:

```bash
cd tests
pytest
```

## 🗺️ **Roadmap**

Crazy-Gary follows a structured three-quarter roadmap focused on building a production-ready autonomous AI platform:

### **Q1 - Foundations & Reliability** 🏗️
- **Architecture**: Full A2A AgentCard + MCP integration
- **Deployment**: Rock-solid Railway configs with health checks
- **Developer Experience**: Yarn workspace constraints, immutable installs, preview environments
- **UI/UX**: Enhanced Task Manager, skeleton loaders, keyboard shortcuts
- **Security**: Hardened sessions, audit logs, secrets scanning

### **Q2 - Intelligence & Advanced Features** 🧠
- **MCP Expansion**: Supabase and Slack connectors, tool consent flows
- **Orchestration**: QuerySkill() for dynamic discovery, push notification webhooks
- **Advanced UI/UX**: Heavy Mode enhancements, undo/redo, accessibility themes
- **Observability**: Railway logs integration, session replay, comprehensive testing
- **Testing**: Visual regression, chaos testing, accessibility CI

### **Q3 - Growth, Adoption & Monetization** 📈
- **AI Differentiation**: Semantic search, anomaly detection, personalization
- **Growth Features**: Multi-tenant workspaces, public sharing, weekly recaps
- **Monetization**: Tiered plans (Free/Pro/Enterprise), usage dashboards, soft-gate upsells
- **Community**: In-app changelog, contributor guide, developer API docs

**📋 Detailed Roadmap**: See [`docs/ROADMAP_IMPLEMENTATION.md`](docs/ROADMAP_IMPLEMENTATION.md) for complete implementation details and issue tracking.

## 🤝 **Contributing**

We welcome contributions! Our roadmap provides clear opportunities to contribute across all skill levels.

### **Getting Started**
1. Review the [Developer Guide](docs/DEVELOPER_GUIDE.md)
2. Check our [Roadmap Implementation](docs/ROADMAP_IMPLEMENTATION.md) for current priorities
3. Look for issues labeled `good-first-issue` or your preferred quarter (`q1`, `q2`, `q3`)

### **Contribution Process**
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes following our coding standards.
4. Add tests for new functionality.
5. Ensure all quality checks pass (`npm run pre-commit`).
6. Commit your changes (`git commit -m 'Add some feature'`).
7. Push to the branch (`git push origin feature/your-feature`).
8. Open a pull request with a clear description.

### **Issue Templates**
We provide templates for different types of contributions:
- **[Epic]**: Large features spanning multiple issues
- **[Feature]**: New functionality requests
- **[Bug]**: Bug reports with reproduction steps
- **[Deploy]**: Infrastructure and deployment issues

### **Development Standards**
- **Code Quality**: Zero linting errors enforced
- **Testing**: Comprehensive test coverage required
- **Documentation**: All features must be documented
- **Accessibility**: WCAG compliance for UI changes
- **Security**: Security review for authentication/authorization changes

## 🛡️ **Quality Gates & Pre-commit Hooks**

Crazy Gary includes a comprehensive quality gates system with enhanced pre-commit hooks to maintain code quality, security, and development standards.

### **🚀 Quick Start**

```bash
# Install quality gates
npm run hooks:install:enhanced

# Check status
npm run quality:summary

# Run quality gates manually
npm run quality:pre-commit
```

### **✨ Features**

#### **Pre-commit Hooks** (< 30 seconds)
- ✅ **TypeScript Compilation** - Type safety validation
- ✅ **ESLint Validation** - Code quality with auto-fix
- ✅ **Prettier Formatting** - Code formatting consistency
- ✅ **Code Duplication Analysis** - jscpd integration
- ✅ **Security Scanning** - Pattern-based security checks
- ✅ **Test Execution** - Conditional test running
- ✅ **Complexity Analysis** - Cyclomatic complexity checking
- ✅ **File Size Validation** - Performance impact assessment
- ✅ **Spell Checking** - cspell integration

#### **Commit Message Validation**
- ✅ **Conventional Commits** - Format enforcement
- ✅ **Type Validation** - feat, fix, docs, style, etc.
- ✅ **Subject Length Limits** - 50 characters maximum
- ✅ **Breaking Change Detection** - Automatic identification

#### **Pre-push Hooks** (2-5 minutes)
- ✅ **Full Build Validation** - Production build testing
- ✅ **Complete Test Suite** - All tests with coverage
- ✅ **Security Audit** - npm audit with severity levels
- ✅ **Performance Analysis** - Bundle size validation
- ✅ **Documentation Generation** - Automated updates

### **📊 Quality Standards**

| Metric | Threshold | Purpose |
|--------|-----------|---------|
| **Code Coverage** | ≥ 80% lines, ≥ 75% branches | Maintain test quality |
| **Cyclomatic Complexity** | ≤ 10 | Keep code maintainable |
| **Code Duplication** | ≤ 5% | Reduce maintenance overhead |
| **Hook Execution Time** | ≤ 30 seconds | Maintain development flow |
| **Security Audit Level** | Moderate | Balance security vs. usability |

### **🛠️ Available Scripts**

```bash
# Quality Gates
npm run quality:pre-commit         # Run pre-commit checks
npm run quality:pre-commit:enhanced # Enhanced version (faster)
npm run quality:pre-push           # Run pre-push checks
npm run quality:full               # Run all quality checks
npm run quality:fast               # Quick quality check
npm run quality:validate           # Validate installation
npm run quality:benchmark          # Performance benchmarks
npm run quality:summary            # System overview

# Security
npm run security:scan              # Basic security scan
npm run security:scan:enhanced     # Comprehensive scan
npm run security:report            # Generate report

# Documentation
npm run docs:generate              # Generate docs
npm run docs:generate:enhanced     # Enhanced docs
npm run docs:report                # Quality report

# Hook Management
npm run hooks:install:enhanced     # Install enhanced hooks
npm run hooks:status               # Check status
npm run quality:manager            # Quality gate manager
```

### **⚙️ Configuration**

The system uses `.quality-gates.json` for configuration:

```json
{
  "performance": {
    "maxHookExecutionTime": 30,
    "fastMode": true,
    "parallelJobs": 4
  },
  "coverage": {
    "minimumLineCoverage": 80,
    "minimumBranchCoverage": 75
  },
  "security": {
    "auditLevel": "moderate",
    "blockOnHighSeverity": true
  }
}
```

### **🔧 Advanced Features**

#### **Performance Optimization**
- **Fast Mode**: Optimized for speed
- **Parallel Processing**: Multi-threaded execution
- **Smart Caching**: ESLint and Prettier caching
- **Conditional Execution**: Run only necessary checks

#### **Security Scanning**
- **Secret Detection**: Hardcoded credentials
- **Vulnerability Scanning**: Dependency analysis
- **Pattern Matching**: SQL injection, XSS detection
- **Security Headers**: Configuration validation

#### **Documentation Generation**
- **API Docs**: TypeScript documentation
- **Component Docs**: React component catalog
- **Process Docs**: Development workflow
- **Quality Reports**: Metrics and trends

### **📚 Documentation**

- **[Setup Guide](PRE_COMMIT_HOOKS_SETUP.md)** - Comprehensive setup instructions
- **[Hooks Documentation](docs/hooks/README.md)** - Detailed hook information
- **[Quality Gates Guide](docs/quality-gates/README.md)** - Quality system details
- **[Development Process](docs/development/README.md)** - Workflow guidelines

### **🎯 Best Practices**

#### **For Developers**
- Keep commits focused and small (< 50 files)
- Write descriptive commit messages
- Run quality gates locally before committing
- Monitor performance metrics

#### **For Teams**
- Establish team quality standards
- Regular configuration reviews
- Performance monitoring
- Continuous improvement

### **🆘 Troubleshooting**

```bash
# Check installation
npm run quality:validate

# Diagnose issues
bash scripts/quality-gate-manager.sh validate

# Reinstall hooks
npm run hooks:install:enhanced

# Clean cache
rm -rf .eslintcache node_modules/.vite
```

The quality gates system ensures that all code meets our high standards for quality, security, and maintainability while keeping the development process fast and efficient.

## 📄 **License**

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🌟 **Acknowledgments**

- The `make-it-heavy` framework for providing the powerful multi-agent orchestration engine.
- The teams behind Railway, HuggingFace, and the MCP ecosystem for their incredible tools and services.

---

*This project was built by Manus AI, an autonomous agentic AI system.*


# ✅ New Developer Setup Checklist

**Complete this checklist to ensure you're ready to contribute to Crazy-Gary**

## 📋 Pre-Setup Requirements

### System Requirements
- [ ] **Node.js 18+** installed and verified (`node --version`)
- [ ] **Python 3.10+** installed and verified (`python --version`)
- [ ] **Docker** installed and running (`docker --version`)
- [ ] **Git** installed and configured (`git --version`)
- [ ] **PostgreSQL** installed and running (or using Docker)

### Tools & Accounts
- [ ] **GitHub account** with access to the repository
- [ ] **Railway account** for deployment management
- [ ] **VS Code** (recommended) with suggested extensions
- [ ] **Postman** (recommended) for API testing

---

## 🛠️ Development Environment Setup

### 1. Repository Setup
- [ ] Clone the repository: `git clone https://github.com/GaryOcean428/crazy-gary.git`
- [ ] Navigate to project: `cd crazy-gary`
- [ ] Verify you're in the right directory: `ls` (should see package.json)

### 2. Automated Setup
- [ ] Run automated setup: `npm run setup`
- [ ] Wait for installation to complete (may take 5-10 minutes)
- [ ] Verify no errors during installation

### 3. Environment Configuration
- [ ] Copy environment file: `cp .env.example .env`
- [ ] Open `.env` in your editor
- [ ] **Required variables to configure:**
  - [ ] `SECRET_KEY` - Generate a secure random key
  - [ ] `JWT_SECRET_KEY` - Generate a secure random key
  - [ ] `DATABASE_URL` - PostgreSQL connection string
  - [ ] `HUGGINGFACE_API_KEY` - Your HuggingFace API key
  - [ ] `HF_BASE_URL_120B` - Your 120B model endpoint
  - [ ] `HF_BASE_URL_20B` - Your 20B model endpoint

### 4. Quality Gates Setup
- [ ] Install pre-commit hooks: `npm run hooks:install:enhanced`
- [ ] Validate installation: `npm run quality:validate`
- [ ] Verify hooks are active: `npm run hooks:status`

---

## 🚀 Development Server Verification

### 1. Start Development Servers
- [ ] Start all services: `npm run dev`
- [ ] Wait for all services to start (should take 1-2 minutes)
- [ ] Verify no error messages in console

### 2. Frontend Verification
- [ ] Open browser to `http://localhost:5173`
- [ ] Verify the Crazy-Gary homepage loads
- [ ] Check browser console for JavaScript errors (F12 → Console)

### 3. Backend Verification
- [ ] Test API health: `curl http://localhost:3000/health`
- [ ] Verify response: Should return `{"status": "healthy"}`
- [ ] Check API docs: `http://localhost:3000/docs` (if available)

### 4. Database Verification
- [ ] Register a new user account via the UI
- [ ] Verify you can log in successfully
- [ ] Check that user data persists after page refresh

---

## 🧪 Testing Environment

### 1. Run Test Suite
- [ ] Run full test suite: `npm run test`
- [ ] Verify all tests pass (should see green checkmarks)
- [ ] Check test coverage: `npm run test:coverage`
- [ ] Verify coverage meets minimum requirements (>75%)

### 2. Quality Gates
- [ ] Run quality checks: `npm run quality:pre-commit`
- [ ] Verify all checks pass (TypeScript, ESLint, Prettier, etc.)
- [ ] If any checks fail, fix issues and run again

### 3. Security Scanning
- [ ] Run security scan: `npm run security:scan`
- [ ] Verify no critical security issues
- [ ] Check dependency audit: `npm audit`

---

## 🔧 IDE & Tool Configuration

### 1. VS Code Setup (if using VS Code)
- [ ] Install recommended extensions:
  - [ ] Python
  - [ ] Tailwind CSS IntelliSense
  - [ ] Prettier
  - [ ] ESLint
  - [ ] TypeScript Hero
- [ ] Configure settings:
  - [ ] Enable format on save
  - [ ] Enable ESLint
  - [ ] Set TypeScript version to workspace

### 2. Git Configuration
- [ ] Set your name: `git config --global user.name "Your Name"`
- [ ] Set your email: `git config --global user.email "your.email@company.com"`
- [ ] Configure default branch name: `git config --global init.defaultBranch main`

### 3. Shell Configuration
- [ ] Add useful aliases (optional):
  ```bash
  alias dev='npm run dev'
  alias test='npm run test'
  alias quality='npm run quality:pre-commit'
  ```

---

## 📚 Documentation Review

### 1. Key Documentation
- [ ] Read the [Developer Onboarding Guide](./DEVELOPER_ONBOARDING_GUIDE.md)
- [ ] Bookmark the [Quick Reference Guide](./DEVELOPER_QUICK_REFERENCE.md)
- [ ] Review the [Project README](../README.md)
- [ ] Check the [API Documentation](./API.md)

### 2. Architecture Understanding
- [ ] Understand the project structure:
  - [ ] `apps/web` - Frontend React application
  - [ ] `apps/api` - Backend Flask API
  - [ ] `packages/` - Shared packages and utilities
  - [ ] `docs/` - Project documentation
  - [ ] `tests/` - Test suites

### 3. Development Workflow
- [ ] Understand the Git workflow and branching strategy
- [ ] Know how to create feature branches
- [ ] Understand the commit message format
- [ ] Know how to create and handle pull requests

---

## 🏗️ First Development Task

### 1. Choose Your First Task
- [ ] Look for issues labeled `good-first-issue`
- [ ] Review the current [roadmap](./ROADMAP_IMPLEMENTATION.md)
- [ ] Choose a task that interests you

### 2. Create Feature Branch
- [ ] Create new branch: `git checkout -b feature/your-first-feature`
- [ ] Set upstream: `git push -u origin feature/your-first-feature`

### 3. Make Your Changes
- [ ] Implement your feature following coding standards
- [ ] Write tests for new functionality
- [ ] Update documentation if needed

### 4. Quality Checks
- [ ] Run quality gates: `npm run quality:pre-commit`
- [ ] Run tests: `npm run test`
- [ ] Test manually in the browser
- [ ] Check for any linting or formatting issues

### 5. Submit Pull Request
- [ ] Commit your changes with proper message format
- [ ] Push to your branch: `git push origin feature/your-first-feature`
- [ ] Create pull request with clear description
- [ ] Request review from team members

---

## 🎯 Success Verification

### Functional Checks
- [ ] **Development environment** works smoothly
- [ ] **All tests pass** without issues
- [ ] **Quality gates** pass consistently
- [ ] **You can create** and complete a simple task
- [ ] **You understand** the basic project structure

### Knowledge Checks
- [ ] **You know** how to start development servers
- [ ] **You know** how to run tests and quality checks
- [ ] **You understand** the Git workflow
- [ ] **You can find** answers in documentation
- [ ] **You know** how to get help when stuck

### Integration Checks
- [ ] **You have access** to all necessary tools and accounts
- [ ] **Your IDE** is properly configured
- [ ] **Your environment** matches the team's standard setup
- [ ] **You can deploy** to staging environment
- [ ] **You understand** the project's goals and architecture

---

## 🆘 If You Get Stuck

### Quick Fixes
1. **Restart everything**: `npm run clean && npm install && npm run dev`
2. **Check the logs**: Look for error messages in terminal or browser console
3. **Verify environment**: Ensure all required variables are set in `.env`
4. **Update dependencies**: `npm update` and `pip install -r requirements.txt`

### Get Help
- [ ] **Slack channels**: #dev-help, #backend, #frontend
- [ ] **Office hours**: Monday/Wednesday 2-3 PM, Friday 1-2 PM
- [ ] **Documentation**: Check the full onboarding guide first
- [ ] **Team members**: Don't hesitate to ask questions

### Escalation
If you've been stuck for more than 2 hours:
1. Document what you've tried
2. Collect error messages and logs
3. Ask for help in #dev-help with full details
4. Schedule time with a senior developer if needed

---

## 🎉 Congratulations!

**If you've completed this checklist, you're ready to start contributing to Crazy-Gary!**

### Next Steps
1. **Pick your first real feature** to implement
2. **Start participating** in code reviews
3. **Join team discussions** about architecture and features
4. **Help improve** documentation and processes
5. **Have fun** building amazing AI agent capabilities!

### Quick Links
- [📖 Full Onboarding Guide](./DEVELOPER_ONBOARDING_GUIDE.md)
- [⚡ Quick Reference](./DEVELOPER_QUICK_REFERENCE.md)
- [🎯 Project Roadmap](./ROADMAP_IMPLEMENTATION.md)
- [📚 All Documentation](./README.md#documentation)

---

**Remember**: Every expert was once a beginner. Don't hesitate to ask questions and take your time to understand the codebase. Welcome to the team! 🚀

*Checklist version: 1.0 | Last updated: December 17, 2025*
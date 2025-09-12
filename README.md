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

### **Prerequisites**
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

## 📖 **Usage**

- **Agent Chat**: Interact with the single-agent system for straightforward tasks.
- **Heavy Mode**: Use the multi-agent orchestration for complex research and analysis.
- **Task Manager**: Monitor the progress of all active and completed tasks.
- **Model Control**: Manage your HuggingFace model endpoints to control costs.
- **MCP Tools**: Explore the available tools for web automation, development, and database tasks.

## 🚢 **Deployment**

This project is optimized for deployment on **Railway**. A comprehensive deployment guide is available in `RAILWAY_DEPLOYMENT.md`.

Key steps:
1. Connect your GitHub repository to a new Railway project.
2. Set the root directory of the service to `apps/api`.
3. Add a PostgreSQL database service.
4. Configure all required environment variables in the Railway dashboard.

Railway will automatically build and deploy the application using the provided `railway.json` configuration.

## 🧪 **Testing**

A complete testing checklist is available in `TESTING_CHECKLIST.md`. To run the automated tests:

```bash
cd tests
pytest
```

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit a pull request or open an issue.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Open a pull request.

## 📄 **License**

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🌟 **Acknowledgments**

- The `make-it-heavy` framework for providing the powerful multi-agent orchestration engine.
- The teams behind Railway, HuggingFace, and the MCP ecosystem for their incredible tools and services.

---

*This project was built by Manus AI, an autonomous agentic AI system.*


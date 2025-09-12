# 📖 Crazy-Gary User Guide

Welcome to Crazy-Gary! This guide will walk you through everything you need to know to use the platform effectively.

## 🚀 **Getting Started**

### **1. Creating Your Account**
1. Navigate to the **Register** page.
2. Fill in your name, email, and a secure password.
3. Click **Create Account**.

### **2. Logging In**
1. Go to the **Login** page.
2. Enter your email and password.
3. Click **Sign In**.

## 🤖 **Interacting with the Agent**

### **Agent Chat (Single-Agent Mode)**
Use the **Agent Chat** for straightforward, single-step tasks.

1. **Go to Agent Chat**: Click the chat icon in the sidebar.
2. **Enter Your Goal**: Describe what you want the agent to do in the input box.
3. **Select a Model**: Choose between the 120B (more powerful) or 20B (faster) model.
4. **Send the Task**: The agent will immediately start working on your request.
5. **View Progress**: Real-time updates will appear in the chat window.

**Example Tasks:**
- "Write a Python script to scrape a website."
- "Summarize the latest news about climate change."
- "Translate this sentence into French: ..."

### **Heavy Mode (Multi-Agent Orchestration)**
Use **Heavy Mode** for complex, multi-faceted research and analysis tasks that benefit from multiple perspectives.

1. **Go to Heavy Mode**: Click the lightning bolt icon (⚡) in the sidebar.
2. **Enter Your Query**: Ask a complex question, like "What are the long-term economic impacts of AI?"
3. **Configure Agents**: Choose the number of specialized agents to spawn (1-8).
4. **Set Timeout**: Define how long each agent should work.
5. **Execute Task**: The orchestrator will decompose your query, assign sub-questions to each agent, and synthesize the results.
6. **Review Results**: View the final synthesized answer and the individual outputs from each agent.

## 📋 **Task Management**

The **Task Manager** provides a centralized view of all your agentic tasks.

- **Create New Tasks**: Manually create tasks with specific priorities and model settings.
- **Monitor Progress**: See the real-time status of all running tasks (Queued, Planning, Executing, Verifying, Complete).
- **View History**: Access a complete history of all your past tasks, including results and logs.
- **Task Controls**: Start, stop, or re-run tasks as needed.

## 🧠 **Model & Cost Control**

The **Model Control** dashboard gives you full control over your AI model endpoints and associated costs.

- **Wake/Sleep Endpoints**: Manually wake up or put to sleep the expensive 120B and 20B HuggingFace models to save costs.
- **Auto-Sleep Timers**: Endpoints automatically go to sleep after 15 minutes of inactivity.
- **Cost Monitoring**: Track your estimated costs in real-time based on token usage.
- **Activity Tracking**: See how often each model is being used.

## 🔧 **MCP Tools Explorer**

Discover and explore the powerful tools available to the Crazy-Gary agents.

- **Browse by Client**: View tools from Browserbase (web automation), Disco (development), and Supabase (database).
- **Search for Tools**: Find specific tools by name or description.
- **Inspect Parameters**: See what inputs each tool requires.

## ⚙️ **Settings**

Customize your Crazy-Gary experience in the **Settings** panel.

- **Theme**: Switch between dark, light, and system themes.
- **Model Preferences**: Set default models and timeouts.
- **Notification Settings**: Configure how you receive alerts.
- **Security**: Change your password and manage your account.
- **Cost Alerts**: Set up budget thresholds to receive notifications.

## 🚨 **Troubleshooting**

### **Common Issues**
- **Model Error**: If you see a "Model is not available" error, go to the **Model Control** page and wake up the required endpoint.
- **Network Error**: Ensure your internet connection is stable and that the backend API is running.
- **Task Stuck**: If a task seems stuck, try stopping and restarting it from the **Task Manager**.

### **Getting Help**
- **Check the Logs**: The backend server provides detailed logs for debugging.
- **Open an Issue**: If you encounter a bug, please open an issue on the [GitHub repository](https://github.com/GaryOcean428/crazy-gary).

---

*Enjoy using Crazy-Gary to automate your world!*


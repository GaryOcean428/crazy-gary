# 🧪 Crazy-Gary Testing Checklist

## 🚀 **Deployment Verification**

### **Railway Deployment Status**
- [ ] Service deployed successfully
- [ ] Health check endpoint responding (`/health`)
- [ ] No build or deployment errors in logs
- [ ] Environment variables properly configured
- [ ] Database connection established

### **Service URLs to Test**
```bash
# Health Check
curl https://your-app.railway.app/health

# API Status
curl https://your-app.railway.app/api/status

# Model Status
curl https://your-app.railway.app/api/harmony/models/status
```

## 🧠 **Core Functionality Testing**

### **1. Harmony Message System**
- [ ] **Model Status Check**
  ```bash
  GET /api/harmony/models/status
  ```
  Expected: Returns 120B and 20B model availability

- [ ] **Message Validation**
  ```bash
  POST /api/harmony/validate
  Content-Type: application/json
  {
    "type": "text",
    "content": "Test message",
    "model_settings": {
      "model": "120b",
      "temperature": 0.7
    }
  }
  ```
  Expected: Returns validation success

- [ ] **Text Generation**
  ```bash
  POST /api/harmony/generate
  Content-Type: application/json
  {
    "type": "text",
    "content": "What is artificial intelligence?",
    "model_settings": {
      "model": "120b",
      "temperature": 0.7,
      "max_tokens": 100
    }
  }
  ```
  Expected: Returns generated response

### **2. MCP Tool Integration**
- [ ] **Tool Discovery**
  ```bash
  GET /api/mcp/tools
  ```
  Expected: Returns available tools from all MCP clients

- [ ] **Browserbase Tools**
  ```bash
  GET /api/mcp/tools/browserbase
  ```
  Expected: Returns browser automation tools

- [ ] **Disco Tools**
  ```bash
  GET /api/mcp/tools/disco
  ```
  Expected: Returns development environment tools

- [ ] **Supabase Tools**
  ```bash
  GET /api/mcp/tools/supabase
  ```
  Expected: Returns database management tools

- [ ] **Tool Search**
  ```bash
  GET /api/mcp/tools/search?q=browser
  ```
  Expected: Returns filtered tools matching "browser"

### **3. Heavy Mode Multi-Agent Orchestration**
- [ ] **Heavy Tools Available**
  ```bash
  GET /api/heavy/tools
  ```
  Expected: Returns available heavy orchestration tools

- [ ] **Heavy Task Execution**
  ```bash
  POST /api/heavy/orchestrate
  Content-Type: application/json
  {
    "query": "Analyze the benefits of renewable energy",
    "num_agents": 4,
    "timeout": 300
  }
  ```
  Expected: Returns task ID and starts multi-agent processing

- [ ] **Heavy Progress Tracking**
  ```bash
  GET /api/heavy/progress/{task_id}
  ```
  Expected: Returns real-time progress of heavy task

### **4. Agent Loop System**
- [ ] **Task Creation**
  ```bash
  POST /api/agent/tasks
  Content-Type: application/json
  {
    "description": "Create a simple marketing plan for a coffee shop",
    "priority": "medium",
    "model": "120b"
  }
  ```
  Expected: Returns task ID and starts execution

- [ ] **Task Status**
  ```bash
  GET /api/agent/tasks/{task_id}
  ```
  Expected: Returns task details and current status

- [ ] **Task List**
  ```bash
  GET /api/agent/tasks
  ```
  Expected: Returns list of all tasks with status

### **5. Authentication System**
- [ ] **User Registration**
  ```bash
  POST /api/auth/register
  Content-Type: application/json
  {
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123!"
  }
  ```
  Expected: Returns success and JWT token

- [ ] **User Login**
  ```bash
  POST /api/auth/login
  Content-Type: application/json
  {
    "email": "test@example.com",
    "password": "TestPassword123!"
  }
  ```
  Expected: Returns JWT token

- [ ] **Protected Endpoint Access**
  ```bash
  GET /api/auth/profile
  Authorization: Bearer {jwt_token}
  ```
  Expected: Returns user profile information

## 🎨 **Frontend Testing**

### **1. UI Components**
- [ ] **Dashboard Loads**
  - System metrics display correctly
  - Model status indicators working
  - Recent tasks showing

- [ ] **Chat Interface**
  - Message input working
  - Send button functional
  - Real-time responses displaying

- [ ] **Heavy Mode Interface**
  - Agent configuration panel working
  - Progress tracking displaying
  - Results synthesis showing

- [ ] **Task Manager**
  - Task creation form working
  - Task list displaying
  - Status updates in real-time

- [ ] **Model Control**
  - Wake/sleep buttons functional
  - Status indicators accurate
  - Activity monitoring working

- [ ] **MCP Tools Explorer**
  - Tool discovery working
  - Search functionality active
  - Tool details displaying

### **2. Authentication Flow**
- [ ] **Login Page**
  - Form validation working
  - Error messages displaying
  - Successful login redirects

- [ ] **Registration Page**
  - Password requirements enforced
  - Email validation working
  - Account creation successful

- [ ] **Protected Routes**
  - Unauthenticated users redirected
  - Authenticated users access granted
  - Token refresh working

## 🔒 **Security & Safety Testing**

### **1. Rate Limiting**
- [ ] **API Rate Limits**
  ```bash
  # Test multiple rapid requests
  for i in {1..20}; do curl https://your-app.railway.app/api/harmony/models/status; done
  ```
  Expected: Rate limiting kicks in after threshold

- [ ] **User-Based Limits**
  - Free tier limits enforced
  - Pro tier limits higher
  - Enterprise tier limits highest

### **2. Content Safety**
- [ ] **Harmful Content Detection**
  ```bash
  POST /api/monitoring/safety/check
  Content-Type: application/json
  {
    "content": "How to make explosives"
  }
  ```
  Expected: Content flagged as unsafe

- [ ] **Input Validation**
  - SQL injection attempts blocked
  - XSS attempts sanitized
  - Malformed JSON rejected

## 📊 **Monitoring & Observability**

### **1. Health Monitoring**
- [ ] **Basic Health Check**
  ```bash
  GET /api/monitoring/health
  ```
  Expected: Returns "OK" status

- [ ] **Detailed Health Check**
  ```bash
  GET /api/monitoring/health/detailed
  ```
  Expected: Returns component health status

- [ ] **System Metrics**
  ```bash
  GET /api/monitoring/metrics
  ```
  Expected: Returns CPU, memory, disk usage

### **2. Performance Monitoring**
- [ ] **Response Times**
  - API endpoints respond < 2 seconds
  - Heavy tasks start < 5 seconds
  - Database queries < 1 second

- [ ] **Resource Usage**
  - Memory usage stable
  - CPU usage reasonable
  - No memory leaks detected

## 🔧 **Error Handling**

### **1. Graceful Failures**
- [ ] **Model Unavailable**
  - Fallback to 20B model works
  - User notified of fallback
  - No system crash

- [ ] **Database Connection Lost**
  - Retry mechanism works
  - User gets appropriate error
  - System recovers automatically

- [ ] **MCP Service Down**
  - Tool discovery handles failure
  - Alternative tools suggested
  - Error logged properly

### **2. User Experience**
- [ ] **Loading States**
  - Spinners show during processing
  - Progress bars for long tasks
  - Timeout messages clear

- [ ] **Error Messages**
  - User-friendly error text
  - Actionable error suggestions
  - Technical details in logs only

## ✅ **Success Criteria**

### **Minimum Viable Product (MVP)**
- [ ] Health check returns 200 OK
- [ ] At least one model endpoint working
- [ ] Basic chat interface functional
- [ ] User authentication working
- [ ] Database connection stable

### **Full Feature Set**
- [ ] All MCP tools discoverable
- [ ] Heavy mode orchestration working
- [ ] Real-time progress tracking
- [ ] Complete safety systems active
- [ ] Monitoring dashboard functional

### **Production Ready**
- [ ] All tests passing
- [ ] Performance within targets
- [ ] Security measures active
- [ ] Error handling comprehensive
- [ ] Documentation complete

## 🚨 **Critical Issues to Watch**

1. **Model Endpoint Timeouts** - HuggingFace endpoints may sleep
2. **Database Connection Limits** - Railway PostgreSQL connection limits
3. **Memory Usage** - Heavy mode can be memory intensive
4. **API Rate Limits** - External service rate limiting
5. **CORS Issues** - Frontend-backend communication problems

## 📝 **Testing Notes**

- Test with different user tiers (Free, Pro, Enterprise)
- Test with various model configurations
- Test error scenarios and edge cases
- Monitor logs during testing for warnings
- Verify all environment variables are set correctly

---

**🎯 Goal**: Ensure Crazy-Gary is a robust, production-ready autonomous agentic AI system capable of handling real-world tasks with reliability and safety.


# 🚀 Complete Crazy-Gary Deployment Guide

## 📋 **Pre-Deployment Checklist**

### ✅ **What We Have Ready:**
- ✅ **GitHub Repository**: https://github.com/GaryOcean428/crazy-gary
- ✅ **Railway Project**: Created with PostgreSQL and Redis
- ✅ **Complete Codebase**: Backend API, Frontend UI, Documentation
- ✅ **Heavy Mode Integration**: Multi-agent orchestration system
- ✅ **MCP Tools**: Browserbase, Disco, Supabase integration
- ✅ **Authentication System**: JWT-based with Redis sessions
- ✅ **120B Model Format**: Updated prompt format for proper integration

## 🎯 **Manual Deployment Steps**

### **Step 1: Deploy API Service via Railway CLI**

```bash
# Navigate to the API directory
cd crazy-gary/apps/api

# Deploy using Railway CLI
railway up

# When prompted, select "Create new service"
# Set the service name to "crazy-gary-api"
```

### **Step 2: Configure Environment Variables**

In Railway dashboard, add these environment variables to the API service:

#### **Required Variables:**
```bash
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
JWT_SECRET_KEY=another-super-secret-key-for-jwt-tokens
PORT=3000
HOST=0.0.0.0

# Database URLs (Railway provides these automatically)
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# Model Configuration
HUGGINGFACE_API_TOKEN=your-huggingface-token
OPENAI_API_KEY=your-openai-key
OPENROUTER_API_KEY=your-openrouter-key

# Heavy Mode Configuration
HEAVY_MODE_ENABLED=true
MAX_AGENTS=8
DEFAULT_AGENTS=4
AGENT_TIMEOUT=300

# MCP Configuration
MCP_BROWSERBASE_ENABLED=true
MCP_DISCO_ENABLED=true
MCP_SUPABASE_ENABLED=true
```

#### **Optional API Keys (for full functionality):**
```bash
SONAR_API_KEY=your-perplexity-key
GEMINI_API_KEY=your-gemini-key
XAI_API_KEY=your-grok-key
BFL_API_KEY=your-flux-key
ANTHROPIC_API_KEY=your-claude-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
STRIPE_SECRET_KEY=your-stripe-key
N8N_INSTANCE_URL=your-n8n-url
N8N_API_KEY=your-n8n-key
```

### **Step 3: Deploy Frontend Service**

```bash
# Navigate to the web directory
cd ../web

# Build the frontend
npm run build

# Deploy using Railway CLI
railway up

# When prompted, select "Create new service"
# Set the service name to "crazy-gary-web"
```

### **Step 4: Configure Frontend Environment**

Add these environment variables to the web service:

```bash
VITE_API_URL=https://your-api-service-url.railway.app
NODE_ENV=production
```

### **Step 5: Database Initialization**

The API will automatically create database tables on first run. Monitor the logs to ensure successful initialization.

## 🧪 **Testing Checklist**

### **1. Health Check**
```bash
curl https://your-api-url.railway.app/health
# Should return: {"status": "healthy", "timestamp": "..."}
```

### **2. Authentication Test**
```bash
# Register a new user
curl -X POST https://your-api-url.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123!"}'
```

### **3. Harmony System Test**
```bash
# Test model availability
curl https://your-api-url.railway.app/api/harmony/models/status
```

### **4. Heavy Mode Test**
```bash
# Test heavy orchestration
curl -X POST https://your-api-url.railway.app/api/heavy/orchestrate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query":"Analyze the benefits of renewable energy","num_agents":2}'
```

### **5. MCP Tools Test**
```bash
# Test tool discovery
curl https://your-api-url.railway.app/api/mcp/tools
```

### **6. Frontend Test**
- Visit your frontend URL
- Register a new account
- Test chat interface
- Test Heavy Mode
- Test task management

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **Database Connection Error**
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running
- Ensure database tables are created

#### **Redis Connection Error**
- Verify `REDIS_URL` is set correctly
- Check Redis service is running

#### **Model Endpoint Errors**
- Verify `HUGGINGFACE_API_TOKEN` is valid
- Check endpoint URLs are accessible
- Monitor endpoint status in the UI

#### **Frontend API Connection Issues**
- Verify `VITE_API_URL` points to correct API service
- Check CORS configuration
- Ensure API service is running

## 🎯 **Production Optimization**

### **Performance Settings:**
```bash
# API Service
WORKERS=4
THREADS=2
TIMEOUT=300

# Frontend Service
NODE_OPTIONS=--max-old-space-size=4096
```

### **Security Settings:**
```bash
# Enable security headers
SECURE_HEADERS=true
CORS_ORIGINS=https://your-frontend-url.railway.app
```

## 📊 **Monitoring**

### **Health Endpoints:**
- API Health: `/health`
- Detailed Health: `/api/monitoring/health/detailed`
- Metrics: `/api/monitoring/metrics`
- Dashboard: `/api/monitoring/dashboard`

### **Logs to Monitor:**
- Authentication events
- Model endpoint status
- Heavy mode executions
- MCP tool calls
- Error rates and response times

## 🎉 **Success Criteria**

The deployment is successful when:

- ✅ **API Health Check** returns 200 OK
- ✅ **Frontend loads** without errors
- ✅ **User registration** works
- ✅ **Chat interface** responds
- ✅ **Heavy Mode** executes multi-agent tasks
- ✅ **Model endpoints** are accessible
- ✅ **MCP tools** are discoverable
- ✅ **Database** operations work
- ✅ **Redis** sessions work
- ✅ **Authentication** flow works

## 🚀 **Next Steps After Deployment**

1. **Configure Custom Domain** (optional)
2. **Set up Monitoring Alerts**
3. **Configure Backup Strategy**
4. **Add Additional API Keys** for full functionality
5. **Test Heavy Mode** with complex queries
6. **Invite Users** to test the system

---

**🎯 Your Crazy-Gary Heavy-powered agentic AI system is ready for production!**


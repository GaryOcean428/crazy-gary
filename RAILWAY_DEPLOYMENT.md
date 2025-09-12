# 🚀 Railway Deployment Guide for Crazy-Gary

## 📋 **Step-by-Step Deployment Process**

### **1. Create New Project**
1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub Repo"
3. Choose `GaryOcean428/crazy-gary` repository
4. Select `main` branch

### **2. Configure Backend Service**

#### **Service Settings:**
- **Name**: `crazy-gary-api`
- **Root Directory**: `apps/api`
- **Start Command**: `python src/main.py`
- **Port**: `3000`

#### **Build Settings:**
- **Builder**: Nixpacks (auto-detected)
- **Build Command**: `pip install -r requirements.txt`

### **3. Environment Variables**

Add these environment variables to the backend service:

```bash
# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your-super-secret-production-key-here
PORT=3000
HOST=0.0.0.0

# Database (will be auto-configured when you add PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}
SQLALCHEMY_DATABASE_URI=${{Postgres.DATABASE_URL}}

# HuggingFace Configuration
HUGGINGFACE_API_TOKEN=your-huggingface-token
HUGGINGFACE_120B_ENDPOINT=https://your-120b-endpoint.endpoints.huggingface.cloud
HUGGINGFACE_20B_ENDPOINT=https://your-20b-endpoint.endpoints.huggingface.cloud

# OpenAI Configuration (for Heavy Mode)
OPENAI_API_KEY=your-openai-api-key
OPENAI_API_BASE=https://api.openai.com/v1

# OpenRouter Configuration
OPENROUTER_API_KEY=your-openrouter-api-key

# MCP Configuration
MCP_BROWSERBASE_API_KEY=your-browserbase-api-key
MCP_DISCO_API_KEY=your-disco-api-key

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key

# GitHub Configuration
GITHUB_TOKEN=your-github-token
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_USERNAME=GaryOcean428
GITHUB_USEREMAIL=braden.lang77@gmail.com

# Google Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Security Configuration
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ACCESS_TOKEN_EXPIRES=86400

# CORS Configuration
CORS_ORIGINS=*

# Rate Limiting
RATE_LIMIT_STORAGE_URL=memory://

# Monitoring
LOG_LEVEL=INFO
ENABLE_METRICS=true
```

### **4. Add Database Service**
1. Click "Add Service" in your project
2. Select "Database" → "PostgreSQL"
3. Name it `crazy-gary-db`
4. The `DATABASE_URL` will be automatically available as `${{Postgres.DATABASE_URL}}`

### **5. Deploy Frontend (Optional)**
If you want to deploy the frontend separately:

1. Add another service
2. **Root Directory**: `apps/web`
3. **Build Command**: `npm run build`
4. **Start Command**: `npm run preview`
5. **Environment Variables**:
   ```bash
   VITE_API_URL=${{crazy-gary-api.RAILWAY_PUBLIC_DOMAIN}}
   NODE_ENV=production
   ```

### **6. Health Check Configuration**
Railway will automatically detect the health check endpoint at `/health`

### **7. Custom Domain (Optional)**
1. Go to service settings
2. Click "Domains"
3. Add your custom domain
4. Configure DNS records as shown

## 🔧 **Post-Deployment Configuration**

### **Database Initialization**
The Flask app will automatically create database tables on first run.

### **Model Endpoints**
Configure your HuggingFace inference endpoints:
1. Go to HuggingFace Inference Endpoints
2. Deploy your 120B and 20B models
3. Copy the endpoint URLs to Railway environment variables

### **MCP Services**
Configure your MCP service API keys:
- **Browserbase**: Get API key from browserbase.com
- **Disco**: Get API key from your disco service
- **Supabase**: Use your existing Supabase project credentials

## 🚀 **Testing Deployment**

1. **Health Check**: Visit `https://your-app.railway.app/health`
2. **API Endpoints**: Test `/api/harmony/models/status`
3. **Heavy Mode**: Test `/api/heavy/tools`
4. **Frontend**: If deployed, test the full UI

## 🔍 **Monitoring**

- **Logs**: Check Railway logs for any errors
- **Metrics**: Monitor CPU, memory, and network usage
- **Health**: Use the `/api/monitoring/health/detailed` endpoint

## 🛠️ **Troubleshooting**

### **Common Issues:**
1. **Build Failures**: Check that `requirements.txt` is in the root
2. **Port Issues**: Ensure `PORT=3000` and `HOST=0.0.0.0`
3. **Database Errors**: Verify `DATABASE_URL` is set correctly
4. **API Key Errors**: Check all environment variables are set

### **Logs to Check:**
- Build logs for dependency installation issues
- Deploy logs for startup problems
- Runtime logs for application errors

## 🎯 **Success Indicators**

✅ **Deployment Successful** when you see:
- Health check returns 200 OK
- API endpoints respond correctly
- Database connection established
- Heavy orchestration tools available
- MCP clients connected

Your Crazy-Gary Heavy-powered agentic AI system will be live and ready for autonomous task execution!


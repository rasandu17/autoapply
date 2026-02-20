# 🚀 Deployment Guide - AutoApply AI on Vercel

This guide will help you deploy both the **frontend** and **backend** of AutoApply AI on **Vercel** for free.

---

## 📋 Prerequisites

Before deploying, make sure you have:

1. **GitHub Account** (to connect with Vercel)
2. **Vercel Account** (sign up at [vercel.com](https://vercel.com))
3. **Environment Variables Ready**:
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `EMAIL_USER` - Your email address (for sending applications)
   - `EMAIL_PASS` - Your email app password
   - `OPENAI_API_KEY` - (Optional) If using OpenAI

---

## 🔧 Step 1: Prepare Your Repository

### 1.1 Push to GitHub

If you haven't already, push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit - AutoApply AI"
git remote add origin https://github.com/YOUR_USERNAME/autoapply.git
git push -u origin main
```

### 1.2 Verify Project Structure

Make sure your project has this structure:

```
autoapply/
├── api/                    # ✅ Serverless functions
│   ├── analyze.js
│   ├── health.js
│   ├── send-email.js
│   └── package.json
├── backend/               # ✅ Shared backend services
│   ├── geminiService.js
│   ├── emailService.js
│   ├── ocrService.js
│   └── package.json
├── frontend/             # ✅ React Vite app
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── vercel.json          # ✅ Vercel configuration
```

---

## 🌐 Step 2: Deploy to Vercel

### 2.1 Sign Up & Connect GitHub

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** → Choose **"Continue with GitHub"**
3. Authorize Vercel to access your repositories

### 2.2 Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find your `autoapply` repository
3. Click **"Import"**

### 2.3 Configure Build Settings

Vercel should auto-detect settings, but verify:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `./` (Leave empty or select root) |
| **Build Command** | `cd frontend && npm install && npm run build` |
| **Output Directory** | `frontend/dist` |
| **Install Command** | Auto-detected |

### 2.4 Add Environment Variables

Click **"Environment Variables"** and add these:

```
GEMINI_API_KEY=your_gemini_api_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
```

**Important**: 
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password
- Get Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2.5 Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://autoapply-xyz123.vercel.app`

---

## ✅ Step 3: Verify Deployment

### 3.1 Test Health Endpoint

Open in browser:
```
https://your-project.vercel.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "AutoApply AI Backend Running on Vercel"
}
```

### 3.2 Test Frontend

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Try uploading a job description
3. Check if AI analysis works

---

## 🔄 Step 4: Update & Redeploy

Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update: improved UI"
git push

# Vercel will auto-deploy! 🚀
```

---

## 🐛 Troubleshooting

### Issue: API calls failing (CORS errors)

**Solution**: CORS headers are already configured in the serverless functions (`api/analyze.js`, `api/send-email.js`)

### Issue: "Function timeout" error

**Cause**: Vercel free tier has 10-second timeout  
**Solution**: 
- Optimize image size before OCR
- Use caching for Gemini responses
- Upgrade to Vercel Pro for 60s timeout (if needed)

### Issue: Environment variables not working

**Solution**:
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Re-add all variables
3. Redeploy: **Deployments** → Click **"Redeploy"** on latest deployment

### Issue: 500 Internal Server Error

**Solution**:
1. Check Vercel logs: Dashboard → Your Project → **Logs**
2. Verify all dependencies are in `api/package.json`
3. Check API keys are correct

---

## 📊 Monitoring & Logs

### View Logs
1. Go to Vercel Dashboard
2. Click your project
3. Click **"Logs"** tab
4. Filter by function (e.g., `/api/analyze`)

### Check Usage
1. Dashboard → **Analytics**
2. Monitor function invocations, bandwidth

---

## 💰 Free Tier Limits

| Feature | Limit |
|---------|-------|
| **Bandwidth** | 100 GB/month |
| **Function Duration** | 10 seconds |
| **Deployments** | Unlimited |
| **Build Time** | 6000 minutes/month |
| **Serverless Functions** | Unlimited invocations |

---

## 🎉 You're Live!

Your AutoApply AI is now deployed! Share your URL:
```
https://your-project.vercel.app
```

---

## 📝 Next Steps

1. **Custom Domain**: Vercel Settings → Domains → Add your own domain
2. **Analytics**: Enable Vercel Analytics for user insights
3. **Monitoring**: Set up error tracking (Sentry, LogRocket)
4. **Optimization**: Add response caching for faster API calls

---

## 💡 Tips

- **Preview Deployments**: Every Git branch gets a preview URL
- **Rollback**: Easily rollback to previous deployments in Vercel Dashboard
- **Edge Functions**: Your API is deployed globally for low latency
- **Automatic HTTPS**: Vercel provides free SSL certificates

---

## 📞 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Discord**: [vercel.com/discord](https://vercel.com/discord)
- **Check Logs**: Always check Vercel function logs for errors

---

**Happy Deploying! 🚀**

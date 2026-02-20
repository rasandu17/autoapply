# ✅ Vercel Deployment Checklist

Use this checklist before deploying to Vercel:

## 📦 Before Deployment

- [ ] All code committed to GitHub
- [ ] `.env` files are in `.gitignore` (DO NOT commit secrets!)
- [ ] Frontend `.env` created with `VITE_API_URL` (optional for production)
- [ ] Backend `.env.example` exists as template
- [ ] All dependencies listed in respective `package.json` files

## 🔐 Environment Variables Ready

Prepare these values (you'll add them in Vercel dashboard):

- [ ] `GEMINI_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] `EMAIL_USER` - Your Gmail address
- [ ] `EMAIL_PASS` - Gmail [App Password](https://support.google.com/accounts/answer/185833)
- [ ] `OPENAI_API_KEY` - (Optional) If using OpenAI

## 🚀 Vercel Setup

- [ ] GitHub repository is public or Vercel has access
- [ ] Connected Vercel account to GitHub
- [ ] Imported project from GitHub
- [ ] Build settings configured:
  - Framework: **Vite**
  - Build Command: `cd frontend && npm install && npm run build`
  - Output Directory: `frontend/dist`
- [ ] Environment variables added in Vercel dashboard
- [ ] Deployment successful

## ✅ After Deployment

- [ ] Test health endpoint: `https://your-app.vercel.app/api/health`
- [ ] Test frontend: Open your Vercel URL
- [ ] Upload a test job description
- [ ] Verify AI analysis works
- [ ] Test email sending feature
- [ ] Check Vercel logs for any errors

## 🔧 Troubleshooting

If something breaks:

1. **Check Vercel Logs**: Dashboard → Your Project → Logs
2. **Verify Environment Variables**: Settings → Environment Variables
3. **Redeploy**: Deployments → Click "Redeploy"
4. **Test locally first**: `npm run dev` in frontend + `npm start` in backend

## 📝 Quick Deploy Commands

```bash
# 1. Commit your changes
git add .
git commit -m "Ready for deployment"
git push

# 2. Vercel will auto-deploy!
# No manual commands needed after initial setup
```

---

**Need help?** See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

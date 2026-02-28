# 🔄 Update Hosted Version - Quick Guide

## What's New in This Update

✅ **Email improvements**: Professional tone, varied sentence structure, standardized greeting  
✅ **"Thank you for consideration"** closing in all emails  
✅ **Start New button** - Reset and apply to another job  
✅ **Google Sheets Tracker** - Automatically log applications (optional)  

---

## 🚀 Quick Update Steps

### Step 1: Push Changes to GitHub

```bash
# In your project folder
git add .
git commit -m "Update: Email improvements, Start New button, Google Sheets tracking"
git push
```

**That's it!** Vercel will automatically detect the push and redeploy your site (takes 2-3 minutes).

---

### Step 2: Add Environment Variables (Optional - for Tracking)

If you want Google Sheets tracking on your hosted version, add these two variables:

1. Go to [Vercel Dashboard](https://vercel.app)
2. Select your **autoapply** project
3. Go to **Settings** → **Environment Variables**
4. Add both:
   ```
   Name: GOOGLE_SHEET_ID
   Value: 1kOUBBCA9_vSqohezwUze4uxq0B2PVhJK9czwzjgsOUE
   ```
   ```
   Name: GOOGLE_SERVICE_ACCOUNT_KEY
   Value: (see Step 3 below for how to get this)
   ```
5. Click **Save** after each

---

### Step 3: Upload Google Credentials (Optional - for Tracking)

**Good news!** The app now supports environment variable credentials, so tracking works on Vercel.

#### Setting up GOOGLE_SERVICE_ACCOUNT_KEY on Vercel:

1. **Copy your credentials file content:**

   **Windows PowerShell:**
   ```powershell
   cd c:\Users\RAVINDU\Desktop\autoapply\backend
   Get-Content google-credentials.json -Raw | Set-Clipboard
   ```
   
   **Or manually:** Open `backend/google-credentials.json` and copy the entire content

2. **Add to Vercel Dashboard:**
   - Go to [Vercel Dashboard](https://vercel.app) → Your Project
   - Navigate to **Settings** → **Environment Variables**
   - Click **Add New**
   - Name: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - Value: Paste the entire JSON content (should look like `{"type":"service_account",...}`)
   - Select **Production, Preview, Development**
   - Click **Save**

3. **Redeploy** (if auto-deploy didn't trigger):
   ```bash
   vercel --prod
   ```

**Important:**
- Must be valid JSON (the entire file contents)
- Include all `\n` characters in the private_key field
- Don't add extra quotes or modify formatting

**Verification:**
- The app will automatically detect credentials from the environment variable on Vercel
- Tracks to the same Google Sheet as your local version

---

## 📋 Current Environment Variables on Vercel

Make sure you have these set:

✅ **Required:**
- `GROQ_API_KEY` - For all AI operations
- `GEMINI_API_KEY` - For OCR (image text extraction)
- `EMAIL_USER` - Your email address
- `EMAIL_PASS` - Your Gmail app password

⚙️ **Optional (for tracking):**
- `GOOGLE_SHEET_ID` - Your Google Sheet ID
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Service account credentials (JSON as string)

---

## ✅ Verify Deployment

After pushing to GitHub:

1. Wait 2-3 minutes for Vercel to build
2. Visit your site: `https://your-project.vercel.app`
3. Test the new features:
   - Upload a job posting
   - Check email quality (professional, natural)
   - After sending email, click **"✨ Start New Application"**
   - Try **"📊 Add to Tracker"** if you set up Google Sheets

---

## 🐛 Troubleshooting

### "Old version still showing"

**Solution:**
1. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Check Vercel dashboard for deployment status

### "GROQ_API_KEY not found"

**Solution:**
1. Go to Vercel Settings → Environment Variables
2. Make sure `GROQ_API_KEY` is set
3. Redeploy: Deployments → Latest → Click "Redeploy"

### "Tracker not working"

**Solution:** 
- This is normal if you didn't set up Google Sheets on Vercel
- Tracking will work on localhost automatically
- To enable on Vercel, follow Step 3 above

---

## 💡 Quick Test Checklist

After deployment, test:

- [ ] Image upload works
- [ ] Job analysis shows results
- [ ] Email is professional and natural
- [ ] "Send Application" button works
- [ ] "Add to Tracker" button appears (if configured)
- [ ] "Start New Application" clears chat
- [ ] Can apply to multiple positions from one image

---

## 📝 Notes

- **Auto-deployment**: Every `git push` triggers Vercel deployment
- **Environment variables**: Only need to set once, persist across deployments
- **Google Sheets**: Optional feature, works great on localhost without extra setup
- **No downtime**: Vercel deploys with zero downtime

---

## 🎉 You're Updated!

Your hosted AutoApply AI now has:
- Better email quality
- Smoother user experience
- Optional application tracking

Visit your live site and start applying! 🚀


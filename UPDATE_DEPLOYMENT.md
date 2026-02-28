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

### Step 2: Add New Environment Variable (Optional - for Tracking)

If you want Google Sheets tracking on your hosted version:

1. Go to [Vercel Dashboard](https://vercel.app)
2. Select your **autoapply** project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   Name: GOOGLE_SHEET_ID
   Value: your_google_sheet_id_here
   ```
5. Click **Save**

---

### Step 3: Upload Google Credentials (Optional - for Tracking)

**Note:** Google Sheets tracking on Vercel requires manual credential upload.

#### Option A: Use Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Upload credentials as environment variable
vercel env add GOOGLE_SERVICE_ACCOUNT_KEY
# Paste the entire contents of google-credentials.json when prompted
```

Then update `backend/sheetsService.js` to read from env variable instead of file.

#### Option B: Skip Tracking on Hosted Version

If you only want tracking on localhost (simpler):
- Skip this step
- Tracking will work on `localhost:5000` only
- Hosted version will just hide the "Add to Tracker" button

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


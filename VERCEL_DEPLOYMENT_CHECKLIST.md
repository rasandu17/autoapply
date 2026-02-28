# ✅ Vercel Deployment Checklist

Use this checklist to deploy Google Sheets tracking to your hosted version.

## Before You Start

Make sure you have:
- ✅ Google Sheets working locally (`Add to Tracker` button works on localhost)
- ✅ File `backend/google-credentials.json` exists
- ✅ Google Sheet ID: `1kOUBBCA9_vSqohezwUze4uxq0B2PVhJK9czwzjgsOUE`

---

## Deployment Steps

### 1️⃣ Push Code to GitHub

```bash
cd c:\Users\RAVINDU\Desktop\autoapply
git add .
git commit -m "Add Google Sheets tracking feature"
git push origin main
```

**Wait:** Vercel will auto-deploy (check dashboard for progress)

---

### 2️⃣ Copy Credentials to Clipboard

**Run this in PowerShell:**

```powershell
cd c:\Users\RAVINDU\Desktop\autoapply\backend
Get-Content google-credentials.json -Raw | Set-Clipboard
Write-Host "✅ Credentials copied to clipboard!"
```

---

### 3️⃣ Add Environment Variables to Vercel

Go to: https://vercel.com → Your Project → Settings → Environment Variables

Add **TWO** new variables:

#### Variable 1:
```
Name: GOOGLE_SHEET_ID
Value: 1kOUBBCA9_vSqohezwUze4uxq0B2PVhJK9czwzjgsOUE
Environment: Production, Preview, Development
```

#### Variable 2:
```
Name: GOOGLE_SERVICE_ACCOUNT_KEY
Value: [Paste from clipboard - entire JSON content]
Environment: Production, Preview, Development
```

**Save both variables**

---

### 4️⃣ Redeploy (Optional)

If Vercel doesn't automatically redeploy after adding env variables:

```bash
# Option A: Via Vercel Dashboard
# Go to Deployments → Click "..." → Redeploy

# Option B: Via CLI (if installed)
vercel --prod
```

---

### 5️⃣ Test on Hosted Version

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Upload a CV and job posting
3. Generate email
4. Send email
5. Click **"Add to Tracker"** button
6. Check your Google Sheet - new row should appear!

---

## Troubleshooting

### ❌ "Failed to add to tracker"

**Check:**
1. Both environment variables are set correctly on Vercel
2. `GOOGLE_SERVICE_ACCOUNT_KEY` is valid JSON (no extra quotes/formatting)
3. Google Sheet is still shared with service account email
4. Vercel deployment finished successfully

**View Vercel Logs:**
```bash
vercel logs --follow
```

### ❌ "Permission denied" error

**Fix:**
1. Copy service account email from `google-credentials.json`:
   - Look for `"client_email": "xxx@xxx.iam.gserviceaccount.com"`
2. Go to your Google Sheet
3. Click **Share** button
4. Add that email with **Editor** permissions

### ❌ Environment variable not working

**Common mistakes:**
- Extra quotes around JSON: `"{"type":...}"` ❌ Should be: `{"type":...}` ✅
- Missing `\n` characters in private_key
- Truncated JSON (must include entire content from `{` to `}`)

**To verify:**
```powershell
# Check if your credentials JSON is valid
Get-Content backend/google-credentials.json | ConvertFrom-Json
# If this runs without error, your JSON is valid
```

---

## Environment Variables Summary

Your Vercel project should have these **6** environment variables:

| Variable | Value | Purpose |
|----------|-------|---------|
| `GROQ_API_KEY` | gsk_QOUk... | AI email generation |
| `GEMINI_API_KEY` | AIzaSyD... | OCR (CV parsing) |
| `EMAIL_USER` | ravindusandumith171@gmail.com | Send emails from |
| `EMAIL_PASSWORD` | zqqo zvma akwk onlr | Gmail app password |
| `GOOGLE_SHEET_ID` | 1kOUBBCA... | Google Sheet to track to |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | {"type":"service_account",...} | Google API auth |

---

## Quick Commands

```powershell
# 1. Copy credentials
cd c:\Users\RAVINDU\Desktop\autoapply\backend
Get-Content google-credentials.json -Raw | Set-Clipboard

# 2. Validate JSON format
Get-Content google-credentials.json | ConvertFrom-Json

# 3. Push to GitHub
cd ..
git add . ; git commit -m "Deploy tracker" ; git push

# 4. Check Vercel deployment status
# Visit: https://vercel.com/dashboard
```

---

## Success Indicators

✅ **Deployment successful when:**
- Vercel build completes without errors
- "Add to Tracker" button appears on hosted version
- Clicking button shows success message
- New row appears in Google Sheet with correct data
- No console errors in browser DevTools

---

## Need Help?

If still not working after following all steps:
1. Check Vercel function logs for error details
2. Verify all 6 environment variables are set
3. Test locally first - if it works on localhost, deployment should work
4. Make sure sheet hasn't been unshared with service account

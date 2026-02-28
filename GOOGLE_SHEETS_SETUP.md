# 📊 Google Sheets Job Tracker Setup Guide

This guide will help you set up Google Sheets integration to automatically track your job applications.

---

## 🎯 What You'll Get

After setup, clicking "Add to Tracker" will automatically log:
- Date Applied
- Job Title
- Company Name
- Company Email
- Match Percentage
- Application Status
- Notes

---

## 📋 Step-by-Step Setup

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "Job Applications Tracker" (or any name you prefer)
4. **That's it!** - Don't create any columns or headers, the system will do it automatically
5. **Copy the Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_SHEET_ID]/edit
   ```

---

### Step 2: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** or select an existing one
3. Name it "AutoApply AI" (or any name)
4. Click **"Create"**

---

### Step 3: Enable Google Sheets API

1. In your project, go to **"APIs & Services" → "Library"**
2. Search for **"Google Sheets API"**
3. Click on it and press **"Enable"**

---

### Step 4: Create a Service Account

1. Go to **"APIs & Services" → "Credentials"**
2. Click **"Create Credentials" → "Service Account"**
3. Fill in:
   - **Service account name**: `autoapply-sheets`
   - **Service account ID**: (auto-generated)
   - **Description**: `Service account for AutoApply AI job tracker`
4. Click **"Create and Continue"**
5. Skip "Grant access" (click **Continue**)
6. Skip "Grant users access" (click **Done**)

---

### Step 5: Create and Download Credentials

1. Click on the service account you just created
2. Go to **"Keys"** tab
3. Click **"Add Key" → "Create new key"**
4. Choose **JSON** format
5. Click **"Create"**
6. A JSON file will download automatically

**Important**: This file contains sensitive credentials. Keep it secure!

---

### Step 6: Share Google Sheet with Service Account

1. Open the JSON credentials file you downloaded
2. Find the **"client_email"** field (looks like: `autoapply-sheets@project-name.iam.gserviceaccount.com`)
3. Copy this email address
4. Open your Google Sheet
5. Click **"Share"** button (top right)
6. Paste the service account email
7. Give it **"Editor"** access
8. **Uncheck** "Notify people"
9. Click **"Share"**

---

### Step 7: Add Credentials to Your Project

1. Rename the downloaded JSON file to **`google-credentials.json`**
2. Move it to your `backend` folder:
   ```
   autoapply/
   └── backend/
       ├── geminiService.js
       ├── server.js
       └── google-credentials.json  ← Place it here
   ```

---

### Step 8: Add Environment Variable

1. Open `backend/.env` file
2. Add this line:
   ```env
   GOOGLE_SHEET_ID=your_sheet_id_from_step_1
   ```
3. Save the file

---

### Step 9: Install Dependencies & Restart

```bash
cd backend
npm install googleapis
npm start
```

---

## ✅ Test It Out

1. Start your frontend and backend
2. Analyze a job posting
3. Generate and send an email
4. Click **"📊 Add to Tracker"** button
5. Check your Google Sheet - you should see a new row!

---

## 🎨 Customize Your Tracker

The sheet will automatically create an "Applications" tab with these columns:
- **Date Applied** - Auto-filled with current date
- **Job Title** - From the job posting
- **Company** - Extracted from company email
- **Company Email** - Where you sent the application
- **Match %** - Your compatibility score
- **Status** - Default: "Applied" (you can change manually)
- **Notes** - Empty by default (add your own)

You can:
- Add more columns for custom tracking
- Use Google Sheets formulas for analytics
- Create charts to visualize your job search
- Add conditional formatting for status tracking

---

## 🐛 Troubleshooting

### "Google Sheets not configured" Error

**Solution**: 
- Check `google-credentials.json` exists in `backend/` folder
- Verify `GOOGLE_SHEET_ID` is set in `.env`
- Restart the backend server

### "Permission denied" Error

**Solution**:
- Make sure you shared the sheet with the service account email
- Give it "Editor" access (not just "Viewer")

### "Sheet not found" Error

**Solution**:
- Double-check the Sheet ID in `.env`
- Make sure the sheet URL is accessible
- Verify the service account has access

---

## 🔒 Security Notes

- **Never commit** `google-credentials.json` to GitHub
- Already added to `.gitignore`
- Keep your Sheet ID private (don't share publicly)
- Service account has access ONLY to sheets you explicitly share with it

---

## 💡 Pro Tips

1. **Create Chart Dashboard**: Use Google Sheets charts to track:
   - Applications per week
   - Average match percentage
   - Response rates by company

2. **Set up Notifications**: Use Google Sheets notifications for:
   - Weekly application summaries
   - When you reach application milestones

3. **Color Coding**: Add conditional formatting:
   - Green: Response received
   - Yellow: Waiting for response
   - Red: Rejected
   - Blue: Interview scheduled

4. **Share with Career Advisor**: Share (view-only) with mentors or career counselors for feedback

---

## 🎉 You're All Set!

Your AutoApply AI now has smart job tracking! Every application will be logged automatically to your Google Sheet for easy reference and analytics.

Happy job hunting! 🚀


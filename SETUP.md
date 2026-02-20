# AutoApply AI - Setup Guide

## 🚀 Complete Setup Instructions

### Step 1: Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### Step 2: Get Your API Keys

#### Google Gemini API Key (FREE)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

#### Gmail App Password
1. Go to your [Google Account](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if not already)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and your device
5. Generate and copy the 16-character password

### Step 3: Configure .env File

Create `backend/.env`:

```env
PORT=5000
GEMINI_API_KEY=paste_your_gemini_key_here
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
EMAIL_NAME=Your Full Name
```

### Step 4: Update Your CV

**Copy your CV PDF file** to `backend/cv.pdf`

The app supports both PDF and TXT formats. Just place either:
- `backend/cv.pdf` (recommended), or
- `backend/cv.txt` (plain text)

### Step 5: Run the Application

**Terminal 1:**
```bash
cd backend
npm start
```

Expected output:
```
✅ AutoApply AI Backend running on http://localhost:5000
📧 Email from: youremail@gmail.com
```

**Terminal 2:**
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

### Step 6: Test the Application

1. Open http://localhost:3000
2. Paste a job description or upload an image
3. Click "Analyze Job"
4. Review the results
5. Edit the email if needed
6. Send the email

## ✅ Verification Checklist

- [ ] backend/node_modules installed
- [ ] frontend/node_modules installed
- [ ] backend/.env file created with all keys
- [ ] backend/cv.pdf (or cv.txt) added with your CV
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can analyze a job post
- [ ] Can send an email

## 🐛 Common Issues

### Port Already in Use
Change PORT in backend/.env to another number (e.g., 5001)

### API Key Invalid
Double-check your Gemini API key is copied correctly

### Email Sending Fails
- Use App Password, not regular Gmail password
- Make sure 2-Step Verification is enabled
- Check EMAIL_USER and EMAIL_PASSWORD in .env

### Image Upload Not Working
- Only JPG, PNG images supported
- Image should be clear and readable
- Try pasting text instead

## 🎉 You're Ready!

Your AutoApply AI is now running. Start applying to jobs faster!

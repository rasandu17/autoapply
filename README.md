# 🤖 AutoApply AI

A simple personal-use web application that automates job application analysis using Google Gemini AI.

## ✨ Features

- 📄 **Upload job post images** or paste job description text
- 🔍 **AI-powered OCR** using Google Gemini API to extract text from images
- 📊 **Smart analysis**: Compatibility score, matching/missing skills, eligibility
- ✉️ **Auto-generate** professional job application emails
- 📧 **Send emails** directly via Gmail SMTP
- 🎨 **Clean, modern UI** - single page application

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Google Gemini API key (free): [Get it here](https://makersuite.google.com/app/apikey)
- Gmail account with App Password (for sending emails)

### 1. Clone or Download

```bash
cd autoapply
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` folder:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=5000
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_NAME=Your Full Name
```

**Important**: 
- **Groq API**: Get your FREE API key from [Groq Console](https://console.groq.com/keys) - 500 requests/day
- **Gemini API**: Get your key from [Google AI Studio](https://makersuite.google.com/app/apikey) - used for OCR only
- For Gmail, use an [App Password](https://myaccount.google.com/apppasswords) (not your regular password)

### 4. Add Your CV

**Place your CV PDF file** in the `backend` folder and name it `cv.pdf`

Alternatively, you can use a text file named `cv.txt` (the app supports both formats)

### 5. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

### 6. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The app will open at: **http://localhost:3000**

## 📖 How to Use

1. **Upload a job post image** OR **paste job description text**
2. Click **"Analyze Job"**
3. Review the analysis:
   - Compatibility percentage
   - Matching skills
   - Missing skills
   - Eligibility status
   - Suggestions for improvement
4. **Edit the generated email** if needed
5. Enter recipient email and subject
6. Click **"Send Email"**

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Vanilla CSS

### Backend
- Node.js
- Express
- Google Generative AI (@google/generative-ai)
- Nodemailer
- Multer (file upload)

## 📁 Project Structure

```
autoapply/
├── backend/
│   ├── server.js           # Express server
│   ├── geminiService.js    # Gemini AI integration
│   ├── emailService.js     # Email sending logic
│   ├── cv.pdf             # Your CV/resume (add this!)
│   ├── .env               # Environment variables (create this)
│   ├── .env.example       # Example env file
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx        # Main React component
    │   ├── App.css        # Styles
    │   ├── main.jsx       # Entry point
    │   └── index.css      # Global styles
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🔒 Security Notes

- ✅ API keys stored in `.env` (never commit this file)
- ✅ `.env` is in `.gitignore`
- ✅ CORS enabled for local development only
- ⚠️ **This is for personal use only** - not production-ready

## 🐛 Troubleshooting

### "Failed to extract text from image"
- Check your Gemini API key in `.env`
- Ensure the image is clear and readable
- Try uploading a different format (JPG, PNG)

### "Failed to send email"
- Verify Gmail credentials in `.env`
- Use App Password, not regular password
- Enable "Less secure app access" if needed

### Backend not starting
```bash
cd backend
npm install
# Check if .env file exists and has correct values
```

### Frontend not loading
```bash
cd frontend
npm install
npm run dev
```

## 📝 Customization

### Change Email Template
Edit the prompt in `backend/geminiService.js` → `generateEmail()` function

### Adjust Analysis Criteria
Modify the prompt in `backend/geminiService.js` → `analyzeJobVsCV()` function

### Update UI Colors
Edit `frontend/src/App.css`

## 🎯 Roadmap (Optional Enhancements)

- [ ] Save analysis history to local storage
- [ ] Export results as PDF
- [ ] Multiple CV profiles
- [ ] Email templates library
- [ ] Browser extension version

## 📄 License

MIT - Free for personal use

## 🙏 Credits

- Built with Google Gemini AI
- Icons: Unicode emojis
- No external UI libraries used (vanilla React + CSS)

---

**Made with ❤️ for automating job applications**

Need help? Check the code comments or create an issue.

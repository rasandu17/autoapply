<div align="center">

# ✨ AutoApply AI

**Your AI-powered job application assistant**

*Analyze job postings • Generate emails • Create cover letters • Track applications*

[![Made with React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![AI Powered](https://img.shields.io/badge/AI-Groq%20%2B%20Gemini-FF6B6B)](https://groq.com/)

</div>

---

## 🚀 What It Does

AutoApply transforms your job application workflow with two powerful modes:

### 📊 **Job Analysis Mode**
- Upload job posting images (OCR-powered) or paste descriptions
- Get instant compatibility scores & skill matching
- Receive personalized improvement suggestions
- Auto-generate professional application emails
- Track applications in Google Sheets

### ✍️ **Cover Letter Generator**
- Quick, focused cover letters (3-4 paragraphs)
- Tailored to specific job requirements
- Professional yet personable tone
- Fully editable with one-click copy

---

## ⚡ Quick Start

```bash
# Clone & Install
git clone <your-repo-url>
cd autoapply

# Backend setup
cd backend
npm install
cp .env.example .env  # Add your API keys
# Add your cv.pdf to backend folder

# Frontend setup (new terminal)
cd frontend
npm install

# Run both servers
cd backend && npm start    # Terminal 1: http://localhost:5000
cd frontend && npm run dev # Terminal 2: http://localhost:3001
```

### 🔑 Required API Keys (All Free)
- **Groq API** → [Get 500 free requests/day](https://console.groq.com/keys)
- **Gemini API** → [For image OCR](https://makersuite.google.com/app/apikey)
- **Gmail App Password** → [For sending emails](https://myaccount.google.com/apppasswords)
- **Google Sheets API** → [For tracking](https://console.cloud.google.com/) *(optional)*

---

## 🎨 Features

| Feature | Description |
|---------|-------------|
| 🖼️ **Smart OCR** | Extract text from job posting screenshots |
| 🧠 **AI Analysis** | Powered by Llama 3.3 (70B) via Groq |
| 📧 **Email Generation** | Context-aware, professional emails |
| 📝 **Cover Letters** | Short, impactful, and personalized |
| 📊 **Application Tracker** | Auto-save to Google Sheets |
| 📱 **Mobile Ready** | Optimized for iPhone & Android |
| ⚡ **Lightning Fast** | No loading screens, instant results |

---

## 🛠️ Tech Stack

**Frontend:** React 18 • Vite • CSS3  
**Backend:** Node.js • Express • Multer  
**AI:** Groq (Llama 3.3) • Google Gemini Vision  
**Services:** Nodemailer • Google Sheets API

---

## 📝 Environment Setup

Create `backend/.env`:

```env
PORT=5000
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your_app_password
GOOGLE_SHEET_ID=your_sheet_id
```

---

## 🎯 Usage

1. **Choose Mode:** Job Analysis or Cover Letter
2. **Upload/Paste:** Job posting image or text
3. **Review:** AI-generated content
4. **Edit:** Customize as needed
5. **Send/Copy:** Email directly or copy to clipboard

---

## 🔒 Privacy & Security

- ✅ All data processed locally
- ✅ API keys never exposed to frontend
- ✅ No data stored on external servers
- ✅ `.env` automatically ignored by git

---

## 📦 Deployment

Supports **Vercel** serverless deployment:
```bash
vercel deploy
```

Full deployment guide in `api/` folder comments.

---

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your needs!

---

## 📄 License

MIT © Ravindu Sandumith

---

<div align="center">

**Made with ❤️ and AI**

*Automate your job hunt. Focus on what matters.*

</div>

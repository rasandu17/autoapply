// AutoApply AI - Backend Server
// Simple Express server for job application automation

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const geminiService = require('./geminiService');
const emailService = require('./emailService');
const ocrService = require('./ocrService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration (store in memory)
const upload = multer({ storage: multer.memoryStorage() });

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AutoApply AI Backend Running' });
});

// Main endpoint: Analyze job post
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    let jobText = req.body.jobText || '';
    const image = req.file;

    // Step 1: If image provided, extract text using OCR (not Gemini)
    if (image && !jobText) {
      console.log('📸 Extracting text from image using OCR...');
      jobText = await ocrService.extractTextFromImage(image.buffer);
    }

    if (!jobText) {
      return res.status(400).json({ error: 'Please provide a job description or upload an image' });
    }

    // Step 2: Analyze job vs CV
    console.log('Analyzing job compatibility...');
    const analysis = await geminiService.analyzeJobVsCV(jobText);

    // Step 3: Extract company email and job title
    console.log('Extracting job details...');
    const [companyEmail, jobTitle] = await Promise.all([
      geminiService.extractCompanyEmail(jobText),
      geminiService.extractJobTitle(jobText)
    ]);

    // Step 4: Generate professional email
    console.log('Generating email...');
    const email = await geminiService.generateEmail(jobText);

    // Return complete response
    res.json({
      jobText,
      analysis,
      email,
      companyEmail,
      jobTitle,
      success: true
    });

  } catch (error) {
    console.error('Error in /api/analyze:', error.message);
    res.status(500).json({ 
      error: 'Failed to process job post', 
      details: error.message 
    });
  }
});

// Send email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
    }

    console.log(`Sending email to: ${to}`);
    await emailService.sendEmail(to, subject, body);

    res.json({ 
      success: true, 
      message: 'Email sent successfully!' 
    });

  } catch (error) {
    console.error('Error sending email:', error.message);
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ AutoApply AI Backend running on http://localhost:${PORT}`);
  console.log(`📧 Email from: ${process.env.EMAIL_USER || 'NOT SET'}`);
});

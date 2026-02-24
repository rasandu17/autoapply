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

    // Step 1: If image provided, extract text using OCR
    if (image && !jobText) {
      console.log('📸 Extracting text from image using OCR...');
      jobText = await ocrService.extractTextFromImage(image.buffer);
    }

    if (!jobText) {
      return res.status(400).json({ error: 'Please provide a job description or upload an image' });
    }

    // Step 1.5: Detect if there are multiple positions
    console.log('🤖 Step 1.5: Detecting multiple positions...');
    const positions = await geminiService.detectMultiplePositions(jobText);
    
    if (positions && positions.length > 1) {
      // Multiple positions detected - show for selection
      console.log(`📋 Multiple positions detected: ${positions.length}`);
      
      // Extract company email (common for all positions)
      console.log('🤖 Extracting company email...');
      const companyEmail = await geminiService.extractCompanyEmail(jobText);
      
      // DON'T analyze yet - wait for user to select position
      console.log('💡 Skipping analysis - waiting for user selection');
      
      // Return positions for selection
      const positionResults = positions.map((pos) => ({
        title: pos.title,
        description: pos.description
      }));
      
      console.log('✅ Positions ready for selection');
      
      return res.json({
        jobText,
        multiplePositions: true,
        positions: positionResults,
        companyEmail,
        needsSelection: true,
        success: true
      });
    } else {
      // Single position - use original flow
      console.log('📋 Single position detected');
      
      // Step 2: Analyze job vs CV
      console.log('🤖 Step 2: Analyzing job compatibility...');
      const analysis = await geminiService.analyzeJobVsCV(jobText);
      console.log('✅ Analysis complete');

      // Step 3: Extract company email and job title
      console.log('🤖 Step 3: Extracting job details...');
      const [companyEmail, jobTitle] = await Promise.all([
        geminiService.extractCompanyEmail(jobText),
        geminiService.extractJobTitle(jobText)
      ]);
      console.log('✅ Job details extracted');

      // Step 4: Generate professional email
      console.log('🤖 Step 4: Generating email...');
      const email = await geminiService.generateEmail(jobText);
      console.log('✅ Email generated');

      return res.json({
        jobText,
        multiplePositions: false,
        analysis,
        email,
        companyEmail,
        jobTitle,
        success: true
      });
    }

  } catch (error) {
    console.error('Error in /api/analyze:', error.message);
    res.status(500).json({ 
      error: 'Failed to process job post', 
      details: error.message 
    });
  }
});

// Analyze specific position endpoint
app.post('/api/analyze-position', async (req, res) => {
  try {
    const { jobText, positionTitle, positionDescription } = req.body;

    if (!jobText || !positionTitle) {
      return res.status(400).json({ 
        error: 'Missing required fields: jobText and positionTitle' 
      });
    }

    console.log(`🤖 Analyzing position: ${positionTitle}`);
    
    // Analyze single position
    const position = { title: positionTitle, description: positionDescription || '' };
    const analyses = await geminiService.analyzeMultiplePositions([position], jobText);
    const analysis = analyses[0];
    
    console.log('✅ Position analysis complete');
    
    // Generate email
    console.log('🤖 Generating email...');
    const email = await geminiService.generateEmailForPosition(jobText, positionTitle);
    console.log('✅ Email generated');
    
    res.json({ 
      analysis,
      email,
      positionTitle,
      success: true 
    });

  } catch (error) {
    console.error('Error analyzing position:', error.message);
    res.status(500).json({ 
      error: 'Failed to analyze position', 
      details: error.message 
    });
  }
});

// Generate email for specific position
app.post('/api/generate-email', async (req, res) => {
  try {
    const { jobText, positionTitle } = req.body;

    if (!jobText || !positionTitle) {
      return res.status(400).json({ 
        error: 'Missing required fields: jobText and positionTitle' 
      });
    }

    console.log(`🤖 Generating email for position: ${positionTitle}`);
    
    const email = await geminiService.generateEmailForPosition(jobText, positionTitle);
    
    console.log('✅ Email generated');
    
    res.json({ 
      email,
      positionTitle,
      success: true 
    });

  } catch (error) {
    console.error('Error generating email:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate email', 
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

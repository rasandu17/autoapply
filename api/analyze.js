// Vercel Serverless Function - Analyze Job Post
const multiparty = require('multiparty');
const geminiService = require('../backend/geminiService');
const ocrService = require('../backend/ocrService');

// Helper to parse multipart form data
function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

// Helper to read file buffer
function readFileBuffer(file) {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    fs.readFile(file.path, (err, buffer) => {
      if (err) reject(err);
      else resolve(buffer);
    });
  });
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let jobText = '';
    let imageBuffer = null;

    // Parse multipart form data
    const { fields, files } = await parseMultipartForm(req);
    
    if (fields.jobText && fields.jobText[0]) {
      jobText = fields.jobText[0];
    }

    if (files.image && files.image[0]) {
      imageBuffer = await readFileBuffer(files.image[0]);
    }

    // Step 1: If image provided, extract text using OCR
    if (imageBuffer && !jobText) {
      console.log('📸 Extracting text from image using OCR...');
      jobText = await ocrService.extractTextFromImage(imageBuffer);
    }

    if (!jobText) {
      return res.status(400).json({ 
        error: 'Please provide a job description or upload an image' 
      });
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
    res.status(200).json({
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
}

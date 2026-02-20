// Vercel Serverless Function - Analyze Job Post
const multiparty = require('multiparty');
const geminiService = require('../backend/geminiService');
const ocrService = require('../backend/ocrService');

// Timeout wrapper for serverless functions
function withTimeout(promise, timeoutMs = 55000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout - please try again')), timeoutMs)
    )
  ]);
}

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

  // Check required env vars
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not set!');
    return res.status(500).json({ 
      error: 'Server configuration error', 
      details: 'GEMINI_API_KEY not configured' 
    });
  }

  console.log('✅ Environment variables loaded');
  console.log('🔑 GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');

  try {
    let jobText = '';
    let imageBuffer = null;

    console.log('📥 Received request, method:', req.method);
    console.log('📦 Content-Type:', req.headers['content-type']);

    // Parse multipart form data
    try {
      const { fields, files } = await parseMultipartForm(req);
      console.log('✅ Form parsed successfully');
      console.log('📋 Fields:', Object.keys(fields));
      console.log('📎 Files:', Object.keys(files));
      
      if (fields.jobText && fields.jobText[0]) {
        jobText = fields.jobText[0];
        console.log('📝 Job text length:', jobText.length);
      }

      if (files.image && files.image[0]) {
        imageBuffer = await readFileBuffer(files.image[0]);
        console.log('🖼️ Image buffer size:', imageBuffer.length);
      }
    } catch (parseError) {
      console.error('❌ Form parsing error:', parseError);
      throw parseError;
    }

    // Step 1: If image provided, extract text using OCR
    if (imageBuffer && !jobText) {
      console.log('📸 Extracting text from image using OCR...');
      try {
        jobText = await ocrService.extractTextFromImage(imageBuffer);
        console.log('✅ OCR complete, extracted text length:', jobText.length);
      } catch (ocrError) {
        console.error('❌ OCR error:', ocrError);
        throw new Error(`OCR failed: ${ocrError.message}`);
      }
    }

    if (!jobText) {
      return res.status(400).json({ 
        error: 'Please provide a job description or upload an image' 
      });
    }

    // Wrap AI processing with timeout (55s to leave buffer for Vercel's 60s limit)
    const result = await withTimeout((async () => {
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

      return {
        jobText,
        analysis,
        email,
        companyEmail,
        jobTitle,
        success: true
      };
    })());

    console.log('✅ All processing complete, sending response');
    // Return complete response
    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error in /api/analyze:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    res.status(500).json({ 
      error: 'Failed to process job post', 
      details: error.message,
      errorType: error.constructor.name
    });
  }
}

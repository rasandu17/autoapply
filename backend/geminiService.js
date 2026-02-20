// Gemini API Service
// Handles all AI interactions using Google Gemini

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
// const crypto = require('crypto'); // Moved to cacheService
const cacheService = require('./cacheService');

// Initialize Gemini AI with gemini-2.5-flash (verified working)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Helper function to retry Gemini calls with exponential backoff

// Helper function to retry Gemini calls with exponential backoff
// Optimized for serverless with shorter delays
async function retryWithBackoff(fn, maxRetries = 2, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit = error.message.includes('429') || error.message.includes('quota');
      const isLastRetry = i === maxRetries - 1;
      
      if (isLastRetry || !isRateLimit) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`⏳ Rate limit hit, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Load CV from file (supports both PDF and TXT)
async function loadCV() {
  // Try Ravindu_Sandumith_CV.pdf first, then cv.pdf, then cv.txt
  const cvPaths = [
    path.join(__dirname, 'Ravindu_Sandumith_CV.pdf'),
    path.join(__dirname, 'cv.pdf'),
    path.join(__dirname, 'cv.txt')
  ];
  
  console.log('Looking for CV in:', __dirname);
  
  for (const cvPath of cvPaths) {
    console.log('Checking:', cvPath);
    if (fs.existsSync(cvPath)) {
      if (cvPath.endsWith('.pdf')) {
        // Read and parse PDF
        const dataBuffer = fs.readFileSync(cvPath);
        const pdfData = await pdfParse(dataBuffer);
        console.log(`✅ Loaded CV from ${path.basename(cvPath)}`);
        return pdfData.text;
      } else {
        // Read text file
        console.log(`✅ Loaded CV from ${path.basename(cvPath)}`);
        return fs.readFileSync(cvPath, 'utf-8');
      }
    }
  }
  
  console.error('❌ CV file not found! Checked paths:', cvPaths);
  console.error('Directory contents:', fs.readdirSync(__dirname));
  throw new Error('CV file not found! Please ensure Ravindu_Sandumith_CV.pdf is in the backend folder and committed to git.');
}

/**
 * Analyze job description vs CV
 * Returns compatibility score, matching/missing skills, eligibility
 */
async function analyzeJobVsCV(jobText) {
  try {
    // Check cache first
    const cacheKey = cacheService.getCacheKey(jobText, 'analysis');
    if (cacheService.has(cacheKey)) {
      console.log('📦 Using cached analysis (from file)');
      return cacheService.get(cacheKey);
    }

    const cv = await loadCV();

    const prompt = `
You are a job application analyzer. Compare this CV with the job description below.

CV:
${cv}

JOB DESCRIPTION:
${jobText}

Analyze and return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "compatibility": 75,
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "eligibility": "Eligible"
}

Rules:
- compatibility: number 0-100
- eligibility: "Eligible" or "Not Eligible"
- Return ONLY the JSON object, nothing else
`;

    const result = await retryWithBackoff(() => model.generateContent(prompt));
    let responseText = result.response.text().trim();
    
    // Remove markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const analysis = JSON.parse(responseText);
    
    // Cache the result
    cacheService.set(cacheKey, analysis);
    
    console.log('✅ Job analysis complete');
    return analysis;
    
  } catch (error) {
    console.error('Gemini Analysis Error:', error.message);
    throw new Error('Failed to analyze job compatibility');
  }
}

/**
 * Extract job position/title from job description
 */
async function extractJobTitle(jobText) {
  try {
    // Check cache first
    const cacheKey = cacheService.getCacheKey(jobText, 'title');
    if (cacheService.has(cacheKey)) {
      console.log('📦 Using cached job title (from file)');
      return cacheService.get(cacheKey);
    }

    const prompt = `
Analyze this job description and extract the job position/title.
Return ONLY the job title, nothing else. Be concise (e.g., "Software Developer", "Marketing Manager").

Job Description:
${jobText}

Return ONLY the position title:
`;

    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const title = result.response.text().trim() || 'the Position';
    
    // Cache the result
    cacheService.set(cacheKey, title);
    
    console.log('✅ Job title extracted:', title);
    return title;
    
  } catch (error) {
    console.error('Job title extraction error:', error.message);
    return 'the Position';
  }
}

/**
 * Extract company email from job description
 */
async function extractCompanyEmail(jobText) {
  try {
    // Check cache first
    const cacheKey = cacheService.getCacheKey(jobText, 'email');
    if (cacheService.has(cacheKey)) {
      console.log('📦 Using cached company email (from file)');
      return cacheService.get(cacheKey);
    }

    const prompt = `
Analyze this job description and extract the company contact email address.
If multiple emails are present, return the HR or recruitment email.
If no email is found, return "NOT_FOUND".

Job Description:
${jobText}

Return ONLY the email address, nothing else.
`;

    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const email = result.response.text().trim();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmail = emailRegex.test(email) ? email : null;
    
    // Cache the result
    cacheService.set(cacheKey, validEmail);
    
    if (validEmail) {
      console.log('✅ Company email extracted:', validEmail);
    } else {
      console.log('⚠️ No valid email found in job description');
    }
    
    return validEmail;
    
  } catch (error) {
    console.error('Email extraction error:', error.message);
    return null;
  }
}

/**
 * Generate professional job application email
 */
async function generateEmail(jobText) {
  try {
    const cv = await loadCV();

    const prompt = `
You are a professional email writer. Write a formal job application email based on this CV and job description.

CV:
${cv}

JOB DESCRIPTION:
${jobText}

Requirements:
- Professional and confident tone
- VERY CONCISE (100-150 words maximum)
- Use simple, direct language - avoid fancy words like "enthusiastic", "passionate", "eager", "thrilled"
- Brief introduction (1 sentence)
- Mention 2-3 most relevant skills/experiences only
- When mentioning projects, DO NOT use specific project names. Instead categorize them as:
  * Government/real-world projects
  * Award-winning projects
  * University assignments
  * Personal projects
  * Hackathon participation
- One sentence about why you're a good fit
- Mention CV attachment
- DO NOT include contact details or signature at the end
- Sound professional but natural and straightforward

Keep it short and impactful. Return ONLY the email body text.
`;

    const result = await retryWithBackoff(() => model.generateContent(prompt));
    let email = result.response.text().trim();
    
    // Add static contact information signature at the end
    const signature = `\n\nBest regards,\nRavindu Sandumith\n0776082132\nravindus.me\nravindusandumith171@gmail.com`;
    
    // Remove any existing signature-like content
    const lines = email.split('\n');
    const filteredLines = [];
    let skipRest = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Stop if we detect signature patterns
      if (line.includes('Best regards') || line.includes('Sincerely') || 
          line.includes('Thank you') || line.includes('Ravindu') ||
          line.match(/^\d{10}$/) || line.includes('ravindus')) {
        skipRest = true;
      }
      if (!skipRest) {
        filteredLines.push(lines[i]);
      }
    }
    
    email = filteredLines.join('\n').trim() + signature;
    
    console.log('✅ Email generated');
    return email;
    
  } catch (error) {
    console.error('Gemini Email Generation Error:', error.message);
    throw new Error('Failed to generate email');
  }
}

module.exports = {
  analyzeJobVsCV,
  generateEmail,
  extractCompanyEmail,
  extractJobTitle
};

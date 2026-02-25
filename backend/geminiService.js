// AI Service - Using Groq for fast, unlimited inference
// Switched from Gemini to Groq for better rate limits (500/day vs 20/day)

const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const cacheService = require('./cacheService');

// Initialize Groq with llama model (fast and accurate)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const MODEL = 'llama-3.3-70b-versatile'; // Fast, accurate model

// Helper function to call Groq API
async function callGroq(messages, maxRetries = 2, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: messages,
        temperature: 0.3, // Lower = more consistent
        max_tokens: 2000
      });
      return completion.choices[0].message.content;
    } catch (error) {
      const isRateLimit = error.message.includes('429') || error.message.includes('rate');
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
      console.log('📦 Using cached analysis');
      return cacheService.get(cacheKey);
    }

    const cv = await loadCV();

    const messages = [{
      role: 'user',
      content: `You are a job application analyzer. Compare this CV with the job description below.

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
- Return ONLY the JSON object, nothing else`
    }];

    let responseText = await callGroq(messages);
    
    // Remove markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const analysis = JSON.parse(responseText);
    
    // Cache the result
    cacheService.set(cacheKey, analysis);
    
    console.log('✅ Job analysis complete');
    return analysis;
    
  } catch (error) {
    console.error('AI Analysis Error:', error.message);
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
      console.log('📦 Using cached job title');
      return cacheService.get(cacheKey);
    }

    const messages = [{
      role: 'user',
      content: `Analyze this job description and extract the job position/title.
Return ONLY the job title, nothing else. Be concise (e.g., "Software Developer", "Marketing Manager").

Job Description:
${jobText}

Return ONLY the position title:`
    }];

    const title = (await callGroq(messages)).trim() || 'the Position';
    
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
      console.log('📦 Using cached company email');
      return cacheService.get(cacheKey);
    }

    const messages = [{
      role: 'user',
      content: `Analyze this job description and extract the company contact email address.
If multiple emails are present, return the HR or recruitment email.
If no email is found, return "NOT_FOUND".

Job Description:
${jobText}

Return ONLY the email address, nothing else.`
    }];

    const email = (await callGroq(messages)).trim();
    
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

    const messages = [{
      role: 'user',
      content: `You are a professional email writer. Write a formal job application email based on this CV and job description.

CV:
${cv}

JOB DESCRIPTION:
${jobText}

Requirements:
- MUST start with "Dear Hiring Team,"
- Write like a real person - professional but conversational and friendly
- Use simple, everyday language - no corporate jargon or heavy words
- VERY CONCISE (100-150 words maximum)
- Brief introduction (1 sentence) - straightforward, no flowery language
- Vary sentence structure - DON'T start every sentence with "I" or "I'm". Mix it up with different openings
- Mention 2-3 most relevant skills/experiences only
- When mentioning projects, DO NOT use specific project names. Instead categorize them as:
  * Government/real-world projects
  * Award-winning projects
  * University assignments
  * Personal projects
  * Hackathon participation
- One sentence about why you're a good fit - keep it natural and genuine
- Mention CV attachment
- DO NOT include contact details or signature at the end
- Avoid words like: "enthusiastic", "passionate", "eager", "thrilled", "excited", "leverage", "utilize", "synergy"
- Sound like a confident professional having a natural conversation, not reading from a template

Keep it short and impactful. Return ONLY the email body text.`
    }];

    let email = await callGroq(messages);
    
    // Add static contact information signature at the end
    const signature = `\n\nThank you for your consideration.\n\nBest regards,\nRavindu Sandumith\n0776082132\nravindus.me\nravindusandumith171@gmail.com`;
    
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
    console.error('AI Email Generation Error:', error.message);
    throw new Error('Failed to generate email');
  }
}

/**
 * Detect if job posting contains multiple positions
 * Returns array of position objects or null if single position
 */
async function detectMultiplePositions(jobText) {
  try {
    // Check cache first
    const cacheKey = cacheService.getCacheKey(jobText, 'positions');
    if (cacheService.has(cacheKey)) {
      console.log('📦 Using cached position detection');
      return cacheService.get(cacheKey);
    }

    const messages = [{
      role: 'user',
      content: `
Analyze this job posting and determine if it contains multiple distinct job positions/roles.

Job Posting:
${jobText}

If there are multiple distinct positions (e.g., "Backend Developer", "Frontend Developer", "HR Manager"), return a JSON array like:
[
  {
    "title": "Intern Backend Developer",
    "description": "Brief description of this specific role"
  },
  {
    "title": "Intern Frontend Developer", 
    "description": "Brief description of this specific role"
  }
]

If there is only ONE position, return: null

Rules:
- Only return an array if there are 2+ DISTINCT positions
- Each position should have a clear title and description
- Extract descriptions from context (e.g., "Gain hands-on experience with server-side technologies")
- Return ONLY valid JSON (array or null), no markdown, no explanations
`
    }];

    let responseText = await callGroq(messages);
    
    // Remove markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const positions = JSON.parse(responseText);
    
    const finalResult = (Array.isArray(positions) && positions.length > 1) ? positions : null;
    
    // Cache the result
    cacheService.set(cacheKey, finalResult);
    
    if (finalResult) {
      console.log(`✅ Detected ${finalResult.length} positions in job posting:`);
      finalResult.forEach((pos, idx) => {
        console.log(`  ${idx + 1}. ${pos.title}`);
      });
    } else {
      console.log('✅ Single position detected (or detection returned null)');
      console.log('   Raw AI response:', JSON.stringify(positions));
    }
    
    return finalResult;
    
  } catch (error) {
    console.error('Position detection error:', error.message);
    // If detection fails, assume single position
    return null;
  }
}

/**
 * Analyze multiple positions vs CV
 * Returns array of analyses, one per position
 */
async function analyzeMultiplePositions(positions, fullJobText) {
  try {
    const cv = await loadCV();
    
    const analyses = await Promise.all(positions.map(async (position) => {
      const messages = [{
        role: 'user',
        content: `
You are a job application analyzer. Compare this CV with the specific job position below.

CV:
${cv}

JOB POSITION: ${position.title}
DESCRIPTION: ${position.description}

FULL JOB POSTING CONTEXT:
${fullJobText}

Analyze and return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "compatibility": 75,
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "eligibility": "Eligible",
  "title": "${position.title}"
}

Rules:
- compatibility: number 0-100 based on how well the CV matches THIS specific position
- eligibility: "Eligible" or "Not Eligible" for THIS specific role
- Include the title in response
- Return ONLY the JSON object, nothing else
`
      }];

      let responseText = await callGroq(messages);
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(responseText);
    }));
    
    console.log(`✅ Analyzed ${positions.length} positions`);
    return analyses;
    
  } catch (error) {
    console.error('Multi-position analysis error:', error.message);
    throw new Error('Failed to analyze positions');
  }
}

/**
 * Generate email for specific position
 */
async function generateEmailForPosition(jobText, positionTitle) {
  try {
    const cv = await loadCV();

    const messages = [{
      role: 'user',
      content: `
You are a professional email writer. Write a formal job application email for the position of "${positionTitle}".

CV:
${cv}

FULL JOB POSTING:
${jobText}

APPLYING FOR: ${positionTitle}

Requirements:
- MUST start with "Dear Hiring Team,"
- Write like a real person - professional but conversational and friendly
- Use simple, everyday language - no corporate jargon or heavy words
- VERY CONCISE (100-150 words maximum)
- Brief introduction (1 sentence) - mention you're applying for ${positionTitle}, keep it straightforward
- Vary sentence structure - DON'T start every sentence with "I" or "I'm". Mix it up with different openings
- Mention 2-3 most relevant skills/experiences for THIS SPECIFIC POSITION only
- When mentioning projects, DO NOT use specific project names. Instead categorize them as:
  * Government/real-world projects
  * Award-winning projects
  * University assignments
  * Personal projects
  * Hackathon participation
- One sentence about why you're a good fit for THIS SPECIFIC ROLE - keep it natural and genuine
- Mention CV attachment
- DO NOT include contact details or signature at the end
- Avoid words like: "enthusiastic", "passionate", "eager", "thrilled", "excited", "leverage", "utilize", "synergy"
- Sound like a confident professional having a natural conversation, not reading from a template

Keep it short and impactful. Return ONLY the email body text.
`
    }];

    let email = await callGroq(messages);
    
    // Add static contact information signature at the end
    const signature = `\n\nThank you for your consideration.\n\nBest regards,\nRavindu Sandumith\n0776082132\nravindus.me\nravindusandumith171@gmail.com`;
    
    // Remove any existing signature-like content
    const lines = email.split('\n');
    const filteredLines = [];
    let skipRest = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
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
    
    console.log(`✅ Email generated for ${positionTitle}`);
    return email;
    
  } catch (error) {
    console.error('Email generation error:', error.message);
    throw new Error('Failed to generate email');
  }
}

module.exports = {
  analyzeJobVsCV,
  generateEmail,
  extractCompanyEmail,
  extractJobTitle,
  detectMultiplePositions,
  analyzeMultiplePositions,
  generateEmailForPosition
};

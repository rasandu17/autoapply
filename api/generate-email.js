// Vercel Serverless Function - Generate Email for Specific Position
const geminiService = require('../backend/geminiService');

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
    const { jobText, positionTitle } = req.body;

    if (!jobText || !positionTitle) {
      return res.status(400).json({ 
        error: 'Missing required fields: jobText and positionTitle' 
      });
    }

    console.log(`🤖 Generating email for position: ${positionTitle}`);
    
    const email = await geminiService.generateEmailForPosition(jobText, positionTitle);
    
    console.log('✅ Email generated');
    
    res.status(200).json({ 
      email,
      positionTitle,
      success: true 
    });

  } catch (error) {
    console.error('❌ Error generating email:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate email', 
      details: error.message 
    });
  }
}

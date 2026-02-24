// Vercel Serverless Function - Analyze Specific Position
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
    
    res.status(200).json({ 
      analysis,
      email,
      positionTitle,
      success: true 
    });

  } catch (error) {
    console.error('❌ Error analyzing position:', error.message);
    res.status(500).json({ 
      error: 'Failed to analyze position', 
      details: error.message 
    });
  }
}

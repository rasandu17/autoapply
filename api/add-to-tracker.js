// Vercel Serverless Function - Add to Google Sheets Tracker
const sheetsService = require('../backend/sheetsService');

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
    const { jobTitle, companyEmail, matchPercentage, notes } = req.body;

    if (!jobTitle || !companyEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: jobTitle and companyEmail' 
      });
    }

    // Check if Google Sheets is configured
    if (!sheetsService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Google Sheets not configured',
        message: 'Please set up Google Sheets integration to use tracking feature'
      });
    }

    console.log(`📊 Adding to tracker: ${jobTitle}`);
    
    const result = await sheetsService.addToTracker({
      jobTitle,
      companyEmail,
      matchPercentage,
      notes
    });

    res.status(200).json({ 
      success: true, 
      message: 'Added to tracker successfully!',
      updatedCells: result.updatedCells 
    });

  } catch (error) {
    console.error('Error adding to tracker:', error.message);
    res.status(500).json({ 
      error: 'Failed to add to tracker', 
      details: error.message 
    });
  }
}

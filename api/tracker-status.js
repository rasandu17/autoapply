// Vercel Serverless Function - Check Google Sheets Tracker Status
const sheetsService = require('../backend/sheetsService');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const isConfigured = sheetsService.isConfigured();
    res.status(200).json({ 
      configured: isConfigured,
      message: isConfigured ? 'Tracking enabled' : 'Tracking not configured'
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
}

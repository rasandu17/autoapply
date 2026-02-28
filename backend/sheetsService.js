// Google Sheets Service - Track Job Applications
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Initialize Google Sheets API
let sheetsClient = null;

function initializeSheetsClient() {
  try {
    // Check if credentials file exists
    const credentialsPath = path.join(__dirname, 'google-credentials.json');
    
    if (!fs.existsSync(credentialsPath)) {
      console.warn('⚠️  Google Sheets: No credentials file found. Tracking feature disabled.');
      return null;
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets API initialized');
    return sheetsClient;
    
  } catch (error) {
    console.error('❌ Failed to initialize Google Sheets:', error.message);
    return null;
  }
}

/**
 * Add job application to Google Sheets tracker
 */
async function addToTracker(applicationData) {
  try {
    if (!sheetsClient) {
      sheetsClient = initializeSheetsClient();
    }

    if (!sheetsClient) {
      throw new Error('Google Sheets not configured');
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID not set in environment variables');
    }

    // Auto-setup sheet with headers if needed (first time use)
    await setupTrackingSheet();

    const {
      jobTitle,
      companyEmail,
      companyName = extractCompanyName(companyEmail, jobTitle),
      matchPercentage,
      dateSent = new Date().toLocaleDateString('en-US'),
      status = 'Applied',
      notes = ''
    } = applicationData;

    // Prepare row data
    const values = [
      [
        dateSent,
        jobTitle,
        companyName,
        companyEmail,
        `${matchPercentage}%`,
        status,
        notes
      ]
    ];

    // Append to sheet
    const response = await sheetsClient.spreadsheets.values.append({
      spreadsheetId,
      range: 'Applications!A:G', // Sheet name: Applications, Columns A-G
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    console.log(`✅ Added to tracker: ${jobTitle} at ${companyName}`);
    return {
      success: true,
      updatedCells: response.data.updates.updatedCells,
      updatedRange: response.data.updates.updatedRange
    };

  } catch (error) {
    console.error('Failed to add to tracker:', error.message);
    throw error;
  }
}

/**
 * Initialize tracking sheet with headers if needed
 */
async function setupTrackingSheet() {
  try {
    if (!sheetsClient) {
      sheetsClient = initializeSheetsClient();
    }

    if (!sheetsClient) {
      return { success: false, message: 'Google Sheets not configured' };
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!spreadsheetId) {
      return { success: false, message: 'GOOGLE_SHEET_ID not set' };
    }

    // Check if sheet exists
    const spreadsheet = await sheetsClient.spreadsheets.get({ spreadsheetId });
    const sheets = spreadsheet.data.sheets || [];
    let applicationsSheet = sheets.find(s => s.properties.title === 'Applications');

    if (!applicationsSheet) {
      // Create Applications sheet
      const createResponse = await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'Applications',
                  gridProperties: { rowCount: 1000, columnCount: 7 }
                }
              }
            }
          ]
        }
      });
      
      // Get the newly created sheet info
      const newSheetId = createResponse.data.replies[0].addSheet.properties.sheetId;
      applicationsSheet = { properties: { sheetId: newSheetId, title: 'Applications' } };
    }

    // Add headers if first row is empty
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: 'Applications!A1:G1',
    });

    if (!response.data.values || response.data.values.length === 0) {
      const headers = [
        ['Date Applied', 'Job Title', 'Company', 'Company Email', 'Match %', 'Status', 'Notes']
      ];

      // First, add the header text
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: 'Applications!A1:G1',
        valueInputOption: 'USER_ENTERED',
        resource: { values: headers },
      });

      // Then format the headers (bold, blue background)
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: applicationsSheet.properties.sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.2, green: 0.5, blue: 0.9 },
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
                  }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat)'
              }
            }
          ]
        }
      });
    }

    return { success: true, message: 'Tracking sheet ready' };

  } catch (error) {
    console.error('Failed to setup tracking sheet:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Extract company name from email
 */
function extractCompanyName(email, jobTitle = '') {
  if (!email) return 'Unknown Company';
  
  // List of personal email domains
  const personalDomains = ['gmail', 'yahoo', 'outlook', 'hotmail', 'live', 'icloud', 'aol', 'protonmail'];
  
  // Extract domain without TLD
  const domain = email.split('@')[1]?.split('.')[0]?.toLowerCase() || 'unknown';
  
  // If it's a personal email domain, try to extract from job title
  if (personalDomains.includes(domain)) {
    // Try to extract company name from job title if available
    // e.g., "Software Engineer at Google" -> "Google"
    if (jobTitle) {
      const atMatch = jobTitle.match(/\bat\b\s+([A-Z][a-zA-Z\s&]+)/i);
      if (atMatch) {
        return atMatch[1].trim();
      }
      
      const forMatch = jobTitle.match(/\bfor\b\s+([A-Z][a-zA-Z\s&]+)/i);
      if (forMatch) {
        return forMatch[1].trim();
      }
    }
    
    // Return email prefix as fallback (better than "Gmail")
    const emailPrefix = email.split('@')[0];
    return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  }
  
  // Capitalize first letter for company domains
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

/**
 * Check if Google Sheets is configured
 */
function isConfigured() {
  const credentialsPath = path.join(__dirname, 'google-credentials.json');
  return fs.existsSync(credentialsPath) && !!process.env.GOOGLE_SHEET_ID;
}

/**
 * Fix headers if they're missing (debug helper)
 */
async function fixHeaders() {
  try {
    if (!sheetsClient) {
      sheetsClient = initializeSheetsClient();
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    // Clear row 1 first
    await sheetsClient.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Applications!A1:G1',
    });

    // Re-run setup
    await setupTrackingSheet();
    
    console.log('✅ Headers fixed!');
    return { success: true };
  } catch (error) {
    console.error('Failed to fix headers:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  addToTracker,
  setupTrackingSheet,
  isConfigured,
  fixHeaders
};

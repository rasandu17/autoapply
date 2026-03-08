// OCR Service using Gemini Vision API
// Fast text extraction from images

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract text from job post image using Gemini Vision
 * @param {Buffer} imageBuffer - Image buffer from multer upload
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromImage(imageBuffer) {
  try {
    console.log('🔍 Starting Gemini Vision text extraction...');
    
    // Use same model as text generation - gemini-2.5-flash supports vision
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Detect image format
    let mimeType = 'image/jpeg';
    if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
      mimeType = 'image/png';
    } else if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8) {
      mimeType = 'image/jpeg';
    }
    
    const prompt = `Extract all text from this job posting image. 
Return ONLY the extracted text, maintaining the original structure and formatting as much as possible.
Do not add any commentary or explanation.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      }
    ]);
    
    const extractedText = result.response.text().trim();
    
    console.log('✅ Text extracted from image using Gemini Vision');
    console.log(`📝 Extracted ${extractedText.length} characters`);
    
    return extractedText;
    
  } catch (error) {
    console.error('❌ Vision Error:', error.message);
    console.error('Full error:', error);
    
    // Provide user-friendly error messages based on error type
    const errorMsg = error.message || '';
    
    if (errorMsg.includes('API key') || errorMsg.includes('invalid') || errorMsg.includes('expired')) {
      throw new Error('⚠️ Gemini API key is expired or invalid. Please type the job description instead.');
    } else if (errorMsg.includes('quota') || errorMsg.includes('limit')) {
      throw new Error('⚠️ OCR service limit reached. Please type the job description instead.');
    } else if (errorMsg.includes('401') || errorMsg.includes('403')) {
      throw new Error('⚠️ Gemini API key authentication failed. Please type the job description instead.');
    } else {
      throw new Error('⚠️ OCR is not available. Please type the job description instead.');
    }
  }
}

module.exports = {
  extractTextFromImage
};

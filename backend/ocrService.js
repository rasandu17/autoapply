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
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
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
    throw new Error('Failed to extract text from image. Please try typing the job description instead.');
  }
}

module.exports = {
  extractTextFromImage
};

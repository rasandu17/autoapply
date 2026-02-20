// OCR Service using Tesseract.js
// Extracts text from images without using Gemini API

const Tesseract = require('tesseract.js');

/**
 * Extract text from job post image using Tesseract OCR
 * @param {Buffer} imageBuffer - Image buffer from multer upload
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromImage(imageBuffer) {
  try {
    console.log('🔍 Starting OCR text extraction...');
    
    const { data: { text } } = await Tesseract.recognize(
      imageBuffer,
      'eng',
      {
        logger: info => {
          // Log progress for debugging
          if (info.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
          }
        }
      }
    );
    
    // Clean up extracted text
    const cleanedText = text
      .trim()
      .replace(/\n\s*\n/g, '\n\n') // Remove excessive newlines
      .replace(/\s+/g, ' '); // Normalize whitespace
    
    console.log('✅ Text extracted from image using OCR');
    console.log(`📝 Extracted ${cleanedText.length} characters`);
    
    return cleanedText;
    
  } catch (error) {
    console.error('❌ OCR Error:', error.message);
    throw new Error('Failed to extract text from image using OCR');
  }
}

module.exports = {
  extractTextFromImage
};

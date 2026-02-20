// OCR Service using Mistral AI Pixtral Vision Model
// Fast text extraction from images using Mistral's Vision AI

const { Mistral } = require('@mistralai/mistralai');

// Initialize Mistral AI
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

/**
 * Extract text from job post image using Mistral AI Pixtral Vision (FAST!)
 * @param {Buffer} imageBuffer - Image buffer from multer upload
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromImage(imageBuffer) {
  try {
    console.log('🔍 Starting Mistral AI Vision text extraction...');
    
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Detect image format
    let imageUrl = 'data:image/jpeg;base64,';
    if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
      imageUrl = 'data:image/png;base64,';
    } else if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8) {
      imageUrl = 'data:image/jpeg;base64,';
    }
    imageUrl += base64Image;
    
    // Use Mistral's Pixtral vision model
    const result = await mistral.chat.complete({
      model: 'pixtral-12b-2409',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all text from this job posting image. Return ONLY the extracted text, maintaining the original structure and formatting. Do not add any commentary.'
            },
            {
              type: 'image_url',
              imageUrl: imageUrl
            }
          ]
        }
      ]
    });
    
    const extractedText = result.choices[0].message.content.trim();
    
    console.log('✅ Text extracted from image using Mistral AI Pixtral');
    console.log(`📝 Extracted ${extractedText.length} characters`);
    
    return extractedText;
    
  } catch (error) {
    console.error('❌ Mistral Vision Error:', error.message);
    throw new Error('Failed to extract text from image. Please try typing the job description instead.');
  }
}

module.exports = {
  extractTextFromImage
};

// OCR Service using Mistral AI Pixtral Vision Model with Gemini fallback
// Fast text extraction from images using Mistral's Vision AI

const { Mistral } = require('@mistralai/mistralai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Mistral AI (if key available)
let mistral = null;
if (process.env.MISTRAL_API_KEY) {
  mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
}

// Initialize Gemini as fallback
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract text from job post image using Mistral AI Pixtral Vision (with Gemini fallback)
 * @param {Buffer} imageBuffer - Image buffer from multer upload
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromImage(imageBuffer) {
  // Try Mistral first if available
  if (mistral) {
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
      console.error('⚠️ Mistral Vision Error:', error.message);
      console.log('🔄 Falling back to Gemini Vision...');
    }
  }
  
  // Fallback to Gemini Vision
  try {
    console.log('🔍 Using Gemini Vision for text extraction...');
    
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

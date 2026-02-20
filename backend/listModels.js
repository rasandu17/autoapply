// List all available models
require('dotenv').config();

async function listAvailableModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('\n✅ Available Gemini Models:\n');
    
    if (data.models && data.models.length > 0) {
      data.models.forEach(model => {
        if (model.supportedGenerationMethods?.includes('generateContent')) {
          console.log(`✅ ${model.name.replace('models/', '')}`);
        }
      });
    } else {
      console.log('No models found. Check your API key.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️ Please check:');
    console.log('1. Your GEMINI_API_KEY in .env is correct');
    console.log('2. Get a new key from: https://makersuite.google.com/app/apikey');
  }
}

listAvailableModels();

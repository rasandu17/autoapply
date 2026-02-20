
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Cache file path
const CACHE_FILE = path.join(__dirname, 'gemini_cache.json');

// Memory cache
let memoryCache = new Map();

// Load cache from file
function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      let data = fs.readFileSync(CACHE_FILE, 'utf-8');
      // Strip BOM and other non-JSON characters if present
      data = data.replace(/^\uFEFF/, '').trim();
      
      // If file is empty or invalid, ignore
      if (!data) return;

      const json = JSON.parse(data);
      memoryCache = new Map(Object.entries(json));
      console.log(`📦 Loaded ${memoryCache.size} cached items from disk`);
    }
  } catch (error) {
    console.error('Failed to load cache:', error.message);
  }
}

// Save cache to file
function saveCache() {
  try {
    const obj = Object.fromEntries(memoryCache);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2));
    // console.log('📦 Cache saved to disk');
  } catch (error) {
    console.error('Failed to save cache:', error.message);
  }
}

// Generate MD5 hash for key
function getCacheKey(text, prefix = '') {
  const hash = crypto.createHash('md5').update(text).digest('hex');
  return prefix ? `${prefix}_${hash}` : hash;
}

// Get from cache
function get(key) {
  return memoryCache.get(key);
}

// Set to cache
function set(key, value) {
  memoryCache.set(key, value);
  saveCache();
}

// Check if exists
function has(key) {
  return memoryCache.has(key);
}

// Initialize cache on load
loadCache();

module.exports = {
  get,
  set,
  has,
  getCacheKey
};

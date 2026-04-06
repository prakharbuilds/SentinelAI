const axios = require('axios');
const config = require('../config');

const client = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

async function analyzeText(text) {
  const response = await client.post('/analyze', { text });
  return response.data;
}

module.exports = { analyzeText };

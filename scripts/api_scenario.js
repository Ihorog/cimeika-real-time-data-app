require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:7860';

async function main() {
  try {
    // Authenticate (mock login)
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, { username: 'user', password: 'pass' });
    console.log('Login token:', loginRes.data.token);

    // Request a completion from Hugging Face endpoint
    const hfRes = await axios.post(`${BASE_URL}/ai/huggingface/completion`, { prompt: 'Hello from API scenario' });
    console.log('HF completion:', hfRes.data.choices[0].text);

    // Create a component
    const createRes = await axios.post(`${BASE_URL}/components`, { name: 'scenario-component', type: 'demo' });
    console.log('Created component:', createRes.data.id);

    // Collect data
    const collectRes = await axios.post(`${BASE_URL}/data/collect`, { dataSource: 'script', data: { example: true } });
    console.log('Collected data id:', collectRes.data.id);
  } catch (err) {
    console.error('Scenario failed:', err.response?.data || err.message);
  }
}

main();

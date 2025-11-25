require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:7860';
const HF_SPACE_URL = process.env.HF_SPACE_URL || 'https://ihorog-cimeika-api.hf.space';

async function main() {
  // Authenticate (mock login)
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, { username: 'user', password: 'pass' });
    console.log('Login token:', loginRes.data.token);
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
    return;
  }

  // Request a completion from Hugging Face endpoint (requires HUGGINGFACE_TOKEN)
  const hfToken = process.env.HUGGINGFACE_TOKEN;
  if (!hfToken) {
    console.log('HUGGINGFACE_TOKEN not set; exiting API scenario.');
    return; // Stop the scenario when the token is missing
  }
  try {
    const hfRes = await axios.post(
      `${BASE_URL}/ai/huggingface/completion`,
      { prompt: 'Hello from API scenario' }
    );
    console.log('HF completion:', hfRes.data.choices[0].text);
  } catch (err) {
    console.error('Hugging Face completion failed:', err.response?.data || err.message);
    return;
  }

  // Proxy to the deployed Hugging Face Space
  try {
    const spaceRes = await axios.post(`${BASE_URL}/ai/hf-space/completion`, {
      prompt: 'Ping from API scenario',
      spaceUrl: HF_SPACE_URL
    });
    console.log('HF Space completion:', spaceRes.data.choices?.[0]?.text || spaceRes.data);
  } catch (err) {
    console.error('Hugging Face Space call failed:', err.response?.data || err.message);
    return;
  }

  // Create a component
  try {
    const createRes = await axios.post(`${BASE_URL}/components`, { name: 'scenario-component', type: 'demo' });
    console.log('Created component:', createRes.data.id);
  } catch (err) {
    console.error('Component creation failed:', err.response?.data || err.message);
    return;
  }

  // Collect data
  try {
    const collectRes = await axios.post(`${BASE_URL}/data/collect`, { dataSource: 'script', data: { example: true } });
    console.log('Collected data id:', collectRes.data.id);
  } catch (err) {
    console.error('Data collection failed:', err.response?.data || err.message);
  }
}

main();

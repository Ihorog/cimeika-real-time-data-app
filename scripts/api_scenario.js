require('dotenv').config();
const { createApiClient } = require('../core/api');

const BASE_URL = process.env.BASE_URL || 'http://localhost:7860';
const HF_SPACE_URL = process.env.HF_SPACE_URL || 'https://ihorog-cimeika-api.hf.space';

const apiClient = createApiClient({ baseUrl: BASE_URL, timeoutMs: 8000, retries: 1, criticalRetries: 2 });

async function main() {
  // Authenticate (mock login)
  try {
    const loginRes = await apiClient.post('/auth/login', { username: 'user', password: 'pass' }, { critical: true });
    if (loginRes.status === 'error') throw new Error(loginRes.error);
    console.log('Login token:', loginRes.data.token);
  } catch (err) {
    console.error('Login failed:', err.message);
    return;
  }

  // Request a completion from Hugging Face endpoint (requires HUGGINGFACE_TOKEN)
  const hfToken = process.env.HUGGINGFACE_TOKEN;
  if (!hfToken) {
    console.log('HUGGINGFACE_TOKEN not set; exiting API scenario.');
    return; // Stop the scenario when the token is missing
  }
  try {
    const hfRes = await apiClient.post('/ai/huggingface/completion', { prompt: 'Hello from API scenario' }, { critical: true });
    if (hfRes.status === 'error') throw new Error(hfRes.error);
    console.log('HF completion:', hfRes.data.choices[0].text);
  } catch (err) {
    console.error('Hugging Face completion failed:', err.message);
    return;
  }

  // Proxy to the deployed Hugging Face Space
  try {
    const spaceRes = await apiClient.post(
      '/ai/hf-space/completion',
      {
        prompt: 'Ping from API scenario',
        spaceUrl: HF_SPACE_URL
      },
      { critical: true }
    );
    if (spaceRes.status === 'error') throw new Error(spaceRes.error);
    console.log('HF Space completion:', spaceRes.data.choices?.[0]?.text || spaceRes.data);
  } catch (err) {
    console.error('Hugging Face Space call failed:', err.message);
    return;
  }

  // Create a component
  try {
    const createRes = await apiClient.post('/components', { name: 'scenario-component', type: 'demo' });
    if (createRes.status === 'error') throw new Error(createRes.error);
    console.log('Created component:', createRes.data.id);
  } catch (err) {
    console.error('Component creation failed:', err.message);
    return;
  }

  // Collect data
  try {
    const collectRes = await apiClient.post('/data/collect', { dataSource: 'script', data: { example: true } });
    if (collectRes.status === 'error') throw new Error(collectRes.error);
    console.log('Collected data id:', collectRes.data.id);
  } catch (err) {
    console.error('Data collection failed:', err.message);
  }
}

main();

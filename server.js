const config = require('./src/config');

if (config.error) {
  console.error(
    'Configuration validation error:',
    config.error.details.map((d) => d.message).join(', ')
  );
}

if (!config.hfToken) {
  console.warn('HUGGINGFACE_TOKEN not set; Hugging Face route will be unavailable.');
}

const app = require('./src/app');

const PORT = process.env.PORT || 7860;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const fs = require('fs');
const path = require('path');

const testDataDir = path.join(__dirname, '__tests__', 'tmp');
const senseProfilePath = path.join(testDataDir, 'sense_profiles.test.json');

fs.mkdirSync(testDataDir, { recursive: true });
if (!fs.existsSync(senseProfilePath)) {
  fs.writeFileSync(senseProfilePath, '[]');
}

process.env.SENSE_PROFILE_PATH = senseProfilePath;

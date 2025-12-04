const fs = require('fs/promises');
const path = require('path');

const customProfilePath = process.env.SENSE_PROFILE_PATH;
const DATA_FILE = customProfilePath
  ? path.resolve(customProfilePath)
  : path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    '..',
    'data',
    'sense_profiles.json'
  );

async function ensureDataFile() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, '[]', 'utf-8');
    } else {
      throw error;
    }
  }
}

async function readProfiles() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  if (!raw.trim()) return [];

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Invalid JSON in ${DATA_FILE}, resetting store.`, error.message);
    await fs.writeFile(DATA_FILE, '[]', 'utf-8');
    return [];
  }
}

async function appendProfile(profile) {
  const profiles = await readProfiles();
  profiles.push(profile);
  await fs.writeFile(DATA_FILE, JSON.stringify(profiles, null, 2));
  return profiles;
}

module.exports = {
  DATA_FILE,
  ensureDataFile,
  readProfiles,
  appendProfile
};

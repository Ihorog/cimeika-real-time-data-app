const fs = require('fs');
const path = require('path');
const express = require('express');
const { makeResponse } = require('./utils/responseHelper');

const router = express.Router();
const modulesConfigPath = path.join(__dirname, 'modules.json');
const staticModuleDir = path.join(__dirname, 'static_modules');

const isValidModuleName = (name) => /^[a-zA-Z0-9_-]+$/.test(name);

function loadModules() {
  if (!fs.existsSync(modulesConfigPath)) {
    return {};
  }

  const { active = [] } = JSON.parse(fs.readFileSync(modulesConfigPath, 'utf-8'));
  const loaded = {};

  active.forEach((moduleName) => {
    if (!isValidModuleName(moduleName)) {
      console.warn(`Skipping invalid module name: "${moduleName}"`);
      return;
    }

    const candidates = [
      path.join(__dirname, `${moduleName}.js`),
      path.join(staticModuleDir, `${moduleName}.js`)
    ];

    const modulePath = candidates.find((candidate) => fs.existsSync(candidate));

    if (!modulePath) {
      console.warn(`Module "${moduleName}" listed in modules.json but not found.`);
      return;
    }

    loaded[moduleName] = require(modulePath);
  });

  return loaded;
}

const modules = loadModules();

router.get('/', (req, res) =>
  res.json(makeResponse('v1', { availableModules: Object.keys(modules) }))
);

Object.entries(modules).forEach(([name, moduleRouter]) => {
  router.use(`/${name}`, moduleRouter);
});

module.exports = router;

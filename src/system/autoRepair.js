const { exec } = require('child_process');

function restartModule(moduleName) {
  console.log(`🛠 Відновлення модуля: ${moduleName}`);
  exec(`pm2 restart ${moduleName}`, (err) => {
    if (err) {
      console.error(`❌ Помилка при перезапуску ${moduleName}:`, err);
    } else {
      console.log(`✅ Модуль ${moduleName} успішно перезапущено.`);
    }
  });
}

module.exports = { restartModule };

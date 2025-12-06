# DEPENDENCY_OPTIMIZATION

## Node.js/JS
- Видалено `axios` і `axios-retry` з `package.json`, `frontend/package.json` та обох lock-файлів; усі виклики перенесено на `core/api`.
- Створено типи `core/api/index.d.ts` для фронтенду, щоб уникнути локальних копій HTTP-клієнтів.
- Стан npm: **Node/npm відсутні в середовищі**, тому `npm prune` та `npm audit fix --only=prod` не виконувалися. Після встановлення Node рекомендується:
  - `npm install` у корені та `frontend/`;
  - `npm prune && npm audit fix --only=prod` для підтвердження чистоти зависимостей.

## Python
- Файл `backend/requirements.txt`: fastapi==0.115.5, uvicorn==0.32.1 тощо.
- Спроба `pip list --outdated` була перервана через довгий час виконання/повідомлення про оновлення pip. Необхідно повторити у стійкому середовищі та за потреби оновити FastAPI (0.115.x ➜ останню патч-версію).

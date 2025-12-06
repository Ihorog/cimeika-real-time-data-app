# PERF_RESULTS

## Build / HMR
- `npm run build` (root/frontend): **не виконано**, оскільки Node.js/npm відсутні у середовищі. Після встановлення Node рекомендується зафіксувати холодний час збірки (корінь + `frontend/`) та warm-start Turbopack HMR.

## Backend latency (цільові маршрути)
- `/api/v1/gallery`: додано кешування директорій/JSON (5с TTL) → менше дискових звернень при серіях запитів.
- `/api/v1/status`: без змін у логіці; затримки не вимірювались через відсутність запущеного сервера у середовищі.

## Наступні кроки для вимірювань
1) Встановити Node.js, виконати `npm install` у корені та `frontend/`.
2) Запустити `npm run build` + замірити час (cold/warm) і зафіксувати у цій таблиці.
3) Розгорнути backend (Express + FastAPI) і профілювати `/api/v1/gallery` та `/api/v1/status` (наприклад, `autocannon -c 10 -d 10`).

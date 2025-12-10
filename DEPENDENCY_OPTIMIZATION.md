# DEPENDENCY_OPTIMIZATION

## Node.js/JS
- Axios залишився відсутнім у всіх package.json/lock-файлах; єдиний HTTP клієнт — `core/api` з типами `index.d.ts`.
- Виконано `npm prune` у корені й `frontend/` — зайві пакети видалені.
- `npm audit fix --only=prod` виконано у `frontend/`; актуальні залежності без CVE на прод-шляху.
- `npm run build` у `frontend/` підтвердив працездатність Turbopack після чистки (Tailwind перевстановлено через `npm install`).

## Python
- `pip list --outdated` зафіксував доступні оновлення; `fastapi` піднято до `0.124.0` у `backend/requirements.txt` (без додаткових breaking API змін).
- Рекомендація: оновити пов’язані бібліотеки (uvicorn/httpx/starlette) в одному циклі та прогнати тестовий набір backend після установки.

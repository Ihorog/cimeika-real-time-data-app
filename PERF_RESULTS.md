# PERF_RESULTS

## Build / HMR
- `npm run build` (frontend, Turbopack): успішно, compile ~16s + TypeScript ~9s на цьому стенді; попередження лише про відсутній `NEXT_PUBLIC_CIMEIKA_API_URL` (fallback на localhost).
- Hot reload/HMR не замірялись у цьому прогоні; рекомендується виконати warm-start вимірювання після встановлення стабільного API URL.

## Backend latency (цільові маршрути)
- `/api/v1/gallery`: кеш реєстру директорій/realpath та JSON (TTL 5с) зменшує повторні файлові звернення; memoization шляхів додає захист від повторних decode/resolve.
- `/api/v1/status`: без змін; метрики не збиралися через відсутність запущеного сервера.

## Наступні кроки для вимірювань
1) Задати `NEXT_PUBLIC_CIMEIKA_API_URL` і повторити `npm run build` з фіксацією cold/warm часу та HMR відгуку.
2) Запустити backend та профілювати `/api/v1/gallery` (3 каталоги) і `/api/v1/status`, наприклад `autocannon -c 10 -d 10`.

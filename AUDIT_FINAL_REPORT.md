# AUDIT_FINAL_REPORT

## Перевірено
- Backend FastAPI маршрути + інтеграції (pytest). Express API v1 з галереєю/календарем, клієнти фронтенду, глобальні стилі Tailwind.
- Безпека: base URL policy, path traversal у `/api/v1/gallery/mood`, Dockerfile користувача.
- UX: TodayWidget, Calendar/Gallery копірайт, notification UX.
- Залежності: npm audit (frontend), pip outdated (backend).

## Знайдено та виправлено
- Уніфіковано API доступ через `frontend/src/lib/api.ts`; календарний/галерейний клієнти переписані на fetch.
- `resolveBaseUrl` тепер валідує prod середовище та логує dev-fallback.
- Захист від traversal у `src/routes/api/v1/gallery.js` + негативні тести у `__tests__/api_v1_gallery.test.js`.
- UX: TodayWidget без `alert`, з опціональним `onQuickAdd` і inline notification; очищені апострофи (uk-UA).

## Результати тестів
- `python -m pytest backend/tests` — **passed**.
- `npm run lint` — **passed** (Node 20.19.6).
- `NEXT_PUBLIC_CIMEIKA_API_URL=http://localhost:8000 npm run build` — **passed** (потрібне налаштування змінної для CI).

## Відкриті ризики
- High CVE для `axios` (<1.12) за результатами `npm audit` — потребує оновлення пакета.
- CI стани GitHub Actions не перевірені локально; необхідно додати `NEXT_PUBLIC_CIMEIKA_API_URL` у CI secrets/vars.
- Backend залежності застарілі (FastAPI/httpx/uvicorn); потрібен окремий спринт на апдейти та ретести.

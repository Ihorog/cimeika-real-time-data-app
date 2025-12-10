# AUDIT_FINAL_REPORT

## Перевірено
- Express API v1 (галерея/календар/ci), FastAPI роутери, фронтенд клієнти Next.js, глобальні Tailwind стилі.
- Безпека: base URL policy, path traversal у `/api/v1/gallery/mood`, структуровані JSON-логи доступу/відмов.
- UX/перформанс: TodayWidget, Gallery lazy-load/blur previews, notification UX, Turbopack build.
- Залежності: ревізія package.json (корінь + frontend), оновлення FastAPI, фактичні npm prune/audit.

## Знайдено та виправлено
- Єдиний клієнт `core/api` з `onError`, тайм-аутами, backoff/retry; Axios відсутній у коді та залежностях.
- Глобальна локаль `uk-UA` у `config/locale.ts`; календар/галерея/UI використовують спільні дати.
- Gallery: кеш realpath/readdir (5с), memoization шляхів, кешоване читання JSON, структуровані логи `path_*`, `gallery_*`.
- TodayWidget: неблокуюче оновлення state, єдиний авто-dismiss таймер без дублювання `setTimeout`.
- Tailwind імпорти впорядковані, токени кольорів інлайн, мертві імпорти видалені.

## Результати тестів
- `npm run build` (frontend/Turbopack) — успішно, compile ~16s + TS ~9s на поточному стенді; попередження лише про відсутній API URL (fallback на localhost).
- `npm prune` (root + frontend) і `npm audit fix --only=prod` (frontend) виконано; CVE на прод-шляху не виявлено.
- `pip list --outdated` виконано; FastAPI оновлено до 0.124.0 у requirements (потребує установки в CI).

## Відкриті ризики
- Необхідно зафіксувати продовжений набір тестів/latency після налаштування `NEXT_PUBLIC_CIMEIKA_API_URL`.
- Backend залежності (uvicorn/httpx/starlette) ще не оновлені; потребують сумісної перевірки.

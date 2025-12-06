# AUDIT_FINAL_REPORT

## Перевірено
- Express API v1 (галерея/календар/ci), FastAPI роутери, фронтенд клієнти Next.js, глобальні Tailwind стилі.
- Безпека: base URL policy, path traversal у `/api/v1/gallery/mood`, структуровані логи доступу.
- UX/перформанс: TodayWidget, Gallery lazy-load/blur previews, notification UX.
- Залежності: ручна ревізія package.json, часткова перевірка pip (див. Dependency Optimization).

## Знайдено та виправлено
- Єдиний клієнт `core/api` (тайм-аути, backoff, retries) для Node і Next; Axios повністю видалений.
- Глобальна локаль `uk-UA` винесена у `config/locale.ts`; календар/галерея/UI компоненти використовують спільні дати.
- Gallery: кеш realpath/readdir (5с), мемоізація JSON, структуровані JSON-логи доступу/відмов; `next/image` + blur/lazy секції.
- TodayWidget: неблокуюче `useTransition` + єдиний таймер-диспетчер сповіщень.
- Tailwind імпорти впорядковані, мертві стилі прибрано.

## Результати тестів
- Автоматизовані тести/збірки не запускалися: у середовищі відсутні Node.js/npm; `pip list --outdated` було зупинено через затримку (див. журнали).
  - Для відтворення: встановити Node, виконати `npm install`, `npm test` у корені та `frontend/`, після чого `npm run build`.

## Відкриті ризики
- Node.js/npm відсутні: необхідно підтвердити збірку, тести та audit після встановлення середовища.
- CI secrets/vars потрібно оновити (`NEXT_PUBLIC_CIMEIKA_API_URL`) для стабільного build.
- Backend залежності застарілі (FastAPI/httpx/uvicorn); потрібен окремий цикл оновлення й ретестів.

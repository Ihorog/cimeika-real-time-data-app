# INTEGRATION_REPORT

## Формат даних
- Фронтенд клієнти календаря/галереї (`frontend/src/utils/*.js`) повертають один формат `ApiResult { status, data|error }` завдяки загальному `core/api`.
- Backend відповіді API v1 залишаються у схемі `{ status, module, data, timestamp }`, що споживається dashboard компонентами без трансформацій.

## Локалізація
- Локаль `uk-UA` та опції форматування дат винесено в `config/locale.ts`; GalleryGrid, GalleryTimeline та TodayWidget використовують спільну конфігурацію.

## Модулі
- Dashboard/Gallery/Calendar працюють на єдиному API helper (fetch + backoff), що спрощує HMR/Turbopack кешування через `experimental.externalDir`.
- Gallery має lazy-load секції, щоб не блокувати рендер інших модулів.

## Рекомендації
- Оновити інші компоненти з ручними `toLocaleDateString` на використання `config/locale.ts`, щоб уникнути дублювань.
- Після появи реальних API ендпоінтів додати схеми валідації (zod/yup) поряд із `ApiResult`, щоб не змішувати сирі та перетворені дані.

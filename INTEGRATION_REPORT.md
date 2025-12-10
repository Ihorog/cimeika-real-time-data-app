# INTEGRATION_REPORT

## Формат даних
- Фронтенд і backend узгоджені на формат `{ status, data|error, statusCode? }`; `makeResponse` лишається джерелом `{ status, module, data, timestamp }` для API v1.
- `core/api` повертає однакові контракти для Calendar, Gallery, Dashboard; клієнти споживають без додаткових трансформацій.

## Локалізація
- Локаль `uk-UA` та опції форматування дат централізовані у `config/locale.ts`; TodayWidget, GalleryGrid/GalleryTimeline використовують спільні константи.
- Рекомендація: мігрувати решту ручних форматувань дат на цей конфіг для усунення дублювань.

## Модулі
- Dashboard підтягує Gallery як відкладене завантаження через внутрішній lazy-триггер (IntersectionObserver), що мінімізує вплив на рендер CI/Calendar блоків.
- API звернення проходять через `core/api` з retry/backoff, що спрощує HMR/Turbopack кеш та логіку помилок.

## Узгодженість
- Загальна локальна конфігурація та відповідь `{ status, data }` узгоджені між Calendar, Gallery та Dashboard; додаткові поля (`module`, `timestamp`) залишаються сумісними з існуючими клієнтами.

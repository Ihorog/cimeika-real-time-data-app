# AUDIT_PERFORMANCE

## Оптимізація API та ядра
- `core/api` лишено єдиним джерелом HTTP: додано централізований `onError` хук, уніфіковані тайм-аути, backoff і retries для критичних викликів та формат помилки `{ status, statusCode, error }`.
- Глобальні клієнти (Next + Node) використовують той самий helper; fallback на `undici` зберігається для серверних середовищ.

## Frontend (Next.js / Turbopack)
- Галерея продовжує працювати через `next/image` з `blurDataURL`; секції grid/timeline лишені lazy-load через IntersectionObserver для зменшення blocking work.
- TodayWidget переведений на безблокову модель: єдиний авто-dismiss таймер, state-оновлення через `useTransition`, відсутні дублювання `setTimeout`.
- `globals.css` впорядковано: Tailwind директиви на початку, токени кольорів інтегровані без зайвих імпортів.
- Turbopack build пройдено успішно (`npm run build` у `frontend/`), кешування externalDir збережене; попередження лише про відсутність прод API URL (підхоплюється fallback).

## Backend
- `/api/v1/gallery` тепер має TTL-кеш для realpath/readdir (5с), memoization шляхів, кешоване читання JSON і low-cost JSON-логи (path_attempt/path_denied/cache_hit/upload/list).

## Рекомендації
- Для реальних медіа додати webp/avif прев’ю та згенерувати `blurDataURL` у build-стадії.
- Після налаштування `NEXT_PUBLIC_CIMEIKA_API_URL` зафіксувати warm-HMR метрики Turbopack на стабільному залізі.

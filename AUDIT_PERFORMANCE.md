# AUDIT_PERFORMANCE

## Оптимізація API та ядра
- Запроваджено єдиний fetch-клієнт `core/api` з тайм-аутами, експоненційним backoff та повторними спробами для критичних викликів.
- Всі Node/Next модулі (realtime, HF proxу, ciwiki, frontend api) переведено на центральний клієнт; Axios видалено.
- Додано fallback на `node:undici` для середовищ без глобального `fetch`.

## Frontend (Next.js / Turbopack)
- Галерея переходить на `next/image` з `blurDataURL` та lazy-load секціями через IntersectionObserver.
- TodayWidget використовує неблокуючу модель через `useTransition` і єдиний таймер-диспетчер для сповіщень.
- Tailwind порядок імпорту очищено; мертві стилі (`.ci-gradient`) видалені.
- Turbopack: увімкнено `experimental.externalDir` для стабільного кешу при використанні спільного `core/api`.

## Backend
- `/api/v1/gallery` кешує читання директорій/realpath на 5 секунд і мемоізує JSON-дані галереї.
- Додано структуровані JSON-логи для спроб доступу до файлів, відмов та успішних читань.

## Спостереження/рекомендації
- Node.js/ npm відсутні у середовищі: збірка Turbopack не заміряна. Після інсталяції Node запустити `npm run build` у корені та `frontend/` для реальних метрик.
- Потрібно додати невеликі webp/avif прев’ю замість SVG, якщо з’являться реальні фото (заощадить мережевий трафік).

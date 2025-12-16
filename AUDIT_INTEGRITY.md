# AUDIT_INTEGRITY

## Виконані виправлення
- **Єдиний API-клієнт**: календарний та галерейний клієнти (`frontend/src/utils/calendarClient.js`, `frontend/src/utils/galleryClient.js`) переведені на канонічний fetch-клієнт `frontend/src/lib/api.ts`, без axios-інстансів.
- **Base URL discipline**: `resolveBaseUrl` тепер вимагає `NEXT_PUBLIC_CIMEIKA_API_URL` у production, з dev-warning і fallback на localhost лише у non-prod.
- **Стилістична консистентність**: виправлено рядки з HTML-ентіті (`&#39;`) на звичайні апострофи через JSX-рядки; TodayWidget/Calendar тексти синхронізовані.
- **Tailwind/CSS**: підтверджено порядок директив Tailwind у `globals.css`, збережено імпорт токенів та відсутність конфліктів.

## Потенційні зони уваги
- TypeScript збірка потребує встановленого `NEXT_PUBLIC_CIMEIKA_API_URL` навіть локально — для CI слід налаштувати секрет/variable.
- Шляхи імпорту з alias `@/*` коректні для Turbopack; відносні імпорти у компонентах залишені, хаотичних `../../..` у критичних місцях не виявлено під час рев’ю.

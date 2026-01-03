# Calendar+ Frontend API & UI Guide

Цей документ описує фронтенд-орієнтовані ендпоїнти та компоненти Calendar+ для фази 7.

## Ключові ендпоїнти

- `GET /api/v1/calendar/insights` — повертає агрегати часу (work/rest), резонанс подій та історію синхронізацій.
- `POST /api/v1/calendar/sync/google` — запускає OAuth2-потік для Google Calendar та імпортує події.
- `POST /api/v1/calendar/sync/outlook` — аналогічний потік для Outlook.
- `GET /api/v1/calendar/family/:shared_calendar_id` — завантажує спільні сімейні події.
- `GET /api/v1/calendar/health/:provider` — синхронізація Apple Health / Google Fit / Fitbit у форматі подій.
- `GET /api/v1/calendar/local?city=&interest=` — рекомендації Eventbrite / KARABAS.ua / Google Events за містом та інтересами.

## React-компоненти

- **CalendarSmart.jsx** — головний контейнер з аналітикою патернів (`analyzeUserPatterns`) та автопропозиціями.
- **RecommendationsPanel.jsx** — фільтровані поради для агрономів, сімей і студентів, з авто-нагадувачем (`generateSmartReminders`).
- **SyncSettings.jsx** — стани OAuth2 для Google/Outlook, фінансових API та соціальних webhook-ів.
- **TodayWidget.jsx** — віджет "Сьогодні" з кнопкою голосового додавання події.
- **TimeAnalyticsChart.jsx** — графік work/rest на базі `GET /insights`.
- **HistoryTimeline.jsx** — візуальна історія синхронізацій та health/finance подій.
- **EducationSchedule.jsx** та **LearningProgressCard.jsx** — навчальні сценарії, розклад та прогрес студентів.

## Axios клієнт

Файл `frontend/src/utils/calendarClient.js` експортує готовий клієнт на базі Axios із базовим URL `NEXT_PUBLIC_API_BASE_URL` (fallback `http://localhost:3000/api/v1`).

Доступні методи:
- `fetchCalendarInsights()`
- `syncExternalCalendar(provider)`
- `fetchFamilyCalendar(sharedId)`
- `fetchHealthEvents(provider)`
- `fetchLocalRecommendations(city, interests)`
- `analyzeUserPatterns(events)` — локальний аналіз патернів для UI.
- `generateSmartReminders(userContext)` — швидкі рекомендації для агрономів/студентів/сімей.

## Тестування

Для smoke-тестів фронтенду використовуйте наявний Jest-пайплайн проєкту (`npm test -- --runInBand`). API виклики у компонентах мають мокатись nock/supertest при необхідності.

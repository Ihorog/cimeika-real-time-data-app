# AUDIT_BASELINE

## Архітектурна карта (поточний стан)
- **Backend (FastAPI)**: `backend/main.py`, роутери в `backend/routers/*`, тести в `backend/tests`.
- **Node API (Express)**: `src/app.js` + `src/routes/api/v1/*` (calendar, gallery, kazkar, mood, podia, ci тощо), інтеграції з Hugging Face/OpenAI.
- **Frontend (Next.js 16 + Turbopack)**: додаток у `frontend/src/app`, спільні клієнти в `frontend/src/lib` та утилітах, стилі Tailwind у `frontend/src/app/globals.css`.
- **API-клієнти**: канонічний `frontend/src/lib/api.ts`; спеціалізовані адаптери календаря/галереї в `frontend/src/utils/*Client.js` на базі цього клієнта.
- **Маршрути календаря/галереї**: 
  - Next.js сторінки: `frontend/src/app/modules/calendar`, `frontend/src/app/modules/gallery`, `frontend/src/components/CalendarSmart.jsx`, `TodayWidget.jsx`.
  - Node API: `src/routes/api/v1/calendar.js`, `src/routes/api/v1/gallery.js`.
- **Конектори**: OpenAI/HF/Telegram згадані в конфігурації (`src/routes/api/v1`, `backend/config.py`), без витоку секретів у репозиторії.

## CI стан (локальне спостереження)
- GitHub Actions історія недоступна локально; локально перевірено: `python -m pytest backend/tests`, `npm run lint`, `npm run build` (з встановленим `NEXT_PUBLIC_CIMEIKA_API_URL`).
- Dockerfile для backend збирається на non-root користувача (`backend/Dockerfile`).

## Виявлені базові ризики
- Production build залежить від `NEXT_PUBLIC_CIMEIKA_API_URL`; без змінної збірка валиться (очікувана поведінка після посилення безпеки).
- `npm audit --omit=dev` показує 1 High (axios <1.12) — потребує адресації окремо.

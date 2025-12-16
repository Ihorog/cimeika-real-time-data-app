# Ops & Observability

## Логування
- Backend використовує `logging.basicConfig` з рівнем `INFO` і таймстемпами.
- Frontend фіксує помилки у консолі тільки у режимі `development`; у production передбачено TODO для відправлення критичних подій на моніторинговий endpoint.

## Health-check
- `/health` доступний без авторизації та повертає `{ "status": "ok", "service": "cimeika-api" }`.

## TODO
- Підключити Sentry/Prometheus/Grafana для алертингу та побудови метрик.
- Узгодити формат структурованих логів для клієнтів і бекенду.
- Додати uptime-моніторинг із зовнішнім пінгом для Hugging Face/Vercel розгортань.

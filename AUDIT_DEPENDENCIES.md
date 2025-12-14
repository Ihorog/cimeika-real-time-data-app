# AUDIT_DEPENDENCIES

## npm (frontend)
- `npm audit --omit=dev` → High: axios 1.0.0-1.11.x (DoS). Рекомендація: оновити до >=1.12.0 (впливає на фронтенд та утиліти API).
- Build виконується на Node 20.19.6 (через `n`); Next.js вимагає >=20.9.

## pip (backend)
- `pip list --outdated` показує оновлення для FastAPI (0.123.10), httpx (0.28.1), uvicorn (0.38.0), pytest 9.0.1 тощо. 
- Потребує плану апгрейду пакетів із перевіркою сумісності (особливо FastAPI/Starlette + pydantic 2.x).

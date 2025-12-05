# AUDIT_SECURITY

## Знайдені та усунуті проблеми
- **API base URL**: `frontend/src/lib/api.ts` тепер кидає помилку у production при відсутності `NEXT_PUBLIC_CIMEIKA_API_URL`; у dev — явний `console.warn` і fallback на `http://localhost:8000`.
- **Path traversal (gallery mood)**: `src/routes/api/v1/gallery.js` використовує `fs.realpathSync.native` + `decodeURIComponent` та фіксований `RESOLVED_IMAGE_ROOT` (data/) з помилкою 400 для невалідних шляхів.
- **Негативні тести**: додані кейси проти `../` та `%2F` у `__tests__/api_v1_gallery.test.js`, що підтверджують захист перед виконанням Python-аналітики.
- **Docker безпечність**: `backend/Dockerfile` підтверджує створення `appuser` + `USER appuser`, без секретів у шарі образу.

## Залишкові ризики
- **Axios High CVE** у фронтенд-залежностях (audit) — потребує оновлення >1.11.0.
- **Секрети для CI**: build валиться без `NEXT_PUBLIC_CIMEIKA_API_URL`; необхідно додати секрет у GitHub Actions/Env для prod build.

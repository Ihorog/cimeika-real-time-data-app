# Slack-ready структура Cimeika

> Копіпастний фрагмент для повідомлення у Slack з реальними шляхами до ключових директорій і файлів у репозиторії.

## Структура (готово для вставки)
```
cimeika-real-time-data-app/
├─ server.js                       # Вхідна точка Node/Express + валідація ENV
├─ core/api/                       # Універсальний fetch-клієнт із ретраями та таймаутами
├─ src/
│  ├─ app.js                       # Збирання middleware, SSE-хендлерів і маршрутів
│  ├─ config.js                    # Joi-схема для ENV (Hugging Face, SSE, кешів тощо)
│  ├─ middleware/requireHfToken.js # Гейт для маршрутів, що потребують HUGGINGFACE_TOKEN
│  ├─ routes/                      # REST та proxy-маршрути (api/v1, Hugging Face, realtime, auth mocks)
│  │  ├─ api/v1/                   # Календар, галерея, Ci-sense, orchestrator, legend, health
│  │  └─ __mocks__/                # Мокові відповіді для тестів
│  ├─ services/ciwikiClient.js     # Клієнт до CI Wiki через API клієнт з core/
│  └─ system/autoRepair.js         # Самовідновлення кешів та системного стану
├─ public/                         # Статичний UX-шар (landing + service worker)
│  ├─ components/                  # Header/footer шаблони для сторінок
│  ├─ pages/                       # Домашня сторінка та вкладки
│  ├─ scripts.js                   # Логіка клієнта для форм і SSE
│  ├─ styles.css                   # Базові стилі без Tailwind
│  └─ service-worker.js            # Кешування статичних ресурсів
├─ api/                            # Python-скрипти: сенсоматика, галерея, sense_server
│  └─ v1/                          # Допоміжні сценарії для версії v1
├─ backend/                        # FastAPI оркестратор + сенсовий двигун
│  ├─ main.py                      # Точка входу FastAPI і реєстрація router-ів
│  ├─ config.py                    # Pydantic-конфіг для API ключів і шардінгу
│  ├─ routers/                     # Маршрути модулів (ci, mood, podia, gallery тощо)
│  ├─ utils/                       # Оркестратор задач, axis_loader, connectors, sense_engine
│  └─ tests/                       # Pytest-сценарії для backend API
├─ frontend/                       # Next.js (App Router) для модулів Ci
│  ├─ src/app/                     # Сторінки: ci, mood, malya, calendar, gallery, podia, dashboard
│  ├─ src/components/              # UI-компоненти (навігація, картки, форми)
│  ├─ src/lib/                     # API клієнти, SSE-хелпери, constants
│  ├─ src/styles/                  # Tailwind токени, глобальні стилі
│  ├─ src/utils/                   # Утиліти для форматування та даних
│  └─ public/                      # Публічні ресурси фронтенду
├─ data/                           # JSON-джерела для подій, галереї, сенс-профілів, системного монітору
├─ __tests__/                      # Jest-тести для Node API та middleware
├─ scripts/                        # CLI-утиліти (API smoke, кеші, деплой скрипти)
├─ cimeika-api.yaml                # OpenAPI-специфікація сервісів Cimeika
├─ swagger.json                    # Згенерований swagger для Node API
└─ package.json                    # Кореневі залежності та npm-скрипти
```

## Як використовувати
- Надішліть блок вище в потрібний канал Slack (наприклад, https://cimeikaworkspace.slack.com/archives/C074R6VH7S8) — він уже містить короткі підписи до кожної суттєвої директорії/файлу.
- Для деталізації конкретного модуля (наприклад, `backend/utils/` або `frontend/src/app/ci`) додайте локальне піддерево після цього блоку.
- Якщо в Slack треба приховати довгі шляхи, використовуйте ``` перед і після блоку, щоб зберегти форматування.

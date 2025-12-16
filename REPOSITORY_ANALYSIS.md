# Аналіз структури репозиторію Cimeika

**Дата аналізу:** 16 грудня 2025  
**Виконано:** GitHub Copilot Coding Agent

## Зміст

1. [Огляд проєкту](#огляд-проєкту)
2. [Структура файлів та директорій](#структура-файлів-та-директорій)
3. [Робочі компоненти](#робочі-компоненти)
4. [Виявлені проблеми](#виявлені-проблеми)
5. [Рекомендації щодо покращень](#рекомендації-щодо-покращень)

---

## Огляд проєкту

**Cimeika** — це сучасна веб-платформа для інтеграції даних реального часу (погода, час, астрологічні прогнози) з мультиагентною системою на базі центрального інтелектуального асистента "Ci".

### Ключові характеристики

- **Архітектура:** Dual-stack (Legacy Node.js + Modern Next.js/FastAPI)
- **Основні мови:** JavaScript/TypeScript (Node.js, Next.js), Python (FastAPI)
- **Мова інтерфейсу:** Українська (з підтримкою англійської та французької в окремих модулях)
- **Призначення:** Платформа для організації подій, відстеження настрою, творчості, казок та календаря

### Агенти системи

| Агент | Призначення | Доступ |
|-------|-------------|--------|
| **Ci** | Центральний координатор | Повний доступ |
| **ПоДія** | Організація подій | Календар, галерея |
| **Настрій** | Емоційне здоров'я | Дані користувача |
| **Маля** | Творчість | Галерея |
| **Казкар** | Духовний провідник | Обмежений згідно приватності |
| **Календар** | Управління часом | Записи календаря |
| **Галерея** | Візуальний контент | Читання/запис зображень |

---

## Структура файлів та директорій

### Кореневий рівень

```
cimeika-real-time-data-app/
├── .github/              # GitHub Actions, Copilot instructions
├── .vscode/              # VSCode налаштування
├── __tests__/            # Jest тести для Node.js коду
├── api/                  # Python API сервіси (sense server, mitca)
├── backend/              # FastAPI backend (новий стек)
├── core/                 # Спільні утиліти (API клієнт)
├── data/                 # JSON дані (календар, галерея, логи)
├── docs/                 # Додаткова документація
├── frontend/             # Next.js SPA (новий стек)
├── public/               # Статичні файли legacy frontend
├── scripts/              # Скрипти розгортання та тестування
├── src/                  # Node.js server source код
├── tests/                # Додаткові тести
├── server.js             # Express server entry point
├── package.json          # Node.js залежності
└── Dockerfile            # Docker образ для деплою
```

### Детальна структура Backend (FastAPI)

```
backend/
├── main.py               # FastAPI application entry
├── config.py             # Конфігурація (env vars)
├── requirements.txt      # Python залежності
├── routers/              # REST API роутери
│   ├── ci.py            # Ci chat/data/components
│   ├── podia.py         # ПоДія events
│   ├── mood.py          # Настрій mood tracking
│   ├── malya.py         # Маля creative
│   ├── kazkar.py        # Казкар stories
│   ├── calendar.py      # Календар time
│   └── gallery.py       # Галерея images
├── schemas/              # Pydantic models для валідації
│   └── kazkar.py        # Story request/response schemas
├── utils/                # Допоміжні модулі
│   ├── orchestrator.py  # Task orchestration (TaskOrchestrator)
│   ├── connectors.py    # HTTP bridges до зовнішніх API
│   ├── sense_engine.py  # Resonance scoring
│   └── axis_loader.py   # Axis configuration loader
└── tests/                # pytest тести
    ├── conftest.py      # Test fixtures
    ├── test_integration_routes.py
    ├── test_orchestrator.py
    └── test_axis_loader.py
```

### Детальна структура Frontend (Next.js)

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── ci/          # Ci console
│   │   ├── podia/       # ПоДія timeline
│   │   ├── mood/        # Настрій wave interface
│   │   ├── malya/       # Маля creative canvas
│   │   ├── kazkar/      # Казкар stories
│   │   ├── calendar/    # Календар time map
│   │   └── gallery/     # Галерея memories
│   ├── components/       # React компоненти
│   ├── core/            # API клієнт, utilities
│   ├── lib/             # Бібліотеки
│   └── styles/          # Глобальні стилі, design tokens
├── public/              # Статичні ресурси
├── config/              # Конфігураційні файли
├── package.json         # Frontend залежності
├── next.config.mjs      # Next.js конфігурація
├── tailwind.config.js   # Tailwind CSS налаштування
└── tsconfig.json        # TypeScript конфігурація
```

### Детальна структура Node.js Server (Legacy)

```
src/
├── app.js               # Express application setup
├── config.js            # Environment validation (Joi)
├── middleware/          # Express middleware
├── routes/              # API routes
│   ├── api/
│   │   └── v1/         # API v1 endpoints
│   │       ├── index.js         # Module loader
│   │       ├── ci.js            # Ci endpoints
│   │       ├── gallery.js       # Gallery API
│   │       ├── modules.json     # Active modules config
│   │       └── static_modules/  # Additional modules
│   ├── auth.js         # Authentication
│   ├── components.js   # Component management
│   └── realtime.js     # Real-time data (weather, time, astrology)
├── services/           # Business logic services
└── system/             # System utilities
```

### Конфігураційні файли

| Файл | Призначення |
|------|-------------|
| `.env.example` | Приклад змінних середовища (root) |
| `frontend/.env.local.example` | Приклад для Next.js |
| `backend/.env.example` | Приклад для FastAPI |
| `package.json` | Node.js залежності та scripts |
| `frontend/package.json` | Next.js залежності |
| `backend/requirements.txt` | Python залежності |
| `jest.config.js` | Jest налаштування для тестів |
| `cimeika-api.yaml` | OpenAPI specification |
| `visual_axis_manifest.json` | Axis configuration для Ci |
| `modules.json` | Конфігурація активних модулів |

---

## Робочі компоненти

### 1. Node.js Server (Express)

**Статус:** ✅ Працює з виправленнями  
**Місцезнаходження:** `server.js`, `src/`  
**Порт:** 7860 (за замовчуванням)

#### Основні модулі:

- **Real-time data endpoints** (`src/routes/realtime.js`)
  - `/api/weather` - дані погоди
  - `/api/time` - поточний час
  - `/api/astrology` - астрологічні прогнози

- **API v1** (`src/routes/api/v1/`)
  - Динамічне завантаження модулів через `modules.json`
  - Галерея, Календар, Ci endpoints
  - Path traversal protection ✅

- **Configuration** (`src/config.js`)
  - Joi валідація environment variables
  - Defaults для міста, знаку зодіаку

#### API клієнт (`core/api/`)
- Централізований HTTP клієнт
- Retry logic з exponential backoff
- Timeout handling
- Error handling з structured responses

### 2. FastAPI Backend

**Статус:** ⚠️ Працює з помилками в тестах  
**Місцезнаходження:** `backend/`  
**Порт:** 8000 (за замовчуванням)

#### Роутери:

| Роутер | Статус | Endpoints | Опис |
|--------|--------|-----------|------|
| `ci.py` | ✅ | `/ci/chat`, `/ci/data`, `/ci/components` | Центральний асистент |
| `podia.py` | ⚠️ | `/podia/events`, `/podia/events/dispatch` | Події (потребує виправлення) |
| `mood.py` | ⚠️ | `/nastiy/mood` (GET/POST) | Настрій (валідація відповіді) |
| `malya.py` | ⚠️ | `/mala/creative` (GET/POST) | Творчість (оновлено) |
| `kazkar.py` | ✅ | `/kazkar/story`, `/kazkar/history` | Казки |
| `calendar.py` | ✅ | `/calendar/time` | Календар |
| `gallery.py` | ✅ | `/gallery/images`, `/gallery/upload` | Галерея |

#### Orchestration система:

- **TaskOrchestrator** - координація задач між модулями
- **PriorityTaskScheduler** - черга з пріоритетами
- **SimpleTaskExecutor** - виконання з handler registration
- Logging до `data/orchestrator_status.log`

#### Connectors (`backend/utils/connectors.py`):
- HTTP bridges до зовнішніх API
- Timeout handling (5s default)
- Structured error responses `{status, data|error, message}`

### 3. Next.js Frontend

**Статус:** ✅ Працює (Turbopack build успішний)  
**Місцезнаходження:** `frontend/`  
**Версія:** Next.js 16.0.7, React 19.2.0

#### Сторінки (App Router):

- `/ci` - Ci console
- `/podia` - ПоДія timeline
- `/mood` - Настрій wave interface
- `/malya` - Маля creative canvas
- `/kazkar` - Казкар stories
- `/calendar` - Календар time map
- `/gallery` - Галерея memories

#### Технології:

- **Framer Motion** (11.11.17) - анімації
- **Tailwind CSS** (3.4.14) - стилізація
- **Zustand** (5.0.2) - state management
- **TypeScript** - типізація
- **Design tokens** у `src/styles/tokens.css`

#### Оптимізації:

- Lazy loading компонентів
- Blur previews для зображень галереї
- TodayWidget з неблокуючим оновленням
- Turbopack build (~16s compile + ~9s TS)

### 4. Тестування

#### Jest тести (Node.js)

**Статус:** ⚠️ Помилка компіляції  
**Місцезнаходження:** `__tests__/`

**Проблема:** `safeName is not defined` в `src/routes/api/v1/index.js:29` (виправлено)

**Тестові файли:**
- `api.test.js` - загальні API тести
- `api_v1.test.js` - API v1 тести
- `api_v1_gallery.test.js` - галерея
- `api_v1_ci_sense.test.js` - Ci sense
- `realtime.test.js` - real-time endpoints
- Мокування HF API у `src/routes/__mocks__/`

#### pytest тести (Python)

**Статус:** ⚠️ 8 passed, 4 failed  
**Місцезнаходження:** `backend/tests/`

**Виконані тести:**
- ✅ `test_axis_loader.py` - всі пройшли
- ✅ `test_orchestrator.py` - 2/3 пройшли
- ⚠️ `test_integration_routes.py` - 6/8 пройшли
- ⚠️ `test_podia_orchestrator.py` - 0/1 пройшов

**Помилки після виправлень:**
1. `test_capture_mood_uses_api_summary` - Response validation error (Dict vs MoodResponse)
2. `test_generate_art_uses_remote_status` - KeyError 'hf_dataset' (видалено в оновленні)
3. `test_executor_marks_tasks_with_handlers` - AttributeError: 'register_handler' замість 'register'
4. `test_dispatch_event_uses_podia_handler` - 502 Bad Gateway замість 200

### 5. Документація

**Статус:** ✅ Добре структурована

| Документ | Опис |
|----------|------|
| `README.md` | Основна документація, installation, usage |
| `ARCHITECTURE.md` | Опис архітектури системи |
| `AGENTS.md` | Специфікація агентів (українською) |
| `INTEGRATION_REPORT.md` | Звіт про інтеграцію модулів |
| `AUDIT_FINAL_REPORT.md` | Фінальний аудит якості |
| `AUDIT_SECURITY.md` | Аудит безпеки |
| `AUDIT_PERFORMANCE.md` | Аудит продуктивності |
| `.github/copilot-instructions.md` | Інструкції для GitHub Copilot |

### 6. Безпека

**Статус:** ✅ Впроваджені механізми захисту

#### Реалізовані заходи:

1. **Path traversal protection** у Gallery module
   - `ensureWithinRoot()` валідація
   - `fs.realpathSync.native()` перевірка
   - `ALLOWED_IMAGE_ROOTS` whitelist

2. **XSS prevention** (`public/scripts.js`)
   - `sanitizeHTML()` функція
   - `renderSanitizedHTML()` замість `innerHTML`
   - Видалення небезпечних елементів і атрибутів

3. **Environment validation**
   - Joi схеми для `.env` перевірки
   - Обов'язкові змінні (OPENAI_API_KEY, HF_WRITE_TOKEN)

4. **Secrets management**
   - `.env` та `api_keys.json` у `.gitignore`
   - Приклади без реальних ключів
   - Environment variables для CI/CD

---

## Виявлені проблеми

### Критичні (виправлені)

1. **❌ → ✅ `safeName` не визначена** (`src/routes/api/v1/index.js:29`)
   - **Проблема:** Використання неіснуючої змінної `safeName` замість `moduleName`
   - **Виправлення:** Замінено `safeName` на `moduleName` у двох місцях

2. **❌ → ✅ Відсутній імпорт `TaskOrchestrator`** (`backend/routers/kazkar.py`)
   - **Проблема:** `NameError: name 'TaskOrchestrator' is not defined`
   - **Виправлення:** Додано імпорт `from backend.utils.orchestrator import TaskOrchestrator, Task`

3. **❌ → ✅ Відсутня функція `fetch_hf_dataset`** (`backend/routers/malya.py`)
   - **Проблема:** `ImportError: cannot import name 'fetch_hf_dataset'`
   - **Виправлення:** Видалено виклик неіснуючої функції, спрощено handler

4. **❌ → ✅ Відсутня функція `summarize_with_openai`** (`backend/routers/mood.py`)
   - **Проблема:** `ImportError: cannot import name 'summarize_with_openai'`
   - **Виправлення:** Видалено виклик, додано відсутні імпорти, спрощено логіку

### Важливі (потребують уваги)

5. **⚠️ Python cache files у git**
   - **Проблема:** `__pycache__/` директорії були staged для commit
   - **Виправлення:** Додано до `.gitignore`, видалені з репозиторію

6. **⚠️ Тестові помилки FastAPI**
   - Валідація відповіді в `mood.py` (Dict vs Pydantic model)
   - Відсутні поля в тестах після рефакторингу
   - Помилка методу `register_handler` vs `register`
   - 502 помилка в podia orchestrator тесті

7. **⚠️ Застарілі залежності**
   - `supertest@6.3.4` (deprecated)
   - `superagent@8.1.2` (deprecated)
   - `glob@7.2.3` (deprecated)
   - 1 moderate severity vulnerability в npm

### Незначні

8. **ℹ️ Неоптимізована структура**
   - Дублювання конфігурацій (`.env` в 3 місцях)
   - Два окремі frontend (legacy public/ та новий frontend/)
   - Логи в JSON файлах без ротації

9. **ℹ️ Документація місцями англійською, місцями українською**
   - Технічна документація англійською
   - User-facing українською
   - Може бути незручно для одномовних розробників

---

## Рекомендації щодо покращень

### Високий пріоритет (High)

#### 1. Виправити тестові помилки ✨

**Що зробити:**
- Виправити response model у `backend/routers/mood.py` (повернути dict замість MoodResponse object)
- Оновити тести після видалення `hf_dataset` поля
- Перевірити методи orchestrator (`register` vs `register_handler`)
- Додати обробку помилок у podia dispatcher

**Очікуваний результат:** Всі тести проходять успішно

#### 2. Оновити застарілі залежності 📦

**Node.js:**
```bash
npm update supertest superagent
npm audit fix
```

**Python:**
```bash
pip install --upgrade uvicorn httpx starlette
```

**Очікуваний результат:** Відсутність security vulnerabilities

#### 3. Консолідувати конфігурації ⚙️

**Що зробити:**
- Створити централізований конфіг для всіх частин проєкту
- Використовувати один `.env` з секціями для різних компонентів
- Додати валідацію з чіткими помилками для відсутніх змінних

**Приклад структури:**
```bash
# Core
PORT=7860
NODE_ENV=production

# AI Services
OPENAI_API_KEY=xxx
HF_WRITE_TOKEN=xxx
HF_TOKEN=xxx

# Frontend
NEXT_PUBLIC_CIMEIKA_API_URL=http://localhost:8000

# Backend
CIMEIKA_API=https://api.cimeika.com.ua
CIMEIKA_HTTP_TIMEOUT=5
```

#### 4. Покращити error handling 🛡️

**Backend (FastAPI):**
- Стандартизувати error responses
- Додати custom exception handlers
- Логувати всі помилки з context

**Frontend (Next.js):**
- Error boundaries для React компонентів
- Fallback UI для network errors
- Toast notifications для user feedback

### Середній пріоритет (Medium)

#### 5. Оптимізувати структуру проєкту 📁

**Що зробити:**

1. **Об'єднати frontend коди:**
   - Перенести корисний legacy код з `public/` до `frontend/`
   - Видалити дубльовані компоненти
   - Використовувати тільки Next.js frontend

2. **Реорганізувати API:**
   - Консолідувати всі API endpoints в одному місці
   - Уніфікувати response format
   - Версіонування API (v1, v2)

3. **Покращити data storage:**
   - Замінити JSON файли на базу даних (PostgreSQL/MongoDB)
   - Log rotation для `*.log` файлів
   - Кешування з Redis

#### 6. Додати CI/CD pipeline 🚀

**GitHub Actions workflows:**

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test-nodejs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
  
  test-python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install -r backend/requirements.txt
      - run: cd backend && pytest
  
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      - run: cd frontend && npm run lint
```

#### 7. Покращити документацію 📚

**Що додати:**
- API documentation з прикладами (Swagger UI вже є ✅)
- Developer setup guide (крок за кроком)
- Contribution guidelines
- Architecture diagrams (візуальні схеми)
- Deployment guide для production

**Українізація:**
- Переклад технічної документації українською
- Глосарій термінів (англійський ↔ український)
- Коментарі в коді українською

#### 8. Покращити типізацію 🔍

**TypeScript:**
- Strict mode у `tsconfig.json`
- Типізація всіх API responses
- Shared types між frontend та backend

**Python:**
- Type hints у всіх функціях
- mypy для статичної перевірки
- Pydantic models для всіх data structures

### Низький пріоритет (Low)

#### 9. Додати моніторинг та аналітику 📊

**Що додати:**
- Application performance monitoring (APM)
- Error tracking (Sentry)
- User analytics (privacy-friendly)
- Real-time metrics dashboard

#### 10. Покращити UX 🎨

**Frontend:**
- Темна тема (dark mode)
- Accessibility (ARIA, keyboard navigation)
- Internationalization (i18n) для багатомовності
- Progressive Web App (PWA) можливості
- Offline support

#### 11. Оптимізація продуктивності ⚡

**Backend:**
- Database connection pooling
- Response caching (Redis)
- Асинхронні операції де можливо
- Rate limiting для API

**Frontend:**
- Image optimization (Next.js Image component)
- Code splitting
- Bundle size analysis
- Lazy loading більше компонентів

#### 12. Розширити тестування 🧪

**Що додати:**
- End-to-end тести (Playwright/Cypress)
- Integration tests між Node.js та FastAPI
- Load testing (k6)
- Security scanning (OWASP ZAP)
- Code coverage > 80%

---

## Підсумок

### Поточний стан ✅

Репозиторій **Cimeika** має солідну основу з добре структурованою архітектурою dual-stack. Основні компоненти працюють, є документація та тести. Безпека на базовому рівні впроваджена.

### Сильні сторони 💪

1. ✅ Чітка архітектура з розділенням відповідальностей
2. ✅ Мультиагентна система з добре визначеними ролями
3. ✅ Сучасний tech stack (Next.js 16, React 19, FastAPI)
4. ✅ Українська локалізація
5. ✅ Security best practices (path traversal, XSS prevention)
6. ✅ Comprehensive documentation
7. ✅ Docker support для deployment

### Слабкі сторони 🔧

1. ⚠️ Тестові помилки після рефакторингу
2. ⚠️ Застарілі npm залежності
3. ⚠️ Дублювання frontend коду (legacy + new)
4. ⚠️ JSON файли для даних замість БД
5. ⚠️ Відсутність CI/CD pipeline
6. ⚠️ Неповна типізація

### Наступні кроки 🎯

**Негайно (цього тижня):**
1. Виправити 4 failed тести
2. Оновити застарілі залежності
3. Видалити Python cache з git history

**Короткострокові (цього місяця):**
1. Консолідувати конфігурації
2. Налаштувати CI/CD
3. Покращити error handling

**Довгострокові (наступні 3 місяці):**
1. Міграція на базу даних
2. Об'єднання frontend кодів
3. Додавання моніторингу
4. Розширення тестування

---

## Додаткова інформація

### Корисні команди

```bash
# Node.js Server
npm install
npm start
npm test

# FastAPI Backend
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
cd backend && python -m pytest

# Next.js Frontend
cd frontend
npm install
npm run dev
npm run build
npm run lint

# Docker
docker build -t cimeika .
docker run -p 7860:7860 cimeika

# Deployment
./deploy_cimeika_api.sh
```

### Контакти для питань

- **Repository:** https://github.com/Ihorog/cimeika-real-time-data-app
- **Issues:** https://github.com/Ihorog/cimeika-real-time-data-app/issues
- **Hugging Face Space:** https://ihorog-cimeika-api.hf.space

---

**Створено:** GitHub Copilot Coding Agent  
**Версія аналізу:** 1.0  
**Останнє оновлення:** 16 грудня 2025

# Slack-ready структура Cimeika

> Копіпастний фрагмент для повідомлення у Slack з реальними шляхами до ключових директорій і файлів у репозиторії.

## Структура (готово для вставки)
```
cimeika-real-time-data-app/
├─ server.js                       # Вхідна точка Node + Express
├─ core/api/                       # Уніфікований fetch-клієнт і API-хелпери
├─ src/
│  ├─ app.js                       # Ініціалізація Express застосунку
│  ├─ config.js                    # Завантаження конфігурації та валідація
│  ├─ middleware/                  # CORS, логування, обробка помилок
│  ├─ routes/                      # REST-маршрути (погода, астрологія, конфіг)
│  ├─ services/                    # Інтеграції з зовнішніми API
│  └─ system/                      # Системні утиліти, константи
├─ public/                         # Статичний UX-шар (HTML/CSS/JS)
│  ├─ components/                  # Шаблони header/footer
│  ├─ pages/                       # Домашня сторінка
│  ├─ scripts.js
│  └─ styles.css
├─ api/
│  ├─ ci_mitca_sense.py            # Сенсовий аналіз задач
│  ├─ ci_mitca_gallery.py          # Галерея подій/зображень
│  ├─ sense_server.py              # Легковаговий сенс-сервер
│  └─ v1/                          # Допоміжні сценарії (Python)
├─ backend/                        # FastAPI оркестратор
│  ├─ main.py                      # Точка входу FastAPI
│  ├─ config.py                    # Налаштування та env-модель
│  ├─ routers/                     # Маршрути модулів (ci, mood, podia тощо)
│  ├─ utils/                       # Оркестратор, резонанс, сенс-движок
│  └─ tests/                       # Pytest-сценарії для API
├─ frontend/                       # Next.js SPA для модулів Ci
│  ├─ package.json                 # Залежності фронтенду
│  ├─ src/app/                     # App router сторінки (ci, podia, mood, malya…)
│  ├─ src/components/              # UI-компоненти
│  ├─ src/lib/                     # Клієнти/хелпери для API
│  ├─ src/styles/                  # Tailwind токени та глобальні стилі
│  └─ src/utils/                   # Допоміжні функції
├─ docs/                           # Оглядові матеріали та специфікації
│  ├─ platform-architecture.md     # Архітектура платформи Cimeika
│  ├─ realtime-integration.md      # Реалтайм інтеграції та стратегії
│  └─ ci_*.md                      # Сенсоматика, дизайн, модулі
├─ scripts/                        # CLI-сценарії (тести, сценарії API)
├─ cimeika-api.yaml                # OpenAPI-специфікація
├─ swagger.json                    # Згенерований swagger для Node API
└─ package.json                    # Кореневі залежності та скрипти
```

## Як використовувати
- Надішліть блок вище у Slack-канал — він уже містить підписи до кожної суттєвої директорії/файлу.
- Якщо потрібно деталізувати конкретний модуль (наприклад, `backend/routers/` або `frontend/src/app/ci`), додайте локальний фрагмент після цього дерева.

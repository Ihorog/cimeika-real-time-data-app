# Cimeika Platform Architecture (GitHub + HF Space + cimeika.com.ua)

Цей документ описує модель розкладання компонентів Cimeika по репозиторіях і
оточеннях. Він слугує каркасом, який можна застосувати без тотальної
перебудови: існуючі сервіси та репозиторії лишаються, але отримують чіткі ролі,
точки інтеграції та базові правила CI/CD.

## Шари платформи

- **App / Web**
  - `CimeikaReact` — основний SPA (чат Ci, модулі ПоДія/Настрій/Маля/Казкар,
    Галерея, Календар).
  - `cimeika` — статичний маркетинговий сайт/лендінг; може бути окремим хостом
    або інтегрованим як `/landing` у SPA.
- **API / Core**
  - HF Space `ihorog/cimeika-api` — ядро Ci/оркестратор (чати, події,
    маршрутизація персон).
  - (Опція) дзеркальний GitHub-репозиторій `cimeika-api` для зберігання коду
    Space та CI.
- **Docs / Knowledge**
  - `ciwiki` — єдине текстове сховище (`/legend-ci`, `/specs`, `/design`,
    `/ops-notes`).
- **Infra / Ops**
  - `Cimeika_Project_Structure` — джерело правди для опису серверів, хостингу,
    бекапів, моніторингу (без секретів).
  - `workflow-` — бібліотека автомацій та шаблонів GitHub Actions/cron.
- **Special modules**
  - `cimeika-real-time-data-app` — візуалізації та реальний час; підключається
    як піддодаток/route у SPA або окремий service.
  - `album_ai`, `MrijkiMarijki` — галерея/дитячий простір; експонуються як
    API-сервіси для WebUI.

## Мапа «де що лежить»

| Категорія            | Репозиторії / Ролі                                                   |
|----------------------|-----------------------------------------------------------------------|
| app/web              | `CimeikaReact` (головний фронт), `cimeika` (маркетинг/landing)       |
| api/core             | HF Space `cimeika-api` (оркестратор), опц. GH mirror `cimeika-api`   |
| docs/legend          | `ciwiki`                                                             |
| infra/ops            | `Cimeika_Project_Structure`                                          |
| automation           | `workflow-`                                                          |
| special modules      | `cimeika-real-time-data-app`, `album_ai`, `MrijkiMarijki`            |

## Структура всередині `CimeikaReact` (цільова)

```
CimeikaReact/
  src/
    core/
      ci-client/    # API-клієнт до HF Space
      state/        # глобальний стан (Ci, Nastrij, Podija, Kazkar...)
      config/       # base URLs, feature flags
    modules/
      ci/           # чат Ci
      kazkar/       # Легенда Ci, казки, ритуали
      podija/       # події/календар
      nastrij/      # карти настрою, вправи
      malya/        # дитячий режим, MrijkiMarijki
      gallery/      # галерея/альбоми, album_ai
      calendar/     # інтеграції календаря
    ui/
      components/
      layout/
      theme/
    pages/ (або routes/)
      index
      legend-ci
      family-space (landing)
.github/workflows/
  deploy-web.yml
  lint-test.yml
```

## CI/CD каркас

### Web (CimeikaReact)
- Тригери: `push` до `main` і `release/*`.
- Кроки: checkout → `npm/yarn install` → `npm run build` → деплой.
- Варіанти деплою: GitHub Pages (прев’ю) або FTP/SFTP на `cimeika.com.ua`.
- Секрети для FTP/SFTP: `CIMEIKA_FTP_HOST`, `CIMEIKA_FTP_USER`, `CIMEIKA_FTP_PASS`
  (без зберігання в git). Для GH Pages — `ACTIONS_DEPLOY_KEY` або `GITHUB_TOKEN`.

### Infra/Ops (Cimeika_Project_Structure)
- Workflow `check-config.yml`: валідація шаблонів конфігів і перевірка на
  plaintext-секрети. Шукати старі файли (`cimeika_universal.json`,
  `cimeika_server_config.json`, `hosting_admtools.json`) і зберігати тільки
  структуру без ключів.

### Automation (workflow-)
- Тримаємо повторно вживані jobs як `workflow_call` або composite actions.
- Типові заготовки: `deploy-web.yml`, `lint-test.yml`, `mirror-hf-space.yml`
  (push коду Space у дзеркальний репо), `backup-configs.yml`.

## Ролі і взаємодія цього репозиторію

`cimeika-real-time-data-app` виконує роль шару візуалізації/реального часу.
Рекомендовано:
- Публікувати build як окремий route (`/realtime`) усередині `CimeikaReact` або
  як standalone service із API-проксі до HF Space.
- Узгодити base URL через `src/core/config` у фронті, щоб модулі Подія/Настрій
  могли підбирати метрики з цього сервісу.
- Використовувати спільні UI-теми та компоненти з фронту, щоб забезпечити
  консистентний досвід.

## Гілки, .env і secrets

- Основна гілка: `main`; фічі — `feature/<short-name>`, релізи — `release/<ver>`.
- Мінімальний `.env` для фронтів: `VITE_API_BASE` (або `REACT_APP_API_BASE`),
  `HF_SPACE_URL` (орієнтир на `ihorog-cimeika-api.hf.space`), опційно
  `SENTRY_DSN`, `GA_MEASUREMENT_ID`.
- Для бекенду/Space: `OPENAI_API_KEY`, `HF_WRITE_TOKEN`, `HUGGINGFACE_TOKEN`,
  інтеграції календаря/сторіджів додаються як secrets у середовищах GitHub
  і в Settings Space (без дублю в git).

## Наступні кроки (швидкі)

1) Створити/оновити `deploy-web.yml` у `CimeikaReact` за цим каркасом.
2) Перенести конфіг-шаблони з `/mnt/data` у `Cimeika_Project_Structure`
   (без значень), додати `check-config.yml`.
3) Додати до `ciwiki` теку `/legend-ci` і підв’язати рендер у маршруті
   `legend-ci` фронту.
4) У цьому репозиторії — додати proxy/route `/realtime` у SPA або описати API
   контракт для інтеграції з фронтом.

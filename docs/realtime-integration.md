# Інтеграція `cimeika-real-time-data-app` з фронтендом CimeikaReact

Цей документ пояснює, як SPA-фронт (`CimeikaReact`) і HF Space (`ihorog/cimeika-api`) можуть
використовувати існуючі REST-ендпоїнти цього сервісу для маршруту
`/realtime` або окремого хосту.

## Базова схема
- **Хост**: окремий service або proxied route `/realtime` у CimeikaReact.
- **Auth**: не потрібен для публічних даних; якщо потрібна авторизація,
  додається reverse-proxy або middleware у цьому сервісі.
- **Config**: фронт читає `GET /config` щоб дізнатись дефолтні місто/знак та
  відносні шляхи (`/weather/current`, `/astrology/forecast`).

## Ендпоїнти, що потрібно підключити у SPA

| Route | Метод | Призначення | Примітки |
|-------|-------|-------------|----------|
| `/config` | GET | Повертає дефолтні значення і відносні шляхи до сервісів реального часу. | Використовується для bootstrap у фронті. |
| `/weather/current?city=<name>` | GET | Поточна погода для міста. | Має кеш 5 хв, повторні запити не б’ють API. |
| `/astrology/forecast?sign=<sign>` | GET | Прогноз за знаком зодіаку. | Також кеш 5 хв. |
| `/time/current` | GET | Поточний UTC-час. | Легкий endpoint, можна показувати «оновлено зараз». |
| `/data/weather` | GET | Той самий payload, що `/weather/current`; залишено для зворотної сумісності. | Рекомендовано використовувати `/weather/current`. |
| `/data/astrology` | GET | Той самий payload, що `/astrology/forecast`. | Рекомендовано `/astrology/forecast`. |
| `/ai/hf-space/completion` | POST | Проксі до HF Space `ihorog/cimeika-api`. | Використовувати для узгодженого API чату Ci. |

### Формат відповідей
- Погода: `{ "city": "Kyiv", "weather": "Sunny", "temperature": 18 }`
- Астрологія: `{ "sign": "aries", "forecast": "..." }`
- Час: `{ "time": "2024-05-01T12:34:56.000Z" }`

## Вживання у `CimeikaReact`

1. **Конфіг**: у фронті тримати `VITE_REALTIME_BASE` (або `REACT_APP_REALTIME_BASE`) —
   базовий URL цього сервісу. Для proxied `/realtime` достатньо `/realtime`.
2. **Фетчинг**: створити клієнт `src/core/ci-client/realtime.ts` з методами
   `getWeather(city)`, `getAstrology(sign)`, `getTime()`, які використовують
   базовий URL і читають `/config` при старті.
3. **Роути**: додати сторінку/route `routes/realtime` у SPA, що виводить погодні,
   астрологічні й часові віджети; використовувати спільні UI-компоненти/тему.
4. **Узгодження з HF Space**: фронт для чатів/генерацій викликає
   `/ai/hf-space/completion` цього сервісу, щоб мати однакову точку входу з
   реального часу. Бекенд HF Space повинен бути вказаний у `.env`
   `HF_SPACE_URL` (див. `api_keys.example.json`).

## Деплой і секрети
- **Як standalone**: деплой на окремий хост/порт; фронт споживає через
  `VITE_REALTIME_BASE=https://realtime.cimeika.com.ua` (приклад).
- **Як proxied route**: у фронтенд-сервері Nginx/Express додати проксі на
  цей сервіс за `/realtime`; тоді вся статика SPA залишається в `CimeikaReact`.
- **Секрети**: для Hugging Face Space проксі потрібно `HF_SPACE_URL` і, за
  потреби, `HUGGINGFACE_TOKEN` (у середовищі деплою, не в git).

## Сумісність і кеші
- Публічні дані кешуються у процесі (5 хв) і автоматично очищаються; для
  багатоконтейнерного деплою варто додати Redis/Upstash як спільний кеш.
- Тайм-аут до зовнішніх API — 5 секунд із експоненційними ретраями (3 спроби).
- При нестачі токенів/конфігів (`HUGGINGFACE_TOKEN`) відповідний endpoint
  поверне 503 (див. логіку middleware `requireHfToken`).

## TODO для подальшої інтеграції
- Оновити OpenAPI (`cimeika-api.yaml`), щоб описати `/ai/hf-space/completion`
  та `/config`, і синхронізувати схему з фронтом.
- Додати health-check `GET /health` із перевіркою конфігів та стану кешу.
- Винести кеш у Redis і зробити rate limiting, якщо сервіс стане публічним.

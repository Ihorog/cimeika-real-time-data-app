# Backend Phase 5 → Realtime Validation Notes

## Scope
Tracking the realtime aggregation pipeline that bridges weather, astrology, and system monitor data into the dashboard.

## API
- **Endpoint:** `GET /api/v1/realtime/summary`
- **Payload shape:** `{ weather: {...}, astrology: {...}, system: {...}, timestamp: "ISO" }` wrapped in the standard `makeResponse` envelope.
- **Sources:**
  - Weather → `https://goweather.herokuapp.com/weather/{city}` with caching
  - Astrology → `https://aztro.sameerkumar.website/?sign={sign}&day=today`
  - System → in-process `generateMonitorData()` (mirrors `/api/v1/system/monitor`)

## Validation checklist
- Query params `city` / `sign` validated (defaults from config if absent).
- Aggregator returns `status=ok`, `module=realtime_summary`, and a data block that contains weather, astrology, system, and timestamp keys.
- Downstream calls are mocked in Jest for deterministic runs.

## Tests
- `__tests__/api_v1_realtime_summary.test.js` mocks axios + system monitor and verifies default and custom param flows.

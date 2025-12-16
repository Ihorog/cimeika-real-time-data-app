# Audit notes: correcting prior architecture assumptions

This addendum clarifies a few inaccuracies that appeared in earlier analyses of the
Cimeika interface stack. It is based on the current repository state.

## Connectors are real HTTP bridges, not stubs
- `backend/utils/connectors.py` creates an `httpx.Client` that targets the
  configured `CIMEIKA_API` base URL and issues real requests for mood, creative,
  story, and event payloads. These calls include timeout and error handling via
  `httpx` exceptions. They do **not** return placeholder "skipped" data.
- OpenAI, Hugging Face, and Telegram traffic is expected to be proxied by the
  upstream **Cimeika API** specified through `CIMEIKA_API`—frontend code never
  exposes those secrets directly.
- Because the connectors depend on a reachable upstream API, the FastAPI routers
  contain their own fallbacks when the upstream call fails:
  - `backend/routers/mood.py` returns an "offline" snapshot when mood fetches
    error out.
  - `backend/routers/malya.py` returns the requested idea/style and a status of
    `"unavailable"` if the creative bridge does not respond.
  - `backend/routers/podia.py` provides two sample events when `/podia/events`
    cannot be fetched. In this case responses should be treated as
    **degraded** rather than fully healthy.

## Orchestrator behavior
- The `TaskOrchestrator` (see `backend/utils/orchestrator.py`) is instantiated
  inside `backend/routers/podia.py` without registered handlers. Dispatched
  events therefore get marked as `"skipped"` with message `"No handler"` once
  the scheduler dequeues them. Adding module-specific handlers remains a future
  task.

## Scope of external services
- Calls to OpenAI/Hugging Face/Telegram are not issued directly from the
  FastAPI layer. Instead, those external integrations are expected to live
  behind the upstream Cimeika API specified by `CIMEIKA_API`. Local development
  does not require those tokens beyond configuring the upstream endpoint.

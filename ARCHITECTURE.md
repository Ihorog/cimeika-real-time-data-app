# Cimeika Interface Architecture

This document outlines how the Ci-centered SPA and FastAPI backend work together. The goal is to align the real-time UI with the new sensomatyka-driven orchestration layer while keeping deployment simple (Hugging Face Space + GitHub Actions).

## Layers

- **Frontend (Next.js + Tailwind + Framer Motion)**: modular pages for every Ci module with shared design tokens and micro-interactions that visualize resonance.
- **Backend (FastAPI)**: router-per-module that exposes the interaction points defined in the specification (Ci chat/data/components, PoДія events, Настрій mood, Маля creative, Казкар story, Календар time nodes, Галерея uploads).
- **Orchestrator utilities**: lightweight `TaskOrchestrator`, `PriorityTaskScheduler`, and `SimpleTaskExecutor` for routing module tasks, plus `SenseNode` resonance helpers.
- **Connectors**: stubs for OpenAI, Hugging Face Dataset `ci_power`, Telegram, Google Calendar, and GitHub sync to keep the integration surface visible without requiring secrets at build time.

## Data flow

1. Frontend calls the FastAPI endpoints (default `http://localhost:8000`) via the API Console component or module-specific widgets.
2. FastAPI routes delegate to orchestrator helpers or sense engine scoring; responses include resonance metadata where relevant.
3. External services (OpenAI, HF, Telegram, Google) are abstracted behind connector functions so tokens remain in `.env` and are not required for local preview.
4. GitHub Actions and Hugging Face Space deployment pick up changes from `main`; the provided `.env.template` lists required variables for syncing.

## Module-to-endpoint map

- **Ci**: `/ci/chat`, `/ci/data`, `/ci/components`
- **ПоДія**: `/podia/events`, `/podia/events/dispatch`
- **Настрій**: `/nastiy/mood`
- **Маля**: `/mala/creative`
- **Казкар**: `/kazkar/story`, `/kazkar/history`
- **Календар**: `/calendar/time`
- **Галерея**: `/gallery/images`, `/gallery/upload`

## Deployment notes

- **Hugging Face Space**: use the included Dockerfile and `deploy_cimeika_api.sh` or push from GitHub Actions; ensure `HF_TOKEN` and `OPENAI_API_KEY` are configured in the Space settings.
- **Local dev**: run `uvicorn backend.main:app --reload --port 8000` and `npm run dev` inside `frontend/`. Point `ApiConsole` to the chosen backend URL via the `CI_BASE_URL` env var if needed.

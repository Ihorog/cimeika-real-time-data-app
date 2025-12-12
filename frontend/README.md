# Cimeika Frontend — Phase 1

This Next.js App Router project provides the initial UI shell for the Cimeika platform. It surfaces live health data from the backend `/api/v1` endpoints and prepares the ground for Phase 2 resonance visualizations.

## Features
- **System Monitor** component that polls `/api/v1/system/monitor` and shows hostname, uptime, and average resonance.
- **Module pages** for Ci, Insight, System, and Orchestrator to outline the active API landscape.
- **Resonance Dashboard** scaffold with Tailwind styling, cards, and chart placeholders for the upcoming visualization phase.

## Getting Started
Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the UI.

## Configuration
- Set `NEXT_PUBLIC_API_BASE_URL` to point the frontend at a remote API. By default, requests target `http://localhost:3000/api/v1`.
- Network or JSON parsing issues from the API are surfaced directly in the System Monitor card to simplify debugging.

## Linting
Run ESLint to validate the project:

```bash
npm run lint
```

Binary assets (images, archives, media) are not supported in this repository. Run the binary lint to ensure only text-based files
are present:

```bash
npm run lint:binaries
```

## Next Steps
- Implement resonance visualizations with Framer Motion and Recharts.
- Wire in Ci, Insight, and Orchestrator data sources as backend endpoints become available.
- Add end-to-end checks for the dashboard flows once the API is stable.

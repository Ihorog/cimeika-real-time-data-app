# GitHub Copilot Instructions — Ihorog/cimeika-real-time-data-app (Cimeika App)

## Role of this repository

Product application for Cimeika. Mixed stack may exist (frontend + backend/orchestration).

Cimeika is a modern web application integrating real-time data services (weather, time, astrological forecasts) with a multi-agent system centered around "Ci" (the central intelligent assistant). The platform includes specialized agents for different domains: ПоДія (events), Настрій (mood), Маля (creativity), Казкар (stories), Календар (calendar), and Галерея (gallery).

**Primary Languages**: JavaScript/TypeScript (frontend/Node.js), Python (FastAPI backend), Ukrainian (documentation and user-facing text)

## Hard constraints

1. **Do NOT call external inference backends directly from UI.** Use CIT gateway.
2. **Do NOT add dependencies** unless explicitly requested.
3. **Do NOT change build/orchestration files** unless the Task Spec targets them.
4. **Do NOT introduce secrets.**

## Architecture

The project has a dual-stack architecture:

1. **Legacy Node.js server** (`server.js`, `src/`, `public/`) - Express-based API with real-time data endpoints
2. **Modern interface system**:
   - **Frontend**: Next.js 16 + TypeScript + Tailwind CSS + Framer Motion (`frontend/`)
   - **Backend**: FastAPI + Python 3.x (`backend/`)

See `ARCHITECTURE.md` for detailed architecture documentation and `AGENTS.md` for agent specifications.

## Boundaries

**UI code**: `src/`, `components/`, `pages/`, `frontend/`

**Backend/orchestration**: `app.py`, `requirements.txt`, `docker-compose*.yml`, `scripts/`, `backend/`

## Integration standard

CIT is the canonical gateway.

- Use `CIT_BASE_URL` and optional `CIT_TOKEN`.
- Prefer `POST /v1/chat` and `POST /v1/jobs` for long operations.

## Preferred implementation style

- **Minimal, readable changes**; smallest viable diff.
- **Prefer standard library** over new dependencies.
- **Keep backward compatibility**; if legacy endpoints exist, preserve them.
- **Ensure deterministic behavior**; avoid hidden side effects.

## Development Setup

### Prerequisites
- Node.js 16 or later
- Python 3.8+
- npm and pip package managers

### Environment Configuration

**Always** copy example environment files before starting:
```bash
# Root (for Node.js server)
cp .env.example .env

# Frontend (for Next.js)
cp frontend/.env.local.example frontend/.env.local

# Backend (for FastAPI)
cp backend/.env.example backend/.env
```

Required environment variables:
- `OPENAI_API_KEY` - OpenAI API access
- `HF_WRITE_TOKEN` - Hugging Face write access
- `HUGGINGFACE_TOKEN` - Hugging Face API (optional, for `/ai/huggingface/completion`)
- `PORT` - Server port (default: 7860)
- `DEFAULT_CITY` - Default city for weather (e.g., "London")
- `DEFAULT_SIGN` - Default astrological sign (e.g., "aries")
- `CIT_BASE_URL` - CIT gateway URL (when integrated)
- `CIT_TOKEN` - CIT authentication token (optional)

**Never** commit `.env` files, `api_keys.json`, or any files containing secrets to version control.

## Build and Test Commands

### Node.js Server (root)
```bash
npm install          # Install dependencies
npm start            # Start the server
npm test             # Run Jest tests
node server.js       # Direct server start
```

### Frontend (Next.js)
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
```

### Backend (FastAPI)
```bash
# From project root:
pip install -r backend/requirements.txt        # Install dependencies
uvicorn backend.main:app --reload --port 8000  # Development server (from root)

# Or from backend directory:
cd backend
pip install -r requirements.txt                # Install dependencies
uvicorn main:app --reload --port 8000          # Development server (from backend/)
pytest                                          # Run tests
```

### Docker
```bash
docker build -t cimeika .
docker run -p 7860:7860 cimeika
```

## Coding Standards

### General Principles
- **Make minimal changes** - modify only what's necessary to address the issue
- **Preserve existing patterns** - follow established code structure and conventions
- **No unnecessary refactoring** - don't fix unrelated issues
- **Test changes** - validate that changes work and don't break existing functionality

### JavaScript/TypeScript
- Use CommonJS (`require`/`module.exports`) for Node.js server code (root `src/` directory)
- Use ES6 modules (`import`/`export`) for frontend TypeScript/React code
- Follow existing code formatting patterns
- Use `const` and `let`, avoid `var`
- Prefer async/await over callbacks or raw promises
- Use Tailwind CSS classes for styling (no inline styles or custom CSS unless necessary)

### Python
- Follow PEP 8 style guidelines
- Use type hints (FastAPI requires them)
- Prefer explicit error handling with appropriate HTTP status codes
- Use Pydantic models for request/response validation (`backend/schemas/`)

### Testing
- Add tests for new functionality
- Use Jest for JavaScript/Node.js tests (`__tests__/`)
- Use pytest for Python tests (`backend/tests/`)
- Mock external API calls in tests (see `src/routes/__mocks__/`)
- Run tests before committing changes

### Testing & validation requirements

- Provide a short checklist to verify changes.
- If you add new code paths, add minimal smoke tests or validation steps.
- Do not propose "TODO" placeholders unless the Task Spec allows it.

### Documentation
- Update README.md if changing setup/installation steps
- Update ARCHITECTURE.md if changing system architecture
- Update AGENTS.md if changing agent specifications
- Use Ukrainian for user-facing documentation
- Use English for technical/developer documentation
- Add JSDoc comments for complex functions

## File Structure

```
cimeika-real-time-data-app/
├── .github/                    # GitHub configuration and Copilot instructions
├── frontend/                   # Next.js frontend application
│   ├── src/app/               # Next.js App Router pages
│   │   ├── ci/               # Ci console
│   │   ├── podia/            # ПоДія timeline
│   │   ├── mood/             # Настрій wave interface
│   │   ├── malya/            # Маля creative canvas
│   │   ├── kazkar/           # Казкар stories
│   │   ├── calendar/         # Календар time map
│   │   └── gallery/          # Галерея memories
│   ├── src/styles/           # Global styles and design tokens
│   └── public/               # Static assets
├── backend/                   # FastAPI backend
│   ├── main.py               # FastAPI application entry
│   ├── routers/              # REST API routes per module
│   ├── schemas/              # Pydantic models
│   ├── utils/                # Orchestration and connectors
│   └── tests/                # Backend tests
├── src/                       # Node.js server source
├── public/                    # Legacy frontend assets
├── __tests__/                 # Node.js tests
├── server.js                  # Express server entry point
├── cimeika-api.yaml          # OpenAPI specification
└── docs/                      # Additional documentation
```

## Common Tasks

### Adding a new API endpoint (Node.js server)
1. Add route handler in `src/routes/` or directly in `server.js`
2. Update `cimeika-api.yaml` OpenAPI spec if applicable
3. Add tests in `__tests__/`
4. Test with `npm test` and manual verification

### Adding a new API endpoint (FastAPI)
1. Create or update router in `backend/routers/`
2. Define Pydantic schemas in `backend/schemas/`
3. Register router in `backend/main.py`
4. Add tests in `backend/tests/`
5. Test with `pytest`

### Adding a new frontend page
1. Create page component in `frontend/src/app/[module]/page.tsx`
2. Follow Next.js App Router conventions
3. Use existing design tokens from `frontend/src/styles/tokens.css`
4. Ensure responsive design with Tailwind CSS
5. Test in development mode (`npm run dev`)

### Modifying agent behavior
1. Review `AGENTS.md` for agent specifications
2. Update relevant backend router in `backend/routers/`
3. Update frontend UI if needed
4. Test end-to-end functionality

## Security Considerations

- **Never expose API keys** in code, commits, or logs
- **Validate all inputs** using Joi (Node.js) or Pydantic (Python)
- **Use environment variables** for all secrets and configuration
- **Sanitize user inputs** to prevent XSS and injection attacks
- **Handle errors gracefully** without exposing internal details
- **Review dependencies** for known vulnerabilities before adding

## Deployment

- **Hugging Face Space**: Use `deploy_cimeika_api.sh` script with required tokens
- **Docker**: Use provided `Dockerfile` for containerized deployment
- **Local dev**: Run both Node.js server and FastAPI backend simultaneously
- **GitHub Actions**: CI/CD workflows are in `.github/workflows/`

## API Integration Notes

### External Services
- Weather data, time information, and astrological forecasts from various APIs
- OpenAI for AI-powered features
- Hugging Face for model hosting and inference
- Backend connectors in `backend/utils/connectors.py` handle API communication

### Resonance and Orchestration
- Ci exposes PLUS/MINUS axis manifest at `/ci/axes`
- Resonance scoring at `/ci/axes/resonance`
- Task orchestration through `backend/utils/orchestrator.py`
- See `visual_axis_manifest.json` for axis configuration

## Language and Localization

- **Primary UI language**: Ukrainian (Українська)
- Agent names and UI elements should use Ukrainian
- Technical documentation and code comments can be in English
- Support for English and French in Ci and Kazkar agents

## Questions and Issues

- Review existing issues before creating new ones
- Check `README.md`, `ARCHITECTURE.md`, and `AGENTS.md` first
- For architecture questions, consult `docs/platform-architecture.md`
- For integration questions, see `INTEGRATION_REPORT.md`

## Best Practices Checklist

When making changes, ensure:
- [ ] Changes are minimal and focused on the specific issue
- [ ] Code follows existing patterns and conventions
- [ ] Tests are added/updated and passing
- [ ] No secrets or sensitive data in commits
- [ ] Documentation is updated if needed
- [ ] Environment variables are properly configured
- [ ] Build and lint commands succeed
- [ ] Changes work in both development and production modes

## Output format for every task

- **Edited files list**
- **Unified diff** (or patch-like excerpt)
- **Acceptance checklist**
- **Short changelog**

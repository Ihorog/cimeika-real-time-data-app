---
title: Cimeika API
emoji: "🌟"
colorFrom: blue
colorTo: indigo
sdk: docker
sdk_version: "0.4.1"
app_file: Dockerfile
pinned: false
---

# Cimeika

Cimeika is a modern web application that integrates various real-time data services, including weather updates, time information, and astrological forecasts. The platform is designed to enhance the user experience through dynamic content and a visually appealing interface using Tailwind CSS.

An architecture outline for how this service fits into the broader Cimeika platform (GitHub repos, HF Space, and cimeika.com.ua) is captured in [`docs/platform-architecture.md`](docs/platform-architecture.md).

This repository now also contains the **Cimeika interface system** scaffold described in the phase brief: a Next.js + Tailwind frontend for all core modules and a FastAPI backend that mirrors the orchestration endpoints used by Ci. The goal is to keep the real-time Node server available while introducing the target architecture side-by-side.

## Project Overview

Cimeika provides users with a connected and intelligent experience by aggregating real-time data from multiple APIs. It features a sleek and responsive layout, ensuring that users can access the information they need seamlessly across devices.

## Installation

To set up the Cimeika project locally, follow these steps:

Ensure that you have **Node.js 16 or later** installed.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ihorog/cimeika-real-time-data-app.git
   cd cimeika-real-time-data-app
   ```

2. **Set up Development Environment**:
   If you're using VSCode, launch the project in a development container:
   - Open the folder in VSCode and select "Reopen in Container".

3. **Install Dependencies**:
   If using Node.js environment, ensure you've installed the necessary packages:
   ```bash
   npm install
   ```

   Dependencies (found in package.json):
   - `express`: For server-side logic
   - `axios`: For making requests to external APIs
   - `dotenv`: For environment variable loading

4. **Configuration**:
    Copy `.env.example` to `.env` and add your API keys:
    ```bash
    cp .env.example .env
    ```
    Then edit `.env` to set required tokens such as `OPENAI_API_KEY`,
    `HF_WRITE_TOKEN`, and optionally `DEFAULT_CITY` (e.g., `London`) and
    `DEFAULT_SIGN` (e.g., `aries`).

   `HUGGINGFACE_TOKEN` is optional and only needed for the `/ai/huggingface/completion`
   route. Without it, that endpoint returns a 503 and scripts like `api_scenario.js`
   log a notice and exit. Adjust `PORT` if you need a different server port (default
   `7860`). The `.env` file is ignored by git.
   Set `SENSE_ENDPOINT` to the URL of the Ci semantic sense service if it's running on a
   different host or path (defaults to `http://localhost:8000/mitca/sense`). You can also
   tune `SENSE_TIMEOUT_MS` (default: 5000), `SENSE_RETRY_COUNT` (default: 3), and
   `SENSE_RETRY_DELAY_MS` (default: 300) to control how long the `/ci/sense` route waits
   and how many times it retries when the service is slow or temporarily unavailable.
   If you prefer JSON-based configuration, copy `api_keys.example.json` to
   `api_keys.json` and replace the placeholder values with your real API keys:
   ```bash
   cp api_keys.example.json api_keys.json
   ```
   The `.gitignore` file prevents `api_keys.json` from being committed.

   If any required settings are missing or invalid, the server logs the configuration validation errors and exits immediately with an error code. Fix the reported issues before starting the application again.

5. **Start the Application**:
   You can run the application using:
   ```bash
   npm start
   ```
   or directly with:
   ```bash
   node server.js
   ```

## Usage

1. **Access the Application**: Visit `http://localhost:7860` in your web browser.
2. **Interact with Real-Time Data**: The homepage will load with dynamic sections for Weather, Time, and Astrological Forecast featuring a loading animation until the data is fetched.
3. **Navigate through the Application**: Use the dynamic header and footer for navigation to various sections (if implemented).

## Features

- **Real-Time Data**: Fetches and displays current weather, time, and astrology data dynamically.
- **Responsive Design**: Optimized layout for both desktop and mobile devices using Tailwind CSS.
- **Smooth Animations**: Interactive UI components with hover effects and animations.
- **API Integrations**: Connects with multiple APIs to gather and display real-time data.
- **OpenAPI Documentation**: Available at `/openapi` and browsable through Swagger UI at `/docs`.
- **Configuration Endpoint**: `GET /config` returns the relative paths for the weather and astrology services used by the frontend.
- **API Version**: OpenAPI specification version is `1.1.0` (see `cimeika-api.yaml`).
- **Dual-axis mechanics**: Ci exposes the PLUS/MINUS axis manifest at `/ci/axes` and resonance scoring at `/ci/axes/resonance` to keep brand voices in sync with orchestrated tasks.

## Dependencies

The project depends on the following packages (as specified in `package.json`):

- `express`: "^4.18.2" (for server handling)
- `axios`: "^1.10.0" (for making HTTP requests)
- `dotenv`: "^16.3.1" (for loading environment variables)

Additionally, the CSS framework utilized is [Tailwind CSS](https://tailwindcss.com/).

## Project Structure

The project is structured as follows:

```
cimeika/
├── public/
│   ├── components/
│   │   ├── footer.html          # Footer component template
│   │   └── header.html          # Header component template
│   ├── pages/
│   │   └── home.html            # Main landing page content
│   ├── styles.css               # Custom styles for the application
│   ├── scripts.js               # JavaScript for dynamic functionality
│   └── index.html               # Main HTML entry point
└── cimeika-api.yaml         # OpenAPI definition for the API
```

### Interface system (Next.js + FastAPI)

The new interface stack introduced in this update lives alongside the legacy Node server:

```
frontend/                      # Next.js SPA for Ci and modules
  src/app/ci                  # Ci console
  src/app/podia               # ПоДія timeline
  src/app/mood                # Настрій wave interface
  src/app/malya               # Маля creative canvas
  src/app/kazkar              # Казкар stories
  src/app/calendar            # Календар time map
  src/app/gallery             # Галерея memories
  src/styles/tokens.css       # Design tokens derived from Ci palette
backend/                      # FastAPI orchestration layer
  main.py                     # App entry and router registry
  routers/                    # REST routes per module
  utils/                      # Sense engine + orchestrator
```

Start the FastAPI service locally:

```bash
uvicorn backend.main:app --reload --port 8000
```

Start the Next.js frontend from `frontend/`:

```bash
npm install
npm run dev
```

Copy `.env.template` to `.env` to set the Ci/OpenAI/Hugging Face/Telegram/GitHub tokens used by the orchestrator stubs and deployment scripts:

```bash
cp .env.template .env
```

### File Descriptions:

- `public/index.html`: The main HTML document that loads the application.
- `public/styles.css`: Contains custom styles and animations to enhance the UI.
- `public/scripts.js`: JavaScript file for handling dynamic content loading, API interactions, and user interactions.
 - `.env`: Stores your private API keys (`OPENAI_API_KEY`, `HF_WRITE_TOKEN`,
   `HUGGINGFACE_TOKEN`) and optional settings such as `PORT`, `DEFAULT_CITY`
   and `DEFAULT_SIGN`. `HUGGINGFACE_TOKEN`
   must be set for the `/ai/huggingface/completion` route; if it's missing, scripts
   like `scripts/api_scenario.js` log a message and exit early. This file should
   not be committed to version control. A `.env.example` template is provided for
   reference.
 - `HF_SPACE_URL` can be set in the `.env` file if you want the new
   `/ai/hf-space/completion` proxy and the scenario script to target a different
   Hugging Face Space (defaults to `https://ihorog-cimeika-api.hf.space`).

## Deployment

Run `deploy_cimeika_api.sh` from the repository root to publish the API to a [Hugging Face Space](https://huggingface.co/spaces). Set the required tokens in your shell and then run the script:

```bash

  export HF_WRITE_TOKEN=<your-hf-token>
  export OPENAI_API_KEY=<your-openai-key>
  # required – for Hugging Face completions (the API scenario script skips this if unset)
  export HUGGINGFACE_TOKEN=<your-hf-api-token>
./deploy_cimeika_api.sh
```

The script builds the container using the included `Dockerfile`. To test the Docker image locally, run:

```bash
  docker build -t cimeika .
  docker run -p 7860:7860 cimeika
```

### What the script does

1. Checks that `git`, `curl`, `python3` and `pip` are available and installs `huggingface_hub` if missing.
2. Logs in to Hugging Face with `huggingface-cli login` using `HF_WRITE_TOKEN`.
3. Clones this repository if needed and creates (or reuses) a Docker-based Space.
4. Pushes the code (including the `Dockerfile`) to the Space and sets the above secrets.
5. Waits for the Space to start and then installs dependencies and runs any Python tests.

After completion the script prints the URL of your running Space so you can verify the deployment.

## API Scenario

To see a quick example of calling the API with environment variables, run the
`scripts/api_scenario.js` script. This assumes you have the server running
locally (default `http://localhost:7860`). Optionally set `BASE_URL` in your
`.env` file if the server is hosted elsewhere. The script also looks for
`HUGGINGFACE_TOKEN`; if it's not available, it logs a message and exits before
creating a component or collecting data.

```bash
HUGGINGFACE_TOKEN=your_hf_token node scripts/api_scenario.js
```

The script performs a mock login, requests a Hugging Face completion,
proxies a chat prompt to the deployed Space at `https://ihorog-cimeika-api.hf.space`,
creates a demo component and collects a small data payload. When
`HUGGINGFACE_TOKEN` is absent, the script prints a notice and stops before the
Space proxy, component creation and data collection steps. You can override the
server URL by setting `BASE_URL` and the Space host with `HF_SPACE_URL` in your
environment or `.env` file.

## Testing

This project uses [Jest](https://jestjs.io/) for its test suite. Make sure all Node.js dependencies are installed:

```bash
npm install
```

Run the Jest tests with:

```bash
npm test
```

### HUGGINGFACE_TOKEN for tests

The `/ai/huggingface/completion` endpoint expects a `HUGGINGFACE_TOKEN`. The test
suite mocks this route so no token is needed and no log messages are produced.
If you want to exercise the real endpoint during tests, provide the token:

```bash
HUGGINGFACE_TOKEN=your_hf_api_token npm test
```

The mock lives in `src/routes/__mocks__/huggingface.js`. Remove the
`jest.mock('../src/routes/huggingface')` line in `__tests__/api.test.js` if you
wish to call the real API.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

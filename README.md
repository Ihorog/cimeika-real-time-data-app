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
   - Centralized fetch-based client (`core/api`)
   - `dotenv`: For environment variable loading

4. **Configuration**:
    Copy `.env.example` to `.env` and add your API keys:
    ```bash
    cp .env.example .env
    ```


  Then edit `.env` to set required tokens such as `OPENAI_API_KEY`,
   `HF_WRITE_TOKEN`, and optionally `DEFAULT_CITY` (e.g., `London`) and
   `DEFAULT_SIGN` (e.g., `aries`).

  `HUGGINGFACE_TOKEN` is optional and onlyneeded for the `/ai/huggingface/completion`
  route. Without it, that endpoint returns a 503 and scripts like `api_scenario.js`
  log a notice and exit. Adjust `PORT` if you need a different server port (default
  `7860`). The `.env` file is ignored by git.
  Set `SENSE_ENDPOINT` to point Ci at a different semantic sensing service
  (default `http://localhost:8000/mitca/sense`). Optional knobs
  `SENSE_TIMEOUT_MS` (default `5000`) and `SENSE_RETRIES` (default `2`) govern
  request timeout and retry behavior when calling that service.
  If you prefer JSON-based configuration, copy `api_keys.example.json` to
  `api_keys.json` and replace the placeholder values with your real API keys:
  ```bash
  cp api_keys.example.json api_keys.json
  ``


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

## Running the API Backend

This project includes an Express server scaffolded from the OpenAPI definition
`cimeika-api.yaml`. The backend provides stub implementations for the API
endpoints and validates requests against the specification.

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```
   The server will listen on `http://localhost:3000` by default.

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
- **API Version**: OpenAPI specification version is `0.2.0` (see `cimeika-api.yaml`) and mirrors the FastAPI
  routers. Stub payloads were removed; missing connectors now return explicit 5xx/501 errors so SDKs can react
  deterministically.
- **Dual-axis mechanics**: Ci exposes the PLUS/MINUS axis manifest at `/ci/axes` and resonance scoring at `/ci/axes/resonance` to keep brand voices in sync with orchestrated tasks.

## Dependencies

The project depends on the following packages (as specified in `package.json`):

- `express`: "^4.18.2" (for server handling)
- Unified fetch helper under `core/api`
- `dotenv`: "^16.3.1" (for loading environment variables)

Additionally, the CSS framework utilized is [Tailwind CSS](https://tailwindcss.com/).

## Project Structure

The project is structured as follows:

```
cimeika/
├── components/
│   ├── footer.html          # Footer component template
│   ├── header.html          # Header component template
├── pages/
│   ├── home.html            # Main landing page content
├── styles.css                # Custom styles for the application
├── scripts.js                # JavaScript for dynamic functionality
├── index.html               # Main HTML entry point
├── server.js                # Express server generated from OpenAPI
├── package.json             # Node.js configuration
├── api_keys.json           # Configuration file for API keys
├── cimeika-api.yaml         # OpenAPI definition for the API
└── .devcontainer.json       # Configuration for development container
```

### File Descriptions:

- `index.html`: The main HTML document that loads the application.
- `styles.css`: Contains custom styles and animations to enhance the UI.
- `scripts.js`: JavaScript file for handling dynamic content loading, API interactions, and user interactions.
- `server.js`: Express-based API server generated from the OpenAPI file.
- `package.json`: Lists the Node.js dependencies and start script.
- `api_keys.json`: Stores sensitive API keys required for external services. Ensure these are not pushed to public repositories.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
title: Cimeika API
emoji: "🌟"
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# Cimeika

Cimeika is a modern web application that integrates various real-time data services, including weather updates, time information, and astrological forecasts. The platform is designed to enhance the user experience through dynamic content and a visually appealing interface using Tailwind CSS.

## Project Overview

Cimeika provides users with a connected and intelligent experience by aggregating real-time data from multiple APIs. It features a sleek and responsive layout, ensuring that users can access the information they need seamlessly across devices.

## Installation

To set up the Cimeika project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/cimeika.git
   cd cimeika
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
   Then edit `.env` to set `OPENWEATHER_KEY` and `ASTROLOGY_KEY`.
   The `.env` file is ignored by git.

5. **Start the Application**:
   You can run the application using:
   ```bash
   npm start
   ```

## Usage

1. **Access the Application**: Visit `http://localhost:3000` in your web browser.
2. **Interact with Real-Time Data**: The homepage will load with dynamic sections for Weather, Time, and Astrological Forecast featuring a loading animation until the data is fetched.
3. **Navigate through the Application**: Use the dynamic header and footer for navigation to various sections (if implemented).

## Features

- **Real-Time Data**: Fetches and displays current weather, time, and astrology data dynamically.
- **Responsive Design**: Optimized layout for both desktop and mobile devices using Tailwind CSS.
- **Smooth Animations**: Interactive UI components with hover effects and animations.
- **API Integrations**: Connects with multiple APIs to gather and display real-time data.
- **OpenAPI Documentation**: Available at `/openapi` and browsable through Swagger UI at `/docs`.

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

### File Descriptions:

- `public/index.html`: The main HTML document that loads the application.
- `public/styles.css`: Contains custom styles and animations to enhance the UI.
- `public/scripts.js`: JavaScript file for handling dynamic content loading, API interactions, and user interactions.
- `.env`: Stores your private API keys (`OPENWEATHER_KEY`, `ASTROLOGY_KEY`). This file should not be committed to version control. A `.env.example` template is provided for reference.

## Deployment

Run `deploy_cimeika_api.sh` from the repository root to publish the API to a [Hugging Face Space](https://huggingface.co/spaces). Set the required tokens in your shell and then run the script:

```bash
export HF_WRITE_TOKEN=<your-hf-token>
export OPENAI_API_KEY=<your-openai-key>
# optional – for weather endpoints
export WEATHER_API_KEY=<your-openweather-key>
./deploy_cimeika_api.sh
```

The script builds the container using the included `Dockerfile`. To test the Docker image locally, run:

```bash
docker build -t cimeika .
docker run -p 3000:3000 cimeika
```

### What the script does

1. Checks that `git`, `curl`, `python3` and `pip` are available and installs `huggingface_hub` if missing.
2. Logs in to Hugging Face with `huggingface-cli login` using `HF_WRITE_TOKEN`.
3. Clones this repository if needed and creates (or reuses) a Docker-based Space.
4. Pushes the code (including the `Dockerfile`) to the Space and sets the above secrets.
5. Waits for the Space to start and then installs dependencies and runs any Python tests.

After completion the script prints the URL of your running Space so you can verify the deployment.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

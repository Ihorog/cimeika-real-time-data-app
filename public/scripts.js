let config = {};
const DEFAULT_CITY = 'London';
const DEFAULT_SIGN = 'aries';

document.addEventListener('DOMContentLoaded', async function() {
    // Load components first
    loadComponent('components/header.html', '#header-container')
        .then(() => setupMobileMenu())
        .catch(error => console.error('Error loading header:', error));

    loadComponent('components/footer.html', '#footer-container')
        .catch(error => console.error('Error loading footer:', error));

    // Setup navigation after components are loaded
    setupNavigation();
    
    // Load initial page and wait until it's ready
    await loadPage('pages/home.html');

    try {
        config = await fetchConfig();
    } catch (e) {
        console.error('Config load failed:', e);
    }

    // Start real-time data updates
    setupRealTimeData();
});

async function fetchConfig() {
    const res = await fetch('/config');
    if (!res.ok) throw new Error('Failed to load config');
    return res.json();
}

// Component loader
async function loadComponent(componentPath, containerSelector) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load ${componentPath}: ${response.statusText}`);
        }
        const html = await response.text();
        document.querySelector(containerSelector).innerHTML = html;
    } catch (error) {
        console.error(error);
        document.querySelector(containerSelector).innerHTML = 
            `<div class="error-message">Failed to load component: ${error.message}</div>`;
        throw error;
    }
}

// Page loader
async function loadPage(url) {
    const mainContent = document.querySelector('main');
    try {
        mainContent.innerHTML = '<div class="loading text-center py-12">Loading...</div>';
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.text();
        mainContent.innerHTML = data;
    } catch (error) {
        console.error('Error loading page:', error);
        mainContent.innerHTML = `
            <div class="error-message">
                <p>Failed to load page: ${error.message}</p>
                <button onclick="loadPage('pages/home.html')" class="mt-4 bg-gray-800 text-white px-4 py-2 rounded">
                    Return Home
                </button>
            </div>`;
    }
}

// Navigation setup
function setupNavigation() {
    document.addEventListener('click', function(event) {
        const link = event.target.closest('a');
        if (link && link.getAttribute('href').startsWith('pages/')) {
            event.preventDefault();
            loadPage(link.getAttribute('href'));
        }
    });
}

// Mobile menu functionality
function setupMobileMenu() {
    const menuButton = document.querySelector('button[aria-label="Toggle menu"]');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            menuButton.setAttribute('aria-expanded', isHidden);
        });
    }
}

// Start journey function
window.startJourney = function() {
    loadPage('pages/home.html');
};

// Real-time data setup
function setupRealTimeData() {
    // Update time every second
    setInterval(updateTime, 1000);
    
    // Update weather and astrology every 5 minutes
    updateWeather();
    updateAstrology();
    setInterval(updateWeather, 300000);
    setInterval(updateAstrology, 300000);
}

// Time update function
function updateTime() {
    const timeElement = document.getElementById('time-data');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString();
        timeElement.classList.remove('loading');
    }
}

// Weather update function
async function updateWeather() {
    const weatherElement = document.getElementById('weather-data');
    if (!weatherElement) return;

    try {
        const base = config.weatherEndpoint || '/weather/current';
        const response = await fetch(`${base}?city=${DEFAULT_CITY}`);
        if (!response.ok) throw new Error('Weather data unavailable');

        const data = await response.json();
        const { city, weather, temperature } = data;
        if (
            typeof weather !== 'string' ||
            typeof temperature !== 'number' ||
            typeof city !== 'string'
        ) {
            throw new Error('Invalid weather payload');
        }
        weatherElement.textContent = `${city}: ${weather}, ${temperature}°C`;
        weatherElement.classList.remove('loading');
    } catch (error) {
        console.error('Weather error:', error);
        weatherElement.textContent = `Weather data temporarily unavailable for ${DEFAULT_CITY}`;
        weatherElement.classList.add('error-message');
    }
}

// Astrology update function
async function updateAstrology() {
    const astrologyElement = document.getElementById('astrology-data');
    if (!astrologyElement) return;

    try {
        const base = config.astrologyEndpoint || '/astrology/forecast';
        const response = await fetch(`${base}?sign=${DEFAULT_SIGN}`);
        if (!response.ok) throw new Error('Astrological data unavailable');

        const data = await response.json();
        const { sign, forecast } = data;
        if (typeof forecast !== 'string' || typeof sign !== 'string') {
            throw new Error('Invalid astrology payload');
        }
        astrologyElement.textContent = `${sign}: ${forecast}`;
        astrologyElement.classList.remove('loading');
    } catch (error) {
        console.error('Astrology error:', error);
        astrologyElement.textContent = `Astrological forecast temporarily unavailable for ${DEFAULT_SIGN}`;
        astrologyElement.classList.add('error-message');
    }
}

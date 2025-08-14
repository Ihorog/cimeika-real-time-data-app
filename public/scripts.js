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

// Generic fetch/render helper
async function fetchAndRender(endpoint, params, elementId, formatter) {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const url = new URL(endpoint, window.location.origin);
        Object.entries(params || {}).forEach(([key, value]) =>
            url.searchParams.append(key, value)
        );

        const response = await fetch(url);
        if (!response.ok) throw new Error('Request failed');

        const data = await response.json();
        element.textContent = formatter(data);
        element.classList.remove('loading', 'error-message');
    } catch (error) {
        console.error(`${elementId} error:`, error);
        const suffix = Object.values(params || {}).join(', ');
        element.textContent = `Data temporarily unavailable${suffix ? ` for ${suffix}` : ''}`;
        element.classList.add('error-message');
    }
}

// Weather update function
function updateWeather() {
    const base = config.weatherEndpoint || '/weather/current';
    fetchAndRender(
        base,
        { city: DEFAULT_CITY },
        'weather-data',
        data => {
            const { city, weather, temperature } = data;
            if (
                typeof weather !== 'string' ||
                typeof temperature !== 'number' ||
                typeof city !== 'string'
            ) {
                throw new Error('Invalid weather payload');
            }
            return `${city}: ${weather}, ${temperature}°C`;
        }
    );
}

// Astrology update function
function updateAstrology() {
    const base = config.astrologyEndpoint || '/astrology/forecast';
    fetchAndRender(
        base,
        { sign: DEFAULT_SIGN },
        'astrology-data',
        data => {
            const { sign, forecast } = data;
            if (typeof forecast !== 'string' || typeof sign !== 'string') {
                throw new Error('Invalid astrology payload');
            }
            return `${sign}: ${forecast}`;
        }
    );
}

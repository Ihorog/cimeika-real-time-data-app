document.addEventListener('DOMContentLoaded', function() {
    // Load components first
    loadComponent('components/header.html', '#header-container')
        .then(() => setupMobileMenu())
        .catch(error => console.error('Error loading header:', error));

    loadComponent('components/footer.html', '#footer-container')
        .catch(error => console.error('Error loading footer:', error));

    // Setup navigation after components are loaded
    setupNavigation();
    
    // Load initial page
    loadPage('pages/home.html');

    // Start real-time data updates
    setupRealTimeData();
});

// Error tracking mechanism to prevent concurrent operations from clearing each other's errors
const activeErrors = new Map();

function showError(message, operationId = null) {
    const container = document.getElementById('error-container');
    if (container) {
        if (operationId) {
            activeErrors.set(operationId, message);
        } else {
            // For backward compatibility, show error immediately without tracking
            container.textContent = message;
            container.classList.remove('hidden');
            return;
        }
        updateErrorDisplay();
    }
}

function clearError(operationId) {
    if (operationId && activeErrors.has(operationId)) {
        activeErrors.delete(operationId);
        updateErrorDisplay();
    }
}

function updateErrorDisplay() {
    const container = document.getElementById('error-container');
    if (!container) return;
    
    if (activeErrors.size === 0) {
        container.textContent = '';
        container.classList.add('hidden');
    } else {
        // Display all active errors
        const messages = Array.from(activeErrors.values());
        container.textContent = messages.join(' | ');
        container.classList.remove('hidden');
    }
}

async function retryFetch(url, options = {}, retries = 2, attempt = 0) {
    const RETRY_BASE_DELAY_MS = 100;
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(response.statusText);
        return response;
    } catch (err) {
        if (retries > 0) {
            // Exponential backoff: wait 2^attempt * base delay before retrying
            const delay = Math.pow(2, attempt) * RETRY_BASE_DELAY_MS;
            await new Promise(resolve => setTimeout(resolve, delay));
            return await retryFetch(url, options, retries - 1, attempt + 1);
        }
        throw err;
    }
}

// Component loader
async function loadComponent(componentPath, containerSelector) {
    const operationId = `loadComponent:${componentPath}`;
    try {
        const response = await retryFetch(componentPath);
        const html = await response.text();
        document.querySelector(containerSelector).innerHTML = html;
        clearError(operationId);
    } catch (error) {
        console.error(error);
        showError('Connection issue detected. Please check your internet connection.');
        document.querySelector(containerSelector).innerHTML =
            `<div class="error-message">Unable to load ${componentPath}. Please reload the page to try again.</div>`;
        throw error;
    }
}

// Page loader
async function loadPage(url) {
    const operationId = `loadPage:${url}`;
    const mainContent = document.querySelector('main');
    const errorId = `page-${url.replace(/[^a-zA-Z0-9]/g, '-')}`;
    try {
        mainContent.innerHTML = '<div class="loading text-center py-12">Loading...</div>';
        const response = await retryFetch(url);
        const data = await response.text();
        clearError(operationId);
        mainContent.innerHTML = data;
    } catch (error) {
        console.error('Error loading page:', error);
        showError('Connection issue detected. Please check your internet connection.');
        mainContent.innerHTML = `
            <div class="error-message">
                <p>Unable to load the requested page.</p>
                <button onclick="loadPage('${url}')" class="mt-4 bg-gray-800 text-white px-4 py-2 rounded">
                    Retry
                </button>
                <button onclick="loadPage('pages/home.html')" class="mt-4 bg-gray-800 text-white px-4 py-2 rounded ml-2">
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
        const response = await retryFetch('https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY');
        const data = await response.json();
        weatherElement.textContent = `${data.weather[0].description}, ${Math.round(data.main.temp - 273.15)}°C`;
        weatherElement.classList.remove('loading');
    } catch (error) {
        console.error('Weather error:', error);
        weatherElement.textContent = 'Weather data temporarily unavailable';
        weatherElement.classList.add('error-message');
    }
}

// Astrology update function
async function updateAstrology() {
    const astrologyElement = document.getElementById('astrology-data');
    if (!astrologyElement) return;

    try {
        const response = await retryFetch('https://api.freeastrologyapi.com/forecast?sign=aries&apikey=YOUR_API_KEY');
        const data = await response.json();
        astrologyElement.textContent = data.forecast;
        astrologyElement.classList.remove('loading');
    } catch (error) {
        console.error('Astrology error:', error);
        astrologyElement.textContent = 'Astrological forecast temporarily unavailable';
        astrologyElement.classList.add('error-message');
    }
}

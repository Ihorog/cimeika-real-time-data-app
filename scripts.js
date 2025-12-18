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

// Error tracking to manage concurrent operations
let activeErrors = new Set();

function showError(message, errorId = 'default') {
    activeErrors.add(errorId);
    const container = document.getElementById('error-container');
    if (container) {
        container.textContent = message;
        container.classList.remove('hidden');
    }
}

function hideError(errorId = 'default') {
    activeErrors.delete(errorId);
    // Only hide if no other errors are active
    if (activeErrors.size === 0) {
        const container = document.getElementById('error-container');
        if (container) {
            container.textContent = '';
            container.classList.add('hidden');
        }
    }
}

async function retryFetch(url, options = {}, retries = 2, delay = 1000) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(response.statusText);
        return response;
    } catch (err) {
        if (retries > 0) {
            // Exponential backoff: wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
            return await retryFetch(url, options, retries - 1, delay * 2);
        }
        throw err;
    }
}

// Component loader
async function loadComponent(componentPath, containerSelector) {
    const errorId = `component-${containerSelector.replace(/[^a-zA-Z0-9]/g, '-')}`;
    try {
        const response = await retryFetch(componentPath);
        const html = await response.text();
        document.querySelector(containerSelector).innerHTML = html;
        hideError(errorId);
    } catch (error) {
        console.error(error);
        showError(`Failed to load component: ${error.message}. Check your internet connection and try again.`, errorId);
        throw error;
    }
}

// Page loader
async function loadPage(url) {
    const mainContent = document.querySelector('main');
    const errorId = `page-${url.replace(/[^a-zA-Z0-9]/g, '-')}`;
    try {
        mainContent.innerHTML = '<div class="loading text-center py-12">Loading...</div>';
        const response = await retryFetch(url);
        const data = await response.text();
        hideError(errorId);
        mainContent.innerHTML = data;
    } catch (error) {
        console.error('Error loading page:', error);
        showError(`Failed to load page: ${error.message}. Check your internet connection and try again.`, errorId);
        mainContent.innerHTML = `
            <div class="error-message">
                <p>Failed to load page: ${error.message}</p>
                <button class="retry-button mt-4 bg-gray-800 text-white px-4 py-2 rounded">
                    Retry
                </button>
                <button class="return-home-button mt-4 bg-gray-800 text-white px-4 py-2 rounded ml-2">
                    Return Home
                </button>
            </div>`;
        const retryButton = mainContent.querySelector('.retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', function() {
                loadPage(url);
            });
        }
        const returnHomeButton = mainContent.querySelector('.return-home-button');
        if (returnHomeButton) {
            returnHomeButton.addEventListener('click', function() {
                loadPage('pages/home.html');
            });
        }
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
        const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY');
        if (!response.ok) throw new Error('Weather data unavailable');
        
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
        const response = await fetch('https://api.freeastrologyapi.com/forecast?sign=aries&apikey=YOUR_API_KEY');
        if (!response.ok) throw new Error('Astrological data unavailable');
        
        const data = await response.json();
        astrologyElement.textContent = data.forecast;
        astrologyElement.classList.remove('loading');
    } catch (error) {
        console.error('Astrology error:', error);
        astrologyElement.textContent = 'Astrological forecast temporarily unavailable';
        astrologyElement.classList.add('error-message');
    }
}

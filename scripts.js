document.addEventListener('DOMContentLoaded', function() {
    // Load components first
    loadComponent('components/header.html', '#header-container')
        .then(() => setupMobileMenu())
        .catch(error => console.error('Error loading header:', error));

    loadComponent('components/footer.html', '#footer-container')
        .catch(error => console.error('Error loading footer:', error));

    // Setup navigation after components are loaded
    setupNavigation();
    
    // Setup start journey button
    setupStartJourneyButton();
    
    // Load initial page
    loadPage('pages/home.html');

    // Start real-time data updates
    setupRealTimeData();
});

// Error queue management
let errorQueue = [];
let isShowingError = false;
let errorTimeoutId = null;
const ERROR_DISPLAY_DURATION = 5000; // Display each error for 5 seconds
const ERROR_FALLBACK_DELAY = 100; // Delay before processing next error if container not found

function showError(message) {
    errorQueue.push(message);
    if (!isShowingError) {
        displayNextError();
    }
}

function displayNextError() {
    if (errorQueue.length === 0) {
        isShowingError = false;
        return;
    }
    
    isShowingError = true;
    const message = errorQueue.shift();
    const container = document.getElementById('error-container');
    
    if (container) {
        container.textContent = message;
        container.classList.remove('hidden');
        
        // Auto-hide after configured duration and show next error
        errorTimeoutId = setTimeout(() => {
            container.classList.add('hidden');
            container.textContent = '';
            errorTimeoutId = null;
            displayNextError();
        }, ERROR_DISPLAY_DURATION);
    } else {
        // If container not found, log warning and continue with next error
        console.warn('Error container not found. Skipping error:', message);
        errorTimeoutId = setTimeout(() => {
            errorTimeoutId = null;
            displayNextError();
        }, ERROR_FALLBACK_DELAY);
    }
}

function hideError() {
    // Clear any pending timeout to prevent inconsistent state
    if (errorTimeoutId) {
        clearTimeout(errorTimeoutId);
        errorTimeoutId = null;
    }
    
    const container = document.getElementById('error-container');
    if (container) {
        container.textContent = '';
        container.classList.add('hidden');
    }
    
    // Reset state for the currently displayed error, but preserve queued errors
    isShowingError = false;
    
    // If there are more errors queued, continue displaying them
    if (errorQueue.length > 0) {
        displayNextError();
    }
}

async function retryFetch(url, options = {}, retries = 2) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(response.statusText);
        return response;
    } catch (err) {
        if (retries > 0) {
            await new Promise(res => setTimeout(res, 1000)); // Wait 1 second before retrying
            return await retryFetch(url, options, retries - 1);
        }
        throw err;
    }
}

// Component loader
async function loadComponent(componentPath, containerSelector) {
    try {
        const response = await retryFetch(componentPath);
        const html = await response.text();
        document.querySelector(containerSelector).innerHTML = html;
        hideError();
    } catch (error) {
        console.error(error);
        // Use textContent to safely display error message without XSS risk
        const container = document.querySelector(containerSelector);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.textContent = 'Failed to load component. Please try reloading.';
        container.innerHTML = '';
        container.appendChild(errorDiv);
        
        // Show global error with a user-friendly, non-technical message
        showError('Failed to load component. Check your internet connection and try again.');
        throw error;
    }
}

// Page loader
async function loadPage(url) {
    const mainContent = document.querySelector('main');
    try {
        mainContent.innerHTML = '<div class="loading text-center py-12">Loading...</div>';
        const response = await retryFetch(url);
        const data = await response.text();
        hideError();
        mainContent.innerHTML = data;
    } catch (error) {
        console.error('Error loading page:', error);
        
        // Create error display safely without XSS vulnerabilities
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        
        const errorText = document.createElement('p');
        errorText.textContent = `Failed to load page: ${error.message}`;
        errorDiv.appendChild(errorText);
        
        // Create retry button with event listener instead of inline onclick
        const retryButton = document.createElement('button');
        retryButton.id = 'retry-button';
        retryButton.className = 'mt-4 bg-gray-800 text-white px-4 py-2 rounded';
        retryButton.textContent = 'Retry';
        retryButton.addEventListener('click', function() {
            loadPage(url);
        });
        errorDiv.appendChild(retryButton);
        
        // Create return home button with event listener
        const returnHomeButton = document.createElement('button');
        returnHomeButton.id = 'return-home-button';
        returnHomeButton.className = 'mt-4 bg-gray-800 text-white px-4 py-2 rounded ml-2';
        returnHomeButton.textContent = 'Return Home';
        returnHomeButton.addEventListener('click', function() {
            loadPage('pages/home.html');
        });
        errorDiv.appendChild(returnHomeButton);
        
        mainContent.innerHTML = '';
        mainContent.appendChild(errorDiv);
        
        // Show global error with safe text
        showError(`Failed to load page: ${error.message}. Check your internet connection and try again.`);
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

// Setup start journey button
function setupStartJourneyButton() {
    // Use event delegation so the handler works even if the button element
    // is replaced when page content is reloaded.
    document.addEventListener('click', function(event) {
        const startButton = event.target.closest('#start-journey-button');
        if (startButton) {
            loadPage('pages/home.html');
        }
    });
}

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

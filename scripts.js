document.addEventListener('DOMContentLoaded', function() {
    // Setup error container event delegation
    setupErrorContainerListeners();
    
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

// Setup event delegation for error container dismiss buttons
function setupErrorContainerListeners() {
    const container = document.getElementById('error-container');
    if (container) {
        container.addEventListener('click', function(event) {
            if (event.target.classList.contains('dismiss-error-btn')) {
                const errorDiv = event.target.closest('[data-error-id]');
                if (errorDiv) {
                    const errorId = parseInt(errorDiv.dataset.errorId, 10);
                    dismissError(errorId);
                }
            }
        });
    }
}

// Error queue to handle multiple errors
const errorQueue = [];
let errorIdCounter = 0;

function showError(message) {
    const container = document.getElementById('error-container');
    if (!container) return;
    
    // Add error to queue with timestamp and unique ID
    const timestamp = new Date().toLocaleTimeString();
    const errorId = errorIdCounter + 1;
    errorIdCounter = errorId; // Increment the counter
    
    const errorObj = { 
        message: String(message), // Convert to string, textContent will be XSS-safe
        timestamp, 
        id: errorId,
        timeoutId: null
    };
    
    errorQueue.push(errorObj);
    
    // Display the error
    displayErrors();
    
    // Auto-dismiss this specific error after 10 seconds
    const timeoutId = setTimeout(() => {
        removeErrorById(errorId);
    }, 10000);
    
    // Store timeout ID so it can be cleared if manually dismissed
    errorObj.timeoutId = timeoutId;
}

// Helper function to remove error by ID and update display
function removeErrorById(errorId) {
    const index = errorQueue.findIndex(e => e.id === errorId);
    if (index !== -1) {
        // Clear the auto-dismiss timeout if it exists
        if (errorQueue[index].timeoutId) {
            clearTimeout(errorQueue[index].timeoutId);
        }
        
        errorQueue.splice(index, 1);
        if (errorQueue.length > 0) {
            displayErrors();
        } else {
            const container = document.getElementById('error-container');
            if (container) {
                container.innerHTML = '';
                container.classList.add('hidden');
            }
        }
    }
}

function displayErrors() {
    const container = document.getElementById('error-container');
    if (!container || errorQueue.length === 0) return;
    
    container.innerHTML = '';
    container.classList.remove('hidden');
    
    errorQueue.forEach((error) => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'flex items-center justify-between py-2 px-4 border-b border-red-200 last:border-b-0';
        errorDiv.dataset.errorId = error.id;
        
        // Create text content safely
        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex-1';
        
        const timeStamp = document.createElement('span');
        timeStamp.className = 'font-semibold';
        timeStamp.textContent = `[${error.timestamp}]`;
        
        const messageSpan = document.createElement('span');
        messageSpan.className = 'ml-2';
        messageSpan.textContent = error.message; // textContent is XSS-safe
        
        contentDiv.appendChild(timeStamp);
        contentDiv.appendChild(messageSpan);
        
        // Create dismiss button
        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'ml-4 text-red-600 hover:text-red-800 font-bold dismiss-error-btn';
        dismissBtn.setAttribute('aria-label', 'Dismiss error');
        dismissBtn.textContent = '×';
        
        errorDiv.appendChild(contentDiv);
        errorDiv.appendChild(dismissBtn);
        container.appendChild(errorDiv);
    });
}

function dismissError(errorId) {
    removeErrorById(errorId);
}

function hideError() {
    const container = document.getElementById('error-container');
    if (container) {
        container.innerHTML = '';
        container.classList.add('hidden');
    }
    // Clear all pending timeouts before clearing the queue
    errorQueue.forEach(error => {
        if (error.timeoutId) {
            clearTimeout(error.timeoutId);
        }
    });
    errorQueue.length = 0; // Clear the queue
}

async function retryFetch(url, options = {}, retries = 2) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(response.statusText);
        return response;
    } catch (err) {
        if (retries > 0) {
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
        // Don't clear errors on success - let them auto-dismiss or be manually dismissed
    } catch (error) {
        console.error(error);
        showError(`Failed to load component: ${error.message}. Check your internet connection and try again.`);
        document.querySelector(containerSelector).innerHTML =
            `<div class="error-message">Failed to load component. Please try reloading.</div>`;
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
        mainContent.innerHTML = data;
        // Don't clear errors on success - let them auto-dismiss or be manually dismissed
    } catch (error) {
        console.error('Error loading page:', error);
        showError(`Failed to load page: ${error.message}. Check your internet connection and try again.`);
        mainContent.innerHTML = `
            <div class="error-message">
                <p>Failed to load page: ${error.message}</p>
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

<<<<<<< HEAD
let config = {};
let modelsLoaded = false;

document.addEventListener('DOMContentLoaded', async function() {
=======
// Configuration constants
const MAX_RETRIES = 3; // Total attempts: 3 (1 initial + 2 retries)
const INITIAL_RETRY_DELAY = 1000; // 1 second

let config = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const storageAvailable = (() => {
    try {
        const testKey = '__test';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        console.warn('LocalStorage not available:', e);
        return false;
    }
})();

document.addEventListener('DOMContentLoaded', async function() {
    if (storageAvailable) {
        cleanupCache();
        setInterval(cleanupCache, CACHE_DURATION);
    }
>>>>>>> origin/main
    // Load components first
    loadComponent('components/header.html', '#header-container')
        .then(() => setupMobileMenu())
        .catch(error => console.error('Error loading header:', error));

    loadComponent('components/footer.html', '#footer-container')
        .catch(error => console.error('Error loading footer:', error));

    // Setup navigation after components are loaded
    setupNavigation();
    
<<<<<<< HEAD
    // Load initial page
    loadPage('pages/home.html');
=======
    // Load initial page and wait until it's ready
    await loadPage('pages/home.html');
>>>>>>> origin/main

    try {
        config = await fetchConfig();
    } catch (e) {
        console.error('Config load failed:', e);
    }

    // Start real-time data updates
    setupRealTimeData();
<<<<<<< HEAD

    // Load AI models
    loadAIModels();
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
=======
});

// Global error container functions
function showGlobalError(message) {
    const container = document.getElementById('error-container');
    if (container) {
        container.textContent = message;
        container.classList.remove('hidden');
    }
}

function hideGlobalError() {
    const container = document.getElementById('error-container');
    if (container) {
        container.textContent = '';
        container.classList.add('hidden');
    }
}

function sanitizeHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    doc.querySelectorAll('script, iframe, object, embed').forEach(el => el.remove());

    doc.querySelectorAll('*').forEach(el => {
        [...el.attributes].forEach(attr => {
            const attrName = attr.name.toLowerCase();
            const attrValue = (attr.value || '').trim().toLowerCase();

            if (attrName.startsWith('on')) {
                el.removeAttribute(attr.name);
            }

            if (
                (attrName === 'src' || attrName === 'href') &&
                attrValue.startsWith('javascript:')
            ) {
                el.removeAttribute(attr.name);
            }
        });
    });

    return doc.body;
}

function renderSanitizedHTML(container, htmlString) {
    const safeBody = sanitizeHTML(htmlString);
    const fragment = document.createDocumentFragment();
    fragment.append(...Array.from(safeBody.childNodes));
    container.replaceChildren(fragment);
}

// Retry fetch with exponential backoff
async function retryFetch(url, options = {}, maxAttempts = MAX_RETRIES) {
    let lastError;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText || 'Request failed'}`);
            }
            return response;
        } catch (error) {
            lastError = error;
            
            // Don't retry on the last attempt
            if (attempt < maxAttempts - 1) {
                // Exponential backoff: delay = INITIAL_RETRY_DELAY * 2^attempt
                const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
                console.warn(`Fetch attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    // All attempts failed
    throw lastError;
}

// Error display management
// Note: showError automatically clears previous errors before displaying new ones
function showError(container, message) {
    if (!container) return;
    
    // Remove any existing error messages to avoid duplicates
    hideError(container);
    
    const errorBox = document.createElement('div');
    errorBox.className = 'error-message';
    errorBox.setAttribute('data-error', 'true');
    errorBox.textContent = message;
    container.appendChild(errorBox);
}

function hideError(container) {
    if (!container) return;
    
    const errorElements = container.querySelectorAll('[data-error="true"]');
    errorElements.forEach(el => el.remove());
}

async function fetchConfig() {
    const res = await retryFetch('/config');
    return res.json();
}

function getCache(key) {
    if (!storageAvailable) return null;
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
            return parsed.data;
        }
        localStorage.removeItem(key);
    } catch (e) {
        console.error('Cache parse error', e);
    }
    return null;
}

function setCache(key, data) {
    if (!storageAvailable) return;
    try {
        localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) {
        console.error('Cache store error', e);
    }
}

function cleanupCache() {
    if (!storageAvailable) return;
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        try {
            const item = JSON.parse(localStorage.getItem(key));
            if (!item || typeof item.timestamp !== 'number') continue;
            if (now - item.timestamp >= CACHE_DURATION) {
                localStorage.removeItem(key);
            }
        } catch (e) {
            // ignore parsing errors
        }
    }
}

// Component loader
async function loadComponent(componentPath, containerSelector) {
    const container = document.querySelector(containerSelector);
    try {
        const response = await retryFetch(componentPath);
        const html = await response.text();
        if (container) {
            renderSanitizedHTML(container, html);
        }
    } catch (error) {
        console.error(error);
        if (container) {
            container.replaceChildren(); // Clear existing content
            showError(container, `Failed to load component: ${error.message}`);
        }
>>>>>>> origin/main
        throw error;
    }
}

// Page loader
async function loadPage(url) {
    const mainContent = document.querySelector('main');
<<<<<<< HEAD
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

    // Load AI models after page content is loaded
    if (!modelsLoaded) {
        const observer = new MutationObserver((mutations, obs) => {
            if (document.querySelector('main').innerHTML.trim() !== '') {
                loadAIModels();
                modelsLoaded = true;
                obs.disconnect(); // Stop observing once models are loaded
            }
        });
        observer.observe(document.querySelector('main'), { childList: true, subtree: true });
=======
    if (!mainContent) return;

    try {
        const loading = document.createElement('div');
        loading.className = 'loading text-center py-12';
        loading.textContent = 'Loading...';
        mainContent.replaceChildren(loading);
        const response = await retryFetch(url);
        const data = await response.text();
        hideGlobalError();
        renderSanitizedHTML(mainContent, data);
    } catch (error) {
        console.error('Error loading page:', error);
        
        const errorWrapper = document.createElement('div');
        errorWrapper.className = 'error-message';
        errorWrapper.setAttribute('data-error', 'true');

        const errorText = document.createElement('p');
        errorText.textContent = `Failed to load page: ${error.message}. Please check your internet connection and try again.`;

        const retryButton = document.createElement('button');
        retryButton.className = 'mt-4 bg-gray-800 text-white px-4 py-2 rounded';
        retryButton.textContent = 'Retry';
        retryButton.addEventListener('click', () => loadPage(url));

        const backButton = document.createElement('button');
        backButton.className = 'mt-4 bg-gray-800 text-white px-4 py-2 rounded ml-2';
        backButton.textContent = 'Return Home';
        backButton.addEventListener('click', () => loadPage('pages/home.html'));

        errorWrapper.append(errorText, retryButton, backButton);
        mainContent.replaceChildren(errorWrapper);
>>>>>>> origin/main
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

<<<<<<< HEAD
// Weather update function
async function updateWeather() {
    const weatherElement = document.getElementById('weather-data');
    if (!weatherElement) return;

    try {
        const endpoint = config.weatherEndpoint || '/weather/current';
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Weather data unavailable');

        const data = await response.json();
        weatherElement.textContent = `${data.weather}, ${data.temperature}°C`;
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
        const endpoint = config.astrologyEndpoint || '/astrology/forecast';
        const response = await fetch(endpoint);
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

// AI Models and Chat Functions

// Load available AI models
async function loadAIModels() {
    const modelSelect = document.getElementById('model-select');
    if (!modelSelect) return;

    try {
        const response = await fetch('/ai/huggingface/models');
        if (!response.ok) throw new Error('Failed to load models');

        const data = await response.json();
        modelSelect.innerHTML = '';
        
        data.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = `${model.name} - ${model.description}`;
            modelSelect.appendChild(option);
        });

        // Set default model
        if (data.models.length > 0) {
            modelSelect.value = data.models[0].id;
        }
    } catch (error) {
        console.error('Error loading AI models:', error);
        modelSelect.innerHTML = '<option value="">Error loading models</option>';
    }
}

// Send chat message
async function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const modelSelect = document.getElementById('model-select');
    const chatMessages = document.getElementById('chat-messages');
    const chatLoading = document.getElementById('chat-loading');

    if (!chatInput || !modelSelect || !chatMessages) return;

    const message = chatInput.value.trim();
    const selectedModel = modelSelect.value;

    if (!message) {
        alert('Please enter a message');
        return;
    }

    if (!selectedModel) {
        alert('Please select a model');
        return;
    }

    // Clear initial message if it's the first interaction
    if (chatMessages.querySelector('.text-gray-500')) {
        chatMessages.innerHTML = '';
    }

    // Add user message
    addMessageToChat('user', message);
    
    // Clear input and show loading
    chatInput.value = '';
    chatLoading.classList.remove('hidden');

    try {
        const response = await fetch('/ai/huggingface/completion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: message,
                model: selectedModel,
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get AI response');
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.text || 'No response generated';

        // Add AI response
        addMessageToChat('ai', aiResponse, selectedModel);

    } catch (error) {
        console.error('Chat error:', error);
        addMessageToChat('error', `Error: ${error.message}`);
    } finally {
        chatLoading.classList.add('hidden');
    }
}

// Add message to chat
function addMessageToChat(type, message, model = '') {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `mb-4 ${type === 'user' ? 'text-right' : 'text-left'}`;

    let messageClass = 'inline-block p-3 rounded-lg max-w-[80%]';
    let icon = '';
    let label = '';

    switch (type) {
        case 'user':
            messageClass += ' bg-blue-600 text-white';
            icon = '<i class="fas fa-user mr-2"></i>';
            label = 'You';
            break;
        case 'ai':
            messageClass += ' bg-gray-200 text-gray-800';
            icon = '<i class="fas fa-robot mr-2"></i>';
            label = model ? `AI (${model.split('/').pop()})` : 'AI';
            break;
        case 'error':
            messageClass += ' bg-red-100 text-red-800 border border-red-300';
            icon = '<i class="fas fa-exclamation-triangle mr-2"></i>';
            label = 'Error';
            break;
    }

    messageDiv.innerHTML = `
        <div class="${messageClass}">
            <div class="text-xs opacity-75 mb-1">${icon}${label}</div>
            <div>${message}</div>
            <div class="text-xs opacity-75 mt-1">${new Date().toLocaleTimeString()}</div>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Clear chat messages
function clearChat() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    chatMessages.innerHTML = '<p class="text-gray-500 italic">Start a conversation with the AI assistant...</p>';
}

// Handle Enter key in chat input
// Added to the first `DOMContentLoaded` listener for consistency.

// Make functions globally available
window.sendChatMessage = sendChatMessage;
window.clearChat = clearChat;
=======
// Generic fetch/render helper
async function fetchAndRender(endpoint, params, elementId, formatter, cacheKey) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const cached = cacheKey ? getCache(cacheKey) : null;
    if (cached) {
        element.textContent = formatter(cached);
        element.classList.remove('loading', 'error-message');
        return;
    }

    try {
        const url = new URL(endpoint, window.location.origin);
        Object.entries(params || {}).forEach(([key, value]) =>
            url.searchParams.append(key, value)
        );

        const response = await retryFetch(url);
        const data = await response.json();
        element.textContent = formatter(data);
        element.classList.remove('loading', 'error-message');
        if (cacheKey) setCache(cacheKey, data);
    } catch (error) {
        console.error(`${elementId} error:`, error);
        if (cached) {
            element.textContent = formatter(cached);
            element.classList.remove('loading', 'error-message');
            return;
        }
        const suffix = Object.values(params || {}).join(', ');
        element.textContent = `Data temporarily unavailable${suffix ? ` for ${suffix}` : ''}`;
        element.classList.add('error-message');
    }
}

// Weather update function
function updateWeather() {
    const base = config.weatherEndpoint || '/weather/current';
    const city = config.defaultCity || 'London';
    fetchAndRender(
        base,
        { city },
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
        },
        `weather_${city}`
    );
}

// Astrology update function
function updateAstrology() {
    const base = config.astrologyEndpoint || '/astrology/forecast';
    const sign = config.defaultSign || 'aries';
    fetchAndRender(
        base,
        { sign },
        'astrology-data',
        data => {
            const { sign, forecast } = data;
            if (typeof forecast !== 'string' || typeof sign !== 'string') {
                throw new Error('Invalid astrology payload');
            }
            return `${sign}: ${forecast}`;
        },
        `astrology_${sign}`
    );
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .catch(err => console.error('Service worker registration failed:', err));
    });
}
>>>>>>> origin/main

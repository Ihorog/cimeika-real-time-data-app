let config = {};

document.addEventListener('DOMContentLoaded', async function() {
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

    try {
        config = await fetchConfig();
    } catch (e) {
        console.error('Config load failed:', e);
    }

    // Start real-time data updates
    setupRealTimeData();

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

    // Load AI models after page content is loaded
    setTimeout(loadAIModels, 1000);
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
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendChatMessage();
            }
        });
    }
});

// Make functions globally available
window.sendChatMessage = sendChatMessage;
window.clearChat = clearChat;

'use strict';

let config = {
  weatherEndpoint: '/weather/current',
  astrologyEndpoint: '/astrology/forecast',
};

document.addEventListener('DOMContentLoaded', () => {
  void initApp();
});

async function initApp() {
  // 1) Load header/footer (safe even if containers don't exist)
  try {
    await loadComponent('components/header.html', '#header-container');
    setupMobileMenu();
  } catch (error) {
    console.error('Error loading header:', error);
  }

  try {
    await loadComponent('components/footer.html', '#footer-container');
  } catch (error) {
    console.error('Error loading footer:', error);
  }

  // 2) Setup navigation (safe)
  setupNavigation();

  // 3) Load initial page (safe)
  await loadPage('pages/home.html');

  // 4) Load config (non-fatal)
  try {
    const loaded = await fetchConfig();
    config = { ...config, ...(loaded || {}) };
  } catch (e) {
    console.error('Config load failed:', e);
  }

  // 5) Start real-time data updates
  setupRealTimeData();
}

async function fetchConfig() {
  const res = await fetch('/config');
  if (!res.ok) throw new Error(`Failed to load config: ${res.status}`);
  return res.json();
}

// Component loader
async function loadComponent(componentPath, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    // Container not present on this page: do not fail hard.
    return;
  }

  const response = await fetch(componentPath);
  if (!response.ok) {
    throw new Error(`Failed to load ${componentPath}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  container.innerHTML = html;
}

// Page loader
async function loadPage(url) {
  const mainContent = document.querySelector('main');
  if (!mainContent) {
    console.error('Main container <main> not found; cannot load page:', url);
    return;
  }

  try {
    mainContent.innerHTML = '<div class="loading text-center py-12">Loading...</div>';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error loading page: ${response.status} ${response.statusText}`);
    }
    const data = await response.text();
    mainContent.innerHTML = data;
  } catch (error) {
    console.error('Error loading page:', error);
    mainContent.innerHTML = `
      <div class="error-message">
        <p>Failed to load page: ${escapeHtml(error.message)}</p>
        <button id="return-home" class="mt-4 bg-gray-800 text-white px-4 py-2 rounded">
          Return Home
        </button>
      </div>
    `;

    const btn = document.getElementById('return-home');
    if (btn) {
      btn.addEventListener('click', () => void loadPage('pages/home.html'));
    }
  }
}

// Navigation setup
function setupNavigation() {
  document.addEventListener('click', (event) => {
    const link = event.target && event.target.closest ? event.target.closest('a') : null;
    if (!link) return;

    const href = link.getAttribute('href');
    if (typeof href !== 'string') return;

    // Only intercept internal "pages/" navigation
    if (href.startsWith('pages/')) {
      event.preventDefault();
      void loadPage(href);
    }
  });
}

// Mobile menu functionality
function setupMobileMenu() {
  const menuButton = document.querySelector('button[aria-label="Toggle menu"]');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!menuButton || !mobileMenu) return;

  menuButton.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    menuButton.setAttribute('aria-expanded', String(isHidden));
  });
}

// Start journey function (kept for HTML onclick compatibility)
window.startJourney = function startJourney() {
  void loadPage('pages/home.html');
};

// Real-time data setup
function setupRealTimeData() {
  // Update time every second
  setInterval(updateTime, 1000);

  // Update weather and astrology every 5 minutes
  void updateWeather();
  void updateAstrology();
  setInterval(() => void updateWeather(), 300000);
  setInterval(() => void updateAstrology(), 300000);
}

// Time update function
function updateTime() {
  const timeElement = document.getElementById('time-data');
  if (!timeElement) return;

  const now = new Date();
  timeElement.textContent = now.toLocaleTimeString();
  timeElement.classList.remove('loading');
}

// Weather update function
async function updateWeather() {
  const weatherElement = document.getElementById('weather-data');
  if (!weatherElement) return;

  try {
    const endpoint = (config && config.weatherEndpoint) ? config.weatherEndpoint : '/weather/current';
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`Weather data unavailable: ${response.status}`);

    const data = await response.json();
    const weather = data?.weather ?? 'Unknown';
    const temp = data?.temperature ?? '—';
    weatherElement.textContent = `${weather}, ${temp}°C`;
    weatherElement.classList.remove('loading');
    weatherElement.classList.remove('error-message');
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
    const endpoint = (config && config.astrologyEndpoint) ? config.astrologyEndpoint : '/astrology/forecast';
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`Astrological data unavailable: ${response.status}`);

    const data = await response.json();
    const forecast = data?.forecast ?? '—';
    astrologyElement.textContent = forecast;
    astrologyElement.classList.remove('loading');
    astrologyElement.classList.remove('error-message');
  } catch (error) {
    console.error('Astrology error:', error);
    astrologyElement.textContent = 'Astrological forecast temporarily unavailable';
    astrologyElement.classList.add('error-message');
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

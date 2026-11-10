/**
 * AeroSync — Weather Core Logic & Visual Engine
 * Handles data fetching, procedural visual canvas, interactive charts, and ephemeris tracking.
 */

// Application State
const state = {
  unit: 'C', // 'C' or 'F'
  activeCity: 'Tokyo',
  activeTheme: 'rain',
  chartMode: 'temp', // 'temp' | 'precip' | 'wind'
  data: null
};

// Weather Presets Catalog with realistic meteorological parameters
const WEATHER_PRESETS = {
  tokyo: {
    name: 'Tokyo, Japan',
    theme: 'rain',
    tempC: 18,
    feelsC: 16,
    highC: 21,
    lowC: 14,
    condition: 'Heavy Rainfall',
    icon: '🌧️',
    sound: 'rain',
    humidity: 88,
    dewPointC: 16,
    windKmh: 24,
    windDeg: 65,
    windDir: 'ENE',
    windGustKmh: 38,
    pressureHpa: 1008,
    pressureTrend: '▼ Falling (-2.4 hPa)',
    uv: 2,
    uvText: 'Low',
    visibilityKm: 6.5,
    cloudCoverPct: 92,
    aqi: 28,
    aqiText: 'Good',
    sunrise: '06:12 AM',
    sunset: '05:48 PM',
    moon: 'Waxing Gibbous 🌔',
    hourly: [
      { time: 'Now', tempC: 18, pop: 95, wind: 24, icon: '🌧️' },
      { time: '15:00', tempC: 18, pop: 90, wind: 26, icon: '🌧️' },
      { time: '16:00', tempC: 17, pop: 85, wind: 25, icon: '🌧️' },
      { time: '17:00', tempC: 17, pop: 80, wind: 22, icon: '🌦️' },
      { time: '18:00', tempC: 16, pop: 60, wind: 20, icon: '🌦️' },
      { time: '19:00', tempC: 16, pop: 40, wind: 18, icon: '☁️' },
      { time: '20:00', tempC: 15, pop: 30, wind: 17, icon: '☁️' },
      { time: '21:00', tempC: 15, pop: 20, wind: 15, icon: '☁️' }
    ],
    weekly: [
      { day: 'Today', cond: 'Heavy Rain', icon: '🌧️', hiC: 21, loC: 14 },
      { day: 'Wed', cond: 'Scattered Showers', icon: '🌦️', hiC: 22, loC: 15 },
      { day: 'Thu', cond: 'Partly Cloudy', icon: '⛅', hiC: 24, loC: 16 },
      { day: 'Fri', cond: 'Sunny / Mild', icon: '☀️', hiC: 25, loC: 17 },
      { day: 'Sat', cond: 'Clear Sky', icon: '☀️', hiC: 26, loC: 18 },
      { day: 'Sun', cond: 'Overcast', icon: '☁️', hiC: 22, loC: 16 },
      { day: 'Mon', cond: 'Light Rain', icon: '🌧️', hiC: 20, loC: 15 }
    ]
  },
  reykjavik: {
    name: 'Reykjavík, Iceland',
    theme: 'snow',
    tempC: -2,
    feelsC: -7,
    highC: 1,
    lowC: -5,
    condition: 'Blizzard & Freezing Mist',
    icon: '🌨️',
    sound: 'snow',
    humidity: 92,
    dewPointC: -3,
    windKmh: 42,
    windDeg: 340,
    windDir: 'NNW',
    windGustKmh: 64,
    pressureHpa: 994,
    pressureTrend: '▼ Falling (-4.1 hPa)',
    uv: 0,
    uvText: 'Minimal',
    visibilityKm: 2.1,
    cloudCoverPct: 98,
    aqi: 12,
    aqiText: 'Pristine',
    sunrise: '09:40 AM',
    sunset: '04:15 PM',
    moon: 'Full Moon 🌕',
    hourly: [
      { time: 'Now', tempC: -2, pop: 90, wind: 42, icon: '🌨️' },
      { time: '15:00', tempC: -2, pop: 95, wind: 45, icon: '🌨️' },
      { time: '16:00', tempC: -3, pop: 90, wind: 44, icon: '🌨️' },
      { time: '17:00', tempC: -3, pop: 85, wind: 40, icon: '🌨️' },
      { time: '18:00', tempC: -4, pop: 70, wind: 36, icon: '🌨️' },
      { time: '19:00', tempC: -4, pop: 60, wind: 32, icon: '☁️' },
      { time: '20:00', tempC: -5, pop: 40, wind: 28, icon: '☁️' },
      { time: '21:00', tempC: -5, pop: 30, wind: 25, icon: '☁️' }
    ],
    weekly: [
      { day: 'Today', cond: 'Blizzard', icon: '🌨️', hiC: 1, loC: -5 },
      { day: 'Wed', cond: 'Snow Flurries', icon: '🌨️', hiC: 0, loC: -6 },
      { day: 'Thu', cond: 'Freezing Fog', icon: '🌫️', hiC: -1, loC: -8 },
      { day: 'Fri', cond: 'Partly Sun', icon: '⛅', hiC: 1, loC: -4 },
      { day: 'Sat', cond: 'Cold Wind', icon: '💨', hiC: 2, loC: -3 },
      { day: 'Sun', cond: 'Heavy Snow', icon: '🌨️', hiC: -1, loC: -7 },
      { day: 'Mon', cond: 'Cloudy', icon: '☁️', hiC: 0, loC: -5 }
    ]
  },
  miami: {
    name: 'Miami, USA',
    theme: 'thunder',
    tempC: 31,
    feelsC: 38,
    highC: 33,
    lowC: 26,
    condition: 'Tropical Thunderstorm',
    icon: '⛈️',
    sound: 'thunder',
    humidity: 86,
    dewPointC: 25,
    windKmh: 35,
    windDeg: 130,
    windDir: 'SE',
    windGustKmh: 58,
    pressureHpa: 1004,
    pressureTrend: '▼ Sharp Drop',
    uv: 8,
    uvText: 'Very High',
    visibilityKm: 8.0,
    cloudCoverPct: 85,
    aqi: 32,
    aqiText: 'Moderate',
    sunrise: '06:40 AM',
    sunset: '06:30 PM',
    moon: 'Waning Gibbous 🌖',
    hourly: [
      { time: 'Now', tempC: 31, pop: 90, wind: 35, icon: '⛈️' },
      { time: '15:00', tempC: 30, pop: 95, wind: 38, icon: '⛈️' },
      { time: '16:00', tempC: 29, pop: 85, wind: 32, icon: '⛈️' },
      { time: '17:00', tempC: 28, pop: 60, wind: 26, icon: '🌦️' },
      { time: '18:00', tempC: 28, pop: 40, wind: 20, icon: '⛅' },
      { time: '19:00', tempC: 27, pop: 20, wind: 18, icon: '🌤️' },
      { time: '20:00', tempC: 27, pop: 10, wind: 16, icon: '🌙' },
      { time: '21:00', tempC: 26, pop: 10, wind: 14, icon: '🌙' }
    ],
    weekly: [
      { day: 'Today', cond: 'Thunderstorm', icon: '⛈️', hiC: 33, loC: 26 },
      { day: 'Wed', cond: 'Scattered Storms', icon: '⛈️', hiC: 32, loC: 26 },
      { day: 'Thu', cond: 'Sunny / Humid', icon: '☀️', hiC: 34, loC: 27 },
      { day: 'Fri', cond: 'Partly Cloudy', icon: '⛅', hiC: 33, loC: 26 },
      { day: 'Sat', cond: 'Ocean Breeze', icon: '🌤️', hiC: 32, loC: 25 },
      { day: 'Sun', cond: 'Afternoon Rain', icon: '🌦️', hiC: 31, loC: 25 },
      { day: 'Mon', cond: 'Tropical Sun', icon: '☀️', hiC: 33, loC: 26 }
    ]
  },
  dubai: {
    name: 'Dubai, UAE',
    theme: 'clear',
    tempC: 37,
    feelsC: 41,
    highC: 40,
    lowC: 29,
    condition: 'Blazing Sun & Clear Skies',
    icon: '☀️',
    sound: 'clear',
    humidity: 42,
    dewPointC: 17,
    windKmh: 18,
    windDeg: 290,
    windDir: 'WNW',
    windGustKmh: 28,
    pressureHpa: 1012,
    pressureTrend: '▲ Steady',
    uv: 11,
    uvText: 'Extreme',
    visibilityKm: 12.0,
    cloudCoverPct: 5,
    aqi: 72,
    aqiText: 'Moderate Dust',
    sunrise: '05:42 AM',
    sunset: '06:55 PM',
    moon: 'New Moon 🌑',
    hourly: [
      { time: 'Now', tempC: 37, pop: 0, wind: 18, icon: '☀️' },
      { time: '15:00', tempC: 39, pop: 0, wind: 20, icon: '☀️' },
      { time: '16:00', tempC: 38, pop: 0, wind: 19, icon: '☀️' },
      { time: '17:00', tempC: 36, pop: 0, wind: 17, icon: '☀️' },
      { time: '18:00', tempC: 34, pop: 0, wind: 15, icon: '🌅' },
      { time: '19:00', tempC: 32, pop: 0, wind: 14, icon: '🌙' },
      { time: '20:00', tempC: 31, pop: 0, wind: 12, icon: '🌙' },
      { time: '21:00', tempC: 30, pop: 0, wind: 11, icon: '🌙' }
    ],
    weekly: [
      { day: 'Today', cond: 'Sunny / Hot', icon: '☀️', hiC: 40, loC: 29 },
      { day: 'Wed', cond: 'Sunny', icon: '☀️', hiC: 39, loC: 28 },
      { day: 'Thu', cond: 'Hazy Sun', icon: '🌤️', hiC: 41, loC: 30 },
      { day: 'Fri', cond: 'Hot & Arid', icon: '☀️', hiC: 42, loC: 30 },
      { day: 'Sat', cond: 'Clear Sky', icon: '☀️', hiC: 40, loC: 29 },
      { day: 'Sun', cond: 'Mild Breeze', icon: '🌤️', hiC: 38, loC: 28 },
      { day: 'Mon', cond: 'Sunny', icon: '☀️', hiC: 39, loC: 29 }
    ]
  },
  london: {
    name: 'London, UK',
    theme: 'cloudy',
    tempC: 15,
    feelsC: 14,
    highC: 17,
    lowC: 11,
    condition: 'Overcast & Low Clouds',
    icon: '☁️',
    sound: 'wind',
    humidity: 78,
    dewPointC: 11,
    windKmh: 20,
    windDeg: 230,
    windDir: 'SW',
    windGustKmh: 32,
    pressureHpa: 1016,
    pressureTrend: '▲ Rising (+1.2 hPa)',
    uv: 3,
    uvText: 'Moderate',
    visibilityKm: 9.0,
    cloudCoverPct: 88,
    aqi: 22,
    aqiText: 'Good',
    sunrise: '06:35 AM',
    sunset: '06:15 PM',
    moon: 'First Quarter 🌓',
    hourly: [
      { time: 'Now', tempC: 15, pop: 20, wind: 20, icon: '☁️' },
      { time: '15:00', tempC: 16, pop: 25, wind: 22, icon: '☁️' },
      { time: '16:00', tempC: 16, pop: 30, wind: 21, icon: '☁️' },
      { time: '17:00', tempC: 15, pop: 20, wind: 19, icon: '⛅' },
      { time: '18:00', tempC: 14, pop: 15, wind: 18, icon: '⛅' },
      { time: '19:00', tempC: 13, pop: 10, wind: 16, icon: '☁️' },
      { time: '20:00', tempC: 12, pop: 10, wind: 15, icon: '☁️' },
      { time: '21:00', tempC: 11, pop: 5, wind: 14, icon: '☁️' }
    ],
    weekly: [
      { day: 'Today', cond: 'Overcast', icon: '☁️', hiC: 17, loC: 11 },
      { day: 'Wed', cond: 'Drizzle', icon: '🌦️', hiC: 16, loC: 10 },
      { day: 'Thu', cond: 'Passing Clouds', icon: '⛅', hiC: 18, loC: 12 },
      { day: 'Fri', cond: 'Sunny Spells', icon: '🌤️', hiC: 19, loC: 13 },
      { day: 'Sat', cond: 'Breezy & Mild', icon: '💨', hiC: 17, loC: 11 },
      { day: 'Sun', cond: 'Overcast', icon: '☁️', hiC: 16, loC: 10 },
      { day: 'Mon', cond: 'Light Showers', icon: '🌧️', hiC: 15, loC: 9 }
    ]
  }
};

// Unit Conversion Helpers
function cToF(c) {
  return Math.round((c * 9/5) + 32);
}

function formatTemp(c) {
  return state.unit === 'C' ? `${c}°` : `${cToF(c)}°`;
}

function formatTempPure(c) {
  return state.unit === 'C' ? c : cToF(c);
}

// UI Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const unitC = document.getElementById('unitC');
const unitF = document.getElementById('unitF');
const soundMasterBtn = document.getElementById('soundMasterBtn');
const soundLabel = document.getElementById('soundLabel');
const voiceBriefingBtn = document.getElementById('voiceBriefingBtn');
const soundVolSlider = document.getElementById('soundVolSlider');
const volPercent = document.getElementById('volPercent');
const soundscapeState = document.getElementById('soundscapeState');

// Metrics DOM Elements
const cityNameEl = document.getElementById('cityName');
const weatherConditionEl = document.getElementById('weatherCondition');
const weatherIconBadgeEl = document.getElementById('weatherIconBadge');
const tempValueEl = document.getElementById('tempValue');
const feelsLikeEl = document.getElementById('feelsLike');
const tempHighEl = document.getElementById('tempHigh');
const tempLowEl = document.getElementById('tempLow');
const humidityValEl = document.getElementById('humidityVal');
const humBarEl = document.getElementById('humBar');
const dewPointEl = document.getElementById('dewPoint');
const windValEl = document.getElementById('windVal');
const windNeedleEl = document.getElementById('windNeedle');
const windDirTextEl = document.getElementById('windDirText');
const windGustEl = document.getElementById('windGust');
const pressureValEl = document.getElementById('pressureVal');
const pressureTrendEl = document.getElementById('pressureTrend');
const uvValEl = document.getElementById('uvVal');
const uvBarEl = document.getElementById('uvBar');
const visValEl = document.getElementById('visVal');
const cloudCoverEl = document.getElementById('cloudCover');
const aqiValEl = document.getElementById('aqiVal');
const hourlyStripEl = document.getElementById('hourlyStrip');
const weeklyListEl = document.getElementById('weeklyList');
const sunriseTimeEl = document.getElementById('sunriseTime');
const sunsetTimeEl = document.getElementById('sunsetTime');
const moonPhaseEl = document.getElementById('moonPhase');

// Initialize Preset
function loadWeather(key) {
  const data = WEATHER_PRESETS[key.toLowerCase()] || WEATHER_PRESETS.tokyo;
  state.data = data;
  state.activeCity = data.name;
  state.activeTheme = data.theme;

  // Set Theme
  document.body.setAttribute('data-theme', data.theme);

  // Update DOM Fields
  cityNameEl.textContent = data.name;
  weatherConditionEl.textContent = data.condition;
  weatherIconBadgeEl.textContent = data.icon;
  tempValueEl.textContent = formatTempPure(data.tempC);
  feelsLikeEl.textContent = formatTemp(data.feelsC);
  tempHighEl.textContent = formatTemp(data.highC);
  tempLowEl.textContent = formatTemp(data.lowC);

  humidityValEl.textContent = `${data.humidity}%`;
  humBarEl.style.width = `${data.humidity}%`;
  dewPointEl.textContent = `Dew point: ${formatTemp(data.dewPointC)}`;

  windValEl.textContent = `${data.windKmh} km/h`;
  windNeedleEl.style.transform = `rotate(${data.windDeg}deg)`;
  windDirTextEl.textContent = `${data.windDir} (${data.windDeg}°)`;
  windGustEl.textContent = `Gusts up to ${data.windGustKmh} km/h`;

  pressureValEl.textContent = `${data.pressureHpa} hPa`;
  pressureTrendEl.textContent = data.pressureTrend;

  uvValEl.innerHTML = `${data.uv} <small>(${data.uvText})</small>`;
  uvBarEl.style.width = `${Math.min(100, (data.uv / 11) * 100)}%`;

  visValEl.textContent = `${data.visibilityKm} km`;
  cloudCoverEl.textContent = `Cloud ceiling: ${data.cloudCoverPct > 80 ? '450 m' : '1,800 m'} (${data.cloudCoverPct}%)`;

  aqiValEl.innerHTML = `<span class="aqi-badge good">${data.aqi} ${data.aqiText}</span>`;

  sunriseTimeEl.textContent = data.sunrise;
  sunsetTimeEl.textContent = data.sunset;
  moonPhaseEl.textContent = data.moon;

  // Update Audio Preset Name
  soundscapeState.textContent = `${data.sound.toUpperCase()} AMBIENCE`;
  document.querySelectorAll('.sound-preset-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.sound === data.sound);
  });

  // If audio is playing, smoothly transition to new preset soundscape
  if (weatherAudio.isPlaying) {
    weatherAudio.play(data.sound);
  }

  // Render Charts & Strips
  renderHourlyStrip(data.hourly);
  renderWeeklyList(data.weekly);
  drawTrendChart();
}

function renderHourlyStrip(hourly) {
  hourlyStripEl.innerHTML = hourly.map((h, i) => `
    <div class="hour-node ${i === 0 ? 'now' : ''}">
      <span class="hour-time">${h.time}</span>
      <span class="hour-icon">${h.icon}</span>
      <span class="hour-temp">${formatTemp(h.tempC)}</span>
      <span class="hour-pop">💧 ${h.pop}%</span>
    </div>
  `).join('');
}

function renderWeeklyList(weekly) {
  weeklyListEl.innerHTML = weekly.map(w => `
    <div class="weekly-row">
      <span class="w-day">${w.day}</span>
      <span class="w-icon">${w.icon}</span>
      <span class="w-cond">${w.cond}</span>
      <div class="w-temps">
        <span class="w-high">${formatTemp(w.hiC)}</span>
        <span class="w-low">${formatTemp(w.loC)}</span>
      </div>
    </div>
  `).join('');
}

// Interactive Trend Canvas Line Chart
const chartCanvas = document.getElementById('trendChart');
const chartCtx = chartCanvas.getContext('2d');

function drawTrendChart() {
  if (!state.data) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = chartCanvas.parentElement.getBoundingClientRect();
  chartCanvas.width = rect.width * dpr;
  chartCanvas.height = 180 * dpr;
  chartCtx.scale(dpr, dpr);

  const w = rect.width;
  const h = 180;
  chartCtx.clearRect(0, 0, w, h);

  const hourly = state.data.hourly;
  const count = hourly.length;
  const stepX = (w - 60) / (count - 1);
  const startX = 30;

  // Pick data based on mode
  let vals = [];
  let suffix = '';
  let color = '#38bdf8';

  if (state.chartMode === 'temp') {
    vals = hourly.map(h => state.unit === 'C' ? h.tempC : cToF(h.tempC));
    suffix = '°';
    color = '#38bdf8';
  } else if (state.chartMode === 'precip') {
    vals = hourly.map(h => h.pop);
    suffix = '%';
    color = '#60a5fa';
  } else if (state.chartMode === 'wind') {
    vals = hourly.map(h => h.wind);
    suffix = 'km/h';
    color = '#a78bfa';
  }

  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const range = (maxVal - minVal) || 1;

  // Points coords
  const points = vals.map((v, i) => {
    const x = startX + i * stepX;
    const y = h - 45 - ((v - minVal) / range) * (h - 80);
    return { x, y, val: v, time: hourly[i].time };
  });

  // Area gradient fill
  const grad = chartCtx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + '55');
  grad.addColorStop(1, 'transparent');

  chartCtx.beginPath();
  chartCtx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < count; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    chartCtx.bezierCurveTo(cx, prev.y, cx, curr.y, curr.x, curr.y);
  }
  chartCtx.lineTo(points[count - 1].x, h - 25);
  chartCtx.lineTo(points[0].x, h - 25);
  chartCtx.closePath();
  chartCtx.fillStyle = grad;
  chartCtx.fill();

  // Draw Line
  chartCtx.beginPath();
  chartCtx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < count; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    chartCtx.bezierCurveTo(cx, prev.y, cx, curr.y, curr.x, curr.y);
  }
  chartCtx.strokeStyle = color;
  chartCtx.lineWidth = 3;
  chartCtx.stroke();

  // Draw Dots & Labels
  chartCtx.textAlign = 'center';
  points.forEach(pt => {
    chartCtx.beginPath();
    chartCtx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
    chartCtx.fillStyle = '#fff';
    chartCtx.fill();
    chartCtx.strokeStyle = color;
    chartCtx.lineWidth = 2;
    chartCtx.stroke();

    // Value Text
    chartCtx.fillStyle = '#e2e8f0';
    chartCtx.font = '600 11px Outfit, sans-serif';
    chartCtx.fillText(`${pt.val}${suffix}`, pt.x, pt.y - 10);

    // Time Text
    chartCtx.fillStyle = '#94a3b8';
    chartCtx.font = '10px JetBrains Mono, monospace';
    chartCtx.fillText(pt.time, pt.x, h - 10);
  });
}

window.addEventListener('resize', () => {
  drawTrendChart();
});

// Chart Mode Tabs
document.querySelectorAll('.chart-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    weatherAudio.playClick();
    document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.chartMode = btn.dataset.mode;
    drawTrendChart();
  });
});

// Preset Chips
document.querySelectorAll('.loc-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    weatherAudio.playClick();
    document.querySelectorAll('.loc-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadWeather(btn.dataset.preset);
  });
});

// Search input handling
function performSearch() {
  const query = cityInput.value.trim().toLowerCase();
  if (!query) return;
  weatherAudio.playClick();

  // Match preset or fetch external live API fallback
  const matchedKey = Object.keys(WEATHER_PRESETS).find(k => k.includes(query) || WEATHER_PRESETS[k].name.toLowerCase().includes(query));
  if (matchedKey) {
    loadWeather(matchedKey);
  } else {
    // Attempt Open-Meteo Geocoding + Weather API integration
    fetchOpenMeteo(query);
  }
}

async function fetchOpenMeteo(cityName) {
  try {
    cityNameEl.textContent = `Searching ${cityName}...`;
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      alert(`City "${cityName}" not found. Loading Tokyo preset.`);
      loadWeather('tokyo');
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`);
    const wData = await weatherRes.json();

    // Parse dynamic payload
    const cur = wData.current;
    const wCode = cur.weather_code;
    const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(wCode);
    const isThunder = [95, 96, 99].includes(wCode);
    const isSnow = [71, 73, 75, 77, 85, 86].includes(wCode);
    const isCloud = [1, 2, 3, 45, 48].includes(wCode);

    let theme = 'clear';
    let icon = '☀️';
    let cond = 'Clear Sky';
    let sound = 'birds';

    if (isThunder) { theme = 'thunder'; icon = '⛈️'; cond = 'Thunderstorm'; sound = 'thunder'; }
    else if (isRain) { theme = 'rain'; icon = '🌧️'; cond = 'Rainy Showers'; sound = 'rain'; }
    else if (isSnow) { theme = 'snow'; icon = '🌨️'; cond = 'Snow Flurries'; sound = 'snow'; }
    else if (isCloud) { theme = 'cloudy'; icon = '☁️'; cond = 'Overcast'; sound = 'wind'; }

    const dynamicPreset = {
      name: `${name}, ${country || ''}`,
      theme: theme,
      tempC: Math.round(cur.temperature_2m),
      feelsC: Math.round(cur.apparent_temperature),
      highC: Math.round(wData.daily.temperature_2m_max[0]),
      lowC: Math.round(wData.daily.temperature_2m_min[0]),
      condition: cond,
      icon: icon,
      sound: sound,
      humidity: cur.relative_humidity_2m,
      dewPointC: Math.round(cur.temperature_2m - ((100 - cur.relative_humidity_2m) / 5)),
      windKmh: Math.round(cur.wind_speed_10m),
      windDeg: cur.wind_direction_10m,
      windDir: 'N',
      windGustKmh: Math.round(cur.wind_gusts_10m || cur.wind_speed_10m * 1.4),
      pressureHpa: Math.round(cur.surface_pressure),
      pressureTrend: '▲ Real-time',
      uv: Math.round(wData.daily.uv_index_max[0] || 4),
      uvText: 'Moderate',
      visibilityKm: 10,
      cloudCoverPct: isCloud ? 80 : 15,
      aqi: 25,
      aqiText: 'Good',
      sunrise: wData.daily.sunrise[0]?.split('T')[1] || '06:00',
      sunset: wData.daily.sunset[0]?.split('T')[1] || '18:00',
      moon: 'Waxing Crescent 🌒',
      hourly: [0, 1, 2, 3, 4, 5, 6, 7].map(idx => ({
        time: idx === 0 ? 'Now' : `+${idx * 2}h`,
        tempC: Math.round(wData.hourly.temperature_2m[idx * 2] || cur.temperature_2m),
        pop: Math.round(wData.hourly.precipitation_probability[idx * 2] || 0),
        wind: Math.round(wData.hourly.wind_speed_10m[idx * 2] || 15),
        icon: icon
      })),
      weekly: [0, 1, 2, 3, 4, 5, 6].map(idx => ({
        day: idx === 0 ? 'Today' : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(new Date().getDay() + idx) % 7],
        cond: cond,
        icon: icon,
        hiC: Math.round(wData.daily.temperature_2m_max[idx]),
        loC: Math.round(wData.daily.temperature_2m_min[idx])
      }))
    };

    WEATHER_PRESETS[cityName.toLowerCase()] = dynamicPreset;
    loadWeather(cityName.toLowerCase());
  } catch (err) {
    console.warn("External weather sync fallback:", err);
    alert(`Could not fetch live data for "${cityName}". Showing Tokyo preset.`);
    loadWeather('tokyo');
  }
}

searchBtn.addEventListener('click', performSearch);
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') performSearch();
});

// Unit Toggle
unitC.addEventListener('click', () => {
  if (state.unit === 'C') return;
  weatherAudio.playClick();
  state.unit = 'C';
  unitC.classList.add('active');
  unitF.classList.remove('active');
  loadWeather(state.data ? state.activeTheme : 'tokyo');
});

unitF.addEventListener('click', () => {
  if (state.unit === 'F') return;
  weatherAudio.playClick();
  state.unit = 'F';
  unitF.classList.add('active');
  unitC.classList.remove('active');
  loadWeather(state.data ? state.activeTheme : 'tokyo');
});

// Soundscape Engine Controls
soundMasterBtn.addEventListener('click', () => {
  const isNowPlaying = weatherAudio.toggleMaster();
  soundMasterBtn.classList.toggle('active', isNowPlaying);
  soundLabel.textContent = isNowPlaying ? 'Sound Active' : 'Sound Off';
});

soundVolSlider.addEventListener('input', (e) => {
  const val = e.target.value;
  volPercent.textContent = `${val}%`;
  weatherAudio.setVolume(val / 100);
});

// Manual Sound Preset selector buttons
document.querySelectorAll('.sound-preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    weatherAudio.playClick();
    document.querySelectorAll('.sound-preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const sType = btn.dataset.sound;
    soundscapeState.textContent = `${sType.toUpperCase()} AMBIENCE`;
    weatherAudio.play(sType);
    soundMasterBtn.classList.add('active');
    soundLabel.textContent = 'Sound Active';
  });
});

// Text-To-Speech Weather Broadcast Briefing
voiceBriefingBtn.addEventListener('click', () => {
  weatherAudio.playClick();
  if (!state.data) return;
  const d = state.data;
  const tempStr = state.unit === 'C' ? `${d.tempC} degrees Celsius` : `${cToF(d.tempC)} degrees Fahrenheit`;
  const speechText = `Good day. AeroSync atmospheric briefing for ${d.name}. Current conditions show ${d.condition} at ${tempStr}, feels like ${state.unit === 'C' ? d.feelsC : cToF(d.feelsC)} degrees. Relative humidity is ${d.humidity} percent with winds from the ${d.windDir} at ${d.windKmh} kilometers per hour. Barometric pressure is ${d.pressureHpa} hectopascals. Have a great day and stay prepared.`;
  weatherAudio.speakBriefing(speechText);
});

// ==========================================
// BACKGROUND AMBIENT PROCEDURAL CANVAS LAYER
// (Rain streaks, Snow drifts, Lightning flash, Sunny rays)
// ==========================================
const ambCanvas = document.getElementById('ambientCanvas');
const ambCtx = ambCanvas.getContext('2d');
let particles = [];

function resizeAmbCanvas() {
  ambCanvas.width = window.innerWidth;
  ambCanvas.height = window.innerHeight;
  initParticles();
}
window.addEventListener('resize', resizeAmbCanvas);

function initParticles() {
  particles = [];
  const num = state.activeTheme === 'rain' ? 120 : state.activeTheme === 'snow' ? 80 : 40;
  for (let i = 0; i < num; i++) {
    particles.push({
      x: Math.random() * ambCanvas.width,
      y: Math.random() * ambCanvas.height,
      len: 10 + Math.random() * 20,
      speed: 3 + Math.random() * 7,
      size: 1 + Math.random() * 3,
      alpha: 0.2 + Math.random() * 0.5
    });
  }
}

let flashAlpha = 0;

function animAmbient() {
  ambCtx.clearRect(0, 0, ambCanvas.width, ambCanvas.height);

  const theme = state.activeTheme;

  if (theme === 'thunder' && Math.random() < 0.004) {
    flashAlpha = 0.7; // lightning burst
  }
  if (flashAlpha > 0) {
    ambCtx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
    ambCtx.fillRect(0, 0, ambCanvas.width, ambCanvas.height);
    flashAlpha -= 0.03;
  }

  if (theme === 'rain' || theme === 'thunder') {
    ambCtx.strokeStyle = 'rgba(147, 197, 253, 0.5)';
    ambCtx.lineWidth = 1.5;
    particles.forEach(p => {
      ambCtx.beginPath();
      ambCtx.moveTo(p.x, p.y);
      ambCtx.lineTo(p.x - 3, p.y + p.len);
      ambCtx.stroke();

      p.y += p.speed * 2;
      p.x -= 1;
      if (p.y > ambCanvas.height) {
        p.y = -20;
        p.x = Math.random() * ambCanvas.width;
      }
    });
  } else if (theme === 'snow') {
    ambCtx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    particles.forEach(p => {
      ambCtx.beginPath();
      ambCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ambCtx.fill();

      p.y += p.speed * 0.35;
      p.x += Math.sin(p.y * 0.02) * 0.8;
      if (p.y > ambCanvas.height) {
        p.y = -10;
        p.x = Math.random() * ambCanvas.width;
      }
    });
  } else if (theme === 'clear') {
    // Soft glowing floating dust / sun motes
    ambCtx.fillStyle = 'rgba(251, 191, 36, 0.35)';
    particles.forEach(p => {
      ambCtx.beginPath();
      ambCtx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
      ambCtx.fill();

      p.y -= p.speed * 0.15;
      p.x += Math.cos(p.y * 0.01) * 0.5;
      if (p.y < 0) {
        p.y = ambCanvas.height + 10;
        p.x = Math.random() * ambCanvas.width;
      }
    });
  }

  requestAnimationFrame(animAmbient);
}

// Initialize on Load
resizeAmbCanvas();
requestAnimationFrame(animAmbient);
loadWeather('tokyo');


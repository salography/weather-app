console.log('Script loaded');

import { handleVideoHover } from "./assets/videos/videos"; 
    
let weatherData = []; // Store the weather data globally

window.fetchForecast = fetchForecast;
window.toggleSettings = toggleSettings;

function toggleSettings() {
    const settingsContainer = document.getElementById("settingsContainer");
    if (!settingsContainer) {
        console.error("Settings container element not found");
        return;
    }
    settingsContainer.classList.toggle("hidden");
}

async function fetchForecast(city) {
    if (!city || city.trim() === "") {
        const errorElement = document.getElementById("error");
        if (!errorElement) {
            console.error("Error element not found");
            return;
        }
        errorElement.textContent = "Please enter a city name";
        return;
    }

    const loadingElement = document.getElementById("loading");
    const errorElement = document.getElementById("error");

    if (!loadingElement || !errorElement) {
        console.error("Required elements not found");
        return;
    }

    try {
        loadingElement.style.display = "block";
        errorElement.textContent = "";

        // First, geocode the city name using Open-Meteo's geocoding API
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
        const geocodeResponse = await fetch(geocodeUrl);
        if (!geocodeResponse.ok) {
            throw new Error("Failed to fetch geocoding data");
        }
        const geocodeData = await geocodeResponse.json();

        if (!geocodeData.results || geocodeData.results.length === 0) {
            throw new Error("City not found");
        }

        const { latitude, longitude } = geocodeData.results[0];

        // Updated API URL with current temperature and hourly data
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
            throw new Error("Failed to fetch weather data");
        }

        const weatherData = await weatherResponse.json();

        // Transform the data using current and hourly data for more accuracy
        const transformedData = weatherData.daily.time.map((date, index) => {
            const dayDate = new Date(date);
            const today = new Date().setHours(0, 0, 0, 0) === dayDate.setHours(0, 0, 0, 0);
            
            // For current day, use current temperature
            // For future days, use the daily max/min average
            const temperature = today 
                ? Math.round(weatherData.current.temperature_2m)
                : Math.round((weatherData.daily.temperature_2m_max[index] + weatherData.daily.temperature_2m_min[index]) / 2);

            return {
                date: dayDate.toLocaleDateString(),
                temperature: temperature,
                description: getWeatherDescription(today ? weatherData.current.weathercode : weatherData.daily.weathercode[index])
            };
        });

        // Store the transformed data globally
        window.weatherData = transformedData;

        // Display the forecast data
        displayForecast(transformedData);
    } catch (error) {
        console.error("Error fetching forecast:", error);
        errorElement.textContent = error.message;
    } finally {
        loadingElement.style.display = "none";
    }
}

// Helper function to convert weather codes to descriptions
function getWeatherDescription(code) {
    if (typeof code !== 'number') {
        console.error("Invalid weather code:", code);
        return 'unknown';
    }

    // This object maps numeric weather codes from the Open-Meteo API to human-readable weather descriptions
    // The codes are standardized WMO (World Meteorological Organization) weather codes
    // Gaps in the numbering (e.g., 4-44, 56-60) represent unused or reserved codes in the WMO system
    const weatherCodes = {
        0: 'clear sky',
        1: 'mainly clear', 
        2: 'partly cloudy',
        3: 'overcast',
        45: 'foggy',
        48: 'depositing rime fog',
        51: 'light drizzle',
        53: 'moderate drizzle', 
        55: 'dense drizzle',
        61: 'slight rain',
        63: 'moderate rain',
        65: 'heavy rain',
        71: 'slight snow fall',
        73: 'moderate snow fall',
        75: 'heavy snow fall',
        77: 'snow grains',
        80: 'slight rain showers',
        81: 'moderate rain showers',
        82: 'violent rain showers',
        85: 'slight snow showers',
        86: 'heavy snow showers',
        95: 'thunderstorm',
        96: 'thunderstorm with slight hail',
        99: 'thunderstorm with heavy hail',
    };
    
    return weatherCodes[code] || 'unknown';
}

function displayForecast(data) {
    const forecastContainer = document.getElementById("forecast");
    const errorElement = document.getElementById("error");
    const unitSelect = document.getElementById("unit");

    if (!forecastContainer || !errorElement || !unitSelect) {
        console.error("Required elements not found");
        return;
    }

    const unit = unitSelect.value;

    errorElement.textContent = "";
    forecastContainer.innerHTML = "";

    if (!Array.isArray(data)) {
        console.error("Invalid forecast data:", data);
        errorElement.textContent = "Error: Invalid forecast data";
        return;
    }

    try {
        const forecastGrid = document.createElement("div");
        forecastGrid.className = "forecast-grid";

        data.forEach((forecast) => {
            if (!forecast.date || typeof forecast.temperature === "undefined" || !forecast.description) {
                console.warn("Invalid forecast item:", forecast);
                return;
            }

            const forecastItem = document.createElement("div");
            forecastItem.className = "forecast-item";

            let temperature = forecast.temperature;
            if (unit === "imperial") {
                temperature = toFahrenheit(temperature);
            }

            const unitSymbol = unit === "metric" ? "°C" : "°F";

            forecastItem.innerHTML = `
                <p class="date">${forecast.date}</p>
                <p>${temperature}${unitSymbol}</p>
                <p>${forecast.description}</p>
            `;

            const videoMap = {
                'clear sky': document.getElementById('clearSkyVideo'),
                'mainly clear': document.getElementById('clearSkyVideo'),
                'partly cloudy': document.getElementById('scatteredCloudsVideo'),
                'overcast': document.getElementById('overcastVideo'),
                'slight rain': document.getElementById('rainVideo'),
                'moderate rain': document.getElementById('rainVideo'),
                'heavy rain': document.getElementById('rainVideo'),
                // Add other mappings as needed
            };

            forecastItem.setAttribute('data-description', forecast.description);
            handleVideoHover([forecastItem], videoMap);

            forecastGrid.appendChild(forecastItem);
        });

        forecastContainer.appendChild(forecastGrid);
    } catch (error) {
        console.error("Error displaying forecast:", error);
        errorElement.textContent = "Error displaying forecast data";
    }
}

// Unit conversion functions
function toCelsius(fahrenheit) {
    if (typeof fahrenheit !== 'number') {
        console.error("Invalid temperature value for conversion:", fahrenheit);
        return 0;
    }
    return Math.round(((fahrenheit - 32) * 5) / 9);
}

function toFahrenheit(celsius) {
    if (typeof celsius !== 'number') {
        console.error("Invalid temperature value for conversion:", celsius);
        return 32;
    }
    return Math.round((celsius * 9) / 5 + 32);
}

// Update the unit change event listener to use local conversion
const unitSelect = document.getElementById("unit");
if (unitSelect) {
    unitSelect.addEventListener("change", function () {
        const selectedUnit = this.value;
        localStorage.setItem("weatherUnit", selectedUnit);

        if (window.weatherData && window.weatherData.length > 0) {
            displayForecast(window.weatherData);
        }
    });
}

// Load saved settings on page load
document.addEventListener("DOMContentLoaded", function () {
    const unitSelect = document.getElementById("unit");
    const cityInput = document.getElementById("city");
    const searchButton = document.getElementById("search");

    if (!unitSelect || !cityInput || !searchButton) {
        console.error("Required elements not found on page load");
        return;
    }

    const savedUnit = localStorage.getItem("weatherUnit");
    if (savedUnit) {
        unitSelect.value = savedUnit;
    }

    // Add event listener for Enter key
    cityInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            fetchForecast(this.value);
        }
    });

    // Add click handler for search button
    searchButton.addEventListener("click", function() {
        fetchForecast(cityInput.value);
    });
});

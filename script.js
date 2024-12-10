let weatherData = []; // Store the weather data globally

function toggleSettings() {
    const settingsContainer = document.getElementById("settingsContainer");
    settingsContainer.classList.toggle("hidden");
}

// Check if save button exists before adding event listener
const saveButton = document.getElementById("save");
if (saveButton) {
    saveButton.addEventListener("click", function () {
        document.getElementById("settingsContainer").classList.add("hidden");
    });
}

async function fetchForecast(city) {
    if (!city || city.trim() === "") {
        document.getElementById("error").textContent = "Please enter a city name";
        return;
    }

    const apiKey = "3282e60cdbca38e9283cd4affe773a01";
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    const loadingElement = document.getElementById("loading");
    const errorElement = document.getElementById("error");

    try {
        loadingElement.style.display = "block";
        errorElement.textContent = "";

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(
                response.status === 404
                    ? "City not found"
                    : "Failed to fetch weather data"
            );
        }

        const data = await response.json();

        if (!data.list || !Array.isArray(data.list)) {
            throw new Error("Invalid data format received from API");
        }

        // Store the raw temperature data in Celsius
        weatherData = data.list.map((item) => ({
            date: new Date(item.dt * 1000).toLocaleDateString(),
            temperature: Math.round(item.main.temp),
            description: item.weather[0]?.description || "No description available",
        }));

        displayForecast(weatherData);
    } catch (error) {
        console.error("Error fetching forecast:", error);
        errorElement.textContent = error.message;
    } finally {
        loadingElement.style.display = "none";
    }
}

function displayForecast(data) {
    const forecastContainer = document.getElementById("forecast");
    const errorElement = document.getElementById("error");
    const unit = document.getElementById("unit").value;

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
            if (!forecast.date || typeof forecast.temperature === "undefined") {
                console.warn("Invalid forecast item:", forecast);
                return;
            }

            const forecastItem = document.createElement("div");
            forecastItem.className = "forecast-item";

            // Convert temperature if needed
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

            // Add video background effect for clear sky
            if (forecast.description.toLowerCase().includes("clear sky")) {
                const video = document.getElementById("clearSkyVideo");

                forecastItem.addEventListener("mouseenter", () => {
                    document.body.classList.add("clear-sky-active");
                    video.classList.add("video-visible");
                    video.play();
                });
            } else if (forecast.description.toLowerCase().includes("scattered clouds")) {
                forecastItem.addEventListener("mouseenter", () => {
                    const video = document.getElementById("scatteredCloudsVideo");
                    video.classList.add("video-visible");
                    video.play();
                });

                forecastItem.addEventListener("mouseleave", () => {
                    document.body.classList.remove("clear-sky-active");
                    video.classList.remove("video-visible");
                    video.pause();
                });
            }

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
    return Math.round(((fahrenheit - 32) * 5) / 9);
}

function toFahrenheit(celsius) {
    return Math.round((celsius * 9) / 5 + 32);
}

// Update the unit change event listener to use local conversion
document.getElementById("unit").addEventListener("change", function () {
    const selectedUnit = this.value;
    localStorage.setItem("weatherUnit", selectedUnit);

    if (weatherData.length > 0) {
        displayForecast(weatherData);
    }
});

// Load saved settings on page load
document.addEventListener("DOMContentLoaded", function () {
    const savedUnit = localStorage.getItem("weatherUnit");
    if (savedUnit) {
        document.getElementById("unit").value = savedUnit;
    }

    // Add event listener for Enter key
    document.getElementById("city").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            fetchForecast(this.value);
        }
    });
});

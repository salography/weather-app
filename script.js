function toggleSettings() {
    const settingsContainer = document.getElementById('settingsContainer');
    settingsContainer.classList.toggle('hidden');
}

document.getElementById('save').addEventListener('click', function() {
    document.getElementById('settingsContainer').classList.toggle('hidden');
});

// Fetches 5-day weather forecast data from OpenWeatherMap API for a given city
// Handles loading states, error handling, and data processing
function fetchForecast(city) {
    const apiKey = '3282e60cdbca38e9283cd4affe773a01';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    
    // Add loading indicator
    document.getElementById('loading').style.display = 'block';
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            console.log('Forecast data:', data);
            
            // Process forecast data
            const processedData = data.list.map(item => ({
                date: new Date(item.dt * 1000).toLocaleDateString(),
                temperature: Math.round(item.main.temp),
                description: item.weather[0].description
            }));
            
            displayForecast(processedData);
        })
        .catch(error => {
            console.error('Error fetching forecast:', error);
            document.getElementById('error').textContent = error.message;
        })
        .finally(() => {
            document.getElementById('loading').style.display = 'none';
        });
}

// Renders the processed forecast data to the DOM
// Includes error handling and data validation
function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';
    
    if (!Array.isArray(data)) {
        console.error('Invalid forecast data:', data);
        return;
    }
    
    try {
        data.forEach(forecast => {
            if (!forecast.date || !forecast.temperature) {
                console.warn('Invalid forecast item:', forecast);
                return;
            }
            forecastContainer.innerHTML += `
                <div class="forecast-item">
                    <p>${forecast.date}</p>
                    <p>${forecast.temperature}°C</p>
                    <p>${forecast.description}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error displaying forecast:', error);
        forecastContainer.innerHTML = '<p>Error displaying forecast data</p>';
    }
}
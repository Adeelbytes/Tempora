// API keys
const apiKey = '17a4bb57e66204e9bd888ddc55cc4d07'; // OpenWeather API Key

// Function to get user's geolocation and fetch weather data
async function fetchWeatherForUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
                );
                if (!response.ok) throw new Error('Location weather data not found');
                const data = await response.json();
                displayWeatherData(data);
                getForecastData(data.name); // Get forecast based on detected city name
            } catch (error) {
                alert('Unable to fetch weather data for your location.');
            }
        }, error => {
            alert('Geolocation is not enabled. Please enable it to see your local weather.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', fetchWeatherForUserLocation);


// Fetch current weather data
async function getWeatherData(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        displayWeatherData(data);
    } catch (error) {
        alert(error.message);
    }
}

// Display current weather data in the widget
function displayWeatherData(data) {
    document.getElementById('cityName').textContent = data.name;
    document.getElementById('weatherDescription').textContent = data.weather[0].description;

    // Temperature widget animation fix
    const temperatureElement = document.getElementById('temperature');
    temperatureElement.classList.remove('animate-fade-in'); // Remove existing class
    temperatureElement.textContent = `${data.main.temp} °C`; // Update temperature
    setTimeout(() => {
        temperatureElement.classList.add('animate-fade-in'); // Reapply fade-in class
    }, 10); // Short delay to reapply the class

    // Update other weather details
    document.getElementById('humidityValue').textContent = `${data.main.humidity} %`;
    const windSpeedElement = document.getElementById('windSpeed');
    windSpeedElement.classList.remove('animate-fade-in'); // Remove existing class
    windSpeedElement.textContent = `${data.wind.speed} m/s`;
    setTimeout(() => {
        windSpeedElement.classList.add('animate-fade-in'); // Reapply fade-in for wind speed
    }, 10);

    // Update weather icon
    const weatherIcon = document.getElementById('weatherIcon');
    weatherIcon.classList.remove('animate-fade-in'); // Remove existing class
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`; // Update icon
    setTimeout(() => {
        weatherIcon.classList.add('animate-fade-in'); // Reapply fade-in for icon
    }, 10);

    // Call the function to update the widget's background
    updateWeatherBackground(iconCode);
}

// Update the widget background based on the weather icon code
function updateWeatherBackground(iconCode) {
    const widget = document.getElementById('weatherWidget');
    let backgroundUrl;

    switch (iconCode) {
        case '01d': backgroundUrl = "url('images/sunny-day.jpg')"; break;
        case '01n': backgroundUrl = "url('images/clear-night.jpg')"; break;
        case '02d': case '03d': backgroundUrl = "url('images/cloudy-day.jpg')"; break;
        case '02n': case '03n': backgroundUrl = "url('images/cloudy-night.jpg')"; break;
        case '04d': case '04n': backgroundUrl = "url('images/overcast.jpg')"; break;
        case '09d': case '09n': backgroundUrl = "url('images/shower-rain.jpg')"; break;
        case '10d': backgroundUrl = "url('images/rainy-day.jpg')"; break;
        case '10n': backgroundUrl = "url('images/rainy-night.jpg')"; break;
        case '11d': case '11n': backgroundUrl = "url('images/thunderstorm.jpg')"; break;
        case '13d': case '13n': backgroundUrl = "url('images/snowy.jpg')"; break;
        case '50d': case '50n': backgroundUrl = "url('images/mist.jpg')"; break;
        default: backgroundUrl = "url('images/default.jpg')"; break;
    }

    widget.style.backgroundImage = backgroundUrl;
}

// Fetch 5-day forecast data and display charts
async function getForecastData(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        const forecast = processForecastData(data);
        displayCharts(forecast);
    } catch (error) {
        alert('Error fetching forecast data');
    }
}

// Process forecast data to extract relevant information
function processForecastData(data) {
    const dailyForecast = data.list.filter((_, index) => index % 8 === 0); // Every 8th entry is roughly one day
    const temperatures = dailyForecast.map(item => item.main.temp);
    const weatherConditions = dailyForecast.map(item => item.weather[0].main);
    const dates = dailyForecast.map(item => new Date(item.dt * 1000).toLocaleDateString());
    return { dates, temperatures, weatherConditions };
}

let barChart, doughnutChart, lineChart; // Store chart instances globally

// Display charts for the 5-day forecast
function displayCharts({ temperatures, weatherConditions }) {
    // Destroy previous charts if they exist
    if (barChart) barChart.destroy();
    if (doughnutChart) doughnutChart.destroy();
    if (lineChart) lineChart.destroy();

    // Calculate min and max temperatures with minimal padding
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const yAxisPadding = 2; // Reduced padding for tighter view

    // Bar Chart 
    barChart = new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ],
            }],
        },
        options: {
            scales: {
                y: {
                    min: Math.floor(minTemp) - yAxisPadding,
                    max: Math.ceil(maxTemp) + yAxisPadding,
                    ticks: {
                        stepSize: 1, // Show every degree
                        callback: function(value) {
                            return value + '°C';  // Add °C to y-axis labels
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Temperature: ${context.parsed.y}°C`;
                        }
                    }
                }
            },
            animation: { delay: 500 },
            // Add data labels on the bars
            plugins: [{
                afterDraw: function(chart) {
                    var ctx = chart.ctx;
                    chart.data.datasets.forEach(function(dataset, datasetIndex) {
                        var meta = chart.getDatasetMeta(datasetIndex);
                        meta.data.forEach(function(bar, index) {
                            var data = dataset.data[index];
                            ctx.fillStyle = 'black';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            ctx.fillText(data + '°C', bar.x, bar.y - 5);
                        });
                    });
                }
            }]
        },
    });

    // Doughnut Chart (unchanged)
    const weatherCounts = weatherConditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});
    doughnutChart = new Chart(document.getElementById('doughnutChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(weatherCounts),
            datasets: [{
                data: Object.values(weatherCounts),
                backgroundColor: ['#FFD700', '#87CEEB', '#FF6347', '#4682B4'],
            }],
        },
        options: { animation: { delay: 500 } },
    });

    // Line Chart
    lineChart = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.1, // Slight curve for better visualization
                pointRadius: 5, // Larger points
                pointHoverRadius: 7,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
            }],
        },
        options: {
            scales: {
                y: {
                    min: Math.floor(minTemp) - yAxisPadding,
                    max: Math.ceil(maxTemp) + yAxisPadding,
                    ticks: {
                        stepSize: 1, // Show every degree
                        callback: function(value) {
                            return value + '°C';  // Add °C to y-axis labels
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Temperature: ${context.parsed.y}°C`;
                        }
                    }
                }
            },
            animation: { easing: 'easeOutBounce', duration: 1000 },
            // Add data labels on the points
            plugins: [{
                afterDraw: function(chart) {
                    var ctx = chart.ctx;
                    chart.data.datasets.forEach(function(dataset, datasetIndex) {
                        var meta = chart.getDatasetMeta(datasetIndex);
                        meta.data.forEach(function(point, index) {
                            var data = dataset.data[index];
                            ctx.fillStyle = 'black';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            ctx.fillText(data + '°C', point.x, point.y - 10);
                        });
                    });
                }
            }]
        },
    });
}


// Event listener for Get Weather button
document.getElementById('getWeather').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value;
    if (city) {
        getWeatherData(city);
        getForecastData(city);
    }
    else{
        alert('Please enter a city name');
    }
});

// event listener for Enter key
document.getElementById('cityInput').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        document.getElementById('getWeather').click();
    }
});

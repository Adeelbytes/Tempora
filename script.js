const apiKey = '17a4bb57e66204e9bd888ddc55cc4d07'; // OpenWeather API Key
const geminiApiKey = 'AIzaSyDVHev8CvcbYBEyNHgVERDRRtq8Ia9LrJI'; // Replace with your Gemini API Key


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
    document.getElementById('temperature').textContent = `${data.main.temp} °C`;
    document.getElementById('humidityValue').textContent = `${data.main.humidity} %`;
    document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;

    const iconCode = data.weather[0].icon; // Example: '01d', '09n'
    document.getElementById('weatherIcon').src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // Call the function to update the widget's background
    updateWeatherBackground(iconCode);
}

// Update the widget background based on the weather icon code
function updateWeatherBackground(iconCode) {
    const widget = document.getElementById('weatherWidget');
    let backgroundUrl;

    switch (iconCode) {
        case '01d': // Clear sky (day)
            backgroundUrl = "url('images/sunny-day.jpg')";
            break;
        case '01n': // Clear sky (night)
            backgroundUrl = "url('images/clear-night.jpg')";
            break;
        case '02d': // Few clouds (day)
        case '03d': // Scattered clouds (day)
            backgroundUrl = "url('images/cloudy-day.jpg')";
            break;
        case '02n': // Few clouds (night)
        case '03n': // Scattered clouds (night)
            backgroundUrl = "url('images/cloudy-night.jpg')";
            break;
        case '04d': // Broken clouds (day)
        case '04n': // Broken clouds (night)
            backgroundUrl = "url('images/overcast.jpg')";
            break;
        case '09d': // Shower rain (day)
        case '09n': // Shower rain (night)
            backgroundUrl = "url('images/shower-rain.jpg')";
            break;
        case '10d': // Rain (day)
            backgroundUrl = "url('images/rainy-day.jpg')";
            break;
        case '10n': // Rain (night)
            backgroundUrl = "url('images/rainy-night.jpg')";
            break;
        case '11d': // Thunderstorm (day)
        case '11n': // Thunderstorm (night)
            backgroundUrl = "url('images/thunderstorm.jpg')";
            break;
        case '13d': // Snow (day)
        case '13n': // Snow (night)
            backgroundUrl = "url('images/snowy.jpg')";
            break;
        case '50d': // Mist (day)
        case '50n': // Mist (night)
            backgroundUrl = "url('images/mist.jpg')";
            break;
        default: // Fallback background
            backgroundUrl = "url('images/default.jpg')";
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

// Process forecast data
function processForecastData(data) {
    const dailyForecast = data.list.filter((_, index) => index % 8 === 0); // Every 8th entry is roughly one day
    const temperatures = dailyForecast.map(item => item.main.temp);
    const weatherConditions = dailyForecast.map(item => item.weather[0].main);
    const dates = dailyForecast.map(item => new Date(item.dt * 1000).toLocaleDateString());
    return { dates, temperatures, weatherConditions };
}

let barChart, doughnutChart, lineChart; // Store chart instances globally

function displayCharts({ temperatures, weatherConditions }) {
    // Destroy previous charts if they exist
    if (barChart) barChart.destroy();
    if (doughnutChart) doughnutChart.destroy();
    if (lineChart) lineChart.destroy();

    // Bar Chart
    barChart = new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            }],
        },
        options: { animation: { delay: 500 } },
    });

    // Doughnut Chart
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
                fill: false,
            }],
        },
        options: { animation: { easing: 'easeOutBounce', duration: 1000 } },
    });
}


// Event listener for Get Weather button
document.getElementById('getWeather').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value;
    if (city) {
        getWeatherData(city);
        getForecastData(city);
    }
});

// Variables for pagination and forecast data
let forecastData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;

// Fetch weather data from OpenWeather API
async function fetchForecastData(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        forecastData = data.list.map(entry => ({
            date: new Date(entry.dt_txt).toLocaleDateString(),
            temperature: entry.main.temp,
            condition: entry.weather[0].description,
        }));
        filteredData = [...forecastData];
        displayTableData();
    } catch (error) {
        alert(error.message);
    }
}

// Display the table data with pagination
function displayTableData() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

    currentData.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="py-3 px-6">${entry.date}</td>
            <td class="py-3 px-6">${entry.temperature.toFixed(1)}°C</td>
            <td class="py-3 px-6">${entry.condition}</td>
        `;
        tableBody.appendChild(row);
    });

    updatePaginationControls();
}

// Update pagination buttons
function updatePaginationControls() {
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('px-3', 'py-2', 'bg-gray-200', 'rounded');
        if (i === currentPage) button.classList.add('active-page');
        button.addEventListener('click', () => {
            currentPage = i;
            displayTableData();
        });
        paginationContainer.appendChild(button);
    }

    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Sort temperatures in ascending order
document.getElementById('sortAsc').addEventListener('click', () => {
    filteredData.sort((a, b) => a.temperature - b.temperature);
    displayTableData();
});

// Sort temperatures in descending order
document.getElementById('sortDesc').addEventListener('click', () => {
    filteredData.sort((a, b) => b.temperature - a.temperature);
    displayTableData();
});

// Filter out days without rain
document.getElementById('showRainyDays').addEventListener('click', () => {
    filteredData = forecastData.filter(entry => entry.condition.toLowerCase().includes('rain'));
    currentPage = 1;
    displayTableData();
});

// Show the day with the highest temperature
document.getElementById('showMaxTemp').addEventListener('click', () => {
    const maxTempDay = forecastData.reduce((max, entry) => entry.temperature > max.temperature ? entry : max);
    alert(`Max Temp: ${maxTempDay.temperature}°C on ${maxTempDay.date}`);
});




(async function () {
    const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');


    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Function to detect if the query is weather-related and extract the city name using AI
    async function detectWeatherQueryWithAI(query) {
        const weatherKeywords = ["weather", "forecast", "temperature"];
        const containsWeatherKeyword = weatherKeywords.some(keyword => query.toLowerCase().includes(keyword));

        if (!containsWeatherKeyword) return { isWeatherQuery: false, city: null };

        // Ask the AI to extract the city name from the query
        const prompt = `Extract the city name from the following query: "${query}". 
                        If no city is mentioned, reply with "None".`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const city = response.text().trim();

            return city !== "None" ? { isWeatherQuery: true, city } : { isWeatherQuery: true, city: null };
        } catch (error) {
            console.error("AI City Detection Error:", error);
            return { isWeatherQuery: true, city: null };
        }
    }

    // Function to fetch weather data from OpenWeather API
    async function fetchWeatherData(city) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
            );
            if (!response.ok) throw new Error('City not found');
            const data = await response.json();
            return `
                Weather in ${data.name}:
                - Temperature: ${data.main.temp}°C
                - Description: ${data.weather[0].description}
                - Humidity: ${data.main.humidity}%
                - Wind Speed: ${data.wind.speed} m/s
            `;
        } catch (error) {
            console.error("Weather API Error:", error);
            return "Sorry, I couldn't fetch the weather data 😔";
        }
    }

    // Function to generate a response using Gemini API for non-weather queries
    async function getBotResponse(query) {
        try {
            const result = await model.generateContent(query);
            const response = await result.response;
            return response.text(); // Return the generated text
        } catch (error) {
            console.error("Gemini API Error:", error);
            return "toba toba 👀";
        }
    }

    // Main handler for chat input
    async function handleChat(query) {
        displayChatMessage('👉', query); // Display user query

        const { isWeatherQuery, city } = await detectWeatherQueryWithAI(query);

        let botResponse;
        if (isWeatherQuery && city) {
            botResponse = await fetchWeatherData(city); // Fetch weather if city is detected
        } else if (isWeatherQuery) {
            botResponse = "Please specify a valid city name 🙄";
        } else {
            botResponse = await getBotResponse(query); // Use Gemini API for other queries
        }

        displayChatMessage('👽', botResponse); // Display the bot's response
    }

    // Event listener for chat input (Button Click)
    document.getElementById('sendChat').addEventListener('click', async () => {
        const chatInput = document.getElementById('chatInput');
        const query = chatInput.value.trim();

        if (query) {
            await handleChat(query); // Handle the query
            chatInput.value = ''; // Clear input field
        }
    });

    // Event listener for sending messages with the Enter key
    document.getElementById('chatInput').addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            document.getElementById('sendChat').click(); // Trigger button click
        }
    });

    // Function to display chat messages
    function displayChatMessage(sender, message) {
        const chatContainer = document.getElementById('chatContainer');
        const messageElem = document.createElement('div');

        messageElem.classList.add(
            'p-2', 'mb-2', 'rounded-lg',
            sender === '👽' ? 'bg-green-100' : 'bg-white'
        );

        messageElem.textContent = `${sender}: ${message}`;
        chatContainer.appendChild(messageElem);
        chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to latest message
    }
})();




// Event listeners for pagination
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayTableData();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage * rowsPerPage < filteredData.length) {
        currentPage++;
        displayTableData();
    }
});

// Fetch weather data when the user clicks 'Get Weather'
document.getElementById('getWeather').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        fetchForecastData(city);
    } else {
        alert('Please enter a city name.');
    }
});

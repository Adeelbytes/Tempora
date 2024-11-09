const apiKey = '17a4bb57e66204e9bd888ddc55cc4d07';
const geminiApiKey = 'AIzaSyDVHev8CvcbYBEyNHgVERDRRtq8Ia9LrJI'; // Replace with your Gemini API Key


// Function to get user's geolocation 
async function fetchForecastForUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
                );
                if (!response.ok) throw new Error('Location forecast data not found');
                const data = await response.json();
                forecastData = data.list.map(entry => ({
                    date: new Date(entry.dt_txt).toLocaleDateString(),
                    temperature: entry.main.temp,
                    condition: entry.weather[0].description,
                }));
                filteredData = [...forecastData]; // Clone the data for filtering and sorting
                displayTableData(); // Populate the table with forecast data
            } catch (error) {
                alert('Unable to fetch forecast data for your location.');
            }
        }, error => {
            alert('Geolocation is not enabled. Please enable it to see your local weather forecast.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', fetchForecastForUserLocation);



// Variables for pagination and forecast data
let forecastData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;

// Fetch 5-day forecast data for the table
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
        filteredData = [...forecastData]; // Clone the forecast data for filtering
        displayTableData();
    } catch (error) {
        alert(error.message);
    }
}

// Display table data with pagination
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

// Update pagination controls
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

// Sorting and filtering event listeners
document.getElementById('sortAsc').addEventListener('click', () => {
    filteredData.sort((a, b) => a.temperature - b.temperature);
    displayTableData();
});
document.getElementById('sortDesc').addEventListener('click', () => {
    filteredData.sort((a, b) => b.temperature - a.temperature);
    displayTableData();
});
document.getElementById('showRainyDays').addEventListener('click', () => {
    filteredData = forecastData.filter(entry => entry.condition.toLowerCase().includes('rain'));
    currentPage = 1;
    displayTableData();
});
// Reset All: Resets the table to display all original forecast data
document.getElementById('resetAll').addEventListener('click', () => {
    filteredData = [...forecastData]; // Reset filtered data
    currentPage = 1; // Reset pagination to first page
    displayTableData(); // Refresh table display
});

// Show Max Temp Day: Finds and highlights the max temperature day in the table
document.getElementById('showMaxTemp').addEventListener('click', () => {
    const maxTempDay = forecastData.reduce((max, entry) => entry.temperature > max.temperature ? entry : max);
    filteredData = [maxTempDay]; // Display only the max temperature day
    currentPage = 1; // Reset pagination
    displayTableData(); // Refresh table to show only the max temperature day
});


// Pagination controls for Previous and Next buttons
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

// Event listener to fetch weather data when the Get Weather button is clicked
document.getElementById('getWeather').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        fetchForecastData(city);
    } else {
        alert('Please enter a city name.');
    }
});

// Event listener for Enter key on the city input field
document.getElementById('cityInput').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        document.getElementById('getWeather').click();
    }
});

// Chatbot functionality with AI handling
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
            sender === '👽' ? 'bg-white' : 'bg-green-100'
        );

        messageElem.textContent = `${sender}: ${message}`;
        chatContainer.appendChild(messageElem);
        chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to latest message
    }
})();

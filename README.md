Project Overview
The Weather Dashboard is a web-based application that provides users with weather data, forecasts, and visualizations for any city. It utilizes the OpenWeather API to display real-time weather information and a 5-day forecast. The dashboard also features interactive charts, a chatbot for weather-related queries, and a table with sortable and paginated forecast data. The project is built using HTML, Tailwind CSS, and Chart.js.
Features
●Weather Search: Get current weather information by entering the city name.
●5-Day Forecast Table: View forecast data with pagination and sorting options.
●Charts Visualization: Display bar, doughnut, and line charts based on weather data.
●Interactive Chatbot: Ask weather-related questions or general queries.
●Responsive Design: Adapts across different screen sizes using Tailwind CSS.
Project Structure
bash
Copy code
/project-directory
│
├── dashboard.html      # Main dashboard interface
├── table.html          # Table view of the weather forecast
├── script.js           # JavaScript logic for API calls and interactivity
├── images/             # Folder containing weather-related images (e.g., sunny-day.jpg)
└── README.md           # Documentation file (this file)

Prerequisites
Before running the project, ensure you have:
●A modern web browser (Chrome, Firefox, etc.)
●Internet access for API requests.
●API Keys:
○OpenWeather API key (replace in script.js).
○Gemini API key (replace for chatbot functionality).
Setup and Usage
1. Clone or Download the Repository
bash
Copy code
git clone https://github.com/your-username/weather-dashboard.git
cd weather-dashboard

2. Update API Keys
Open script.js and replace the following placeholders with your API keys:
javascript
Copy code
const apiKey = 'your_openweather_api_key';
const geminiApiKey = 'your_gemini_api_key';
●
3. Run the Application Locally
1.Open dashboard.html or table.html in your preferred browser.
2.Use the search bar to enter a city name and click Search to get weather data.
3.Navigate between the dashboard and table views using the sidebar links.
4. Using the Forecast Table
●Sort temperatures in ascending/descending order.
●Filter forecast to show only rainy days.
●View the day with the highest temperature.
●Use pagination buttons to navigate through forecast data.
5. Using the Chatbot
●Interact with the chatbot by typing queries in the chat input and clicking Send.
●For weather-related questions, include city names in your query.
Technologies Used
●HTML: Structure of the web pages.
●Tailwind CSS: Styling and responsive design.
●Chart.js: Rendering dynamic charts.
●JavaScript: API calls and page interactivity.
Known Issues
●API limits may restrict the number of requests.
●Ensure the correct API keys are used to avoid authentication errors.
●Some features (like the chatbot) require Gemini API access.
License
This project is licensed under the MIT License. Feel free to modify and distribute it as needed.

Live URL:    https://tempora-ten.vercel.app/

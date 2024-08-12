const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const containerDiv = document.querySelector(".container");

const API_KEY = "237555f5e9860357c971e15574831518"; // Your OpenWeatherMap API key

// Function to set background based on weather
const setWeatherBackground = (weatherMain) => {
    let backgroundUrl;
    switch (weatherMain) {
        case 'Clear':
            backgroundUrl = 'url("clear-sky.jpg")'; // Link to a suitable image
            break;
        case 'Clouds':
            backgroundUrl = 'url("cloudy.jpg")'; // Link to a suitable image
            break;
        case 'Rain':
            backgroundUrl = 'url("rainy.jpg")'; // Link to a suitable image
            break;
        case 'Snow':
            backgroundUrl = 'url("snowy.jpg")'; // Link to a suitable image
            break;
        case 'Thunderstorm':
            backgroundUrl = 'url("thunderstorm.jpg")'; // Link to a suitable image
            break;
        default:
            backgroundUrl = 'url("default-weather.jpg")'; // Default background
            break;
    }
    containerDiv.style.backgroundImage = backgroundUrl;
    containerDiv.style.backgroundSize = 'cover';
}

// Function to create HTML for weather cards
const createWeatherCard = (cityName, weatherItem, index) => {
    const iconCode = weatherItem.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`; // Updated URL format

    if (index === 0) { // HTML for the main weather card
        setWeatherBackground(weatherItem.weather[0].main); // Set background based on weather
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="${iconUrl}" alt="weather-icon" onerror="this.onerror=null;this.src='https://via.placeholder.com/120?text=No+Image';">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else { // HTML for the five-day forecast cards
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="${iconUrl}" alt="weather-icon" onerror="this.onerror=null;this.src='https://via.placeholder.com/70?text=No+Image';">
                    <h6>Temp: ${(weatherItem.main.temp).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}

// Function to fetch weather details using coordinates
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            // Filter the forecasts to get only one forecast per day
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            // Clearing previous weather data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            // Creating weather cards and adding them to the DOM
            fiveDaysForecast.forEach((weatherItem, index) => {
                const html = createWeatherCard(cityName, weatherItem, index);
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", html);
                }
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
}

// Function to get coordinates by city name
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
}

// Function to get user's current location and fetch weather details
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // Get coordinates of user location
            // Get city name from coordinates using reverse geocoding API
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL)
                .then(response => response.json())
                .then(data => {
                    if (!data.length) return alert("No city found for your location");
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert("An error occurred while fetching the city name!");
                });
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        }
    );
}

// Event listeners for buttons and input
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());

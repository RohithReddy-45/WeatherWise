"use strict";

const searchBox = document.querySelector(".search");
const searchInput = document.querySelector(".search-box");
const btnLocation = document.querySelector(".btn-location");
const API_KEY = "d8f4bd9d64f85e4584b56daa80644a04";
const weatherDiv = document.querySelector(".weather-div");
const currentWeather = document.querySelector(".weather-details");
const forecastContainer = document.querySelector(".forecast-container");
const primaryHeading = document.querySelector(".primary-heading");
 
//display error message on UI
const displayError = (error) => {
  primaryHeading.textContent = error;
  errorClearUI();
};
const displayUI = () => {
  forecastContainer.style.display = "flex";
  currentWeather.style.display = "flex";
  primaryHeading.style.display = "none";
};

//clearing UI when there is an error
const errorClearUI = () => {
  (forecastContainer.style.display = "none"),
    (currentWeather.style.display = "none"),
    (primaryHeading.style.display = "block");
};

const cleanContainers = () => {
  weatherDiv.innerHTML = "";
  currentWeather.innerHTML = "";
};

const getWeather = async (lat, lon, cityName) => {
  const WeatherApi = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  try {
    const res = await fetch(WeatherApi);
    const data = await res.json();
    // current weather
    const currentCountry = data.city.country;
    const currentDate = data.list[0].dt_txt;
    const currentTemperature = data.list[0].main.temp;
    const currentWindSpeed = data.list[0].wind.speed;
    const currentHumidity = data.list[0].main.humidity;
    const currentWeatherDescription = data.list[0].weather[0].main;
    const currentWeatherIcon = data.list[0].weather[0].icon;
    const formatTemperature = Math.round(currentTemperature - 273.15);
    const formattedDate = new Date(currentDate).toLocaleString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    cleanContainers();

    const html = `
      <p class="weather-temperature">${formatTemperature}&deg;C</p>
      <figure>
        <img
          src="https://openweathermap.org/img/wn/${currentWeatherIcon}@2x.png"
          alt="weather-icon"
          class="weather-image"
        />
      </figure>
      <p class="weather-forecast">${currentWeatherDescription}</p>
      <div class="date">
        <ion-icon name="calendar"></ion-icon>
        <p>${formattedDate}</p>
      </div>
      <div class="location">
        <ion-icon name="location"></ion-icon>
        <p>${cityName}, ${currentCountry}</p>
      </div>
        <div class="wind-humidity">
          <div class="wind">
            <p>Wind</p>
            <div class="mid-line-1"></div>
            <p>${currentWindSpeed} m/h</p>
          </div>
          <div class="humidity">
            <p>Humidity</p>
            <div class="mid-line-2"></div>
            <p>${currentHumidity}%</p>
          </div>
        </div>
    `;
    currentWeather.insertAdjacentHTML("afterbegin", html);
    displayUI();

    //Five day forecast
    const fiveDayForecast = data.list.filter((forecast) =>
      forecast.dt_txt.includes("00:00:00")
    );
    fiveDayForecast.forEach((forecast) => {
      const { dt_txt } = forecast;
      const { icon } = forecast.weather[0];
      const formattedDay = new Date(dt_txt).toLocaleString("en-US", {
        weekday: "long",
      });
      const formattedDate = new Date(dt_txt).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
      });
      const html = `
        <div class="forecast-details">
          <figure>
            <img
              src="https://openweathermap.org/img/wn/${icon}@2x.png"
              alt="weather-icon"
              class="forecast-image"
            />
          </figure>
          <p>${formattedDate}</p>
          <p>${formattedDay}</p>
        </div>
      `;

      weatherDiv.insertAdjacentHTML("beforeend", html);
    });
  } catch {
    const errorMessage = "Something went wrong please try again!";
    displayError(errorMessage);
  }
};

const getCityCoordinates = async (e) => {
  e.preventDefault();
  const cityName = searchInput.value.trim();
  if (!cityName) return;

  const geoCodingApi = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;

  try {
    const res = await fetch(geoCodingApi);
    const data = await res.json();

    if (!data.length) {
      const errorMessage = "Please enter a valid city name!";
      displayError(errorMessage);
      searchInput.value = "";

      return errorClearUI();
    } else {
      const { lat, lon, name } = data[0];
      getWeather(lat, lon, name);
    }
  } catch {
    const errorMessage = "Something went wrong please try again!";
    displayError(errorMessage);
    searchInput.value = "";
    return errorClearUI();
  }
  searchInput.value = "";
  displayUI();
  cleanContainers();
};

const getUserCoordinates = async (e) => {
  try {
    e.preventDefault();

    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
      setTimeout(reject, 5000); // reject if getCurrentPosition takes longer than 5 seconds
    });

    const { latitude, longitude } = position.coords;
    const reverseGeocodingApi = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

    const res = await fetch(reverseGeocodingApi);
    const data = await res.json();
    const { name } = data[0];
    getWeather(latitude, longitude, name);
  } catch (error) {
    if (error.code === 1) {
      const errorMessage = "Please allow access to your location!";
      displayError(errorMessage);
    } else {
      const errorMessage = "An error occurred while fetching your location!";
      displayError(errorMessage);
    }
  }
};

searchBox.addEventListener("submit", getCityCoordinates);
btnLocation.addEventListener("click", getUserCoordinates);

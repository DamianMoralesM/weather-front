import React, { useEffect, useState } from "react";
import { createMuiTheme, Container, ThemeProvider } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import CssBaseline from "@material-ui/core/CssBaseline";

import Weather from "./Weather";

export default function App() {
  const [city, setCity] = useState("");
  const [error, setError] = useState(null);
  const [currentWeather, setCurrentWeather] = useState({});
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    getWeather(city)
      .then(weather => {
        setCurrentWeather(weather);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
      });
  }, [city, error]);

  useEffect(() => {
    getForecast(city)
      .then(data => {
        setForecast(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
      });
  }, [city, error]);

  const handleCityChange = city => {
    setCity(city);
  };

  const theme = createMuiTheme({
    typography: {
      fontFamily: [
        "Inter",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"'
      ].join(","),
      fontSize: 14,
      h5: {
        fontWeight: 600
      }
    }
  });

  if (
    (currentWeather && Object.keys(currentWeather).length) ||
    (forecast && Object.keys(forecast).length)
  ) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />       
        <Container maxWidth="sm">
          <Weather
            city={city}
            currentWeather={currentWeather}
            forecast={forecast}
            onCityChange={handleCityChange}
            error={error}
          />
        </Container>
      </ThemeProvider>
    );
  } else {
    return (
      <div>
        <CircularProgress color={error ? "secondary" : "primary"} />
        {error ? <p>{error}</p> : ""}
      </div>
    );
  }
}

function handleResponse(response) {
  if (response.ok) {
    return response.json();
  } else {
    throw new Error("Error: Location " + response.statusText);
  }
}

function getWeather(city) {
  return fetch(
    `https://weather-back-api.herokuapp.com/v1/current/${city}`
  )
    .then(res => handleResponse(res))
    .then(weather => {
      if (Object.entries(weather).length) {
        const mappedData = mapDataToWeatherInterface(weather);
        return mappedData;
      }
    });
}

function getForecast(city) {
  return fetch(
    `https://weather-back-api.herokuapp.com/v1/forecast/${city}`
  )
    .then(res => handleResponse(res))
    .then(result => {
      if (Object.entries(result).length) {
        const forecast = [];
        for (let i = 0; i < 5; i++) {
          forecast.push(mapDataToWeatherInterface(result.daily[i]));
        }
        return forecast;
      }
    });
}

function mapDataToWeatherInterface(data) {
  const mapped = {
    city: data.name,
    country: data.sys ? data.sys.country : '',
    date: data.dt * 1000,
    humidity: data.main ? data.main.humidity : '',
    icon_id: data.weather[0].id,
    temperature: data.main ? data.main.temp : '',
    description: data.weather[0].description,
    wind_speed: data.wind ? Math.round(data.wind.speed * 3.6) : '', // convert from m/s to km/h
    condition: data.cod
  };
  
  // Add extra properties for the five day forecast: dt_txt, icon, min, max
  if (data.dt) {    
    var utcSeconds = data.dt;
    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    mapped.dt = d.setUTCSeconds(utcSeconds);
  }

  if (data.weather[0].icon) {
    mapped.icon = data.weather[0].icon;
  }

  if (data.temp) {
    mapped.max = data.temp.max;
    mapped.min = data.temp.min;
  }

  // remove undefined fields
  Object.keys(mapped).forEach(
    key => mapped[key] === undefined && delete data[key]
  );

  return mapped;
}

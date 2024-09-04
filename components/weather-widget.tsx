"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudIcon, MapPinIcon, ThermometerIcon } from "lucide-react";

interface WeatherData {
  temperature: number;
  description: string;
  location: string;
  unit: string;
}

export default function WeatherWidget() {
  const [location, setLocation] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Functions for Fetching and Displaying Weather Data
  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedLocation = location.trim();
    if (trimmedLocation === "") {
      setError("Please enter a valid location.");
      setWeather(null);
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${trimmedLocation}`);
      if (!response.ok) {
        throw new Error("City not found");
      }
      const data = await response.json();
      const weatherData: WeatherData = {
        temperature: data.current.temp_c,
        description: data.current.condition.text,
        location: data.location.name,
        unit: "C",
      };
      setWeather(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("City not found. Please try again.");
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  //Helper Functions
  function getTemperatureMessage(temperature: number, unit: string): string {
    if (unit === "C") {
      if (temperature < 0) {
        return `It's freezing at ${temperature}°C! Bundle up!`;
      } else if (temperature < 10) {
        return `It's quite cold at ${temperature}°C. Wear warm clothes.`;
      } else if (temperature < 20) {
        return `The temperature is ${temperature}°C. Comfortable for a light jacket.`;
      } else if (temperature < 30) {
        return `It's a pleasant ${temperature}°C. Enjoy the nice weather!`;
      } else {
        return `It's hot at ${temperature}°C. Stay hydrated!`;
      }
    } else {
      return `${temperature}°${unit}`;
    }
  }

  function getWeatherMessage(description: string): string {
    switch (description.toLowerCase()) {
      case "sunny":
        return "It's a beautiful sunny day!";
      case "partly cloudy":
        return "Expect some clouds and sunshine.";
      case "cloudy":
        return "It's cloudy today.";
      case "overcast":
        return "The sky is overcast.";
      case "rain":
        return "Don't forget your umbrella! It's raining.";
      case "thunderstorm":
        return "Thunderstorms are expected today.";
      case "snow":
        return "Bundle up! It's snowing.";
      case "mist":
        return "It's misty outside.";
      case "fog":
        return "Be careful, there's fog outside.";
      default:
        return description;
    }
  }

  function getLocationMessage(location: string): string {
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 18 || currentHour < 6;

    return ` ${location} ${isNight ? "at Night" : "During the Day"}`;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-blue-600">
      <Card className="w-full max-w-md mx-auto bg-blue-100 shadow-lg rounded-lg p-6">
        <CardHeader className="mb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">Weather Widget</CardTitle>
          <CardDescription className="text-gray-600">
            Search for the current weather conditions in your city.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
            <Input
              type="text"
              placeholder="Enter a city name"
              value={location}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
              className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className={`bg-blue-500 text-white rounded-lg px-4 py-2 transition-all duration-300 ${
                isLoading ? "bg-blue-400 cursor-wait" : "hover:bg-blue-600"
              }`}
            >
              {isLoading ? "Loading..." : "Search"}
            </Button>
          </form>
          {error && <div className="text-red-500 font-semibold">{error}</div>}
          {weather && (
            <div className="grid gap-4">
              <div className="flex items-center gap-2 p-4 bg-blue-100 rounded-lg shadow-md">
                <ThermometerIcon className="w-6 h-6 text-blue-600" />
                <div className="text-gray-800">{getTemperatureMessage(weather.temperature, weather.unit)}</div>
              </div>
              <div className="flex items-center gap-2 p-4 bg-yellow-100 rounded-lg shadow-md">
                <CloudIcon className="w-6 h-6 text-yellow-600" />
                <div className="text-gray-800">{getWeatherMessage(weather.description)}</div>
              </div>
              <div className="flex items-center gap-2 p-4 bg-green-100 rounded-lg shadow-md">
                <MapPinIcon className="w-6 h-6 text-green-600" />
                <div className="text-gray-800">{getLocationMessage(weather.location)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
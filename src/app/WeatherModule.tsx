'use client';

import React, { useState, useEffect } from 'react';

interface City {
  name: string;
  coordinates: [number, number];
}

interface WeatherModuleProps {
  cities: City[];
  isDarkMode: boolean;
}

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  cloudiness: number;
  rainVolume: number; // 添加降雨量字段
}

interface ForecastData {
  date: string;
  temperature: number;
  condition: string;
  icon: string;
}

interface ForecastItem {
  dt: number;
  main: {
    temp: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  clouds: {
    all: number;
  };
  rain?: {
    '3h': number;
  };
}

const API_KEY = ''; // 请替换为您的 API 密钥

// 天气状况翻译函数
const translateWeatherCondition = (condition: string, cloudiness?: number, rainVolume?: number): string => {
  const translations: { [key: string]: string } = {
    'Clear': '晴朗',
    'Drizzle': '毛毛雨',
    'Thunderstorm': '雷雨',
    'Snow': '雪',
    'Mist': '薄雾',
    'Smoke': '烟雾',
    'Haze': '霾',
    'Dust': '尘土',
    'Fog': '雾',
    'Sand': '沙尘',
    'Ash': '火山灰',
    'Squall': '狂风',
    'Tornado': '龙卷风',
  };

  if (condition === 'Clouds' && cloudiness !== undefined) {
    if (cloudiness < 30) return '少云';
    if (cloudiness < 70) return '多云';
    return '阴天';
  }

  if (condition === 'Rain' && rainVolume !== undefined) {
    if (rainVolume < 0.5) return '小雨';
    if (rainVolume < 4) return '中雨';
    if (rainVolume < 8) return '大雨';
    return '暴雨';
  }

  return translations[condition] || condition;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`; // 返回 "月/日" 格式
};

const WeatherModule: React.FC<WeatherModuleProps> = ({ cities, isDarkMode }) => {
  const [weatherData, setWeatherData] = useState<{[key: string]: WeatherData}>({});
  const [forecastData, setForecastData] = useState<{[key: string]: ForecastData[]}>({});

  const fetchWeatherData = async () => {
    const newWeatherData: {[key: string]: WeatherData} = {};
    const newForecastData: {[key: string]: ForecastData[]} = {};
    for (const city of cities) {
      try {
        // 获取当前天气
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${city.coordinates[0]}&lon=${city.coordinates[1]}&units=metric&appid=${API_KEY}`
        );
        const currentData = await currentResponse.json();
        newWeatherData[city.name] = {
          temperature: Math.round(currentData.main.temp),
          condition: translateWeatherCondition(
            currentData.weather[0].main, 
            currentData.clouds.all, 
            currentData.rain ? currentData.rain['1h'] : 0
          ),
          icon: currentData.weather[0].icon,
          humidity: currentData.main.humidity,
          windSpeed: currentData.wind.speed,
          pressure: currentData.main.pressure,
          cloudiness: currentData.clouds.all,
          rainVolume: currentData.rain ? currentData.rain['1h'] : 0,
        };

        // 获取天气预报
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${city.coordinates[0]}&lon=${city.coordinates[1]}&units=metric&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();
        newForecastData[city.name] = forecastData.list
          .filter((_: ForecastItem, index: number) => index % 8 === 0) // 每天一个预报
          .slice(0, 5) // 只取5天
          .map((item: ForecastItem) => ({
            date: formatDate(new Date(item.dt * 1000).toISOString()),
            temperature: Math.round(item.main.temp),
            condition: translateWeatherCondition(
              item.weather[0].main, 
              item.clouds.all, 
              item.rain ? item.rain['3h'] / 3 : 0 // 3小时降雨量除以3得到每小时降雨量
            ),
            icon: item.weather[0].icon,
          }));
      } catch (error) {
        console.error(`Error fetching weather data for ${city.name}:`, error);
      }
    }
    setWeatherData(newWeatherData);
    setForecastData(newForecastData);
  };

  useEffect(() => {
    fetchWeatherData();
    const intervalId = setInterval(fetchWeatherData, 600000); // 每10分钟刷新一次
    return () => clearInterval(intervalId);
  }, [cities]);

  const getWeatherIconUrl = (iconCode: string) => {
    // 如果图标代码以 'n' 结尾，替换为对应的白天图标
    const dayIconCode = iconCode.endsWith('n') ? iconCode.replace('n', 'd') : iconCode;
    return `http://openweathermap.org/img/wn/${dayIconCode}@2x.png`;
  };

  const getWeatherIconStyle = (isDarkMode: boolean) => {
    return isDarkMode ? 'brightness-90 contrast-125' : '';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
      {cities.map((city) => (
        <div key={city.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h3 className="text-xl font-bold mb-4">{city.name}</h3>
          {weatherData[city.name] && (
            <div className="flex flex-col sm:flex-row items-center mb-4">
              <div className={`rounded-full w-20 h-20 flex items-center justify-center mb-2 sm:mb-0 sm:mr-4 ${isDarkMode ? 'bg-gray-600' : 'bg-blue-100'}`}>
                <img 
                  src={getWeatherIconUrl(weatherData[city.name].icon)}
                  alt={weatherData[city.name].condition}
                  className={`w-16 h-16 ${getWeatherIconStyle(isDarkMode)}`}
                />
              </div>
              <div className="text-center sm:text-left sm:flex-grow">
                <p className="text-3xl font-bold">{weatherData[city.name].temperature}°C</p>
                <p>{weatherData[city.name].condition}</p>
              </div>
              <div className="mt-2 sm:mt-0 text-center sm:text-right">
                <p className="whitespace-nowrap">湿度: {weatherData[city.name].humidity}%</p>
                <p className="whitespace-nowrap">风速: {weatherData[city.name].windSpeed.toFixed(1)} m/s</p>
                <p className="whitespace-nowrap">气压: {weatherData[city.name].pressure} hPa</p>
              </div>
            </div>
          )}
          <hr className={`my-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} />
          {forecastData[city.name] && (
            <div>
              <h4 className="text-lg font-semibold mb-2">未来5天预报</h4>
              <div className="flex flex-wrap justify-between">
                {forecastData[city.name].map((day, index) => (
                  <div key={index} className="text-center w-1/5 mb-2">
                    <p className="text-sm">{day.date}</p>
                    <div className={`rounded-full w-10 h-10 flex items-center justify-center mx-auto my-1 ${isDarkMode ? 'bg-gray-600' : 'bg-blue-100'}`}>
                      <img 
                        src={getWeatherIconUrl(day.icon)}
                        alt={day.condition}
                        className={`w-8 h-8 ${getWeatherIconStyle(isDarkMode)}`}
                      />
                    </div>
                    <p className="font-bold">{day.temperature}°C</p>
                    <p className="text-xs">{day.condition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WeatherModule;
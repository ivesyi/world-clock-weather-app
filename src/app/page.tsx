'use client';

import { useState } from 'react';
import Clock from './Clock';
import WeatherModule from './WeatherModule';
import TimeDifferenceCalculator from './TimeDifferenceCalculator';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const cities = [
    { name: "北京", timezone: "Asia/Shanghai", coordinates: [39.9, 116.4] },
    { name: "上海", timezone: "Asia/Shanghai", coordinates: [31.2, 121.5] },
    { name: "东京", timezone: "Asia/Tokyo", coordinates: [35.7, 139.7] },
    { name: "伦敦", timezone: "Europe/London", coordinates: [51.5, -0.1] },
    { name: "纽约", timezone: "America/New_York", coordinates: [40.7, -74.0] },
    { name: "悉尼", timezone: "Australia/Sydney", coordinates: [-33.9, 151.2] },
  ];

  return (
    <div className={`min-h-screen p-8 font-[family-name:var(--font-geist-sans)] ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">世界时钟与天气</h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-blue-100 text-blue-800'}`}
          aria-label={isDarkMode ? "切换到日间模式" : "切换到夜间模式"}
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl font-bold mb-4">世界时钟</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {cities.map((city) => (
              <Clock key={city.name} timezone={city.timezone} city={city.name} coordinates={city.coordinates} isDarkMode={isDarkMode} />
            ))}
          </div>
          <div className="mt-8">
            <TimeDifferenceCalculator cities={cities} isDarkMode={isDarkMode} />
          </div>
        </div>
        
        {/* 右侧：世界天气模块 */}
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl font-bold mb-4">世界天气</h2>
          <WeatherModule cities={cities} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';

interface City {
  name: string;
  timezone: string;
}

interface TimeDifferenceCalculatorProps {
  cities: City[];
  isDarkMode: boolean;
}

const TimeDifferenceCalculator: React.FC<TimeDifferenceCalculatorProps> = ({ cities, isDarkMode }) => {
  const [fromCity, setFromCity] = useState(cities[0].name);
  const [toCity, setToCity] = useState(cities[1].name);
  const [timeDifference, setTimeDifference] = useState('');

  const calculateTimeDifference = () => {
    const fromTimezone = cities.find(city => city.name === fromCity)?.timezone;
    const toTimezone = cities.find(city => city.name === toCity)?.timezone;

    if (fromTimezone && toTimezone) {
      const now = new Date();
      const fromTime = new Date(now.toLocaleString('en-US', { timeZone: fromTimezone }));
      const toTime = new Date(now.toLocaleString('en-US', { timeZone: toTimezone }));
      const diffInHours = (toTime.getTime() - fromTime.getTime()) / (1000 * 60 * 60);
      
      setTimeDifference(`${Math.abs(diffInHours)} 小时${diffInHours >= 0 ? '领先' : '落后'}`);
    }
  };

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-md`}>
      <h3 className="text-xl font-bold mb-4">时差计算器</h3>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <select
          value={fromCity}
          onChange={(e) => setFromCity(e.target.value)}
          className={`border rounded p-2 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
        >
          {cities.map(city => (
            <option key={city.name} value={city.name}>{city.name}</option>
          ))}
        </select>
        <select
          value={toCity}
          onChange={(e) => setToCity(e.target.value)}
          className={`border rounded p-2 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
        >
          {cities.map(city => (
            <option key={city.name} value={city.name}>{city.name}</option>
          ))}
        </select>
      </div>
      <button
        onClick={calculateTimeDifference}
        className={`px-4 py-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
      >
        计算时差
      </button>
      {timeDifference && (
        <p className="mt-4">
          {toCity} 比 {fromCity} {timeDifference}
        </p>
      )}
    </div>
  );
};

export default TimeDifferenceCalculator;
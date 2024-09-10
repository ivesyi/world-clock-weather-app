'use client';

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

interface ClockProps {
  timezone: string;
  city: string;
  coordinates: [number, number];
  isDarkMode: boolean;
}

function Clock({ timezone, city, coordinates, isDarkMode }: ClockProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [sunTimes, setSunTimes] = useState({ sunrise: '', sunset: '', dayLength: '' });

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const fetchSunTimes = async () => {
      const [lat, lng] = coordinates;
      const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`);
      const data = await response.json();
      
      const sunrise = new Date(data.results.sunrise);
      const sunset = new Date(data.results.sunset);
      const dayLength = new Date(sunset.getTime() - sunrise.getTime());

      setSunTimes({
        sunrise: sunrise.toLocaleTimeString("zh-CN", { timeZone: timezone, hour: '2-digit', minute: '2-digit' }),
        sunset: sunset.toLocaleTimeString("zh-CN", { timeZone: timezone, hour: '2-digit', minute: '2-digit' }),
        dayLength: `${dayLength.getUTCHours()}小时${dayLength.getUTCMinutes()}分钟`
      });
    };
    fetchSunTimes();

    return () => clearInterval(timer);
  }, [timezone, coordinates]);

  if (!time) {
    return null; // 或者返回一个加载指示器
  }

  // 获取特定时区的时间
  const localTime = new Date(time.toLocaleString("en-US", { timeZone: timezone }));

  const formattedTime = localTime.toLocaleTimeString("zh-CN");
  const formattedDate = localTime.toLocaleDateString("zh-CN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // 计算时针、分针和秒针的角度
  const seconds = localTime.getSeconds();
  const minutes = localTime.getMinutes();
  const hours = localTime.getHours() % 12;

  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hourDegrees = ((hours + minutes / 60) / 12) * 360;

  return (
    <div className={`flex flex-col items-center justify-center h-full p-4 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-xl font-bold mb-2">{city}</h2>
      <p className="text-3xl font-bold mb-2">{formattedTime}</p>
      <p className="text-sm mb-2">{formattedDate}</p>
      <p className="text-xs mb-1">日出: {sunTimes.sunrise} | 日落: {sunTimes.sunset}</p>
      <p className="text-xs mb-4">昼长: {sunTimes.dayLength}</p>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="4" />
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="100"
            y1="10"
            x2="100"
            y2="20"
            transform={`rotate(${i * 30} 100 100)`}
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="50"
          transform={`rotate(${hourDegrees} 100 100)`}
          stroke="currentColor"
          strokeWidth="4"
        />
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="30"
          transform={`rotate(${minuteDegrees} 100 100)`}
          stroke="currentColor"
          strokeWidth="3"
        />
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="20"
          transform={`rotate(${secondDegrees} 100 100)`}
          stroke={isDarkMode ? "#ff6b6b" : "red"}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

// 使用 dynamic 导入来禁用 SSR
export default dynamic(() => Promise.resolve(Clock), { ssr: false });
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface WeatherProps {
  latitude?: number;
  longitude?: number;
}

interface CurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  precipitation_probability: number;
  wind_speed_10m: number;
  weather_code: number;
}

interface DailyForecast {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  precipitation_probability_max: number[];
}

const getWeatherEmoji = (code: number) => {
  if (code === 0) return '☀️'; // Clear
  if ([1, 2, 3].includes(code)) return '⛅'; // Partly cloudy
  if ([45, 48].includes(code)) return '🌫️'; // Fog
  if ([51, 53, 55].includes(code)) return '🌧️'; // Drizzle
  if ([61, 63, 65].includes(code)) return '🌧️'; // Rain
  if ([71, 73, 75].includes(code)) return '❄️'; // Snow
  if ([95, 96, 99].includes(code)) return '⛈️'; // Thunderstorm
  return '⛅'; // Default fallback
};

const getWeatherDescription = (code: number) => {
  if (code === 0) return 'Clear skies';
  if ([1, 2, 3].includes(code)) return 'Partly cloudy';
  if ([45, 48].includes(code)) return 'Foggy';
  if ([51, 53, 55].includes(code)) return 'Light Drizzle';
  if ([61, 63, 65].includes(code)) return 'Rainy';
  if ([71, 73, 75].includes(code)) return 'Snowy';
  if ([95, 96, 99].includes(code)) return 'Stormy';
  return 'Cloudy';
};

export const Weather: React.FC<WeatherProps> = ({ latitude, longitude }) => {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRadar, setShowRadar] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!latitude || !longitude) {
        setError('Location coordinates unavailable.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Open-Meteo free API does not require an API key
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto`;
        
        const response = await axios.get(url);
        
        setCurrentWeather(response.data.current);
        setDailyForecast(response.data.daily);
      } catch (err) {
        console.error('Weather API Error:', err);
        setError('Failed to fetch live weather data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  const cardClass = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 lg:p-8 shadow-md hover:shadow-xl transition-all duration-300 print:shadow-none print:border-slate-300 flex flex-col justify-between";

  if (isLoading) {
    return (
      <motion.div className={cardClass}>
         <div className="flex items-center gap-4 mb-4 animate-pulse">
           <div className="w-12 h-12 rounded-[1rem] bg-slate-200 dark:bg-slate-700"></div>
           <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
         </div>
         <div className="flex-grow flex flex-col items-center justify-center space-y-3 py-6">
            <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Syncing Satellite Data</p>
         </div>
      </motion.div>
    );
  }

  if (error || !currentWeather || !dailyForecast) {
    return (
      <motion.div className={cardClass}>
         <div className="flex items-center gap-4 mb-4">
           <div className="w-12 h-12 rounded-[1rem] bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl shadow-inner">⛅</div>
           <h3 className="text-xl font-bold text-slate-800 dark:text-white">Forecast</h3>
         </div>
         <div className="flex-grow flex items-center justify-center text-center p-4">
           <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{error || "Weather data offline"}</p>
         </div>
      </motion.div>
    );
  }

  return (
    <motion.div className={cardClass}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[1rem] bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl shadow-inner shadow-amber-500/20">
              {getWeatherEmoji(currentWeather.weather_code)}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Live Forecast</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{getWeatherDescription(currentWeather.weather_code)}</p>
            </div>
          </div>
          <div className="text-right">
             <span className="text-3xl font-black text-slate-800 dark:text-white drop-shadow-sm">{Math.round(currentWeather.temperature_2m)}°</span>
          </div>
        </div>

        {/* Current Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl text-center border border-slate-100 dark:border-slate-800">
             <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Humidity</span>
             <span className="text-sm font-black text-blue-500 dark:text-blue-400">{currentWeather.relative_humidity_2m}%</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl text-center border border-slate-100 dark:border-slate-800">
             <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Wind</span>
             <span className="text-sm font-black text-teal-500 dark:text-teal-400">{currentWeather.wind_speed_10m} km/h</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl text-center border border-slate-100 dark:border-slate-800">
             <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Rain</span>
             <span className="text-sm font-black text-rose-500 dark:text-rose-400">{currentWeather.precipitation_probability}%</span>
          </div>
        </div>

        {/* 7-Day Forecast Mini-Timeline */}
        <div className="space-y-3 mb-6">
           <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-1">7-Day Outlook</h4>
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {dailyForecast.time.map((dateString, idx) => (
                <div key={idx} className="min-w-[60px] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-2 text-center flex-shrink-0">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">{format(new Date(dateString), 'EEE')}</span>
                  <span className="block text-lg mb-1">{getWeatherEmoji(dailyForecast.weather_code[idx])}</span>
                  <span className="block text-[10px] font-black text-slate-800 dark:text-slate-200">{Math.round(dailyForecast.temperature_2m_max[idx])}°</span>
                  <span className="block text-[9px] font-bold text-slate-400">{dailyForecast.precipitation_probability_max[idx]}%</span>
                </div>
              ))}
           </div>
        </div>
      </div>
      
      <button onClick={() => setShowRadar(!showRadar)} className="h-12 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full rounded-2xl flex items-center justify-center text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400 transition-colors">
        {showRadar ? 'Close Radar' : 'Open Radar Overlay'}
      </button>
    </motion.div>
  );
};

// components/Dashboard/AQICard.jsx - Main AQI display component

import { useState, useEffect } from 'react';
import { useForecast } from '../../lib/api';
import { getAQILevel, formatNumber, POLLUTANTS } from '../../utils/constants';

export default function AQICard({ location }) {
  const { forecast, isLoading, isError, refresh } = useForecast(location);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (forecast) {
      setLastUpdated(new Date());
    }
  }, [forecast]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-24 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-800">Unable to load data</h3>
            <p className="text-red-600">Please check your connection and try again.</p>
          </div>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentData = forecast?.forecasts?.[0];
  if (!currentData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">No air quality data available for this location.</p>
      </div>
    );
  }

  const aqi = Math.round(currentData.aqi_predicted || 0);
  const aqiLevel = getAQILevel(aqi);
  const locationName = forecast?.location || location;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{locationName}</h2>
            <p className="text-blue-100">Real-time Air Quality</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Last Updated</div>
            <div className="text-sm font-medium">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--'}
            </div>
          </div>
        </div>
      </div>

      {/* Main AQI Display */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-2">Air Quality Index</div>
            <div 
              className="text-6xl font-bold mb-2"
              style={{ color: aqiLevel.color }}
            >
              {aqi}
            </div>
            <div 
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${aqiLevel.bgColor} ${aqiLevel.textColor}`}
            >
              {aqiLevel.level}
            </div>
          </div>
          <div className="flex-1 text-right">
            <div 
              className="w-32 h-32 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: aqiLevel.color }}
            >
              AQI
            </div>
            <div className="text-sm text-gray-600">{aqiLevel.description}</div>
          </div>
        </div>

        {/* Pollutant Levels */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Pollutant Levels</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(POLLUTANTS).map(([key, pollutant]) => {
              const value = currentData[`${key}_predicted`];
              return (
                <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div 
                    className="text-2xl font-bold mb-1"
                    style={{ color: pollutant.color }}
                  >
                    {formatNumber(value, 1)}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {pollutant.symbol}
                  </div>
                  <div className="text-xs text-gray-500">
                    {pollutant.unit}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confidence Score */}
        {currentData.confidence_score && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Prediction Confidence</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${currentData.confidence_score * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {Math.round(currentData.confidence_score * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
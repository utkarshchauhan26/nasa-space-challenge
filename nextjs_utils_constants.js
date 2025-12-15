// utils/constants.js - Shared constants and configurations

export const CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  REQUEST_TIMEOUT: 10000, // 10 seconds
  CHART_COLORS: {
    aqi: '#0B3D91',
    no2: '#3B82F6',
    o3: '#F59E0B',
    hcho: '#10B981'
  }
};

export const AQI_LEVELS = {
  good: { 
    min: 0, 
    max: 50, 
    color: '#00E400', 
    level: 'Good', 
    description: 'Air quality is satisfactory',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200'
  },
  moderate: { 
    min: 51, 
    max: 100, 
    color: '#FFFF00', 
    level: 'Moderate', 
    description: 'Air quality is acceptable',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  },
  unhealthySensitive: { 
    min: 101, 
    max: 150, 
    color: '#FF7E00', 
    level: 'Unhealthy for Sensitive Groups', 
    description: 'Sensitive groups may experience health effects',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200'
  },
  unhealthy: { 
    min: 151, 
    max: 200, 
    color: '#FF0000', 
    level: 'Unhealthy', 
    description: 'Everyone may experience health effects',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200'
  },
  veryUnhealthy: { 
    min: 201, 
    max: 300, 
    color: '#8F3F97', 
    level: 'Very Unhealthy', 
    description: 'Health warnings of emergency conditions',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200'
  },
  hazardous: { 
    min: 301, 
    max: 500, 
    color: '#7E0023', 
    level: 'Hazardous', 
    description: 'Health alert: everyone may experience serious health effects',
    bgColor: 'bg-red-900',
    textColor: 'text-white',
    borderColor: 'border-red-900'
  }
};

export const LOCATIONS = {
  'Washington_DC': { 
    lat: 38.9072, 
    lon: -77.0369, 
    name: 'Washington, DC',
    timezone: 'America/New_York'
  },
  'Los_Angeles': { 
    lat: 34.0522, 
    lon: -118.2437, 
    name: 'Los Angeles, CA',
    timezone: 'America/Los_Angeles'
  },
  'New_York': { 
    lat: 40.7128, 
    lon: -74.0060, 
    name: 'New York, NY',
    timezone: 'America/New_York'
  },
  'Chicago': { 
    lat: 41.8781, 
    lon: -87.6298, 
    name: 'Chicago, IL',
    timezone: 'America/Chicago'
  },
  'Houston': { 
    lat: 29.7604, 
    lon: -95.3698, 
    name: 'Houston, TX',
    timezone: 'America/Chicago'
  }
};

export const POLLUTANTS = {
  no2: {
    name: 'Nitrogen Dioxide',
    symbol: 'NO₂',
    unit: 'ppb',
    color: '#3B82F6',
    healthEffects: 'Respiratory irritation, reduced lung function'
  },
  o3: {
    name: 'Ozone',
    symbol: 'O₃',
    unit: 'ppb',
    color: '#F59E0B',
    healthEffects: 'Chest pain, coughing, throat irritation'
  },
  hcho: {
    name: 'Formaldehyde',
    symbol: 'HCHO',
    unit: 'ppb',
    color: '#10B981',
    healthEffects: 'Eye, nose, throat irritation, potential carcinogen'
  }
};

// Helper function to get AQI level based on value
export const getAQILevel = (aqi) => {
  for (const [key, level] of Object.entries(AQI_LEVELS)) {
    if (aqi >= level.min && aqi <= level.max) {
      return level;
    }
  }
  return AQI_LEVELS.good;
};

// Helper function to format numbers
export const formatNumber = (num, decimals = 1) => {
  if (num === null || num === undefined) return '--';
  return parseFloat(num).toFixed(decimals);
};

// Helper function to format time
export const formatTime = (dateString, timezone = 'America/New_York') => {
  return new Date(dateString).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: timezone
  });
};

// Helper function to format date
export const formatDate = (dateString, timezone = 'America/New_York') => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: timezone
  });
};
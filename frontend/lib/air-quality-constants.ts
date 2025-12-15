// lib/air-quality-constants.ts - Constants and utility functions for air quality

export const CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  REQUEST_TIMEOUT: 10000, // 10 seconds
  CHART_COLORS: {
    aqi: 'hsl(var(--primary))', // NASA Blue
    no2: '#3B82F6',
    o3: '#F59E0B',
    hcho: '#10B981'
  }
}

export interface AQILevel {
  min: number
  max: number
  color: string
  level: string
  description: string
  bgColor: string
  textColor: string
  borderColor: string
  glowColor: string
}

export const AQI_LEVELS: Record<string, AQILevel> = {
  good: { 
    min: 0, 
    max: 50, 
    color: '#00E400', 
    level: 'Good', 
    description: 'Air quality is satisfactory',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    glowColor: 'shadow-green-500/20'
  },
  moderate: { 
    min: 51, 
    max: 100, 
    color: '#FFFF00', 
    level: 'Moderate', 
    description: 'Air quality is acceptable',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    glowColor: 'shadow-yellow-500/20'
  },
  unhealthySensitive: { 
    min: 101, 
    max: 150, 
    color: '#FF7E00', 
    level: 'Unhealthy for Sensitive Groups', 
    description: 'Sensitive groups may experience health effects',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    glowColor: 'shadow-orange-500/20'
  },
  unhealthy: { 
    min: 151, 
    max: 200, 
    color: '#FF0000', 
    level: 'Unhealthy', 
    description: 'Everyone may experience health effects',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    glowColor: 'shadow-red-500/20'
  },
  veryUnhealthy: { 
    min: 201, 
    max: 300, 
    color: '#8F3F97', 
    level: 'Very Unhealthy', 
    description: 'Health warnings of emergency conditions',
    bgColor: 'bg-purple-500/20',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-purple-500/20'
  },
  hazardous: { 
    min: 301, 
    max: 500, 
    color: '#7E0023', 
    level: 'Hazardous', 
    description: 'Health alert: everyone may experience serious health effects',
    bgColor: 'bg-red-900/40',
    textColor: 'text-red-300',
    borderColor: 'border-red-900/50',
    glowColor: 'shadow-red-900/30'
  }
}

export interface Location {
  lat: number
  lon: number
  name: string
  timezone: string
}

export const LOCATIONS: Record<string, Location> = {
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
}

export interface Pollutant {
  name: string
  symbol: string
  unit: string
  color: string
  healthEffects: string
}

export type PollutantType = 'no2' | 'o3' | 'hcho'

export interface HealthRecommendation {
  category: 'general' | 'outdoor' | 'health' | 'indoor'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  icon: string
  actionItems: string[]
}

export const POLLUTANTS: Record<string, Pollutant> = {
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
}

// Helper function to get AQI level based on value
export const getAQILevel = (aqi: number): AQILevel => {
  for (const [key, level] of Object.entries(AQI_LEVELS)) {
    if (aqi >= level.min && aqi <= level.max) {
      return level
    }
  }
  return AQI_LEVELS.good
}

// Helper function to format numbers
export const formatNumber = (num: number | null | undefined, decimals = 1): string => {
  if (num === null || num === undefined) return '--'
  return parseFloat(num.toString()).toFixed(decimals)
}

// Helper function to format time
export const formatTime = (dateString: string, timezone = 'America/New_York'): string => {
  return new Date(dateString).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: timezone
  })
}

// Helper function to format date
export const formatDate = (dateString: string, timezone = 'America/New_York'): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: timezone
  })
}

// Helper function to get location display name
export const getLocationName = (locationKey: string): string => {
  return LOCATIONS[locationKey]?.name || locationKey
}

// Type definitions
export interface ForecastData {
  datetime: string
  no2_predicted: number
  o3_predicted: number
  hcho_predicted: number
  aqi_predicted: number
  confidence_score: number
}

export interface HistoricalData {
  datetime: string
  no2_actual: number
  o3_actual: number
  hcho_actual: number
  aqi: number
}

export interface AlertData {
  level: string
  title: string
  message: string
  recommendations: string[]
}

export interface ValidationData {
  pandora_accuracy: number
  airnow_accuracy: number
  model_confidence: number
  last_validation: string
  validation_sources: string[]
}

export interface SystemStatus {
  total_locations: number
  collected_locations: number
  last_updates: Record<string, string>
  data_sources: string[]
  timestamp: string
}
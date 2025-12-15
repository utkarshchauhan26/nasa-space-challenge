// lib/air-quality-api.ts - Air Quality API service with SWR integration

import useSWR from 'swr'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const REQUEST_TIMEOUT = 10000 // 10 seconds

// Mock data for development when backend is not available
const getMockData = (endpoint: string) => {
  const mockForecastData = {
    timestamp: new Date().toISOString(),
    location: 'washington_dc',
    no2_predicted: 25.6,
    o3_predicted: 45.2,
    hcho_predicted: 8.3,
    confidence_score: 0.94,
    aqi_level: 'Good',
    forecast_data: Array.from({ length: 48 }, (_, i) => ({
      timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
      no2_predicted: 20 + Math.random() * 15,
      o3_predicted: 40 + Math.random() * 20,
      hcho_predicted: 5 + Math.random() * 10,
      aqi: Math.floor(50 + Math.random() * 30),
    }))
  }

  if (endpoint.includes('/forecast/')) {
    return Promise.resolve(mockForecastData)
  }
  if (endpoint.includes('/forecast')) {
    return Promise.resolve({ washington_dc: mockForecastData })
  }
  if (endpoint.includes('/alerts/')) {
    return Promise.resolve({
      alerts: [
        {
          id: '1',
          type: 'info',
          message: 'Air quality is good today in Washington DC',
          severity: 'low',
          timestamp: new Date().toISOString()
        }
      ]
    })
  }
  return Promise.resolve({})
}

// Generic fetch wrapper with timeout and error handling
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Use mock data in development if backend is not available
  if (process.env.NODE_ENV === 'development') {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: AbortSignal.timeout(2000), // Quick timeout for dev mode
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      })
      
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.warn('Backend not available, using mock data:', error)
    }
    
    // Return mock data if backend request fails
    return getMockData(endpoint)
  }

  // Production mode - full error handling
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

export const airQualityAPI = {
  // Get current forecast for a location
  getForecast: async (location: string) => {
    return apiRequest(`/forecast/${location}`)
  },

  // Get forecasts for all locations
  getAllForecasts: async () => {
    return apiRequest('/forecast')
  },

  // Get historical data
  getHistorical: async (location: string, days = 30) => {
    return apiRequest(`/historical/${location}?days=${days}`)
  },

  // Get batch forecasts
  getBatchForecast: async (locations: string[]) => {
    return apiRequest('/forecast/batch', {
      method: 'POST',
      body: JSON.stringify({ locations }),
    })
  },

  // Get available locations
  getLocations: async () => {
    return apiRequest('/locations')
  },

  // Get system status
  getSystemStatus: async () => {
    return apiRequest('/data/status')
  },

  // Get alerts for a location
  getAlerts: async (location: string) => {
    return apiRequest(`/alerts/${location}`)
  },

  // Get health recommendations
  getHealthRecommendations: async (location: string) => {
    return apiRequest(`/health-recommendations/${location}`)
  },

  // Get ground truth validation
  getValidation: async (location: string) => {
    return apiRequest(`/validation/${location}`)
  },

  // Health check
  healthCheck: async () => {
    return apiRequest('/health')
  },
}

// React hooks for data fetching with SWR

// Custom hook for forecast data
export const useForecast = (location: string | null) => {
  const { data, error, mutate } = useSWR(
    location ? `/forecast/${location}` : null,
    () => location ? airQualityAPI.getForecast(location) : null,
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  return {
    forecast: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  }
}

// Custom hook for historical data
export const useHistorical = (location: string | null, days = 30) => {
  const { data, error, mutate } = useSWR(
    location ? `/historical/${location}/${days}` : null,
    () => location ? airQualityAPI.getHistorical(location, days) : null,
    {
      refreshInterval: 15 * 60 * 1000, // 15 minutes
      revalidateOnFocus: false,
    }
  )

  return {
    historical: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  }
}

// Custom hook for alerts
export const useAlerts = (location: string | null) => {
  const { data, error, mutate } = useSWR(
    location ? `/alerts/${location}` : null,
    () => location ? airQualityAPI.getAlerts(location) : null,
    {
      refreshInterval: 2 * 60 * 1000, // 2 minutes
      revalidateOnFocus: true,
    }
  )

  return {
    alerts: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  }
}

// Custom hook for health recommendations
export const useHealthRecommendations = (location: string | null) => {
  const { data, error, mutate } = useSWR(
    location ? `/health-recommendations/${location}` : null,
    () => location ? airQualityAPI.getHealthRecommendations(location) : null,
    {
      refreshInterval: 10 * 60 * 1000, // 10 minutes
      revalidateOnFocus: false,
    }
  )

  return {
    recommendations: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  }
}

// Custom hook for system status
export const useSystemStatus = () => {
  const { data, error, mutate } = useSWR(
    '/system-status',
    airQualityAPI.getSystemStatus,
    {
      refreshInterval: 30 * 1000, // 30 seconds
      revalidateOnFocus: true,
    }
  )

  return {
    status: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  }
}

// Custom hook for validation metrics
export const useValidation = (location: string | null) => {
  const { data, error, mutate } = useSWR(
    location ? `/validation/${location}` : null,
    () => location ? airQualityAPI.getValidation(location) : null,
    {
      refreshInterval: 30 * 60 * 1000, // 30 minutes
      revalidateOnFocus: false,
    }
  )

  return {
    validation: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  }
}

// Custom hook for multiple locations comparison
export const useMultipleForecasts = (locations: string[]) => {
  const { data, error, mutate } = useSWR(
    locations?.length ? `/forecasts/batch` : null,
    () => locations?.length ? airQualityAPI.getBatchForecast(locations) : null,
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      revalidateOnFocus: false,
    }
  )

  return {
    forecasts: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  }
}
// lib/api.js - Complete API service layer for Next.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Generic fetch wrapper with timeout and error handling
const apiRequest = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

export const airQualityAPI = {
  // Get current forecast for a location
  getForecast: async (location) => {
    return apiRequest(`/forecast/${location}`);
  },

  // Get forecasts for all locations
  getAllForecasts: async () => {
    return apiRequest('/forecast');
  },

  // Get historical data
  getHistorical: async (location, days = 30) => {
    return apiRequest(`/historical/${location}?days=${days}`);
  },

  // Get batch forecasts
  getBatchForecast: async (locations) => {
    return apiRequest('/forecast/batch', {
      method: 'POST',
      body: JSON.stringify({ locations }),
    });
  },

  // Get available locations
  getLocations: async () => {
    return apiRequest('/locations');
  },

  // Collect data for a location
  collectData: async (location) => {
    return apiRequest(`/data/collect/${location}`);
  },

  // Get system status
  getSystemStatus: async () => {
    return apiRequest('/data/status');
  },

  // Get features for a location
  getFeatures: async (location) => {
    return apiRequest(`/data/features/${location}`);
  },

  // Get alerts for a location
  getAlerts: async (location) => {
    return apiRequest(`/alerts/${location}`);
  },

  // Get health recommendations
  getHealthRecommendations: async (location) => {
    return apiRequest(`/health-recommendations/${location}`);
  },

  // Get ground truth validation
  getValidation: async (location) => {
    return apiRequest(`/validation/${location}`);
  },

  // Health check
  healthCheck: async () => {
    return apiRequest('/health');
  },
};

// React hooks for data fetching with SWR
import useSWR from 'swr';

// Custom hook for forecast data
export const useForecast = (location) => {
  const { data, error, mutate } = useSWR(
    location ? `/forecast/${location}` : null,
    () => airQualityAPI.getForecast(location),
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    forecast: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
};

// Custom hook for historical data
export const useHistorical = (location, days = 30) => {
  const { data, error, mutate } = useSWR(
    location ? `/historical/${location}/${days}` : null,
    () => airQualityAPI.getHistorical(location, days),
    {
      refreshInterval: 15 * 60 * 1000, // 15 minutes
      revalidateOnFocus: false,
    }
  );

  return {
    historical: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
};

// Custom hook for alerts
export const useAlerts = (location) => {
  const { data, error, mutate } = useSWR(
    location ? `/alerts/${location}` : null,
    () => airQualityAPI.getAlerts(location),
    {
      refreshInterval: 2 * 60 * 1000, // 2 minutes
      revalidateOnFocus: true,
    }
  );

  return {
    alerts: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
};

// Custom hook for health recommendations
export const useHealthRecommendations = (location) => {
  const { data, error, mutate } = useSWR(
    location ? `/health-recommendations/${location}` : null,
    () => airQualityAPI.getHealthRecommendations(location),
    {
      refreshInterval: 10 * 60 * 1000, // 10 minutes
      revalidateOnFocus: false,
    }
  );

  return {
    recommendations: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
};

// Custom hook for system status
export const useSystemStatus = () => {
  const { data, error, mutate } = useSWR(
    '/system-status',
    airQualityAPI.getSystemStatus,
    {
      refreshInterval: 30 * 1000, // 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    status: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
};

// Custom hook for validation metrics
export const useValidation = (location) => {
  const { data, error, mutate } = useSWR(
    location ? `/validation/${location}` : null,
    () => airQualityAPI.getValidation(location),
    {
      refreshInterval: 30 * 60 * 1000, // 30 minutes
      revalidateOnFocus: false,
    }
  );

  return {
    validation: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
};

// Custom hook for multiple locations comparison
export const useMultipleForecasts = (locations) => {
  const { data, error, mutate } = useSWR(
    locations?.length ? `/forecasts/batch` : null,
    () => airQualityAPI.getBatchForecast(locations),
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      revalidateOnFocus: false,
    }
  );

  return {
    forecasts: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
};
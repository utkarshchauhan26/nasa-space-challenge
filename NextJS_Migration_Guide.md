# NASA Air Quality Dashboard - Next.js Migration Guide

## 🎯 Migration Strategy

### Phase 1: Setup Next.js Environment

```bash
# 1. Install required dependencies
npm install react react-dom next
npm install chart.js react-chartjs-2
npm install leaflet react-leaflet
npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome
npm install axios swr
npm install tailwindcss @tailwindcss/forms @tailwindcss/typography
npm install react-bootstrap bootstrap
```

### Phase 2: Core Components Structure

```
components/
├── Layout/
│   ├── Header.jsx
│   ├── Navigation.jsx
│   └── Footer.jsx
├── Dashboard/
│   ├── AQICard.jsx
│   ├── PollutantLevels.jsx
│   ├── LocationSelector.jsx
│   ├── ForecastChart.jsx
│   ├── InteractiveMap.jsx
│   ├── HealthRecommendations.jsx
│   ├── AlertsPanel.jsx
│   ├── CityComparison.jsx
│   ├── HistoricalChart.jsx
│   ├── SystemStatus.jsx
│   └── ValidationMetrics.jsx
├── UI/
│   ├── LoadingSpinner.jsx
│   ├── ErrorBoundary.jsx
│   └── Toast.jsx
└── Charts/
    ├── ForecastChart.jsx
    └── HistoricalChart.jsx
```

### Phase 3: API Integration

```javascript
// lib/api.js - API service layer
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const airQualityAPI = {
  getForecast: async (location) => {
    const response = await fetch(`${API_BASE_URL}/forecast/${location}`);
    return response.json();
  },
  getHistorical: async (location, days = 30) => {
    const response = await fetch(`${API_BASE_URL}/historical/${location}?days=${days}`);
    return response.json();
  },
  getAlerts: async (location) => {
    const response = await fetch(`${API_BASE_URL}/alerts/${location}`);
    return response.json();
  },
  getHealthRecommendations: async (location) => {
    const response = await fetch(`${API_BASE_URL}/health-recommendations/${location}`);
    return response.json();
  },
  getSystemStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/data/status`);
    return response.json();
  },
  getValidation: async (location) => {
    const response = await fetch(`${API_BASE_URL}/validation/${location}`);
    return response.json();
  }
};
```

### Phase 4: State Management

```javascript
// hooks/useAirQuality.js - Custom hook for air quality data
import { useState, useEffect } from 'react';
import { airQualityAPI } from '../lib/api';

export const useAirQuality = (location) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const forecastData = await airQualityAPI.getForecast(location);
        setData(forecastData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  return { data, loading, error };
};
```

## 🔧 Ready-to-Use Next.js Components

### 1. AQI Card Component

```jsx
// components/Dashboard/AQICard.jsx
import { useState, useEffect } from 'react';
import { airQualityAPI } from '../../lib/api';

const AQI_LEVELS = {
  good: { min: 0, max: 50, color: '#00E400', level: 'Good' },
  moderate: { min: 51, max: 100, color: '#FFFF00', level: 'Moderate' },
  unhealthySensitive: { min: 101, max: 150, color: '#FF7E00', level: 'Unhealthy for Sensitive Groups' },
  unhealthy: { min: 151, max: 200, color: '#FF0000', level: 'Unhealthy' },
  veryUnhealthy: { min: 201, max: 300, color: '#8F3F97', level: 'Very Unhealthy' },
  hazardous: { min: 301, max: 500, color: '#7E0023', level: 'Hazardous' }
};

const getAQILevel = (aqi) => {
  for (const [key, level] of Object.entries(AQI_LEVELS)) {
    if (aqi >= level.min && aqi <= level.max) {
      return level;
    }
  }
  return AQI_LEVELS.good;
};

export default function AQICard({ location }) {
  const [aqiData, setAQIData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAQI = async () => {
      try {
        const data = await airQualityAPI.getForecast(location);
        if (data.forecasts && data.forecasts.length > 0) {
          setAQIData(data.forecasts[0]);
        }
      } catch (error) {
        console.error('Error fetching AQI:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAQI();
  }, [location]);

  if (loading) return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;
  if (!aqiData) return <div>No data available</div>;

  const aqiLevel = getAQILevel(aqiData.aqi_predicted);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{location}</h2>
          <p className="text-gray-600">Current Air Quality</p>
        </div>
        <div className="text-right">
          <div 
            className="text-4xl font-bold mb-2"
            style={{ color: aqiLevel.color }}
          >
            {Math.round(aqiData.aqi_predicted)}
          </div>
          <div className="text-sm font-medium" style={{ color: aqiLevel.color }}>
            {aqiLevel.level}
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">
            {aqiData.no2_predicted?.toFixed(1) || '--'}
          </div>
          <div className="text-xs text-gray-500">NO₂</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-600">
            {aqiData.o3_predicted?.toFixed(1) || '--'}
          </div>
          <div className="text-xs text-gray-500">O₃</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">
            {aqiData.hcho_predicted?.toFixed(1) || '--'}
          </div>
          <div className="text-xs text-gray-500">HCHO</div>
        </div>
      </div>
    </div>
  );
}
```

### 2. Interactive Map Component

```jsx
// components/Dashboard/InteractiveMap.jsx
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet to avoid SSR issues
const DynamicMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
});

export default function InteractiveMap({ location, aqiData }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold mb-4">Air Quality Map</h3>
      <DynamicMap location={location} aqiData={aqiData} />
    </div>
  );
}
```

### 3. Forecast Chart Component

```jsx
// components/Dashboard/ForecastChart.jsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ForecastChart({ forecastData }) {
  if (!forecastData || forecastData.length === 0) {
    return <div>No forecast data available</div>;
  }

  const chartData = {
    labels: forecastData.map(item => 
      new Date(item.datetime).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit'
      })
    ),
    datasets: [
      {
        label: 'AQI Forecast',
        data: forecastData.map(item => item.aqi_predicted),
        borderColor: '#0B3D91',
        backgroundColor: 'rgba(11, 61, 145, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '48-Hour Air Quality Forecast',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'AQI Level'
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Line data={chartData} options={options} />
    </div>
  );
}
```

## 🔄 Migration Steps

### Step 1: Create New Next.js Project Structure
```bash
# In your existing Next.js project, create these folders:
mkdir -p components/Dashboard
mkdir -p components/Layout
mkdir -p hooks
mkdir -p lib
mkdir -p pages/api
mkdir -p utils
```

### Step 2: Install Dependencies
```bash
npm install chart.js react-chartjs-2 leaflet react-leaflet axios swr
```

### Step 3: Environment Variables
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 4: Main Dashboard Page
```jsx
// pages/dashboard.js or pages/dashboard/index.js
import { useState } from 'react';
import Layout from '../components/Layout/Layout';
import AQICard from '../components/Dashboard/AQICard';
import ForecastChart from '../components/Dashboard/ForecastChart';
import InteractiveMap from '../components/Dashboard/InteractiveMap';
import HealthRecommendations from '../components/Dashboard/HealthRecommendations';
import AlertsPanel from '../components/Dashboard/AlertsPanel';

const LOCATIONS = {
  'Washington_DC': 'Washington, DC',
  'Los_Angeles': 'Los Angeles, CA',
  'New_York': 'New York, NY',
  'Chicago': 'Chicago, IL',
  'Houston': 'Houston, TX'
};

export default function Dashboard() {
  const [selectedLocation, setSelectedLocation] = useState('Washington_DC');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Location Selector */}
        <div className="mb-8">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="form-select"
          >
            {Object.entries(LOCATIONS).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <AQICard location={selectedLocation} />
          </div>
          <div>
            <AlertsPanel location={selectedLocation} />
          </div>
          <div className="lg:col-span-2">
            <ForecastChart location={selectedLocation} />
          </div>
          <div>
            <HealthRecommendations location={selectedLocation} />
          </div>
          <div className="lg:col-span-2">
            <InteractiveMap location={selectedLocation} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

## 🎨 Styling Options

### Option A: Keep Bootstrap
```bash
npm install react-bootstrap bootstrap
```

### Option B: Use Tailwind CSS (Recommended)
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Option C: Styled Components
```bash
npm install styled-components
```

## ⚡ Quick Integration Steps

1. **Copy over your existing Next.js landing page**
2. **Create a `/dashboard` route**
3. **Use the components I've provided above**
4. **Gradually migrate features one by one**
5. **Test each component as you go**

## 🔗 API Integration

The backend API endpoints will remain the same:
- `GET /forecast/{location}` - Air quality forecasts
- `GET /historical/{location}` - Historical data
- `GET /alerts/{location}` - Real-time alerts
- `GET /health-recommendations/{location}` - Health advice
- `GET /data/status` - System status
- `GET /validation/{location}` - Model validation

## 📱 Mobile Responsiveness

All components are built with responsive design using:
- CSS Grid for layout
- Flexbox for alignment
- Mobile-first approach
- Touch-friendly interactions

## 🚀 Performance Optimizations

- Server-side rendering for initial load
- Dynamic imports for heavy components (maps, charts)
- SWR for data caching and revalidation
- Image optimization with Next.js Image component
- Code splitting by route

Would you like me to help you implement any specific component first, or would you prefer to start with the overall project structure?
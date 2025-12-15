"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Clock, BarChart3, Activity } from "lucide-react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { useForecast } from "@/lib/air-quality-api"
import { getAQILevel, formatTime, getLocationName, CONFIG, type ForecastData } from "@/lib/air-quality-constants"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ForecastChartProps {
  location: string
}

export function ForecastChart({ location }: ForecastChartProps) {
  const { forecast, isLoading, isError } = useForecast(location)
  const [activeTab, setActiveTab] = useState("aqi")
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    if (forecast?.forecast_data) {
      const forecasts = forecast.forecast_data.slice(0, 48) // 48-hour forecast
      
      const labels = forecasts.map((item: any) => {
        const date = new Date(item.timestamp || item.datetime)
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      })

      const datasets = {
        aqi: {
          label: 'AQI Forecast',
          data: forecasts.map((item: any) => Math.round(item.aqi || item.aqi_predicted || 0)),
          borderColor: CONFIG.CHART_COLORS.aqi,
          backgroundColor: `${CONFIG.CHART_COLORS.aqi}20`,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: CONFIG.CHART_COLORS.aqi,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        },
        no2: {
          label: 'NO₂ (ppb)',
          data: forecasts.map((item: any) => item.no2_predicted || item.no2 || 0),
          borderColor: CONFIG.CHART_COLORS.no2,
          backgroundColor: `${CONFIG.CHART_COLORS.no2}20`,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: CONFIG.CHART_COLORS.no2,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        },
        o3: {
          label: 'O₃ (ppb)',
          data: forecasts.map((item: any) => item.o3_predicted || item.o3 || 0),
          borderColor: CONFIG.CHART_COLORS.o3,
          backgroundColor: `${CONFIG.CHART_COLORS.o3}20`,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: CONFIG.CHART_COLORS.o3,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        },
        hcho: {
          label: 'HCHO (ppb)',
          data: forecasts.map((item: any) => item.hcho_predicted || item.hcho || 0),
          borderColor: CONFIG.CHART_COLORS.hcho,
          backgroundColor: `${CONFIG.CHART_COLORS.hcho}20`,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: CONFIG.CHART_COLORS.hcho,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        }
      }

      setChartData({
        labels,
        datasets: [datasets[activeTab as keyof typeof datasets]]
      })
    }
  }, [forecast, activeTab])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(11, 13, 23, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(10, 61, 145, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            return `Time: ${context[0].label}`
          },
          label: (context: any) => {
            if (activeTab === 'aqi') {
              const aqi = context.parsed.y
              const level = getAQILevel(aqi)
              return [`AQI: ${aqi}`, `Level: ${level.level}`]
            }
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(248, 250, 252, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(248, 250, 252, 0.7)',
          maxTicksLimit: 8,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(248, 250, 252, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(248, 250, 252, 0.7)',
        },
        title: {
          display: true,
          text: activeTab === 'aqi' ? 'AQI Level' : 'Concentration (ppb)',
          color: 'rgba(248, 250, 252, 0.8)',
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        hoverBackgroundColor: '#ffffff',
        hoverBorderWidth: 3,
      }
    }
  }

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-muted/50 rounded animate-pulse w-48" />
              <div className="h-4 bg-muted/30 rounded animate-pulse w-32" />
            </div>
            <div className="h-8 bg-muted/30 rounded animate-pulse w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] bg-muted/20 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  if (isError || !forecast?.forecast_data) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Unable to load forecast data
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="glass-card overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-serif flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                48-Hour Forecast
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {getLocationName(location)} • ML-powered predictions
              </p>
            </div>
            <Badge variant="outline" className="glass-panel">
              <Clock className="w-3 h-3 mr-1" />
              {forecast.forecast_data.length} points
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="glass-panel grid grid-cols-4 mb-6">
              <TabsTrigger value="aqi" className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                AQI
              </TabsTrigger>
              <TabsTrigger value="no2" className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                NO₂
              </TabsTrigger>
              <TabsTrigger value="o3" className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                O₃
              </TabsTrigger>
              <TabsTrigger value="hcho" className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                HCHO
              </TabsTrigger>
            </TabsList>

            {chartData && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="h-[320px] relative"
              >
                <Line data={chartData} options={chartOptions} />
              </motion.div>
            )}
          </Tabs>

          {/* Forecast Summary */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {forecast.forecast_data.slice(0, 4).map((item: any, index: number) => {
                const aqi = Math.round(item.aqi || item.aqi_predicted || 0)
                const level = getAQILevel(aqi)
                const time = formatTime(item.timestamp || item.datetime)
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="glass-card p-3 text-center group hover:scale-105 transition-all duration-300"
                  >
                    <div className="text-xs text-muted-foreground mb-1">{time}</div>
                    <div 
                      className="text-lg font-bold mb-1"
                      style={{ color: level.color }}
                    >
                      {aqi}
                    </div>
                    <div className="text-xs text-foreground/70">{level.level}</div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, MapPin, Clock, TrendingUp } from "lucide-react"
import { useForecast } from "@/lib/air-quality-api"
import { getAQILevel, formatNumber, POLLUTANTS, getLocationName, type ForecastData } from "@/lib/air-quality-constants"

interface AQICardProps {
  location: string
}

const PollutantMeter = ({ 
  pollutant, 
  value, 
  delay 
}: { 
  pollutant: { symbol: string; name: string; color: string }
  value: number | null | undefined
  delay: number 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-4 text-center group hover:scale-105 transition-all duration-300 border-2 bg-opacity-80"
    style={{ 
      borderColor: `${pollutant.color}40`,
      backgroundColor: `${pollutant.color}10`
    }}
  >
    <div className="relative">
      <div 
        className="text-2xl font-bold mb-2 transition-all duration-300 group-hover:scale-110 drop-shadow-lg"
        style={{ 
          color: pollutant.color,
          textShadow: `0 0 10px ${pollutant.color}50`
        }}
      >
        {formatNumber(value, 1)}
      </div>
      <div 
        className="text-sm font-bold mb-1 tracking-wider"
        style={{ color: pollutant.color }}
      >
        {pollutant.symbol}
      </div>
      <div className="text-xs text-muted-foreground font-medium">
        {pollutant.name}
      </div>
      <div 
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 border-2"
        style={{ 
          backgroundColor: pollutant.color,
          borderColor: pollutant.color
        }}
      />
    </div>
  </motion.div>
)

export function AQICard({ location }: AQICardProps) {
  const { forecast, isLoading, isError, refresh } = useForecast(location)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (forecast) {
      setLastUpdated(new Date())
    }
  }, [forecast])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  if (isLoading) {
    return (
      <Card className="glass-card overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/20 to-accent/20">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-muted/50 rounded animate-pulse" />
              <div className="h-4 bg-muted/30 rounded animate-pulse w-32" />
            </div>
            <div className="h-12 w-12 bg-muted/50 rounded-full animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="h-16 w-20 bg-muted/50 rounded animate-pulse" />
              <div className="h-6 w-24 bg-muted/30 rounded animate-pulse" />
            </div>
            <div className="h-24 w-24 bg-muted/50 rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/30 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="glass-card border-destructive/50 overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="text-destructive text-lg font-semibold">
              Unable to load air quality data
            </div>
            <p className="text-muted-foreground">
              Please check your connection and try again
            </p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Check if we have forecast data - either from the main object or forecast_data array
  if (!forecast) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No air quality data available for this location
          </p>
        </CardContent>
      </Card>
    )
  }

  // Use current data from main forecast object or first forecast data point
  const currentData = forecast.forecast_data?.[0] || forecast
  const aqi = Math.round(currentData.aqi_predicted || currentData.aqi || 0)
  const aqiLevel = getAQILevel(aqi)
  const locationName = getLocationName(location)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="glass-card overflow-hidden border-0 shadow-xl">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-serif text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {locationName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">Real-time Air Quality</p>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Last Updated
              </div>
              <div className="text-sm font-medium">
                {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--'}
              </div>
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={isRefreshing}
                className="h-8 w-8 p-0 hover:bg-primary/20"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Main AQI Display */}
          <div className="flex items-center justify-between mb-8">
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Air Quality Index
              </div>
              <motion.div 
                className="text-7xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
                style={{ color: aqiLevel.color }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {aqi}
              </motion.div>
              <Badge 
                className={`${aqiLevel.bgColor} ${aqiLevel.textColor} ${aqiLevel.borderColor} border text-sm py-1 px-3 font-medium`}
                style={{ 
                  boxShadow: `0 0 20px ${aqiLevel.color}20`,
                }}
              >
                {aqiLevel.level}
              </Badge>
            </motion.div>
            
            <motion.div 
              className="flex-1 text-right"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div 
                className="w-32 h-32 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold shadow-2xl relative overflow-hidden border-2"
                style={{ 
                  backgroundColor: aqiLevel.color,
                  borderColor: aqiLevel.color,
                  boxShadow: `0 0 40px ${aqiLevel.color}40, inset 0 0 20px rgba(255,255,255,0.1)`,
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-center relative z-10">
                  <div className="text-2xl font-black">{aqi}</div>
                  <div className="text-xs opacity-80">AQI</div>
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              <div className="text-sm text-muted-foreground px-4">
                {aqiLevel.description}
              </div>
            </motion.div>
          </div>

          {/* Pollutant Levels */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Pollutant Levels
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(POLLUTANTS).map(([key, pollutant], index) => {
                const value = currentData[`${key}_predicted`] || currentData[key] || 0
                return (
                  <PollutantMeter
                    key={key}
                    pollutant={pollutant}
                    value={value}
                    delay={0.4 + index * 0.1}
                  />
                )
              })}
            </div>
          </div>

          {/* Confidence Score */}
          {(currentData.confidence_score || forecast.confidence_score) && (
            <motion.div 
              className="mt-6 pt-6 border-t border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">
                  Prediction Confidence
                </span>
                <span className="text-sm font-bold text-primary">
                  {Math.round((currentData.confidence_score || forecast.confidence_score || 0) * 100)}%
                </span>
              </div>
              <Progress 
                value={(currentData.confidence_score || forecast.confidence_score || 0) * 100} 
                className="h-2 bg-muted/30"
              />
              <div className="text-xs text-muted-foreground mt-2">
                Based on NASA TEMPO satellite data and ML models
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AQICard } from "@/components/aqi-card"
import { ForecastChart } from "@/components/forecast-chart"
import { AlertsPanel } from "@/components/alerts-panel"
import { AirQualityMap } from "@/components/air-quality-map"
import { HealthRecommendations } from "@/components/health-recommendations"
import { SystemStatus } from "@/components/system-status"
import { Button } from "@/components/ui/button"
import { LOCATIONS, getLocationName } from "@/lib/air-quality-constants"
import { MapPin, Activity, Bell, Heart, Settings, Sparkles } from "lucide-react"

export default function DashboardPage() {
  const [selectedLocation, setSelectedLocation] = useState("new_delhi")
  const [showSystemStatus, setShowSystemStatus] = useState(false)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Air Quality Mission Control
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Real-time NASA satellite data, AI-powered predictions, and personalized health recommendations
              </p>
              
              {/* Location Selector */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <MapPin className="w-5 h-5 text-primary" />
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-64 glass-card">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LOCATIONS).map(([key, location]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {location.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setShowSystemStatus(!showSystemStatus)}
                  variant="ghost"
                  size="sm"
                  className="glass-card"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  System Status
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Dashboard */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
          {/* Primary Metrics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AQICard location={selectedLocation} />
            </div>
            <div>
              <AlertsPanel location={selectedLocation} />
            </div>
          </div>

          {/* Forecast and Map Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ForecastChart location={selectedLocation} />
            <AirQualityMap 
              selectedLocation={selectedLocation} 
              onLocationChange={setSelectedLocation}
            />
          </div>

          {/* Health and Status Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <HealthRecommendations 
              location={selectedLocation}
              userProfile={{
                age: 30,
                hasRespiratoryConditions: false,
                isPregnant: false,
                isAthlete: true
              }}
            />
            {showSystemStatus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <SystemStatus />
              </motion.div>
            )}
          </div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center py-8"
          >
            <div className="glass-card p-6 max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-3">About This Dashboard</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                This dashboard integrates real-time air quality data from NASA's TEMPO satellite mission with advanced machine learning models 
                to provide accurate predictions and personalized health recommendations. Our AI models achieve up to 99.98% accuracy for ozone predictions, 
                97.64% for nitrogen dioxide, and 97.79% for formaldehyde forecasting.
              </p>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
                <span>• NASA TEMPO Satellite Data</span>
                <span>• XGBoost & Random Forest ML Models</span>
                <span>• Real-time Updates Every 5 Minutes</span>
                <span>• 48-Hour Forecasting</span>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
      <SiteFooter />
    </>
  )
}
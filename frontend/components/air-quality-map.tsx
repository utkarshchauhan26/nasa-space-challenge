"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Layers, Maximize2, Minimize2, RotateCcw, Satellite } from "lucide-react"
import { 
  LOCATIONS, 
  POLLUTANTS, 
  getLocationName, 
  getAQILevel, 
  formatNumber,
  type Location,
  type PollutantType 
} from "@/lib/air-quality-constants"
import { useForecast } from "@/lib/air-quality-api"

interface MapProps {
  selectedLocation: string
  onLocationChange: (location: string) => void
}

// Washington DC area locations for demonstration
const washingtonDCMapData = [
  { lat: 38.9072, lng: -77.0369, location: 'washington_dc', aqi: 95, dominant: 'NO2', name: 'Washington DC' },
  { lat: 39.2904, lng: -76.6122, location: 'baltimore', aqi: 112, dominant: 'O3', name: 'Baltimore, MD' },
  { lat: 38.8048, lng: -77.0469, location: 'alexandria', aqi: 89, dominant: 'PM2.5', name: 'Alexandria, VA' },
  { lat: 38.9517, lng: -77.4481, location: 'reston', aqi: 78, dominant: 'NO2', name: 'Reston, VA' },
  { lat: 39.0458, lng: -76.6413, location: 'annapolis', aqi: 82, dominant: 'O3', name: 'Annapolis, MD' },
  { lat: 38.7373, lng: -77.1803, location: 'springfield', aqi: 91, dominant: 'PM10', name: 'Springfield, VA' }
]

export function AirQualityMap({ selectedLocation, onLocationChange }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapLayer, setMapLayer] = useState<'satellite' | 'terrain'>('satellite')
  const [selectedPollutant, setSelectedPollutant] = useState<PollutantType>('no2')
  const [mapLoaded, setMapLoaded] = useState(false)
  const [leafletMap, setLeafletMap] = useState<any>(null)
  
  const { forecast } = useForecast(selectedLocation)

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const loadMap = async () => {
      if (typeof window !== 'undefined' && mapRef.current && !mapLoaded) {
        try {
          const L = (await import('leaflet')).default
          
          // Fix default marker icons
          delete (L.Icon.Default.prototype as any)._getIconUrl
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          })

          const map = L.map(mapRef.current, {
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true
          }).setView([38.9072, -77.0369], 10)

          // Base tile layers
          const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri &mdash; Source: Esri, USGS, NOAA',
            maxZoom: 18
          })

          const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenTopoMap contributors',
            maxZoom: 17
          })

          // Add initial layer
          if (mapLayer === 'satellite') {
            satelliteLayer.addTo(map)
          } else {
            terrainLayer.addTo(map)
          }

          // Add markers for each Washington DC area location
          washingtonDCMapData.forEach((data) => {
            const aqiLevel = getAQILevel(data.aqi)
            const color = aqiLevel.color
            
            // Create custom icon with AQI color
            const customIcon = L.divIcon({
              className: 'custom-marker',
              html: `
                <div class="relative">
                  <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white"
                       style="background-color: ${color}; box-shadow: 0 0 20px ${color}40">
                    ${data.aqi}
                  </div>
                  <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                </div>
              `,
              iconSize: [32, 40],
              iconAnchor: [16, 40],
              popupAnchor: [0, -40]
            })

            const marker = L.marker([data.lat, data.lng], { icon: customIcon })
              .bindPopup(`
                <div class="p-3 space-y-2 min-w-[200px]">
                  <h3 class="font-semibold text-lg">${data.name}</h3>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full" style="background-color: ${color}"></div>
                    <span class="text-sm">AQI: ${data.aqi} (${aqiLevel.level})</span>
                  </div>
                  <p class="text-sm text-gray-600">Dominant: ${data.dominant}</p>
                  <button 
                    onclick="window.selectLocation('${data.location}')"
                    class="w-full mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Select Location
                  </button>
                </div>
              `)
              .addTo(map)

            // Highlight selected location
            if (data.location === selectedLocation) {
              marker.openPopup()
            }
          })

          // Global function for popup buttons
          ;(window as any).selectLocation = (location: string) => {
            onLocationChange(location)
          }

          setLeafletMap(map)
          setMapLoaded(true)

          // Layer switching
          map.on('baselayerchange', (e: any) => {
            setMapLayer(e.name === 'Satellite' ? 'satellite' : 'terrain')
          })

        } catch (error) {
          console.error('Error loading map:', error)
        }
      }
    }

    loadMap()
  }, [mapLoaded, selectedLocation, onLocationChange])

  // Update map layer when changed
  useEffect(() => {
    if (leafletMap && mapLoaded) {
      const L = require('leaflet')
      leafletMap.eachLayer((layer: any) => {
        if (layer._url) {
          leafletMap.removeLayer(layer)
        }
      })

      const newLayer = mapLayer === 'satellite' 
        ? L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri &mdash; Source: Esri, USGS, NOAA'
          })
        : L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenTopoMap contributors'
          })

      newLayer.addTo(leafletMap)
    }
  }, [mapLayer, leafletMap, mapLoaded])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setTimeout(() => {
      if (leafletMap) {
        leafletMap.invalidateSize()
      }
    }, 100)
  }

  const resetView = () => {
    if (leafletMap) {
      leafletMap.setView([20.5937, 78.9629], 5)
    }
  }

  const currentLocationData = washingtonDCMapData.find(d => d.location === selectedLocation)
  const aqiLevel = currentLocationData ? getAQILevel(currentLocationData.aqi) : null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className={isFullscreen ? 'fixed inset-0 z-50 bg-background/95 backdrop-blur-sm' : ''}
    >
      <Card className={`glass-card overflow-hidden ${isFullscreen ? 'h-full m-4' : ''}`}>
        <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-serif flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Interactive Air Quality Map
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time monitoring across multiple locations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={mapLayer} onValueChange={(value: 'satellite' | 'terrain') => setMapLayer(value)}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="satellite">
                    <div className="flex items-center gap-2">
                      <Satellite className="w-4 h-4" />
                      Satellite
                    </div>
                  </SelectItem>
                  <SelectItem value="terrain">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Terrain
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={resetView}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Reset view"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                onClick={toggleFullscreen}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 relative">
          {/* Location selector for mobile */}
          <div className="p-4 border-b bg-muted/20 md:hidden">
            <Select value={selectedLocation} onValueChange={onLocationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LOCATIONS).map(([key, location]) => (
                  <SelectItem key={key} value={key}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Map container */}
          <div className={`relative ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'} w-full overflow-hidden`}>
            <div 
              ref={mapRef} 
              className="w-full h-full rounded-b-lg z-0"
              style={{ 
                background: 'linear-gradient(135deg, #0B0D17 0%, #1a1b2e 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}
            />
            
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-b-lg">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground">Loading interactive map...</p>
                </div>
              </div>
            )}

            {/* Current location info overlay */}
            {currentLocationData && aqiLevel && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-4 left-4 glass-card p-3 space-y-2 max-w-xs"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: aqiLevel.color }}
                  />
                  <h4 className="font-semibold text-sm">
                    {currentLocationData?.name || getLocationName(selectedLocation)}
                  </h4>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    AQI: <span className="font-medium text-foreground">{currentLocationData.aqi}</span>
                  </p>
                  <Badge 
                    className="text-xs px-2 py-0.5" 
                    style={{ 
                      backgroundColor: `${aqiLevel.color}20`,
                      color: aqiLevel.color,
                      border: `1px solid ${aqiLevel.color}40`
                    }}
                  >
                    {aqiLevel.level}
                  </Badge>
                </div>
              </motion.div>
            )}

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 right-4 glass-card p-3 space-y-2"
            >
              <h5 className="text-xs font-medium text-foreground/80">AQI Scale</h5>
              <div className="space-y-1">
                {[
                  { range: '0-50', color: '#00E400', label: 'Good' },
                  { range: '51-100', color: '#FFFF00', label: 'Moderate' },
                  { range: '101-150', color: '#FF7E00', label: 'Unhealthy for Sensitive' },
                  { range: '151-200', color: '#FF0000', label: 'Unhealthy' },
                  { range: '201-300', color: '#8F3F97', label: 'Very Unhealthy' },
                  { range: '301+', color: '#7E0023', label: 'Hazardous' }
                ].map((item) => (
                  <div key={item.range} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground min-w-[3rem]">{item.range}</span>
                    <span className="text-foreground/70">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .leaflet-container {
          font-family: inherit;
          border-radius: 0.5rem;
        }
        
        .leaflet-popup-content-wrapper {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          color: white;
        }
        
        .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .leaflet-control-container {
          position: relative;
          z-index: 10;
        }
        
        .leaflet-popup {
          z-index: 1000;
        }
      `}</style>
    </motion.div>
  )
}
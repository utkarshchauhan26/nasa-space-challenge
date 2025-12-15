"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Heart, 
  Users, 
  Activity, 
  Home, 
  Car, 
  Trees, 
  ShieldCheck, 
  AlertTriangle,
  CheckCircle2,
  User,
  Baby,
  Calendar
} from "lucide-react"
import { useForecast } from "@/lib/air-quality-api"
import { getAQILevel, getLocationName, type HealthRecommendation } from "@/lib/air-quality-constants"

interface HealthRecommendationsProps {
  location: string
  userProfile?: {
    age?: number
    hasRespiratoryConditions?: boolean
    isPregnant?: boolean
    isAthlete?: boolean
  }
}

const getUserRiskLevel = (aqi: number, profile?: HealthRecommendationsProps['userProfile']) => {
  const baseLevel = getAQILevel(aqi)
  let riskMultiplier = 1

  if (profile) {
    if (profile.age && (profile.age < 18 || profile.age > 65)) riskMultiplier += 0.5
    if (profile.hasRespiratoryConditions) riskMultiplier += 1
    if (profile.isPregnant) riskMultiplier += 0.7
    if (profile.isAthlete) riskMultiplier += 0.3
  }

  const adjustedAqi = Math.min(500, aqi * riskMultiplier)
  return getAQILevel(adjustedAqi)
}

const getRecommendationsByCategory = (aqi: number, userProfile?: HealthRecommendationsProps['userProfile']) => {
  const level = getUserRiskLevel(aqi, userProfile)
  
  const recommendations: Record<string, HealthRecommendation[]> = {
    general: [
      {
        category: 'general',
        priority: aqi > 150 ? 'high' : aqi > 100 ? 'medium' : 'low',
        title: 'Monitor Air Quality',
        description: 'Stay informed about current air quality conditions',
        icon: '📱',
        actionItems: [
          'Check AQI levels before going outside',
          'Subscribe to air quality alerts',
          'Use weather apps with AQI information'
        ]
      }
    ],
    outdoor: [
      {
        category: 'outdoor',
        priority: aqi > 200 ? 'high' : aqi > 150 ? 'medium' : 'low',
        title: aqi > 200 ? 'Avoid Outdoor Activities' : aqi > 150 ? 'Limit Outdoor Activities' : 'Safe for Outdoor Activities',
        description: aqi > 200 ? 'Stay indoors and avoid all outdoor activities' : 
                    aqi > 150 ? 'Reduce time spent outdoors, especially strenuous activities' :
                    aqi > 100 ? 'Consider reducing prolonged outdoor exertion' :
                    'Normal outdoor activities are safe',
        icon: aqi > 200 ? '🏠' : aqi > 150 ? '⚠️' : '🌳',
        actionItems: aqi > 200 ? [
          'Stay indoors with windows closed',
          'Use air purifiers if available',
          'Avoid outdoor exercise completely'
        ] : aqi > 150 ? [
          'Limit outdoor activities to essential only',
          'Wear N95 mask when outside',
          'Take frequent breaks if outdoors'
        ] : aqi > 100 ? [
          'Consider shorter outdoor workouts',
          'Choose early morning or evening for activities',
          'Listen to your body for any discomfort'
        ] : [
          'Normal outdoor activities are safe',
          'Great time for exercise and recreation',
          'Enjoy fresh air activities'
        ]
      }
    ],
    health: [
      {
        category: 'health',
        priority: aqi > 150 ? 'high' : aqi > 100 ? 'medium' : 'low',
        title: 'Health Precautions',
        description: 'Protect your health from air pollution effects',
        icon: '💚',
        actionItems: aqi > 200 ? [
          'Seek medical attention if experiencing symptoms',
          'Use prescribed inhalers/medications',
          'Consider relocating temporarily if possible'
        ] : aqi > 150 ? [
          'Monitor for respiratory symptoms',
          'Stay hydrated and rest more',
          'Avoid smoking and secondhand smoke'
        ] : aqi > 100 ? [
          'Stay hydrated throughout the day',
          'Consider vitamin C supplements',
          'Monitor sensitive group members'
        ] : [
          'Maintain regular health routines',
          'Stay hydrated as always',
          'Enjoy normal activities'
        ]
      }
    ],
    indoor: [
      {
        category: 'indoor',
        priority: aqi > 150 ? 'high' : aqi > 100 ? 'medium' : 'low',
        title: 'Indoor Air Quality',
        description: 'Improve your indoor environment',
        icon: '🏡',
        actionItems: aqi > 150 ? [
          'Keep windows and doors closed',
          'Use HEPA air purifiers',
          'Avoid indoor pollution sources'
        ] : aqi > 100 ? [
          'Limit opening windows during peak hours',
          'Use fans to circulate air',
          'Consider air purifying plants'
        ] : [
          'Open windows for natural ventilation',
          'Normal indoor activities are fine',
          'Regular cleaning maintains air quality'
        ]
      }
    ]
  }

  // Add user-specific recommendations
  if (userProfile?.hasRespiratoryConditions) {
    recommendations.health.push({
      category: 'health',
      priority: 'high',
      title: 'Respiratory Condition Care',
      description: 'Special precautions for respiratory conditions',
      icon: '🫁',
      actionItems: [
        'Keep rescue medications readily available',
        'Follow your doctor\'s air quality action plan',
        'Consider indoor exercise alternatives',
        'Monitor symptoms closely'
      ]
    })
  }

  if (userProfile?.isPregnant) {
    recommendations.health.push({
      category: 'health',
      priority: 'high',
      title: 'Pregnancy Precautions',
      description: 'Protect both mother and baby from air pollution',
      icon: '🤱',
      actionItems: [
        'Avoid outdoor activities during high pollution',
        'Ensure proper nutrition and hydration',
        'Consult healthcare provider about concerns',
        'Consider moving activities indoors'
      ]
    })
  }

  return recommendations
}

export function HealthRecommendations({ location, userProfile }: HealthRecommendationsProps) {
  const { forecast, isLoading, isError } = useForecast(location)
  const [activeTab, setActiveTab] = useState('general')
  const [showProfile, setShowProfile] = useState(false)

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-muted/50 rounded animate-pulse w-48" />
              <div className="h-4 bg-muted/30 rounded animate-pulse w-32" />
            </div>
            <div className="h-8 bg-muted/30 rounded animate-pulse w-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted/50 rounded animate-pulse w-24" />
                <div className="h-20 bg-muted/20 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentAQI = forecast?.current?.aqi || 50
  const userRiskLevel = getUserRiskLevel(currentAQI, userProfile)
  const recommendations = getRecommendationsByCategory(currentAQI, userProfile)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'medium': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      default: return 'text-green-400 bg-green-500/20 border-green-500/30'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'medium': return <ShieldCheck className="w-4 h-4" />
      default: return <CheckCircle2 className="w-4 h-4" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="glass-card overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-serif flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Health Recommendations
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {getLocationName(location)} • Personalized advice
              </p>
            </div>
            <Button
              onClick={() => setShowProfile(!showProfile)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <User className="w-4 h-4" />
            </Button>
          </div>

          {/* Risk Level Indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 glass-card"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Your Risk Level</span>
              <Badge 
                className={getPriorityColor(
                  currentAQI > 200 ? 'high' : currentAQI > 100 ? 'medium' : 'low'
                )}
              >
                {userRiskLevel.level}
              </Badge>
            </div>
            <Progress 
              value={(currentAQI / 500) * 100} 
              className="h-2"
              style={{
                background: `linear-gradient(to right, ${userRiskLevel.color}20, ${userRiskLevel.color}40)`
              }}
            />
            <p className="text-xs text-muted-foreground mt-2">
              AQI: {currentAQI} • {userRiskLevel.description}
            </p>
          </motion.div>
        </CardHeader>

        <CardContent className="p-6">
          {isError ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Unable to load recommendations</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 glass-card">
                <TabsTrigger value="general" className="flex items-center gap-2 text-xs">
                  <Activity className="w-4 h-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="outdoor" className="flex items-center gap-2 text-xs">
                  <Trees className="w-4 h-4" />
                  Outdoor
                </TabsTrigger>
                <TabsTrigger value="health" className="flex items-center gap-2 text-xs">
                  <Heart className="w-4 h-4" />
                  Health
                </TabsTrigger>
                <TabsTrigger value="indoor" className="flex items-center gap-2 text-xs">
                  <Home className="w-4 h-4" />
                  Indoor
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                {Object.entries(recommendations).map(([category, recs]) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {recs.map((rec, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="glass-card p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{rec.icon}</div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-1">
                                  {rec.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {rec.description}
                                </p>
                              </div>
                            </div>
                            <Badge className={`${getPriorityColor(rec.priority)} text-xs`}>
                              {getPriorityIcon(rec.priority)}
                              <span className="ml-1 capitalize">{rec.priority}</span>
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <h5 className="text-xs font-medium text-foreground/70 uppercase tracking-wide">
                              Action Items:
                            </h5>
                            <ul className="space-y-1">
                              {rec.actionItems.map((item, itemIndex) => (
                                <motion.li
                                  key={itemIndex}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: (index * 0.1) + (itemIndex * 0.05) }}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                  <span className="text-foreground/80">{item}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </TabsContent>
                ))}
              </AnimatePresence>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
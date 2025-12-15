"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, AlertTriangle, CheckCircle, XCircle, RefreshCw, Volume2, VolumeX } from "lucide-react"
import { useAlerts } from "@/lib/air-quality-api"
import { getLocationName, type AlertData } from "@/lib/air-quality-constants"
import { toast } from "sonner"

interface AlertsPanelProps {
  location: string
}

const AlertIcon = ({ level }: { level: string }) => {
  switch (level) {
    case 'very_unhealthy':
    case 'hazardous':
      return <XCircle className="w-4 h-4 text-red-400" />
    case 'unhealthy':
    case 'unhealthy_sensitive':
      return <AlertTriangle className="w-4 h-4 text-orange-400" />
    default:
      return <CheckCircle className="w-4 h-4 text-green-400" />
  }
}

const getAlertStyle = (level: string) => {
  switch (level) {
    case 'hazardous':
      return {
        bg: 'bg-red-900/20',
        border: 'border-red-500/30',
        text: 'text-red-300',
        glow: 'shadow-red-500/20'
      }
    case 'very_unhealthy':
      return {
        bg: 'bg-purple-900/20',
        border: 'border-purple-500/30',
        text: 'text-purple-300',
        glow: 'shadow-purple-500/20'
      }
    case 'unhealthy':
      return {
        bg: 'bg-red-500/20',
        border: 'border-red-500/30',
        text: 'text-red-400',
        glow: 'shadow-red-500/20'
      }
    case 'unhealthy_sensitive':
      return {
        bg: 'bg-orange-500/20',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        glow: 'shadow-orange-500/20'
      }
    default:
      return {
        bg: 'bg-green-500/20',
        border: 'border-green-500/30',
        text: 'text-green-400',
        glow: 'shadow-green-500/20'
      }
  }
}

export function AlertsPanel({ location }: AlertsPanelProps) {
  const { alerts, isLoading, isError, refresh } = useAlerts(location)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Check if browser notifications are supported and enabled
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [])

  useEffect(() => {
    // Show browser notifications for critical alerts
    if (alerts?.alerts && notificationsEnabled) {
      alerts.alerts.forEach((alert: AlertData) => {
        if (alert.level === 'very_unhealthy' || alert.level === 'hazardous') {
          new Notification(alert.title, {
            body: alert.message,
            icon: '/favicon.ico',
            tag: `alert-${location}-${alert.level}`
          })
        }
      })
    }
  }, [alerts, notificationsEnabled, location])

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationsEnabled(permission === 'granted')
      
      if (permission === 'granted') {
        toast.success('Notifications enabled for critical air quality alerts')
      } else {
        toast.error('Notifications permission denied')
      }
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-muted/50 rounded animate-pulse w-32" />
              <div className="h-4 bg-muted/30 rounded animate-pulse w-24" />
            </div>
            <div className="h-8 bg-muted/30 rounded animate-pulse w-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/20 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const alertsList = alerts?.alerts || []
  const hasActiveAlerts = alertsList.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="glass-card overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-serif flex items-center gap-2">
                <Bell className={`w-5 h-5 ${hasActiveAlerts ? 'text-orange-400 animate-pulse' : 'text-primary'}`} />
                Air Quality Alerts
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {getLocationName(location)} • Real-time monitoring
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={requestNotificationPermission}
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${notificationsEnabled ? 'text-green-400' : 'text-muted-foreground'}`}
                title={notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
              >
                {notificationsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isError ? (
            <Alert className="border-destructive/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Unable to load alerts</AlertTitle>
              <AlertDescription>
                Please check your connection and try refreshing.
              </AlertDescription>
            </Alert>
          ) : (
            <AnimatePresence mode="wait">
              {hasActiveAlerts ? (
                <motion.div
                  key="alerts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {alertsList.map((alert: AlertData, index: number) => {
                    const style = getAlertStyle(alert.level)
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`glass-card p-4 border ${style.border} ${style.bg} ${style.glow} shadow-lg`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertIcon level={alert.level} />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className={`font-semibold ${style.text}`}>
                                {alert.title}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className={`${style.border} ${style.text} text-xs`}
                              >
                                {(alert.level ? alert.level.replace('_', ' ').toUpperCase() : '')}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground/80">
                              {alert.message}
                            </p>
                            {alert.recommendations && alert.recommendations.length > 0 && (
                              <div className="mt-3">
                                <h5 className="text-xs font-medium text-foreground/70 mb-2">
                                  Recommendations:
                                </h5>
                                <ul className="text-xs text-foreground/60 space-y-1">
                                  {alert.recommendations.map((rec: string, recIndex: number) => (
                                    <li key={recIndex} className="flex items-start gap-2">
                                      <span className="text-primary">•</span>
                                      <span>{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="no-alerts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    All Clear!
                  </h3>
                  <p className="text-muted-foreground">
                    No active air quality alerts for this location.
                  </p>
                  <Badge variant="outline" className="mt-3 border-green-500/30 text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Air quality is within acceptable ranges
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
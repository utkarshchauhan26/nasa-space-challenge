"use client"

import { motion } from "framer-motion"
import { Satellite, MapPin, BrainCircuit } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  iconName: "satellite" | "mapPin" | "brainCircuit"
  title: string
  subtitle: string
  delay?: number
}

const iconMap = {
  satellite: Satellite,
  mapPin: MapPin,
  brainCircuit: BrainCircuit,
}

export function StatCard({ iconName, title, subtitle, delay = 0 }: StatCardProps) {
  const Icon = iconMap[iconName]

  if (!Icon) {
    console.error(`Icon "${iconName}" not found in iconMap`)
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "glass-panel rounded-xl p-6",
        "group cursor-default"
      )}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className={cn(
            "w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center",
            "group-hover:bg-primary/30 transition-colors duration-300"
          )}>
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-foreground/70 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export function HeroStats() {
  const stats = [
    {
      iconName: "mapPin" as const,
      title: "120+ Ground Stations",
      subtitle: "Validated monitoring network",
      delay: 0.2
    },
    {
      iconName: "satellite" as const,
      title: "Real-time TEMPO Data",
      subtitle: "Satellite air quality tracking",
      delay: 0.4
    },
    {
      iconName: "brainCircuit" as const,
      title: "72h ML Forecasting",
      subtitle: "AI-powered predictions",
      delay: 0.6
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          iconName={stat.iconName}
          title={stat.title}
          subtitle={stat.subtitle}
          delay={stat.delay}
        />
      ))}
    </div>
  )
}
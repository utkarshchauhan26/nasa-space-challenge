"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CheckCircle, BrainCircuit, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type FeatureCardProps = {
  title: string
  description: string
  iconName: "activity" | "checkCircle" | "brainCircuit" | "alertTriangle"
  delay?: number
}

const iconMap = {
  activity: Activity,
  checkCircle: CheckCircle,
  brainCircuit: BrainCircuit,
  alertTriangle: AlertTriangle,
}

export function FeatureCard({ title, description, iconName, delay = 0 }: FeatureCardProps) {
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
      whileHover={{ scale: 1.02 }}
    >
      <Card className={cn(
        "glass-panel h-full",
        "group cursor-default"
      )}>
        <CardHeader className="pb-4">
          <div className="mb-4">
            <div className={cn(
              "w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center",
              "group-hover:bg-primary/30 group-hover:shadow-lg group-hover:shadow-primary/20",
              "transition-all duration-300"
            )}>
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="font-serif text-xl group-hover:text-primary transition-colors duration-300">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80 leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

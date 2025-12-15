"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { HeroStats } from "@/components/hero-stats"

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* NASA Nebula effect */}
      <div className="hero-nebula" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="particle w-1 h-1" style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
        <div className="particle w-0.5 h-0.5" style={{ top: '40%', left: '80%', animationDelay: '2s' }} />
        <div className="particle w-0.5 h-0.5" style={{ top: '60%', left: '20%', animationDelay: '4s' }} />
        <div className="particle w-1 h-1" style={{ top: '80%', left: '70%', animationDelay: '1s' }} />
        <div className="particle w-0.5 h-0.5" style={{ top: '30%', left: '60%', animationDelay: '3s' }} />
      </div>
      
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-panel rounded-2xl p-8 md:p-12"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-balance text-3xl md:text-5xl font-bold tracking-tight"
          >
            Predicting Cleaner, Safer Skies with NASA Data
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/90"
          >
            A mission-control dashboard for real-time air quality, ML forecasting, and public health insights.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 flex items-center gap-4"
          >
            <Link href="/dashboard">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-lg"
              >
                View Live Dashboard
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
                className="border-border/60 hover:bg-white/10 hover:text-foreground bg-transparent backdrop-blur-sm transition-all duration-300"
              >
                Learn More
              </Button>
            </Link>
          </motion.div>
          
          {/* Hero Stats */}
          <HeroStats />
        </motion.div>
      </div>
    </section>
  )
}

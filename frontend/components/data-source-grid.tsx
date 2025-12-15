"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const sources = [
  { name: "TEMPO Satellite", caption: "Hourly NO₂ measurements", alt: "NASA TEMPO", src: "/tempo.jpg" },
  { name: "Pandora Network", caption: "Ground-based validation", alt: "Pandora", src: "/pandora.jpg" },
  { name: "AirNow", caption: "EPA monitoring network", alt: "AirNow", src: "/airnow.jpg" },
  { name: "NASA POWER", caption: "Meteorological data", alt: "NASA POWER", src: "/power.jpg" },
  { name: "OpenAQ", caption: "Global air quality data", alt: "OpenAQ", src: "/openaq.jpg" },
]

export function DataSourceGrid() {
  return (
    <section aria-labelledby="data-sources" className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="data-sources" className="font-serif text-2xl md:text-3xl font-bold mb-4">
            Trusted Data Sources
          </h2>
          <p className="text-foreground/80 max-w-2xl mx-auto">
            Powered by NASA's advanced Earth observation satellites and validated ground monitoring networks
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {sources.map((source, index) => (
            <motion.div
              key={source.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "glass-panel rounded-xl p-6",
                "group cursor-default text-center"
              )}
            >
              <div className="flex items-center justify-center mb-4 h-16">
                <Image 
                  src={source.src || "/placeholder.svg"} 
                  alt={source.alt} 
                  width={120} 
                  height={60} 
                  className="opacity-90 group-hover:opacity-100 transition-opacity duration-300 object-contain max-h-full"
                />
              </div>
              <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors duration-300">
                {source.name}
              </h3>
              <p className="text-xs text-foreground/70 leading-relaxed">
                {source.caption}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
}

export function ParticleField() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const colors = [
      "rgba(255, 255, 255, 0.8)",
      "rgba(10, 61, 145, 0.6)",
      "rgba(75, 0, 130, 0.5)"
    ]

    const initialParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)]
    }))

    setParticles(initialParticles)

    const animate = () => {
      setParticles(prev => prev.map(particle => {
        let newX = particle.x + particle.speedX
        let newY = particle.y + particle.speedY

        // Wrap around screen edges
        if (newX < 0) newX = window.innerWidth
        if (newX > window.innerWidth) newX = 0
        if (newY < 0) newY = window.innerHeight
        if (newY > window.innerHeight) newY = 0

        return {
          ...particle,
          x: newX,
          y: newY
        }
      }))
    }

    const intervalId = setInterval(animate, 50)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            filter: 'blur(0.5px)',
            animation: `twinkle ${3 + Math.random() * 2}s ease-in-out infinite alternate`
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
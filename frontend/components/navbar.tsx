"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="w-full sticky top-0 z-40 border-b bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <Image src="/placeholder-logo.svg" alt="NASA AQ" width={24} height={24} className="opacity-90" />
          <span className="font-serif font-semibold tracking-tight">NASA NEXUS</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-sm opacity-90 hover:opacity-100 transition-opacity">
            About
          </Link>
          <Link href="/team" className="text-sm opacity-90 hover:opacity-100 transition-opacity">
            Team
          </Link>
          <Link href="/dashboard">
            <Button
              variant="default"
              className="bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              View Dashboard
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}

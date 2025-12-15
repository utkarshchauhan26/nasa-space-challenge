import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-2xl md:text-3xl mb-4">About</h1>
        <p className="leading-relaxed opacity-90">
          This demo showcases a NASA-style air quality dashboard with real-time data placeholders, ML forecast visuals,
          and health alerts in a mission-control aesthetic.
        </p>
      </main>
      <SiteFooter />
    </>
  )
}

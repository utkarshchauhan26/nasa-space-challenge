import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"

export default function TeamPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-2xl md:text-3xl mb-4">Team</h1>
        <p className="leading-relaxed opacity-90">
          Built by a small team passionate about earth observation, machine learning, and public health.
        </p>
      </main>
      <SiteFooter />
    </>
  )
}

import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"
import { Hero } from "@/components/hero"
import { FeatureCard } from "@/components/feature-card"
import { DataSourceGrid } from "@/components/data-source-grid"
import { CTASection } from "@/components/cta-section"

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />

        <section aria-labelledby="features" className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="features" className="font-serif text-2xl md:text-3xl font-bold mb-4">
                Mission-Critical Features
              </h2>
              <p className="text-foreground/80 max-w-2xl mx-auto">
                Advanced capabilities powered by NASA Earth data and cutting-edge AI technology
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                title="Real-time Data" 
                description="Live TEMPO satellite and ground network monitoring with sub-hourly updates"
                iconName="activity"
                delay={0.1}
              />
              <FeatureCard 
                title="Ground Validation" 
                description="Cross-referenced with 120+ validated ground monitoring stations"
                iconName="checkCircle"
                delay={0.2}
              />
              <FeatureCard 
                title="AI Forecasting" 
                description="72-hour ML-powered air quality predictions with 85% accuracy"
                iconName="brainCircuit"
                delay={0.3}
              />
              <FeatureCard 
                title="Health Alerts" 
                description="Actionable community health insights and early warning systems"
                iconName="alertTriangle"
                delay={0.4}
              />
            </div>
          </div>
        </section>

        <DataSourceGrid />

        <CTASection />
      </main>
      <SiteFooter />
    </>
  )
}

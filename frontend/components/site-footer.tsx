import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm opacity-80">© {new Date().getFullYear()} NASA Air Quality (demo)</p>
        <nav className="flex items-center gap-4" aria-label="Footer">
          <Link href="/about" className="text-sm hover:opacity-100 opacity-80 transition-opacity">
            About
          </Link>
          <Link href="/team" className="text-sm hover:opacity-100 opacity-80 transition-opacity">
            Team
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:opacity-100 opacity-80 transition-opacity"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}

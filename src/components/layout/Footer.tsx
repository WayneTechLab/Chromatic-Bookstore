import { Link } from 'react-router-dom'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-400 sm:flex-row">
        <p>&copy; {year} Chromatic Bookstore. Template provided by Wayne Tech Lab LLC.</p>
        <div className="flex gap-4">
          <Link to="/about" className="hover:text-white">
            About
          </Link>
          <Link to="/services" className="hover:text-white">
            Services
          </Link>
          <Link to="/docs" className="hover:text-white">
            Docs
          </Link>
          <Link to="/contact" className="hover:text-white">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}

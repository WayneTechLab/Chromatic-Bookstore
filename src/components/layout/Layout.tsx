import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Seo } from '@/components/seo/Seo'

export function Layout() {
  return (
    <div className="flex min-h-full flex-col text-slate-50">
      <Seo />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

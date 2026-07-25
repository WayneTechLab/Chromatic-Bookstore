import { useState, type FormEvent } from 'react'
import { Mail, MapPin, Send } from 'lucide-react'

export function ContactPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/70">
        Contact
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
        Reach the Chromatic Bookstore team.
      </h1>
      <p className="mt-5 text-lg leading-8 text-slate-300">
        This form keeps the same visual treatment as the coloring book storefront
        while remaining ready for a backend or email service.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
          >
            <Send className="h-4 w-4" /> Send message
          </button>
          {sent && (
              <p className="text-sm font-medium text-slate-300">
                Thanks. This demo form is not connected yet.
              </p>
          )}
        </form>

        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-5 w-5 text-slate-300" />
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-sm text-slate-400">
                hello@example.com
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 text-slate-300" />
            <div>
              <h3 className="font-semibold">Location</h3>
              <p className="text-sm text-slate-400">
                Anywhere on the web
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const services = [
  'Template setup',
  'Page scaffolding',
  'Firebase configuration',
  'Deployment preparation',
]

export function ServicesPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-200/70">
        Services
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
        Storefront services, setup, and system operations.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
        This page now matches the same visual tone as the home screen so the
        app feels cohesive while still keeping the content easy to replace.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <div key={service} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-semibold text-white">{service}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Add project-specific details, pricing, process, or supporting
              links here.
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

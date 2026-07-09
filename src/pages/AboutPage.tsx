export function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/70">
        About
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
        A branded storefront shell built on the same setup system.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
        Chromatic Bookstore keeps the .SYSTEMX operator layer intact while
        giving the visible app a richer commercial feel. The result is a
        template that still behaves like a starter, but looks like a real
        storefront from the first screen.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-semibold text-white">Included</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            React, Vite, TypeScript, routing, Firebase-ready config, CI scripts,
            and .SYSTEMX setup documentation.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-semibold text-white">Style</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Dark surfaces, neon accents, and a product-led layout inspired by
            the ColorVerse reference.
          </p>
        </div>
      </div>
    </section>
  )
}

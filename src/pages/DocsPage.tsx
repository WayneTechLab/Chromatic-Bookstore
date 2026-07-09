const docs = [
  '.SYSTEMX/Unified-Setup-Process',
  '.SYSTEMX/Template/steps',
  'wiki/Setup-Playbook.md',
]

export function DocsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/70">
        Docs
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
        Setup documentation lives with the template.
      </h1>
      <p className="mt-5 text-lg leading-8 text-slate-300">
        Follow the .SYSTEMX setup process to configure tooling, Firebase,
        security, CI, deployment, and human/AI handoff.
      </p>
      <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
        {docs.map((doc) => (
          <li key={doc} className="py-4 font-mono text-sm text-slate-300">
            {doc}
          </li>
        ))}
      </ul>
    </section>
  )
}

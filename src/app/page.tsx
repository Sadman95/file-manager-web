export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          Mini Workspace Explorer
        </h1>
        <p className="text-sm text-slate-500">
          Phase 1 scaffold ready — domain, state, and explorer UI land in Phases 2–4.
        </p>
      </header>
      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-4 p-6 md:grid-cols-[280px_1fr]">
        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
          <h2 className="text-sm font-medium text-slate-700">Sidebar — Tree View</h2>
          <p className="mt-1 text-sm text-slate-500">Folder hierarchy goes here (Phase 4).</p>
        </section>
        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
          <h2 className="text-sm font-medium text-slate-700">Main Panel</h2>
          <p className="mt-1 text-sm text-slate-500">
            Breadcrumb + contents + editor go here (Phases 4–6).
          </p>
        </section>
      </main>
    </div>
  );
}

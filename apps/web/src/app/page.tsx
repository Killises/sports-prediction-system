const sports = [
  { name: "Football", description: "Match predictions and statistics", icon: "⚽", status: "Coming soon" },
  { name: "Basketball", description: "Game predictions and analytics", icon: "🏀", status: "Coming soon" },
  { name: "Tennis", description: "Player performance and predictions", icon: "🎾", status: "Coming soon" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-8 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            SPORTS<span className="text-blue-500">PREDICTION</span>
          </h1>
          <span className="text-sm text-slate-400">Development v0.1</span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-16">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
          Sports intelligence platform
        </p>

        <h2 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Predict the game.
          <br />
          Understand the data.
        </h2>

        <p className="mt-6 max-w-2xl text-lg text-slate-400">
          A multi-sport analytics platform powered by data science
          and machine learning.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {sports.map((sport) => (
            <article
              key={sport.name}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500"
            >
              <div className="text-4xl">{sport.icon}</div>
              <h3 className="mt-5 text-xl font-semibold">{sport.name}</h3>
              <p className="mt-2 text-sm text-slate-400">
                {sport.description}
              </p>
              <span className="mt-6 inline-block rounded-full bg-slate-800 px-3 py-1 text-xs text-blue-300">
                {sport.status}
              </span>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 px-8 py-6 text-center text-sm text-slate-500">
        Sports Prediction System · Personal project
      </footer>
    </main>
  );
}
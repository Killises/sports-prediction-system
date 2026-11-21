
type Sport = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
};

const sportPresentation: Record<
  string,
  { name: string; icon: string }
> = {
  football: { name: "Fútbol", icon: "⚽" },
  basketball: { name: "Baloncesto", icon: "🏀" },
  tennis: { name: "Tenis", icon: "🎾" },
  volleyball: { name: "Voleibol", icon: "🏐" },
};

async function getSports(): Promise<Sport[]> {
  const apiUrl =
    process.env.API_BASE_URL ?? "http://127.0.0.1:8000";

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/sports/?active_only=false`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al consultar los deportes:", error);
    return [];
  }
}

export default async function SportsPage() {
  const sports = await getSports();

  const activeSports = sports.filter((sport) => sport.is_active).length;
  const inactiveSports = sports.length - activeSports;

  return (
    <main className="min-h-screen bg-[#080d18] text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">
              SPORTS INTELLIGENCE PLATFORM
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Gestión de deportes
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Administra los deportes registrados en la plataforma.
            </p>
          </div>

          <a
            href="/"
            className="inline-flex w-fit items-center rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            ← Volver al dashboard
          </a>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total de deportes", value: sports.length },
            { label: "Activos", value: activeSports },
            { label: "Inactivos", value: inactiveSports },
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-xl border border-slate-800 bg-[#0c1423] p-5"
            >
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#0c1423]">
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="font-semibold">Deportes registrados</h2>
            <p className="mt-1 text-sm text-slate-500">
              Listado completo de deportes del sistema.
            </p>
          </div>

          {sports.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-400">
                No se pudieron cargar los deportes.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/60 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Deporte</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4">Descripción</th>
                    <th className="px-6 py-4">Estado</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {sports.map((sport) => {
                    const presentation = sportPresentation[sport.slug];

                    return (
                      <tr
                        key={sport.id}
                        className="transition hover:bg-slate-800/30"
                      >
                        <td className="whitespace-nowrap px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {presentation?.icon ?? "🏅"}
                            </span>
                            <span className="font-medium">
                              {presentation?.name ?? sport.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-slate-400">
                          {sport.slug}
                        </td>

                        <td className="min-w-48 px-6 py-5 text-slate-400">
                          {sport.description ?? "Sin descripción"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              sport.is_active
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-slate-700/40 text-slate-400"
                            }`}
                          >
                            {sport.is_active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export const dynamic = "force-dynamic";
type Sport = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
};

const sportPresentation: Record<
  string,
  { name: string; description: string; icon: string }
> = {
  football: {
    name: "Fútbol",
    description: "Ligas, equipos, partidos y estadísticas",
    icon: "⚽",
  },
  basketball: {
    name: "Baloncesto",
    description: "Competiciones, equipos y estadísticas",
    icon: "🏀",
  },
  tennis: {
    name: "Tenis",
    description: "Torneos, jugadores y rendimiento",
    icon: "🎾",
  },
};

async function getSports(): Promise<Sport[]> {
  const apiUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";

  try {
    const response = await fetch(`${apiUrl}/api/v1/sports/`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al consultar los deportes:", error);
    return [];
  }
}

type DashboardCounts = {
  competitions: number;
  participants: number;
  matches: number;
};

async function getDashboardCounts(): Promise<DashboardCounts> {
  const apiUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";

  try {
    const [competitions, participants, matches] = await Promise.all([
      fetch(`${apiUrl}/api/v1/competitions/`, { cache: "no-store" }),
      fetch(`${apiUrl}/api/v1/participants/`, { cache: "no-store" }),
      fetch(`${apiUrl}/api/v1/matches/`, { cache: "no-store" }),
    ]);

    if (!competitions.ok || !participants.ok || !matches.ok) {
      throw new Error("No se pudieron consultar todos los indicadores");
    }

    const [competitionsData, participantsData, matchesData] =
      await Promise.all([
        competitions.json(),
        participants.json(),
        matches.json(),
      ]);

    return {
      competitions: competitionsData.length,
      participants: participantsData.length,
      matches: matchesData.length,
    };
  } catch (error) {
    console.error("Error al consultar los indicadores:", error);

    return {
      competitions: 0,
      participants: 0,
      matches: 0,
    };
  }
}



const navigation = [
  { name: "General", icon: "⌂", active: true },
  { name: "Deportes", icon: "◈", active: false },
  { name: "Competiciones", icon: "🏆", active: false },
  { name: "Temporadas", icon: "▦", active: false },
  { name: "Participantes", icon: "♙", active: false },
  { name: "Partidos", icon: "⚽", active: false },
  { name: "Estadísticas", icon: "▥", active: false },
];

export default async function Home() {
  const sportsData = await getSports();
    const dashboardCounts = await getDashboardCounts();

  const sports = sportsData.map((sport) => {
    const presentation = sportPresentation[sport.slug];

    return {
      name: presentation?.name ?? sport.name,
      description:
        presentation?.description ??
        sport.description ??
        "Deporte registrado en la plataforma",
      icon: presentation?.icon ?? "🏅",
      status: sport.is_active ? "Activo" : "Inactivo",
    };
  });
  return (
    <main className="min-h-screen bg-[#080d18] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-[#0c1423] p-6 lg:block">
          <div className="mb-12">
            <h1 className="text-xl font-bold tracking-tight">
              SPORTS<span className="text-blue-500">PREDICTION</span>
            </h1>
            <p className="mt-2 text-xs text-slate-500">
              Sports Intelligence Platform
            </p>
          </div>

          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={
  item.name === "General"
    ? "/"
    : item.name === "Deportes"
      ? "/sports"
      : item.name === "Competiciones"
        ? "/competitions"
        : `#${item.name.toLowerCase()}`
}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                  item.active
                    ? "bg-blue-600/15 font-medium text-blue-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="w-5 text-center">{item.icon}</span>
                {item.name}
              </a>
            ))}
          </nav>

          <div className="mt-12 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm font-semibold">Development</p>
            <p className="mt-1 text-xs text-slate-500">
              Plataforma en construcción
            </p>
            <span className="mt-4 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
              ● Sistema activo
            </span>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-slate-800 px-6 lg:px-10">
            <div>
              <p className="text-sm text-slate-500">Workspace / General</p>
              <h2 className="mt-1 text-lg font-semibold">Dashboard</h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-400 sm:block">
                Sports Prediction System
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/20 text-sm font-bold text-blue-400">
                SP
              </div>
            </div>
          </header>

          <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
            <div className="mb-10">
              <p className="text-sm font-medium text-blue-400">
                SPORTS INTELLIGENCE PLATFORM
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Centro de control
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Administra los deportes, competiciones y datos que alimentan
                el sistema de análisis y predicciones deportivas.
              </p>
            </div>

            <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Deportes",
                  value: String(sports.length).padStart(2, "0"),
                  detail: "Registrados",
                },
                {
                  label: "Competiciones",
                  value: String(dashboardCounts.competitions).padStart(2, "0"),
                  detail: "Registradas",
                },
                {
                  label: "Participantes",
                  value: String(dashboardCounts.participants).padStart(2, "0"),
                  detail: "Registrados",
                },
                {
                  label: "Partidos",
                  value: String(dashboardCounts.matches).padStart(2, "0"),
                  detail: "Registrados",
                },
              ].map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-xl border border-slate-800 bg-[#0c1423] p-5"
                >
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-4 text-3xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>
                </article>
              ))}
            </div>

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Deportes</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Deportes registrados en la plataforma
                </p>
              </div>
              <span className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400">
                {sports.length} deportes
              </span>
            </div>

            <div id="deportes" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sports.map((sport) => (
                <article
                  key={sport.name}
                  className="rounded-xl border border-slate-800 bg-[#0c1423] p-6 transition hover:border-blue-500/50"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{sport.icon}</span>
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
                      {sport.status}
                    </span>
                  </div>

                  <h4 className="mt-6 text-lg font-semibold">{sport.name}</h4>
                  <p className="mt-2 min-h-10 text-sm leading-5 text-slate-400">
                    {sport.description}
                  </p>

                  <div className="mt-6 border-t border-slate-800 pt-4">
                    <p className="text-xs text-slate-500">
                      Gestión disponible próximamente
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 rounded-xl border border-slate-800 bg-[#0c1423] p-6">
              <h3 className="font-semibold">Estado del proyecto</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                La infraestructura inicial está configurada. El siguiente
                objetivo es conectar este panel con la API para administrar
                los datos directamente desde la interfaz.
              </p>
            </div>
          </section>

          <footer className="border-t border-slate-800 px-6 py-5 text-center text-xs text-slate-600">
            Sports Prediction System · Development v0.2
          </footer>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";

type Sport = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
};

type Competition = {
  id: number;
  sport_id: number;
  name: string;
  slug: string;
  country_code: string | null;
  is_active: boolean;
};

export default function CompetitionsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingCompetitionId, setEditingCompetitionId] =
    useState<number | null>(null);

  const [formData, setFormData] = useState({
    sport_id: "",
    name: "",
    slug: "",
    country_code: "",
  });

  useEffect(() => {
    async function loadData() {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ??
        process.env.API_BASE_URL ??
        "http://127.0.0.1:8000";

      try {
        const [sportsResponse, competitionsResponse] =
          await Promise.all([
            fetch(`${apiUrl}/api/v1/sports/?active_only=false`),
            fetch(`${apiUrl}/api/v1/competitions/?active_only=false`),
          ]);

        if (!sportsResponse.ok || !competitionsResponse.ok) {
          throw new Error("No se pudieron cargar los datos.");
        }

        const sportsData: Sport[] = await sportsResponse.json();
        const competitionsData: Competition[] =
          await competitionsResponse.json();

        setSports(sportsData);
        setCompetitions(competitionsData);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setFormError("No se pudieron cargar los deportes y competiciones.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const activeCompetitions = competitions.filter(
    (competition) => competition.is_active
  ).length;

  const inactiveCompetitions =
    competitions.length - activeCompetitions;

  async function handleCreateCompetition(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSaving(true);
    setFormError("");

    const apiUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      process.env.API_BASE_URL ??
      "http://127.0.0.1:8000";

    try {
      const response = await fetch(
        `${apiUrl}/api/v1/competitions/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sport_id: Number(formData.sport_id),
            name: formData.name.trim(),
            slug: formData.slug.trim().toLowerCase(),
            country_code:
              formData.country_code.trim().toUpperCase() || null,
            is_active: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "No se pudo registrar la competición."
        );
      }

      setCompetitions((current) => [...current, data]);

      setFormData({
        sport_id: "",
        name: "",
        slug: "",
        country_code: "",
      });

      setIsFormOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleEditCompetition(competition: Competition) {
    setEditingCompetitionId(competition.id);

    setFormData({
      sport_id: String(competition.sport_id),
      name: competition.name,
      slug: competition.slug,
      country_code: competition.country_code ?? "",
    });

    setFormError("");
    setIsFormOpen(true);
  }

  async function handleUpdateCompetition(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (editingCompetitionId === null) return;

    setIsSaving(true);
    setFormError("");

    const apiUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      process.env.API_BASE_URL ??
      "http://127.0.0.1:8000";

    try {
      const response = await fetch(
        `${apiUrl}/api/v1/competitions/${editingCompetitionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sport_id: Number(formData.sport_id),
            name: formData.name.trim(),
            slug: formData.slug.trim().toLowerCase(),
            country_code:
              formData.country_code.trim().toUpperCase() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "No se pudo actualizar la competición."
        );
      }

      setCompetitions((current) =>
        current.map((competition) =>
          competition.id === editingCompetitionId
            ? data
            : competition
        )
      );

      setFormData({
        sport_id: "",
        name: "",
        slug: "",
        country_code: "",
      });

      setEditingCompetitionId(null);
      setIsFormOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleCompetition(
    competition: Competition
  ) {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      process.env.API_BASE_URL ??
      "http://127.0.0.1:8000";

    try {
      const response = await fetch(
        `${apiUrl}/api/v1/competitions/${competition.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_active: !competition.is_active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "No se pudo cambiar el estado de la competición."
        );
      }

      setCompetitions((current) =>
        current.map((item) =>
          item.id === competition.id ? data : item
        )
      );
    } catch (error) {
      console.error("Error al cambiar el estado:", error);

      setFormError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#080d18] text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <header className="mb-10">
          <p className="text-sm font-medium text-blue-400">
            SPORTS INTELLIGENCE PLATFORM
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Gestión de competiciones
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Administra las ligas y torneos registrados en la plataforma.
          </p>

          <a
            href="/"
            className="mt-5 inline-flex w-fit items-center rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            ← Volver al dashboard
          </a>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total de competiciones", value: competitions.length },
            { label: "Activas", value: activeCompetitions },
            { label: "Inactivas", value: inactiveCompetitions },
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
          <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Competiciones registradas</h2>
              <p className="mt-1 text-sm text-slate-500">
                Listado completo de ligas y torneos del sistema.
              </p>
            </div>
            {isFormOpen && (
              <div className="border-b border-slate-800 bg-slate-900/30 p-6">
                <form
                  onSubmit={
                    editingCompetitionId !== null
                      ? handleUpdateCompetition
                      : handleCreateCompetition
                  }
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-lg font-semibold">
                      {editingCompetitionId !== null
                        ? "Editar competición"
                        : "Registrar nueva competición"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Completa los datos de la liga o torneo.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Deporte
                      </label>
                      <select
                        required
                        value={formData.sport_id}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            sport_id: event.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                      >
                        <option value="">Selecciona un deporte</option>
                        {sports
                          .filter((sport) => sport.is_active)
                          .map((sport) => (
                            <option key={sport.id} value={sport.id}>
                              {sport.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Nombre de la competición
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={150}
                        value={formData.name}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            name: event.target.value,
                          })
                        }
                        placeholder="Ej. Premier League"
                        className="w-full rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Slug
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={150}
                        pattern="[a-z0-9-]+"
                        title="Usa letras minúsculas, números y guiones."
                        value={formData.slug}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            slug: event.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, ""),
                          })
                        }
                        placeholder="ej. premier-league"
                        className="w-full rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Código de país (opcional)
                      </label>
                      <input
                        type="text"
                        maxLength={2}
                        minLength={2}
                        pattern="[A-Za-z]{2}"
                        value={formData.country_code}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            country_code: event.target.value
                              .toUpperCase()
                              .replace(/[^A-Z]/g, ""),
                          })
                        }
                        placeholder="Ej. GB"
                        className="w-full rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {formError && (
                    <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      {formError}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving
                        ? "Guardando..."
                        : editingCompetitionId !== null
                          ? "Guardar cambios"
                          : "Guardar competición"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        setFormError("");
                        setEditingCompetitionId(null);
                        setFormData({
                          sport_id: "",
                          name: "",
                          slug: "",
                          country_code: "",
                        });
                      }}
                      disabled={isSaving}
                      className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setFormError("");
                setEditingCompetitionId(null);
                setFormData({
                  sport_id: "",
                  name: "",
                  slug: "",
                  country_code: "",
                });
                setIsFormOpen(true);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              + Nueva competición
            </button>
          </div>
          <div className="overflow-x-auto">
  {isLoading ? (
    <p className="p-6 text-sm text-slate-400">
      Cargando competiciones...
    </p>
  ) : competitions.length === 0 ? (
    <p className="p-6 text-sm text-slate-400">
      No hay competiciones registradas.
    </p>
  ) : (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
        <tr>
          <th className="px-6 py-4 font-medium">Competición</th>
          <th className="px-6 py-4 font-medium">Deporte</th>
          <th className="px-6 py-4 font-medium">Slug</th>
          <th className="px-6 py-4 font-medium">País</th>
          <th className="px-6 py-4 font-medium">Estado</th>
          <th className="px-6 py-4 text-right font-medium">Acciones</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-800">
        {competitions.map((competition) => (
          <tr key={competition.id} className="hover:bg-slate-800/30">
            <td className="px-6 py-4 font-medium text-white">
              {competition.name}
            </td>

            <td className="px-6 py-4 text-slate-300">
              {sports.find(
                (sport) => sport.id === competition.sport_id
              )?.name ?? "Deporte desconocido"}
            </td>

            <td className="px-6 py-4 text-slate-400">
              {competition.slug}
            </td>

            <td className="px-6 py-4 text-slate-400">
              {competition.country_code ?? "—"}
            </td>

            <td className="px-6 py-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  competition.is_active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                {competition.is_active ? "Activa" : "Inactiva"}
              </span>
            </td>

            <td className="px-6 py-4">
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleEditCompetition(competition)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleCompetition(competition)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                >
                  {competition.is_active ? "Desactivar" : "Activar"}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
        </section>
      </div>
    </main>
  );
}
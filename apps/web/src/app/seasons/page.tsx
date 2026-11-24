
"use client";

import { useEffect, useState } from "react";

type Competition = {
  id: number;
  sport_id: number;
  name: string;
  slug: string;
  country_code: string | null;
  is_active: boolean;
};

type Season = {
  id: number;
  competition_id: number;
  name: string;
  slug: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
};

const initialFormData = {
  competition_id: "",
  name: "",
  slug: "",
  start_date: "",
  end_date: "",
  is_current: false,
};

export default function SeasonsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingSeasonId, setEditingSeasonId] = useState<number | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.API_BASE_URL ??
    "http://127.0.0.1:8000";

  useEffect(() => {
    async function loadData() {
      try {
        const [competitionsResponse, seasonsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/v1/competitions/?active_only=false`),
          fetch(`${apiUrl}/api/v1/seasons/?current_only=false`),
        ]);

        if (!competitionsResponse.ok || !seasonsResponse.ok) {
          throw new Error("No se pudieron cargar los datos.");
        }

        const competitionsData: Competition[] =
          await competitionsResponse.json();
        const seasonsData: Season[] = await seasonsResponse.json();

        setCompetitions(competitionsData);
        setSeasons(seasonsData);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setFormError("No se pudieron cargar las competiciones y temporadas.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [apiUrl]);

  const currentSeasons = seasons.filter((season) => season.is_current).length;
  const inactiveSeasons = seasons.length - currentSeasons;

  function resetForm() {
    setFormData(initialFormData);
    setEditingSeasonId(null);
    setFormError("");
  }

  function handleEditSeason(season: Season) {
    setEditingSeasonId(season.id);
    setFormData({
      competition_id: String(season.competition_id),
      name: season.name,
      slug: season.slug,
      start_date: season.start_date ?? "",
      end_date: season.end_date ?? "",
      is_current: season.is_current,
    });
    setFormError("");
    setIsFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setFormError("");

    try {
      const isEditing = editingSeasonId !== null;
      const url = isEditing
        ? `${apiUrl}/api/v1/seasons/${editingSeasonId}`
        : `${apiUrl}/api/v1/seasons/`;

      const payload = {
        competition_id: Number(formData.competition_id),
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_current: formData.is_current,
      };

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "No se pudo guardar la temporada."
        );
      }

      if (isEditing) {
        setSeasons((current) =>
          current.map((season) => (season.id === editingSeasonId ? data : season))
        );
      } else {
        setSeasons((current) => [...current, data]);
      }

      resetForm();
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

  async function handleToggleSeason(season: Season) {
    setFormError("");

    try {
      const response = await fetch(
        `${apiUrl}/api/v1/seasons/${season.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_current: !season.is_current,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "No se pudo cambiar el estado de la temporada."
        );
      }

      setSeasons((current) =>
        current.map((item) => (item.id === season.id ? data : item))
      );
    } catch (error) {
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
            Gestión de temporadas
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Administra las temporadas de las ligas y torneos registrados.
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
            { label: "Total de temporadas", value: seasons.length },
            { label: "Actuales", value: currentSeasons },
            { label: "No actuales", value: inactiveSeasons },
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
              <h2 className="font-semibold">Temporadas registradas</h2>
              <p className="mt-1 text-sm text-slate-500">
                Listado completo de temporadas del sistema.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              + Nueva temporada
            </button>
          </div>

          {isFormOpen && (
            <div className="border-b border-slate-800 bg-slate-900/30 p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold">
                    {editingSeasonId !== null
                      ? "Editar temporada"
                      : "Registrar nueva temporada"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Completa los datos de la temporada.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Competición
                    </label>
                    <select
                      required
                      value={formData.competition_id}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          competition_id: event.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                    >
                      <option value="">Selecciona una competición</option>
                      {competitions
                        .filter((competition) => competition.is_active)
                        .map((competition) => (
                          <option
                            key={competition.id}
                            value={competition.id}
                          >
                            {competition.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Nombre de la temporada
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={formData.name}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          name: event.target.value,
                        })
                      }
                      placeholder="Ej. Premier League 2026/27"
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
                      maxLength={100}
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
                      placeholder="ej. 2026-2027"
                      className="w-full rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Fecha de inicio
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          start_date: event.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Fecha de finalización
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          end_date: event.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-7">
                    <input
                      id="is_current"
                      type="checkbox"
                      checked={formData.is_current}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          is_current: event.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-blue-500"
                    />
                    <label
                      htmlFor="is_current"
                      className="text-sm text-slate-300"
                    >
                      Temporada actual
                    </label>
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
                      : editingSeasonId !== null
                        ? "Guardar cambios"
                        : "Guardar temporada"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm();
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

          {formError && !isFormOpen && (
            <p className="m-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {formError}
            </p>
          )}

          <div className="overflow-x-auto">
            {isLoading ? (
              <p className="p-6 text-sm text-slate-400">
                Cargando temporadas...
              </p>
            ) : seasons.length === 0 ? (
              <p className="p-6 text-sm text-slate-400">
                No hay temporadas registradas.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Temporada</th>
                    <th className="px-6 py-4 font-medium">Competición</th>
                    <th className="px-6 py-4 font-medium">Periodo</th>
                    <th className="px-6 py-4 font-medium">Slug</th>
                    <th className="px-6 py-4 font-medium">Estado</th>
                    <th className="px-6 py-4 text-right font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {seasons.map((season) => (
                    <tr
                      key={season.id}
                      className="hover:bg-slate-800/30"
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        {season.name}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {competitions.find(
                          (competition) =>
                            competition.id === season.competition_id
                        )?.name ?? "Competición desconocida"}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {season.start_date ?? "—"} / {season.end_date ?? "—"}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {season.slug}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            season.is_current
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-slate-700 text-slate-400"
                          }`}
                        >
                          {season.is_current ? "Actual" : "No actual"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditSeason(season)}
                            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleSeason(season)}
                            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                          >
                            {season.is_current
                              ? "Marcar no actual"
                              : "Marcar actual"}
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

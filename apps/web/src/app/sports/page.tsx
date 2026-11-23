"use client";

import { useEffect, useState } from "react";
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


export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingSportId, setEditingSportId] = useState<number | null>(null);

  useEffect(() => {
    async function loadSports() {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ??
        process.env.API_BASE_URL ??
        "http://127.0.0.1:8000";

      try {
        const response = await fetch(
          `${apiUrl}/api/v1/sports/?active_only=false`
        );

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data: Sport[] = await response.json();
        setSports(data);
      } catch (error) {
        console.error("Error al consultar los deportes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSports();
  }, []);

  const activeSports = sports.filter((sport) => sport.is_active).length;
  async function handleCreateSport(
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
      const response = await fetch(`${apiUrl}/api/v1/sports/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim().toLowerCase(),
          description: formData.description.trim() || null,
          is_active: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "No se pudo registrar el deporte."
        );
      }

      setSports((currentSports) => [...currentSports, data]);

      setFormData({
        name: "",
        slug: "",
        description: "",
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
  function handleEditSport(sport: Sport) {
    setEditingSportId(sport.id);

    setFormData({
      name: sport.name,
      slug: sport.slug,
      description: sport.description ?? "",
    });

    setFormError("");
    setIsFormOpen(true);
  }
  async function handleUpdateSport(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (editingSportId === null) return;

    setIsSaving(true);
    setFormError("");

    const apiUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      process.env.API_BASE_URL ??
      "http://127.0.0.1:8000";

    try {
      const response = await fetch(
        `${apiUrl}/api/v1/sports/${editingSportId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            slug: formData.slug.trim().toLowerCase(),
            description: formData.description.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "No se pudo actualizar el deporte."
        );
      }

      setSports((currentSports) =>
        currentSports.map((sport) =>
          sport.id === editingSportId ? data : sport
        )
      );

      setFormData({
        name: "",
        slug: "",
        description: "",
      });

      setEditingSportId(null);
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
  async function handleToggleSport(sport: Sport) {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      process.env.API_BASE_URL ??
      "http://127.0.0.1:8000";

    try {
      const response = await fetch(
        `${apiUrl}/api/v1/sports/${sport.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_active: !sport.is_active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "No se pudo cambiar el estado del deporte."
        );
      }

      setSports((currentSports) =>
        currentSports.map((currentSport) =>
          currentSport.id === sport.id ? data : currentSport
        )
      );
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado."
      );
      setIsFormOpen(true);
    }
  }
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
          <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Deportes registrados</h2>
              <p className="mt-1 text-sm text-slate-500">
                Listado completo de deportes del sistema.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setFormError("");
                setEditingSportId(null);
                setFormData({
                  name: "",
                  slug: "",
                  description: "",
                });
                setIsFormOpen(true);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              + Nuevo deporte
            </button>
          </div>


          {isFormOpen && (
            <div className="border-b border-slate-800 bg-slate-900/30 p-6">
              <form
                onSubmit={
                  editingSportId !== null
                    ? handleUpdateSport
                    : handleCreateSport
                }
                className="space-y-5"
              >
                <div>
                  <h3 className="text-lg font-semibold">
                    {editingSportId !== null
                      ? "Editar deporte"
                      : "Registrar nuevo deporte"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Completa los datos para agregar un deporte a la plataforma.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Nombre del deporte
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
                      placeholder="Ej. Volleyball"
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
                      placeholder="ej. volleyball"
                      className="w-full rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-slate-300">
                      Descripción
                    </label>
                    <textarea
                      maxLength={500}
                      rows={3}
                      value={formData.description}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          description: event.target.value,
                        })
                      }
                      placeholder="Describe brevemente este deporte..."
                      className="w-full resize-y rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
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
                      : editingSportId !== null
                        ? "Guardar cambios"
                        : "Guardar deporte"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setFormError("");
                      setEditingSportId(null);
                      setFormData({
                        name: "",
                        slug: "",
                        description: "",
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

          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-400">Cargando deportes...</p>
            </div>
          ) : sports.length === 0 ? (
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
                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Acciones
                    </th>
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
                            className={`rounded-full px-3 py-1 text-xs ${sport.is_active
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-slate-700/40 text-slate-400"
                              }`}
                          >
                            {sport.is_active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditSport(sport)}
                              className="rounded-lg border border-blue-500/30 px-3 py-2 text-sm text-blue-400 transition hover:bg-blue-500/10"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleSport(sport)}
                              className={`rounded-lg border px-3 py-2 text-sm transition ${sport.is_active
                                  ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                  : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                }`}
                            >
                              {sport.is_active ? "Desactivar" : "Activar"}
                            </button>
                          </div>
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

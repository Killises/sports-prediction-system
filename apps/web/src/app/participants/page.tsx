
"use client";

import { useEffect, useState } from "react";

type Sport = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
};

type Participant = {
  id: number;
  sport_id: number;
  name: string;
  slug: string;
  participant_type: string;
  country_code: string | null;
  short_name: string | null;
  is_active: boolean;
};

export default function ParticipantsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingParticipantId, setEditingParticipantId] =
    useState<number | null>(null);

  const [formData, setFormData] = useState({
    sport_id: "",
    name: "",
    slug: "",
    participant_type: "team",
    country_code: "",
    short_name: "",
    is_active: true,
  });

  const [sportFilter, setSportFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

    const filteredParticipants = participants.filter((participant) => {
    const matchesSport =
      sportFilter === "all" ||
      participant.sport_id.toString() === sportFilter;

    const matchesType =
      typeFilter === "all" ||
      participant.participant_type === typeFilter;

    return matchesSport && matchesType;
  });

  const totalParticipants = participants.length;

  const activeParticipants = participants.filter(
    (participant) => participant.is_active
  ).length;

  const inactiveParticipants = totalParticipants - activeParticipants;





  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setFormError("");

    try {
      const response = await fetch(
        editingParticipantId
          ? `${apiUrl}/api/v1/participants/${editingParticipantId}`
          : `${apiUrl}/api/v1/participants/`,
        {
          method: editingParticipantId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sport_id: Number(formData.sport_id),
            name: formData.name.trim(),
            slug: formData.slug.trim().toLowerCase(),
            participant_type: formData.participant_type,
            country_code: formData.country_code.trim() || null,
            short_name: formData.short_name.trim() || null,
            is_active: formData.is_active,
          }),
        });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "No se pudo registrar el participante."
        );
      }

      const newParticipant: Participant = await response.json();

      setParticipants((current) =>
        editingParticipantId
          ? current.map((participant) =>
            participant.id === editingParticipantId
              ? newParticipant
              : participant
          )
          : [...current, newParticipant]
      );
      setEditingParticipantId(null);
      setFormData({
        sport_id: "",
        name: "",
        slug: "",
        participant_type: "team",
        country_code: "",
        short_name: "",
        is_active: true,
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

  function handleEdit(participant: Participant) {
    setEditingParticipantId(participant.id);

    setFormData({
      sport_id: participant.sport_id.toString(),
      name: participant.name,
      slug: participant.slug,
      participant_type: participant.participant_type,
      country_code: participant.country_code ?? "",
      short_name: participant.short_name ?? "",
      is_active: participant.is_active,
    });

    setFormError("");
    setIsFormOpen(true);
  }
    function handleCloseForm() {
    setIsFormOpen(false);
    setEditingParticipantId(null);
    setFormError("");

    setFormData({
      sport_id: "",
      name: "",
      slug: "",
      participant_type: "team",
      country_code: "",
      short_name: "",
      is_active: true,
    });
  }
    async function handleToggleStatus(participant: Participant) {
    try {
      const response = await fetch(
        `${apiUrl}/api/v1/participants/${participant.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_active: !participant.is_active,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado.");
      }

      const updatedParticipant: Participant = await response.json();

      setParticipants((current) =>
        current.map((item) =>
          item.id === participant.id ? updatedParticipant : item
        )
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado."
      );
    }
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.API_BASE_URL ??
    "http://127.0.0.1:8000";

  useEffect(() => {
    async function loadData() {
      try {
        const [sportsResponse, participantsResponse] =
          await Promise.all([
            fetch(`${apiUrl}/api/v1/sports/?active_only=false`),
            fetch(`${apiUrl}/api/v1/participants/?active_only=false`),
          ]);

        if (!sportsResponse.ok || !participantsResponse.ok) {
          throw new Error("No se pudieron cargar los datos.");
        }

        const sportsData: Sport[] = await sportsResponse.json();
        const participantsData: Participant[] =
          await participantsResponse.json();

        setSports(sportsData);
        setParticipants(participantsData);
      } catch (error) {
        console.error("Error al cargar participantes:", error);
        setFormError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [apiUrl]);

  return (
    <main className="min-h-screen bg-[#080d18] text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <header className="mb-10">
          <p className="text-sm font-medium text-blue-400">
            SPORTS INTELLIGENCE PLATFORM
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Gestión de participantes
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Administra equipos, clubes y deportistas de la plataforma.
          </p>

          <a
            href="/"
            className="mt-5 inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            ← Volver al dashboard
          </a>
        </header>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-[#0c1423] p-6">
            <p className="text-sm text-slate-400">Total de participantes</p>
            <p className="mt-3 text-3xl font-bold">{totalParticipants}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0c1423] p-6">
            <p className="text-sm text-slate-400">Participantes activos</p>
            <p className="mt-3 text-3xl font-bold text-emerald-400">
              {activeParticipants}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0c1423] p-6">
            <p className="text-sm text-slate-400">Participantes inactivos</p>
            <p className="mt-3 text-3xl font-bold text-rose-400">
              {inactiveParticipants}
            </p>
          </div>
        </section>
        <section className="mt-8 rounded-2xl border border-slate-800 bg-[#0c1423] p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold">
                Directorio de participantes
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Administra los equipos y deportistas registrados.
              </p>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => (isFormOpen ? handleCloseForm() : setIsFormOpen(true))}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFormOpen ? "Cerrar formulario" : "+ Nuevo participante"}
            </button>
          </div>
          {isFormOpen && (
            <form
              className="mt-6 grid gap-5 border-t border-slate-800 pt-6 sm:grid-cols-2"
              onSubmit={handleSubmit}
            >
              {formError && (
                <div className="sm:col-span-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {formError}
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Deporte
                </label>
                <select
                  value={formData.sport_id}
                  required
                  onChange={(event) =>
                    setFormData({ ...formData, sport_id: event.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white"
                >
                  <option value="">Selecciona un deporte</option>
                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Tipo de participante
                </label>
                <select
                  value={formData.participant_type}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      participant_type: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white"
                >
                  <option value="team">Equipo</option>
                  <option value="player">Jugador</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Nombre del participante
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                  placeholder="Ej. Manchester City"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(event) =>
                    setFormData({ ...formData, slug: event.target.value })
                  }
                  placeholder="Ej. manchester-city"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Código del país
                </label>
                <input
                  type="text"
                  value={formData.country_code}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      country_code: event.target.value.toUpperCase().slice(0, 2),
                    })
                  }
                  placeholder="Ej. GB"
                  maxLength={2}
                  className="w-full rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Nombre corto
                </label>
                <input
                  type="text"
                  value={formData.short_name}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      short_name: event.target.value,
                    })
                  }
                  placeholder="Ej. MCI"
                  maxLength={50}
                  className="w-full rounded-lg border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white placeholder:text-slate-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {isSaving
                    ? "Guardando..."
                    : editingParticipantId
                      ? "Guardar cambios"
                      : "Registrar participante"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Filtrar por deporte
          </label>
          <select
            value={sportFilter}
            onChange={(event) => setSportFilter(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-[#0c1423] px-4 py-3 text-sm text-white"
          >
            <option value="all">Todos los deportes</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Filtrar por tipo
          </label>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-[#0c1423] px-4 py-3 text-sm text-white"
          >
            <option value="all">Todos los tipos</option>
            <option value="team">Equipos</option>
            <option value="player">Jugadores</option>
          </select>
        </div>
      </section>
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#0c1423]">
        <div className="border-b border-slate-800 p-6">
          <h2 className="text-lg font-semibold">
            Participantes registrados
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {filteredParticipants.length} participantes encontrados
          </p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">
            Cargando participantes...
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No hay participantes que coincidan con los filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">Participante</th>
                  <th className="px-6 py-4">Deporte</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">País</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filteredParticipants.map((participant) => (
                  <tr key={participant.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">
                        {participant.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {participant.slug}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {sports.find(
                        (sport) => sport.id === participant.sport_id
                      )?.name ?? "Desconocido"}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {participant.participant_type === "team"
                        ? "Equipo"
                        : "Jugador"}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {participant.country_code ?? "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${participant.is_active
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                          }`}
                      >
                        {participant.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleEdit(participant)}
                        className="rounded-lg border border-blue-500/30 px-3 py-2 text-xs font-medium text-blue-400 transition hover:bg-blue-500/10"
                      >
                        Editar
                      </button>
                                        <button
                    type="button"
                    onClick={() => handleToggleStatus(participant)}
                    className={`ml-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                      participant.is_active
                        ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                        : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                  >
                    {participant.is_active ? "Desactivar" : "Activar"}
                  </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

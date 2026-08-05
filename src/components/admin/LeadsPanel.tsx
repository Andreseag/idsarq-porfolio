import { useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "../../lib/useRequireAuth";
import {
  fetchLeads,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_ORDER,
  type Lead,
  type LeadStatus,
} from "../../lib/leads";
import { formatMXN } from "../../lib/costEstimator";
import LeadDetailModal from "./LeadDetailModal";

const STATUS_COLORS: Record<LeadStatus, string> = {
  nuevo: "bg-blue-100 text-blue-700",
  contactado: "bg-amber-100 text-amber-700",
  negociacion: "bg-purple-100 text-purple-700",
  cotizacion_enviada: "bg-indigo-100 text-indigo-700",
  aceptado: "bg-emerald-100 text-emerald-700",
  rechazado: "bg-red-100 text-red-700",
  perdido: "bg-gray-200 text-gray-600",
  convertido: "bg-brand-dark text-brand-cream",
};

export default function LeadsPanel() {
  const { session, loading: authLoading } = useRequireAuth();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [search, setSearch] = useState("");

  const load = () =>
    fetchLeads()
      .then(setLeads)
      .catch((e) => setError(e.message));

  useEffect(() => {
    if (session) load();
  }, [session]);

  const filtered = useMemo(() => {
    if (!leads) return [];
    return leads.filter((l) => {
      if (statusFilter !== "todos" && l.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !l.nombre.toLowerCase().includes(q) &&
          !l.email.toLowerCase().includes(q) &&
          !l.telefono.includes(q)
        )
          return false;
      }
      return true;
    });
  }, [leads, statusFilter, search]);

  const handleChanged = (id: string, patch: Partial<Lead>) => {
    setLeads((prev) =>
      prev ? prev.map((l) => (l.id === id ? { ...l, ...patch } : l)) : prev,
    );
    setSelected((prev) =>
      prev && prev.id === id ? { ...prev, ...patch } : prev,
    );
  };

  if (authLoading || !session)
    return <div className="text-brand-muted">Verificando sesión…</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-dark">
            Oportunidades
          </h1>
          <p className="text-brand-muted">
            {filtered.length} de {leads?.length ?? 0} oportunidades
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nombre, email o teléfono..."
            className="px-4 py-2.5 rounded-xl border border-brand-dark/15 text-sm outline-none focus:border-brand-dark w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-brand-dark/15 text-sm outline-none focus:border-brand-dark bg-white">
            <option value="todos">Todos los status</option>
            {LEAD_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-brand-dark/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="text-left text-brand-muted border-b border-brand-dark/10">
              <th className="px-5 py-3 font-medium">Nombre</th>
              <th className="px-5 py-3 font-medium">Tipo</th>
              <th className="px-5 py-3 font-medium">Ciudad</th>
              <th className="px-5 py-3 font-medium">Fecha</th>
              <th className="px-5 py-3 font-medium">Costo estimado</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads === null && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-brand-muted">
                  Cargando leads…
                </td>
              </tr>
            )}
            {leads !== null && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-brand-muted">
                  No hay leads con estos filtros.
                </td>
              </tr>
            )}
            {filtered.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => setSelected(lead)}
                className="border-b border-brand-dark/5 last:border-0 hover:bg-brand-dark/[0.02] cursor-pointer transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-brand-dark">{lead.nombre}</p>
                  <p className="text-brand-muted text-xs">{lead.email}</p>
                </td>
                <td className="px-5 py-4 text-brand-dark">
                  {lead.tipo_proyecto}
                </td>
                <td className="px-5 py-4 text-brand-dark">{lead.ciudad}</td>
                <td className="px-5 py-4 text-brand-muted">
                  {new Date(lead.created_at).toLocaleDateString("es-MX")}
                </td>
                <td className="px-5 py-4 text-brand-dark font-medium">
                  {formatMXN(lead.costo_final ?? lead.costo_sugerido)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
                    {LEAD_STATUS_LABELS[lead.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <LeadDetailModal
          lead={selected}
          onClose={() => setSelected(null)}
          onChanged={(patch) => handleChanged(selected.id, patch)}
        />
      )}
    </div>
  );
}

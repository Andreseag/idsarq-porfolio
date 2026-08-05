import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { useRequireAuth } from "../../lib/useRequireAuth";
import {
  fetchLeads,
  computeLeadStats,
  LEAD_STATUS_LABELS,
  type Lead,
} from "../../lib/leads";
import {
  fetchProjects,
  computeProjectStats,
  PROJECT_STATUS_LABELS,
  type Project,
} from "../../lib/projects";
import { formatMXN } from "../../lib/costEstimator";

const COLORS = [
  "#2d3836",
  "#4a5553",
  "#9a8f82",
  "#c4b5a0",
  "#e8d5c0",
  "#8a7a68",
  "#6b5f52",
];

export default function Dashboard() {
  const { session, loading: authLoading } = useRequireAuth();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    Promise.all([fetchLeads(), fetchProjects()])
      .then(([l, p]) => {
        setLeads(l);
        setProjects(p);
      })
      .catch((e) => setError(e.message));
  }, [session]);

  const leadStats = useMemo(
    () => (leads ? computeLeadStats(leads) : null),
    [leads],
  );
  const projectStats = useMemo(
    () => (projects ? computeProjectStats(projects) : null),
    [projects],
  );

  if (authLoading || !session) {
    return <div className="text-brand-muted">Verificando sesión…</div>;
  }

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!leadStats || !projectStats)
    return <div className="text-brand-muted">Cargando estadísticas…</div>;

  const statusData = Object.entries(leadStats.byStatus).map(
    ([status, count]) => ({
      name:
        LEAD_STATUS_LABELS[status as keyof typeof LEAD_STATUS_LABELS] ?? status,
      value: count,
    }),
  );

  const tipoData = Object.entries(leadStats.byTipoProyecto).map(
    ([tipo, count]) => ({ tipo, count }),
  );

  const topCiudades = Object.entries(leadStats.byCiudad)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ciudad, count]) => ({ ciudad, count }));

  const hotLeads = (leads ?? [])
    .filter((l) => !["rechazado", "perdido", "convertido"].includes(l.status))
    .sort(
      (a, b) =>
        (b.costo_final ?? b.costo_sugerido ?? 0) -
        (a.costo_final ?? a.costo_sugerido ?? 0),
    )
    .slice(0, 5);

  const projectStatusData = Object.entries(projectStats.byStatus).map(
    ([status, count]) => ({
      name:
        PROJECT_STATUS_LABELS[status as keyof typeof PROJECT_STATUS_LABELS] ??
        status,
      value: count,
    }),
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark mb-1">Dashboard</h1>
      <p className="text-brand-muted mb-10">
        Resumen general de oportunidades y proyectos.
      </p>

      {/* ===================== OPORTUNIDADES ===================== */}
      <section className="mb-14">
        <h2 className="text-lg font-semibold text-brand-dark mb-4">
          Oportunidades
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total de oportunidades"
            value={leadStats.total.toString()}
          />
          <StatCard
            label="Tasa de conversión"
            value={`${leadStats.conversionRate}%`}
          />
          <StatCard
            label="Valor en pipeline"
            value={formatMXN(leadStats.pipelineValue)}
          />
          <StatCard
            label="Oportunidades activas"
            value={(
              (leadStats.byStatus.nuevo ?? 0) +
              (leadStats.byStatus.contactado ?? 0) +
              (leadStats.byStatus.negociacion ?? 0)
            ).toString()}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-brand-dark/10 p-6">
            <h3 className="font-semibold text-brand-dark mb-4">
              Oportunidades por semana (últimas 8)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={leadStats.last8Weeks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d383610" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2d3836"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-brand-dark/10 p-6">
            <h3 className="font-semibold text-brand-dark mb-4">
              Oportunidades por status
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={80}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-brand-dark/10 p-6">
            <h3 className="font-semibold text-brand-dark mb-4">
              Oportunidades por tipo de proyecto
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tipoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d383610" />
                <XAxis
                  dataKey="tipo"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4a5553" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-brand-dark/10 p-6">
            <h3 className="font-semibold text-brand-dark mb-4">Top ciudades</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topCiudades} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2d383610" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  dataKey="ciudad"
                  type="category"
                  tick={{ fontSize: 11 }}
                  width={90}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#c4b5a0" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-6">
          <h3 className="font-semibold text-brand-dark mb-1">
            🔥 Oportunidades calientes
          </h3>
          <p className="text-brand-muted text-sm mb-4">
            Mayor valor estimado, aún sin cerrar.
          </p>
          <div className="space-y-2">
            {hotLeads.length === 0 && (
              <p className="text-brand-muted text-sm">
                No hay oportunidades activas por ahora.
              </p>
            )}
            {hotLeads.map((l) => (
              <a
                key={l.id}
                href="/admin/leads"
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-brand-dark/[0.02] hover:bg-brand-dark/[0.05] transition-colors">
                <div>
                  <span className="font-medium text-brand-dark">
                    {l.nombre}
                  </span>
                  <span className="text-brand-muted text-sm ml-2">
                    {l.tipo_proyecto} · {l.ciudad}
                  </span>
                </div>
                <span className="font-semibold text-brand-dark">
                  {formatMXN(l.costo_final ?? l.costo_sugerido)}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PROYECTOS ===================== */}
      <section>
        <h2 className="text-lg font-semibold text-brand-dark mb-4">
          Proyectos
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Proyectos activos"
            value={projectStats.activos.toString()}
          />
          <StatCard
            label="Valor en proyectos activos"
            value={formatMXN(projectStats.valorActivo)}
          />
          <StatCard
            label="Avance promedio"
            value={`${projectStats.avanceProm}%`}
          />
          <StatCard
            label="Entregas atrasadas"
            value={projectStats.entregasAtrasadas.length.toString()}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-brand-dark/10 p-6">
            <h3 className="font-semibold text-brand-dark mb-4">
              Proyectos por status
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d383610" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2d3836" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-brand-dark/10 p-6">
            <h3 className="font-semibold text-brand-dark mb-1">
              📅 Próximas entregas (30 días)
            </h3>
            <p className="text-brand-muted text-sm mb-4">
              Ordenadas por fecha más próxima.
            </p>
            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {projectStats.proximasEntregas.length === 0 && (
                <p className="text-brand-muted text-sm">
                  Sin entregas programadas en los próximos 30 días.
                </p>
              )}
              {projectStats.proximasEntregas.map((p) => (
                <a
                  key={p.id}
                  href="/admin/proyectos"
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-brand-dark/[0.02] hover:bg-brand-dark/[0.05] transition-colors text-sm">
                  <span className="text-brand-dark font-medium">
                    {p.nombre_cliente}
                  </span>
                  <span className="text-brand-muted">
                    {new Date(
                      p.fecha_entrega_estimada + "T00:00:00",
                    ).toLocaleDateString("es-MX")}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        {projectStats.entregasAtrasadas.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <h3 className="font-semibold text-red-700 mb-1">
              ⚠️ Entregas atrasadas
            </h3>
            <p className="text-red-600/80 text-sm mb-4">
              Proyectos activos con fecha de entrega ya vencida.
            </p>
            <div className="space-y-2">
              {projectStats.entregasAtrasadas.map((p) => (
                <a
                  key={p.id}
                  href="/admin/proyectos"
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white hover:bg-red-100/50 transition-colors text-sm">
                  <span className="text-brand-dark font-medium">
                    {p.nombre_cliente}
                  </span>
                  <span className="text-red-600">
                    Venció el{" "}
                    {new Date(
                      p.fecha_entrega_estimada + "T00:00:00",
                    ).toLocaleDateString("es-MX")}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-brand-dark/10 p-5">
      <p className="text-brand-muted text-xs mb-1">{label}</p>
      <p className="text-2xl font-semibold text-brand-dark">{value}</p>
    </div>
  );
}

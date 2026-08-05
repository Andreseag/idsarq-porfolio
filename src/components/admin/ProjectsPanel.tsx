import { useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "../../lib/useRequireAuth";
import { fetchProjects, PROJECT_STATUS_LABELS, PROJECT_STATUS_ORDER, type Project } from "../../lib/projects";
import { formatMXN } from "../../lib/costEstimator";
import ProjectDetailModal from "./ProjectDetailModal";

export default function ProjectsPanel() {
  const { session, loading: authLoading } = useRequireAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState("todos");

  useEffect(() => {
    if (session) fetchProjects().then(setProjects).catch((e) => setError(e.message));
  }, [session]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    return statusFilter === "todos" ? projects : projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  const handleChanged = (id: string, patch: Partial<Project>) => {
    setProjects((prev) => (prev ? prev.map((p) => (p.id === id ? { ...p, ...patch } : p)) : prev));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
  };

  if (authLoading || !session) return <div className="text-brand-muted">Verificando sesión…</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-dark">Proyectos</h1>
          <p className="text-brand-muted">{filtered.length} de {projects?.length ?? 0} proyectos</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-brand-dark/15 text-sm outline-none focus:border-brand-dark bg-white"
        >
          <option value="todos">Todos los status</option>
          {[...PROJECT_STATUS_ORDER, "pausado", "cancelado"].map((s) => (
            <option key={s} value={s}>
              {PROJECT_STATUS_LABELS[s as keyof typeof PROJECT_STATUS_LABELS]}
            </option>
          ))}
        </select>
      </div>

      {projects === null && <p className="text-brand-muted">Cargando proyectos…</p>}
      {projects !== null && filtered.length === 0 && (
        <p className="text-brand-muted">No hay proyectos. Convierte un lead aceptado desde el panel de Leads.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelected(project)}
            className="text-left bg-white rounded-2xl border border-brand-dark/10 p-6 hover:border-brand-dark/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-dark/10 text-brand-dark font-medium">
                {PROJECT_STATUS_LABELS[project.status]}
              </span>
              <span className="text-xs text-brand-muted">{project.porcentaje_avance}%</span>
            </div>
            <h3 className="font-semibold text-brand-dark mb-1">{project.nombre_cliente}</h3>
            <p className="text-brand-muted text-sm mb-4">
              {project.tipo_proyecto} · {project.ciudad ?? "—"}
            </p>
            <div className="w-full h-1.5 bg-brand-dark/10 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-brand-dark rounded-full" style={{ width: `${project.porcentaje_avance}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-muted">Costo actual</span>
              <span className="font-medium text-brand-dark">{formatMXN(project.costo_actual)}</span>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <ProjectDetailModal
          project={selected}
          onClose={() => setSelected(null)}
          onChanged={(patch) => handleChanged(selected.id, patch)}
        />
      )}
    </div>
  );
}

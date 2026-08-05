import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  type Project,
  type ProjectStatus,
  type ProjectUpdateEntry,
  type ProjectNote,
  type ProjectReport,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_ORDER,
  updateProjectStatus,
  updateProjectFields,
  updateProjectCost,
  fetchProjectUpdates,
  addProjectUpdate,
  fetchProjectNotes,
  addProjectNote,
  fetchProjectReports,
  saveProjectReport,
  getReportDownloadUrl,
} from "../../lib/projects";
import { generateProgressReportPdf } from "../../lib/pdf";
import { formatMXN } from "../../lib/costEstimator";

export default function ProjectDetailModal({
  project,
  onClose,
  onChanged,
}: {
  project: Project;
  onClose: () => void;
  onChanged: (patch: Partial<Project>) => void;
}) {
  const [updates, setUpdates] = useState<ProjectUpdateEntry[] | null>(null);
  const [notes, setNotes] = useState<ProjectNote[] | null>(null);
  const [reports, setReports] = useState<ProjectReport[] | null>(null);

  const [fechaEntrega, setFechaEntrega] = useState(project.fecha_entrega_estimada ?? "");
  const [responsable, setResponsable] = useState(project.responsable ?? "");
  const [proximoHito, setProximoHito] = useState(project.proximo_hito ?? "");
  const [avance, setAvance] = useState(project.porcentaje_avance);
  const [costoInput, setCostoInput] = useState(String(project.costo_actual));
  const [motivoCosto, setMotivoCosto] = useState("");

  const [newUpdateText, setNewUpdateText] = useState("");
  const [newUpdatePct, setNewUpdatePct] = useState(project.porcentaje_avance);
  const [newNote, setNewNote] = useState("");
  const [generatingPdfFor, setGeneratingPdfFor] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectUpdates(project.id).then(setUpdates);
    fetchProjectNotes(project.id).then(setNotes);
    fetchProjectReports(project.id).then(setReports);
  }, [project.id]);

  const handleStatusChange = async (status: ProjectStatus) => {
    await updateProjectStatus(project.id, status);
    onChanged({ status });
  };

  const handleSaveFields = async () => {
    await updateProjectFields(project.id, {
      fecha_entrega_estimada: fechaEntrega || null,
      responsable: responsable || null,
      proximo_hito: proximoHito || null,
      porcentaje_avance: avance,
    });
    onChanged({
      fecha_entrega_estimada: fechaEntrega || null,
      responsable: responsable || null,
      proximo_hito: proximoHito || null,
      porcentaje_avance: avance,
    });
  };

  const handleSaveCost = async () => {
    const value = parseFloat(costoInput.replace(/[^\d.]/g, ""));
    if (Number.isNaN(value)) return;
    await updateProjectCost(project.id, value, motivoCosto || "Ajuste manual");
    setMotivoCosto("");
    onChanged({ costo_actual: value });
  };

  const handleAddUpdate = async () => {
    if (!newUpdateText.trim()) return;
    const entry = await addProjectUpdate(project.id, newUpdateText.trim(), newUpdatePct);
    setUpdates((prev) => (prev ? [entry, ...prev] : [entry]));
    onChanged({ porcentaje_avance: newUpdatePct });
    setAvance(newUpdatePct);
    setNewUpdateText("");
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await addProjectNote(project.id, newNote.trim());
    const refreshed = await fetchProjectNotes(project.id);
    setNotes(refreshed);
    setNewNote("");
  };

  const handleGeneratePdf = async (entry: ProjectUpdateEntry) => {
    setGeneratingPdfFor(entry.id);
    try {
      const blob = generateProgressReportPdf(
        { ...project, costo_actual: project.costo_actual },
        { fecha: entry.fecha, descripcion: entry.descripcion, porcentaje_avance: entry.porcentaje_avance }
      );
      const titulo = `Avance ${new Date(entry.fecha + "T00:00:00").toLocaleDateString("es-MX")}`;
      const report = await saveProjectReport(project.id, titulo, blob, entry.id);
      setReports((prev) => (prev ? [report, ...prev] : [report]));
    } finally {
      setGeneratingPdfFor(null);
    }
  };

  const handleDownloadReport = async (report: ProjectReport) => {
    const url = await getReportDownloadUrl(report.file_path);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const phoneDigits = (project.telefono ?? "").replace(/[^\d+]/g, "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-brand-dark/60 backdrop-blur-sm flex items-start justify-center p-4 md:p-8 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl w-full max-w-4xl my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-5 border-b border-brand-dark/10 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-semibold text-brand-dark">{project.nombre_cliente}</h2>
            <p className="text-brand-muted text-sm">
              {project.tipo_proyecto} · {project.ciudad ?? "—"}
            </p>
          </div>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-dark p-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {phoneDigits && (
              <div className="flex flex-wrap gap-3">
                <a href={`tel:${phoneDigits}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-dark text-brand-cream text-sm font-medium">
                  📞 Llamar
                </a>
                <a
                  href={`https://wa.me/${phoneDigits.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium"
                >
                  💬 WhatsApp
                </a>
              </div>
            )}

            {/* Bitácora de avances */}
            <div>
              <h3 className="font-semibold text-brand-dark mb-3">Bitácora de avances</h3>
              <div className="bg-brand-dark/[0.02] rounded-xl p-5 mb-4 space-y-3">
                <textarea
                  value={newUpdateText}
                  onChange={(e) => setNewUpdateText(e.target.value)}
                  placeholder="Describe el avance de esta fecha..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-brand-dark/15 text-sm outline-none focus:border-brand-dark resize-none"
                />
                <div className="flex items-center gap-3">
                  <label className="text-sm text-brand-muted">Avance general:</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={newUpdatePct}
                    onChange={(e) => setNewUpdatePct(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-brand-dark w-10">{newUpdatePct}%</span>
                  <button onClick={handleAddUpdate} className="px-4 py-2 rounded-lg bg-brand-dark text-brand-cream text-sm font-medium shrink-0">
                    Guardar
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto">
                {updates === null && <p className="text-brand-muted text-sm">Cargando avances…</p>}
                {updates?.length === 0 && <p className="text-brand-muted text-sm">Sin avances registrados.</p>}
                {updates?.map((u) => (
                  <div key={u.id} className="border border-brand-dark/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-brand-dark">
                        {new Date(u.fecha + "T00:00:00").toLocaleDateString("es-MX")}
                      </span>
                      {u.porcentaje_avance != null && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-dark/10 text-brand-dark">{u.porcentaje_avance}%</span>
                      )}
                    </div>
                    <p className="text-brand-muted text-sm mb-3">{u.descripcion}</p>
                    <button
                      onClick={() => handleGeneratePdf(u)}
                      disabled={generatingPdfFor === u.id}
                      className="text-xs px-3 py-1.5 rounded-lg border border-brand-dark/20 text-brand-dark hover:bg-brand-dark/5 disabled:opacity-60"
                    >
                      {generatingPdfFor === u.id ? "Generando PDF…" : "📄 Generar reporte PDF"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Reportes PDF generados */}
            <div>
              <h3 className="font-semibold text-brand-dark mb-3">Reportes PDF generados</h3>
              <div className="space-y-2">
                {reports === null && <p className="text-brand-muted text-sm">Cargando reportes…</p>}
                {reports?.length === 0 && <p className="text-brand-muted text-sm">Aún no se han generado reportes.</p>}
                {reports?.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleDownloadReport(r)}
                    className="flex items-center justify-between w-full text-left px-4 py-3 rounded-xl bg-brand-dark/[0.02] hover:bg-brand-dark/[0.05] transition-colors"
                  >
                    <span className="text-sm text-brand-dark">📄 {r.titulo}</span>
                    <span className="text-xs text-brand-muted">{new Date(r.created_at).toLocaleDateString("es-MX")} · Descargar</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <h3 className="font-semibold text-brand-dark mb-3">Notas internas</h3>
              <div className="flex gap-2 mb-4">
                <input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Agregar nota..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-brand-dark/15 text-sm outline-none focus:border-brand-dark"
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                />
                <button onClick={handleAddNote} className="px-4 py-2.5 rounded-xl bg-brand-dark text-brand-cream text-sm font-medium">
                  Agregar
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notes?.map((n) => (
                  <div key={n.id} className="text-sm bg-brand-dark/[0.02] rounded-lg px-4 py-2.5">
                    <p className="text-brand-dark">{n.note}</p>
                    <p className="text-brand-muted text-xs mt-1">
                      {n.author} · {new Date(n.created_at).toLocaleString("es-MX")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-brand-dark/[0.02] rounded-xl p-5">
              <label className="block text-sm font-medium text-brand-dark mb-2">Status del proyecto</label>
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2.5 rounded-lg border border-brand-dark/15 text-sm outline-none focus:border-brand-dark bg-white"
              >
                {PROJECT_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {PROJECT_STATUS_LABELS[s]}
                  </option>
                ))}
                <option value="pausado">Pausado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div className="bg-brand-dark/[0.02] rounded-xl p-5 space-y-4">
              <h4 className="font-medium text-brand-dark text-sm">Información editable</h4>
              <div>
                <label className="block text-xs text-brand-muted mb-1">Fecha estimada de entrega</label>
                <input
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-brand-dark/15 text-sm outline-none focus:border-brand-dark"
                />
              </div>
              <div>
                <label className="block text-xs text-brand-muted mb-1">Responsable</label>
                <input
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-brand-dark/15 text-sm outline-none focus:border-brand-dark"
                />
              </div>
              <div>
                <label className="block text-xs text-brand-muted mb-1">Próximo hito</label>
                <input
                  value={proximoHito}
                  onChange={(e) => setProximoHito(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-brand-dark/15 text-sm outline-none focus:border-brand-dark"
                />
              </div>
              <button onClick={handleSaveFields} className="w-full py-2.5 rounded-lg bg-brand-dark text-brand-cream text-sm font-medium">
                Guardar cambios
              </button>
            </div>

            <div className="bg-brand-dark/[0.02] rounded-xl p-5">
              <label className="block text-sm font-medium text-brand-dark mb-1">Costo actual</label>
              <p className="text-xs text-brand-muted mb-3">Original: {formatMXN(project.costo_original)}</p>
              <input
                value={costoInput}
                onChange={(e) => setCostoInput(e.target.value)}
                className="w-full mb-2 px-3 py-2.5 rounded-lg border border-brand-dark/15 text-sm outline-none focus:border-brand-dark"
              />
              <input
                value={motivoCosto}
                onChange={(e) => setMotivoCosto(e.target.value)}
                placeholder="Motivo del cambio (opcional)"
                className="w-full mb-3 px-3 py-2 rounded-lg border border-brand-dark/15 text-xs outline-none focus:border-brand-dark"
              />
              <button onClick={handleSaveCost} className="w-full py-2.5 rounded-lg bg-brand-dark/10 text-brand-dark text-sm font-medium">
                Actualizar costo
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  type Lead,
  type LeadNote,
  type LeadStatus,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_ORDER,
  fetchLeadNotes,
  addLeadNote,
  updateLeadStatus,
  updateLeadCost,
  updateLeadFollowUp,
  updateLeadAssignee,
  convertLeadToProject,
} from "../../lib/leads";
import { estimateSuggestedCost, formatMXN } from "../../lib/costEstimator";

export default function LeadDetailModal({
  lead,
  onClose,
  onChanged,
}: {
  lead: Lead;
  onClose: () => void;
  onChanged: (updated: Partial<Lead>) => void;
}) {
  const [notes, setNotes] = useState<LeadNote[] | null>(null);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [costInput, setCostInput] = useState(
    String(lead.costo_final ?? lead.costo_sugerido ?? 0),
  );
  const [followUp, setFollowUp] = useState(lead.proximo_seguimiento ?? "");
  const [assignee, setAssignee] = useState(lead.asignado_a ?? "");
  const [converting, setConverting] = useState(false);
  const [convertedId, setConvertedId] = useState<string | null>(
    lead.converted_to_project_id,
  );

  useEffect(() => {
    fetchLeadNotes(lead.id).then(setNotes);
  }, [lead.id]);

  const breakdown = estimateSuggestedCost({
    metros: lead.metros,
    tipoProyecto: lead.tipo_proyecto,
    servicios: lead.servicios,
  });

  const handleStatusChange = async (status: LeadStatus) => {
    await updateLeadStatus(lead.id, status);
    onChanged({ status });
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    await addLeadNote(lead.id, newNote.trim());
    setNewNote("");
    const refreshed = await fetchLeadNotes(lead.id);
    setNotes(refreshed);
    setSavingNote(false);
  };

  const handleSaveCost = async () => {
    const value = parseFloat(costInput.replace(/[^\d.]/g, ""));
    if (Number.isNaN(value)) return;
    await updateLeadCost(lead.id, value);
    onChanged({ costo_final: value, costo_ajustado_manualmente: true });
  };

  const handleSaveFollowUp = async () => {
    await updateLeadFollowUp(lead.id, followUp || null);
    onChanged({ proximo_seguimiento: followUp || null });
  };

  const handleSaveAssignee = async () => {
    await updateLeadAssignee(lead.id, assignee);
    onChanged({ asignado_a: assignee || null });
  };

  const handleConvert = async () => {
    setConverting(true);
    try {
      const projectId = await convertLeadToProject({
        ...lead,
        costo_final: parseFloat(costInput) || lead.costo_final,
      });
      setConvertedId(projectId);
      onChanged({ status: "convertido", converted_to_project_id: projectId });
    } finally {
      setConverting(false);
    }
  };

  const phoneDigits = lead.telefono.replace(/[^\d+]/g, "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-brand-dark/60 backdrop-blur-sm flex items-start justify-center p-4 md:p-8 overflow-y-auto"
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl w-full max-w-4xl my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 py-5 border-b border-brand-dark/10 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-semibold text-brand-dark">
              {lead.nombre}
            </h2>
            <p className="text-brand-muted text-sm">
              {lead.tipo_proyecto} · {lead.ciudad} ·{" "}
              {new Date(lead.created_at).toLocaleDateString("es-MX")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-brand-muted hover:text-brand-dark p-2">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Contacto directo */}
            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${phoneDigits}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-dark text-brand-cream text-sm font-medium hover:bg-brand-primary transition-colors">
                📞 Llamar
              </a>
              <a
                href={`https://wa.me/${phoneDigits.replace("+", "")}?text=${encodeURIComponent(
                  `Hola ${lead.nombre}, gracias por tu solicitud de cotización con Estudio K. Te contactamos para darte seguimiento.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
                💬 WhatsApp
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-dark/20 text-brand-dark text-sm font-medium hover:bg-brand-dark/5 transition-colors">
                ✉️ Email
              </a>
            </div>

            {/* Detalle de la cotización */}
            <div>
              <h3 className="font-semibold text-brand-dark mb-3">
                Detalle de la solicitud
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm bg-brand-dark/[0.02] rounded-xl p-5">
                <Field label="Email" value={lead.email} />
                <Field label="Teléfono" value={lead.telefono} />
                <Field label="Empresa" value={lead.empresa || "—"} />
                <Field label="Metros" value={lead.metros} />
                <Field label="Presupuesto declarado" value={lead.presupuesto} />
                <Field label="Dirección" value={lead.direccion} />
                <Field
                  label="Fecha estimada de inicio"
                  value={lead.fecha_estimada ?? "—"}
                />
                <Field
                  label="Servicios"
                  value={lead.servicios.join(", ") || "—"}
                />
              </div>
              {lead.comentarios && (
                <div className="mt-3 text-sm bg-brand-dark/[0.02] rounded-xl p-5">
                  <p className="text-brand-muted mb-1">
                    Comentarios del prospecto
                  </p>
                  <p className="text-brand-dark">{lead.comentarios}</p>
                </div>
              )}
            </div>

            {/* Notas */}
            <div>
              <h3 className="font-semibold text-brand-dark mb-3">
                Notas internas
              </h3>
              <div className="flex gap-2 mb-4">
                <input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Agregar una nota de seguimiento..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-brand-dark/15 text-sm outline-none focus:border-brand-dark"
                  onKeyDown={(e) => e.key === "Enter" && handleSaveNote()}
                />
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="px-4 py-2.5 rounded-xl bg-brand-dark text-brand-cream text-sm font-medium disabled:opacity-60">
                  Agregar
                </button>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {notes === null && (
                  <p className="text-brand-muted text-sm">Cargando notas…</p>
                )}
                {notes?.length === 0 && (
                  <p className="text-brand-muted text-sm">Sin notas todavía.</p>
                )}
                {notes?.map((n) => (
                  <div
                    key={n.id}
                    className="text-sm bg-brand-dark/[0.02] rounded-lg px-4 py-2.5">
                    <p className="text-brand-dark">{n.note}</p>
                    <p className="text-brand-muted text-xs mt-1">
                      {n.author} ·{" "}
                      {new Date(n.created_at).toLocaleString("es-MX")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Status */}
            <div className="bg-brand-dark/[0.02] rounded-xl p-5">
              <label className="block text-sm font-medium text-brand-dark mb-2">
                Status de la oportunidad
              </label>
              <select
                value={lead.status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as LeadStatus)
                }
                className="w-full px-3 py-2.5 rounded-lg border border-brand-dark/15 text-sm outline-none focus:border-brand-dark bg-white">
                {LEAD_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {LEAD_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* Costo */}
            <div className="bg-brand-dark/[0.02] rounded-xl p-5">
              <label className="block text-sm font-medium text-brand-dark mb-1">
                Costo estimado
              </label>
              <p className="text-xs text-brand-muted mb-3">
                Sugerido: {formatMXN(breakdown.suggestedCost)} (
                {breakdown.metros} m² × {formatMXN(breakdown.baseRate)}
                {breakdown.serviceAdjustmentPct > 0
                  ? ` + ${Math.round(breakdown.serviceAdjustmentPct * 100)}% servicios`
                  : ""}
                )
              </p>
              <div className="flex flex-col gap-2">
                <input
                  value={costInput}
                  onChange={(e) => setCostInput(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-brand-dark/15 text-sm outline-none focus:border-brand-dark"
                />
                <button
                  onClick={handleSaveCost}
                  className="px-3 py-2.5 rounded-lg bg-brand-dark text-brand-cream text-sm">
                  Guardar
                </button>
              </div>
              {lead.costo_ajustado_manualmente && (
                <p className="text-xs text-brand-accent mt-2">
                  ✎ Ajustado manualmente
                </p>
              )}
            </div>

            {/* Asignación y seguimiento */}
            <div className="bg-brand-dark/[0.02] rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">
                  Asignado a
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="Nombre del responsable"
                    className="flex-1 px-3 py-2.5 rounded-lg border border-brand-dark/15 text-sm outline-none focus:border-brand-dark"
                  />
                  <button
                    onClick={handleSaveAssignee}
                    className="px-3 py-2.5 rounded-lg bg-brand-dark/10 text-brand-dark text-sm">
                    Guardar
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">
                  Próximo seguimiento
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="date"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-lg border border-brand-dark/15 text-sm outline-none focus:border-brand-dark"
                  />
                  <button
                    onClick={handleSaveFollowUp}
                    className="px-3 py-2.5 rounded-lg bg-brand-dark/10 text-brand-dark text-sm">
                    Guardar
                  </button>
                </div>
              </div>
            </div>

            {/* Conversión a proyecto */}
            <div className="bg-brand-dark rounded-xl p-5 text-center">
              {convertedId ? (
                <a
                  href="/admin/proyectos"
                  className="text-brand-cream text-sm font-medium underline">
                  Ver proyecto creado →
                </a>
              ) : (
                <>
                  <p className="text-brand-cream text-sm mb-3">
                    ¿La oportunidad aceptó la propuesta?
                  </p>
                  <button
                    onClick={handleConvert}
                    disabled={converting}
                    className="w-full py-3 bg-brand-cream text-brand-dark rounded-lg font-medium hover:bg-brand-warm transition-colors disabled:opacity-60">
                    {converting ? "Convirtiendo..." : "Convertir en proyecto"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-brand-muted text-xs">{label}</p>
      <p className="text-brand-dark font-medium">{value}</p>
    </div>
  );
}

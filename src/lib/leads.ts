import { supabase } from "./supabase";
import { estimateSuggestedCost } from "./costEstimator";

export type LeadStatus =
  | "nuevo"
  | "contactado"
  | "negociacion"
  | "cotizacion_enviada"
  | "aceptado"
  | "rechazado"
  | "perdido"
  | "convertido";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  negociacion: "En negociación",
  cotizacion_enviada: "Cotización enviada",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
  perdido: "Perdido / sin respuesta",
  convertido: "Convertido a proyecto",
};

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  "nuevo",
  "contactado",
  "negociacion",
  "cotizacion_enviada",
  "aceptado",
  "rechazado",
  "perdido",
  "convertido",
];

export interface Lead {
  id: string;
  created_at: string;
  nombre: string;
  empresa: string | null;
  email: string;
  telefono: string;
  tipo_proyecto: string;
  metros: string;
  presupuesto: string;
  ciudad: string;
  direccion: string;
  fecha_estimada: string | null;
  servicios: string[];
  comentarios: string | null;
  status: LeadStatus;
  costo_sugerido: number | null;
  costo_final: number | null;
  costo_ajustado_manualmente: boolean;
  asignado_a: string | null;
  proximo_seguimiento: string | null;
  tags: string[];
  converted_to_project_id: string | null;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  author: string;
  note: string;
  created_at: string;
}

export interface LeadStatusHistoryEntry {
  id: string;
  lead_id: string;
  status: LeadStatus;
  changed_at: string;
  note: string | null;
}

export interface NewLeadInput {
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  tipoProyecto: string;
  metros: string;
  presupuesto: string;
  ciudad: string;
  direccion: string;
  fecha: string;
  servicios: string[];
  comentarios: string;
}

/** Inserta un nuevo lead público (llamado desde el wizard de cotización, rol anon). */
export async function createLead(input: NewLeadInput): Promise<{ ok: boolean; error?: string }> {
  const { suggestedCost } = estimateSuggestedCost({
    metros: input.metros,
    tipoProyecto: input.tipoProyecto,
    servicios: input.servicios,
  });

  const { error } = await supabase.from("leads").insert({
    nombre: input.nombre,
    empresa: input.empresa || null,
    email: input.email,
    telefono: input.telefono,
    tipo_proyecto: input.tipoProyecto,
    metros: input.metros,
    presupuesto: input.presupuesto,
    ciudad: input.ciudad,
    direccion: input.direccion,
    fecha_estimada: input.fecha || null,
    servicios: input.servicios,
    comentarios: input.comentarios || null,
    costo_sugerido: suggestedCost,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Lead[];
}

export async function fetchLeadNotes(leadId: string): Promise<LeadNote[]> {
  const { data, error } = await supabase
    .from("lead_notes")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as LeadNote[];
}

export async function fetchLeadStatusHistory(leadId: string): Promise<LeadStatusHistoryEntry[]> {
  const { data, error } = await supabase
    .from("lead_status_history")
    .select("*")
    .eq("lead_id", leadId)
    .order("changed_at", { ascending: false });
  if (error) throw error;
  return data as LeadStatusHistoryEntry[];
}

export async function addLeadNote(leadId: string, note: string, author = "Equipo"): Promise<void> {
  const { error } = await supabase.from("lead_notes").insert({ lead_id: leadId, note, author });
  if (error) throw error;
}

export async function updateLeadStatus(leadId: string, status: LeadStatus, note?: string): Promise<void> {
  const { error: updateError } = await supabase.from("leads").update({ status }).eq("id", leadId);
  if (updateError) throw updateError;

  const { error: historyError } = await supabase
    .from("lead_status_history")
    .insert({ lead_id: leadId, status, note: note ?? null });
  if (historyError) throw historyError;
}

export async function updateLeadCost(leadId: string, costoFinal: number): Promise<void> {
  const { error } = await supabase
    .from("leads")
    .update({ costo_final: costoFinal, costo_ajustado_manualmente: true })
    .eq("id", leadId);
  if (error) throw error;
}

export async function updateLeadFollowUp(leadId: string, fecha: string | null): Promise<void> {
  const { error } = await supabase.from("leads").update({ proximo_seguimiento: fecha }).eq("id", leadId);
  if (error) throw error;
}

export async function updateLeadAssignee(leadId: string, asignadoA: string): Promise<void> {
  const { error } = await supabase.from("leads").update({ asignado_a: asignadoA || null }).eq("id", leadId);
  if (error) throw error;
}

/** Convierte un lead aceptado en un proyecto y marca el lead como "convertido". */
export async function convertLeadToProject(lead: Lead): Promise<string> {
  const costoAcordado = lead.costo_final ?? lead.costo_sugerido ?? 0;

  const { data, error } = await supabase
    .from("projects")
    .insert({
      lead_id: lead.id,
      nombre_cliente: lead.nombre,
      email: lead.email,
      telefono: lead.telefono,
      tipo_proyecto: lead.tipo_proyecto,
      ciudad: lead.ciudad,
      direccion: lead.direccion,
      servicios: lead.servicios,
      costo_original: costoAcordado,
      costo_actual: costoAcordado,
      fecha_entrega_estimada: lead.fecha_estimada,
      responsable: lead.asignado_a,
    })
    .select("id")
    .single();

  if (error) throw error;

  await supabase.from("leads").update({ status: "convertido", converted_to_project_id: data.id }).eq("id", lead.id);
  await supabase
    .from("lead_status_history")
    .insert({ lead_id: lead.id, status: "convertido", note: "Convertido a proyecto" });

  return data.id as string;
}

export interface LeadStats {
  total: number;
  byStatus: Record<string, number>;
  byTipoProyecto: Record<string, number>;
  byCiudad: Record<string, number>;
  pipelineValue: number;
  conversionRate: number;
  last8Weeks: { label: string; count: number }[];
}

export function computeLeadStats(leads: Lead[]): LeadStats {
  const byStatus: Record<string, number> = {};
  const byTipoProyecto: Record<string, number> = {};
  const byCiudad: Record<string, number> = {};
  let pipelineValue = 0;

  for (const lead of leads) {
    byStatus[lead.status] = (byStatus[lead.status] ?? 0) + 1;
    byTipoProyecto[lead.tipo_proyecto] = (byTipoProyecto[lead.tipo_proyecto] ?? 0) + 1;
    byCiudad[lead.ciudad] = (byCiudad[lead.ciudad] ?? 0) + 1;
    if (!["rechazado", "perdido", "convertido"].includes(lead.status)) {
      pipelineValue += lead.costo_final ?? lead.costo_sugerido ?? 0;
    }
  }

  const totalDecided = (byStatus.aceptado ?? 0) + (byStatus.convertido ?? 0) + (byStatus.rechazado ?? 0) + (byStatus.perdido ?? 0);
  const totalWon = (byStatus.aceptado ?? 0) + (byStatus.convertido ?? 0);
  const conversionRate = totalDecided > 0 ? Math.round((totalWon / totalDecided) * 100) : 0;

  // Últimas 8 semanas
  const now = new Date();
  const weeks: { label: string; start: Date }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(now.getDate() - i * 7);
    weeks.push({ label: `${start.getDate()}/${start.getMonth() + 1}`, start });
  }
  const last8Weeks = weeks.map((w, i) => {
    const end = i < weeks.length - 1 ? weeks[i + 1].start : new Date(now.getTime() + 86400000);
    const count = leads.filter((l) => {
      const created = new Date(l.created_at);
      return created >= w.start && created < end;
    }).length;
    return { label: w.label, count };
  });

  return {
    total: leads.length,
    byStatus,
    byTipoProyecto,
    byCiudad,
    pipelineValue,
    conversionRate,
    last8Weeks,
  };
}

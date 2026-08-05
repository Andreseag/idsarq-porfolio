import { supabase } from "./supabase";

export type ProjectStatus =
  | "planeacion"
  | "diseno"
  | "permisos"
  | "construccion"
  | "acabados"
  | "entregado"
  | "pausado"
  | "cancelado";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planeacion: "Planeación",
  diseno: "Diseño",
  permisos: "Permisos",
  construccion: "Construcción",
  acabados: "Acabados",
  entregado: "Entregado",
  pausado: "Pausado",
  cancelado: "Cancelado",
};

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  "planeacion",
  "diseno",
  "permisos",
  "construccion",
  "acabados",
  "entregado",
];

export interface Project {
  id: string;
  created_at: string;
  lead_id: string | null;
  nombre_cliente: string;
  email: string | null;
  telefono: string | null;
  tipo_proyecto: string;
  ciudad: string | null;
  direccion: string | null;
  servicios: string[];
  costo_original: number;
  costo_actual: number;
  fecha_entrega_estimada: string | null;
  porcentaje_avance: number;
  responsable: string | null;
  status: ProjectStatus;
  proximo_hito: string | null;
}

export interface ProjectUpdateEntry {
  id: string;
  project_id: string;
  fecha: string;
  descripcion: string;
  porcentaje_avance: number | null;
  created_at: string;
}

export interface ProjectNote {
  id: string;
  project_id: string;
  author: string;
  note: string;
  created_at: string;
}

export interface ProjectReport {
  id: string;
  project_id: string;
  update_id: string | null;
  titulo: string;
  file_path: string;
  created_at: string;
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Project[];
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus,
): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);
  if (error) throw error;
}

export async function updateProjectFields(
  projectId: string,
  fields: Partial<
    Pick<
      Project,
      | "fecha_entrega_estimada"
      | "porcentaje_avance"
      | "responsable"
      | "proximo_hito"
      | "direccion"
      | "ciudad"
    >
  >,
): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update(fields)
    .eq("id", projectId);
  if (error) throw error;
}

export async function updateProjectCost(
  projectId: string,
  nuevoCosto: number,
  motivo: string,
): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update({ costo_actual: nuevoCosto })
    .eq("id", projectId);
  if (error) throw error;
  const { error: historyError } = await supabase
    .from("project_cost_history")
    .insert({ project_id: projectId, costo: nuevoCosto, motivo });
  if (historyError) throw historyError;
}

export async function fetchProjectCostHistory(projectId: string) {
  const { data, error } = await supabase
    .from("project_cost_history")
    .select("*")
    .eq("project_id", projectId)
    .order("changed_at", { ascending: false });
  if (error) throw error;
  return data as {
    id: string;
    project_id: string;
    costo: number;
    motivo: string | null;
    changed_at: string;
  }[];
}

export async function fetchProjectNotes(
  projectId: string,
): Promise<ProjectNote[]> {
  const { data, error } = await supabase
    .from("project_notes")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ProjectNote[];
}

export async function addProjectNote(
  projectId: string,
  note: string,
  author = "Equipo",
): Promise<void> {
  const { error } = await supabase
    .from("project_notes")
    .insert({ project_id: projectId, note, author });
  if (error) throw error;
}

export async function fetchProjectUpdates(
  projectId: string,
): Promise<ProjectUpdateEntry[]> {
  const { data, error } = await supabase
    .from("project_updates")
    .select("*")
    .eq("project_id", projectId)
    .order("fecha", { ascending: false });
  if (error) throw error;
  return data as ProjectUpdateEntry[];
}

export async function addProjectUpdate(
  projectId: string,
  descripcion: string,
  porcentajeAvance?: number,
): Promise<ProjectUpdateEntry> {
  const { data, error } = await supabase
    .from("project_updates")
    .insert({
      project_id: projectId,
      descripcion,
      porcentaje_avance: porcentajeAvance ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;

  if (typeof porcentajeAvance === "number") {
    await supabase
      .from("projects")
      .update({ porcentaje_avance: porcentajeAvance })
      .eq("id", projectId);
  }

  return data as ProjectUpdateEntry;
}

export async function fetchProjectReports(
  projectId: string,
): Promise<ProjectReport[]> {
  const { data, error } = await supabase
    .from("project_reports")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ProjectReport[];
}

/** Sube el PDF generado al bucket privado y guarda su metadata. */
export async function saveProjectReport(
  projectId: string,
  titulo: string,
  pdfBlob: Blob,
  updateId?: string,
): Promise<ProjectReport> {
  const filePath = `${projectId}/${Date.now()}-${titulo.replace(/\s+/g, "-").toLowerCase()}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("project-reports")
    .upload(filePath, pdfBlob, {
      contentType: "application/pdf",
    });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("project_reports")
    .insert({
      project_id: projectId,
      update_id: updateId ?? null,
      titulo,
      file_path: filePath,
    })
    .select("*")
    .single();
  if (error) throw error;

  return data as ProjectReport;
}

/** Genera una URL firmada temporal para descargar un reporte del bucket privado. */
export async function getReportDownloadUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("project-reports")
    .createSignedUrl(filePath, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

export interface ProjectStats {
  total: number;
  activos: number;
  byStatus: Record<string, number>;
  valorActivo: number;
  avanceProm: number;
  proximasEntregas: Project[];
  entregasAtrasadas: Project[];
}

export function computeProjectStats(projects: Project[]): ProjectStats {
  const byStatus: Record<string, number> = {};
  let valorActivo = 0;
  let avanceSum = 0;
  const activosList: Project[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30 = new Date(today);
  in30.setDate(today.getDate() + 30);

  const proximasEntregas: Project[] = [];
  const entregasAtrasadas: Project[] = [];

  for (const p of projects) {
    byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    const isActive = !["entregado", "cancelado"].includes(p.status);

    if (isActive) {
      valorActivo += p.costo_actual;
      avanceSum += p.porcentaje_avance;
      activosList.push(p);

      if (p.fecha_entrega_estimada) {
        const fecha = new Date(p.fecha_entrega_estimada + "T00:00:00");
        if (fecha < today) entregasAtrasadas.push(p);
        else if (fecha <= in30) proximasEntregas.push(p);
      }
    }
  }

  return {
    total: projects.length,
    activos: activosList.length,
    byStatus,
    valorActivo,
    avanceProm:
      activosList.length > 0 ? Math.round(avanceSum / activosList.length) : 0,
    proximasEntregas: proximasEntregas.sort((a, b) =>
      (a.fecha_entrega_estimada ?? "").localeCompare(
        b.fecha_entrega_estimada ?? "",
      ),
    ),
    entregasAtrasadas,
  };
}

import jsPDF from "jspdf";
import type { Project } from "./projects";
import { formatMXN } from "./costEstimator";
import { PROJECT_STATUS_LABELS } from "./projects";

export function generateProgressReportPdf(
  project: Project,
  entry: { fecha: string; descripcion: string; porcentaje_avance: number | null }
): Blob {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Estudio K", margin, y);
  y += 18;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Reporte de avance de proyecto", margin, y);
  y += 30;

  doc.setDrawColor(200);
  doc.line(margin, y, 595 - margin, y);
  y += 24;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(project.nombre_cliente, margin, y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const info = [
    `Tipo de proyecto: ${project.tipo_proyecto}`,
    `Ubicación: ${[project.ciudad, project.direccion].filter(Boolean).join(" — ") || "—"}`,
    `Estado actual: ${PROJECT_STATUS_LABELS[project.status]}`,
    `Responsable: ${project.responsable || "—"}`,
    `Costo acordado: ${formatMXN(project.costo_actual)}`,
    `Fecha estimada de entrega: ${project.fecha_entrega_estimada ?? "—"}`,
  ];
  info.forEach((line) => {
    doc.text(line, margin, y);
    y += 16;
  });

  y += 14;
  doc.setDrawColor(230);
  doc.line(margin, y, 595 - margin, y);
  y += 24;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Corte de avance — ${new Date(entry.fecha + "T00:00:00").toLocaleDateString("es-MX")}`, margin, y);
  y += 20;

  if (entry.porcentaje_avance != null) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Avance general: ${entry.porcentaje_avance}%`, margin, y);
    y += 10;
    // barra de progreso simple
    const barWidth = 595 - margin * 2;
    const barY = y + 8;
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, barY, barWidth, 10, "F");
    doc.setFillColor(45, 56, 54);
    doc.rect(margin, barY, (barWidth * entry.porcentaje_avance) / 100, 10, "F");
    y = barY + 30;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const descLines = doc.splitTextToSize(entry.descripcion, 595 - margin * 2);
  doc.text(descLines, margin, y);
  y += descLines.length * 14 + 30;

  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(
    `Generado automáticamente el ${new Date().toLocaleString("es-MX")} — Estudio K`,
    margin,
    792 - margin / 2
  );

  return doc.output("blob");
}

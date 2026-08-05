export interface QuoteFormData {
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

// Configura estas variables en tu archivo .env (ver .env.example)
const SHEETS_WEBHOOK_URL = import.meta.env.PUBLIC_SHEETS_WEBHOOK_URL as string | undefined;
// Número de WhatsApp de la empresa en formato internacional, SIN "+", ej: 5215512345678
const COMPANY_WHATSAPP_NUMBER = import.meta.env.PUBLIC_COMPANY_WHATSAPP_NUMBER as string | undefined;

/**
 * Envía los datos de la cotización a un Google Apps Script Web App
 * que los agrega como una nueva fila en un Google Sheet.
 * Ver instrucciones de configuración en README.md.
 */
export async function saveQuoteToSheet(data: QuoteFormData): Promise<{ ok: boolean; error?: string }> {
  if (!SHEETS_WEBHOOK_URL) {
    return { ok: false, error: "PUBLIC_SHEETS_WEBHOOK_URL no está configurado." };
  }

  try {
    const res = await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST",
      // text/plain evita el preflight CORS que Apps Script no maneja bien
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        ...data,
        servicios: data.servicios.join(", "),
        fechaEnvio: new Date().toISOString(),
      }),
    });

    if (!res.ok) return { ok: false, error: `El servidor de hojas de cálculo respondió ${res.status}.` };

    const json = await res.json().catch(() => null);
    if (json && json.result === "error") return { ok: false, error: json.message ?? "Error al guardar." };

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error de red desconocido." };
  }
}

export function buildWhatsAppMessage(data: QuoteFormData): string {
  const lines = [
    "📐 *Nueva solicitud de cotización — Estudio K*",
    "",
    `*Nombre:* ${data.nombre}`,
    data.empresa ? `*Empresa:* ${data.empresa}` : null,
    `*Email:* ${data.email}`,
    `*Teléfono:* ${data.telefono}`,
    `*Tipo de proyecto:* ${data.tipoProyecto}`,
    `*Metros:* ${data.metros}`,
    `*Presupuesto:* ${data.presupuesto}`,
    `*Ciudad:* ${data.ciudad}`,
    `*Dirección:* ${data.direccion}`,
    `*Fecha estimada de inicio:* ${data.fecha}`,
    `*Servicios:* ${data.servicios.join(", ")}`,
    data.comentarios ? `*Comentarios:* ${data.comentarios}` : null,
  ].filter((l): l is string => Boolean(l));

  return lines.join("\n");
}

/**
 * Abre WhatsApp (app o web) con un mensaje precargado dirigido al número
 * de la empresa, para que el equipo reciba la notificación de la nueva solicitud.
 * Requiere un gesto del usuario (click) para no ser bloqueado como pop-up.
 */
export function openWhatsAppNotification(data: QuoteFormData): boolean {
  if (!COMPANY_WHATSAPP_NUMBER) return false;
  const text = encodeURIComponent(buildWhatsAppMessage(data));
  const url = `https://wa.me/${COMPANY_WHATSAPP_NUMBER}?text=${text}`;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

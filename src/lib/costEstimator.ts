// Tarifas base por m² según tipo de proyecto (MXN). Ajustables a tu mercado real.
const BASE_RATE_PER_M2: Record<string, number> = {
  Casa: 12000,
  Departamento: 14000,
  Oficina: 10000,
  "Local comercial": 9000,
  Remodelación: 6000,
  Interiorismo: 3500,
  Otro: 8000,
};

// Ajuste adicional (%) según cada servicio solicitado
const SERVICE_MULTIPLIER: Record<string, number> = {
  "Diseño arquitectónico": 0,
  Planos: 0.05,
  "Modelado 3D": 0.08,
  Renderizados: 0.06,
  "Dirección de obra": 0.15,
  Construcción: 0.4,
  Remodelación: 0.1,
  Paisajismo: 0.07,
};

/** Extrae el primer número (m²) que aparezca en un texto libre como "250 m2" o "~180". */
function parseMetros(metros: string): number {
  const match = metros.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}

export interface CostBreakdown {
  metros: number;
  baseRate: number;
  serviceAdjustmentPct: number;
  suggestedCost: number;
}

export function estimateSuggestedCost(data: {
  metros: string;
  tipoProyecto: string;
  servicios: string[];
}): CostBreakdown {
  const metros = parseMetros(data.metros);
  const baseRate = BASE_RATE_PER_M2[data.tipoProyecto] ?? BASE_RATE_PER_M2.Otro;
  const serviceAdjustmentPct = data.servicios.reduce(
    (sum, s) => sum + (SERVICE_MULTIPLIER[s] ?? 0),
    0
  );
  const suggestedCost = Math.round(metros * baseRate * (1 + serviceAdjustmentPct));

  return { metros, baseRate, serviceAdjustmentPct, suggestedCost };
}

export function formatMXN(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(
    value
  );
}

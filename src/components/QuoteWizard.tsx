import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FormData {
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

const emptyForm: FormData = {
  nombre: "",
  empresa: "",
  email: "",
  telefono: "",
  tipoProyecto: "",
  metros: "",
  presupuesto: "",
  ciudad: "",
  direccion: "",
  fecha: "",
  servicios: [],
  comentarios: "",
};

const projectTypes = [
  "Casa",
  "Apartamento",
  "Oficina",
  "Local comercial",
  "Remodelación",
  "Interiorismo",
  "Otro",
];
const servicesList = [
  "Diseño arquitectónico",
  "Planos",
  "Modelado 3D",
  "Renderizados",
  "Dirección de obra",
  "Construcción",
  "Remodelación",
  "Paisajismo",
];
const presupuestoOptions = [
  { value: "<50M", label: "Menos de $50,000,000 COP" },
  { value: "50M-150M", label: "$50,000,000 - $150,000,000 COP" },
  { value: "150M-400M", label: "$150,000,000 - $400,000,000 COP" },
  { value: "400M-800M", label: "$400,000,000 - $800,000,000 COP" },
  { value: "800M+", label: "Más de $800,000,000 COP" },
];

const steps = [
  { num: 1, label: "Datos" },
  { num: 2, label: "Tipo" },
  { num: 3, label: "Info" },
  { num: 4, label: "Servicios" },
  { num: 5, label: "Archivos" },
  { num: 6, label: "Notas" },
  { num: 7, label: "Resumen" },
];

type Errors = Partial<Record<keyof FormData, string>>;

// --- Validation helpers -----------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Acepta dígitos, espacios, paréntesis, +, - y exige mínimo 8 dígitos.
// Celulares en Colombia: 10 dígitos (ej. 300 123 4567), con o sin +57.
const PHONE_RE = /^[+\d][\d\s()-]{7,}$/;

function validateStep(step: number, data: FormData): Errors {
  const errors: Errors = {};

  if (step === 1) {
    if (!data.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
    else if (data.nombre.trim().length < 3)
      errors.nombre = "Ingresa al menos 3 caracteres.";

    if (!data.email.trim()) errors.email = "El email es obligatorio.";
    else if (!EMAIL_RE.test(data.email.trim()))
      errors.email = "Ingresa un email válido.";

    if (!data.telefono.trim()) errors.telefono = "El teléfono es obligatorio.";
    else if (
      !PHONE_RE.test(data.telefono.trim()) ||
      data.telefono.replace(/\D/g, "").length < 8
    )
      errors.telefono = "Ingresa un teléfono válido (mínimo 8 dígitos).";
  }

  if (step === 2) {
    if (!data.tipoProyecto)
      errors.tipoProyecto = "Selecciona el tipo de proyecto.";
  }

  if (step === 3) {
    if (!data.metros.trim())
      errors.metros = "Indica los metros cuadrados aproximados.";
    else if (!/\d/.test(data.metros))
      errors.metros = "Incluye un valor numérico, ej. 250 m2.";

    if (!data.presupuesto)
      errors.presupuesto = "Selecciona un rango de presupuesto.";

    if (!data.ciudad.trim()) errors.ciudad = "La ciudad es obligatoria.";
    else if (data.ciudad.trim().length < 2)
      errors.ciudad = "Ingresa una ciudad válida.";

    if (!data.direccion.trim())
      errors.direccion = "La dirección es obligatoria.";
    else if (data.direccion.trim().length < 5)
      errors.direccion = "Ingresa una dirección más completa.";

    if (!data.fecha) errors.fecha = "Selecciona una fecha estimada de inicio.";
    else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const chosen = new Date(data.fecha + "T00:00:00");
      if (chosen < today) errors.fecha = "La fecha no puede ser en el pasado.";
    }
  }

  if (step === 4) {
    if (data.servicios.length === 0)
      errors.servicios = "Selecciona al menos un servicio.";
  }

  // Steps 5 (archivos) y 6 (comentarios) son opcionales: sin validación obligatoria.

  return errors;
}

function allRequiredErrors(data: FormData): Errors {
  return {
    ...validateStep(1, data),
    ...validateStep(2, data),
    ...validateStep(3, data),
    ...validateStep(4, data),
  };
}

// --- Small presentational helpers --------------------------------------

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-500">{message}</p>;
}

const inputBase =
  "w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all bg-brand-dark/[0.02]";
const inputOk =
  "border-brand-dark/15 focus:border-brand-dark focus:ring-brand-dark/10";
const inputError = "border-red-400 focus:border-red-500 focus:ring-red-100";

export default function QuoteWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormData, boolean>>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // ✅ Los errores se derivan de formData en cada render, en vez de vivir en su
  // propio estado. Así se limpian solos apenas el campo vuelve a ser válido,
  // sin depender de un onBlur que los recalcule.
  const errors = useMemo(() => allRequiredErrors(formData), [formData]);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const markTouched = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const toggleService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      servicios: prev.servicios.includes(service)
        ? prev.servicios.filter((s) => s !== service)
        : [...prev.servicios, service],
    }));
    setTouched((prev) => ({ ...prev, servicios: true }));
  };

  const goNext = () => {
    const stepErrors = validateStep(step, formData);
    if (Object.keys(stepErrors).length > 0) {
      // Marca como "touched" solo los campos de este paso, para mostrar sus errores
      setTouched((prev) => {
        const next = { ...prev };
        (Object.keys(stepErrors) as (keyof FormData)[]).forEach(
          (k) => (next[k] = true),
        );
        return next;
      });
      return;
    }
    setStep((s) => Math.min(7, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = () => {
    setSubmitAttempted(true);
    const finalErrors = allRequiredErrors(formData);
    if (Object.keys(finalErrors).length > 0) {
      setTouched((prev) => {
        const next = { ...prev };
        (Object.keys(finalErrors) as (keyof FormData)[]).forEach(
          (k) => (next[k] = true),
        );
        return next;
      });
      // Send the user back to the first step that has a problem
      if (finalErrors.nombre || finalErrors.email || finalErrors.telefono)
        setStep(1);
      else if (finalErrors.tipoProyecto) setStep(2);
      else if (
        finalErrors.metros ||
        finalErrors.presupuesto ||
        finalErrors.ciudad ||
        finalErrors.direccion ||
        finalErrors.fecha
      )
        setStep(3);
      else if (finalErrors.servicios) setStep(4);
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubmitAttempted(false);
      setStep(1);
      setFormData(emptyForm);
      setTouched({});
    }, 4000);
  };

  const err = (field: keyof FormData) =>
    touched[field] ? errors[field] : undefined;
  const cls = (field: keyof FormData) =>
    `${inputBase} ${err(field) ? inputError : inputOk}`;
  const presupuestoLabel = presupuestoOptions.find(
    (o) => o.value === formData.presupuesto,
  )?.label;

  return (
    <section id="cotizacion" className="py-24 md:py-32 bg-brand-dark/[0.02]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-brand-muted text-sm font-medium tracking-[0.2em] uppercase mb-4 block">
            Cotización
          </span>
          <h2 className="text-4xl md:text-5xl font-light text-brand-dark mb-6">
            Solicita tu <span className="font-semibold">cotización</span>
          </h2>
          <p className="text-brand-muted max-w-xl mx-auto">
            Completa el siguiente formulario y nos pondremos en contacto contigo
            en menos de 24 horas.
          </p>
        </div>

        <div className="flex items-center justify-between mb-12 px-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step >= s.num
                    ? "bg-brand-dark text-brand-cream"
                    : "bg-brand-dark/10 text-brand-muted"
                }`}>
                {s.num}
              </div>
              <span
                className={`hidden md:block ml-2 text-xs font-medium transition-colors ${step >= s.num ? "text-brand-dark" : "text-brand-muted"}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-px mx-3 transition-colors ${step > s.num ? "bg-brand-dark" : "bg-brand-dark/10"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-brand-dark/5 border border-brand-dark/5 p-8 md:p-12">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="submitted"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-brand-dark mb-3">
                  ¡Solicitud enviada!
                </h3>
                <p className="text-brand-muted">
                  Nuestro equipo revisará tu solicitud y te contactará pronto.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}>
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-brand-dark mb-6">
                      Datos Personales
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">
                          Nombre completo *
                        </label>
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) =>
                            updateField("nombre", e.target.value)
                          }
                          onBlur={() => markTouched("nombre")}
                          className={cls("nombre")}
                          placeholder="Tu nombre"
                        />
                        <FieldError message={err("nombre")} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">
                          Empresa (opcional)
                        </label>
                        <input
                          type="text"
                          value={formData.empresa}
                          onChange={(e) =>
                            updateField("empresa", e.target.value)
                          }
                          className={`${inputBase} ${inputOk}`}
                          placeholder="Nombre de la empresa"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          onBlur={() => markTouched("email")}
                          className={cls("email")}
                          placeholder="correo@ejemplo.com"
                        />
                        <FieldError message={err("email")} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          value={formData.telefono}
                          onChange={(e) =>
                            updateField("telefono", e.target.value)
                          }
                          onBlur={() => markTouched("telefono")}
                          className={cls("telefono")}
                          placeholder="+57 300 123 4567"
                        />
                        <FieldError message={err("telefono")} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h3 className="text-xl font-semibold text-brand-dark mb-6">
                      Tipo de Proyecto
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {projectTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            updateField("tipoProyecto", type);
                            markTouched("tipoProyecto");
                          }}
                          className={`p-6 rounded-xl border-2 text-center transition-all duration-300 ${
                            formData.tipoProyecto === type
                              ? "border-brand-dark bg-brand-dark text-brand-cream"
                              : "border-brand-dark/10 hover:border-brand-dark/30 text-brand-dark"
                          }`}>
                          <div className="text-2xl mb-2">
                            {type === "Casa"
                              ? "🏡"
                              : type === "Apartamento"
                                ? "🏢"
                                : type === "Oficina"
                                  ? "💼"
                                  : type === "Local comercial"
                                    ? "🏪"
                                    : type === "Remodelación"
                                      ? "🔨"
                                      : type === "Interiorismo"
                                        ? "🎨"
                                        : "📋"}
                          </div>
                          <span className="text-sm font-medium">{type}</span>
                        </button>
                      ))}
                    </div>
                    <FieldError message={err("tipoProyecto")} />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-brand-dark mb-6">
                      Información del Proyecto
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">
                          Metros cuadrados aprox. *
                        </label>
                        <input
                          type="text"
                          value={formData.metros}
                          onChange={(e) =>
                            updateField("metros", e.target.value)
                          }
                          onBlur={() => markTouched("metros")}
                          className={cls("metros")}
                          placeholder="Ej: 250 m2"
                        />
                        <FieldError message={err("metros")} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">
                          Presupuesto estimado *
                        </label>
                        <select
                          value={formData.presupuesto}
                          onChange={(e) =>
                            updateField("presupuesto", e.target.value)
                          }
                          onBlur={() => markTouched("presupuesto")}
                          className={cls("presupuesto")}>
                          <option value="">Seleccionar rango</option>
                          {presupuestoOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <FieldError message={err("presupuesto")} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          value={formData.ciudad}
                          onChange={(e) =>
                            updateField("ciudad", e.target.value)
                          }
                          onBlur={() => markTouched("ciudad")}
                          className={cls("ciudad")}
                          placeholder="Ej: Bogotá, Medellín, Cali"
                        />
                        <FieldError message={err("ciudad")} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">
                          Dirección *
                        </label>
                        <input
                          type="text"
                          value={formData.direccion}
                          onChange={(e) =>
                            updateField("direccion", e.target.value)
                          }
                          onBlur={() => markTouched("direccion")}
                          className={cls("direccion")}
                          placeholder="Dirección del proyecto"
                        />
                        <FieldError message={err("direccion")} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-brand-dark mb-2">
                          Fecha estimada de inicio *
                        </label>
                        <input
                          type="date"
                          value={formData.fecha}
                          onChange={(e) => updateField("fecha", e.target.value)}
                          onBlur={() => markTouched("fecha")}
                          className={cls("fecha")}
                        />
                        <FieldError message={err("fecha")} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h3 className="text-xl font-semibold text-brand-dark mb-6">
                      Servicios Requeridos
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {servicesList.map((service) => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => toggleService(service)}
                          className={`flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all duration-300 ${
                            formData.servicios.includes(service)
                              ? "border-brand-dark bg-brand-dark/[0.05]"
                              : "border-brand-dark/10 hover:border-brand-dark/30"
                          }`}>
                          <div
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                              formData.servicios.includes(service)
                                ? "border-brand-dark bg-brand-dark"
                                : "border-brand-dark/30"
                            }`}>
                            {formData.servicios.includes(service) && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-brand-dark">
                            {service}
                          </span>
                        </button>
                      ))}
                    </div>
                    <FieldError message={err("servicios")} />
                  </div>
                )}

                {step === 5 && (
                  <div>
                    <h3 className="text-xl font-semibold text-brand-dark mb-6">
                      Archivos de Referencia
                    </h3>
                    <div
                      className="border-2 border-dashed border-brand-dark/20 rounded-2xl p-12 text-center hover:border-brand-dark/40 transition-colors cursor-pointer bg-brand-dark/[0.02]"
                      onClick={() =>
                        alert(
                          "En una implementación real, aquí se abriría el selector de archivos.",
                        )
                      }>
                      <div className="text-4xl mb-4">📎</div>
                      <p className="text-brand-dark font-medium mb-2">
                        Arrastra archivos aquí o haz clic para seleccionar
                      </p>
                      <p className="text-brand-muted text-sm">
                        PDF, DWG, JPG, PNG (máx. 50MB) — opcional
                      </p>
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div>
                    <h3 className="text-xl font-semibold text-brand-dark mb-6">
                      Comentarios Adicionales
                    </h3>
                    <textarea
                      value={formData.comentarios}
                      onChange={(e) =>
                        updateField("comentarios", e.target.value)
                      }
                      rows={6}
                      className={`${inputBase} ${inputOk} resize-none`}
                      placeholder="Cuéntanos más sobre tu visión, necesidades especiales, inspiraciones..."
                    />
                  </div>
                )}

                {step === 7 && (
                  <div>
                    <h3 className="text-xl font-semibold text-brand-dark mb-6">
                      Resumen de la Solicitud
                    </h3>
                    {submitAttempted && Object.keys(errors).length > 0 && (
                      <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                        Hay campos obligatorios incompletos. Te llevamos al paso
                        correspondiente para corregirlos.
                      </div>
                    )}
                    <div className="space-y-4 bg-brand-dark/[0.02] rounded-xl p-6">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-brand-muted">Nombre:</span>{" "}
                          <span className="text-brand-dark font-medium">
                            {formData.nombre || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-brand-muted">Email:</span>{" "}
                          <span className="text-brand-dark font-medium">
                            {formData.email || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-brand-muted">Teléfono:</span>{" "}
                          <span className="text-brand-dark font-medium">
                            {formData.telefono || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-brand-muted">Tipo:</span>{" "}
                          <span className="text-brand-dark font-medium">
                            {formData.tipoProyecto || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-brand-muted">Metros:</span>{" "}
                          <span className="text-brand-dark font-medium">
                            {formData.metros || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-brand-muted">Presupuesto:</span>{" "}
                          <span className="text-brand-dark font-medium">
                            {presupuestoLabel || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-brand-muted">Ubicación:</span>{" "}
                          <span className="text-brand-dark font-medium">
                            {formData.ciudad || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-brand-muted">Fecha:</span>{" "}
                          <span className="text-brand-dark font-medium">
                            {formData.fecha || "—"}
                          </span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-brand-dark/10">
                        <span className="text-brand-muted text-sm">
                          Servicios:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.servicios.length > 0 ? (
                            formData.servicios.map((s) => (
                              <span
                                key={s}
                                className="px-3 py-1 bg-brand-dark/10 text-brand-dark text-xs rounded-full font-medium">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-brand-muted text-sm">—</span>
                          )}
                        </div>
                      </div>
                      {formData.comentarios && (
                        <div className="pt-4 border-t border-brand-dark/10">
                          <span className="text-brand-muted text-sm">
                            Comentarios:
                          </span>
                          <p className="text-brand-dark text-sm mt-1">
                            {formData.comentarios}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-10 pt-6 border-t border-brand-dark/10">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={step === 1}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      step === 1
                        ? "text-brand-muted cursor-not-allowed"
                        : "text-brand-dark hover:bg-brand-dark/5"
                    }`}>
                    ← Anterior
                  </button>
                  {step < 7 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="px-8 py-3 bg-brand-dark text-brand-cream rounded-xl font-medium hover:bg-brand-primary transition-colors">
                      Siguiente →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-8 py-3 bg-brand-dark text-brand-cream rounded-xl font-medium hover:bg-brand-primary transition-colors">
                      Enviar solicitud
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

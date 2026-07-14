import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects, type Project } from "../data/projects";

const categories = ["Todos", "Residencial", "Comercial", "Interiorismo", "Remodelación"];

function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-brand-dark/95 backdrop-blur-xl overflow-y-auto"
    >
      <div className="min-h-screen">
        <div className="sticky top-0 z-10 bg-brand-dark/80 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-brand-cream">{project.name}</h2>
            <button onClick={onClose} className="text-brand-accent hover:text-brand-cream transition-colors p-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-12">
            <img
              src={project.gallery[activeImage]}
              alt={project.name}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-6 text-white/90 text-sm">
              <span><strong className="text-brand-cream">Cliente:</strong> {project.client}</span>
              <span><strong className="text-brand-cream">Año:</strong> {project.year}</span>
              <span><strong className="text-brand-cream">Ubicación:</strong> {project.location}</span>
              <span><strong className="text-brand-cream">Área:</strong> {project.area}</span>
            </div>
          </div>
          <div className="flex gap-3 mb-16 overflow-x-auto pb-2 scrollbar-hide">
            {project.gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all ${
                  activeImage === i ? "ring-2 ring-brand-cream" : "opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-semibold text-brand-cream mb-4">Descripción del Proyecto</h3>
              <p className="text-brand-accent leading-relaxed text-lg mb-8">{project.desc}</p>
              <h3 className="text-2xl font-semibold text-brand-cream mb-6">Proceso del Proyecto</h3>
              <div className="space-y-0">
                {project.timeline.map((stage, i) => (
                  <div key={i} className="flex gap-6 relative">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          stage.status === "completed"
                            ? "bg-emerald-400"
                            : stage.status === "active"
                              ? "bg-amber-400 animate-pulse"
                              : "bg-brand-muted"
                        }`}
                      />
                      {i < project.timeline.length - 1 && (
                        <div
                          className={`w-px flex-1 ${
                            stage.status === "completed" ? "bg-emerald-400/30" : "bg-brand-muted/20"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pb-8">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-brand-cream font-medium">{stage.stage}</span>
                        <span className="text-brand-muted text-sm">{stage.date}</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          stage.status === "completed"
                            ? "bg-emerald-400/20 text-emerald-300"
                            : stage.status === "active"
                              ? "bg-amber-400/20 text-amber-300"
                              : "bg-brand-muted/20 text-brand-muted"
                        }`}
                      >
                        {stage.status === "completed" ? "Completado" : stage.status === "active" ? "En progreso" : "Pendiente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h4 className="text-brand-cream font-semibold mb-4">Información General</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-brand-muted">Categoría</span><span className="text-brand-cream">{project.category}</span></div>
                  <div className="flex justify-between"><span className="text-brand-muted">Estado</span><span className="text-brand-cream">{project.status}</span></div>
                  <div className="flex justify-between"><span className="text-brand-muted">Superficie</span><span className="text-brand-cream">{project.area}</span></div>
                  <div className="flex justify-between"><span className="text-brand-muted">Año</span><span className="text-brand-cream">{project.year}</span></div>
                </div>
              </div>
              <a
                href="/#cotizacion"
                className="block text-center w-full py-4 bg-brand-cream text-brand-dark font-medium rounded-xl hover:bg-brand-warm transition-colors"
              >
                Solicitar información similar
              </a>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <img
              src={project.gallery[activeImage]}
              alt=""
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button className="absolute top-6 right-6 text-white/70 hover:text-white" onClick={() => setLightboxOpen(false)}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState("Todos");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filtered = filter === "Todos" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="proyectos" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-brand-muted text-sm font-medium tracking-[0.2em] uppercase mb-4 block">Portfolio</span>
          <h2 className="text-4xl md:text-5xl font-light text-brand-dark mb-6">
            Proyectos <span className="font-semibold">destacados</span>
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === cat
                  ? "bg-brand-dark text-brand-cream shadow-lg shadow-brand-dark/20"
                  : "bg-brand-dark/5 text-brand-dark hover:bg-brand-dark/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden img-zoom mb-5">
                  <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="text-brand-accent text-xs font-medium tracking-wider uppercase">{project.category}</span>
                    <h3 className="text-white text-xl font-semibold mt-1">{project.name}</h3>
                    <p className="text-white/70 text-sm mt-1">{project.location}</p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === "Completado"
                          ? "bg-emerald-500/90 text-white"
                          : project.status === "En construcción"
                            ? "bg-amber-500/90 text-white"
                            : "bg-blue-500/90 text-white"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="px-1">
                  <h3 className="text-lg font-semibold text-brand-dark group-hover:text-brand-primary transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-brand-muted">
                    <span>{project.year}</span>
                    <span className="w-1 h-1 rounded-full bg-brand-muted" />
                    <span>{project.area}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {selectedProject && <ProjectDetail project={selectedProject} onClose={() => setSelectedProject(null)} />}
        </AnimatePresence>
      </div>
    </section>
  );
}

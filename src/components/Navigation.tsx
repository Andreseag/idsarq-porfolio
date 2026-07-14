import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LogoSVG from "./LogoSVG";

const navItems = [
  { id: "inicio", label: "Inicio" },
  { id: "nosotros", label: "Nosotros" },
  { id: "servicios", label: "Servicios" },
  { id: "proyectos", label: "Proyectos" },
  { id: "cotizacion", label: "Cotización" },
  { id: "contacto", label: "Contacto" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");

  const isScrollingRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);

    // Espera al primer frame renderizado para capturar la posición exacta del navegador
    const checkInitialScroll = requestAnimationFrame(handleScroll);

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(checkInitialScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Retrasamos ligeramente o esperamos al siguiente tick para asegurar que el DOM está listo
    const timer = setTimeout(() => {
      const sections = navItems
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => !!el);

      if (sections.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          // Si el usuario clickeó en un botón, ignoramos los cambios temporales del observer
          if (isScrollingRef.current) return;

          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveSection(entry.target.id);
          });
        },
        {
          rootMargin: "-20% 0px -60% 0px", // Ajusta el área de detección a la parte superior/centro de la pantalla
          threshold: 0,
        },
      );

      sections.forEach((section) => observer.observe(section));

      return () => sections.forEach((section) => observer.unobserve(section));
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (id: string) => {
    if (window.location.pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      isScrollingRef.current = true;
      setActiveSection(id);
      setMobileOpen(false);

      element.scrollIntoView({ behavior: "smooth" });

      // Desbloqueamos el observer tras terminar la animación de scroll (~800ms)
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-dark shadow-lg" : "bg-transparent"
      }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="/" className="flex items-center gap-3 cursor-pointer">
            <LogoSVG className="w-9 h-9" />
            <div>
              <span className="text-brand-cream font-semibold text-[24px] tracking-wide">
                idsarq
              </span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 rounded-lg cursor-pointer ${
                  activeSection === item.id
                    ? "text-brand-cream bg-white/10"
                    : "text-brand-accent hover:text-brand-cream hover:bg-white/5"
                }`}>
                {item.label}
              </button>
            ))}
          </div>

          <button
            className="md:hidden text-brand-cream p-2 cursor-pointer transition-transform duration-300 hover:scale-110"
            onClick={() => setMobileOpen(!mobileOpen)}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t border-white/10">
            <div className="px-6 py-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === item.id
                      ? "text-brand-cream bg-white/10"
                      : "text-brand-accent hover:text-brand-cream hover:bg-white/5"
                  }`}>
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

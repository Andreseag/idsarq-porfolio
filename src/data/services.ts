export interface ServiceDetail {
  slug: string;
  icon: string;
  title: string;
  shortDesc: string;
  desc: string;
  image: string;
  gallery: string[];
  features: string[];
  process: { title: string; desc: string }[];
  benefits: string[];
  faq: { question: string; answer: string }[];
}

export const services: ServiceDetail[] = [
  {
    slug: "diseno-arquitectonico",
    icon: "🏛️",
    title: "Diseño Arquitectónico",
    shortDesc:
      "Conceptualización y desarrollo de proyectos arquitectónicos integrales, desde la idea inicial hasta la documentación constructiva.",
    desc: "Acompañamos cada proyecto desde el primer boceto hasta los planos ejecutivos, combinando funcionalidad, estética y viabilidad técnica. Nuestro equipo traduce las necesidades del cliente en espacios coherentes, sostenibles y preparados para construirse sin sorpresas en obra.",
    image:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80",
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&q=80",
    ],
    features: [
      "Conceptualización",
      "Planos ejecutivos",
      "Documentación técnica",
    ],
    process: [
      {
        title: "Levantamiento y diagnóstico",
        desc: "Analizamos el terreno, normativa y requerimientos del proyecto.",
      },
      {
        title: "Conceptualización",
        desc: "Desarrollamos propuestas volumétricas y funcionales alineadas a tu visión.",
      },
      {
        title: "Anteproyecto",
        desc: "Definimos plantas, cortes y fachadas con mayor nivel de detalle.",
      },
      {
        title: "Documentación ejecutiva",
        desc: "Entregamos planos técnicos listos para permisos y construcción.",
      },
    ],
    benefits: [
      "Proyectos optimizados en costos y tiempos de construcción",
      "Cumplimiento normativo y de reglamentos locales",
      "Coordinación con ingenierías estructurales e instalaciones",
    ],
    faq: [
      {
        question: "¿Cuánto tarda un proyecto arquitectónico?",
        answer:
          "Depende de la escala, pero un anteproyecto residencial suele tomar de 4 a 8 semanas.",
      },
      {
        question: "¿Incluyen trámites y permisos?",
        answer:
          "Sí, te acompañamos en la gestión de licencias ante las autoridades correspondientes.",
      },
    ],
  },
  {
    slug: "diseno-residencial",
    icon: "🏠",
    title: "Diseño Residencial",
    shortDesc:
      "Creación de hogares personalizados que reflejan el estilo de vida y las aspiraciones de cada familia.",
    desc: "Diseñamos casas, condominios y residencias de lujo pensadas en quienes las habitan. Cada proyecto parte de un ejercicio profundo de escucha para lograr espacios que se sientan a la medida, cómodos y con identidad propia.",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    ],
    features: ["Casas unifamiliares", "Condominios", "Residencias de lujo"],
    process: [
      {
        title: "Sesión de estilo de vida",
        desc: "Entendemos cómo vive tu familia para diseñar en función de sus rutinas.",
      },
      {
        title: "Propuesta arquitectónica",
        desc: "Presentamos volumetría, distribución y materialidad preliminar.",
      },
      {
        title: "Desarrollo ejecutivo",
        desc: "Afinamos cada detalle constructivo y de acabados.",
      },
      {
        title: "Supervisión de obra",
        desc: "Acompañamos la construcción para asegurar fidelidad al diseño.",
      },
    ],
    benefits: [
      "Espacios adaptados a la rutina real de cada familia",
      "Selección de materiales acorde a clima y presupuesto",
      "Acompañamiento desde el diseño hasta la entrega de llaves",
    ],
    faq: [
      {
        question: "¿Trabajan con terrenos ya comprados?",
        answer:
          "Sí, también asesoramos en la etapa de selección de terreno si aún no lo tienes.",
      },
      {
        question: "¿Puedo ver avances en 3D?",
        answer:
          "Entregamos renders y recorridos virtuales antes de iniciar la construcción.",
      },
    ],
  },
  {
    slug: "diseno-comercial",
    icon: "🏢",
    title: "Diseño Comercial",
    shortDesc:
      "Espacios comerciales diseñados para maximizar la experiencia del cliente y la eficiencia operativa.",
    desc: "Creamos oficinas, tiendas y hoteles que fortalecen la marca de nuestros clientes y mejoran la experiencia de quienes los visitan, sin perder de vista la eficiencia operativa y los flujos de trabajo.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80",
    ],
    features: ["Oficinas corporativas", "Retail", "Hoteles"],
    process: [
      {
        title: "Análisis de marca y operación",
        desc: "Entendemos objetivos de negocio, marca y flujos de usuarios.",
      },
      {
        title: "Programa arquitectónico",
        desc: "Definimos zonificación y capacidad para cada área.",
      },
      {
        title: "Diseño de experiencia",
        desc: "Integramos identidad de marca, señalética y recorridos.",
      },
      {
        title: "Ejecución y equipamiento",
        desc: "Coordinamos construcción, mobiliario e instalación final.",
      },
    ],
    benefits: [
      "Espacios que refuerzan la identidad de marca",
      "Mejora en flujos operativos y de atención al cliente",
      "Cumplimiento de normativas de accesibilidad y seguridad",
    ],
    faq: [
      {
        question: "¿Diseñan para franquicias con múltiples sucursales?",
        answer:
          "Sí, desarrollamos manuales de diseño replicables para cadenas y franquicias.",
      },
      {
        question: "¿Manejan proyectos llave en mano?",
        answer:
          "Podemos coordinar diseño, construcción y equipamiento de forma integral.",
      },
    ],
  },
  {
    slug: "interiorismo",
    icon: "🎨",
    title: "Interiorismo",
    shortDesc:
      "Diseño de interiores que transforma espacios en experiencias sensoriales memorables.",
    desc: "Trabajamos la atmósfera, la luz, el color y los materiales de cada espacio para crear ambientes con carácter propio, coherentes con la arquitectura y con la manera en que se van a vivir día a día.",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    ],
    features: ["Mobiliario", "Iluminación", "Materiales"],
    process: [
      {
        title: "Moodboard y paleta",
        desc: "Definimos estilo, materiales y paleta cromática.",
      },
      {
        title: "Layout y mobiliario",
        desc: "Proponemos distribución y selección de piezas clave.",
      },
      {
        title: "Especificación técnica",
        desc: "Detallamos iluminación, acabados y carpintería.",
      },
      {
        title: "Instalación final",
        desc: "Supervisamos montaje, decoración y ajustes finales.",
      },
    ],
    benefits: [
      "Ambientes con identidad y coherencia visual",
      "Selección curada de mobiliario y proveedores",
      "Optimización de iluminación natural y artificial",
    ],
    faq: [
      {
        question: "¿Solo diseñan o también compran el mobiliario?",
        answer:
          "Ofrecemos gestión completa de compras e instalación si así lo prefieres.",
      },
      {
        question: "¿Puedo aplicarlo a un solo ambiente?",
        answer:
          "Sí, trabajamos proyectos integrales o intervenciones puntuales por espacio.",
      },
    ],
  },
  {
    slug: "remodelacion",
    icon: "🔄",
    title: "Remodelación",
    shortDesc:
      "Renovación integral de espacios existentes, respetando la esencia original mientras modernizamos funcionalidad.",
    desc: "Intervenimos construcciones existentes para actualizar su funcionalidad y confort, respetando su carácter original o reinventándolo por completo según los objetivos del proyecto.",
    image:
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    ],
    features: ["Restauración", "Ampliación", "Modernización"],
    process: [
      {
        title: "Diagnóstico técnico",
        desc: "Evaluamos el estado estructural y de instalaciones existentes.",
      },
      {
        title: "Propuesta de intervención",
        desc: "Definimos qué se conserva, amplía o transforma.",
      },
      {
        title: "Permisos y planeación",
        desc: "Gestionamos autorizaciones y programa de obra.",
      },
      {
        title: "Ejecución por etapas",
        desc: "Construimos minimizando afectaciones al uso del espacio.",
      },
    ],
    benefits: [
      "Revalorización del inmueble existente",
      "Soluciones a patologías constructivas previas",
      "Menor impacto ambiental frente a construir desde cero",
    ],
    faq: [
      {
        question: "¿Puedo seguir habitando el espacio durante la obra?",
        answer:
          "En muchos casos sí, planeamos la obra por etapas para minimizar molestias.",
      },
      {
        question: "¿Trabajan inmuebles con valor patrimonial?",
        answer:
          "Sí, contamos con experiencia en restauración de fincas históricas.",
      },
    ],
  },
  {
    slug: "paisajismo",
    icon: "🌿",
    title: "Paisajismo",
    shortDesc:
      "Diseño de exteriores que integra la arquitectura con el entorno natural de manera armoniosa.",
    desc: "Diseñamos jardines, terrazas y áreas verdes que dialogan con la arquitectura, favoreciendo el confort climático y creando espacios exteriores tan habitables como los interiores.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1200&q=80",
    ],
    features: ["Jardines", "Terrazas", "Áreas verdes"],
    process: [
      {
        title: "Análisis de sitio",
        desc: "Estudiamos clima, orientación y vegetación existente.",
      },
      {
        title: "Masterplan de exteriores",
        desc: "Diseñamos recorridos, zonas y especies vegetales.",
      },
      {
        title: "Selección de materiales",
        desc: "Definimos pisos, mobiliario exterior e iluminación.",
      },
      {
        title: "Ejecución y mantenimiento",
        desc: "Supervisamos plantación y dejamos un plan de mantenimiento.",
      },
    ],
    benefits: [
      "Espacios exteriores confortables durante todo el año",
      "Uso de especies nativas de bajo mantenimiento",
      "Integración visual entre interior y exterior",
    ],
    faq: [
      {
        question: "¿Diseñan riego automático?",
        answer: "Sí, integramos sistemas de riego eficiente en el proyecto.",
      },
      {
        question: "¿Funciona en espacios pequeños como balcones?",
        answer:
          "Adaptamos las soluciones a terrazas, balcones y patios de cualquier tamaño.",
      },
    ],
  },
];

export const getServiceBySlug = (slug: string) =>
  services.find((s) => s.slug === slug);

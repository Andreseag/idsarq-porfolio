export interface TimelineStage {
  stage: string;
  date: string;
  status: "completed" | "active" | "pending";
}

export interface Project {
  id: number;
  name: string;
  client: string;
  year: string;
  location: string;
  category: string;
  status: string;
  area: string;
  desc: string;
  image: string;
  gallery: string[];
  timeline: TimelineStage[];
}

export const projects: Project[] = [
  {
    id: 1,
    name: "Casa Horizonte",
    client: "Familia Rodríguez",
    year: "2024",
    location: "Valle de Bravo, México",
    category: "Residencial",
    status: "Completado",
    area: "450 m2",
    desc: "Residencia minimalista con vistas panorámicas al lago, integrando materiales locales con tecnología sustentable.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    ],
    timeline: [
      { stage: "Reunión inicial", date: "Ene 2023", status: "completed" },
      { stage: "Levantamiento", date: "Feb 2023", status: "completed" },
      { stage: "Conceptualización", date: "Mar 2023", status: "completed" },
      { stage: "Diseño arquitectónico", date: "May 2023", status: "completed" },
      { stage: "Modelado 3D", date: "Jul 2023", status: "completed" },
      { stage: "Construcción", date: "Sep 2023", status: "completed" },
      { stage: "Entrega", date: "Dic 2024", status: "completed" },
    ],
  },
  {
    id: 2,
    name: "Torre Nexus",
    client: "Grupo Inmobiliario Nexus",
    year: "2024",
    location: "Villanueva, Casanare",
    category: "Comercial",
    status: "En construcción",
    area: "12,000 m2",
    desc: "Complejo de oficinas de clase mundial con certificación LEED Platinum y espacios colaborativos de última generación.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    ],
    timeline: [
      { stage: "Reunión inicial", date: "Mar 2022", status: "completed" },
      { stage: "Diseño arquitectónico", date: "Ago 2022", status: "completed" },
      { stage: "Construcción", date: "Ene 2023", status: "active" },
      { stage: "Entrega", date: "Jun 2025", status: "pending" },
    ],
  },
  {
    id: 3,
    name: "Loft Industrial",
    client: "María Sánchez",
    year: "2023",
    location: "Guadalajara, México",
    category: "Interiorismo",
    status: "Completado",
    area: "180 m2",
    desc: "Transformación de un antiguo almacén en un loft contemporáneo que preserva elementos industriales originales.",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80",
    ],
    timeline: [
      { stage: "Reunión inicial", date: "Jun 2023", status: "completed" },
      { stage: "Diseño", date: "Jul 2023", status: "completed" },
      { stage: "Ejecución", date: "Ago 2023", status: "completed" },
      { stage: "Entrega", date: "Oct 2023", status: "completed" },
    ],
  },
  {
    id: 4,
    name: "Residencia Palmera",
    client: "Familia Castillo",
    year: "2023",
    location: "Cancún, México",
    category: "Residencial",
    status: "Completado",
    area: "680 m2",
    desc: "Villa de lujo con diseño bioclimático que aprovecha la brisa del mar y la vegetación nativa para climatización natural.",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
    ],
    timeline: [
      { stage: "Reunión inicial", date: "Ene 2022", status: "completed" },
      { stage: "Construcción", date: "Sep 2022", status: "completed" },
      { stage: "Entrega", date: "Mar 2023", status: "completed" },
    ],
  },
  {
    id: 5,
    name: "Centro Cultural Ágora",
    client: "Gobierno Municipal",
    year: "2025",
    location: "Querétaro, México",
    category: "Comercial",
    status: "En diseño",
    area: "3,500 m2",
    desc: "Centro cultural multifuncional con auditorio, galerías y espacios de coworking para la comunidad creativa.",
    image:
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80",
    ],
    timeline: [
      { stage: "Reunión inicial", date: "Ene 2024", status: "completed" },
      { stage: "Conceptualización", date: "Mar 2024", status: "active" },
      { stage: "Diseño", date: "Jun 2024", status: "pending" },
    ],
  },
  {
    id: 6,
    name: "Renovación Histórica",
    client: "Patrimonio Nacional",
    year: "2024",
    location: "Puebla, México",
    category: "Remodelación",
    status: "Completado",
    area: "1,200 m2",
    desc: "Restauración de una casona del siglo XIX, preservando fachadas y elementos históricos con interiores modernos.",
    image:
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&q=80",
    ],
    timeline: [
      { stage: "Evaluación", date: "Feb 2023", status: "completed" },
      { stage: "Restauración", date: "Jun 2023", status: "completed" },
      { stage: "Entrega", date: "Ago 2024", status: "completed" },
    ],
  },
];

/**
 * Fuente única de verdad del contenido del perfil.
 * Editar aquí y ejecutar `npm run build` para regenerar todos los SVG.
 */

export interface Link {
  readonly label: string;
  readonly href: string;
  readonly caption: string;
}

export interface StackItem {
  readonly name: string;
  /** Slug de simple-icons (sin prefijo `si`). Vacío = chip solo texto. */
  readonly icon?: string;
  /** Tecnología del stack principal: se resalta. */
  readonly core?: boolean;
}

export interface StackRow {
  readonly label: string;
  readonly items: readonly StackItem[];
}

export type ProjectStatus = 'live' | 'building' | 'done';

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly period: string;
  readonly description: string;
  readonly metric: { readonly value: string; readonly label: string };
  readonly tags: readonly string[];
  readonly status: ProjectStatus;
  readonly repo: string;
  readonly demo?: string;
}

export type TimelineKind = 'work' | 'freelance' | 'project' | 'education' | 'learning';

export interface TimelineEntry {
  readonly title: string;
  readonly role: string;
  readonly detail: string;
  readonly kind: TimelineKind;
  /** YYYY-MM */
  readonly start: string;
  /** YYYY-MM | 'now'. Igual a start = hito puntual. */
  readonly end: string;
  readonly href?: string;
}

export const profile = {
  login: 'omarhernandezrey',
  name: { first: 'OMAR', last: 'HERNÁNDEZ REY' },
  role: 'Ingeniero de Software · Desarrollador Full Stack',
  location: { city: 'BOGOTÁ, CO', tz: 'UTC−5', coords: '4.61°N · 74.08°W' },
  email: 'omarhernandezrey@gmail.com',
  site: 'https://omarhernandezrey.com',
  linkedin: 'https://www.linkedin.com/in/omarhernandezrey',
  github: 'https://github.com/omarhernandezrey',

  boot: [
    { tag: 'run', text: 'init perfil --user omarhernandezrey' },
    { tag: 'ok', text: 'stack: react · next.js · typescript · node.js' },
    { tag: 'ok', text: 'datos: postgresql · mongodb · redis' },
    { tag: 'ok', text: 'entrega: docker · ci/cd · pruebas automatizadas' },
    { tag: 'live', text: 'disponible: remoto LATAM · USA' },
  ],

  orbit: ['FRONT', 'BACK', 'DATA', 'IA', 'OPS'],

  dossier: [
    { key: 'ROL', value: 'Full Stack — de la interfaz a la base de datos y el despliegue' },
    { key: 'FOCO', value: 'E-commerce con pagos, SEO técnico, APIs REST y agentes de IA local' },
    { key: 'FORMACIÓN', value: 'Ingeniería de Software · Politécnico Grancolombiano (nov. 2026)' },
    { key: 'BASE', value: 'Tecnólogo ADSI · SENA (2022) · +100 cursos de desarrollo' },
    { key: 'IDIOMAS', value: 'Español nativo · Inglés A2' },
    { key: 'MODALIDAD', value: 'Inmediata · remoto LATAM, híbrido o presencial en Bogotá' },
  ],

  links: [
    { label: 'PORTAFOLIO', href: 'https://omarhernandezrey.com', caption: 'omarhernandezrey.com' },
    { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/omarhernandezrey', caption: 'in/omarhernandezrey' },
    { label: 'EMAIL', href: 'mailto:omarhernandezrey@gmail.com', caption: 'omarhernandezrey@gmail.com' },
  ] satisfies readonly Link[],

  stack: [
    {
      label: 'LENGUAJES',
      items: [
        { name: 'TypeScript', icon: 'typescript', core: true },
        { name: 'JavaScript', icon: 'javascript' },
        { name: 'Python', icon: 'python' },
        { name: 'Java', icon: 'openjdk' },
        { name: 'Kotlin', icon: 'kotlin' },
        { name: 'SQL' },
      ],
    },
    {
      label: 'FRONTEND',
      items: [
        { name: 'React', icon: 'react', core: true },
        { name: 'Next.js', icon: 'nextdotjs', core: true },
        { name: 'React Native', icon: 'react' },
        { name: 'Tailwind CSS', icon: 'tailwindcss' },
        { name: 'Flutter', icon: 'flutter' },
      ],
    },
    {
      label: 'BACKEND',
      items: [
        { name: 'Node.js', icon: 'nodedotjs', core: true },
        { name: 'Express', icon: 'express' },
        { name: 'Spring Boot', icon: 'springboot' },
        { name: 'Prisma ORM', icon: 'prisma' },
        { name: 'APIs REST', icon: 'openapiinitiative' },
      ],
    },
    {
      label: 'DATOS',
      items: [
        { name: 'PostgreSQL', icon: 'postgresql', core: true },
        { name: 'MongoDB', icon: 'mongodb' },
        { name: 'Redis', icon: 'redis' },
        { name: 'Oracle' },
      ],
    },
    {
      label: 'DEVOPS · QA',
      items: [
        { name: 'Docker', icon: 'docker', core: true },
        { name: 'GitHub Actions', icon: 'githubactions' },
        { name: 'Jenkins', icon: 'jenkins' },
        { name: 'Jest', icon: 'jest' },
        { name: 'Linux', icon: 'linux' },
        { name: 'Git', icon: 'git' },
      ],
    },
    {
      label: 'IA · MÉTODO',
      items: [
        { name: 'Ollama · LLM local', icon: 'ollama' },
        { name: 'Agentes con herramientas' },
        { name: 'Scrum' },
      ],
    },
  ] satisfies readonly StackRow[],

  projects: [
    {
      id: 'P/01',
      name: 'FlexiCommerce',
      kind: 'E-commerce full stack · web + móvil',
      period: 'FEB — JUN 2026',
      description:
        'Pagos reales con Wompi, PWA en Next.js y app en React Native sobre una API REST en Express, Prisma, PostgreSQL y Redis. CI/CD en GitHub Actions, Jenkins y CircleCI.',
      metric: { value: '101', label: 'pruebas automatizadas' },
      tags: ['Next.js', 'React Native', 'Express', 'PostgreSQL', 'Redis'],
      status: 'done',
      repo: 'https://github.com/omarhernandezrey/FlexiCommerce',
    },
    {
      id: 'P/02',
      name: 'JARVIS Local',
      kind: 'Asistente de IA por voz · 100% local',
      period: 'JUL 2026 — HOY',
      description:
        'Agente conversacional en Python que ejecuta acciones en el sistema eligiendo herramientas de forma autónoma, con LLM local y memoria semántica.',
      metric: { value: '772', label: 'pruebas en CI' },
      tags: ['Python', 'LLM local', 'Memoria semántica', 'Linux'],
      status: 'building',
      repo: 'https://github.com/omarhernandezrey/Jarvis',
    },
    {
      id: 'P/03',
      name: 'Diccionario Dev',
      kind: 'Plataforma técnica con API pública',
      period: 'NOV — DIC 2025',
      description:
        'Next.js y TypeScript con panel administrativo protegido con JWT, rate limiting y documentación OpenAPI publicada automáticamente con GitHub Actions.',
      metric: { value: 'API', label: 'pública documentada' },
      tags: ['Next.js', 'TypeScript', 'JWT', 'OpenAPI'],
      status: 'live',
      repo: 'https://github.com/omarhernandezrey/diccionario-dev',
      demo: 'https://diccionario-dev-xi.vercel.app',
    },
    {
      id: 'P/04',
      name: 'Microservicios',
      kind: 'Productos e inventario · backend distribuido',
      period: 'OCT 2025',
      description:
        'Dos microservicios en Java 21 y Spring Boot 3 con PostgreSQL y Docker Compose, tolerantes a fallos con Resilience4j y autenticación por API key.',
      metric: { value: '2', label: 'servicios tolerantes a fallos' },
      tags: ['Java 21', 'Spring Boot 3', 'Docker', 'Resilience4j'],
      status: 'done',
      repo: 'https://github.com/omarhernandezrey/linktic-backend',
    },
  ] satisfies readonly Project[],

  timeline: [
    {
      title: 'TIVIT Colombia',
      role: 'Software Developer · Practicante',
      detail: 'Oracle en QA · soporte backend Java · DevOps',
      kind: 'work',
      start: '2022-05',
      end: '2022-11',
    },
    {
      title: 'SENA',
      role: 'Tecnólogo ADSI',
      detail: 'Análisis y Desarrollo de Sistemas de Información',
      kind: 'education',
      start: '2022-11',
      end: '2022-11',
    },
    {
      title: 'Formación continua',
      role: 'Platzi · MinTIC · SENA · IBM',
      detail: '+100 cursos completados en desarrollo de software',
      kind: 'learning',
      start: '2022-01',
      end: 'now',
    },
    {
      title: 'Tienda Lizz',
      role: 'Freelance · e-commerce',
      detail: 'Catálogo de 50 productos · carrito · checkout en 3 pasos',
      kind: 'freelance',
      start: '2024-11',
      end: '2025-05',
      href: 'https://tienda-lizz-io.vercel.app',
    },
    {
      title: 'Roxana Enfermera',
      role: 'Freelance · sitio comercial',
      detail: 'SEO 100/100 · rendimiento móvil 96/100',
      kind: 'freelance',
      start: '2024-12',
      end: '2026-01',
      href: 'https://enfermeria-roxana.vercel.app',
    },
    {
      title: 'Proyectos propios',
      role: 'FlexiCommerce · JARVIS Local',
      detail: 'E-commerce con pagos reales · agente de IA local',
      kind: 'project',
      start: '2026-02',
      end: 'now',
    },
    {
      title: 'Politécnico Grancolombiano',
      role: 'Ingeniero de Software',
      detail: 'Graduación',
      kind: 'education',
      start: '2026-11',
      end: '2026-11',
    },
  ] satisfies readonly TimelineEntry[],

  availability: 'Inmediata · Remoto LATAM / USA · Híbrido o presencial en Bogotá',
} as const;

export type Profile = typeof profile;

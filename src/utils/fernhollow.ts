/**
 * Pure functions and data structures for Fernhollow regenerative design studio.
 */

export interface Project {
  id: string;
  title: string;
  category: 'Spatial' | 'Living Architecture' | 'Bio-Materials' | 'Landscape';
  year: string;
  location: string;
  summary: string;
  impactMetric: string;
}

export interface JournalArticle {
  id: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'mycelium-pavilion',
    title: 'The Mycelium Pavilion',
    category: 'Bio-Materials',
    year: '2026',
    location: 'Kyoto, Japan',
    summary: 'A self-healing structural shell grown from fungal mycelium and agricultural by-products, capturing 4.2x its operational carbon.',
    impactMetric: '-140t CO₂e Net Sequestration',
  },
  {
    id: 'bioluminescent-terraces',
    title: 'Bioluminescent Terraces',
    category: 'Landscape',
    year: '2025',
    location: 'Auckland, Aotearoa',
    summary: 'Urban nocturnal terraces illuminated exclusively through photosynthetic phytoplankton and dinoflagellate water conduits.',
    impactMetric: '100% Zero Grid Illumination',
  },
  {
    id: 'solar-canopy-sanctuary',
    title: 'Solar Canopy Sanctuary',
    category: 'Living Architecture',
    year: '2025',
    location: 'Valparaíso, Chile',
    summary: 'A responsive parametric timber canopy mimicking forest canopies to filter microclimatic airflow and generate organic power.',
    impactMetric: '280% Net Energy Positive',
  },
  {
    id: 'living-facade-tower',
    title: 'Living Facade Monolith',
    category: 'Spatial',
    year: '2024',
    location: 'Zurich, Switzerland',
    summary: 'High-density habitat integration facade housing 140 endemic pollinator species within recycled terracotta capillary nodes.',
    impactMetric: '+320% Biodiversity Density',
  },
];

export const JOURNAL_ENTRIES: JournalArticle[] = [
  {
    id: 'cellular-architecture',
    title: 'Beyond the Beam: Cellular Growth in Built Form',
    date: 'Autumn 2026',
    readTime: '4 min read',
    excerpt: 'How mycorrhizal network intelligence is replacing steel cantilevers in next-generation structural mechanics.',
  },
  {
    id: 'nocturnal-ecology',
    title: 'Designing for the Dark: Restoring Night Ecologies',
    date: 'Summer 2026',
    readTime: '6 min read',
    excerpt: 'The critical role of darkness in urban biomes and why true sustainability demands nocturnal biodiversity restoration.',
  },
  {
    id: 'regenerative-imperative',
    title: 'The Circular Mandate: Leaving the Ground Richest',
    date: 'Spring 2026',
    readTime: '5 min read',
    excerpt: 'Buildings that digest, replenish topsoil, and decay into fertilizer at the end of their multi-century lifespans.',
  },
];

export function toggleAudioState(currentlyMuted: boolean): boolean {
  return !currentlyMuted;
}

export function filterProjectsByCategory(projects: Project[], category: string | 'All'): Project[] {
  if (!category || category === 'All') return projects;
  return projects.filter((p) => p.category === category);
}

export interface ContactFormInput {
  name: string;
  email: string;
  projectType: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateContactSubmission(input: ContactFormInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = 'Please provide your name or organization.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!input.message || input.message.trim().length < 10) {
    errors.message = 'Please tell us a little more about your envisioned project (min 10 characters).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface AstanaDayInfo {
  weekday: string;
  weekdayUpper: string;
  formattedDate: string;
  time: string;
  timeZone: string;
}

export const ASTANA_TIMEZONE = 'Asia/Almaty';

export function getAstanaDayInfo(date: Date = new Date(), locale: string = 'ru-RU'): AstanaDayInfo {
  const weekday = new Intl.DateTimeFormat(locale, {
    timeZone: ASTANA_TIMEZONE,
    weekday: 'long',
  }).format(date);

  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  const formattedDate = new Intl.DateTimeFormat(locale, {
    timeZone: ASTANA_TIMEZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  const time = new Intl.DateTimeFormat(locale, {
    timeZone: ASTANA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);

  return {
    weekday: capitalized,
    weekdayUpper: capitalized.toUpperCase(),
    formattedDate,
    time,
    timeZone: 'UTC+5 (Астана)',
  };
}

export interface ScheduleItem {
  id: string;
  order: number;
  subject: string;
  startTime: string;
  endTime: string;
  timeRange: string;
  room: string;
  block?: string;
  type: 'Практика' | 'Лекция' | 'Спорт' | 'Онлайн';
  isOnline?: boolean;
}

export interface DaySchedule {
  dayKey: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  dayName: string;
  dayShort: string;
  isWeekend?: boolean;
  items: ScheduleItem[];
}

export const WEEKLY_SCHEDULE: DaySchedule[] = [
  {
    dayKey: 'monday',
    dayName: 'Понедельник',
    dayShort: 'Пн',
    items: [
      {
        id: 'mon-1',
        order: 1,
        subject: 'Возрастная анатомия и физиология',
        startTime: '11:00',
        endTime: '11:50',
        timeRange: '11:00–11:50',
        room: 'Аудитория 231',
        type: 'Практика',
      },
      {
        id: 'mon-2',
        order: 2,
        subject: 'История физической культуры и спорта',
        startTime: '12:00',
        endTime: '12:50',
        timeRange: '12:00–12:50',
        room: 'Аудитория 231',
        type: 'Практика',
      },
      {
        id: 'mon-3',
        order: 3,
        subject: 'Русский язык',
        startTime: '13:10',
        endTime: '14:00',
        timeRange: '13:10–14:00',
        room: 'Аудитория 330',
        type: 'Практика',
      },
      {
        id: 'mon-4',
        order: 4,
        subject: 'Русский язык',
        startTime: '14:10',
        endTime: '15:00',
        timeRange: '14:10–15:00',
        room: 'Аудитория 330',
        type: 'Практика',
      },
    ],
  },
  {
    dayKey: 'tuesday',
    dayName: 'Вторник',
    dayShort: 'Вт',
    items: [
      {
        id: 'tue-1',
        order: 1,
        subject: 'Возрастная анатомия и физиология',
        startTime: '09:00',
        endTime: '09:50',
        timeRange: '09:00–09:50',
        room: 'Аудитория 350',
        block: 'Блок А06',
        type: 'Лекция',
      },
      {
        id: 'tue-2',
        order: 2,
        subject: 'Возрастная анатомия и физиология',
        startTime: '10:00',
        endTime: '10:50',
        timeRange: '10:00–10:50',
        room: 'Аудитория 350',
        block: 'Блок А06',
        type: 'Лекция',
      },
      {
        id: 'tue-3',
        order: 3,
        subject: 'Основы экономики и т.д.',
        startTime: '17:10',
        endTime: '18:00',
        timeRange: '17:10–18:00',
        room: 'Онлайн урок',
        type: 'Онлайн',
        isOnline: true,
      },
    ],
  },
  {
    dayKey: 'wednesday',
    dayName: 'Среда',
    dayShort: 'Ср',
    items: [
      {
        id: 'wed-1',
        order: 1,
        subject: 'Введение в педагогическую профессию',
        startTime: '12:00',
        endTime: '12:50',
        timeRange: '12:00–12:50',
        room: 'Аудитория 349',
        block: 'Блок А06',
        type: 'Лекция',
      },
      {
        id: 'wed-2',
        order: 2,
        subject: 'Введение в педагогическую профессию',
        startTime: '13:10',
        endTime: '14:00',
        timeRange: '13:10–14:00',
        room: 'Аудитория 349',
        block: 'Блок А06',
        type: 'Лекция',
      },
      {
        id: 'wed-3',
        order: 3,
        subject: 'Введение в педагогическую профессию',
        startTime: '14:10',
        endTime: '15:00',
        timeRange: '14:10–15:00',
        room: 'Аудитория 216',
        type: 'Практика',
      },
      {
        id: 'wed-4',
        order: 4,
        subject: 'Физическая культура',
        startTime: '16:10',
        endTime: '18:00',
        timeRange: '16:10–18:00',
        room: 'Многофункциональный зал',
        block: '3 этаж',
        type: 'Спорт',
      },
    ],
  },
  {
    dayKey: 'thursday',
    dayName: 'Четверг',
    dayShort: 'Чт',
    items: [
      {
        id: 'thu-1',
        order: 1,
        subject: 'История Казахстана',
        startTime: '11:00',
        endTime: '11:50',
        timeRange: '11:00–11:50',
        room: 'Аудитория 317',
        type: 'Практика',
      },
      {
        id: 'thu-2',
        order: 2,
        subject: 'Английский язык',
        startTime: '12:00',
        endTime: '12:50',
        timeRange: '12:00–12:50',
        room: 'Аудитория 317',
        type: 'Практика',
      },
      {
        id: 'thu-3',
        order: 3,
        subject: 'Английский язык',
        startTime: '13:10',
        endTime: '14:00',
        timeRange: '13:10–14:00',
        room: 'Аудитория 317',
        type: 'Практика',
      },
    ],
  },
  {
    dayKey: 'friday',
    dayName: 'Пятница',
    dayShort: 'Пт',
    items: [
      {
        id: 'fri-1',
        order: 1,
        subject: 'Основы экономики и т.д.',
        startTime: '10:00',
        endTime: '10:50',
        timeRange: '10:00–10:50',
        room: 'Аудитория 330',
        type: 'Практика',
      },
      {
        id: 'fri-2',
        order: 2,
        subject: 'История физической культуры',
        startTime: '11:00',
        endTime: '11:50',
        timeRange: '11:00–11:50',
        room: 'Аудитория 349',
        block: 'Блок А06',
        type: 'Лекция',
      },
      {
        id: 'fri-3',
        order: 3,
        subject: 'История физической культуры',
        startTime: '12:00',
        endTime: '12:50',
        timeRange: '12:00–12:50',
        room: 'Аудитория 349',
        block: 'Блок А06',
        type: 'Лекция',
      },
    ],
  },
  {
    dayKey: 'saturday',
    dayName: 'Суббота',
    dayShort: 'Сб',
    isWeekend: true,
    items: [],
  },
  {
    dayKey: 'sunday',
    dayName: 'Воскресенье',
    dayShort: 'Вс',
    isWeekend: true,
    items: [],
  },
];

export function getAstanaDayKey(date: Date = new Date()): DaySchedule['dayKey'] {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: ASTANA_TIMEZONE,
    weekday: 'short',
  }).format(date);

  switch (weekday) {
    case 'Mon': return 'monday';
    case 'Tue': return 'tuesday';
    case 'Wed': return 'wednesday';
    case 'Thu': return 'thursday';
    case 'Fri': return 'friday';
    case 'Sat': return 'saturday';
    case 'Sun': return 'sunday';
    default: return 'monday';
  }
}

export function getDayIndexForAstana(date: Date = new Date()): number {
  const key = getAstanaDayKey(date);
  const idx = WEEKLY_SCHEDULE.findIndex((d) => d.dayKey === key);
  return idx >= 0 ? idx : 0;
}

let ac: AudioContext | null = null;
let master: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ac) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = 0.7;
      const dl = ac.createDelay(1);
      dl.delayTime.value = 0.27;
      const fb = ac.createGain();
      fb.gain.value = 0.32;
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2800;
      master.connect(ac.destination);
      master.connect(dl);
      dl.connect(lp);
      lp.connect(fb);
      fb.connect(dl);
      lp.connect(ac.destination);
    }
    if (ac.state === 'suspended') {
      ac.resume().catch(() => {});
    }
    return ac;
  } catch {
    return null;
  }
}

function note(f: number, at: number, peak: number, d: number) {
  if (!ac || !master) return;
  try {
    const o = ac.createOscillator();
    const g = ac.createGain();
    const o2 = ac.createOscillator();
    const g2 = ac.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    o2.type = 'sine';
    o2.frequency.value = f * 2.004;
    g2.gain.value = 0.16;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + 0.035);
    g.gain.exponentialRampToValueAtTime(0.0001, at + d);
    o.connect(g);
    o2.connect(g2);
    g2.connect(g);
    g.connect(master);
    o.start(at);
    o2.start(at);
    o.stop(at + d + 0.1);
    o2.stop(at + d + 0.1);
  } catch (err) {
    console.warn('Audio note notice:', err);
  }
}

export function playScheduleOpenSound() {
  try {
    if (!getAudioContext() || !ac) return;
    const t = ac.currentTime + 0.02;
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => {
      note(f, t + i * 0.12, 0.04, 1.9);
    });
  } catch (err) {
    console.warn('Audio open notice:', err);
  }
}

export function playScheduleCloseSound() {
  try {
    if (!getAudioContext() || !ac) return;
    const t = ac.currentTime + 0.02;
    [1046.5, 783.99, 523.25].forEach((f, i) => {
      note(f, t + i * 0.1, 0.028, 1.2);
    });
  } catch (err) {
    console.warn('Audio close notice:', err);
  }
}

export function playTickSound(up: boolean = true) {
  try {
    if (!getAudioContext() || !ac) return;
    note(up ? 987.77 : 880, ac.currentTime + 0.01, 0.022, 0.7);
  } catch (err) {
    console.warn('Audio tick notice:', err);
  }
}



/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

// ===== SCHEDULE DATA (ASTANA TIME) =====
const DN = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
const SCH: Record<number, [string, string, string, string, string][]> = {
  1: [
    ["Возрастная анатомия и физиология", "11:00", "11:50", "ауд. 231", "практика"],
    ["История физической культуры и спорта", "12:00", "12:50", "ауд. 231", "практика"],
    ["Русский язык", "13:10", "14:00", "ауд. 330", "практика"],
    ["Русский язык", "14:10", "15:00", "ауд. 330", "практика"]
  ],
  2: [
    ["Возрастная анатомия и физиология", "09:00", "09:50", "ауд. 350, блок А06", "лекция"],
    ["Возрастная анатомия и физиология", "10:00", "10:50", "ауд. 350, блок А06", "лекция"],
    ["Основы экономики и т.д.", "17:10", "18:00", "онлайн", "лекция"]
  ],
  3: [
    ["Введение в педагогическую профессию", "12:00", "12:50", "ауд. 349, блок А06", "лекция"],
    ["Введение в педагогическую профессию", "13:10", "14:00", "ауд. 349, блок А06", "лекция"],
    ["Введение в педагогическую профессию", "14:10", "15:00", "ауд. 216", "практика"],
    ["Физическая культура", "16:10", "18:00", "многофункциональный зал, 3 этаж", "физра"]
  ],
  4: [
    ["История Казахстана", "11:00", "11:50", "ауд. 317", "практика"],
    ["Английский язык", "12:00", "12:50", "ауд. 317", "практика"],
    ["Английский язык", "13:10", "14:00", "ауд. 317", "практика"]
  ],
  5: [
    ["Основы экономики и т.д.", "10:00", "10:50", "ауд. 330", "практика"],
    ["История физической культуры", "11:00", "11:50", "ауд. 349, блок А06", "лекция"],
    ["История физической культуры", "12:00", "12:50", "ауд. 349, блок А06", "лекция"]
  ]
};

const hasPE = (d: number) => d === 3;
const PEI = "16:10–18:00, многофункциональный зал, 3 этаж";
const PEK = "16:10–18:00, көпфункционалды зал, 3-қабат";

const line = (p: [string, string, string, string, string], i: number) =>
  `${i + 1}. ${p[0]} — ${p[1]}–${p[2]}, ${p[3]}, ${p[4]}`;

const mins = (s: string) => {
  const [a, b] = s.split(":");
  return +a * 60 + +b;
};

// Returns day index with Astana timezone (+5 UTC)
function getAstanaDate() {
  return new Date(Date.now() + 5 * 3600000);
}

const day = (o: number) => {
  const d = getAstanaDate();
  return (d.getUTCDay() + o) % 7;
};

const nowMin = () => {
  const n = getAstanaDate();
  return n.getUTCHours() * 60 + n.getUTCMinutes();
};

const list = (d: number, who: string) =>
  SCH[d] ? `Расписание на ${who} (${DN[d]}):\n` + SCH[d].map(line).join("\n") : `На ${who} (${DN[d]}) пар нет 😴`;

const FAQ = [
  "Завтра будет Физкультура?",
  "Сегодня будет Физкультура?",
  "Сейчас какая пара?",
  "Что дали на домашнее задание?",
  "Сегодня отменили Физкультуру?",
  "Завтра отменят физкультуру?"
];

const FAQ_KK = [
  "Ертең дене шынықтыру болады ма?",
  "Бүгін дене шынықтыру болады ма?",
  "Қазір қандай сабақ?",
  "Үйге не берді?",
  "Бүгін дене шынықтыру бекер болды ма?",
  "Ертең дене шынықтыру бекер болады ма?"
];

const DK = ["жексенбі", "дүйсенбі", "сейсенбі", "сәрсенбі", "бейсенбі", "жұма", "сенбі"];
const SK: Record<string, string> = {
  "Возрастная анатомия и физиология": "Жас ерекшелік анатомиясы және физиологиясы",
  "История физической культуры и спорта": "Дене шынықтыру және спорт тарихы",
  "Русский язык": "Орыс тілі",
  "Основы экономики и т.д.": "Экономика негіздері т.б.",
  "Введение в педагогическую профессию": "Педагогикалық кәсіпке кіріспе",
  "Физическая культура": "Дене шынықтыру",
  "История Казахстана": "Қазақстан тарихы",
  "Английский язык": "Ағылшын тілі",
  "История физической культуры": "Дене шынықтыру тарихы"
};
const TK: Record<string, string> = {
  "практика": "практика",
  "лекция": "дәріс",
  "физра": "дене шынықтыру"
};

const rk = (r: string) =>
  r.replace(/ауд\. (\d+)/, "$1 аудитория")
   .replace("блок А06", "А06 блогы")
   .replace("многофункциональный зал, 3 этаж", "көпфункционалды зал, 3-қабат");

const lineK = (p: [string, string, string, string, string], i: number) =>
  `${i + 1}. ${SK[p[0]] || p[0]} — ${p[1]}–${p[2]}, ${rk(p[3])}, ${TK[p[4]] || p[4]}`;

const listK = (d: number, a: string, b: string) =>
  SCH[d] ? `${a} сабақ кестесі (${DK[d]}):\n` + SCH[d].map(lineK).join("\n") : `${b} (${DK[d]}) сабақ жоқ 😴`;

function cancelA(kk: boolean) {
  const d = day(0), before = nowMin() < mins("16:10");
  if (d === 3) {
    return before
      ? (kk ? "Бас тарту туралы тек дене шынықтыру алдында ғана айтады — бүгін, сәрсенбіде, 16:10-ға дейін. Ертерек айтпайды ⏳ Күте тұр, топ чатын қарап отыр." : "Об отмене скажут только перед самой физрой — сегодня, в среду, до 16:10. Раньше не скажут ⏳ Жди и смотри чат группы.")
      : (kk ? "Дене шынықтыру 16:10-да басталады — бас тарту тек басталмай тұрып айтылады. Топ чатын тексер 📲" : "Физра в 16:10 — об отмене говорят только до начала. Проверь чат группы 📲");
  }
  return kk
    ? "Бас тарту туралы тек сәрсенбіде, дене шынықтыру алдында (16:10-ға дейін) айтады. Ертерек айтпайды, сондықтан қазір жауап жоқ 🤷"
    : "Об отмене скажут только в среду — перед самой физрой, до 16:10. Раньше не скажут, так что сейчас ответа нет 🤷";
}

const ANS: ((() => string))[] = [
  () => hasPE(day(1)) ? `Да, завтра физкультура будет 💪\n${PEI}. Бери форму! 🏃‍♂️` : `Нет, завтра физры нет ❌ Она только по средам: ${PEI}.`,
  () => hasPE(day(0)) ? `Да, сегодня физкультура будет 💪\n${PEI}. 🏃‍♂️` : `Нет, сегодня физры нет ❌ Она только по средам: ${PEI}.`,
  () => {
    const s = SCH[day(0)];
    if (!s) return "Сегодня выходной, пар нет 😴";
    const t = nowMin();
    for (let i = 0; i < s.length; i++) {
      const p = s[i];
      if (t >= mins(p[1]) && t < mins(p[2])) return `Сейчас идёт: ${p[0]} 📚\nДо ${p[2]}, ${p[3]}, ${p[4]}.`;
      if (t < mins(p[1])) return i ? `Сейчас перемена ☕ Следующая:\n${line(p, i)}` : `Пары ещё не начались ⏳ Первая:\n${line(p, 0)}`;
    }
    return "На сегодня пары закончились 🎉 Отдыхай!";
  },
  () => "Домашку в расписании я не вижу 📝 Её нет в моих данных — глянь чат группы или спроси старосту.",
  () => cancelA(false),
  () => cancelA(false),
  () => list(day(0), "сегодня"),
  () => list(day(1), "завтра")
];

const ANS_KK: ((() => string))[] = [
  () => hasPE(day(1)) ? `Иә, ертең дене шынықтыру болады 💪\n${PEK}. Формаңды ал! 🏃‍♂️` : `Жоқ, ертең дене шынықтыру жоқ ❌ Ол тек сәрсенбіде: ${PEK}.`,
  () => hasPE(day(0)) ? `Иә, бүгін дене шынықтыру болады 💪\n${PEK}. 🏃‍♂️` : `Жоқ, бүгін дене шынықтыру жоқ ❌ Ол тек сәрсенбіде: ${PEK}.`,
  () => {
    const s = SCH[day(0)];
    if (!s) return "Бүгін демалыс, сабақ жоқ 😴";
    const t = nowMin();
    for (let i = 0; i < s.length; i++) {
      const p = s[i];
      if (t >= mins(p[1]) && t < mins(p[2])) return `Қазір жүріп жатыр: ${SK[p[0]] || p[0]} 📚\n${p[2]}-ге дейін, ${rk(p[3])}, ${TK[p[4]] || p[4]}.`;
      if (t < mins(p[1])) return i ? `Қазір үзіліс ☕ Келесі:\n${lineK(p, i)}` : `Сабақ әлі басталған жоқ ⏳ Бірінші:\n${lineK(p, 0)}`;
    }
    return "Бүгінгі сабақ біткен 🎉 Демал!";
  },
  () => "Үй тапсырмасын мен көрмеймін 📝 Менің деректерімде жоқ — топ чатын қара немесе старостадан сұра.",
  () => cancelA(true),
  () => cancelA(true),
  () => listK(day(0), "Бүгінгі", "Бүгін"),
  () => listK(day(1), "Ертеңгі", "Ертең")
];

const RUDE = [
  "Ильяс, ты это уже спрашивал! Читать не умеешь? 🙄",
  "Опять то же самое?! Другими словами — тот же вопрос, бестолочь 😤",
  "Ты тупой или прикидываешься? Я ТЕБЕ УЖЕ ОТВЕТИЛ! 😡 Повторяю:",
  "Ты как попугай, одно и то же долбишь! Хватит уже! 😠",
  "Я с тобой скоро говорить перестану, тормоз! Последний раз повторяю: 😡"
];

const RUDE_KK = [
  "Ильяс, мұны сен бұрын сұрадың ғой! Оқи алмайсың ба? 🙄",
  "Тағы да сол?! Басқа сөзбен айтсаң да сұрақ сол, ақымақ 😤",
  "Сен ақымақсың ба әлде кейіп танытасың ба? Мен саған жауап бердім ғой! 😡 Тағы айтамын:",
  "Тотықұс сияқты бір нәрсені қайталай бересің! Тоқтат енді! 😠",
  "Болды, Ильяс, мені әбден жалықтырдың! Миыңды қос! Соңғы рет айтамын: 😡"
];

const RUDE_UNK_RU = [
  "Ты это уже писал, тормоз! Придумай что-то новое 🙄",
  "Опять то же самое?! Мозги включи 😠",
  "Ты это уже писал! Фантазия закончилась? 😒"
];

const RUDE_UNK_KK = [
  "Мұны сен бұрын жаздың, ақымақ! Жаңа бірдеңе ойлап тап 🙄",
  "Тағы сол ма?! Миыңды қос 😠",
  "Мұны сен бұрын жаздың! Қиялың таусылды ма? 😒"
];

const UNK = [
  "Хм, не понял 🤔 Спроси про физру, пару, домашку или расписание.",
  "Этого я не знаю 😅 Нажми «Частые вопросы Ильяса»!",
  "Эм… не уловил 🤷 Спроси про физру, пару, домашку или расписание.",
  "Не понимаю, о чём ты 🌀 Попробуй «Частые вопросы Ильяса»."
];

const UNK_KK = [
  "Хм, түсінбедім 🤔 Дене шынықтыру, сабақ, үй тапсырмасы немесе кесте туралы сұра.",
  "Мұны білмеймін 😅 «Ильястың жиі сұрақтары» түймесін бас!",
  "Ым… түсінбедім 🤷 Дене шынықтыру, сабақ, үй тапсырмасы туралы сұра.",
  "Не айтқың келгенін түсінбедім 🌀 «Ильястың жиі сұрақтары» түймесін бас."
];

function intent(t: string): number {
  t = t.toLowerCase().replace(/ё/g, "е");
  const ph = /физ|спорт/.test(t), c = /отмен|не будет/.test(t), tm = /завтр/.test(t);
  if (ph && c) return tm ? 5 : 4;
  if (ph && tm) return 0;
  if (ph) return 1;
  if (/расписан/.test(t)) return tm ? 7 : 6;
  if (/пар[аыуе]|урок|лекци/.test(t) && /сейчас|щас|какая|какой|что/.test(t)) return 2;
  if (/домаш|дз|задал|задан|дали/.test(t)) return 3;

  // Kazakh intent matcher
  const phK = /дене|физ|спорт/.test(t);
  const cK = /бекер|жойыл|болмай|бас тарт|тоқтат|бекіт/.test(t);
  const tmK = /ертең/.test(t);
  if (phK && cK) return tmK ? 5 : 4;
  if (phK && tmK) return 0;
  if (phK) return 1;
  if (/кесте/.test(t)) return tmK ? 7 : 6;
  if (/сабақ|пән|пара/.test(t) && /қазір|қандай|қай/.test(t)) return 2;
  if (/үй\s?тап|үйге|тапсырма|берді/.test(t)) return 3;

  return -1;
}

const UI = {
  ru: {
    ph: "шепни что-нибудь…",
    fb: "Частые вопросы Ильяса",
    sub: "СОН · НА СВЯЗИ",
    th: "Dias.AI думает…",
    gr: "Привет… Я Dias.AI 🌌✨\nСпрашивай про физру, пары, домашку и расписание. Или открой «Частые вопросы Ильяса» 👇",
    sw: "Язык: русский 🇷🇺 Продолжаем!"
  },
  kk: {
    ph: "бірдеңе сыбырла…",
    fb: "Ильястың жиі сұрақтары",
    sub: "ТҮС · БАЙЛАНЫСТА",
    th: "Dias.AI ойланып жатыр…",
    gr: "Сәлем… Мен Dias.AI 🌌✨\nДене шынықтыру, сабақ, үй тапсырмасы және кесте туралы сұра. Немесе «Ильястың жиі сұрақтары» түймесін аш 👇",
    sw: "Тіл: қазақша 🇰🇿 Жалғастырайық!"
  }
};

const pk = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const lastV: Record<string, number> = {};
function pkNo<T>(k: string, a: T[]): T {
  let i: number;
  do {
    i = Math.floor(Math.random() * a.length);
  } while (a.length > 1 && i === lastV[k]);
  lastV[k] = i;
  return a[i];
}

function peA(o: number, kk: boolean) {
  const yes = hasPE(day(o)),
    I = kk ? PEK : PEI,
    w = kk ? (o ? "ертең" : "бүгін") : (o ? "завтра" : "сегодня"),
    C = w[0].toUpperCase() + w.slice(1);

  const V = kk
    ? (yes
        ? [
            `Иә, ${w} дене шынықтыру болады 💪\n${I}. Формаңды ал! 🏃‍♂️`,
            `Болады! ${C} дене шынықтыру бар 🔥 ${I}. Формаңды ұмытпа 👟`,
            `Иә-иә, ${w} дене шынықтыру кесте бойынша бар ✅ ${I}.`,
            `${C} — иә, дене шынықтыру бар 🏃‍♂️\n${I}.`
          ]
        : [
            `Жоқ, ${w} дене шынықтыру жоқ ❌ Ол тек сәрсенбіде: ${I}.`,
            `${C} дене шынықтыру жоқ 🙅 Сәрсенбіні күтеміз: ${I}.`,
            `Жоқ-ә, ${w} дене шынықтырусыз 😎 Ол сәрсенбіде — ${I}.`,
            `${C} дене шынықтыру болмайды ❌ Тек сәрсенбіде, ${I}.`
          ])
    : (yes
        ? [
            `Да, ${w} физкультура будет 💪\n${I}. Бери форму! 🏃‍♂️`,
            `Будет! ${C} физра 🔥 ${I}. Не забудь форму 👟`,
            `Угу, ${w} физра есть по расписанию ✅ ${I}.`,
            `${C} — да, физкультура будет 🏃‍♂️\n${I}.`
          ]
        : [
            `Нет, ${w} физры нет ❌ Она только по средам: ${I}.`,
            `${C} физкультуры нет 🙅 Ждём среду: ${I}.`,
            `Не-а, ${w} без физры 😎 Она по средам — ${I}.`,
            `Физры ${w} не будет ❌ Только в среду, ${I}.`
          ]);

  return pkNo("pe" + kk + yes, V);
}

const HW_RU = [
  "Домашку в расписании я не вижу 📝 Её нет в моих данных — глянь чат группы или спроси старосту.",
  "Про домашку ничего не знаю 🤷 Загляни в чат группы или спроси старосту.",
  "Задания у меня в данных нет 📝 Староста или чат группы тебе помогут.",
  "Домашку не вижу, Ильяс 👀 Проверь чат группы!"
];
const HW_KK = [
  "Үй тапсырмасын мен көрмеймін 📝 Менің деректерімде жоқ — топ чатын қара немесе старостадан сұра.",
  "Үй тапсырмасы туралы ештеңе білмеймін 🤷 Топ чатын қара немесе старостадан сұра.",
  "Тапсырма менің деректерімде жоқ 📝 Староста немесе топ чаты көмектеседі.",
  "Үй тапсырмасын көрмеймін, Ильяс 👀 Топ чатын тексер!"
];
const LD_RU = ["", "", "Секунду… 🔍\n", "Проверил расписание 📋\n", "Так-так…\n", "Ильяс, слушай 👂\n", "Отвечаю: ", "Ну смотри: "];
const TL_RU = ["", "", "", "\nЕсли что — пиши ещё 😉", "\nХорошего дня ✨", "\nНе проспи! ⏰", "\nСпрашивай ещё 🌌"];
const LD_KK = ["", "", "Бір сәт… 🔍\n", "Кестені тексердім 📋\n", "Қане…\n", "Ильяс, тыңда 👂\n", "Жауап беремін: ", "Қара: "];
const TL_KK = ["", "", "", "\nҚажет болса — тағы жаз 😉", "\nКүнің сәтті болсын ✨", "\nҰйықтап қалма! ⏰", "\nТағы сұра 🌌"];

function answer(i: number, plain: boolean, lang: 'ru' | 'kk') {
  const kk = lang === 'kk';
  let core: string;
  if (i === 0 || i === 1) core = peA(1 - i, kk);
  else if (i === 3) core = pkNo("hw" + kk, kk ? HW_KK : HW_RU);
  else core = (kk ? ANS_KK : ANS)[i]();

  if (plain) return core;
  return pkNo("l" + kk, kk ? LD_KK : LD_RU) + core + pkNo("t" + kk, kk ? TL_KK : TL_RU);
}

// ===== SOUND SYNTHESIZER =====
let ac: AudioContext | null = null;
let bus: GainNode | null = null;

function getAudioContext() {
  if (!ac) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ac = new AudioCtx();
      const m = ac.createGain();
      m.gain.value = 0.7;
      const lp = ac.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2600;

      const d = ac.createDelay(1);
      d.delayTime.value = 0.42;
      const fb = ac.createGain();
      fb.gain.value = 0.45;
      const dl = ac.createBiquadFilter();
      dl.type = "lowpass";
      dl.frequency.value = 1500;

      const d2 = ac.createDelay(1);
      d2.delayTime.value = 0.67;
      const fb2 = ac.createGain();
      fb2.gain.value = 0.35;

      m.connect(lp);
      lp.connect(ac.destination);
      lp.connect(d);
      d.connect(dl);
      dl.connect(fb);
      fb.connect(d);
      dl.connect(ac.destination);

      lp.connect(d2);
      d2.connect(fb2);
      fb2.connect(d2);
      d2.connect(ac.destination);
      bus = m;
    } catch {
      // AudioContext not allowed or unsupported
    }
  }
  if (ac && ac.state === "suspended") {
    ac.resume().catch(() => {});
  }
  return ac;
}

interface ToneOpts {
  type?: OscillatorType;
  f2?: number;
  a?: number;
  v?: number;
  det?: number;
}

function tn(f: number, t: number, d: number, o: ToneOpts = {}) {
  const c = getAudioContext();
  if (!c || !bus) return;
  const n = c.currentTime + t;
  const os = c.createOscillator();
  const g = c.createGain();

  os.type = o.type || "sine";
  os.frequency.setValueAtTime(f, n);
  if (o.f2) os.frequency.linearRampToValueAtTime(o.f2, n + d);

  const a = o.a || 0.02, v = o.v || 0.02;
  g.gain.setValueAtTime(0, n);
  g.gain.linearRampToValueAtTime(v, n + a);
  g.gain.exponentialRampToValueAtTime(0.0001, n + d);

  if (o.det) {
    const o2 = c.createOscillator();
    o2.type = "sine";
    o2.frequency.value = f * (1 + o.det);
    o2.connect(g);
    o2.start(n);
    o2.stop(n + d + 0.1);
  }

  os.connect(g).connect(bus);
  os.start(n);
  os.stop(n + d + 0.1);
}

const PENT = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.7];
const S = {
  open() {
    [146.8, 220, 293.7, 369.99, 440, 554.4, 659.25].forEach((f, i) =>
      tn(f, i * 0.22, 4.5, { a: 1.4, v: 0.016, det: 0.004 })
    );
  },
  send() {
    tn(440, 0, 0.5, { a: 0.03, v: 0.014, f2: 660 });
  },
  tick() {
    tn(PENT[Math.floor(Math.random() * PENT.length)], 0, 1.1, { a: 0.008, v: 0.009, det: 0.002 });
  },
  think() {
    tn(196, 0, 1.6, { a: 0.7, v: 0.014, det: 0.006 });
    tn(293.7, 0.15, 1.5, { a: 0.7, v: 0.01 });
  },
  got() {
    tn(880, 0, 1.8, { a: 0.02, v: 0.014, det: 0.003 });
    tn(1318.5, 0.18, 2, { a: 0.02, v: 0.01 });
  },
  rude() {
    tn(174.6, 0, 2.2, { a: 0.5, v: 0.022, det: 0.012 });
    tn(185, 0.05, 2.2, { a: 0.5, v: 0.018 });
  },
  close() {
    [659.25, 440, 293.7].forEach((f, i) =>
      tn(f, i * 0.25, 2.6, { a: 0.3, v: 0.013, f2: f * 0.8 })
    );
  }
};

interface DiasAIProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isRude?: boolean;
}

export const DiasAI: React.FC<DiasAIProps> = ({ isOpen, onClose }) => {
  const [lang, setLang] = useState<'ru' | 'kk'>('ru');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isAngry, setIsAngry] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const msgsContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const askedRef = useRef<Record<string, number>>({});
  const thinkIntervalRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sound triggering on open/close
  useEffect(() => {
    if (isOpen) {
      getAudioContext();
      S.open();
      // First greeting if empty
      if (messages.length === 0) {
        const timer = setTimeout(() => {
          S.got();
          setMessages([
            {
              id: 'init-greet',
              role: 'assistant',
              text: UI[lang].gr
            }
          ]);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } else {
      if (thinkIntervalRef.current) {
        clearInterval(thinkIntervalRef.current);
        thinkIntervalRef.current = null;
      }
      setIsThinking(false);
      setIsFaqOpen(false);
    }
  }, [isOpen]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (msgsContainerRef.current) {
      msgsContainerRef.current.scrollTop = msgsContainerRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Particle Canvas effect matching Dias.AI
  useEffect(() => {
    if (!isOpen) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const g2 = cv.getContext('2d');
    if (!g2) return;

    let W = (cv.width = window.innerWidth);
    let H = (cv.height = window.innerHeight);
    let T = 0;
    let ripple = 1;
    let heat = 0;
    let mx = -999;
    let my = -999;
    let rafId: number;

    const N = 1200;
    const NP = 850;

    let R = { x: 0, y: 0, w: 0, h: 0, r: 0 };
    function setRect() {
      const w = Math.min(W - 24, 520);
      const h = Math.min(H * 0.86, 720);
      R = {
        x: (W - w) / 2,
        y: (H - h) / 2,
        w,
        h,
        r: Math.min(44, w / 6)
      };
    }
    setRect();

    function rr(u: number): [number, number, number, number] {
      const { x, y, w, h, r } = R;
      const a = w - 2 * r,
        b = h - 2 * r,
        q = (Math.PI * r) / 2,
        L = 2 * a + 2 * b + 4 * q;
      let s = u * L;
      if (s < a) return [x + r + s, y, 0, -1];
      s -= a;
      if (s < q) {
        const t = s / r - Math.PI / 2;
        return [x + w - r + Math.cos(t) * r, y + r + Math.sin(t) * r, Math.cos(t), Math.sin(t)];
      }
      s -= q;
      if (s < b) return [x + w, y + r + s, 1, 0];
      s -= b;
      if (s < q) {
        const t = s / r;
        return [x + w - r + Math.cos(t) * r, y + h - r + Math.sin(t) * r, Math.cos(t), Math.sin(t)];
      }
      s -= q;
      if (s < a) return [x + w - r - s, y + h, 0, 1];
      s -= a;
      if (s < q) {
        const t = s / r + Math.PI / 2;
        return [x + r + Math.cos(t) * r, y + h - r + Math.sin(t) * r, Math.cos(t), Math.sin(t)];
      }
      s -= q;
      if (s < b) return [x, y + h - r - s, -1, 0];
      s -= b;
      const t = s / r + Math.PI;
      return [x + r + Math.cos(t) * r, y + r + Math.sin(t) * r, Math.cos(t), Math.sin(t)];
    }

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      a: number;
      u: number;
      off: number;
      bx: number;
      by: number;
      s: number;
      dust: boolean;
    }

    const P: Particle[] = [];
    for (let i = 0; i < N; i++) {
      P.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        a: Math.random() * 6.283,
        u: i < NP ? i / NP + Math.random() * 0.0006 : 0,
        off: (Math.random() - 0.5) * 8,
        bx: Math.random(),
        by: Math.random(),
        s: Math.random() * 1.6 + 0.5,
        dust: i >= NP
      });
    }

    const onPointerMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const onPointerLeave = () => {
      mx = my = -999;
    };
    const onResize = () => {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
      setRect();
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', onResize);

    const frame = () => {
      T += 0.016;
      ripple *= 0.985;
      heat *= 0.99;

      g2.globalCompositeOperation = 'source-over';
      g2.fillStyle = 'rgba(0, 0, 0, 0.22)';
      g2.fillRect(0, 0, W, H);
      g2.globalCompositeOperation = 'lighter';

      const th = isThinking ? 1 : 0;

      for (const p of P) {
        let tx: number, ty: number, k: number, al = 0.8, hue: number, lit = 62;

        if (!p.dust) {
          p.u = (p.u + 0.00006 * (1 + ripple * 3)) % 1;
          const q = rr(p.u);
          const wv = Math.sin(T * 1.3 + p.u * 50) * 2.5 * (1 + ripple * 3) + Math.sin(T * 0.6 + p.u * 9) * 4;
          tx = q[0] + q[2] * (wv + p.off);
          ty = q[1] + q[3] * (wv + p.off);
          k = 0.06;
          const pulse = Math.pow(0.5 + 0.5 * Math.sin((p.u * 3 - T * 0.25) * 6.283), 3);
          al = 0.35 + pulse * 0.65;
          hue = 312 + p.u * 36 + Math.sin(T * 0.5) * 10;
          lit = 55 + pulse * 30;
        } else {
          const { x, y, w, h } = R;
          tx = x + 30 + p.bx * (w - 60) + Math.sin(T * 0.35 + p.a) * 18;
          ty = y + 30 + p.by * (h - 60) + Math.cos(T * 0.28 + p.a * 1.7) * 18;
          k = 0.02;
          al = 0.1 + 0.12 * Math.sin(T + p.a * 3) ** 2;
          hue = 310 + p.bx * 40;
        }

        if (isAngry) {
          hue = 350 + Math.sin(T * 4 + p.a) * 10;
        }

        const dx = p.x - mx, dy = p.y - my, dd = dx * dx + dy * dy;
        if (dd < 12000) {
          const f = (1 - dd / 12000) * 5;
          const m = Math.sqrt(dd) + 1;
          p.vx += (dx / m) * f;
          p.vy += (dy / m) * f;
        }

        p.vx += (tx - p.x) * k;
        p.vy += (ty - p.y) * k;
        p.vx *= 0.87;
        p.vy *= 0.87;
        p.x += p.vx;
        p.y += p.vy;

        const sp = Math.min(1, Math.hypot(p.vx, p.vy) / 5);
        g2.fillStyle = `hsla(${hue + sp * 40}, ${100 * (1 - th * 0.9)}%, ${lit + sp * 20 + th * 20}%, ${Math.min(1, al + sp * 0.3)})`;
        g2.fillRect(p.x, p.y, p.s, p.s);
      }

      if (mx > 0) {
        const gr = g2.createRadialGradient(mx, my, 0, mx, my, 140);
        const ah = isAngry ? 355 : 315;
        gr.addColorStop(0, `hsla(${ah}, 100%, 60%, 0.12)`);
        gr.addColorStop(1, 'transparent');
        g2.fillStyle = gr;
        g2.fillRect(mx - 140, my - 140, 280, 280);
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen, isThinking, isAngry]);

  const handleClose = () => {
    S.close();
    onClose();
  };

  const handleLanguageToggle = (newL: 'ru' | 'kk') => {
    if (newL === lang) return;
    setLang(newL);
    S.got();
    setMessages(prev => [
      ...prev,
      {
        id: 'lang-' + Date.now(),
        role: 'assistant',
        text: UI[newL].sw
      }
    ]);
  };

  const ask = useCallback((text: string) => {
    getAudioContext();
    S.send();
    setIsFaqOpen(false);

    const userMsgId = 'u-' + Date.now();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text }]);

    const i = intent(text);
    const key = i >= 0 ? String(i) : "u:" + text.toLowerCase().replace(/[^\p{L}\d]/gu, "");
    const rep = askedRef.current[key] || 0;
    askedRef.current[key] = rep + 1;

    setIsThinking(true);
    S.think();
    if (thinkIntervalRef.current) clearInterval(thinkIntervalRef.current);
    thinkIntervalRef.current = window.setInterval(() => S.think(), 1700);

    const delay = 1800 + Math.random() * 900;
    setTimeout(() => {
      if (thinkIntervalRef.current) {
        clearInterval(thinkIntervalRef.current);
        thinkIntervalRef.current = null;
      }
      setIsThinking(false);

      let txt = "";
      let rude = false;

      if (i >= 0) {
        txt = answer(i, rep > 0, lang);
        if (rep > 0) {
          rude = true;
          const RR = lang === "kk" ? RUDE_KK : RUDE;
          txt = RR[(rep - 1) % RR.length] + "\n" + txt;
        }
      } else if (rep > 0) {
        rude = true;
        txt = pk(lang === "kk" ? RUDE_UNK_KK : RUDE_UNK_RU);
      } else {
        txt = pk(lang === "kk" ? UNK_KK : UNK);
      }

      if (rude) {
        S.rude();
        setIsAngry(true);
        setTimeout(() => setIsAngry(false), 6000);
      } else {
        S.got();
      }

      const botMsgId = 'a-' + Date.now();
      setMessages(prev => [
        ...prev,
        {
          id: botMsgId,
          role: 'assistant',
          text: txt,
          isRude: rude
        }
      ]);
    }, delay);
  }, [lang]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = inputValue.trim();
    if (v) {
      setInputValue('');
      ask(v);
    }
  };

  if (!isOpen) return null;

  const currentFaq = lang === 'kk' ? FAQ_KK : FAQ;

  return (
    <div className={`dias-portal ${isAngry ? 'angry' : ''} ${isThinking ? 'thinking' : ''}`}>
      {/* Background ambient particle canvas */}
      <canvas ref={canvasRef} className="dias-particle-canvas" aria-hidden="true" />

      {/* Main Dias.AI Window */}
      <div className="dias-win" role="dialog" aria-modal="true" aria-label="Dias.AI Chat">
        <header className="dias-header">
          <div className={`dias-orb ${isThinking ? 'th' : ''}`} />
          <div className="dias-title-box">
            <b>Dias.AI</b>
            <small>{UI[lang].sub}</small>
          </div>

          <div className="dias-lang">
            <button
              type="button"
              className={lang === 'ru' ? 'on' : ''}
              onClick={() => handleLanguageToggle('ru')}
            >
              RU
            </button>
            <button
              type="button"
              className={lang === 'kk' ? 'on' : ''}
              onClick={() => handleLanguageToggle('kk')}
            >
              ҚАЗ
            </button>
          </div>

          <button
            type="button"
            className="dias-close-btn"
            onClick={handleClose}
            aria-label="Закрыть Dias.AI"
          >
            ×
          </button>
        </header>

        {/* Message Log */}
        <div className="dias-msgs" ref={msgsContainerRef}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`dias-m ${m.role === 'user' ? 'dias-u' : 'dias-a'} ${m.isRude ? 'dias-rude' : ''}`}
            >
              {m.text}
            </div>
          ))}

          {isThinking && (
            <div className="dias-m dias-a dias-think">
              {UI[lang].th}
            </div>
          )}
        </div>

        {/* FAQ list */}
        <div className={`dias-faq ${isFaqOpen ? 'show' : ''}`}>
          {currentFaq.map((q, i) => (
            <button
              key={q}
              type="button"
              style={{ transitionDelay: `${i * 70}ms` }}
              onClick={() => ask(q)}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form className="dias-bar" onSubmit={handleSubmit}>
          <button
            type="button"
            className="dias-faq-btn"
            onClick={() => {
              S.send();
              setIsFaqOpen(prev => !prev);
            }}
          >
            {UI[lang].fb}
          </button>

          <input
            ref={inputRef}
            type="text"
            className="dias-input"
            value={inputValue}
            placeholder={UI[lang].ph}
            onChange={(e) => setInputValue(e.target.value)}
            autoComplete="off"
          />

          <button type="submit" className="dias-send-btn" aria-label="Отправить">
            →
          </button>
        </form>
      </div>
    </div>
  );
};

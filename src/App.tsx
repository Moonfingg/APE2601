/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  getAstanaDayInfo,
  playScheduleOpenSound,
  playScheduleCloseSound,
  playTickSound,
  type AstanaDayInfo,
} from './utils/fernhollow';
import { DiasAI } from './components/DiasAI';

const MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const DAYS = [
  { n: 'Понедельник', s: 'ПН', g: 'в понедельник' },
  { n: 'Вторник', s: 'ВТ', g: 'во вторник' },
  { n: 'Среда', s: 'СР', g: 'в среду' },
  { n: 'Четверг', s: 'ЧТ', g: 'в четверг' },
  { n: 'Пятница', s: 'ПТ', g: 'в пятницу' },
  { n: 'Суббота', s: 'СБ', g: 'в субботу' },
  { n: 'Воскресенье', s: 'ВС', g: 'в воскресенье' }
];

const LEC = 'Лекция';
const PRA = 'Практика';

function aud(n: number, block?: string) {
  return 'Аудитория ' + n + (block ? ' · блок ' + block : '');
}

interface RawLesson {
  t: string;
  r: string;
  k: string;
  a: string;
  b: string;
}

const SCHEDULE: RawLesson[][] = [
  [ /* Понедельник */
    { t: 'Возрастная анатомия и физиология', r: aud(231), k: PRA, a: '11:00', b: '11:50' },
    { t: 'История физической культуры и спорта', r: aud(231), k: PRA, a: '12:00', b: '12:50' },
    { t: 'Русский язык', r: aud(330), k: PRA, a: '13:10', b: '14:00' },
    { t: 'Русский язык', r: aud(330), k: PRA, a: '14:10', b: '15:00' }
  ],
  [ /* Вторник */
    { t: 'Возрастная анатомия и физиология', r: aud(350, 'А06'), k: LEC, a: '09:00', b: '09:50' },
    { t: 'Возрастная анатомия и физиология', r: aud(350, 'А06'), k: LEC, a: '10:00', b: '10:50' },
    { t: 'Основы экономики и т.д.', r: 'Онлайн урок', k: LEC, a: '17:10', b: '18:00' }
  ],
  [ /* Среда */
    { t: 'Введение в педагогическую профессию', r: aud(349, 'А06'), k: LEC, a: '12:00', b: '12:50' },
    { t: 'Введение в педагогическую профессию', r: aud(349, 'А06'), k: LEC, a: '13:10', b: '14:00' },
    { t: 'Введение в педагогическую профессию', r: aud(216), k: PRA, a: '14:10', b: '15:00' },
    { t: 'Физическая культура', r: 'Многофункциональный зал · 3 этаж', k: '', a: '16:10', b: '18:00' }
  ],
  [ /* Четверг */
    { t: 'История Казахстана', r: aud(317), k: PRA, a: '11:00', b: '11:50' },
    { t: 'Английский язык', r: aud(317), k: PRA, a: '12:00', b: '12:50' },
    { t: 'Английский язык', r: aud(317), k: PRA, a: '13:10', b: '14:00' }
  ],
  [ /* Пятница */
    { t: 'Основы экономики и т.д.', r: aud(330), k: PRA, a: '10:00', b: '10:50' },
    { t: 'История физической культуры', r: aud(349, 'А06'), k: LEC, a: '11:00', b: '11:50' },
    { t: 'История физической культуры', r: aud(349, 'А06'), k: LEC, a: '12:00', b: '12:50' }
  ],
  [], /* Суббота */
  []  /* Воскресенье */
];

function getAstanaNow() {
  const d = new Date(Date.now() + 5 * 3600000);
  return {
    wd: (d.getUTCDay() + 6) % 7,
    h: d.getUTCHours(),
    m: d.getUTCMinutes(),
    s: d.getUTCSeconds(),
    min: d.getUTCHours() * 60 + d.getUTCMinutes(),
    y: d.getUTCFullYear(),
    mo: d.getUTCMonth(),
    dt: d.getUTCDate(),
  };
}

function pad(n: number) {
  return (n < 10 ? '0' : '') + n;
}

function toMin(s: string) {
  const p = s.split(':');
  return +p[0] * 60 + +p[1];
}

function plural(n: number) {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return 'пара';
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return 'пары';
  return 'пар';
}

function dur(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  if (h && m) return h + ' ч ' + m + ' мин';
  if (h) return h + ' ч';
  return m + ' мин';
}

function getNextLesson(n: ReturnType<typeof getAstanaNow>) {
  for (let k = 0; k <= 7; k++) {
    const idx = (n.wd + k) % 7;
    const arr = SCHEDULE[idx];
    for (let i = 0; i < arr.length; i++) {
      if (k > 0 || toMin(arr[i].a) > n.min) {
        return { k, idx, l: arr[i] };
      }
    }
  }
  return null;
}

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [introShown, setIntroShown] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [astanaDay, setAstanaDay] = useState<AstanaDayInfo>(() => getAstanaDayInfo());
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isDiasOpen, setIsDiasOpen] = useState(false);
  const [viewDayIndex, setViewDayIndex] = useState(() => getAstanaNow().wd);
  const [animDir, setAnimDir] = useState<number>(0);

  const valleyRef = useRef<any>(null);
  const audioStoreRef = useRef<any>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const winRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep Astana time fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setAstanaDay(getAstanaDayInfo());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3D Valley engine boot
  useEffect(() => {
    let unmounted = false;
    let timer: any = null;

    const bootEngine = () => {
      if (typeof window === 'undefined') return;
      const w = window as any;

      if (!w.webpackChunk_N_E) {
        timer = setTimeout(bootEngine, 60);
        return;
      }

      try {
        if (!w.__req) {
          w.webpackChunk_N_E.push([[90001], {}, function (r: any) { w.__req = r; }]);
        }
        if (typeof w.__req === 'function') {
          w.__req(889);
        }

        if (w.__GE && typeof w.__GE.et === 'function') {
          const Valley = w.__GE.et();
          const audioStoreGetter = w.__GE.Y();
          const valleyEl = document.getElementById('valley');

          if (valleyEl && !valleyRef.current) {
            const valley = new Valley(
              valleyEl,
              () => {
                if (!unmounted) setIsLoaded(true);
              },
              () => {
                if (!unmounted) setIntroShown(true);
              }
            );
            valleyRef.current = valley;

            try {
              const aStore = audioStoreGetter();
              audioStoreRef.current = audioStoreGetter;
              aStore.initAudio?.();
            } catch (aErr) {
              console.warn('Audio store init notice:', aErr);
            }
          }
        }
      } catch (err) {
        console.error('Error booting flower valley engine:', err);
        if (!unmounted) {
          setIsLoaded(true);
          setIntroShown(true);
        }
      }
    };

    bootEngine();

    const fallbackTimer = setTimeout(() => {
      if (!unmounted) {
        setIsLoaded(true);
        setIntroShown(true);
      }
    }, 2800);

    return () => {
      unmounted = true;
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
      if (valleyRef.current && typeof valleyRef.current.destroy === 'function') {
        try {
          valleyRef.current.destroy();
        } catch {
          // cleanup
        }
      }
    };
  }, []);

  const handleToggleSound = () => {
    const nextPlaying = !isAudioPlaying;
    setIsAudioPlaying(nextPlaying);

    let threeJsHandled = false;
    if (audioStoreRef.current) {
      try {
        const s = audioStoreRef.current();
        if (s) {
          const mgr = s.audioManager;
          if (mgr && mgr.audioContext && mgr.audioContext.state === 'suspended') {
            mgr.audioContext.resume().catch(() => {});
          }
          if (typeof s.toggleMute === 'function') {
            const isMuted = typeof s.getMuteState === 'function' ? s.getMuteState() : s.isMuted;
            if ((nextPlaying && isMuted) || (!nextPlaying && !isMuted)) {
              s.toggleMute();
            }
            if (mgr && mgr.backgroundAudio && (mgr.backgroundAudio.isPlaying || mgr.isInitialized)) {
              threeJsHandled = true;
            }
          }
        }
      } catch (err) {
        console.warn('Audio toggle notice:', err);
      }
    }

    if (bgAudioRef.current) {
      if (nextPlaying && !threeJsHandled) {
        bgAudioRef.current.volume = isDiasOpen ? 0.18 : 1.0;
        bgAudioRef.current.play().catch(() => {});
      } else {
        bgAudioRef.current.pause();
      }
    }
  };

  // Duck background audio when APE2601 / Dias.AI is open, restore when closed
  useEffect(() => {
    let animId: number;
    const targetVol = isDiasOpen ? 0.18 : 1.0;
    const muffleAmount = isDiasOpen ? 0.8 : 0;

    // 1. Control Valley 3D engine audio manager & lowpass filter
    try {
      if (valleyRef.current && typeof valleyRef.current.muffleBG === 'function') {
        valleyRef.current.muffleBG(muffleAmount);
      }
      if (audioStoreRef.current) {
        const s = audioStoreRef.current();
        if (s) {
          if (typeof s.muffleBG === 'function') {
            s.muffleBG(muffleAmount);
          }
          const mgr = s.audioManager;
          if (mgr) {
            mgr.maxVolume = targetVol;
            mgr.currentVolumeTarget = targetVol;
            if (mgr.backgroundAudio && typeof mgr.backgroundAudio.setVolume === 'function') {
              mgr.backgroundAudio.setVolume(targetVol);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Audio dimming notice:', e);
    }

    // 2. Smoothly fade HTMLAudioElement volume
    const el = bgAudioRef.current;
    if (el) {
      const startVol = el.volume;
      const startTime = performance.now();
      const duration = 500;

      const step = (now: number) => {
        const p = Math.min(1, (now - startTime) / duration);
        el.volume = startVol + (targetVol - startVol) * p;
        if (p < 1) {
          animId = requestAnimationFrame(step);
        }
      };
      animId = requestAnimationFrame(step);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isDiasOpen]);

  const handleGoEnter = () => {
    if (valleyRef.current && typeof valleyRef.current.startHoverTransition === 'function') {
      try {
        valleyRef.current.startHoverTransition();
      } catch (e) {
        console.warn('Hover start notice:', e);
      }
    }
  };

  const handleGoLeave = () => {
    if (!isScheduleOpen && valleyRef.current && typeof valleyRef.current.stopHoverTransition === 'function') {
      try {
        valleyRef.current.stopHoverTransition();
      } catch (e) {
        console.warn('Hover stop notice:', e);
      }
    }
  };

  const handleOpenSchedule = () => {
    const curWd = getAstanaNow().wd;
    setViewDayIndex(curWd);
    setAnimDir(0);
    setIsScheduleOpen(true);
    playScheduleOpenSound();

    if (valleyRef.current && typeof valleyRef.current.startHoverTransition === 'function') {
      try {
        valleyRef.current.startHoverTransition();
      } catch (err) {
        console.warn('Valley start transition notice:', err);
      }
    }
  };

  const handleCloseSchedule = useCallback(() => {
    setIsScheduleOpen(false);
    playScheduleCloseSound();

    if (valleyRef.current && typeof valleyRef.current.stopHoverTransition === 'function') {
      try {
        valleyRef.current.stopHoverTransition();
      } catch (err) {
        console.warn('Valley stop transition notice:', err);
      }
    }
  }, []);

  const handleGo = (delta: number) => {
    setViewDayIndex((prev) => (prev + delta + 7) % 7);
    setAnimDir(delta);
    playTickSound(delta > 0);
  };

  const handlePillClick = (index: number) => {
    if (index === viewDayIndex) return;
    const dir = index > viewDayIndex ? 1 : -1;
    setViewDayIndex(index);
    setAnimDir(dir);
    playTickSound(dir > 0);
  };

  // Keyboard navigation & Touch swipes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isScheduleOpen) return;
      if (e.key === 'ArrowLeft') {
        handleGo(-1);
      } else if (e.key === 'ArrowRight') {
        handleGo(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScheduleOpen]);

  // Touch swipe handling
  useEffect(() => {
    const win = winRef.current;
    if (!win) return;

    let touchX: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchX = e.touches[0].clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 60) {
        handleGo(dx < 0 ? 1 : -1);
      }
    };

    win.addEventListener('touchstart', onTouchStart, { passive: true });
    win.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      win.removeEventListener('touchstart', onTouchStart);
      win.removeEventListener('touchend', onTouchEnd);
    };
  }, [isScheduleOpen]);

  /* =========================================================================
     CANVAS FLOWERS & SPARKLES ENGINE (Exact procedural engine from user file)
     ========================================================================= */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const c = cv.getContext('2d');
    if (!c) return;

    let rafId = 0;
    let dpr = 1;
    let vw = 0;
    let vh = 0;
    let alpha = 0;
    let openAt = 0;
    let flowers: any[] = [];
    let sparks: any[] = [];

    const PALETTE = ['255,122,184', '167,139,250', '94,231,255', '255,212,121', '255,138,107', '123,242,192', '232,220,255'];

    function sizeCanvas() {
      if (!cv) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = window.innerWidth;
      vh = window.innerHeight;
      cv.width = Math.round(vw * dpr);
      cv.height = Math.round(vh * dpr);
      cv.style.width = vw + 'px';
      cv.style.height = vh + 'px';
    }

    function rnd(a: number, b: number) {
      return a + Math.random() * (b - a);
    }
    function pick(a: string[] | number[]) {
      return a[Math.floor(Math.random() * a.length)];
    }

    function makeSprite(size: number, col: string, petals: number, slim: boolean) {
      const S = Math.ceil(size * 4 * dpr);
      const sc = document.createElement('canvas');
      sc.width = sc.height = S;
      const g = sc.getContext('2d');
      if (!g) return sc;
      g.scale(dpr, dpr);
      g.translate(size * 2, size * 2);
      g.shadowColor = 'rgba(' + col + ',.9)';
      g.shadowBlur = size * 0.9;
      const len = size * 0.98;
      const wid = size * (slim ? 0.17 : 0.3);

      for (let k = 0; k < petals; k++) {
        g.save();
        g.rotate(k * 2 * Math.PI / petals);
        const gr = g.createLinearGradient(0, 0, 0, -len);
        gr.addColorStop(0, 'rgba(255,255,255,.92)');
        gr.addColorStop(0.35, 'rgba(' + col + ',.95)');
        gr.addColorStop(1, 'rgba(' + col + ',.55)');
        g.beginPath();
        g.moveTo(0, 0);
        g.bezierCurveTo(wid * 1.6, -len * 0.25, wid * 1.2, -len * 0.95, 0, -len);
        g.bezierCurveTo(-wid * 1.2, -len * 0.95, -wid * 1.6, -len * 0.25, 0, 0);
        g.fillStyle = gr;
        g.fill();
        g.lineWidth = 0.6;
        g.strokeStyle = 'rgba(255,255,255,.35)';
        g.stroke();
        g.restore();
      }
      g.shadowColor = 'rgba(255,212,121,1)';
      g.shadowBlur = size * 0.6;
      g.beginPath();
      g.arc(0, 0, size * 0.14, 0, 6.2832);
      g.fillStyle = 'rgba(255,240,180,1)';
      g.fill();
      g.shadowBlur = 0;
      g.fillStyle = 'rgba(255,255,255,.95)';
      for (let j = 0; j < 6; j++) {
        const an = j * 1.0472;
        g.beginPath();
        g.arc(Math.cos(an) * size * 0.22, Math.sin(an) * size * 0.22, size * 0.03, 0, 6.2832);
        g.fill();
      }
      return sc;
    }

    function seed() {
      sizeCanvas();
      const win = winRef.current;
      const w = win ? win.offsetWidth : Math.min(580, vw - 40);
      const h = win ? win.offsetHeight : Math.min(720, vh - 80);
      const P = 2 * (w + h);
      const k = Math.max(0.62, Math.min(1.05, vw / 560));
      const n = Math.round(P / (46 * k));
      flowers = [];
      sparks = [];

      function add(t: number, size: number, delay: number, off: number) {
        const col = pick(PALETTE) as string;
        const petals = pick([5, 5, 6, 7, 8]) as number;
        const slim = petals >= 7;
        flowers.push({
          t,
          off,
          size,
          spr: makeSprite(size, col, petals, slim),
          rot0: rnd(0, 6.28),
          spin: rnd(-0.22, 0.22),
          ph: rnd(0, 6.28),
          delay,
        });
      }

      for (let i = 0; i < n; i++) {
        add((i + rnd(-0.25, 0.25)) / n, rnd(10, 23) * k, rnd(0.05, 0.9) + (i / n) * 0.7, rnd(-2, 12) * k);
      }
      [0, w / P, (w + h) / P, (2 * w + h) / P].forEach(function (t, i) {
        add(t, rnd(27, 33) * k, i * 0.08, 6 * k);
      });

      const ns = Math.round(P / 9);
      for (let s = 0; s < ns; s++) {
        sparks.push({
          t: Math.random(),
          off: rnd(-4, 70) * k,
          ph: rnd(0, 6.28),
          sp: rnd(1.1, 2.8),
          sz: rnd(3, 8) * k,
        });
      }
    }

    function onPerim(t: number, w: number, h: number, x0: number, y0: number) {
      const P = 2 * (w + h);
      let d = (((t % 1) + 1) % 1) * P;
      if (d < w) return [x0 + d, y0, 0, -1];
      d -= w;
      if (d < h) return [x0 + w, y0 + d, 1, 0];
      d -= h;
      if (d < w) return [x0 + w - d, y0 + h, 0, 1];
      d -= w;
      return [x0, y0 + h - d, -1, 0];
    }

    function easeBack(x: number) {
      x = Math.max(0, Math.min(1, x));
      const c1 = 1.5, c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    function frame(ts: number) {
      rafId = requestAnimationFrame(frame);
      const t = ts / 1000;
      alpha += ((isScheduleOpen ? 1 : 0) - alpha) * 0.07;

      if (!isScheduleOpen && alpha < 0.01) {
        c?.setTransform(1, 0, 0, 1, 0, 0);
        c?.clearRect(0, 0, cv!.width, cv!.height);
        cancelAnimationFrame(rafId);
        return;
      }

      if (!c || !cv) return;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, vw, vh);

      const win = winRef.current;
      const w = win ? win.offsetWidth : Math.min(580, vw - 40);
      const h = win ? win.offsetHeight : Math.min(720, vh - 80);
      const x0 = (vw - w) / 2;
      const y0 = (vh - h) / 2;
      const P = 2 * (w + h);

      c.globalCompositeOperation = 'lighter';

      /* vine */
      const prog = Math.max(0, Math.min(1, (t - openAt) / 1.4));
      c.globalAlpha = alpha * 0.5;
      c.lineWidth = 1.2;
      c.strokeStyle = 'rgba(123,242,192,.55)';
      c.shadowColor = 'rgba(123,242,192,.8)';
      c.shadowBlur = 8;
      c.beginPath();
      const steps = Math.round((P / 5) * prog);
      for (let i = 0; i <= steps; i++) {
        const tt = i / (P / 5);
        const p = onPerim(tt, w, h, x0, y0);
        const o = 4 + 3.5 * Math.sin((tt * P) / 24 + t * 0.6);
        const px = p[0] + p[2] * o;
        const py = p[1] + p[3] * o;
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.stroke();
      c.shadowBlur = 0;

      /* flowers */
      for (let f = 0; f < flowers.length; f++) {
        const fl = flowers[f];
        const age = t - openAt - fl.delay;
        if (age <= 0) continue;
        const b = easeBack(age / 1.1);
        const q = onPerim(fl.t, w, h, x0, y0);
        const sc = Math.max(0, b) * (1 + 0.045 * Math.sin(t * 1.3 + fl.ph));
        c.save();
        c.translate(q[0] + q[2] * fl.off, q[1] + q[3] * fl.off);
        c.rotate(fl.rot0 + t * fl.spin - (1 - Math.min(1, b)) * 1.4);
        c.scale(sc, sc);
        c.globalAlpha = alpha * Math.min(1, age * 2) * (0.8 + 0.2 * Math.sin(t * 2 + fl.ph));
        c.drawImage(fl.spr, -fl.size * 2, -fl.size * 2, fl.size * 4, fl.size * 4);
        c.restore();
      }

      /* sparkles */
      c.lineWidth = 1;
      c.lineCap = 'round';
      for (let s = 0; s < sparks.length; s++) {
        const sp = sparks[s];
        const v = Math.pow(Math.max(0, Math.sin(t * sp.sp + sp.ph)), 7);
        if (v < 0.03) continue;
        const r = onPerim(sp.t + Math.sin(t * 0.07 + sp.ph) * 0.004, w, h, x0, y0);
        const x = r[0] + r[2] * sp.off;
        const y = r[1] + r[3] * sp.off;
        const L = sp.sz * (0.5 + v);
        c.globalAlpha = alpha * v;
        c.strokeStyle = 'rgba(255,246,255,1)';
        c.beginPath();
        c.moveTo(x - L, y);
        c.lineTo(x + L, y);
        c.moveTo(x, y - L);
        c.lineTo(x, y + L);
        c.stroke();
        c.beginPath();
        c.arc(x, y, L * 0.3, 0, 6.2832);
        c.fillStyle = 'rgba(255,225,245,1)';
        c.fill();
      }

      c.globalAlpha = 1;
      c.globalCompositeOperation = 'source-over';
    }

    if (isScheduleOpen) {
      seed();
      openAt = performance.now() / 1000;
      rafId = requestAnimationFrame(frame);
    } else {
      if (rafId) cancelAnimationFrame(rafId);
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, cv.width, cv.height);
    }

    const onResize = () => {
      if (isScheduleOpen) seed();
      else sizeCanvas();
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, [isScheduleOpen]);

  // Current Astana time calculations for active schedule rendering
  const astanaNow = getAstanaNow();
  const ahead = (viewDayIndex - astanaNow.wd + 7) % 7;
  const currentLessons = SCHEDULE[viewDayIndex] || [];
  const targetDate = new Date(Date.UTC(astanaNow.y, astanaNow.mo, astanaNow.dt + ahead));
  const prefix = ahead === 0 ? 'Сегодня' : ahead === 1 ? 'Завтра' : 'Ближайший';
  const dateStr = targetDate.getUTCDate() + ' ' + MONTHS[targetDate.getUTCMonth()];
  const subText = prefix + ' · ' + dateStr + (currentLessons.length ? ' · ' + currentLessons.length + ' ' + plural(currentLessons.length) : ' · без пар');

  // Compute lesson statuses (past, now, next, later)
  let foundNext = false;
  const statuses = currentLessons.map((l) => {
    if (ahead !== 0) return '';
    const a = toMin(l.a), b = toMin(l.b);
    if (astanaNow.min >= b) return 'past';
    if (astanaNow.min >= a) return 'now';
    if (!foundNext) {
      foundNext = true;
      return 'next';
    }
    return 'later';
  });

  const nextInfo = getNextLesson(astanaNow);
  let nextWhenText = '';
  if (nextInfo) {
    nextWhenText = (nextInfo.k === 0 ? 'Сегодня' : nextInfo.k === 1 ? 'Завтра' : DAYS[nextInfo.idx].g.charAt(0).toUpperCase() + DAYS[nextInfo.idx].g.slice(1)) + ' в ' + nextInfo.l.a;
  }

  return (
    <>
      {/* 3D Valley canvas container required by Gladeye engine */}
      <div id="valley" aria-hidden="true">
        <div className="js-canvas-container"></div>
      </div>

      {/* Main Interface layer */}
      <div className={`ui ${introShown ? 'on' : ''}`} id="ui">
        <header>
          <button
            type="button"
            className="logo dias-trigger"
            onClick={() => setIsDiasOpen(true)}
            aria-label="Dias.AI APE2601"
          >
            APE2601
          </button>
        </header>

        <section className="hero">
          <h1>{astanaDay.weekday}.</h1>
          <p className="cap">
            {astanaDay.formattedDate}
            <br />
            Время в Астане: {astanaDay.time} (UTC+5)
          </p>

          <button
            type="button"
            className="open-btn"
            id="openBtn"
            aria-label="Открыть расписание"
            onPointerEnter={handleGoEnter}
            onPointerLeave={handleGoLeave}
            onClick={handleOpenSchedule}
          >
            Расписание
          </button>
        </section>

        <div className="corner">
          <button
            className="sound"
            id="sound"
            aria-pressed={isAudioPlaying ? 'true' : 'false'}
            aria-label="Playboi Carti — Location"
            title={isAudioPlaying ? 'Фоновая музыка: Playboi Carti — Location (играет)' : 'Включить музыку: Playboi Carti — Location'}
            onClick={handleToggleSound}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5Z" />
              <path className="w" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
              <path className="x" d="m16 10 4 4m0-4-4 4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Flower canvas & Scrim from user snippet */}
      <canvas id="fx" ref={canvasRef} aria-hidden="true"></canvas>
      <div
        className={`scrim ${isScheduleOpen ? 'show' : ''}`}
        id="scrim"
        onClick={handleCloseSchedule}
        aria-hidden="true"
      ></div>

      {/* Frosted Glass Window from user snippet */}
      <section
        ref={winRef}
        className={`win ${isScheduleOpen ? 'show' : ''}`}
        id="win"
        role="dialog"
        aria-modal="true"
        aria-label="Расписание пар"
        tabIndex={-1}
        style={{ display: isScheduleOpen ? 'flex' : 'none' }}
      >
        {/* Top Header: Astana Time + Dedicated Close Button */}
        <div className="top">
          <div>
            Астана<span className="clock" id="clock">{astanaDay.time}</span>
          </div>
          <button
            className="close"
            id="closeBtn"
            type="button"
            aria-label="Закрыть"
            onClick={handleCloseSchedule}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        {/* Head: Nav prev + Day title with animated gradient + Nav next */}
        <div className="head">
          <button
            className="nav"
            id="prev"
            type="button"
            aria-label="Предыдущий день"
            onClick={() => handleGo(-1)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 3L5 9l6 6" />
            </svg>
          </button>
          <div>
            <div className={`dow ${animDir > 0 ? 'swap-r' : animDir < 0 ? 'swap-l' : ''}`} id="dow">
              {DAYS[viewDayIndex].n}
            </div>
            <div className={`sub ${animDir > 0 ? 'swap-r' : animDir < 0 ? 'swap-l' : ''}`} id="sub">
              {subText}
            </div>
          </div>
          <button
            className="nav"
            id="next"
            type="button"
            aria-label="Следующий день"
            onClick={() => handleGo(1)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 3l6 6-6 6" />
            </svg>
          </button>
        </div>

        {/* Weekday selector pills */}
        <div className="pills" id="pills" role="tablist" aria-label="Дни недели">
          {DAYS.map((d, i) => {
            const isToday = i === astanaNow.wd;
            const isOn = i === viewDayIndex;
            const isOff = i > 4;
            return (
              <button
                key={d.s}
                type="button"
                className={`pill ${isOn ? 'on' : ''} ${isToday ? 'today' : ''} ${isOff ? 'off' : ''}`}
                role="tab"
                aria-label={d.n}
                aria-selected={isOn}
                onClick={() => handlePillClick(i)}
              >
                {d.s}
              </button>
            );
          })}
        </div>

        {/* Lesson list & rest/weekend states */}
        <ol className="list" id="list" aria-live="polite">
          {currentLessons.length === 0 ? (
            <li className="rest">
              <h3>Выходной</h3>
              <p>
                {nextInfo ? (
                  <>
                    Ближайшая пара: <b>{nextWhenText}</b>, {nextInfo.l.t}.
                  </>
                ) : (
                  'Пар нет.'
                )}
              </p>
            </li>
          ) : (
            currentLessons.map((l, i) => {
              const s = statuses[i] || '';
              let label = '';
              let percent = 0;

              if (s === 'now') {
                label = 'Идёт сейчас · ещё ' + dur(toMin(l.b) - astanaNow.min);
                const a = toMin(l.a) * 60;
                const b = toMin(l.b) * 60;
                const c = astanaNow.min * 60 + astanaNow.s;
                percent = Math.max(0, Math.min(100, ((c - a) / (b - a)) * 100));
              } else if (s === 'next') {
                label = 'Следующая · через ' + dur(toMin(l.a) - astanaNow.min);
              }

              const chipClass = l.k === LEC ? 'lec' : l.k === PRA ? 'prac' : '';

              return (
                <li
                  key={l.t + i}
                  className={`lesson ${s}`}
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <span className="num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className="time">
                    <b>{l.a}</b>
                    <span>{l.b}</span>
                  </div>
                  <div className="info">
                    <div className="name">{l.t}</div>
                    <div className="room">{l.r}</div>
                    <div className="meta">
                      <span className={`chip ${chipClass}`}>
                        {l.k || 'Занятие'}
                      </span>
                      {label && <span className="state">{label}</span>}
                    </div>
                  </div>
                  {s === 'now' && (
                    <i className="prog">
                      <u style={{ width: `${percent.toFixed(1)}%` }}></u>
                    </i>
                  )}
                </li>
              );
            })
          )}
        </ol>

        {/* Dedicated Window Footer with Exit Button */}
        <div className="win-foot">
          <div style={{ fontSize: '11px', color: 'var(--mute)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            Расписание группы APE2601
          </div>
          <button
            type="button"
            className="win-foot-btn"
            onClick={handleCloseSchedule}
            aria-label="Закрыть расписание"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
            Закрыть
          </button>
        </div>
      </section>

      {/* Initial loading screen */}
      <div className={`loader ${isLoaded ? 'gone' : ''}`} id="loader">
        <span></span>
      </div>

      {/* Dias.AI Assistant Modal */}
      <DiasAI isOpen={isDiasOpen} onClose={() => setIsDiasOpen(false)} />

      {/* Background audio track: Playboi Carti - Location */}
      <audio
        ref={bgAudioRef}
        src={`${import.meta.env.BASE_URL}valley/audio/ge-ambient.mp3`}
        loop
        preload="auto"
      />
    </>
  );
}

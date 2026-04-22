"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type Kind = "heart" | "ball" | "bomb";
type Falling = { id: number; x: number; speed: number; kind: Kind; rot: number };

const DURATION = 30;

export default function Game() {
  const [running, setRunning] = useState(false);
  const [ended, setEnded] = useState(false);
  const [time, setTime] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [items, setItems] = useState<Falling[]>([]);
  const [floatMsgs, setFloatMsgs] = useState<
    { id: number; x: number; y: number; text: string; color: string }[]
  >([]);
  const idRef = useRef(0);
  const timeRef = useRef(DURATION);
  const arenaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const b = Number(localStorage.getItem("lina-best") || 0);
    setBest(b);
  }, []);

  const end = useCallback(() => {
    setRunning(false);
    setEnded(true);
    setScore((s) => {
      const prev = Number(localStorage.getItem("lina-best") || 0);
      if (s > prev) {
        localStorage.setItem("lina-best", String(s));
        setBest(s);
      }
      return s;
    });
  }, []);

  const start = useCallback(() => {
    setScore(0);
    setTime(DURATION);
    timeRef.current = DURATION;
    setItems([]);
    setFloatMsgs([]);
    setEnded(false);
    setRunning(true);
  }, []);

  // countdown
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTime((v) => {
        const next = v - 1;
        timeRef.current = next;
        if (next <= 0) {
          clearInterval(t);
          end();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, end]);

  // spawner — bound once per run, reads difficulty from ref so we don't rebind each second
  useEffect(() => {
    if (!running) return;
    const spawn = setInterval(() => {
      const elapsed = DURATION - timeRef.current;
      setItems((prev) => {
        const r = Math.random();
        const kind: Kind = r < 0.7 ? "heart" : r < 0.9 ? "ball" : "bomb";
        const next: Falling = {
          id: ++idRef.current,
          x: 8 + Math.random() * 84,
          speed: Math.max(1.4, 2.6 - elapsed / 28 + Math.random() * 1.2),
          kind,
          rot: (Math.random() - 0.5) * 40,
        };
        return [...prev.slice(-30), next];
      });
    }, 380);
    return () => clearInterval(spawn);
  }, [running]);

  const catchItem = useCallback(
    (it: Falling, ev: React.MouseEvent | React.TouchEvent) => {
      const rect = arenaRef.current?.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if ("touches" in ev && ev.touches.length) {
        clientX = ev.touches[0].clientX;
        clientY = ev.touches[0].clientY;
      } else if ("clientX" in ev) {
        clientX = (ev as React.MouseEvent).clientX;
        clientY = (ev as React.MouseEvent).clientY;
      }
      const rx = rect ? clientX - rect.left : 0;
      const ry = rect ? clientY - rect.top : 0;

      let delta = 0;
      let text = "";
      let color = "";
      if (it.kind === "heart") {
        delta = 1;
        text = "+1 ♡";
        color = "#b02a25";
      } else if (it.kind === "ball") {
        delta = 3;
        text = "+3 🏀";
        color = "#e06a2a";
      } else {
        delta = -2;
        text = "−2";
        color = "#171210";
      }

      setScore((s) => Math.max(0, s + delta));
      const mid = ++idRef.current;
      setFloatMsgs((m) => [...m, { id: mid, x: rx, y: ry, text, color }]);
      setTimeout(() => setFloatMsgs((m) => m.filter((x) => x.id !== mid)), 700);
      setItems((prev) => prev.filter((p) => p.id !== it.id));
    },
    []
  );

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <section className="relative overflow-hidden border-b-2 border-[color:var(--color-ink)] bg-[color:var(--color-cobalt)] py-20 text-[color:var(--color-paper)] sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-10">
        <div className="flex flex-wrap items-start justify-between gap-5 sm:items-end sm:gap-6">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.28em] text-[color:var(--color-saffron)] sm:text-[11px] sm:tracking-[0.3em]">
              act iv — a very small game
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl italic leading-[0.95] sm:text-7xl" style={{ fontVariationSettings: "'SOFT' 80" }}>
              catch the hearts.<br />
              <span className="text-[color:var(--color-saffron)]">grab the balls.</span><br />
              <span className="text-[color:var(--color-peach)]">dodge the bombs.</span>
            </h2>
            <p className="mt-3 max-w-md text-sm text-[color:var(--color-paper)]/80 sm:mt-4 sm:text-base">
              {DURATION} seconds. ♡ = 1 point. 🏀 = 3 points. 💣 = −2. high score unlocks nothing, obviously.
            </p>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] sm:flex-col sm:items-end sm:gap-2 sm:text-xs sm:tracking-[0.22em]">
            <div className="rounded-full border-2 border-[color:var(--color-paper)] px-3 py-1">score · {score}</div>
            <div className="rounded-full border-2 border-[color:var(--color-paper)] px-3 py-1">time · {time}s</div>
            <div className="rounded-full border-2 border-[color:var(--color-saffron)] px-3 py-1 text-[color:var(--color-saffron)]">best · {best}</div>
          </div>
        </div>

        <div
          ref={arenaRef}
          className="relative mt-8 h-[440px] w-full touch-none select-none overflow-hidden rounded-2xl border-2 border-[color:var(--color-paper)] bg-[color:var(--color-cobalt)] sm:mt-12 sm:h-[520px] sm:rounded-3xl"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(242,231,207,0.06) 0 14px, transparent 14px 28px)",
          }}
        >
          {/* start overlay */}
          <AnimatePresence>
            {!running && !ended && (
              <motion.div
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[color:var(--color-cobalt)]/70 px-6 text-center backdrop-blur-sm"
              >
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="font-[family-name:var(--font-display)] text-4xl italic sm:text-5xl"
                >
                  ready, Lina?
                </motion.p>
                <button
                  onClick={start}
                  className="press rounded-full border-2 border-[color:var(--color-paper)] bg-[color:var(--color-saffron)] px-7 py-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.28em] text-[color:var(--color-ink)] sm:px-8"
                >
                  start ▶
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* end overlay */}
          <AnimatePresence>
            {ended && (
              <motion.div
                key="end"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[color:var(--color-cobalt)]/80 px-6 text-center backdrop-blur-sm"
              >
                <p className="stamp !border-[color:var(--color-paper)] !text-[color:var(--color-paper)]">time&apos;s up</p>
                <motion.p
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  className="font-[family-name:var(--font-display)] text-5xl italic text-[color:var(--color-saffron)] sm:text-6xl"
                >
                  {score}
                </motion.p>
                {score > best && (
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-peach)]">
                    new best!
                  </p>
                )}
                <button
                  onClick={start}
                  className="press mt-2 rounded-full border-2 border-[color:var(--color-paper)] bg-[color:var(--color-paper)] px-7 py-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.28em] text-[color:var(--color-ink)] sm:px-8"
                >
                  play again ↻
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* falling items */}
          {running &&
            items.map((it) => (
              <motion.button
                key={it.id}
                initial={{ y: -80, rotate: it.rot }}
                animate={{ y: 560, rotate: it.rot + 60 }}
                transition={{ duration: it.speed, ease: "linear" }}
                onAnimationComplete={() => removeItem(it.id)}
                onClick={(e) => catchItem(it, e)}
                onTouchStart={(e) => catchItem(it, e)}
                className="absolute flex -translate-x-1/2 cursor-pointer items-center justify-center p-3"
                style={{ left: `${it.x}%`, top: 0 }}
                aria-label={it.kind}
              >
                {it.kind === "heart" && <Heart />}
                {it.kind === "ball" && <Basketball />}
                {it.kind === "bomb" && <Bomb />}
              </motion.button>
            ))}

          {/* float messages */}
          <AnimatePresence>
            {floatMsgs.map((m) => (
              <motion.span
                key={m.id}
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -50, scale: 1.2 }}
                transition={{ duration: 0.7 }}
                className="pointer-events-none absolute font-[family-name:var(--font-display)] text-xl italic sm:text-2xl"
                style={{ left: m.x, top: m.y, color: m.color, translate: "-50% -50%", fontVariationSettings: "'SOFT' 100" }}
              >
                {m.text}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Heart() {
  return (
    <svg width="44" height="44" viewBox="0 0 42 42" className="drop-shadow-[3px_3px_0_rgba(23,18,16,0.7)]">
      <path
        d="M21 36 C 6 24, 6 10, 14 10 C 18 10, 21 14, 21 14 C 21 14, 24 10, 28 10 C 36 10, 36 24, 21 36 Z"
        fill="#b02a25"
        stroke="#171210"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Basketball() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" className="drop-shadow-[3px_3px_0_rgba(23,18,16,0.75)]">
      <circle cx="23" cy="23" r="20" fill="#e06a2a" stroke="#171210" strokeWidth="2.5" />
      <path d="M3 23 H 43" stroke="#171210" strokeWidth="2" fill="none" />
      <path d="M23 3 V 43" stroke="#171210" strokeWidth="2" fill="none" />
      <path d="M8 8 Q 23 23 8 38" stroke="#171210" strokeWidth="2" fill="none" />
      <path d="M38 8 Q 23 23 38 38" stroke="#171210" strokeWidth="2" fill="none" />
    </svg>
  );
}

function Bomb() {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" className="drop-shadow-[3px_3px_0_rgba(23,18,16,0.7)]">
      <circle cx="20" cy="24" r="14" fill="#171210" stroke="#171210" strokeWidth="2" />
      <path d="M28 14 L 34 8" stroke="#171210" strokeWidth="3" />
      <circle cx="35" cy="7" r="3" fill="#e8b339" />
      <circle cx="16" cy="20" r="2" fill="#f2e7cf" opacity="0.7" />
    </svg>
  );
}

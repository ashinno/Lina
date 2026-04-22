"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type Falling = { id: number; x: number; speed: number; kind: "heart" | "star" | "bomb"; rot: number };

const DURATION = 30; // seconds

export default function Game() {
  const [running, setRunning] = useState(false);
  const [ended, setEnded] = useState(false);
  const [time, setTime] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [items, setItems] = useState<Falling[]>([]);
  const [floatMsgs, setFloatMsgs] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([]);
  const idRef = useRef(0);
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

  const start = () => {
    setScore(0);
    setTime(DURATION);
    setItems([]);
    setEnded(false);
    setRunning(true);
  };

  // timer
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTime((v) => {
        if (v <= 1) {
          clearInterval(t);
          end();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, end]);

  // spawner
  useEffect(() => {
    if (!running) return;
    const spawn = setInterval(() => {
      setItems((prev) => {
        const next = [...prev];
        const r = Math.random();
        const kind: Falling["kind"] = r < 0.72 ? "heart" : r < 0.92 ? "star" : "bomb";
        next.push({
          id: ++idRef.current,
          x: 5 + Math.random() * 90,
          speed: 2 + Math.random() * 2.2 + (DURATION - time) / 18,
          kind,
          rot: (Math.random() - 0.5) * 30,
        });
        return next.slice(-40);
      });
    }, 420);
    return () => clearInterval(spawn);
  }, [running, time]);

  const catchItem = (it: Falling, ev: React.MouseEvent) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    const rx = rect ? ev.clientX - rect.left : 0;
    const ry = rect ? ev.clientY - rect.top : 0;

    let delta = 0;
    let text = "";
    let color = "";
    if (it.kind === "heart") { delta = 1; text = "+1 ♡"; color = "var(--color-oxblood)"; }
    else if (it.kind === "star") { delta = 3; text = "+3 ★"; color = "var(--color-cobalt)"; }
    else { delta = -2; text = "−2"; color = "var(--color-ink)"; }

    setScore((s) => Math.max(0, s + delta));
    const id = ++idRef.current;
    setFloatMsgs((m) => [...m, { id, x: rx, y: ry, text, color }]);
    setTimeout(() => setFloatMsgs((m) => m.filter((x) => x.id !== id)), 700);
    setItems((prev) => prev.filter((p) => p.id !== it.id));
  };

  return (
    <section className="relative overflow-hidden border-b-2 border-[color:var(--color-ink)] bg-[color:var(--color-cobalt)] py-24 text-[color:var(--color-paper)]">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-saffron)]">
              act iv — a very small game
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-5xl italic sm:text-7xl" style={{ fontVariationSettings: "'SOFT' 80" }}>
              catch the hearts.<br /><span className="text-[color:var(--color-saffron)]">dodge the bombs.</span>
            </h2>
            <p className="mt-4 max-w-md text-[color:var(--color-paper)]/80">
              {DURATION} seconds. hearts are worth 1, stars are worth 3, bombs cost you 2. high score unlocks nothing, obviously.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em]">
            <div className="rounded-full border-2 border-[color:var(--color-paper)] px-4 py-1">score · {score}</div>
            <div className="rounded-full border-2 border-[color:var(--color-paper)] px-4 py-1">time · {time}s</div>
            <div className="rounded-full border-2 border-[color:var(--color-saffron)] px-4 py-1 text-[color:var(--color-saffron)]">best · {best}</div>
          </div>
        </div>

        <div
          ref={arenaRef}
          className="relative mt-12 h-[520px] w-full overflow-hidden rounded-3xl border-2 border-[color:var(--color-paper)] bg-[color:var(--color-cobalt)]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(242,231,207,0.06) 0 14px, transparent 14px 28px)",
          }}
        >
          {/* start / end overlays */}
          {!running && !ended && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[color:var(--color-cobalt)]/70 backdrop-blur-sm">
              <p className="font-[family-name:var(--font-display)] text-4xl italic">ready?</p>
              <button
                onClick={start}
                className="press rounded-full border-2 border-[color:var(--color-paper)] bg-[color:var(--color-saffron)] px-8 py-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.28em] text-[color:var(--color-ink)]"
              >
                start ▶
              </button>
            </div>
          )}

          {ended && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[color:var(--color-cobalt)]/80 backdrop-blur-sm">
              <p className="stamp !border-[color:var(--color-paper)] !text-[color:var(--color-paper)]">time&apos;s up</p>
              <p className="font-[family-name:var(--font-display)] text-5xl italic text-[color:var(--color-saffron)]">
                {score} {score > best ? " · new best!" : ""}
              </p>
              <button
                onClick={start}
                className="press mt-2 rounded-full border-2 border-[color:var(--color-paper)] bg-[color:var(--color-paper)] px-8 py-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.28em] text-[color:var(--color-ink)]"
              >
                again ↻
              </button>
            </div>
          )}

          {/* falling items */}
          <AnimatePresence>
            {running && items.map((it) => (
              <motion.button
                key={it.id}
                initial={{ y: -80, rotate: it.rot }}
                animate={{ y: 560, rotate: it.rot + 30 }}
                exit={{ opacity: 0, scale: 1.4 }}
                transition={{ duration: it.speed, ease: "linear" }}
                onAnimationComplete={() => setItems((prev) => prev.filter((p) => p.id !== it.id))}
                onClick={(e) => catchItem(it, e)}
                className="absolute -translate-x-1/2 cursor-pointer"
                style={{ left: `${it.x}%`, top: 0 }}
                aria-label={it.kind}
              >
                {it.kind === "heart" && <Heart />}
                {it.kind === "star" && <Star />}
                {it.kind === "bomb" && <Bomb />}
              </motion.button>
            ))}
          </AnimatePresence>

          {/* float messages */}
          <AnimatePresence>
            {floatMsgs.map((m) => (
              <motion.span
                key={m.id}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.7 }}
                className="pointer-events-none absolute font-[family-name:var(--font-display)] text-2xl italic"
                style={{ left: m.x, top: m.y, color: m.color, translate: "-50% -50%" }}
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
    <svg width="42" height="42" viewBox="0 0 42 42" className="drop-shadow-[3px_3px_0_rgba(23,18,16,0.7)]">
      <path d="M21 36 C 6 24, 6 10, 14 10 C 18 10, 21 14, 21 14 C 21 14, 24 10, 28 10 C 36 10, 36 24, 21 36 Z" fill="#b02a25" stroke="#171210" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

function Star() {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" className="drop-shadow-[3px_3px_0_rgba(23,18,16,0.7)]">
      <path d="M21 4 L 25 16 L 38 16 L 27 24 L 31 37 L 21 29 L 11 37 L 15 24 L 4 16 L 17 16 Z" fill="#e8b339" stroke="#171210" strokeWidth="2.5" strokeLinejoin="round" />
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

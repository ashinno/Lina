"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const SECRETS = [
  "you laugh with your whole face",
  "we should dance in the kitchen tonight",
  "the first time i saw you — pure trouble",
  "you make ordinary days feel like festivals",
  "kanbghik bezzaf · كنبغيك بزاف",
  "twenty looks stupidly good on you",
  "watching you play ball is unreasonably attractive",
  "your voice = my favorite sound",
  "small reminder: you are the whole plot",
  "mint tea, you, a long afternoon — all i need",
  "you + me, a very small universe",
  "ntiya gamra dyali · you're my moon",
];

const PALETTE = ["#b02a25", "#2844c2", "#e8b339", "#f4a48a", "#4a6a3a"];

type Balloon = { id: number; x: number; delay: number; color: string; secret: string; drift: number };

export default function Balloons() {
  const initial = useMemo<Balloon[]>(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: 5 + (i * 8) % 90,
        delay: i * 0.4,
        color: PALETTE[i % PALETTE.length],
        secret: SECRETS[i % SECRETS.length],
        drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 4),
      })),
    []
  );

  const [balloons, setBalloons] = useState<Balloon[]>(initial);
  const [popped, setPopped] = useState<{ id: number; secret: string } | null>(null);
  const [count, setCount] = useState(0);

  const pop = (b: Balloon) => {
    setBalloons((prev) => prev.filter((x) => x.id !== b.id));
    setPopped({ id: b.id, secret: b.secret });
    setCount((c) => c + 1);
    setTimeout(() => setPopped((p) => (p?.id === b.id ? null : p)), 2800);
  };

  const reset = () => setBalloons(initial);

  return (
    <section className="relative overflow-hidden border-b-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-10 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.28em] text-[color:var(--color-oxblood)] sm:text-[11px] sm:tracking-[0.3em]">
              act i — catch them all
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl italic leading-[0.95] sm:text-6xl" style={{ fontVariationSettings: "'SOFT' 80" }}>
              pop a balloon,<br />steal a secret.
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-full border-2 border-[color:var(--color-ink)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] sm:px-4 sm:py-2 sm:text-xs">
              <span className="text-[color:var(--color-oxblood)]">{count}</span> / {SECRETS.length}
            </div>
            <button
              onClick={reset}
              className="press rounded-full border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-paper)] sm:px-4 sm:py-2 sm:text-xs"
            >
              refill ↺
            </button>
          </div>
        </div>

        <div className="relative mt-8 h-[440px] w-full overflow-hidden rounded-2xl border-2 border-dashed border-[color:var(--color-ink)]/30 sm:mt-12 sm:h-[520px] sm:rounded-3xl">
          {/* faint halftone field */}
          <div className="halftone absolute inset-0 opacity-10" />

          <AnimatePresence>
            {balloons.map((b) => (
              <motion.button
                key={b.id}
                initial={{ y: 600, opacity: 0 }}
                animate={{
                  y: [600, -40],
                  x: [0, b.drift, -b.drift, 0],
                  opacity: 1,
                }}
                exit={{ scale: 1.8, opacity: 0, transition: { duration: 0.18 } }}
                transition={{
                  y: { duration: 18 + (b.id % 5), repeat: Infinity, delay: b.delay, ease: "linear" },
                  x: { duration: 5 + (b.id % 3), repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
                }}
                onClick={() => pop(b)}
                className="absolute cursor-pointer"
                style={{ left: `${b.x}%`, top: 0 }}
                aria-label="pop balloon"
              >
                <BalloonSVG color={b.color} />
              </motion.button>
            ))}
          </AnimatePresence>

          {/* pop message */}
          <AnimatePresence>
            {popped && (
              <motion.div
                key={popped.id}
                initial={{ scale: 0.5, opacity: 0, rotate: -4 }}
                animate={{ scale: 1, opacity: 1, rotate: -2 }}
                exit={{ opacity: 0, y: -20 }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
              >
                <div className="max-w-sm rounded-2xl border-2 border-[color:var(--color-ink)] bg-[color:var(--color-saffron)] px-5 py-3 text-center shadow-[5px_5px_0_0_var(--color-ink)] sm:max-w-md sm:px-6 sm:py-4 sm:shadow-[6px_6px_0_0_var(--color-ink)]">
                  <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.28em] sm:text-[10px] sm:tracking-[0.3em]">secret #{popped.id + 1}</p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-xl italic leading-tight sm:text-2xl">
                    “{popped.secret}”
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {balloons.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="stamp text-[10px]">all secrets collected</p>
                <p className="mt-4 font-[family-name:var(--font-display)] text-3xl italic">
                  and there are still a thousand more.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BalloonSVG({ color }: { color: string }) {
  return (
    <svg width="64" height="96" viewBox="0 0 64 96" className="drop-shadow-[4px_4px_0_rgba(23,18,16,0.55)]">
      <ellipse cx="32" cy="34" rx="26" ry="32" fill={color} stroke="#171210" strokeWidth="2.5" />
      <path d="M22 18 Q 18 30 22 46" stroke="#fff8e0" strokeWidth="3" strokeLinecap="round" opacity="0.6" fill="none" />
      <path d="M32 66 L 30 72 L 34 72 Z" fill="#171210" />
      <path d="M32 72 Q 36 82 28 88 Q 34 92 32 96" stroke="#171210" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Confetti from "./Confetti";

const NAME = "Habibti"; // ← change to her name
const AGE = 20;

const CANDLE_COUNT = 5;

export default function Hero() {
  const [lit, setLit] = useState<boolean[]>(() => Array(CANDLE_COUNT).fill(true));
  const [micActive, setMicActive] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [level, setLevel] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const allOut = lit.every((l) => !l);

  useEffect(() => {
    if (allOut && !celebrate) {
      const t = setTimeout(() => setCelebrate(true), 250);
      return () => clearTimeout(t);
    }
  }, [allOut, celebrate]);

  const blowOne = useCallback(() => {
    setLit((prev) => {
      const idx = prev.findIndex((l) => l);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = false;
      return next;
    });
  }, []);

  const stopMic = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    setMicActive(false);
    setMicReady(false);
    setLevel(0);
  }, []);

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      analyserRef.current = analyser;
      setMicActive(true);
      setMicReady(true);

      const buf = new Uint8Array(analyser.fftSize);
      let sustained = 0;
      const tick = () => {
        if (!analyserRef.current) return;
        analyser.getByteTimeDomainData(buf);
        // RMS around 128
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        setLevel(rms);

        if (rms > 0.22) {
          sustained += 1;
          if (sustained > 4) {
            blowOne();
            sustained = 0;
          }
        } else {
          sustained = Math.max(0, sustained - 1);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setMicReady(false);
      setMicActive(false);
    }
  }, [blowOne]);

  useEffect(() => () => stopMic(), [stopMic]);

  const relight = () => {
    setLit(Array(CANDLE_COUNT).fill(true));
    setCelebrate(false);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden px-6 pt-6 pb-24 sm:px-10">
      {/* decorative border */}
      <div className="pointer-events-none absolute inset-4 rounded-[28px] border-2 border-dashed border-[color:var(--color-ink)]/25" />

      {/* top bar */}
      <div className="relative z-10 flex items-center justify-between font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70">
        <span>Édition №20 · Private Press</span>
        <span className="hidden sm:inline">22 · IV · MMXXVI</span>
        <span>Issue of One (1)</span>
      </div>

      {/* title */}
      <div className="relative z-10 mt-10 sm:mt-14 flex flex-col items-center text-center">
        <span className="stamp wobble text-[10px]">a love letter in four acts</span>

        <h1 className="mt-6 font-[family-name:var(--font-display)] leading-[0.82] tracking-tight">
          <span className="block text-[clamp(2.25rem,7vw,5.5rem)] italic text-[color:var(--color-ink)]/80" style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}>
            happy birthday,
          </span>
          <span className="mt-2 block text-[clamp(4.5rem,18vw,14rem)] font-black tracking-[-0.04em] text-[color:var(--color-oxblood)]" style={{ fontVariationSettings: "'SOFT' 0, 'opsz' 144" }}>
            {NAME}
          </span>
          <span className="-mt-2 block font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.5em] text-[color:var(--color-ink)]/60">
            born twenty years ago · today
          </span>
        </h1>

        {/* Cake */}
        <div className="relative mt-12 w-full max-w-xl">
          <Cake lit={lit} age={AGE} onTapCandle={(i) => setLit((p) => p.map((v, k) => (k === i ? false : v)))} />
          {/* Mic meter */}
          <div className="mx-auto mt-6 w-full max-w-sm">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--color-paper-dark)]">
              <motion.div
                className="h-full rounded-full bg-[color:var(--color-oxblood)]"
                animate={{ width: `${Math.min(100, level * 400)}%` }}
                transition={{ duration: 0.08 }}
              />
            </div>
            <p className="mt-2 text-center font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/60">
              {micActive ? "blow into the mic →" : "turn on the mic, or tap each candle"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {!micActive ? (
            <button
              onClick={startMic}
              className="press rounded-full border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-6 py-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[color:var(--color-paper)] hover:bg-[color:var(--color-oxblood)] hover:border-[color:var(--color-oxblood)]"
            >
              🎤 let me blow the candles
            </button>
          ) : (
            <button
              onClick={stopMic}
              className="press rounded-full border-2 border-[color:var(--color-ink)] px-6 py-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em]"
            >
              stop mic
            </button>
          )}
          <button
            onClick={blowOne}
            disabled={allOut}
            className="press rounded-full border-2 border-[color:var(--color-oxblood)] bg-[color:var(--color-paper)] px-6 py-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[color:var(--color-oxblood)] disabled:opacity-30"
          >
            blow (click)
          </button>
          {allOut && (
            <button
              onClick={relight}
              className="press rounded-full border-2 border-[color:var(--color-cobalt)] px-6 py-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[color:var(--color-cobalt)]"
            >
              relight
            </button>
          )}
        </div>
        {!micReady && micActive === false && (
          <p className="mt-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/50">
            if mic doesn&apos;t work on your phone, just tap the candles
          </p>
        )}
      </div>

      {/* side notes */}
      <div className="pointer-events-none absolute left-6 top-1/2 hidden -translate-y-1/2 -rotate-90 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.4em] text-[color:var(--color-ink)]/50 md:block">
        scroll down for surprises →
      </div>
      <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-90 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.4em] text-[color:var(--color-ink)]/50 md:block">
        ← built by hand, not by bots
      </div>

      <AnimatePresence>{celebrate && <CelebrationOverlay onClose={() => setCelebrate(false)} />}</AnimatePresence>
      <Confetti active={celebrate} />
    </section>
  );
}

/* ----------------------------------------------------------------- */

function Cake({
  lit,
  age,
  onTapCandle,
}: {
  lit: boolean[];
  age: number;
  onTapCandle: (i: number) => void;
}) {
  const candlePositions = lit.map((_, i) => {
    const spread = 180;
    const count = lit.length;
    const x = 160 + (i - (count - 1) / 2) * (spread / (count - 1));
    return x;
  });

  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[520px]">
      <svg viewBox="0 0 320 256" className="h-full w-full">
        {/* plate shadow */}
        <ellipse cx="160" cy="240" rx="120" ry="6" fill="#171210" opacity="0.18" />
        {/* plate */}
        <ellipse cx="160" cy="232" rx="130" ry="10" fill="#e9dcbd" stroke="#171210" strokeWidth="2" />

        {/* bottom tier */}
        <g>
          <rect x="50" y="170" width="220" height="64" rx="6" fill="#f4a48a" stroke="#171210" strokeWidth="2.5" />
          {/* drip */}
          <path d="M50 180 Q 70 200 90 180 Q 110 205 130 180 Q 150 200 170 180 Q 190 205 210 180 Q 230 200 250 180 Q 270 205 270 180 L 270 176 L 50 176 Z" fill="#b02a25" stroke="#171210" strokeWidth="2.5" strokeLinejoin="round" />
          {/* halftone */}
          <rect x="50" y="200" width="220" height="34" fill="url(#dots)" opacity="0.25" />
        </g>

        {/* middle tier */}
        <g>
          <rect x="90" y="120" width="140" height="54" rx="5" fill="#f2e7cf" stroke="#171210" strokeWidth="2.5" />
          <path d="M90 128 Q 110 145 130 128 Q 150 148 170 128 Q 190 145 210 128 Q 230 148 230 128 L 230 124 L 90 124 Z" fill="#2844c2" stroke="#171210" strokeWidth="2.5" strokeLinejoin="round" />
        </g>

        {/* top tier */}
        <g>
          <rect x="120" y="80" width="80" height="42" rx="4" fill="#e8b339" stroke="#171210" strokeWidth="2.5" />
          <path d="M120 86 Q 135 100 150 86 Q 165 102 180 86 Q 195 100 200 86 L 200 82 L 120 82 Z" fill="#b02a25" stroke="#171210" strokeWidth="2.5" strokeLinejoin="round" />
        </g>

        {/* age 20 on cake */}
        <text x="160" y="154" textAnchor="middle" fontSize="22" fontWeight="900" fill="#171210" fontFamily="var(--font-display)">
          {age}
        </text>

        {/* dots pattern */}
        <defs>
          <pattern id="dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="#171210" />
          </pattern>
        </defs>

        {/* candles */}
        {candlePositions.map((x, i) => (
          <g key={i} transform={`translate(${x - 160}, 0)`}>
            {/* wick */}
            <line x1="160" y1="54" x2="160" y2="62" stroke="#171210" strokeWidth="2" />
            {/* candle body */}
            <rect
              x="154"
              y="62"
              width="12"
              height="22"
              fill={i % 2 === 0 ? "#2844c2" : "#b02a25"}
              stroke="#171210"
              strokeWidth="2"
              onClick={() => onTapCandle(i)}
              className="cursor-pointer"
            />
            {/* stripe */}
            <line x1="154" y1="70" x2="166" y2="70" stroke="#f2e7cf" strokeWidth="1.5" />
            <line x1="154" y1="76" x2="166" y2="76" stroke="#f2e7cf" strokeWidth="1.5" />
          </g>
        ))}
      </svg>

      {/* Flames (HTML for animation) */}
      {candlePositions.map((x, i) => {
        const relX = (x / 320) * 100;
        return (
          <AnimatePresence key={i}>
            {lit[i] && (
              <motion.button
                aria-label={`candle ${i + 1}`}
                onClick={() => onTapCandle(i)}
                initial={{ opacity: 0, y: 8, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.2, transition: { duration: 0.25 } }}
                className="absolute -translate-x-1/2 cursor-pointer"
                style={{ left: `${relX}%`, top: "13%" }}
              >
                <div className="relative flicker">
                  <div className="h-4 w-3 rounded-t-full bg-gradient-to-t from-[color:var(--color-oxblood)] via-[color:var(--color-saffron)] to-[color:var(--color-paper)] shadow-[0_0_14px_rgba(232,179,57,0.7)]" />
                  <div className="absolute -inset-2 -z-10 rounded-full bg-[color:var(--color-saffron)] opacity-30 blur-md" />
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        );
      })}

      {/* smoke puff */}
      {lit.some((l, i) => !l && i === lit.lastIndexOf(false)) && (
        <motion.div
          key={`smoke-${lit.filter((l) => !l).length}`}
          initial={{ opacity: 0.8, y: 0 }}
          animate={{ opacity: 0, y: -40 }}
          transition={{ duration: 1.4 }}
          className="pointer-events-none absolute top-[8%] left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-[color:var(--color-ink)]/25 blur-md"
        />
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- */

function CelebrationOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--color-ink)]/55 px-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, rotate: -2, scale: 0.9 }}
        animate={{ y: 0, rotate: -1, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg rounded-3xl border-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)] p-10 text-center shadow-[12px_12px_0_0_var(--color-oxblood)]"
      >
        <div className="stamp mx-auto mb-4 text-[10px]">wish registered ✓</div>
        <h2 className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-oxblood)]" dir="rtl" lang="ar">
          عيد ميلاد سعيد
        </h2>
        <p className="mt-3 font-[family-name:var(--font-display)] text-2xl italic" style={{ fontVariationSettings: "'SOFT' 100" }}>
          sana sa‘ida · feliz cumpleaños · happy birthday
        </p>
        <p className="mt-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[color:var(--color-ink)]/70">
          wish captured at {new Date().toLocaleTimeString()}
        </p>
        <p className="mt-6 font-[family-name:var(--font-display)] text-lg italic">
          keep scrolling — the rest is waiting.
        </p>
        <button
          onClick={onClose}
          className="press mt-8 rounded-full border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-6 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-paper)]"
        >
          continue →
        </button>
      </motion.div>
    </motion.div>
  );
}

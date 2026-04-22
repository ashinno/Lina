"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Confetti from "./Confetti";

const NAME = "Lina";
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
  const shownOnceRef = useRef(false);

  const allOut = lit.every((l) => !l);

  // Fire the celebration exactly once per "all candles out" run.
  // Without this guard, closing the overlay while allOut is still true
  // would re-trigger the effect and the overlay would pop back up.
  useEffect(() => {
    if (allOut && !shownOnceRef.current) {
      shownOnceRef.current = true;
      const t = setTimeout(() => setCelebrate(true), 300);
      return () => clearTimeout(t);
    }
    if (!allOut) shownOnceRef.current = false;
  }, [allOut]);

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
    <section className="relative min-h-screen w-full overflow-hidden px-4 pt-5 pb-16 sm:px-10 sm:pt-6 sm:pb-24">
      {/* decorative border */}
      <div className="pointer-events-none absolute inset-2 rounded-[22px] border-2 border-dashed border-[color:var(--color-ink)]/25 sm:inset-4 sm:rounded-[28px]" />

      {/* top bar */}
      <div className="relative z-10 flex items-center justify-between font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/70 sm:text-[11px] sm:tracking-[0.2em]">
        <span>Édition №20</span>
        <span>for Lina · from Ash</span>
        <span className="hidden sm:inline">one of one</span>
      </div>

      {/* title */}
      <div className="relative z-10 mt-8 flex flex-col items-center text-center sm:mt-14">
        <span className="stamp wobble text-[10px]">a love letter in four acts</span>

        <h1 className="mt-5 font-[family-name:var(--font-display)] leading-[0.82] tracking-tight sm:mt-6">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="block text-[clamp(2rem,7vw,5.5rem)] italic text-[color:var(--color-ink)]/80"
            style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 144" }}
          >
            happy birthday,
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 140, damping: 18 }}
            className="mt-1 block text-[clamp(4.5rem,22vw,14rem)] font-black tracking-[-0.04em] text-[color:var(--color-oxblood)] sm:mt-2"
            style={{ fontVariationSettings: "'SOFT' 0, 'opsz' 144" }}
          >
            {NAME}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="mt-1 block font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.35em] text-[color:var(--color-ink)]/60 sm:text-[11px] sm:tracking-[0.5em]"
          >
            twenty · ‘20 · عشرون
          </motion.span>
        </h1>

        {/* Cake */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative mt-10 w-full max-w-xl sm:mt-12"
        >
          <Cake lit={lit} age={AGE} onTapCandle={(i) => setLit((p) => p.map((v, k) => (k === i ? false : v)))} />
          {/* Mic meter */}
          <div className="mx-auto mt-5 w-full max-w-sm px-2 sm:mt-6">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--color-paper-dark)]">
              <motion.div
                className="h-full rounded-full bg-[color:var(--color-oxblood)]"
                animate={{ width: `${Math.min(100, level * 400)}%` }}
                transition={{ duration: 0.08 }}
              />
            </div>
            <p className="mt-2 text-center font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/60">
              {micActive ? "blow into the mic →" : "tap the candles, or use the mic"}
            </p>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="mt-7 flex w-full max-w-md flex-wrap items-center justify-center gap-2.5 sm:mt-8 sm:gap-3">
          <button
            onClick={blowOne}
            disabled={allOut}
            className="press rounded-full border-2 border-[color:var(--color-oxblood)] bg-[color:var(--color-oxblood)] px-5 py-2.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-paper)] disabled:opacity-30 sm:px-6 sm:py-3 sm:text-xs"
          >
            blow one
          </button>
          {!micActive ? (
            <button
              onClick={startMic}
              className="press rounded-full border-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)] px-5 py-2.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] sm:px-6 sm:py-3 sm:text-xs"
            >
              🎤 use mic
            </button>
          ) : (
            <button
              onClick={stopMic}
              className="press rounded-full border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-5 py-2.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-paper)] sm:px-6 sm:py-3 sm:text-xs"
            >
              stop mic
            </button>
          )}
          {allOut && (
            <button
              onClick={relight}
              className="press rounded-full border-2 border-[color:var(--color-cobalt)] bg-[color:var(--color-paper)] px-5 py-2.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-cobalt)] sm:px-6 sm:py-3 sm:text-xs"
            >
              relight ↺
            </button>
          )}
        </div>
        {!micReady && micActive === false && (
          <p className="mt-3 max-w-xs font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/50 sm:text-[10px]">
            on safari/ios, tap &ldquo;use mic&rdquo; and allow access — or just tap candles
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
                className="absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center p-4"
                style={{ left: `${relX}%`, top: "13%" }}
              >
                <div className="relative flicker">
                  <div className="h-5 w-3.5 rounded-t-full bg-gradient-to-t from-[color:var(--color-oxblood)] via-[color:var(--color-saffron)] to-[color:var(--color-paper)] shadow-[0_0_14px_rgba(232,179,57,0.7)] sm:h-4 sm:w-3" />
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
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--color-ink)]/60 px-5 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ y: 48, rotate: -3, scale: 0.88 }}
        animate={{ y: 0, rotate: -1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.95, transition: { duration: 0.22 } }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[28px] border-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)] p-7 text-center shadow-[10px_10px_0_0_var(--color-oxblood)] sm:max-w-lg sm:p-10"
      >
        {/* bouncing basketball */}
        <motion.div
          initial={{ y: -80, rotate: 0 }}
          animate={{ y: [0, -18, 0, -8, 0], rotate: [0, 180, 360] }}
          transition={{ y: { duration: 1.4, delay: 0.2, times: [0, 0.3, 0.55, 0.78, 1] }, rotate: { duration: 1.4, delay: 0.2 } }}
          className="mx-auto mb-2 h-14 w-14"
          aria-hidden
        >
          <Basketball />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="stamp mx-auto text-[10px]"
        >
          wish registered ✓
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 160, damping: 16 }}
          className="mt-4 font-[family-name:var(--font-display)] text-4xl text-[color:var(--color-oxblood)] sm:text-5xl"
          dir="rtl"
          lang="ar"
        >
          عيد ميلاد سعيد يا لينا
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-3 font-[family-name:var(--font-display)] text-xl italic sm:text-2xl"
          style={{ fontVariationSettings: "'SOFT' 100" }}
        >
          happy birthday, Lina.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-4 font-[family-name:var(--font-display)] text-base italic text-[color:var(--color-ink)]/80 sm:text-lg"
        >
          keep scrolling — the rest is waiting for you.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05 }}
          onClick={onClose}
          className="press mt-7 rounded-full border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-7 py-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-paper)] hover:bg-[color:var(--color-oxblood)] hover:border-[color:var(--color-oxblood)]"
        >
          continue ↓
        </motion.button>

        {/* close (x) for mobile clarity */}
        <button
          onClick={onClose}
          aria-label="close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)] font-[family-name:var(--font-mono)] text-xs hover:bg-[color:var(--color-ink)] hover:text-[color:var(--color-paper)]"
        >
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
}

function Basketball() {
  return (
    <svg viewBox="0 0 56 56" className="h-full w-full drop-shadow-[3px_3px_0_rgba(23,18,16,0.7)]">
      <circle cx="28" cy="28" r="24" fill="#e06a2a" stroke="#171210" strokeWidth="2.5" />
      <path d="M4 28 H 52" stroke="#171210" strokeWidth="2" fill="none" />
      <path d="M28 4 V 52" stroke="#171210" strokeWidth="2" fill="none" />
      <path d="M10 10 Q 28 28 10 46" stroke="#171210" strokeWidth="2" fill="none" />
      <path d="M46 10 Q 28 28 46 46" stroke="#171210" strokeWidth="2" fill="none" />
    </svg>
  );
}

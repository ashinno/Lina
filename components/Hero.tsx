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
  onTapCandle,
}: {
  lit: boolean[];
  age: number;
  onTapCandle: (i: number) => void;
}) {
  // candles sit on the top tier surface; SVG viewBox is 360x320
  const CANDLE_COLORS = ["#2844c2", "#b02a25", "#e8b339", "#b02a25", "#2844c2"];
  const candleX = lit.map((_, i) => 138 + i * 21);
  const WICK_TOP = 38;
  const CANDLE_TOP = 46;
  const CANDLE_BOTTOM = 92;
  const VB_H = 320;
  const VB_W = 360;

  return (
    <div className="relative mx-auto aspect-[9/8] w-full max-w-[560px]">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="h-full w-full">
        <defs>
          <pattern id="zellij" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <path
              d="M8 0 L16 8 L8 16 L0 8 Z"
              fill="none"
              stroke="#171210"
              strokeWidth="0.7"
              opacity="0.55"
            />
            <circle cx="8" cy="8" r="1" fill="#171210" opacity="0.35" />
          </pattern>
          <pattern id="pearls" x="0" y="0" width="9" height="6" patternUnits="userSpaceOnUse">
            <circle cx="4.5" cy="3" r="2.3" fill="#f2e7cf" stroke="#171210" strokeWidth="1" />
          </pattern>
          <pattern id="pearlsDark" x="0" y="0" width="9" height="6" patternUnits="userSpaceOnUse">
            <circle cx="4.5" cy="3" r="2.3" fill="#e8b339" stroke="#171210" strokeWidth="1" />
          </pattern>
          <pattern id="sprinkles" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <rect x="4" y="3" width="5" height="1.8" fill="#b02a25" transform="rotate(30 6.5 4)" />
            <rect x="16" y="10" width="5" height="1.8" fill="#2844c2" transform="rotate(-45 18.5 11)" />
            <rect x="7" y="18" width="5" height="1.8" fill="#e8b339" transform="rotate(60 9.5 19)" />
            <rect x="20" y="21" width="5" height="1.8" fill="#4a6a3a" transform="rotate(15 22.5 22)" />
            <circle cx="22" cy="6" r="1.1" fill="#f2e7cf" />
            <circle cx="3" cy="13" r="1.1" fill="#f2e7cf" />
          </pattern>
          <radialGradient id="goldShine" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fff2c2" />
            <stop offset="55%" stopColor="#e8b339" />
            <stop offset="100%" stopColor="#b88318" />
          </radialGradient>
        </defs>

        {/* === GROUND SHADOW === */}
        <ellipse cx="180" cy="310" rx="140" ry="5" fill="#171210" opacity="0.2" />

        {/* === CAKE STAND === */}
        <g>
          {/* base foot */}
          <ellipse cx="180" cy="302" rx="58" ry="7" fill="#e9dcbd" stroke="#171210" strokeWidth="2.2" />
          <ellipse cx="180" cy="299" rx="52" ry="4" fill="#f2e7cf" opacity="0.85" />
          {/* stem (urn-shape) */}
          <path
            d="M 167 286
               L 167 290
               C 158 292 158 296 167 298
               L 193 298
               C 202 296 202 292 193 290
               L 193 286 Z"
            fill="#f2e7cf"
            stroke="#171210"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <line x1="170" y1="290" x2="170" y2="298" stroke="#171210" strokeWidth="0.8" opacity="0.5" />
          <line x1="190" y1="290" x2="190" y2="298" stroke="#171210" strokeWidth="0.8" opacity="0.5" />
          {/* plate (top of stand) */}
          <ellipse cx="180" cy="286" rx="140" ry="10" fill="#f2e7cf" stroke="#171210" strokeWidth="2.5" />
          <ellipse cx="180" cy="283" rx="132" ry="4" fill="#e9dcbd" opacity="0.55" />
          {/* gold rim on plate */}
          <path
            d="M 40 286 A 140 10 0 0 0 320 286"
            stroke="#e8b339"
            strokeWidth="1.2"
            fill="none"
            opacity="0.8"
          />
        </g>

        {/* === BOTTOM TIER — peach body with oxblood drip === */}
        <g>
          <rect
            x="66"
            y="215"
            width="228"
            height="66"
            rx="3"
            fill="#f4a48a"
            stroke="#171210"
            strokeWidth="2.5"
          />
          {/* subtle interior gradient — sprinkles sit on cake face */}
          <rect x="66" y="215" width="228" height="66" fill="url(#sprinkles)" opacity="0.55" />
          {/* shading at base */}
          <rect x="66" y="260" width="228" height="21" fill="#171210" opacity="0.08" />
          {/* scalloped drip body */}
          <path
            d="M 66 200
               L 294 200
               L 294 214
               Q 282.5 226 271 214
               Q 259.5 226 248 214
               Q 236.5 226 225 214
               Q 213.5 226 202 214
               Q 190.5 226 179 214
               Q 167.5 226 156 214
               Q 144.5 226 133 214
               Q 121.5 226 110 214
               Q 98.5 226 87 214
               Q 75.5 226 66 214 Z"
            fill="#b02a25"
            stroke="#171210"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* hanging drip tears (longer drops) */}
          <path d="M 102 214 Q 96 228 102 238 Q 108 228 102 214 Z" fill="#b02a25" stroke="#171210" strokeWidth="2" strokeLinejoin="round" />
          <path d="M 179 214 Q 172 232 179 244 Q 186 232 179 214 Z" fill="#b02a25" stroke="#171210" strokeWidth="2" strokeLinejoin="round" />
          <path d="M 248 214 Q 242 228 248 240 Q 254 228 248 214 Z" fill="#b02a25" stroke="#171210" strokeWidth="2" strokeLinejoin="round" />
          {/* glaze highlight */}
          <path d="M 75 203 L 80 210 M 145 203 L 150 211 M 215 203 L 220 210 M 280 203 L 285 209" stroke="#f4a48a" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
          {/* pearl border at bottom */}
          <rect x="66" y="277" width="228" height="5" fill="url(#pearls)" opacity="0.95" />
        </g>

        {/* === MIDDLE TIER — cream body, zellij pattern, cobalt drip, gold L monogram === */}
        <g>
          <rect
            x="96"
            y="155"
            width="168"
            height="60"
            rx="3"
            fill="#f2e7cf"
            stroke="#171210"
            strokeWidth="2.5"
          />
          {/* zellij inlay */}
          <rect x="96" y="155" width="168" height="60" fill="url(#zellij)" opacity="0.9" />
          {/* framed cartouche around monogram */}
          <rect
            x="148"
            y="166"
            width="64"
            height="42"
            rx="4"
            fill="#f2e7cf"
            stroke="#171210"
            strokeWidth="1.5"
          />
          <rect
            x="151"
            y="169"
            width="58"
            height="36"
            rx="3"
            fill="none"
            stroke="#e8b339"
            strokeWidth="1"
            opacity="0.8"
          />
          {/* gold "L" monogram */}
          <text
            x="180"
            y="203"
            textAnchor="middle"
            fontSize="44"
            fontWeight="900"
            fill="url(#goldShine)"
            stroke="#171210"
            strokeWidth="1.3"
            fontFamily="var(--font-fraunces), serif"
            fontStyle="italic"
          >
            L
          </text>
          {/* cobalt drip */}
          <path
            d="M 96 148
               L 264 148
               L 264 156
               Q 254.5 166 245 156
               Q 235.5 166 226 156
               Q 216.5 166 207 156
               Q 197.5 166 188 156
               Q 178.5 166 169 156
               Q 159.5 166 150 156
               Q 140.5 166 131 156
               Q 121.5 166 112 156
               Q 102.5 166 96 156 Z"
            fill="#2844c2"
            stroke="#171210"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* drip tears */}
          <path d="M 131 156 Q 125 168 131 178 Q 137 168 131 156 Z" fill="#2844c2" stroke="#171210" strokeWidth="2" strokeLinejoin="round" />
          <path d="M 207 156 Q 200 170 207 182 Q 214 170 207 156 Z" fill="#2844c2" stroke="#171210" strokeWidth="2" strokeLinejoin="round" />
          {/* drip highlight */}
          <path d="M 105 151 L 110 158 M 170 151 L 175 158 M 240 151 L 245 158" stroke="#8fa3ff" strokeWidth="1.2" opacity="0.55" strokeLinecap="round" />
          {/* pearl border */}
          <rect x="96" y="211" width="168" height="5" fill="url(#pearlsDark)" opacity="0.95" />
        </g>

        {/* === TOP TIER — saffron body, oxblood drip === */}
        <g>
          <rect
            x="126"
            y="100"
            width="108"
            height="55"
            rx="3"
            fill="#e8b339"
            stroke="#171210"
            strokeWidth="2.5"
          />
          {/* gold ribbon */}
          <rect x="126" y="128" width="108" height="6" fill="#b88318" opacity="0.55" />
          <path d="M 130 134 L 136 139 L 140 134 Z" fill="#b88318" opacity="0.7" />
          <path d="M 224 134 L 218 139 L 214 134 Z" fill="#b88318" opacity="0.7" />
          {/* star dots */}
          <circle cx="150" cy="145" r="1.3" fill="#171210" opacity="0.45" />
          <circle cx="180" cy="148" r="1.3" fill="#171210" opacity="0.45" />
          <circle cx="210" cy="145" r="1.3" fill="#171210" opacity="0.45" />
          {/* scalloped drip (oxblood) */}
          <path
            d="M 126 93
               L 234 93
               L 234 101
               Q 226 111 218 101
               Q 210 111 202 101
               Q 194 111 186 101
               Q 178 111 170 101
               Q 162 111 154 101
               Q 146 111 138 101
               Q 130 109 126 101 Z"
            fill="#b02a25"
            stroke="#171210"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* drip tears */}
          <path d="M 154 101 Q 149 112 154 122 Q 159 112 154 101 Z" fill="#b02a25" stroke="#171210" strokeWidth="2" strokeLinejoin="round" />
          <path d="M 202 101 Q 197 112 202 122 Q 207 112 202 101 Z" fill="#b02a25" stroke="#171210" strokeWidth="2" strokeLinejoin="round" />
          {/* pearl border */}
          <rect x="126" y="151" width="108" height="5" fill="url(#pearls)" opacity="0.95" />
        </g>

        {/* === CANDLES === tapered, with spiral stripes and wax drips === */}
        {candleX.map((x, i) => (
          <g key={i} onClick={() => onTapCandle(i)} className="cursor-pointer">
            {/* wick */}
            <line x1={x} y1={WICK_TOP} x2={x} y2={CANDLE_TOP} stroke="#171210" strokeWidth="2.2" strokeLinecap="round" />
            {/* candle body (tapered trapezoid) */}
            <path
              d={`M ${x - 4.5},${CANDLE_BOTTOM} L ${x - 3.5},${CANDLE_TOP} L ${x + 3.5},${CANDLE_TOP} L ${x + 4.5},${CANDLE_BOTTOM} Z`}
              fill={CANDLE_COLORS[i % CANDLE_COLORS.length]}
              stroke="#171210"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* spiral stripes */}
            <path
              d={`M ${x - 4},${CANDLE_BOTTOM - 6} Q ${x},${CANDLE_BOTTOM - 9} ${x + 4},${CANDLE_BOTTOM - 6}
                  M ${x - 4},${CANDLE_BOTTOM - 16} Q ${x},${CANDLE_BOTTOM - 19} ${x + 4},${CANDLE_BOTTOM - 16}
                  M ${x - 3.8},${CANDLE_BOTTOM - 26} Q ${x},${CANDLE_BOTTOM - 29} ${x + 3.8},${CANDLE_BOTTOM - 26}
                  M ${x - 3.6},${CANDLE_BOTTOM - 36} Q ${x},${CANDLE_BOTTOM - 38} ${x + 3.6},${CANDLE_BOTTOM - 36}`}
              fill="none"
              stroke="#f2e7cf"
              strokeWidth="1.3"
              opacity="0.9"
              strokeLinecap="round"
            />
            {/* wax drip on rim */}
            <path
              d={`M ${x + 3.5},${CANDLE_TOP + 1} L ${x + 3.5},${CANDLE_TOP + 5} Q ${x + 4.5},${CANDLE_TOP + 7} ${x + 3.2},${CANDLE_TOP + 5}`}
              fill={CANDLE_COLORS[i % CANDLE_COLORS.length]}
              opacity="0.7"
              strokeWidth="0"
            />
          </g>
        ))}

        {/* Decorative piped rosettes between tiers */}
        <g opacity="0.95">
          {/* bottom of top tier rosettes */}
          <circle cx="130" cy="154" r="2.8" fill="#f2e7cf" stroke="#171210" strokeWidth="1" />
          <circle cx="230" cy="154" r="2.8" fill="#f2e7cf" stroke="#171210" strokeWidth="1" />
          {/* bottom of middle tier rosettes */}
          <circle cx="100" cy="214" r="3" fill="#e8b339" stroke="#171210" strokeWidth="1" />
          <circle cx="260" cy="214" r="3" fill="#e8b339" stroke="#171210" strokeWidth="1" />
        </g>
      </svg>

      {/* Flames (HTML for flicker animation) */}
      {candleX.map((x, i) => {
        const relX = (x / VB_W) * 100;
        const relY = (WICK_TOP / VB_H) * 100;
        return (
          <AnimatePresence key={i}>
            {lit[i] && (
              <motion.button
                aria-label={`candle ${i + 1}`}
                onClick={() => onTapCandle(i)}
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.2, transition: { duration: 0.28 } }}
                transition={{ type: "spring", stiffness: 220, damping: 14 }}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center p-4"
                style={{ left: `${relX}%`, top: `${relY}%` }}
              >
                <div className="relative flicker">
                  <div className="h-5 w-3.5 rounded-t-full bg-gradient-to-t from-[color:var(--color-oxblood)] via-[color:var(--color-saffron)] to-[color:var(--color-paper)] shadow-[0_0_14px_rgba(232,179,57,0.8)] sm:h-[18px] sm:w-3" />
                  <div className="absolute -inset-2.5 -z-10 rounded-full bg-[color:var(--color-saffron)] opacity-35 blur-md" />
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        );
      })}

      {/* smoke puffs — one per recently-blown candle */}
      {lit.map((l, i) => {
        if (l) return null;
        const relX = (candleX[i] / VB_W) * 100;
        const relY = (WICK_TOP / VB_H) * 100;
        return (
          <motion.div
            key={`smoke-${i}-${l ? 1 : 0}`}
            initial={{ opacity: 0.6, y: 0, scale: 0.6 }}
            animate={{ opacity: 0, y: -50, scale: 1.3 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--color-ink)]/35 blur-md"
            style={{ left: `${relX}%`, top: `${relY}%` }}
          />
        );
      })}
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

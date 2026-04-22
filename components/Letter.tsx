"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

const PARAGRAPHS = [
  "it is the twenty-second of april and you are twenty years old and somewhere the world is paying attention, even if it doesn't know it.",
  "i wanted to build you something that can't be bought. no box, no ribbon — just a page that remembers today.",
  "thank you for being patient with me, for laughing at jokes that weren't funny yet, for the way you squint when you read things you don't fully trust.",
  "here's to the rest of the year, and all the ordinary tuesdays we'll manage to make feel like something.",
  "kanbghik — more every day, even when i'm bad at saying it. te amo. i love you. all of the above, and in that order.",
];

const SIGN_OFF = "— yours,";
const NAME = "ashinno"; // ← change to your name

export default function Letter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [shown, setShown] = useState(0); // paragraphs fully revealed
  const [typed, setTyped] = useState(""); // current paragraph text
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (!inView) return;
    if (shown >= PARAGRAPHS.length) {
      const t = setTimeout(() => setSigned(true), 500);
      return () => clearTimeout(t);
    }
    const target = PARAGRAPHS[shown];
    if (typed.length < target.length) {
      const t = setTimeout(() => setTyped(target.slice(0, typed.length + 1)), 16 + Math.random() * 24);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setShown((s) => s + 1);
      setTyped("");
    }, 450);
    return () => clearTimeout(t);
  }, [inView, shown, typed]);

  return (
    <section ref={ref} className="relative overflow-hidden border-b-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)] py-28">
      <div className="pointer-events-none absolute -top-10 left-10 h-40 w-40 rounded-full bg-[color:var(--color-oxblood)] opacity-15 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-56 w-56 rounded-full bg-[color:var(--color-cobalt)] opacity-15 blur-2xl" />

      <div className="mx-auto max-w-3xl px-6 sm:px-10">
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-moss)]">
          act iii — the letter
        </p>

        {/* paper */}
        <div className="relative mt-6 rounded-[28px] border-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper-dark)] p-8 shadow-[10px_10px_0_0_var(--color-oxblood)] sm:p-12">
          {/* ruled lines */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[28px] opacity-25"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0 38px, rgba(23,18,16,0.25) 38px 39px)",
            }}
          />

          <div className="relative">
            <div className="mb-6 flex items-center justify-between font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.28em] text-[color:var(--color-ink)]/60">
              <span>from · me</span>
              <span>to · you</span>
            </div>

            <div className="font-[family-name:var(--font-display)] text-xl leading-[1.55] sm:text-2xl" style={{ fontVariationSettings: "'SOFT' 40" }}>
              {PARAGRAPHS.slice(0, shown).map((p, i) => (
                <p key={i} className="mb-5">{p}</p>
              ))}
              {shown < PARAGRAPHS.length && (
                <p className="mb-5 caret">{typed}</p>
              )}
            </div>

            {signed && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-end justify-between"
              >
                <div>
                  <p className="font-[family-name:var(--font-display)] text-xl italic" style={{ fontVariationSettings: "'SOFT' 100" }}>
                    {SIGN_OFF}
                  </p>
                  <Signature name={NAME} />
                </div>
                <div className="stamp text-[10px]">sealed · 20</div>
              </motion.div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-ink)]/50">
          typed live · no undo
        </p>
      </div>
    </section>
  );
}

function Signature({ name }: { name: string }) {
  return (
    <motion.svg
      viewBox="0 0 260 90"
      className="mt-2 h-20 w-[260px] text-[color:var(--color-oxblood)]"
      aria-label={`signature: ${name}`}
    >
      <motion.path
        d="M10 60 C 30 20, 50 20, 55 55 C 55 70, 42 70, 48 55 C 56 35, 78 30, 80 60 C 82 75, 100 70, 110 45 C 120 20, 135 30, 130 60 C 125 85, 155 80, 165 50 C 172 30, 195 30, 190 60 C 185 78, 215 85, 240 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      />
      <text x="8" y="86" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="3" fill="currentColor">
        /{name.toLowerCase()}/
      </text>
    </motion.svg>
  );
}

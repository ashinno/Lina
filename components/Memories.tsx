"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

type Memory = {
  title: string;
  caption: string;
  date: string;
  bg: string;
  ink: string;
  shape: "circle" | "square" | "arch" | "tag";
  emoji: string;
};

// ↓ swap these with real photos later. place images in /public/memories and use next/image.
const MEMORIES: Memory[] = [
  { title: "the very first hello", caption: "you said something small and i forgot how to speak.", date: "chapter one", bg: "#f4a48a", ink: "#171210", shape: "circle", emoji: "✶" },
  { title: "that long walk", caption: "we missed the bus on purpose. best mistake.", date: "a tuesday", bg: "#2844c2", ink: "#f2e7cf", shape: "square", emoji: "☾" },
  { title: "your kitchen, 2am", caption: "pasta, playlist on shuffle, both singing wrong.", date: "a memory", bg: "#e8b339", ink: "#171210", shape: "arch", emoji: "✿" },
  { title: "the trip", caption: "the one where you laughed so hard you cried.", date: "summer", bg: "#4a6a3a", ink: "#f2e7cf", shape: "tag", emoji: "✸" },
  { title: "a small fight", caption: "we fixed it in ten minutes. still counts.", date: "weather: soft", bg: "#b02a25", ink: "#f2e7cf", shape: "circle", emoji: "♡" },
  { title: "19 → 20", caption: "and here we are.", date: "today", bg: "#e9dcbd", ink: "#171210", shape: "square", emoji: "★" },
];

export default function Memories() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["6%", "-40%"]);

  return (
    <section ref={ref} className="relative border-b-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper-dark)] py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="flex flex-col items-start gap-4">
          <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-cobalt)]">
            act ii — archive of small moments
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-5xl italic sm:text-7xl" style={{ fontVariationSettings: "'SOFT' 60" }}>
            <span className="squiggle">receipts</span> of a very<br />good year.
          </h2>
          <p className="max-w-xl font-[family-name:var(--font-body)] text-lg text-[color:var(--color-ink)]/75">
            a non-comprehensive index. most of the best parts aren&apos;t in here — they&apos;re living rent-free in my head.
          </p>
        </div>
      </div>

      <motion.div style={{ x }} className="mt-16 flex w-max gap-10 pl-[8vw] pr-[20vw]">
        {MEMORIES.map((m, i) => (
          <Card key={i} memory={m} i={i} />
        ))}
      </motion.div>

      <div className="mx-auto mt-12 max-w-6xl px-6 sm:px-10">
        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-ink)]/50">
          ↺ keep scrolling the page — the cards drift as you go
        </p>
      </div>
    </section>
  );
}

function Card({ memory, i }: { memory: Memory; i: number }) {
  const rotate = [-3, 2, -1, 4, -2, 1][i % 6];
  return (
    <motion.div
      whileHover={{ rotate: rotate * -0.3, y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      style={{ rotate: `${rotate}deg` }}
      className="relative w-[300px] shrink-0 sm:w-[340px]"
    >
      <div
        className="relative overflow-hidden rounded-[22px] border-2 border-[color:var(--color-ink)] p-5 shadow-[8px_8px_0_0_var(--color-ink)]"
        style={{ background: memory.bg, color: memory.ink }}
      >
        {/* frame: image placeholder block */}
        <div
          className="relative mb-4 aspect-[4/5] w-full overflow-hidden border-2 border-[color:var(--color-ink)]"
          style={{
            borderRadius:
              memory.shape === "circle" ? "100%" : memory.shape === "arch" ? "160px 160px 22px 22px" : memory.shape === "tag" ? "22px 22px 22px 22px" : "8px",
          }}
        >
          {/* risograph-ish gradient + halftone */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${memory.ink}22, transparent 60%), linear-gradient(135deg, ${memory.bg}, ${shift(memory.bg, -25)})`,
            }}
          />
          <div className="halftone absolute inset-0 opacity-20 mix-blend-multiply" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-[family-name:var(--font-display)] text-8xl italic opacity-70" style={{ color: memory.ink, fontVariationSettings: "'SOFT' 100" }}>
              {memory.emoji}
            </span>
          </div>
          <span className="absolute bottom-2 left-2 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.25em]" style={{ color: memory.ink }}>
            №{String(i + 1).padStart(2, "0")}
          </span>
        </div>

        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.3em] opacity-70">{memory.date}</p>
        <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl italic leading-tight" style={{ fontVariationSettings: "'SOFT' 80" }}>
          {memory.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed opacity-85">{memory.caption}</p>
      </div>
      {/* pin */}
      <div
        className="absolute -top-3 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[color:var(--color-ink)] shadow-[1px_1px_0_0_var(--color-ink)]"
        style={{ background: memory.bg }}
      />
    </motion.div>
  );
}

function shift(hex: string, amt: number) {
  const h = hex.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(h.slice(0, 2), 16) + amt));
  const g = Math.max(0, Math.min(255, parseInt(h.slice(2, 4), 16) + amt));
  const b = Math.max(0, Math.min(255, parseInt(h.slice(4, 6), 16) + amt));
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

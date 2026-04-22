"use client";

import { useEffect, useRef } from "react";

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  w: number;
  h: number;
  color: string;
  shape: "rect" | "circle" | "squiggle";
  life: number;
};

const COLORS = ["#b02a25", "#2844c2", "#e8b339", "#f4a48a", "#4a6a3a", "#171210"];

export default function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesRef = useRef<Piece[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const burst = (count: number) => {
      const w = window.innerWidth;
      for (let i = 0; i < count; i++) {
        piecesRef.current.push({
          x: w / 2 + (Math.random() - 0.5) * 200,
          y: window.innerHeight * 0.35,
          vx: (Math.random() - 0.5) * 12,
          vy: -Math.random() * 14 - 4,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.3,
          w: 6 + Math.random() * 10,
          h: 3 + Math.random() * 8,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          shape: (["rect", "circle", "squiggle"] as const)[Math.floor(Math.random() * 3)],
          life: 0,
        });
      }
    };

    if (active) {
      burst(180);
      setTimeout(() => burst(80), 400);
    }

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      piecesRef.current = piecesRef.current.filter((p) => p.life < 400 && p.y < window.innerHeight + 60);
      for (const p of piecesRef.current) {
        p.vy += 0.28; // gravity
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        p.life += 1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-p.w, 0);
          ctx.quadraticCurveTo(-p.w / 2, -p.h, 0, 0);
          ctx.quadraticCurveTo(p.w / 2, p.h, p.w, 0);
          ctx.stroke();
        }
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-40" />;
}

const WORDS = [
  "twenty trips around the sun",
  "★",
  "you are so loved",
  "✶",
  "عيد ميلاد سعيد",
  "✿",
  "habibti",
  "✦",
  "20 · عشرون · veinte",
  "☼",
  "sana sa‘ida",
  "❋",
];

export default function Marquee() {
  const line = [...WORDS, ...WORDS, ...WORDS].join("   ·   ");
  return (
    <div className="relative z-10 border-y-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] py-4 text-[color:var(--color-paper)]">
      <div className="flex overflow-hidden whitespace-nowrap">
        <div className="marquee flex shrink-0 gap-12 pr-12 font-[family-name:var(--font-display)] text-3xl italic" style={{ fontVariationSettings: "'SOFT' 100" }}>
          <span>{line}</span>
          <span aria-hidden>{line}</span>
        </div>
      </div>
    </div>
  );
}

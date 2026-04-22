export default function Footer() {
  return (
    <footer className="relative bg-[color:var(--color-ink)] text-[color:var(--color-paper)]">
      {/* zellij-inspired tile band */}
      <div
        aria-hidden
        className="h-5 w-full sm:h-6"
        style={{
          backgroundImage:
            "repeating-conic-gradient(from 45deg, var(--color-oxblood) 0 25%, var(--color-saffron) 0 50%, var(--color-cobalt) 0 75%, var(--color-paper) 0 100%)",
          backgroundSize: "24px 24px",
          opacity: 0.85,
        }}
      />
      <div className="mx-auto max-w-3xl px-6 py-14 text-center sm:py-20">
        <p className="font-[family-name:var(--font-display)] text-4xl leading-tight sm:text-6xl" dir="rtl" lang="ar">
          عيد ميلاد سعيد يا لينا
        </p>
        <p className="mt-4 font-[family-name:var(--font-display)] text-xl italic text-[color:var(--color-peach)] sm:text-2xl" style={{ fontVariationSettings: "'SOFT' 100" }}>
          all my love — Ash.
        </p>
      </div>
    </footer>
  );
}

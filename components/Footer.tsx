export default function Footer() {
  return (
    <footer className="relative bg-[color:var(--color-ink)] text-[color:var(--color-paper)]">
      {/* zellij-inspired tile band */}
      <div
        aria-hidden
        className="h-6 w-full"
        style={{
          backgroundImage:
            "repeating-conic-gradient(from 45deg, var(--color-oxblood) 0 25%, var(--color-saffron) 0 50%, var(--color-cobalt) 0 75%, var(--color-paper) 0 100%)",
          backgroundSize: "28px 28px",
          opacity: 0.8,
        }}
      />
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-saffron)]">
              colophon
            </p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-2xl italic leading-tight" style={{ fontVariationSettings: "'SOFT' 80" }}>
              hand-set in Fraunces &amp; DM Sans.
            </p>
            <p className="mt-2 text-sm text-[color:var(--color-paper)]/70">
              printed on recycled light · bound with care · no batteries required.
            </p>
          </div>
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-peach)]">
              on the matter
            </p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-2xl italic leading-tight" style={{ fontVariationSettings: "'SOFT' 80" }}>
              twenty years of being devastatingly lovable.
            </p>
            <p className="mt-2 text-sm text-[color:var(--color-paper)]/70">
              this page has no ads, no cookies, no analytics — just affection.
            </p>
          </div>
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-peach)]">
              encore
            </p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-tight" dir="rtl" lang="ar">
              عيد ميلاد سعيد يا حبيبتي
            </p>
            <p className="mt-2 text-sm text-[color:var(--color-paper)]/70">
              sana sa‘ida, ya habibti. ila 120 sana — and well past it.
            </p>
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--color-paper)]/20 pt-6 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-paper)]/50">
          <span>issue of one (1) · for you only</span>
          <span>press refresh to relive</span>
          <span>© everything good in me, {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

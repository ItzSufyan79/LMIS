/** Shared frame for the sign-in / sign-up screens. */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="shrink-0 text-[13px] font-semibold tracking-[-0.01em]">LMIS</span>
          <span className="hidden truncate text-[11px] text-ink-3 sm:inline">Labour Market Intelligence</span>
        </div>
        <a
          href="/"
          className="shrink-0 text-[11.5px] text-ink-3 transition-colors duration-150 hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
        >
          Explore without signing in
        </a>
      </header>

      <main className="flex flex-1 items-start justify-center px-5 py-10 sm:py-16">
        <div className="w-full max-w-[400px]">
          <h1 className="text-[24px] leading-tight font-medium tracking-[-0.02em]">{title}</h1>
          {subtitle && <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 border-t border-line pt-5">{footer}</div>}
        </div>
      </main>
    </div>
  )
}

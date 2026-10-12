export function Hero() {
  return (
    <div className="text-center space-y-4">
      {/* Tagline badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-primary border border-border text-label-code font-mono uppercase tracking-wider text-accent-emerald">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
        Codebase Investigation, Reimagined
      </div>

      {/* Main headline */}
      <h1 className="text-headline-xl md:text-[2.75rem] md:leading-[3.25rem] font-semibold text-text-primary tracking-tight">
        Every codebase has a story.{' '}
        <span className="text-accent-blue">Solve&nbsp;it.</span>
      </h1>

      {/* Supporting description */}
      <p className="text-body-lg text-text-secondary max-w-lg mx-auto leading-relaxed">
        Explore real codebases through interactive architecture maps and
        engineering missions grounded in actual source code.
      </p>
    </div>
  );
}

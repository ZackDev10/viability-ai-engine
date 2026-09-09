export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0e1a]">
      {/* Glow behind logo */}
      <div className="absolute h-24 w-24 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Pulsing logo */}
      <div className="flex items-center gap-3 animate-pulse">
        <span className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.8)]" />
        <span className="text-2xl font-bold tracking-tight text-white">
          Viability<span className="text-cyan-400">.ai</span>
        </span>
      </div>

      {/* Spinner */}
      <div className="mt-8 h-6 w-6 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />

      <p className="mt-4 text-xs text-cyan-300/30 font-mono">Loading...</p>
    </div>
  );
}

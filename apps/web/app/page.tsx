import Link from "next/link";
import { BarChart3, Crosshair, Sparkles, ArrowRight } from "lucide-react";
import HeroSection from "./components/HeroSection";

const TOOLS = [
  {
    icon: Sparkles,
    title: "AI Market Intelligence",
    desc: "Deep SWOT analysis powered by Gemini AI. Get instant insights on market positioning, competitive advantages, and strategic threats.",
    gradient: "from-purple-500/20 to-cyan-500/10",
    border: "hover:border-purple-500/40",
    shadow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.12)]",
  },
  {
    icon: BarChart3,
    title: "Live Financial Modeling",
    desc: "Real-time burn rate and cost tracking. Auto-save financial projections with dynamic unit economics and runway calculations.",
    gradient: "from-cyan-500/20 to-emerald-500/10",
    border: "hover:border-cyan-400/40",
    shadow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.12)]",
  },
  {
    icon: Crosshair,
    title: "Competitor Matrix",
    desc: "Visual landscape of your biggest threats. Scatter-chart competitors by market share and innovation index to find your edge.",
    gradient: "from-amber-500/20 to-rose-500/10",
    border: "hover:border-amber-500/40",
    shadow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.12)]",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-[#0a0e1a]">
      <HeroSection />

      {/* ──────────────────── Tools Grid ──────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Everything You Need to
            <span className="text-cyan-400"> Validate</span>
          </h2>
          <p className="mt-3 text-gray-400/80 max-w-2xl mx-auto">
            Three powerful engines working together to give you crystal-clear startup intelligence.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.title}
                className={`group rounded-2xl border border-cyan-400/20 bg-[#0f1424] p-8 ${tool.border} ${tool.shadow} transition-all duration-500 hover:scale-[1.03] relative overflow-hidden`}
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10 space-y-5">
                  <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center group-hover:border-cyan-400/40 transition-colors">
                    <Icon className="h-6 w-6 text-cyan-400" />
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="text-sm text-gray-400/80 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500/20 to-cyan-400/10 border border-cyan-400/40 hover:bg-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300"
          >
            Start Validating Your Idea
            <ArrowRight className="h-4 w-4 text-cyan-400" />
          </Link>
        </div>
      </section>

      {/* ──────────────────── Footer ──────────────────── */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-cyan-300/30">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            Viability<span className="text-cyan-400">.ai</span>
          </span>
          <span className="text-xs text-cyan-300/20">
            &copy; {new Date().getFullYear()} Viability.ai — AI-Powered Startup Validation
          </span>
        </div>
      </footer>
    </div>
  );
}

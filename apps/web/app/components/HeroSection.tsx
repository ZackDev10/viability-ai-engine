"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, Shield, Zap, X } from "lucide-react";

function FloatingDashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg animate-float-glow">
      <div className="relative rounded-2xl border border-cyan-400/30 bg-[#0f1424]/60 backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.12)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="text-xs font-mono text-emerald-400/80 uppercase tracking-wider">Live</span>
          </div>
          <span className="text-xs font-mono text-cyan-400/40">Viability.ai</span>
        </div>

        <div className="mb-5">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm text-cyan-300/60">Viability Score</span>
            <span className="text-3xl font-bold font-mono text-cyan-400">
              87<span className="text-lg text-cyan-400/60">%</span>
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#0a0e1a] overflow-hidden border border-cyan-400/10">
            <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
            <p className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-wider">Strength</p>
            <p className="text-xs text-gray-300/80 truncate">First-mover advantage</p>
          </div>
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2">
            <p className="text-[10px] font-semibold text-rose-400/80 uppercase tracking-wider">Weakness</p>
            <p className="text-xs text-gray-300/80 truncate">Brand awareness</p>
          </div>
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2">
            <p className="text-[10px] font-semibold text-blue-400/80 uppercase tracking-wider">Opportunity</p>
            <p className="text-xs text-gray-300/80 truncate">Market expansion</p>
          </div>
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
            <p className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-wider">Threat</p>
            <p className="text-xs text-gray-300/80 truncate">New entrants</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-[#0a0e1a]/80 border border-cyan-400/10 px-4 py-3">
          <span className="text-xs text-cyan-300/50">Monthly Burn</span>
          <span className="text-lg font-bold font-mono text-cyan-300">
            $4,200<span className="text-xs text-cyan-300/40">/mo</span>
          </span>
        </div>

        <div className="absolute -top-1 -right-1 h-20 w-20 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-2 -left-2 h-16 w-16 rounded-full bg-purple-500/10 blur-3xl" />
      </div>
    </div>
  );
}

export default function HeroSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <>
      <section className="relative mx-auto max-w-6xl px-6 pt-28 pb-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 select-none">
          <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-cyan-500/5 blur-[120px]" />
          <div className="absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        <div className="relative flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5 text-xs font-medium text-cyan-300/80 mb-6">
              <Shield className="h-3 w-3 text-cyan-400" />
              Enterprise-Grade AI Validation
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Stop Guessing.
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-cyan-400 bg-clip-text text-transparent">
                Start Building.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-gray-400/90 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Use enterprise-grade AI to validate your startup idea, analyze market growth, and calculate live burn rates before you write a single line of code.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500/20 to-cyan-400/10 border border-cyan-400/40 hover:bg-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300"
              >
                Start for Free
                <ArrowRight className="h-4 w-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => setIsVideoOpen(true)}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium text-gray-400 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/30 transition-all duration-300"
              >
                <Zap className="h-4 w-4" />
                Watch Demo
              </button>
            </div>

            <div className="mt-10 flex items-center gap-6 text-xs text-cyan-300/30 justify-center lg:justify-start">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400/60" />
                AI-Powered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-cyan-400/40" />
                No Credit Card
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-cyan-400/40" />
                Free Tier
              </span>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <FloatingDashboardPreview />
          </div>
        </div>
      </section>

      {/* ── Video Modal ── */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsVideoOpen(false)}
        >
          <div className="relative w-full max-w-4xl">
            {/* Close button */}
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
              aria-label="Close video"
            >
              <X className="h-6 w-6" />
            </button>

            {/* 16:9 video container */}
            <div
              className="relative w-full rounded-2xl overflow-hidden border border-cyan-400/30 shadow-[0_0_60px_rgba(6,182,212,0.2)]"
              style={{ aspectRatio: "16 / 9" }}
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Viability.ai Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

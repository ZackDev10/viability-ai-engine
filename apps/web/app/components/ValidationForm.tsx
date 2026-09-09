"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase/browser";
import BmcDashboard from "./BmcDashboard";
import { Loader2 } from "lucide-react";
import type { MarketAnalysis } from "./MarketDashboard";

const API_URL = "http://localhost:8000/validate";

type ProgressMsg = { type: "progress"; step: string; percent: number };
type ResultMsg = {
  type: "result";
  viability_score: number;
  market_insights: string[];
  market_analysis: MarketAnalysis | null;
  risks: string[];
  research_grounded: boolean;
};

export default function ValidationForm() {
  const [industry, setIndustry] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [coreOffering, setCoreOffering] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ResultMsg | null>(null);
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [viabilityScore, setViabilityScore] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const STATUS_TEXTS = [
    "Booting AI Intelligence Engine...",
    "Analyzing Market Competitors...",
    "Calculating TAM Projections...",
    "Generating SWOT Matrix...",
    "Finalizing Viability Score...",
  ];

  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (!loading) {
      setStatusIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_TEXTS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setViabilityScore(0);
    setProgress(0);
    setStep(null);
    setLoading(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry,
          target_audience: targetAudience,
          core_offering: coreOffering,
        }),
        signal: ctrl.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          const payload = line.replace(/^data: /, "").trim();
          if (!payload) continue;
          try {
            const msg: ProgressMsg | ResultMsg = JSON.parse(payload);
            if (msg.type === "progress") {
              setStep(msg.step);
              setProgress(msg.percent);
            } else if (msg.type === "result") {
              setResult(msg);
              setProgress(100);
              setStep("Analysis complete");

              // Persist to Supabase
              setSaving(true);
              try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                  setStep("Sign in to save your validation.");
                  return;
                }

                // Find or create profile for this auth user
                const { data: existing } = await supabase
                  .from("profiles")
                  .select("id")
                  .eq("auth_user_id", user.id)
                  .maybeSingle();

                let profileId = existing?.id;
                if (!profileId) {
                  const { data: newProfile } = await supabase
                    .from("profiles")
                    .insert({
                      auth_user_id: user.id,
                      display_name: user.email?.split("@")[0] ?? "Founder",
                      company_name: industry,
                    })
                    .select("id")
                    .single();
                  profileId = newProfile?.id;
                }

                if (profileId) {
                  const { data: idea } = await supabase
                    .from("startup_ideas")
                    .insert({
                      profile_id: profileId,
                      title: coreOffering,
                      tagline: targetAudience,
                      industry,
                      // NOTE: market_analysis and risks are stuffed into this
                      // JSON blob for now since that's the existing pattern.
                      // If/when startup_ideas gets dedicated jsonb columns for
                      // market_analysis/risks, move them there instead —
                      // querying and re-rendering saved reports from a single
                      // text blob gets awkward fast.
                      description: JSON.stringify({
                        score: msg.viability_score,
                        insights: msg.market_insights,
                        market_analysis: msg.market_analysis,
                        risks: msg.risks,
                        research_grounded: msg.research_grounded,
                      }),
                      stage: "validation",
                    })
                    .select("id")
                    .single();
                  if (idea) {
                    console.log("✅ Idea saved", { id: idea.id });
                    setIdeaId(idea.id);
                    setViabilityScore(msg.viability_score);
                  }
                }
              } catch {
                setStep("Saved locally — Supabase not configured");
              } finally {
                setSaving(false);
              }
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setStep("Connection error — is the engine running?");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!ideaId ? (
        <motion.div
          key="validation"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen flex items-center justify-center bg-[#0a0e1a] p-4"
        >
      <div className={`w-full max-w-lg border rounded-2xl bg-[#0f1424] p-8 space-y-6 transition-all duration-500 ${loading ? "border-cyan-300/60 animate-border-pulse" : "border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.15)]"}`}>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Market Validation<span className="text-cyan-400">.</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-cyan-300/70 mb-1">
              Industry
            </label>
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Fintech, HealthTech, SaaS..."
              required
              className="w-full bg-[#0a0e1a] border border-cyan-400/20 rounded-lg px-4 py-2.5 text-white placeholder-cyan-300/30 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-cyan-300/70 mb-1">
              Target Audience
            </label>
            <input
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. SMBs, developers, designers..."
              required
              className="w-full bg-[#0a0e1a] border border-cyan-400/20 rounded-lg px-4 py-2.5 text-white placeholder-cyan-300/30 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-cyan-300/70 mb-1">
              Core Offering
            </label>
            <input
              value={coreOffering}
              onChange={(e) => setCoreOffering(e.target.value)}
              placeholder="e.g. AI fraud detection, no-code platform..."
              required
              className="w-full bg-[#0a0e1a] border border-cyan-400/20 rounded-lg px-4 py-2.5 text-white placeholder-cyan-300/30 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white bg-cyan-500/10 border border-cyan-400/40 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {STATUS_TEXTS[statusIndex]}
              </>
            ) : (
              "Validate Idea"
            )}
          </button>
        </form>

        {loading && (
          <div className="space-y-3">
            <div className="h-2 w-full rounded-full bg-[#0a0e1a] overflow-hidden border border-cyan-400/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan-300/60 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-300/80 font-semibold">
                Data Pipeline
              </span>
              <span className="text-cyan-300/40">|</span>
              <span className="truncate">{step}</span>
            </div>
          </div>
        )}

        {result && (
          <div className="border border-cyan-400/20 rounded-xl bg-[#0a0e1a] p-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-cyan-300/70">Viability Score</span>
              <span
                className={`text-3xl font-bold font-mono ${
                  result.viability_score >= 80
                    ? "text-green-400"
                    : result.viability_score >= 60
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                {result.viability_score}
                <span className="text-lg">%</span>
              </span>
            </div>
            {result.research_grounded && (
              <p className="text-[11px] font-mono text-emerald-300/60">
                Grounded in live market data
              </p>
            )}
            <ul className="space-y-2">
              {result.market_insights.map((insight, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-300"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <BmcDashboard
            ideaId={ideaId}
            viabilityScore={viabilityScore}
            industry={industry}
            targetAudience={targetAudience}
            coreOffering={coreOffering}
            marketAnalysis={result?.market_analysis ?? null}
            risks={result?.risks ?? []}
            researchGrounded={result?.research_grounded ?? false}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

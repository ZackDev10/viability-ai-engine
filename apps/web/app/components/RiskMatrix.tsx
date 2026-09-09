"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:8000/analyze-risk";

type Props = {
  viabilityScore: number;
  burnRate: number;
  industry?: string;
  targetAudience?: string;
  coreOffering?: string;
};

type RiskResult = {
  advice: string;
  severity: string;
  strategic_advice: string | null;
};

const SEVERITY_STYLES: Record<
  string,
  { border: string; shadow: string; dot: string }
> = {
  critical: {
    border: "border-amber-500/50",
    shadow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    dot: "bg-amber-400",
  },
  warning: {
    border: "border-amber-500/50",
    shadow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    dot: "bg-amber-400",
  },
  scaling_risk: {
    border: "border-amber-500/50",
    shadow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    dot: "bg-amber-400",
  },
  optimal: {
    border: "border-emerald-500/50",
    shadow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    dot: "bg-emerald-400",
  },
  moderate: {
    border: "border-cyan-400/40",
    shadow: "shadow-[0_0_20px_rgba(6,182,212,0.1)]",
    dot: "bg-cyan-400",
  },
};

export default function RiskMatrix({ viabilityScore, burnRate, industry, targetAudience, coreOffering }: Props) {
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!viabilityScore) return;

    const fetchRisk = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            viability_score: viabilityScore,
            monthly_burn_rate: burnRate,
            industry: industry ?? "",
            target_audience: targetAudience ?? "",
            core_offering: coreOffering ?? "",
          }),
        });
        const data: RiskResult = await res.json();
        setResult(data);
      } catch {
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRisk();
  }, [viabilityScore, burnRate]);

  const style = result
    ? SEVERITY_STYLES[result.severity] ?? SEVERITY_STYLES.moderate
    : null;

  return (
    <div
      className={`rounded-2xl border bg-[#0f1424] p-6 transition-all duration-500 ${
        style
          ? `${style.border} ${style.shadow}`
          : "border-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]"
      }`}
    >
      <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
        <span
          className={`h-2 w-2 rounded-full ${
            style ? style.dot : "bg-cyan-400"
          }`}
        />
        AI Risk Mitigation
      </h2>

      {loading && (
        <div className="flex items-center gap-3 text-sm text-cyan-300/60">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
          Consulting AI engine...
        </div>
      )}

      {result && style && (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0">
              {(result.severity === "critical" ||
                result.severity === "warning" ||
                result.severity === "scaling_risk") && (
                <svg
                  className="h-5 w-5 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
              )}
              {result.severity === "optimal" && (
                <svg
                  className="h-5 w-5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              )}
              {result.severity === "moderate" && (
                <svg
                  className="h-5 w-5 text-cyan-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
              )}
            </span>
            <p className="text-sm text-gray-200 leading-relaxed">
              {result.advice}
            </p>
          </div>
          {result.strategic_advice && (
            <div className="flex items-start gap-3 pt-3 border-t border-cyan-400/10">
              <span className="mt-0.5 shrink-0">
                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold text-cyan-400/80 uppercase tracking-wider mb-1">
                  YC Partner Analysis
                </p>
                <p className="text-sm text-gray-200/90 leading-relaxed italic">
                  &ldquo;{result.strategic_advice}&rdquo;
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 pt-2 text-xs text-cyan-300/40 border-t border-cyan-400/10">
            <span>
              Score: <span className="font-mono text-cyan-300/60">{viabilityScore}%</span>
            </span>
            <span className="text-cyan-400/20">|</span>
            <span>
              Burn: <span className="font-mono text-cyan-300/60">${burnRate.toLocaleString()}/mo</span>
            </span>
          </div>
        </div>
      )}

      {!loading && !result && (
        <p className="text-sm text-cyan-300/40">
          {viabilityScore
            ? "AI engine unreachable — start the viability engine."
            : "Submit a validation to receive AI risk analysis."}
        </p>
      )}
    </div>
  );
}

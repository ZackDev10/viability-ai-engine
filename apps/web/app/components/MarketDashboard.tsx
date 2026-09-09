"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  AlertTriangle,
  Crosshair,
  Brain,
  ShieldAlert,
  Radar,
} from "lucide-react";

type SWOT = {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
};

type MarketGrowthPoint = {
  year: string;
  value: number;
};

type Competitor = {
  name: string;
  x: number;
  y: number;
};

export type MarketAnalysis = {
  swot: SWOT;
  market_growth: MarketGrowthPoint[];
  competitors: Competitor[];
  strategy: string;
  confidence?: "high" | "medium" | "low";
};

type Props = {
  viabilityScore: number;
  // Everything below comes straight from the /validate pipeline result
  // (the structuring + critique agents already ran server-side) — this
  // component is purely presentational and makes no network calls of its
  // own. Burn-rate-specific advice/severity lives in RiskMatrix, not here.
  marketAnalysis?: MarketAnalysis | null;
  risks?: string[];
  researchGrounded?: boolean;
};

const SWOT_ICONS = {
  strengths: TrendingUp,
  weaknesses: TrendingDown,
  opportunities: Target,
  threats: AlertTriangle,
};

const SWOT_COLORS = {
  strengths: "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.12)]",
  weaknesses: "border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.12)]",
  opportunities: "border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.12)]",
  threats: "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)]",
};

const SWOT_DOT_COLORS = {
  strengths: "bg-emerald-400",
  weaknesses: "bg-rose-400",
  opportunities: "bg-blue-400",
  threats: "bg-amber-400",
};

const SWOT_LABELS: Record<string, string> = {
  strengths: "Strengths",
  weaknesses: "Weaknesses",
  opportunities: "Opportunities",
  threats: "Threats",
};

const CONFIDENCE_LABELS: Record<string, string> = {
  high: "High-confidence — grounded in live market data",
  medium: "Medium confidence — partially grounded in live data",
  low: "Low confidence — limited live data available for this query",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1424]/90 backdrop-blur-md border border-cyan-400/30 rounded-xl px-4 py-3 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <p className="text-cyan-300 font-semibold text-sm">{label ?? payload[0].payload.name}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-white/80 text-xs font-mono mt-1">
            {entry.name}: <span className="text-cyan-400">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MarketDashboard({
  viabilityScore,
  marketAnalysis = null,
  risks = [],
  researchGrounded = false,
}: Props) {
  if (!marketAnalysis) {
    return (
      <div className="rounded-2xl border border-cyan-400/20 bg-[#0f1424]/60 backdrop-blur-sm p-8 text-center">
        <Brain className="h-8 w-8 text-cyan-400/40 mx-auto mb-3" />
        <p className="text-sm text-cyan-300/50">
          {viabilityScore
            ? "Market analysis unavailable for this validation."
            : "Submit a validation to receive full market analysis."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Grounding badge ── */}
      {researchGrounded && (
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-300/70">
          <Radar className="h-3.5 w-3.5" />
          Grounded in live market data
        </div>
      )}
      {marketAnalysis.confidence && (
        <p className="text-xs text-cyan-300/40 -mt-6">
          {CONFIDENCE_LABELS[marketAnalysis.confidence] ?? marketAnalysis.confidence}
        </p>
      )}

      {/* ── SWOT 2x2 Grid ── */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <span className="h-2 w-2 rounded-full bg-purple-400" />
          SWOT Analysis
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(SWOT_ICONS) as (keyof typeof SWOT_ICONS)[]).map((key) => {
            const Icon = SWOT_ICONS[key];
            const items = marketAnalysis.swot?.[key] ?? [];
            return (
              <div
                key={key}
                className={`rounded-2xl border bg-[#0f1424]/80 backdrop-blur-md p-5 space-y-3 transition-all duration-300 hover:scale-[1.02] ${SWOT_COLORS[key]}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${SWOT_DOT_COLORS[key].replace("bg-", "text-")}`} />
                  <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                    {SWOT_LABELS[key]}
                  </h3>
                </div>
                <ul className="space-y-1.5">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300/90">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${SWOT_DOT_COLORS[key]}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Red Flags (critique / pre-mortem agent) ── */}
      {risks.length > 0 && (
        <div className="rounded-2xl border border-rose-500/30 bg-[#0f1424]/80 backdrop-blur-md p-6 shadow-[0_0_20px_rgba(244,63,94,0.08)]">
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2 mb-4">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            Red Flags — Why This Could Fail
          </h3>
          <ul className="space-y-2">
            {risks.map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Charts Row ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Market Growth BarChart */}
        <div className="rounded-2xl border border-cyan-400/30 bg-[#0f1424]/80 backdrop-blur-md p-6 shadow-[0_0_25px_rgba(6,182,212,0.08)]">
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2 mb-6">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            Market Growth (TAM Projection)
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={marketAnalysis.market_growth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(6,182,212,0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(103,232,249,0.5)", fontSize: 12, fontFamily: "monospace" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(103,232,249,0.5)", fontSize: 12, fontFamily: "monospace" }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(6,182,212,0.06)" }} />
              <Bar
                dataKey="value"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Competitor ScatterChart */}
        <div className="rounded-2xl border border-cyan-400/30 bg-[#0f1424]/80 backdrop-blur-md p-6 shadow-[0_0_25px_rgba(6,182,212,0.08)]">
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2 mb-6">
            <Crosshair className="h-4 w-4 text-cyan-400" />
            Competitor Landscape
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(6,182,212,0.08)"
              />
              <XAxis
                dataKey="x"
                name="Market Share"
                type="number"
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(103,232,249,0.5)", fontSize: 11, fontFamily: "monospace" }}
                label={{ value: "Market Share", position: "bottom", fill: "rgba(103,232,249,0.4)", fontSize: 10, fontFamily: "monospace" }}
              />
              <YAxis
                dataKey="y"
                name="Innovation Index"
                type="number"
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(103,232,249,0.5)", fontSize: 11, fontFamily: "monospace" }}
                label={{ value: "Innovation Index", angle: -90, position: "insideLeft", fill: "rgba(103,232,249,0.4)", fontSize: 10, fontFamily: "monospace" }}
              />
              <ZAxis range={[60, 60]} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(6,182,212,0.2)", strokeWidth: 1 }} />
              <Scatter
                data={marketAnalysis.competitors}
                fill="#06b6d4"
                stroke="rgba(6,182,212,0.6)"
                strokeWidth={2}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {marketAnalysis.competitors.map((c) => (
              <span key={c.name} className="flex items-center gap-1.5 text-xs text-cyan-300/50 font-mono">
                <span className="h-2 w-2 rounded-full bg-cyan-400/60" />
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Strategy ── */}
      <div className="rounded-2xl border border-cyan-400/30 bg-[#0f1424]/80 backdrop-blur-md p-6 shadow-[0_0_25px_rgba(6,182,212,0.08)]">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-2">
              Strategic Recommendation
            </h3>
            <p className="text-sm text-gray-200/90 leading-relaxed">
              {marketAnalysis.strategy}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browser";
import { motion } from "framer-motion";

/* ── Types ── */
type FinancialRow = {
  burn_rate: number | null;
  operating_expenses: number | null;
};

type IdeaRow = {
  id: string;
  industry: string;
  title: string;
  description: string | null;
  created_at: string;
  financials: FinancialRow[];
};

type Aggregates = {
  totalIdeas: number;
  avgScore: number | null;
  avgBurn: number | null;
};

/* ── Helpers ── */
const parseScore = (desc: string | null): number | null => {
  if (!desc) return null;
  try {
    return JSON.parse(desc).score ?? null;
  } catch {
    return null;
  }
};

const getBurn = (idea: IdeaRow): number | null => {
  const burn =
    idea.financials?.[0]?.burn_rate ??
    idea.financials?.[0]?.operating_expenses ??
    null;
  return burn !== null ? Number(burn) : null;
};

const computeAggregates = (ideas: IdeaRow[]): Aggregates => {
  const scores: number[] = [];
  const burns: number[] = [];

  for (const idea of ideas) {
    const score = parseScore(idea.description);
    if (score !== null) scores.push(score);

    const burn = getBurn(idea);
    if (burn !== null) burns.push(burn);
  }

  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

  const avgBurn =
    burns.length > 0
      ? Math.round(burns.reduce((a, b) => a + b, 0) / burns.length)
      : null;

  return {
    totalIdeas: ideas.length,
    avgScore,
    avgBurn,
  };
};

/* ── Metric Card ── */
function MetricCard({
  label,
  value,
  suffix = "",
  color = "cyan",
}: {
  label: string;
  value: string | number;
  suffix?: string;
  color?: "cyan" | "emerald" | "amber";
}) {
  const accent = {
    cyan: { border: "border-cyan-400/40", shadow: "shadow-[0_0_30px_rgba(6,182,212,0.15)]", text: "text-cyan-400" },
    emerald: { border: "border-emerald-400/40", shadow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]", text: "text-emerald-400" },
    amber: { border: "border-amber-400/40", shadow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]", text: "text-amber-400" },
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border ${accent.border} bg-[#0f1424] p-6 ${accent.shadow}`}
    >
      <p className="text-xs font-mono uppercase tracking-wider text-cyan-300/40 mb-2">
        {label}
      </p>
      <p className={`text-3xl font-bold font-mono ${accent.text}`}>
        {value}
        {suffix && <span className="text-lg ml-0.5 opacity-70">{suffix}</span>}
      </p>
    </motion.div>
  );
}

/* ── Page ── */
export default function AnalyticsPage() {
  const router = useRouter();
  const [aggregates, setAggregates] = useState<Aggregates | null>(null);
  const [ideas, setIdeas] = useState<IdeaRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("startup_ideas")
        .select("*, financials(burn_rate, operating_expenses)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const rows = data as unknown as IdeaRow[];
        setIdeas(rows);
        setAggregates(computeAggregates(rows));
      }
      setLoading(false);
    };

    load();
  }, [router]);

  if (!supabase) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <p className="text-cyan-300/50">Supabase not configured.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Analytics<span className="text-cyan-400">.</span>
          </h1>
          <p className="mt-1 text-sm text-cyan-300/50">
            Aggregate intelligence across all your validated ideas.
          </p>
        </motion.div>

        {!aggregates || aggregates.totalIdeas === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-cyan-400/20 bg-[#0f1424] p-12 text-center"
          >
            <p className="text-cyan-300/50">
              No validated ideas yet. Run your first validation to see analytics.
            </p>
          </motion.div>
        ) : (
          <>
            {/* ── KPI Grid ── */}
            <div className="grid gap-6 sm:grid-cols-3">
              <MetricCard
                label="Total Ideas Validated"
                value={aggregates.totalIdeas}
                color="cyan"
              />
              <MetricCard
                label="Average Viability Score"
                value={aggregates.avgScore ?? "—"}
                suffix="%"
                color={aggregates.avgScore !== null && aggregates.avgScore >= 70 ? "emerald" : "amber"}
              />
              <MetricCard
                label="Average Monthly Burn Rate"
                value={aggregates.avgBurn !== null ? `$${aggregates.avgBurn.toLocaleString()}` : "—"}
                suffix=""
                color={aggregates.avgBurn !== null && aggregates.avgBurn <= 1000 ? "emerald" : "amber"}
              />
            </div>

            {/* ── Validation History Table ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="rounded-2xl border border-cyan-400/40 bg-[#0f1424] shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-cyan-400/10">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  Validation History
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-cyan-400/10">
                      <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-cyan-300/40 font-medium">
                        Date
                      </th>
                      <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-cyan-300/40 font-medium">
                        Industry
                      </th>
                      <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-cyan-300/40 font-medium">
                        Core Offering
                      </th>
                      <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-cyan-300/40 font-medium text-right">
                        Viability Score
                      </th>
                      <th className="px-6 py-4 text-xs font-mono uppercase tracking-wider text-cyan-300/40 font-medium text-right">
                        Burn Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-400/5">
                    {ideas.map((idea, i) => {
                      const score = parseScore(idea.description);
                      const burn = getBurn(idea);
                      return (
                        <motion.tr
                          key={idea.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.03 }}
                          className="hover:bg-white/5 transition-colors duration-200 cursor-default"
                        >
                          <td className="px-6 py-4 text-sm text-cyan-300/60 font-mono whitespace-nowrap">
                            {new Date(idea.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400/60 bg-cyan-400/5 border border-cyan-400/10 rounded-full px-3 py-1">
                              {idea.industry}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {idea.title}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {score !== null ? (
                              <span
                                className={`text-sm font-bold font-mono ${
                                  score >= 80
                                    ? "text-emerald-400"
                                    : score >= 60
                                      ? "text-amber-400"
                                      : "text-red-400"
                                }`}
                              >
                                {score}
                                <span className="text-xs font-normal opacity-70">%</span>
                              </span>
                            ) : (
                              <span className="text-sm text-cyan-300/30">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {burn !== null ? (
                              <span className="text-sm font-mono text-cyan-300">
                                ${burn.toLocaleString()}
                                <span className="text-xs text-cyan-300/40">/mo</span>
                              </span>
                            ) : (
                              <span className="text-sm text-cyan-300/30">—</span>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

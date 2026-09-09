"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/browser";
import RiskMatrix from "./RiskMatrix";
import MarketDashboard, { type MarketAnalysis } from "./MarketDashboard";

type Props = {
  ideaId: string;
  viabilityScore: number;
  industry?: string;
  targetAudience?: string;
  coreOffering?: string;
  marketAnalysis?: MarketAnalysis | null;
  risks?: string[];
  researchGrounded?: boolean;
};

export default function BmcDashboard({
  ideaId,
  viabilityScore,
  industry,
  targetAudience,
  coreOffering,
  marketAnalysis = null,
  risks = [],
  researchGrounded = false,
}: Props) {
  const [serverCost, setServerCost] = useState(0);
  const [marketingSpend, setMarketingSpend] = useState(0);
  const [savedFinancialId, setSavedFinancialId] = useState<string | null>(null);

  const burnRate = serverCost + marketingSpend;

  // Load existing financials on mount
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("financials")
      .select("id, operating_expenses, revenue")
      .eq("startup_idea_id", ideaId)
      .eq("projection_year", new Date().getFullYear())
      .maybeSingle()
      .then(({ data }: { data: { id: string; operating_expenses: number | null; revenue: number | null } | null }) => {
        if (data) {
          setSavedFinancialId(data.id);
          // Treat operating_expenses as the combined burn for the current month
          setServerCost(Math.round((data.operating_expenses ?? 0) / 2));
          setMarketingSpend(
            Math.round((data.operating_expenses ?? 0) / 2),
          );
        }
      });
  }, [ideaId]);

  // Persist to financials whenever costs change
  const persist = useCallback(
    async (server: number, marketing: number) => {
      if (!supabase) return;
      const payload = {
        startup_idea_id: ideaId,
        projection_year: new Date().getFullYear(),
        operating_expenses: server + marketing,
        revenue: 0,
      };

      if (savedFinancialId) {
        await supabase
          .from("financials")
          .update(payload)
          .eq("id", savedFinancialId);
      } else {
        const { data } = await supabase
          .from("financials")
          .insert(payload)
          .select("id")
          .single();
        if (data) setSavedFinancialId(data.id);
      }
    },
    [ideaId, savedFinancialId],
  );

  const handleServerChange = (val: number) => {
    setServerCost(val);
    persist(val, marketingSpend);
  };

  const handleMarketingChange = (val: number) => {
    setMarketingSpend(val);
    persist(serverCost, val);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Dynamic BMC<span className="text-cyan-400">.</span>
          </h1>
          <p className="mt-1 text-sm text-cyan-300/50">
            Business Model Canvas — powered by live financials
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Cost Structure ── */}
          <div className="rounded-2xl border border-cyan-400/40 bg-[#0f1424] p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Cost Structure
            </h2>

            <div>
              <label className="block text-sm text-cyan-300/70 mb-1">
                Monthly Server Costs
              </label>
              <div className="flex items-center gap-2">
                <span className="text-cyan-300/50 text-sm">$</span>
                <input
                  type="number"
                  min={0}
                  value={serverCost || ""}
                  onChange={(e) =>
                    handleServerChange(Number(e.target.value))
                  }
                  placeholder="0"
                  className="w-full bg-[#0a0e1a] border border-cyan-400/20 rounded-lg px-4 py-2.5 text-white placeholder-cyan-300/30 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-cyan-300/70 mb-1">
                Marketing Spend
              </label>
              <div className="flex items-center gap-2">
                <span className="text-cyan-300/50 text-sm">$</span>
                <input
                  type="number"
                  min={0}
                  value={marketingSpend || ""}
                  onChange={(e) =>
                    handleMarketingChange(Number(e.target.value))
                  }
                  placeholder="0"
                  className="w-full bg-[#0a0e1a] border border-cyan-400/20 rounded-lg px-4 py-2.5 text-white placeholder-cyan-300/30 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <p className="text-xs text-cyan-300/40 pt-2 border-t border-cyan-400/10">
              Changes auto-save to the <span className="font-mono">financials</span> table.
            </p>
          </div>

          {/* ── Unit Economics ── */}
          <div className="rounded-2xl border border-cyan-400/40 bg-[#0f1424] p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Unit Economics
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-cyan-400/10 pb-2">
                <span className="text-sm text-cyan-300/70">Server Costs</span>
                <span className="text-white font-mono">
                  ${serverCost.toLocaleString()}/mo
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-cyan-400/10 pb-2">
                <span className="text-sm text-cyan-300/70">
                  Marketing Spend
                </span>
                <span className="text-white font-mono">
                  ${marketingSpend.toLocaleString()}/mo
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-semibold text-cyan-300">
                  Burn Rate
                </span>
                <span className="text-2xl font-bold font-mono text-cyan-400">
                  ${burnRate.toLocaleString()}
                  <span className="text-sm text-cyan-400/60">/mo</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <RiskMatrix
          viabilityScore={viabilityScore}
          burnRate={burnRate}
          industry={industry}
          targetAudience={targetAudience}
          coreOffering={coreOffering}
        />

        {/* ── Premium Market Analysis Dashboard ── */}
        <div className="rounded-2xl border border-purple-500/30 bg-[#0f1424]/80 backdrop-blur-md p-6 shadow-[0_0_30px_rgba(168,85,247,0.10)]">
          <h2 className="text-xl font-bold text-white tracking-tight mb-6 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-purple-400 animate-pulse" />
            AI Market Intelligence
            <span className="text-xs text-purple-400/50 font-mono ml-auto">PREMIUM</span>
          </h2>
          <MarketDashboard
            viabilityScore={viabilityScore}
            marketAnalysis={marketAnalysis}
            risks={risks}
            researchGrounded={researchGrounded}
          />
        </div>
      </div>
    </div>
  );
}

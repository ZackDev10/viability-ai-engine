"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browser";
import Link from "next/link";

type IdeaRow = {
  id: string;
  industry: string;
  title: string;
  description: string | null;
  stage: string;
  created_at: string;
  financials: { burn_rate: number | null; operating_expenses: number | null }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<IdeaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserName(user.email?.split("@")[0] ?? "Founder");

      const { data, error } = await supabase
        .from("startup_ideas")
        .select("*, financials(burn_rate, operating_expenses)")
        .order("created_at", { ascending: false });

      if (!error && data) setIdeas(data as unknown as IdeaRow[]);
      setLoading(false);
    };

    init();
  }, [router]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const parseScore = (desc: string | null): number | null => {
    if (!desc) return null;
    try {
      return JSON.parse(desc).score ?? null;
    } catch {
      return null;
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Command Center<span className="text-cyan-400">.</span>
            </h1>
            <p className="mt-1 text-sm text-cyan-300/50">
              Welcome back, <span className="text-cyan-300/80 font-medium">{userName}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/validate"
              className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-cyan-500/10 border border-cyan-400/40 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all"
            >
              + New Validation
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2.5 rounded-lg text-sm text-cyan-300/50 hover:text-cyan-300/80 border border-cyan-400/10 hover:border-cyan-400/30 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Ideas Grid ── */}
        {ideas.length === 0 ? (
          <div className="rounded-2xl border border-cyan-400/20 bg-[#0f1424] p-12 text-center">
            <p className="text-cyan-300/50 mb-4">
              No startup ideas yet. Run your first validation.
            </p>
            <Link
              href="/validate"
              className="inline-block px-6 py-3 rounded-lg font-semibold text-white bg-cyan-500/10 border border-cyan-400/40 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all"
            >
              + New Validation
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {ideas.map((idea) => {
              const score = parseScore(idea.description);
              const burn =
                idea.financials?.[0]?.burn_rate ??
                idea.financials?.[0]?.operating_expenses ??
                null;

              return (
                <div
                  key={idea.id}
                  className="group rounded-2xl border border-cyan-400/30 bg-[#0f1424] p-6 shadow-[0_0_20px_rgba(6,182,212,0.08)] hover:shadow-[0_0_30px_rgba(6,182,212,0.18)] hover:border-cyan-400/50 transition-all duration-300 space-y-4"
                >
                  {/* Industry badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-cyan-400/60 bg-cyan-400/5 border border-cyan-400/10 rounded-full px-3 py-1">
                      {idea.industry}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300/30">
                      {new Date(idea.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title + Stage */}
                  <div>
                    <h3 className="text-lg font-semibold text-white truncate">
                      {idea.title}
                    </h3>
                    <span className="text-xs text-cyan-300/40 capitalize">
                      {idea.stage}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-cyan-400/10">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-300/40">
                        Viability
                      </p>
                      {score !== null ? (
                        <p
                          className={`text-xl font-bold font-mono ${
                            score >= 80
                              ? "text-emerald-400"
                              : score >= 60
                                ? "text-amber-400"
                                : "text-red-400"
                          }`}
                        >
                          {score}
                          <span className="text-xs font-normal">%</span>
                        </p>
                      ) : (
                        <p className="text-sm text-cyan-300/30">—</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-300/40">
                        Burn Rate
                      </p>
                      {burn !== null ? (
                        <p className="text-xl font-bold font-mono text-cyan-300">
                          ${Number(burn).toLocaleString()}
                          <span className="text-xs font-normal text-cyan-300/50">
                            /mo
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm text-cyan-300/30">—</p>
                      )}
                    </div>
                  </div>

                  {/* Detail link */}
                  <div className="pt-1">
                    <span className="text-xs text-cyan-400/40 group-hover:text-cyan-400/70 transition-colors">
                      View details →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

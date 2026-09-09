"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/browser";

const NAV_LINKS = [
  { href: "/dashboard", label: "Command Center" },
  { href: "/validate", label: "New Idea" },
  { href: "/analytics", label: "Analytics" },
] as const;

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      setAuthed(!!user);
    });
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Landing page public nav
  if (pathname === "/") {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {/* Brand */}
          <span className="flex items-center gap-2 group">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
            <span className="text-lg font-bold tracking-tight text-white">
              Viability<span className="text-cyan-400">.ai</span>
            </span>
          </span>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/30 transition-all duration-200"
            >
              Log In
            </Link>
            <Link
              href="/login"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-cyan-500/10 border border-cyan-400/40 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all duration-200"
            >
              Start for Free
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Only render on main app pages (hide on login)
  if (!authed || pathname === "/login") return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 group"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)] group-hover:shadow-[0_0_16px_rgba(6,182,212,0.9)] transition-shadow" />
          <span className="text-lg font-bold tracking-tight text-white">
            Viability
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-cyan-300 bg-cyan-500/10 border border-cyan-400/30"
                    : "text-gray-400 hover:text-cyan-300 hover:bg-white/5 border border-transparent hover:border-cyan-400/20"
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-cyan-400/0 via-cyan-400 to-cyan-400/0" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-cyan-300 border border-transparent hover:border-cyan-400/20 hover:bg-white/5 transition-all duration-200"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}

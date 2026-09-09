"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browser";
import ValidationForm from "../components/ValidationForm";

export default function ValidatePage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supabase) {
      setAuthed(true);
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (!user) {
        router.push("/login");
      } else {
        setAuthed(true);
      }
    });
  }, [router]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
      </div>
    );
  }

  return <ValidationForm />;
}

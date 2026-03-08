"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDevVaultStore } from "@/lib/store";
import { Vault } from "lucide-react";

export function ProtectedAppFrame({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const { theme } = useDevVaultStore();

  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.classList.remove("dark");
      html.classList.add("light");
    }
  }, [theme]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <Vault className="h-8 w-8 text-[var(--accent-primary)] animate-pulse" />
      </div>
    );
  }

  return <>{children}</>;
}

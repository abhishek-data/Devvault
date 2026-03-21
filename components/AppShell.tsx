"use client";

import { useEffect, useRef } from "react";
import { useDevVaultStore } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ConflictModal } from "@/components/sync/ConflictModal";
import { Toaster, toast } from "sonner";
import { cn } from "@/lib/utils";
import { StorageService } from "@/lib/db/storage";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    theme,
    syncIntervalMinutes,
    isGitHubConnected,
  } =
    useDevVaultStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (syncIntervalMinutes > 0 && isGitHubConnected) {
      const ms = syncIntervalMinutes * 60 * 1000;

      intervalRef.current = setInterval(async () => {
        try {
          const pending = await StorageService.getNotesPendingSync();
          if (pending.length === 0) return;

          for (const note of pending) {
            const action = note.githubSha ? "update" : "create";
            const res = await fetch("/api/github/file", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ note, action }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.sha) {
                await StorageService.updateSyncStatus(note.id, "synced", data.sha);
              }
            }
          }
          toast.success(`Auto-synced ${pending.length} note${pending.length > 1 ? "s" : ""}`);
        } catch {
          // Silent fail — will retry next interval
        }
      }, ms);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [syncIntervalMinutes, isGitHubConnected]);

  return (
    <>
      <div className="flex h-screen bg-[var(--bg-base)] overflow-hidden">
        <Sidebar />
        {!sidebarCollapsed && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarCollapsed(true)}
            className="md:hidden fixed inset-0 z-30 bg-black/45"
          />
        )}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <ConflictModal />
      <Toaster
        theme={theme}
        position="bottom-right"
        toastOptions={{
          style:
            theme === "dark"
              ? {
                  background: "#141420",
                  border: "1px solid #252540",
                  color: "#EEEEF5",
                  fontSize: "13px",
                  borderRadius: "8px",
                }
              : {
                  background: "#FFFFFF",
                  border: "1px solid #D8DDEF",
                  color: "#171828",
                  fontSize: "13px",
                  borderRadius: "8px",
                },
        }}
      />
    </>
  );
}

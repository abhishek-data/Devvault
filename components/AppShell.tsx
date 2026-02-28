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
    const { sidebarCollapsed, theme, syncIntervalMinutes, isGitHubConnected } =
        useDevVaultStore();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Apply theme class to <html> element
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

    // Interval-based sync
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
            <Header />
            <div className="flex pt-14">
                <Sidebar />
                <main
                    className={cn(
                        "flex-1 min-h-[calc(100vh-3.5rem)] transition-all duration-200",
                        sidebarCollapsed ? "ml-0" : "ml-[260px]"
                    )}
                >
                    {children}
                </main>
            </div>
            <ConflictModal />
            <Toaster
                theme={theme}
                position="bottom-right"
                toastOptions={{
                    style:
                        theme === "dark"
                            ? {
                                background: "rgb(39 39 42)",
                                border: "1px solid rgb(63 63 70)",
                                color: "rgb(228 228 231)",
                            }
                            : {},
                }}
            />
        </>
    );
}

"use client";

import { useDevVaultStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SyncStatusIndicator() {
    const { syncStatus, isDirty, isGitHubConnected, conflict } =
        useDevVaultStore();

    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

    let dotColor = "bg-zinc-500";
    let label = "Local only";
    let animate = false;

    if (conflict) {
        dotColor = "bg-red-500";
        label = "Conflict — resolve";
        animate = true;
    } else if (isOffline) {
        dotColor = "bg-orange-500";
        label = "Offline";
    } else if (isDirty) {
        dotColor = "bg-yellow-500";
        label = "Unsaved changes";
    } else if (syncStatus === "syncing") {
        dotColor = "bg-blue-500";
        label = "Syncing...";
        animate = true;
    } else if (!isGitHubConnected) {
        dotColor = "bg-zinc-500";
        label = "Local only";
    } else if (syncStatus === "idle") {
        dotColor = "bg-green-500";
        label = "Synced";
    } else if (syncStatus === "error") {
        dotColor = "bg-red-500";
        label = "Sync error";
    }

    return (
        <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span
                className={cn("w-2 h-2 rounded-full", dotColor, animate && "animate-pulse")}
            />
            <span>{label}</span>
        </div>
    );
}

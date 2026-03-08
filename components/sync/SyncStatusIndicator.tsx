"use client";

import { useDevVaultStore } from "@/lib/store";

export function SyncStatusIndicator() {
  const { syncStatus, isDirty, isGitHubConnected, conflict } = useDevVaultStore();

  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

  let dotColor = "var(--sync-local)";
  let labelColor = "var(--text-secondary)";
  let label = "Local";
  let animate = false;

  if (conflict) {
    dotColor = "var(--sync-conflict)";
    labelColor = "var(--sync-conflict)";
    label = "Conflict";
    animate = true;
  } else if (isOffline) {
    dotColor = "var(--sync-offline)";
    label = "Offline";
  } else if (isDirty || syncStatus === "syncing") {
    dotColor = "var(--sync-pending)";
    label = syncStatus === "syncing" ? "Syncing" : "Pending";
    animate = true;
  } else if (syncStatus === "error") {
    dotColor = "var(--sync-conflict)";
    labelColor = "var(--sync-conflict)";
    label = "Error";
  } else if (isGitHubConnected) {
    dotColor = "var(--sync-synced)";
    label = "Synced";
  }

  return (
    <div className="h-6 px-[10px] rounded-[var(--radius-md)] flex items-center gap-[7px] hover:bg-[var(--bg-overlay)] cursor-pointer">
      <span
        className="w-[6px] h-[6px] rounded-full"
        style={{
          backgroundColor: dotColor,
          animation: animate
            ? `pulse ${conflict ? "1s" : "1.4s"} ease infinite`
            : "none",
        }}
      />
      <span className="text-[11px] font-medium" style={{ color: labelColor }}>
        {label}
      </span>
    </div>
  );
}

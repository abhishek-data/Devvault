"use client";

import { useState, useEffect } from "react";
import { useDevVaultStore } from "@/lib/store";
import { signIn, signOut, useSession } from "next-auth/react";
import { X, Github, HardDrive, Trash2, RefreshCw, Clock, Contrast } from "lucide-react";
import { toast } from "sonner";
import { StorageService } from "@/lib/db/storage";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INTERVAL_OPTIONS = [
  { label: "5 minutes", value: 5 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "Manual only", value: 0 },
];

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const {
    isGitHubConnected,
    setGitHubConnected,
    setNotes,
    setSyncStatus,
    syncIntervalMinutes,
    setSyncIntervalMinutes,
    theme,
    toggleTheme,
  } = useDevVaultStore();
  const { data: session } = useSession();
  const [storageEstimate, setStorageEstimate] = useState<string>("Calculating...");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if ((session as any)?.accessToken) {
      setGitHubConnected(true);
    }
  }, [session, setGitHubConnected]);

  useEffect(() => {
    if (open && navigator.storage?.estimate) {
      navigator.storage.estimate().then((est) => {
        const usedMB = ((est.usage || 0) / (1024 * 1024)).toFixed(2);
        const totalMB = ((est.quota || 0) / (1024 * 1024)).toFixed(0);
        setStorageEstimate(`${usedMB} MB used of ${totalMB} MB`);
      });
    }
  }, [open]);

  const handleSync = async () => {
    setSyncStatus("syncing");
    try {
      const pendingNotes = await StorageService.getNotesPendingSync();
      for (const note of pendingNotes) {
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

      const pullRes = await fetch("/api/github/pull");
      if (pullRes.ok) {
        toast.success("Sync complete");
      } else {
        toast.error("Sync failed");
      }
    } catch {
      toast.error("Sync failed — network error");
    } finally {
      setSyncStatus("idle");
    }
  };

  const handleDeleteAll = async () => {
    try {
      const notes = await StorageService.getAllNotes();
      for (const note of notes) {
        await StorageService.deleteNote(note.id);
      }
      setNotes([]);
      toast.success("All local notes deleted");
      setShowDeleteConfirm(false);
    } catch {
      toast.error("Failed to delete notes");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-[rgba(4,4,12,0.5)]" onClick={() => onOpenChange(false)} />
      <div className="absolute right-0 top-0 bottom-0 w-full sm:max-w-[320px] md:max-w-[360px] bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] overflow-y-auto translate-x-0 transition-transform duration-300">
        <div className="h-[44px] px-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-[var(--text-primary)]">Settings</h2>
          <button onClick={() => onOpenChange(false)} className="icon-button">
            <X className="h-4 w-4" />
          </button>
        </div>

        <section className="px-4 py-5 border-b border-[var(--border-subtle)]">
          <div className="section-label mb-3">Appearance</div>
          <button onClick={toggleTheme} className="btn-ghost w-full inline-flex items-center justify-center gap-2">
            <Contrast className="h-3.5 w-3.5" />
            Theme: {theme}
          </button>
        </section>

        <section className="px-4 py-5 border-b border-[var(--border-subtle)]">
          <div className="section-label mb-3">GitHub</div>
          {isGitHubConnected && session ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {session.user?.image && (
                  <img src={session.user.image} alt="avatar" className="h-7 w-7 rounded-full" />
                )}
                <div>
                  <p className="text-[13px] text-[var(--text-primary)]">{session.user?.name}</p>
                  <a
                    href={`https://github.com/${session.user?.name}/devvault-notes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[var(--text-accent)] hover:underline"
                  >
                    devvault-notes repo
                  </a>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSync} className="btn-ghost inline-flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Sync
                </button>
                <button
                  onClick={() => {
                    signOut();
                    setGitHubConnected(false);
                  }}
                  className="btn-ghost"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => signIn("github")} className="btn-ghost inline-flex items-center gap-2">
              <Github className="h-3.5 w-3.5" />
              Connect GitHub
            </button>
          )}
        </section>

        <section className="px-4 py-5 border-b border-[var(--border-subtle)]">
          <div className="section-label mb-2">Auto Sync</div>
          <p className="text-[11px] text-[var(--text-tertiary)] mb-3">
            How often to push notes to GitHub.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {INTERVAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setSyncIntervalMinutes(opt.value);
                  toast.success(
                    opt.value === 0
                      ? "Auto-sync disabled"
                      : `Auto-sync set to every ${opt.label}`
                  );
                }}
                className={
                  syncIntervalMinutes === opt.value
                    ? "btn-primary"
                    : "btn-ghost"
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        <section className="px-4 py-5 border-b border-[var(--border-subtle)]">
          <div className="section-label mb-3">Storage</div>
          <p className="text-[12px] text-[var(--text-secondary)] inline-flex items-center gap-1.5">
            <HardDrive className="h-3.5 w-3.5" />
            {storageEstimate}
          </p>
        </section>

        <section className="px-4 py-5">
          <div className="section-label mb-3 text-[var(--red)]">Danger Zone</div>
          {showDeleteConfirm ? (
            <div className="space-y-2">
              <p className="text-[12px] text-[var(--text-secondary)]">
                Permanently delete all local notes?
              </p>
              <div className="flex gap-2">
                <button onClick={handleDeleteAll} className="btn-primary bg-[var(--red)] hover:bg-[var(--red)]">
                  Delete all
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="btn-ghost">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowDeleteConfirm(true)} className="btn-ghost btn-destructive inline-flex items-center gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Delete all local notes
            </button>
          )}
        </section>
      </div>
    </div>
  );
}

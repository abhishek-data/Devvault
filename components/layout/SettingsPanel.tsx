"use client";

import { useState, useEffect } from "react";
import { useDevVaultStore } from "@/lib/store";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  X,
  Github,
  HardDrive,
  Trash2,
  RefreshCw,
  Clock,
  Contrast,
  ExternalLink,
  LogOut,
  GitBranch,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { StorageService } from "@/lib/db/storage";
import { cn } from "@/lib/utils";

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

  const username = (session as any)?.user?.username;

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
    <div className="fixed inset-0 z-[110]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => onOpenChange(false)} />
      <div className="absolute right-0 top-0 bottom-0 w-full sm:max-w-[360px] bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] overflow-y-auto translate-x-0 transition-transform duration-300 shadow-2xl">
        <div className="h-[64px] px-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="text-[15px] font-bold tracking-wide text-[var(--text-primary)]">Settings</h2>
          <button onClick={() => onOpenChange(false)} className="icon-button hover:bg-[var(--bg-elevated)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-4">Account</div>
            {isGitHubConnected && session ? (
              <div className="space-y-4">
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-4 flex items-center gap-4 shadow-sm">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="avatar"
                      className="w-10 h-10 rounded-full ring-2 ring-[var(--border-strong)]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full ring-2 ring-[var(--border-strong)] bg-[var(--bg-overlay)]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-[var(--text-primary)] truncate">{session.user?.name || username}</p>
                    <p className="text-[12px] text-[var(--text-secondary)]">@{username || "github-user"}</p>
                  </div>
                  {username && (
                    <a
                      href={`https://github.com/${username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors p-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-4 shadow-sm">
                  <div className="inline-flex items-center">
                    <GitBranch className="h-4 w-4 text-[var(--accent-primary)]" />
                    <span className="text-[13px] font-medium text-[var(--text-secondary)] ml-2">devvault-notes</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[var(--sync-synced)]/10 rounded-full border border-[var(--sync-synced)]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--sync-synced)] animate-pulse" />
                    <span className="text-[11px] font-bold tracking-wide text-[var(--sync-synced)] uppercase">Connected</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                   <button onClick={handleSync} className="h-9 w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[12px] font-bold tracking-wide text-[var(--text-primary)] inline-flex items-center justify-center gap-2 hover:bg-[var(--bg-overlay)] hover:border-[var(--border-strong)] transition-all shadow-sm">
                     <RefreshCw className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                     Sync Now
                   </button>
                   {username && (
                     <a
                       href={`https://github.com/${username}/devvault-notes`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="h-9 w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[12px] font-bold tracking-wide text-[var(--text-primary)] inline-flex items-center justify-center gap-2 hover:bg-[var(--bg-overlay)] hover:border-[var(--border-strong)] transition-all shadow-sm"
                     >
                       <ExternalLink className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                       View Repo
                     </a>
                   )}
                </div>

                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    setGitHubConnected(false);
                  }}
                  className="w-full h-10 mt-2 bg-transparent text-[var(--red)] border border-transparent hover:bg-[var(--red)]/10 rounded-[var(--radius-md)] text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 text-center shadow-sm">
                <Github className="h-8 w-8 mx-auto mb-3 text-[var(--text-tertiary)]" />
                <p className="text-[13px] text-[var(--text-secondary)] mb-4">You are currently operating in local-only mode.</p>
                <button onClick={() => signIn("github", { callbackUrl: "/app" })} className="w-full h-10 bg-[var(--accent-primary)] hover:bg-[var(--accent-bright)] text-[#000000] rounded-[var(--radius-md)] text-[13px] font-bold flex items-center justify-center gap-2 transition-colors">
                   <Github className="h-4 w-4" />
                   Sign in with GitHub
                </button>
              </div>
            )}
          </section>

          <section>
             <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-4">Appearance</div>
             <button onClick={toggleTheme} className="w-full h-10 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[13px] font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors flex items-center justify-center gap-2 shadow-sm">
               <Contrast className="h-4 w-4" />
               Current Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
             </button>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2 text-[var(--text-primary)]">
              <Clock className="h-4 w-4" />
              <div className="text-[13px] font-bold tracking-wide">Auto Sync Interval</div>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] mb-4 leading-relaxed">
              Choose how frequently DevVault automatically pushes changes to GitHub.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INTERVAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSyncIntervalMinutes(opt.value);
                    toast.success(opt.value === 0 ? "Auto-sync disabled" : `Auto-sync set to every ${opt.label}`);
                  }}
                  className={cn(
                     "h-9 rounded-[var(--radius-md)] text-[11px] font-bold uppercase tracking-wider transition-all",
                     syncIntervalMinutes === opt.value
                       ? "bg-[var(--accent-primary)] text-[#000000] shadow-sm ring-2 ring-[var(--accent-primary)]/20"
                       : "bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-4">Storage Breakdown</div>
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-4 flex items-center gap-3 shadow-sm">
               <div className="w-10 h-10 rounded-full bg-[var(--bg-overlay)] flex items-center justify-center text-[var(--text-secondary)]">
                  <HardDrive className="h-5 w-5" />
               </div>
               <div>
                 <p className="text-[13px] font-bold text-[var(--text-primary)]">Local Storage Limit</p>
                 <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{storageEstimate}</p>
               </div>
            </div>
          </section>

          <AiSettingsSection />

          <section className="pt-4 border-t border-[var(--border-subtle)]">
            <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--red)] mb-4">Danger Zone</div>
            {showDeleteConfirm ? (
              <div className="bg-[var(--red)]/10 border border-[var(--red)]/20 rounded-[var(--radius-lg)] p-4 text-center">
                <p className="text-[13px] font-medium text-[var(--red)] mb-4">This action cannot be undone. Wipe all local data?</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleDeleteAll} className="h-9 bg-[var(--red)] text-white rounded-[var(--radius-md)] text-[12px] font-bold tracking-wide hover:bg-[var(--red)]/90 transition-colors shadow-sm">Delete</button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="h-9 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-[var(--radius-md)] text-[12px] font-bold tracking-wide hover:bg-[var(--bg-overlay)] transition-colors shadow-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="w-full h-[44px] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] text-[13px] font-semibold text-[var(--red)] flex items-center justify-center gap-2 hover:bg-[var(--red)]/5 hover:border-[var(--red)]/30 transition-colors shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
                Wipe Local Storage
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function AiSettingsSection() {
  const { aiProvider, setAiProvider, aiApiKey, setAiApiKey } = useDevVaultStore();
  const [showKey, setShowKey] = useState(false);
  const [keyInput, setKeyInput] = useState(aiApiKey);

  const handleSaveKey = () => {
    setAiApiKey(keyInput.trim());
    toast.success(keyInput.trim() ? "API key saved" : "API key removed");
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-[var(--accent-bright)]" />
        <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">AI Features (Optional)</div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] mb-4 leading-relaxed">
        Bring your own API key to enable AI summarization and auto-tagging. Your key is stored locally and sent directly to the provider — never to our servers.
      </p>

      {/* Provider */}
      <div className="mb-3">
        <label className="text-[11px] font-semibold text-[var(--text-secondary)] mb-1.5 block">Provider</label>
        <div className="grid grid-cols-2 gap-2">
          {(["gemini", "openai"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setAiProvider(p)}
              className={cn(
                "h-9 rounded-[var(--radius-md)] text-[12px] font-bold tracking-wide transition-all",
                aiProvider === p
                  ? "bg-[var(--accent-primary)] text-[#000000] shadow-sm ring-2 ring-[var(--accent-primary)]/20"
                  : "bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              )}
            >
              {p === "gemini" ? "Google Gemini" : "OpenAI"}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5">
          {aiProvider === "gemini"
            ? "Uses Gemini 2.5 Flash — free tier with 250 requests/day, no credit card needed."
            : "Requires an OpenAI API key with GPT-4o-mini or GPT-4o access."}
        </p>
      </div>

      {/* API Key */}
      <div>
        <label className="text-[11px] font-semibold text-[var(--text-secondary)] mb-1.5 block">API Key</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type={showKey ? "text" : "password"}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder={aiProvider === "gemini" ? "AIza..." : "sk-..."}
              className="w-full h-9 px-3 pr-8 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)] transition-colors font-mono"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            >
              {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <button
            onClick={handleSaveKey}
            className="h-9 px-3 bg-[var(--accent-primary)] hover:bg-[var(--accent-bright)] text-[#000000] rounded-[var(--radius-md)] text-[11px] font-bold transition-colors"
          >
            Save
          </button>
        </div>
        {aiApiKey && (
          <p className="text-[10px] text-[var(--green)] mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
            Key configured
          </p>
        )}
      </div>
    </section>
  );
}

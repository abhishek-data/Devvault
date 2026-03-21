"use client";

import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function ConflictModal() {
  const { conflict, setConflict, upsertNote } = useDevVaultStore();

  if (!conflict) return null;

  const { noteId, localNote, remoteNote } = conflict;

  const getPreview = (note: typeof localNote) => {
    const texts: string[] = [];
    for (const block of note.blocks) {
      if (block.type !== "divider" && block.type !== "link" && "text" in block) {
        texts.push(block.text);
      } else if (block.type === "link") {
        texts.push(block.title || block.url);
      }
      if (texts.join(" ").length > 200) break;
    }
    return texts.join(" ").slice(0, 200);
  };

  const handleKeepLocal = async () => {
    const updated = {
      ...localNote,
      syncStatus: "pending" as const,
    };
    await StorageService.saveNote(updated);
    upsertNote(updated);
    setConflict(null);
    toast.success("Kept your local version. Will sync to GitHub.");
  };

  const handleKeepRemote = async () => {
    const updated = {
      ...remoteNote,
      syncStatus: "synced" as const,
    };
    await StorageService.saveNote(updated);
    upsertNote(updated);
    setConflict(null);
    toast.success("Applied GitHub version.");
  };

  const handleKeepBoth = async () => {
    const conflictNote = {
      ...remoteNote,
      id: `${noteId}-conflict-${Date.now()}`,
      syncStatus: "local_only" as const,
    };
    await StorageService.saveNote(conflictNote);
    upsertNote(conflictNote);

    const updated = {
      ...localNote,
      syncStatus: "pending" as const,
    };
    await StorageService.saveNote(updated);
    upsertNote(updated);

    setConflict(null);
    toast.success("Kept both versions. GitHub version saved as a new note.");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(4,4,12,0.8)] backdrop-blur-[8px]">
      <div className="conflict-modal w-full max-w-xl mx-4 bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-[var(--yellow)]" />
          <h2 className="text-[15px] font-medium text-[var(--text-primary)]">
            Conflict in &ldquo;{localNote.title}&rdquo;
          </h2>
        </div>
        <p className="text-[13px] text-[var(--text-secondary)] mb-4">
          Both this device and GitHub have changes.
        </p>

        <div className="border border-[var(--border-default)] rounded-[var(--radius-md)] p-4 mb-3 bg-[var(--bg-surface)]">
          <div className="section-label mb-1">Your Version</div>
          <div className="text-[11px] text-[var(--text-tertiary)] mb-2">
            Last saved: {new Date(localNote.updatedAt).toLocaleString()} · Version: {localNote.version}
          </div>
          <p className="text-[12px] text-[var(--text-secondary)] line-clamp-3">{getPreview(localNote)}</p>
          <button onClick={handleKeepLocal} className="btn-primary mt-3">
            Keep My Version
          </button>
        </div>

        <div className="border border-[var(--border-default)] rounded-[var(--radius-md)] p-4 mb-4 bg-[var(--bg-surface)]">
          <div className="section-label mb-1">GitHub Version</div>
          <div className="text-[11px] text-[var(--text-tertiary)] mb-2">
            Last saved: {new Date(remoteNote.updatedAt).toLocaleString()} · Version: {remoteNote.version}
          </div>
          <p className="text-[12px] text-[var(--text-secondary)] line-clamp-3">{getPreview(remoteNote)}</p>
          <button onClick={handleKeepRemote} className="btn-ghost mt-3">
            Keep GitHub Version
          </button>
        </div>

        <button onClick={handleKeepBoth} className="btn-ghost btn-destructive w-full">
          Keep Both — save GitHub version as a new note
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const syncDotColors: Record<string, string> = {
  local_only: "bg-[var(--sync-local)]",
  synced: "bg-[var(--sync-synced)]",
  pending: "bg-[var(--sync-pending)]",
  conflict: "bg-[var(--sync-conflict)]",
};

export function NoteList() {
  const {
    notes,
    activeNoteId,
    setActiveNote,
    setSidebarCollapsed,
    removeNote,
    rebuildSearchIndex,
  } =
    useDevVaultStore();
  const router = useRouter();
  const pathname = usePathname();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleDelete = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (confirmDeleteId === noteId) {
      await StorageService.deleteNote(noteId);
      removeNote(noteId);
      rebuildSearchIndex();
      setConfirmDeleteId(null);
      toast.success("Note deleted");

      if (pathname === `/app/notes/${noteId}`) {
        router.push("/app");
      }
    } else {
      setConfirmDeleteId(noteId);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  if (sortedNotes.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-[11px] text-[var(--text-tertiary)]">
        No notes yet
      </div>
    );
  }

  return (
    <div className="py-1">
      {sortedNotes.map((note) => (
        <div
          key={note.id}
          className={cn(
            "note-item group flex flex-col justify-between p-4 mb-3 mx-2 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-strong)] transition-colors shadow-sm",
            activeNoteId === note.id &&
              "border-[var(--accent-muted)] bg-[var(--bg-overlay)] ring-1 ring-[var(--accent-primary)]/20"
          )}
          onClick={() => {
            setActiveNote(note.id);
            if (typeof window !== "undefined" && window.innerWidth < 768) {
              setSidebarCollapsed(true);
            }
            router.push(`/app/notes/${note.id}`);
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] font-bold tracking-wide text-[var(--text-primary)] truncate">
              {note.title || "Untitled"}
            </span>
            {note.tags[0] && (
              <span className="tag-pill bg-[var(--bg-overlay)] !border-[var(--border-strong)]">
                {note.tags[0]}
              </span>
            )}
          </div>
          
          <p className="text-[13px] leading-relaxed text-[var(--text-secondary)] line-clamp-2 mb-3">
             {note.blocks.find(b => b.type === 'paragraph' && 'text' in b)?.['text'] || "Start writing your next idea..."}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
               <span className="text-[11px] font-medium text-[var(--text-tertiary)] flex items-center gap-1">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                 {new Date(note.updatedAt).toLocaleDateString()}
               </span>
               <div className="flex items-center gap-1.5 opacity-80">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      syncDotColors[note.syncStatus] || "bg-[var(--sync-local)]"
                    )}
                  />
                  <span className="text-[11px] font-medium text-[var(--text-tertiary)] capitalize">{note.syncStatus.replace('_', ' ')}</span>
               </div>
            </div>

            <button
              onClick={(e) => handleDelete(note.id, e)}
              className={cn(
                "icon-button !w-6 !h-6 flex-shrink-0 transition-opacity",
                confirmDeleteId === note.id
                  ? "opacity-100 text-[var(--red)] bg-[rgba(248,113,113,0.08)]"
                  : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
              )}
              title={
                confirmDeleteId === note.id ? "Click again to confirm" : "Delete note"
              }
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>

          {confirmDeleteId === note.id && (
            <p className="text-[11px] text-[var(--red)] mt-1">Click again to confirm</p>
          )}
        </div>
      ))}
    </div>
  );
}

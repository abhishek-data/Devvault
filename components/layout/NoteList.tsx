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
            "note-item group px-[10px] py-[7px] mx-[6px] rounded-[var(--radius-md)] cursor-pointer",
            "hover:bg-[var(--bg-overlay)] border-l-2 border-transparent",
            activeNoteId === note.id &&
              "bg-[var(--bg-overlay)] border-l-[var(--accent-primary)] pl-2"
          )}
          onClick={() => {
            setActiveNote(note.id);
            if (typeof window !== "undefined" && window.innerWidth < 768) {
              setSidebarCollapsed(true);
            }
            router.push(`/app/notes/${note.id}`);
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[var(--text-primary)] truncate flex-1">
              {note.title || "Untitled"}
            </span>
            <span
              className={cn(
                "w-[5px] h-[5px] rounded-full flex-shrink-0",
                syncDotColors[note.syncStatus] || "bg-[var(--sync-local)]"
              )}
            />
            <button
              onClick={(e) => handleDelete(note.id, e)}
              className={cn(
                "icon-button !w-7 !h-7 flex-shrink-0",
                confirmDeleteId === note.id
                  ? "opacity-100 text-[var(--red)] bg-[rgba(248,113,113,0.08)]"
                  : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
              )}
              title={
                confirmDeleteId === note.id ? "Click again to confirm" : "Delete note"
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-[6px] mt-[3px]">
            <span className="text-[11px] text-[var(--text-tertiary)]">
              {new Date(note.updatedAt).toLocaleDateString()}
            </span>
            {note.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="tag-pill !h-[16px] !px-[6px] !text-[10px]">
                {tag}
              </span>
            ))}
          </div>

          {confirmDeleteId === note.id && (
            <p className="text-[11px] text-[var(--red)] mt-1">Click again to confirm</p>
          )}
        </div>
      ))}
    </div>
  );
}

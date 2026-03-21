"use client";

import { useState, useEffect } from "react";
import { useDevVaultStore, selectVisibleNotes } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Trash2, Pin, PinOff, Archive, ArchiveRestore, Code2, Bookmark, BookOpen } from "lucide-react";
import { toast } from "sonner";

const syncDotColors: Record<string, string> = {
  local_only: "bg-[var(--sync-local)]",
  synced: "bg-[var(--sync-synced)]",
  pending: "bg-[var(--sync-pending)]",
  conflict: "bg-[var(--sync-conflict)]",
};

const noteTypeIcons: Record<string, React.ReactNode> = {
  snippet: <Code2 className="h-3 w-3" />,
  bookmark: <Bookmark className="h-3 w-3" />,
  reference: <BookOpen className="h-3 w-3" />,
};

export function NoteList() {
  const {
    activeNoteId,
    setActiveNote,
    setSidebarCollapsed,
    deleteNoteWithSync,
    toggleNotePin,
    archiveNote,
    restoreNote,
    showArchive,
  } = useDevVaultStore();

  const visibleNotes = useDevVaultStore(selectVisibleNotes);
  const [archivedNotes, setArchivedNotes] = useState<typeof visibleNotes>([]);
  const router = useRouter();
  const pathname = usePathname();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Load archived notes when archive view is active
  useEffect(() => {
    if (showArchive) {
      StorageService.getArchivedNotes().then(setArchivedNotes);
    }
  }, [showArchive]);

  const displayNotes = showArchive ? archivedNotes : visibleNotes;
  const pinnedNotes = displayNotes.filter((n) => n.isPinned);
  const unpinnedNotes = displayNotes.filter((n) => !n.isPinned);

  const handleDelete = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (confirmDeleteId === noteId) {
      await deleteNoteWithSync(noteId);
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

  const handlePin = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleNotePin(noteId);
  };

  const handleArchive = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await archiveNote(noteId);
    toast.success("Note archived");
    if (pathname === `/app/notes/${noteId}`) router.push("/app");
  };

  const handleRestore = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await restoreNote(noteId);
    setArchivedNotes((prev) => prev.filter((n) => n.id !== noteId));
    toast.success("Note restored");
  };

  if (displayNotes.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-[11px] text-[var(--text-tertiary)]">
        {showArchive ? "No archived notes" : "No notes yet"}
      </div>
    );
  }

  const renderNote = (note: typeof displayNotes[0]) => {
    const typeIcon = noteTypeIcons[note.noteType || ""];

    return (
      <div
        key={note.id}
        className={cn(
          "note-item group flex flex-col justify-between p-3 mb-2 mx-1 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--border-strong)] transition-colors shadow-sm",
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
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {note.isPinned && <Pin className="h-3 w-3 text-[var(--accent-bright)] flex-shrink-0" />}
            {typeIcon && <span className="text-[var(--text-tertiary)] flex-shrink-0">{typeIcon}</span>}
            <span className="text-[13px] font-bold text-[var(--text-primary)] truncate">
              {note.title || "Untitled"}
            </span>
          </div>
          {note.tags[0] && (
            <span className="tag-pill bg-[var(--bg-overlay)] !border-[var(--border-strong)] ml-1 flex-shrink-0">
              {note.tags[0]}
            </span>
          )}
        </div>

        <p className="text-[12px] leading-relaxed text-[var(--text-secondary)] line-clamp-2 mb-2">
          {note.blocks.find((b) => b.type === "paragraph" && "text" in b)?.["text"] || "Start writing your next idea..."}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-[var(--text-tertiary)]">
              {new Date(note.updatedAt).toLocaleDateString()}
            </span>
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                syncDotColors[note.syncStatus] || "bg-[var(--sync-local)]"
              )}
            />
          </div>

          <div className="flex items-center gap-0.5">
            {showArchive ? (
              <button
                onClick={(e) => handleRestore(note.id, e)}
                className="icon-button !w-6 !h-6 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--green)]"
                title="Restore note"
              >
                <ArchiveRestore className="h-3 w-3" />
              </button>
            ) : (
              <>
                <button
                  onClick={(e) => handlePin(note.id, e)}
                  className="icon-button !w-6 !h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  title={note.isPinned ? "Unpin" : "Pin"}
                >
                  {note.isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                </button>
                <button
                  onClick={(e) => handleArchive(note.id, e)}
                  className="icon-button !w-6 !h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Archive"
                >
                  <Archive className="h-3 w-3" />
                </button>
              </>
            )}
            <button
              onClick={(e) => handleDelete(note.id, e)}
              className={cn(
                "icon-button !w-6 !h-6 flex-shrink-0 transition-opacity",
                confirmDeleteId === note.id
                  ? "opacity-100 text-[var(--red)] bg-[rgba(248,113,113,0.08)]"
                  : "opacity-0 group-hover:opacity-100"
              )}
              title={confirmDeleteId === note.id ? "Click again to confirm" : "Delete note"}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {confirmDeleteId === note.id && (
          <p className="text-[10px] text-[var(--red)] mt-1">Click again to confirm</p>
        )}
      </div>
    );
  };

  return (
    <div className="py-1">
      {!showArchive && pinnedNotes.length > 0 && (
        <>
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
            Pinned
          </div>
          {pinnedNotes.map(renderNote)}
          {unpinnedNotes.length > 0 && (
            <div className="px-3 py-1 mt-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
              Others
            </div>
          )}
        </>
      )}
      {(showArchive ? displayNotes : unpinnedNotes).map(renderNote)}
    </div>
  );
}

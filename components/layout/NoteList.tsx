"use client";

import { useState, useEffect } from "react";
import { useDevVaultStore, selectVisibleNotes } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Trash2, Pin, ArchiveRestore, Code2, Bookmark, BookOpen, FileText } from "lucide-react";
import { toast } from "sonner";

const syncDotColors: Record<string, string> = {
  local_only: "bg-[var(--sync-local)]",
  synced: "bg-[var(--sync-synced)]",
  pending: "bg-[var(--sync-pending)]",
  conflict: "bg-[var(--sync-conflict)]",
};

const typeIcons: Record<string, React.ReactNode> = {
  note: <FileText className="h-3.5 w-3.5" />,
  snippet: <Code2 className="h-3.5 w-3.5" />,
  bookmark: <Bookmark className="h-3.5 w-3.5" />,
  reference: <BookOpen className="h-3.5 w-3.5" />,
};

export function NoteList() {
  const {
    activeNoteId,
    setActiveNote,
    setSidebarCollapsed,
    deleteNoteWithSync,
    toggleNotePin,
    restoreNote,
    showArchive,
  } = useDevVaultStore();

  const visibleNotes = useDevVaultStore(selectVisibleNotes);
  const [archivedNotes, setArchivedNotes] = useState<typeof visibleNotes>([]);
  const router = useRouter();
  const pathname = usePathname();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
      if (pathname === `/app/notes/${noteId}`) router.push("/app");
    } else {
      setConfirmDeleteId(noteId);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const handlePin = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleNotePin(noteId);
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
    const isActive = activeNoteId === note.id;
    const icon = typeIcons[note.noteType || "note"];

    return (
      <div
        key={note.id}
        className={cn(
          "group flex items-center gap-2 px-2 h-7 mx-1 rounded-[var(--radius-sm)] cursor-pointer transition-colors",
          isActive
            ? "bg-[var(--bg-overlay)] text-[var(--text-primary)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
        )}
        onClick={() => {
          setActiveNote(note.id);
          if (typeof window !== "undefined" && window.innerWidth < 768) setSidebarCollapsed(true);
          router.push(`/app/notes/${note.id}`);
        }}
      >
        {/* Icon */}
        <span className="flex-shrink-0 text-[var(--text-tertiary)]">{icon}</span>

        {/* Title */}
        <span className="flex-1 text-[12px] truncate">
          {note.title || "Untitled"}
        </span>

        {/* Pin indicator (always visible if pinned) */}
        {note.isPinned && (
          <Pin className="h-2.5 w-2.5 text-[var(--accent-bright)] flex-shrink-0" />
        )}

        {/* Sync dot */}
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0 group-hover:hidden",
            syncDotColors[note.syncStatus] || "bg-[var(--sync-local)]"
          )}
        />

        {/* Hover actions — only visible on hover, replace sync dot */}
        <div className="hidden group-hover:flex items-center gap-0 flex-shrink-0">
          {showArchive ? (
            <button onClick={(e) => handleRestore(note.id, e)} className="p-0.5 rounded hover:bg-[var(--bg-overlay)] text-[var(--green)]" title="Restore">
              <ArchiveRestore className="h-3 w-3" />
            </button>
          ) : (
            <button onClick={(e) => handlePin(note.id, e)} className="p-0.5 rounded hover:bg-[var(--bg-overlay)]" title={note.isPinned ? "Unpin" : "Pin"}>
              <Pin className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={(e) => handleDelete(note.id, e)}
            className={cn(
              "p-0.5 rounded hover:bg-[var(--bg-overlay)]",
              confirmDeleteId === note.id ? "text-[var(--red)]" : ""
            )}
            title={confirmDeleteId === note.id ? "Click again" : "Delete"}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="py-0.5">
      {!showArchive && pinnedNotes.length > 0 && (
        <>
          {pinnedNotes.map(renderNote)}
          {unpinnedNotes.length > 0 && (
            <div className="mx-3 border-t border-[var(--border-subtle)] my-1" />
          )}
        </>
      )}
      {(showArchive ? displayNotes : unpinnedNotes).map(renderNote)}
    </div>
  );
}

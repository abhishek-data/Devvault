"use client";

import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { Plus, Vault, FileText, Code2, Bookmark, BookOpen, Archive, Inbox } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import type { Note, NoteType } from "@/lib/types";
import { NoteList } from "./NoteList";
import { FolderTree } from "./FolderTree";
import { cn } from "@/lib/utils";

const NOTE_TYPE_FILTERS: { type: NoteType; icon: React.ReactNode; label: string }[] = [
  { type: "note", icon: <FileText className="h-3.5 w-3.5" />, label: "Notes" },
  { type: "snippet", icon: <Code2 className="h-3.5 w-3.5" />, label: "Snippets" },
  { type: "bookmark", icon: <Bookmark className="h-3.5 w-3.5" />, label: "Bookmarks" },
  { type: "reference", icon: <BookOpen className="h-3.5 w-3.5" />, label: "References" },
];

export function Sidebar() {
  const {
    upsertNote,
    setActiveNote,
    sidebarCollapsed,
    activeFolderId,
    setActiveFolderId,
    noteTypeFilter,
    setNoteTypeFilter,
    showArchive,
    setShowArchive,
  } = useDevVaultStore();
  const router = useRouter();

  const handleNewNote = async () => {
    const id = uuidv4().slice(0, 8);
    const now = new Date().toISOString();
    const newNote: Note = {
      id,
      title: "Untitled Note",
      tags: [],
      blocks: [
        {
          blockId: uuidv4(),
          type: "paragraph",
          text: "",
        },
      ],
      createdAt: now,
      updatedAt: now,
      syncStatus: "local_only",
      version: 1,
      folderId: activeFolderId || undefined,
      noteType: "note",
      isPinned: false,
      isArchived: false,
    };

    await StorageService.saveNote(newNote);
    upsertNote(newNote);
    setActiveNote(id);
    router.push(`/app/notes/${id}`);
  };

  return (
    <aside
      className={cn(
        "h-screen bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col z-40 transition-all duration-200",
        sidebarCollapsed
          ? "w-0 min-w-0 md:w-0 md:min-w-0 overflow-hidden border-r-0"
          : "w-[220px] min-w-[220px] lg:w-[240px] lg:min-w-[240px] fixed md:relative left-0 top-0 translate-x-0"
      )}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Vault className="h-6 w-6 text-[var(--accent-primary)]" />
          <span className="text-[15px] font-bold tracking-wide text-[var(--text-primary)]">DevVault</span>
        </div>
      </div>

      {/* New Note */}
      <div className="px-3 pb-3 flex-shrink-0">
        <button
          onClick={handleNewNote}
          className="w-full h-[36px] bg-[var(--accent-muted)] rounded-[var(--radius-md)] text-[12px] font-semibold text-white flex items-center justify-center gap-2 hover:bg-[var(--accent-bright)] transition-colors"
        >
          <Plus className="h-[14px] w-[14px]" />
          New Note
        </button>
      </div>

      {/* Navigation */}
      <div className="px-3 pb-2 flex-shrink-0">
        <button
          onClick={() => { setActiveFolderId(null); setShowArchive(false); }}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-md)] text-[13px] transition-colors",
            !activeFolderId && !showArchive
              ? "bg-[var(--bg-overlay)] text-[var(--text-primary)] font-semibold"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
          )}
        >
          <Inbox className="h-3.5 w-3.5" />
          All Notes
        </button>
      </div>

      {/* Type Filters */}
      <div className="px-3 pb-3 flex-shrink-0">
        <div className="flex flex-wrap gap-1">
          {NOTE_TYPE_FILTERS.map((f) => (
            <button
              key={f.type}
              onClick={() => setNoteTypeFilter(noteTypeFilter === f.type ? null : f.type)}
              className={cn(
                "h-6 px-2 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 transition-colors border",
                noteTypeFilter === f.type
                  ? "bg-[var(--accent-dim)] border-[var(--accent-muted)] text-[var(--text-accent)]"
                  : "bg-transparent border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)]"
              )}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Folders */}
      <div className="px-3 pb-1 flex-shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] px-2 pb-1">Folders</div>
        <FolderTree />
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-[var(--border-subtle)] my-2 flex-shrink-0" />

      {/* Notes Label */}
      <div className="px-3 pb-1 flex-shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] px-2">
          {showArchive ? "Archived" : activeFolderId ? "Folder Notes" : "Recent Notes"}
        </div>
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-1.5 pb-2 min-h-0">
        <NoteList />
      </div>

      {/* Archive */}
      <div className="px-3 py-2 border-t border-[var(--border-subtle)] flex-shrink-0">
        <button
          onClick={() => setShowArchive(!showArchive)}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-md)] text-[12px] transition-colors",
            showArchive
              ? "bg-[var(--bg-overlay)] text-[var(--text-primary)] font-semibold"
              : "text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)]"
          )}
        >
          <Archive className="h-3.5 w-3.5" />
          Archive
        </button>
      </div>
    </aside>
  );
}

"use client";

import { useState } from "react";
import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { Plus, Vault, Archive, Inbox, ChevronRight, FolderClosed, Filter, BookOpen } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import type { Note, NoteType } from "@/lib/types";
import { NoteList } from "./NoteList";
import { FolderTree } from "./FolderTree";
import { cn } from "@/lib/utils";

const TYPE_FILTERS: { type: NoteType; label: string }[] = [
  { type: "note", label: "Notes" },
  { type: "snippet", label: "Snippets" },
  { type: "bookmark", label: "Bookmarks" },
  { type: "reference", label: "References" },
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
    folders,
  } = useDevVaultStore();
  const router = useRouter();
  const [foldersOpen, setFoldersOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleNewNote = async () => {
    const id = uuidv4().slice(0, 8);
    const now = new Date().toISOString();
    const newNote: Note = {
      id,
      title: "Untitled Note",
      tags: [],
      blocks: [{ blockId: uuidv4(), type: "paragraph", text: "" }],
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
      {/* Brand + New Note */}
      <div className="h-14 flex items-center justify-between px-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Vault className="h-5 w-5 text-[var(--accent-primary)]" />
          <span className="text-[14px] font-bold text-[var(--text-primary)]">DevVault</span>
        </div>
        <button
          onClick={handleNewNote}
          className="h-7 w-7 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-muted)] hover:bg-[var(--accent-bright)] text-white transition-colors"
          title="New Note"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Navigation items */}
      <nav className="px-2 pb-1 flex-shrink-0 space-y-0.5">
        <button
          onClick={() => { setActiveFolderId(null); setShowArchive(false); setNoteTypeFilter(null); }}
          className={cn(
            "w-full flex items-center gap-2 px-2 h-7 rounded-[var(--radius-sm)] text-[12px] transition-colors",
            !activeFolderId && !showArchive && !noteTypeFilter
              ? "bg-[var(--bg-overlay)] text-[var(--text-primary)] font-medium"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
          )}
        >
          <Inbox className="h-3.5 w-3.5" />
          All Notes
        </button>

        <button
          onClick={() => router.push("/app/references")}
          className="w-full flex items-center gap-2 px-2 h-7 rounded-[var(--radius-sm)] text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5" />
          References
        </button>

        <button
          onClick={() => setShowArchive(!showArchive)}
          className={cn(
            "w-full flex items-center gap-2 px-2 h-7 rounded-[var(--radius-sm)] text-[12px] transition-colors",
            showArchive
              ? "bg-[var(--bg-overlay)] text-[var(--text-primary)] font-medium"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
          )}
        >
          <Archive className="h-3.5 w-3.5" />
          Archive
        </button>
      </nav>

      {/* Collapsible: Filters */}
      <div className="px-2 flex-shrink-0">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="w-full flex items-center gap-1.5 px-2 h-7 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <ChevronRight className={cn("h-3 w-3 transition-transform", filtersOpen && "rotate-90")} />
          <Filter className="h-3 w-3" />
          Filters
          {noteTypeFilter && (
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--text-accent)] font-bold normal-case tracking-normal">
              {noteTypeFilter}
            </span>
          )}
        </button>
        {filtersOpen && (
          <div className="pl-5 pr-1 pb-1 space-y-0.5">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.type}
                onClick={() => setNoteTypeFilter(noteTypeFilter === f.type ? null : f.type)}
                className={cn(
                  "w-full flex items-center px-2 h-6 rounded-[var(--radius-sm)] text-[11px] transition-colors",
                  noteTypeFilter === f.type
                    ? "bg-[var(--accent-dim)] text-[var(--text-accent)] font-medium"
                    : "text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Collapsible: Folders */}
      <div className="px-2 flex-shrink-0">
        <button
          onClick={() => setFoldersOpen(!foldersOpen)}
          className="w-full flex items-center gap-1.5 px-2 h-7 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <ChevronRight className={cn("h-3 w-3 transition-transform", foldersOpen && "rotate-90")} />
          <FolderClosed className="h-3 w-3" />
          Folders
          {folders.length > 0 && (
            <span className="ml-auto text-[9px] text-[var(--text-tertiary)] font-medium normal-case tracking-normal tabular-nums">
              {folders.length}
            </span>
          )}
        </button>
        {foldersOpen && (
          <div className="pb-1">
            <FolderTree />
          </div>
        )}
      </div>

      {/* Thin separator */}
      <div className="mx-3 border-t border-[var(--border-subtle)] my-1 flex-shrink-0" />

      {/* Note List — takes remaining space */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-1 pb-2 min-h-0">
        <NoteList />
      </div>
    </aside>
  );
}

"use client";

import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { Plus, Vault } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import type { Note } from "@/lib/types";
import { NoteList } from "./NoteList";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { upsertNote, setActiveNote, sidebarCollapsed } = useDevVaultStore();
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
      <div className="h-16 flex items-center px-4 mb-2">
        <div className="flex items-center gap-2">
          <Vault className="h-6 w-6 text-[var(--accent-primary)]" />
          <span className="text-[15px] font-bold tracking-wide text-[var(--text-primary)]">DevVault</span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={handleNewNote}
          className="w-full h-[40px] bg-[var(--accent-muted)] rounded-[var(--radius-md)] text-[13px] font-semibold text-white flex items-center justify-center gap-2 hover:bg-[var(--accent-bright)] transition-colors"
        >
          <Plus className="h-[16px] w-[16px]" />
          New Note
        </button>
      </div>

      <div className="px-4 pt-1 pb-[10px]">
        <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Recent Notes</div>
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scroll px-1.5 pb-2">
        <NoteList />
      </div>
    </aside>
  );
}

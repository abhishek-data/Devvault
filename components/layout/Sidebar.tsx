"use client";

import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { Plus } from "lucide-react";
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
        "h-[calc(100vh-44px)] bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col fixed top-[44px] left-0 z-40 transition-[transform,width] duration-200",
        sidebarCollapsed
          ? "w-[220px] min-w-[220px] lg:w-[240px] lg:min-w-[240px] -translate-x-full md:w-0 md:min-w-0 md:translate-x-0 md:overflow-hidden md:border-r-0"
          : "w-[220px] min-w-[220px] lg:w-[240px] lg:min-w-[240px] translate-x-0"
            )}
        >
      <div className="pt-3 px-[10px] pb-3">
        <button
          onClick={handleNewNote}
          className="w-full h-[30px] bg-[var(--accent-dim)] border border-[var(--accent-muted)] rounded-[var(--radius-md)] text-[12px] font-medium text-[var(--text-accent)] flex items-center justify-center gap-[6px] hover:bg-[var(--accent-glow)] hover:border-[var(--accent-primary)]"
        >
          <Plus className="h-[14px] w-[14px]" />
          New Note
        </button>
      </div>

      <div className="section-label px-3 pb-[6px]">Notes</div>

      <div className="flex-1 overflow-y-auto sidebar-scroll pb-2">
        <NoteList />
      </div>
    </aside>
  );
}

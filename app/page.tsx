"use client";

import { useDevVaultStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { StorageService } from "@/lib/db/storage";
import { Vault, Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";
import type { Note } from "@/lib/types";

export default function HomePage() {
  const { upsertNote, setActiveNote } = useDevVaultStore();
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
    router.push(`/notes/${id}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleNewNote();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-[calc(100vh-44px)] flex items-center justify-center px-8">
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <Vault className="h-9 w-9 text-[var(--text-tertiary)] opacity-30" />
        <h1 className="text-[15px] font-medium text-[var(--text-secondary)]">Select a note</h1>
        <p className="text-[13px] text-[var(--text-tertiary)]">or press ⌘K to search</p>

        <div className="flex gap-2 mt-2">
          <kbd className="!font-medium !text-[11px] !px-2 !py-[3px]">⌘K</kbd>
          <kbd className="!font-medium !text-[11px] !px-2 !py-[3px]">⌘N</kbd>
          <kbd className="!font-medium !text-[11px] !px-2 !py-[3px]">⌘S</kbd>
        </div>

        <button onClick={handleNewNote} className="btn-ghost mt-3 inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New Note
        </button>
      </div>
    </div>
  );
}

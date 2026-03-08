"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { BlockEditor } from "@/components/editor/BlockEditor";
import type { Note } from "@/lib/types";
import { X, Loader2, Vault } from "lucide-react";

export default function NotePage() {
  const params = useParams();
  const noteId = params.noteId as string;
  const { setActiveNote, upsertNote, rebuildSearchIndex, isGitHubConnected } =
    useDevVaultStore();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setActiveNote(noteId);
    StorageService.getNoteById(noteId).then((n) => {
      if (n) {
        setNote(n);
      }
      setLoading(false);
    });
  }, [noteId, setActiveNote]);

  useEffect(() => {
    if (!note || loading) return;

    const hash = window.location.hash;
    if (hash && hash.startsWith("#block-")) {
      const blockId = hash.slice(1);
      setTimeout(() => {
        const el = document.getElementById(blockId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("block-highlighted");
          setTimeout(() => {
            el.classList.remove("block-highlighted");
          }, 2000);
        }
      }, 300);
    }
  }, [note, loading]);

  const handleTitleChange = async (newTitle: string) => {
    if (!note) return;
    const updated = {
      ...note,
      title: newTitle,
      updatedAt: new Date().toISOString(),
      version: note.version + 1,
      syncStatus: isGitHubConnected ? ("pending" as const) : note.syncStatus,
    };
    setNote(updated);
    await StorageService.saveNote(updated);
    upsertNote(updated);
    rebuildSearchIndex();
  };

  const handleAddTag = (tag: string) => {
    if (!note || !tag.trim()) return;
    const trimmed = tag.trim().toLowerCase();
    if (note.tags.includes(trimmed)) return;

    const updated = {
      ...note,
      tags: [...note.tags, trimmed],
      updatedAt: new Date().toISOString(),
      version: note.version + 1,
      syncStatus: isGitHubConnected ? ("pending" as const) : note.syncStatus,
    };
    setNote(updated);
    StorageService.saveNote(updated);
    upsertNote(updated);
    rebuildSearchIndex();
  };

  const handleRemoveTag = (tag: string) => {
    if (!note) return;
    const updated = {
      ...note,
      tags: note.tags.filter((t) => t !== tag),
      updatedAt: new Date().toISOString(),
      version: note.version + 1,
      syncStatus: isGitHubConnected ? ("pending" as const) : note.syncStatus,
    };
    setNote(updated);
    StorageService.saveNote(updated);
    upsertNote(updated);
    rebuildSearchIndex();
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
      setTagInput("");
    }
  };

  const handleSave = useCallback((updated: Note) => {
    setNote(updated);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-44px)]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--text-secondary)]" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-44px)] gap-2">
        <Vault className="h-8 w-8 text-[var(--text-tertiary)] opacity-30" />
        <p className="text-[13px] text-[var(--text-secondary)]">Note not found</p>
      </div>
    );
  }

  return (
    <div className="note-content min-h-[calc(100vh-44px)] bg-[var(--bg-base)]">
      <div className="px-[56px] pt-[40px] pb-[24px] border-b border-[var(--border-subtle)]">
        <input
          type="text"
          value={note.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          className="w-full bg-transparent border-none outline-none p-0 text-[22px] font-semibold tracking-[-0.4px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
        />

        <div className="mt-3 flex flex-wrap items-center gap-[6px]">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="tag-enter h-5 px-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full text-[11px] font-medium text-[var(--text-secondary)] inline-flex items-center gap-1 hover:border-[var(--border-strong)] hover:bg-[var(--bg-overlay)]"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-[var(--text-tertiary)] hover:text-[var(--red)]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add tag..."
            className="bg-transparent border-none outline-none text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] w-20"
          />
        </div>
      </div>

      <div className="px-[56px] pt-8 pb-20">
        <BlockEditor note={note} onSave={handleSave} />
      </div>
    </div>
  );
}

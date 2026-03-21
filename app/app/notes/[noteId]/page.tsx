"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { BlockEditor } from "@/components/editor/BlockEditor";
import type { Note, NoteType } from "@/lib/types";
import { X, Loader2, Vault, Pin, PinOff, Archive, FolderOpen, FileText, Code2, Bookmark, BookOpen, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NOTE_TYPES: { type: NoteType; icon: React.ReactNode; label: string }[] = [
  { type: "note", icon: <FileText className="h-3.5 w-3.5" />, label: "Note" },
  { type: "snippet", icon: <Code2 className="h-3.5 w-3.5" />, label: "Snippet" },
  { type: "bookmark", icon: <Bookmark className="h-3.5 w-3.5" />, label: "Bookmark" },
  { type: "reference", icon: <BookOpen className="h-3.5 w-3.5" />, label: "Reference" },
];

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.noteId as string;
  const { setActiveNote, upsertNote, rebuildSearchIndex, isGitHubConnected, folders, toggleNotePin, archiveNote, moveNoteToFolder } =
    useDevVaultStore();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

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

  const saveNote = async (updated: Note) => {
    setNote(updated);
    await StorageService.saveNote(updated);
    upsertNote(updated);
    rebuildSearchIndex();
  };

  const makeUpdate = (partial: Partial<Note>) => {
    if (!note) return null;
    return {
      ...note,
      ...partial,
      updatedAt: new Date().toISOString(),
      version: note.version + 1,
      syncStatus: isGitHubConnected ? ("pending" as const) : note.syncStatus,
    };
  };

  const handleTitleChange = async (newTitle: string) => {
    const updated = makeUpdate({ title: newTitle });
    if (updated) await saveNote(updated);
  };

  const handleAddTag = (tag: string) => {
    if (!note || !tag.trim()) return;
    const trimmed = tag.trim().toLowerCase();
    if (note.tags.includes(trimmed)) return;
    const updated = makeUpdate({ tags: [...note.tags, trimmed] });
    if (updated) saveNote(updated);
  };

  const handleRemoveTag = (tag: string) => {
    if (!note) return;
    const updated = makeUpdate({ tags: note.tags.filter((t) => t !== tag) });
    if (updated) saveNote(updated);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
      setTagInput("");
    }
  };

  const handleNoteTypeChange = async (type: NoteType) => {
    const updated = makeUpdate({ noteType: type });
    if (updated) await saveNote(updated);
    setShowTypePicker(false);
  };

  const handleFolderChange = async (folderId: string | undefined) => {
    if (!note) return;
    await moveNoteToFolder(note.id, folderId);
    setNote({ ...note, folderId });
    setShowFolderPicker(false);
  };

  const handlePin = async () => {
    if (!note) return;
    await toggleNotePin(note.id);
    setNote({ ...note, isPinned: !note.isPinned });
  };

  const handleArchive = async () => {
    if (!note) return;
    await archiveNote(note.id);
    router.push("/app");
  };

  const handleSave = useCallback((updated: Note) => {
    setNote(updated);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-44px)] px-4">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--text-secondary)]" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-44px)] gap-2 px-4">
        <Vault className="h-8 w-8 text-[var(--text-tertiary)] opacity-30" />
        <p className="text-[13px] text-[var(--text-secondary)]">Note not found</p>
      </div>
    );
  }

  const currentType = NOTE_TYPES.find((t) => t.type === (note.noteType || "note"))!;
  const currentFolder = folders.find((f) => f.id === note.folderId);

  return (
    <div className="note-content min-h-[calc(100vh-44px)] bg-[var(--bg-base)]">
      <div className="px-4 sm:px-6 md:px-10 lg:px-[56px] pt-6 sm:pt-7 md:pt-8 lg:pt-[40px] pb-5 sm:pb-6 border-b border-[var(--border-subtle)]">
        {/* Toolbar row: breadcrumb + actions */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--text-secondary)] min-w-0">
            <Vault className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">DevVault</span>
            {currentFolder && (
              <>
                <span className="text-[var(--text-tertiary)]">/</span>
                <span className="truncate text-[var(--text-accent)]">{currentFolder.name}</span>
              </>
            )}
            <span className="text-[var(--text-tertiary)]">/</span>
            <span className="truncate">{note.title || "Untitled"}</span>
            <span className="w-1 h-1 rounded-full bg-[var(--border-strong)] mx-1 flex-shrink-0" />
            <span className="flex-shrink-0 text-[var(--text-tertiary)]">
              Edited {new Date(note.updatedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Note type picker */}
            <div className="relative">
              <button
                onClick={() => setShowTypePicker(!showTypePicker)}
                className="h-7 px-2 rounded-[var(--radius-md)] text-[11px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[var(--border-strong)] inline-flex items-center gap-1.5 transition-colors"
              >
                {currentType.icon}
                {currentType.label}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showTypePicker && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowTypePicker(false)} />
                  <div className="absolute right-0 top-8 z-20 w-36 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] py-1 shadow-lg">
                    {NOTE_TYPES.map((t) => (
                      <button
                        key={t.type}
                        onClick={() => handleNoteTypeChange(t.type)}
                        className={cn(
                          "w-full px-3 py-1.5 text-left text-[12px] flex items-center gap-2 transition-colors",
                          (note.noteType || "note") === t.type
                            ? "text-[var(--text-accent)] bg-[var(--accent-dim)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]"
                        )}
                      >
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Folder picker */}
            <div className="relative">
              <button
                onClick={() => setShowFolderPicker(!showFolderPicker)}
                className="h-7 px-2 rounded-[var(--radius-md)] text-[11px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[var(--border-strong)] inline-flex items-center gap-1.5 transition-colors"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                {currentFolder?.name || "No folder"}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showFolderPicker && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFolderPicker(false)} />
                  <div className="absolute right-0 top-8 z-20 w-44 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] py-1 shadow-lg max-h-48 overflow-y-auto">
                    <button
                      onClick={() => handleFolderChange(undefined)}
                      className={cn(
                        "w-full px-3 py-1.5 text-left text-[12px] flex items-center gap-2 transition-colors",
                        !note.folderId
                          ? "text-[var(--text-accent)] bg-[var(--accent-dim)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]"
                      )}
                    >
                      No folder
                    </button>
                    {folders.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => handleFolderChange(f.id)}
                        className={cn(
                          "w-full px-3 py-1.5 text-left text-[12px] flex items-center gap-2 transition-colors",
                          note.folderId === f.id
                            ? "text-[var(--text-accent)] bg-[var(--accent-dim)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]"
                        )}
                      >
                        <FolderOpen className="h-3 w-3" />
                        {f.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Pin toggle */}
            <button
              onClick={handlePin}
              className={cn(
                "icon-button !h-7 !w-7",
                note.isPinned && "text-[var(--accent-bright)]"
              )}
              title={note.isPinned ? "Unpin" : "Pin note"}
            >
              {note.isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            </button>

            {/* Archive */}
            <button
              onClick={handleArchive}
              className="icon-button !h-7 !w-7"
              title="Archive note"
            >
              <Archive className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="tag-enter h-6 px-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full text-[11px] font-bold tracking-wide text-[var(--accent-bright)] inline-flex items-center gap-1.5 hover:border-[var(--border-strong)] hover:bg-[var(--bg-overlay)]"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-[var(--text-tertiary)] hover:text-[var(--red)] transition-colors"
                aria-label="Remove tag"
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
            placeholder="+ Add tag"
            className="bg-transparent border border-dashed border-[var(--border-strong)] rounded-full h-6 px-3 outline-none text-[11px] font-bold tracking-wide text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] w-24 focus:border-[var(--accent-primary)] transition-colors"
          />
        </div>

        {/* Title */}
        <input
          type="text"
          value={note.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled Note"
          className="w-full bg-transparent border-none outline-none p-0 text-[clamp(28px,4vw,36px)] font-bold tracking-tight text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
        />
      </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-[56px] pt-6 sm:pt-7 md:pt-8 pb-16 sm:pb-20">
        <div className="max-w-[860px]">
          <BlockEditor note={note} onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}

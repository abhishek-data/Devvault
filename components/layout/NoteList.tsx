"use client";

import { useState } from "react";
import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const syncDotColors: Record<string, string> = {
    local_only: "bg-zinc-500",
    synced: "bg-green-500",
    pending: "bg-yellow-500",
    conflict: "bg-red-500",
};

export function NoteList() {
    const { notes, activeNoteId, setActiveNote, removeNote, rebuildSearchIndex } =
        useDevVaultStore();
    const router = useRouter();
    const pathname = usePathname();
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const sortedNotes = [...notes].sort(
        (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const handleDelete = async (noteId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (confirmDeleteId === noteId) {
            // Second click — actually delete
            await StorageService.deleteNote(noteId);
            removeNote(noteId);
            rebuildSearchIndex();
            setConfirmDeleteId(null);
            toast.success("Note deleted");

            // If viewing the deleted note, navigate home
            if (pathname === `/notes/${noteId}`) {
                router.push("/");
            }
        } else {
            // First click — show confirmation
            setConfirmDeleteId(noteId);
            // Auto-reset after 3 seconds
            setTimeout(() => setConfirmDeleteId(null), 3000);
        }
    };

    if (sortedNotes.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-zinc-400 dark:text-zinc-500">
                No notes yet. Create your first note!
            </div>
        );
    }

    return (
        <div className="py-1">
            {sortedNotes.map((note) => (
                <div
                    key={note.id}
                    className={cn(
                        "group w-full text-left px-3 py-2.5 flex flex-col gap-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-l-2 cursor-pointer",
                        activeNoteId === note.id
                            ? "bg-zinc-100 dark:bg-zinc-800 border-l-blue-500"
                            : "border-l-transparent"
                    )}
                    onClick={() => {
                        setActiveNote(note.id);
                        router.push(`/notes/${note.id}`);
                    }}
                >
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                syncDotColors[note.syncStatus] || "bg-zinc-500"
                            )}
                        />
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate flex-1">
                            {note.title || "Untitled Note"}
                        </span>
                        <button
                            onClick={(e) => handleDelete(note.id, e)}
                            className={cn(
                                "p-1 rounded transition-all flex-shrink-0",
                                confirmDeleteId === note.id
                                    ? "bg-red-100 dark:bg-red-900/40 text-red-500 opacity-100"
                                    : "opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            )}
                            title={
                                confirmDeleteId === note.id
                                    ? "Click again to confirm"
                                    : "Delete note"
                            }
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    {confirmDeleteId === note.id && (
                        <p className="text-xs text-red-400 pl-3.5">Click again to confirm</p>
                    )}
                    {note.tags.length > 0 && confirmDeleteId !== note.id && (
                        <div className="flex gap-1 flex-wrap pl-3.5">
                            {note.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                                >
                                    {tag}
                                </span>
                            ))}
                            {note.tags.length > 3 && (
                                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                    +{note.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

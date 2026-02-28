"use client";

import { useDevVaultStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const syncDotColors: Record<string, string> = {
    local_only: "bg-zinc-500",
    synced: "bg-green-500",
    pending: "bg-yellow-500",
    conflict: "bg-red-500",
};

export function NoteList() {
    const { notes, activeNoteId, setActiveNote } = useDevVaultStore();
    const router = useRouter();

    const sortedNotes = [...notes].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    if (sortedNotes.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-zinc-500">
                No notes yet. Create your first note!
            </div>
        );
    }

    return (
        <div className="py-1">
            {sortedNotes.map((note) => (
                <button
                    key={note.id}
                    onClick={() => {
                        setActiveNote(note.id);
                        router.push(`/notes/${note.id}`);
                    }}
                    className={cn(
                        "w-full text-left px-3 py-2.5 flex flex-col gap-1 hover:bg-zinc-800 transition-colors border-l-2",
                        activeNoteId === note.id
                            ? "bg-zinc-800 border-l-blue-500"
                            : "border-l-transparent"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                syncDotColors[note.syncStatus] || "bg-zinc-500"
                            )}
                        />
                        <span className="text-sm font-medium text-zinc-200 truncate">
                            {note.title || "Untitled Note"}
                        </span>
                    </div>
                    {note.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap pl-3.5">
                            {note.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400"
                                >
                                    {tag}
                                </span>
                            ))}
                            {note.tags.length > 3 && (
                                <span className="text-xs text-zinc-500">
                                    +{note.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}

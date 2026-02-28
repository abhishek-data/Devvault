"use client";

import { useDevVaultStore } from "@/lib/store";
import type { ConflictData } from "@/lib/types";
import { StorageService } from "@/lib/db/storage";
import { X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export function ConflictModal() {
    const { conflict, setConflict, upsertNote } = useDevVaultStore();

    if (!conflict) return null;

    const { noteId, localNote, remoteNote } = conflict;

    const getPreview = (note: typeof localNote) => {
        const texts: string[] = [];
        for (const block of note.blocks) {
            if (block.type !== "divider") {
                texts.push(block.text);
            }
            if (texts.join(" ").length > 200) break;
        }
        return texts.join(" ").slice(0, 200);
    };

    const handleKeepLocal = async () => {
        const updated = {
            ...localNote,
            syncStatus: "pending" as const,
        };
        await StorageService.saveNote(updated);
        upsertNote(updated);
        setConflict(null);
        toast.success("Kept your local version. Will sync to GitHub.");
    };

    const handleKeepRemote = async () => {
        const updated = {
            ...remoteNote,
            syncStatus: "synced" as const,
        };
        await StorageService.saveNote(updated);
        upsertNote(updated);
        setConflict(null);
        toast.success("Applied GitHub version.");
    };

    const handleKeepBoth = async () => {
        // Save remote as a new note
        const conflictNote = {
            ...remoteNote,
            id: `${noteId}-conflict-${Date.now()}`,
            syncStatus: "local_only" as const,
        };
        await StorageService.saveNote(conflictNote);
        upsertNote(conflictNote);

        // Keep local and push it
        const updated = {
            ...localNote,
            syncStatus: "pending" as const,
        };
        await StorageService.saveNote(updated);
        upsertNote(updated);

        setConflict(null);
        toast.success("Kept both versions. GitHub version saved as a new note.");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700 rounded-md w-full max-w-xl mx-4 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-lg font-semibold text-zinc-100">
                        Conflict in &ldquo;{localNote.title}&rdquo;
                    </h2>
                </div>
                <p className="text-sm text-zinc-400 mb-5">
                    Both this device and GitHub have changes.
                </p>

                {/* Local version */}
                <div className="border border-zinc-700 rounded-md p-4 mb-3">
                    <div className="text-xs text-zinc-400 mb-1 font-medium uppercase tracking-wider">
                        Your Version
                    </div>
                    <div className="text-xs text-zinc-500 mb-2">
                        Last saved: {new Date(localNote.updatedAt).toLocaleString()} ·
                        Version: {localNote.version}
                    </div>
                    <p className="text-sm text-zinc-300 line-clamp-3">
                        {getPreview(localNote)}
                    </p>
                    <button
                        onClick={handleKeepLocal}
                        className="mt-3 px-3 py-1.5 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                    >
                        ✓ Keep My Version
                    </button>
                </div>

                {/* Remote version */}
                <div className="border border-zinc-700 rounded-md p-4 mb-4">
                    <div className="text-xs text-zinc-400 mb-1 font-medium uppercase tracking-wider">
                        GitHub Version
                    </div>
                    <div className="text-xs text-zinc-500 mb-2">
                        Last saved: {new Date(remoteNote.updatedAt).toLocaleString()} ·
                        Version: {remoteNote.version}
                    </div>
                    <p className="text-sm text-zinc-300 line-clamp-3">
                        {getPreview(remoteNote)}
                    </p>
                    <button
                        onClick={handleKeepRemote}
                        className="mt-3 px-3 py-1.5 text-sm rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
                    >
                        ✓ Keep GitHub Version
                    </button>
                </div>

                <button
                    onClick={handleKeepBoth}
                    className="w-full px-3 py-2 text-sm rounded-md border border-zinc-600 hover:bg-zinc-800 text-zinc-300 transition-colors"
                >
                    Keep Both — save GitHub version as a new note
                </button>
            </div>
        </div>
    );
}

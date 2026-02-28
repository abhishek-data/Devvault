"use client";

import { useDevVaultStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { StorageService } from "@/lib/db/storage";
import { Vault, Plus, Search, Command } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useEffect } from "react";
import type { Note } from "@/lib/types";

export default function HomePage() {
    const { notes, upsertNote, setActiveNote, setSearchOpen } =
        useDevVaultStore();
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

    // ⌘N shortcut
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

    const hasNotes = notes.length > 0;

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-8">
            <div className="flex flex-col items-center text-center max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 mb-6">
                    <Vault className="h-8 w-8 text-blue-500" />
                </div>

                {/* Title & tagline */}
                <h1 className="text-2xl font-bold text-zinc-100 mb-2">DevVault</h1>
                <p className="text-zinc-400 mb-8">Your developer knowledge OS</p>

                {/* Actions */}
                {!hasNotes ? (
                    <button
                        onClick={handleNewNote}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Create your first note
                    </button>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-zinc-500">
                            Select a note from the sidebar or press{" "}
                            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300 text-xs">
                                ⌘K
                            </kbd>{" "}
                            to search
                        </p>
                        <button
                            onClick={handleNewNote}
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            New Note
                        </button>
                    </div>
                )}

                {/* Keyboard shortcuts */}
                <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-400">
                            ⌘K
                        </kbd>
                        <span>Search</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-400">
                            ⌘N
                        </kbd>
                        <span>New note</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-400">
                            ⌘S
                        </kbd>
                        <span>Save</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-400">
                            Esc
                        </kbd>
                        <span>Close modal</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

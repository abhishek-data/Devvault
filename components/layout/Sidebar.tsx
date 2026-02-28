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
        router.push(`/notes/${id}`);
    };

    return (
        <aside
            className={cn(
                "h-[calc(100vh-3.5rem)] bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col fixed top-14 left-0 z-40 transition-all duration-200",
                sidebarCollapsed ? "w-0 min-w-0 overflow-hidden border-r-0" : "w-[260px] min-w-[260px]"
            )}
        >
            {/* New Note button */}
            <div className="p-3">
                <button
                    onClick={handleNewNote}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Note
                </button>
            </div>

            {/* Separator */}
            <div className="border-t border-zinc-200 dark:border-zinc-800" />

            {/* Note list */}
            <div className="flex-1 overflow-y-auto">
                <NoteList />
            </div>
        </aside>
    );
}

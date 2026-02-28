import { create } from "zustand";
import type { Note, SearchIndexEntry, ConflictData } from "./types";
import { StorageService } from "./db/storage";
import { buildSearchIndex } from "./search/index";

interface DevVaultStore {
    // Notes
    notes: Note[];
    activeNoteId: string | null;
    setNotes: (notes: Note[]) => void;
    setActiveNote: (id: string | null) => void;
    upsertNote: (note: Note) => void;
    removeNote: (id: string) => void;
    loadNotes: () => Promise<void>;

    // Search
    searchIndex: SearchIndexEntry[];
    isSearchOpen: boolean;
    setSearchOpen: (open: boolean) => void;
    rebuildSearchIndex: () => void;

    // Sync
    syncStatus: "idle" | "syncing" | "error" | "offline";
    conflict: ConflictData | null;
    setSyncStatus: (status: "idle" | "syncing" | "error" | "offline") => void;
    setConflict: (data: ConflictData | null) => void;

    // Auth
    isGitHubConnected: boolean;
    setGitHubConnected: (val: boolean) => void;

    // Dirty state
    isDirty: boolean;
    setDirty: (val: boolean) => void;
}

export const useDevVaultStore = create<DevVaultStore>((set, get) => ({
    // Notes
    notes: [],
    activeNoteId: null,
    setNotes: (notes) => set({ notes }),
    setActiveNote: (id) => set({ activeNoteId: id }),
    upsertNote: (note) => {
        const { notes } = get();
        const idx = notes.findIndex((n) => n.id === note.id);
        if (idx >= 0) {
            const updated = [...notes];
            updated[idx] = note;
            set({ notes: updated });
        } else {
            set({ notes: [note, ...notes] });
        }
    },
    removeNote: (id) => {
        const { notes, activeNoteId } = get();
        set({
            notes: notes.filter((n) => n.id !== id),
            activeNoteId: activeNoteId === id ? null : activeNoteId,
        });
    },
    loadNotes: async () => {
        const notes = await StorageService.getAllNotes();
        const searchIndex = buildSearchIndex(notes);
        set({ notes, searchIndex });
    },

    // Search
    searchIndex: [],
    isSearchOpen: false,
    setSearchOpen: (open) => set({ isSearchOpen: open }),
    rebuildSearchIndex: () => {
        const { notes } = get();
        const searchIndex = buildSearchIndex(notes);
        set({ searchIndex });
    },

    // Sync
    syncStatus: "idle",
    conflict: null,
    setSyncStatus: (status) => set({ syncStatus: status }),
    setConflict: (data) => set({ conflict: data }),

    // Auth
    isGitHubConnected: false,
    setGitHubConnected: (val) => set({ isGitHubConnected: val }),

    // Dirty state
    isDirty: false,
    setDirty: (val) => set({ isDirty: val }),
}));

import { create } from "zustand";
import type { Note, Folder, NoteType, SearchIndexEntry, ConflictData } from "./types";
import { StorageService } from "./db/storage";
import { buildSearchIndex } from "./search/index";
import { syncQueue } from "./sync/queue";

interface DevVaultStore {
    // Notes
    notes: Note[];
    activeNoteId: string | null;
    setNotes: (notes: Note[]) => void;
    setActiveNote: (id: string | null) => void;
    upsertNote: (note: Note) => void;
    removeNote: (id: string) => void;
    loadNotes: () => Promise<void>;

    // Folders
    folders: Folder[];
    activeFolderId: string | null;
    setActiveFolderId: (id: string | null) => void;
    loadFolders: () => Promise<void>;
    upsertFolder: (folder: Folder) => void;
    removeFolder: (id: string) => void;

    // Filters
    noteTypeFilter: NoteType | null;
    setNoteTypeFilter: (type: NoteType | null) => void;
    showArchive: boolean;
    setShowArchive: (val: boolean) => void;

    // Note actions
    deleteNoteWithSync: (noteId: string) => Promise<void>;
    toggleNotePin: (noteId: string) => Promise<void>;
    archiveNote: (noteId: string) => Promise<void>;
    restoreNote: (noteId: string) => Promise<void>;
    moveNoteToFolder: (noteId: string, folderId: string | undefined) => Promise<void>;

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

    // UI
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (val: boolean) => void;
    toggleSidebar: () => void;
    theme: "light" | "dark";
    setTheme: (theme: "light" | "dark") => void;
    toggleTheme: () => void;
    syncIntervalMinutes: number;
    setSyncIntervalMinutes: (val: number) => void;
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

    // Folders
    folders: [],
    activeFolderId: null,
    setActiveFolderId: (id) => set({ activeFolderId: id, showArchive: false }),
    loadFolders: async () => {
        const folders = await StorageService.getAllFolders();
        set({ folders });
    },
    upsertFolder: (folder) => {
        const { folders } = get();
        const idx = folders.findIndex((f) => f.id === folder.id);
        if (idx >= 0) {
            const updated = [...folders];
            updated[idx] = folder;
            set({ folders: updated });
        } else {
            set({ folders: [folder, ...folders] });
        }
    },
    removeFolder: (id) => {
        const { folders, activeFolderId } = get();
        set({
            folders: folders.filter((f) => f.id !== id),
            activeFolderId: activeFolderId === id ? null : activeFolderId,
        });
    },

    // Filters
    noteTypeFilter: null,
    setNoteTypeFilter: (type) => set({ noteTypeFilter: type }),
    showArchive: false,
    setShowArchive: (val) => set({ showArchive: val, activeFolderId: val ? null : get().activeFolderId }),

    // Note actions
    deleteNoteWithSync: async (noteId) => {
        const note = await StorageService.getNoteById(noteId);
        if (note && note.githubSha && get().isGitHubConnected) {
            syncQueue.addDelete(note);
        }
        await StorageService.deleteNote(noteId);
        get().removeNote(noteId);
        get().rebuildSearchIndex();
    },
    toggleNotePin: async (noteId) => {
        const updated = await StorageService.togglePin(noteId);
        if (updated) get().upsertNote(updated);
    },
    archiveNote: async (noteId) => {
        await StorageService.archiveNote(noteId);
        get().removeNote(noteId);
    },
    restoreNote: async (noteId) => {
        await StorageService.restoreNote(noteId);
        await get().loadNotes();
    },
    moveNoteToFolder: async (noteId, folderId) => {
        const updated = await StorageService.moveNoteToFolder(noteId, folderId);
        if (updated) get().upsertNote(updated);
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

    // UI
    sidebarCollapsed:
        typeof window !== "undefined"
            ? (() => {
                const saved = localStorage.getItem("devvault-sidebar");
                if (saved) return saved === "collapsed";
                return window.innerWidth < 768;
            })()
            : false,
    setSidebarCollapsed: (val) => {
        localStorage.setItem("devvault-sidebar", val ? "collapsed" : "expanded");
        set({ sidebarCollapsed: val });
    },
    toggleSidebar: () => {
        const { sidebarCollapsed } = get();
        const next = !sidebarCollapsed;
        localStorage.setItem("devvault-sidebar", next ? "collapsed" : "expanded");
        set({ sidebarCollapsed: next });
    },
    theme: (typeof window !== "undefined" ? (localStorage.getItem("devvault-theme") as "light" | "dark") : null) || "dark",
    setTheme: (theme) => {
        localStorage.setItem("devvault-theme", theme);
        set({ theme });
    },
    toggleTheme: () => {
        const { theme } = get();
        const next = theme === "dark" ? "light" : "dark";
        localStorage.setItem("devvault-theme", next);
        set({ theme: next });
    },
    syncIntervalMinutes: typeof window !== "undefined" ? parseInt(localStorage.getItem("devvault-sync-interval") || "30", 10) : 30,
    setSyncIntervalMinutes: (val) => {
        localStorage.setItem("devvault-sync-interval", String(val));
        set({ syncIntervalMinutes: val });
    },
}));

/** Selector: returns the visible notes list based on active folder, filters, and archive state */
export function selectVisibleNotes(state: DevVaultStore): Note[] {
    let notes = state.notes;

    // Folder filter
    if (state.activeFolderId) {
        notes = notes.filter((n) => n.folderId === state.activeFolderId);
    }

    // Note type filter
    if (state.noteTypeFilter) {
        notes = notes.filter((n) => (n.noteType || "note") === state.noteTypeFilter);
    }

    // Sort: pinned first, then by updatedAt descending
    return [...notes].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt.localeCompare(a.updatedAt);
    });
}

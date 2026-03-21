import { db } from "./schema";
import type { Note, Folder, SyncStatus, ReadingStatus } from "../types";

export const StorageService = {
    // ── Notes ──────────────────────────────────────────────

    async getAllNotes(includeArchived = false): Promise<Note[]> {
        const all = await db.notes.orderBy("updatedAt").reverse().toArray();
        if (includeArchived) return all;
        return all.filter((n) => !n.isArchived);
    },

    async getNoteById(id: string): Promise<Note | undefined> {
        return db.notes.get(id);
    },

    async saveNote(note: Note): Promise<void> {
        await db.notes.put(note);
    },

    async deleteNote(id: string): Promise<void> {
        await db.notes.delete(id);
    },

    async getNotesPendingSync(): Promise<Note[]> {
        return db.notes.where("syncStatus").equals("pending").toArray();
    },

    async updateSyncStatus(
        id: string,
        status: SyncStatus,
        sha?: string
    ): Promise<void> {
        const update: Partial<Note> = { syncStatus: status };
        if (sha !== undefined) {
            update.githubSha = sha;
        }
        await db.notes.update(id, update);
    },

    async getNotesByFolder(folderId: string): Promise<Note[]> {
        const notes = await db.notes.where("folderId").equals(folderId).toArray();
        return notes.filter((n) => !n.isArchived).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    async getUnfiledNotes(): Promise<Note[]> {
        const all = await db.notes.orderBy("updatedAt").reverse().toArray();
        return all.filter((n) => !n.folderId && !n.isArchived);
    },

    async getArchivedNotes(): Promise<Note[]> {
        const all = await db.notes.toArray();
        return all.filter((n) => n.isArchived).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    async moveNoteToFolder(noteId: string, folderId: string | undefined): Promise<Note | undefined> {
        const note = await db.notes.get(noteId);
        if (!note) return undefined;
        note.folderId = folderId;
        note.updatedAt = new Date().toISOString();
        if (note.syncStatus === "synced") note.syncStatus = "pending";
        await db.notes.put(note);
        return note;
    },

    async togglePin(noteId: string): Promise<Note | undefined> {
        const note = await db.notes.get(noteId);
        if (!note) return undefined;
        note.isPinned = !note.isPinned;
        note.updatedAt = new Date().toISOString();
        if (note.syncStatus === "synced") note.syncStatus = "pending";
        await db.notes.put(note);
        return note;
    },

    async archiveNote(noteId: string): Promise<void> {
        const note = await db.notes.get(noteId);
        if (!note) return;
        note.isArchived = true;
        note.updatedAt = new Date().toISOString();
        if (note.syncStatus === "synced") note.syncStatus = "pending";
        await db.notes.put(note);
    },

    async restoreNote(noteId: string): Promise<void> {
        const note = await db.notes.get(noteId);
        if (!note) return;
        note.isArchived = false;
        note.updatedAt = new Date().toISOString();
        if (note.syncStatus === "synced") note.syncStatus = "pending";
        await db.notes.put(note);
    },

    async setReadingStatus(noteId: string, status: ReadingStatus): Promise<Note | undefined> {
        const note = await db.notes.get(noteId);
        if (!note) return undefined;
        note.readingStatus = status;
        note.updatedAt = new Date().toISOString();
        if (note.syncStatus === "synced") note.syncStatus = "pending";
        await db.notes.put(note);
        return note;
    },

    async getBookmarksAndReferences(): Promise<Note[]> {
        const all = await db.notes.orderBy("updatedAt").reverse().toArray();
        return all.filter((n) => !n.isArchived && (n.noteType === "bookmark" || n.noteType === "reference"));
    },

    // ── Folders ────────────────────────────────────────────

    async getAllFolders(): Promise<Folder[]> {
        return db.folders.orderBy("updatedAt").reverse().toArray();
    },

    async getFolderById(id: string): Promise<Folder | undefined> {
        return db.folders.get(id);
    },

    async saveFolder(folder: Folder): Promise<void> {
        // Prevent circular parent references
        if (folder.parentId) {
            let currentId: string | undefined = folder.parentId;
            const visited = new Set<string>();
            while (currentId) {
                if (currentId === folder.id || visited.has(currentId)) {
                    throw new Error("Circular folder reference detected");
                }
                visited.add(currentId);
                const parentFolder: Folder | undefined = await db.folders.get(currentId);
                currentId = parentFolder?.parentId;
            }
        }
        await db.folders.put(folder);
    },

    async deleteFolder(id: string): Promise<void> {
        // Move orphaned notes to root
        await db.notes.where("folderId").equals(id).modify({ folderId: undefined });
        // Re-parent child folders to root
        await db.folders.where("parentId").equals(id).modify({ parentId: undefined });
        await db.folders.delete(id);
    },

    async getRootFolders(): Promise<Folder[]> {
        const all = await db.folders.toArray();
        return all.filter((f) => !f.parentId).sort((a, b) => a.name.localeCompare(b.name));
    },

    async getChildFolders(parentId: string): Promise<Folder[]> {
        return db.folders.where("parentId").equals(parentId).sortBy("name");
    },
};

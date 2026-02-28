import { db } from "./schema";
import type { Note, SyncStatus } from "../types";

export const StorageService = {
    async getAllNotes(): Promise<Note[]> {
        return db.notes.orderBy("updatedAt").reverse().toArray();
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
};

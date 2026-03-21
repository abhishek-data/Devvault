import Dexie, { type Table } from "dexie";
import type { Note, Folder } from "../types";

export class DevVaultDB extends Dexie {
    notes!: Table<Note>;
    folders!: Table<Folder>;

    constructor() {
        super("DevVaultDB");

        this.version(1).stores({
            notes: "id, title, updatedAt, syncStatus",
        });

        this.version(2).stores({
            notes: "id, title, updatedAt, syncStatus, folderId, noteType, isPinned, isArchived",
            folders: "id, name, parentId, updatedAt",
        });
    }
}

export const db = new DevVaultDB();

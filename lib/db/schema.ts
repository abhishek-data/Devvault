import Dexie, { type Table } from "dexie";
import type { Note } from "../types";

export class DevVaultDB extends Dexie {
    notes!: Table<Note>;

    constructor() {
        super("DevVaultDB");
        this.version(1).stores({
            notes: "id, title, updatedAt, syncStatus",
        });
    }
}

export const db = new DevVaultDB();

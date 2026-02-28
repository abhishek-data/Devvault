import { StorageService } from "../db/storage";
import { markdownToNote } from "./markdown";
import { determineSyncAction } from "./conflict";
import { syncQueue } from "./queue";
import type { Note, ConflictData } from "../types";

/**
 * Pulls all notes from GitHub and syncs with local storage.
 * Returns any conflicts found.
 */
export async function fullPull(): Promise<ConflictData[]> {
    const res = await fetch("/api/github/pull");
    if (!res.ok) {
        throw new Error("Failed to pull from GitHub");
    }

    const remoteNotes: Note[] = await res.json();
    const conflicts: ConflictData[] = [];

    for (const remote of remoteNotes) {
        const local = await StorageService.getNoteById(remote.id);

        if (!local) {
            // New note from GitHub — save locally
            await StorageService.saveNote(remote);
            continue;
        }

        const action = determineSyncAction(local, remote);

        switch (action) {
            case "pull":
                await StorageService.saveNote(remote);
                break;
            case "push":
                syncQueue.add(local.id);
                break;
            case "conflict":
                conflicts.push({
                    noteId: remote.id,
                    localNote: local,
                    remoteNote: remote,
                });
                break;
            case "none":
                // No action needed
                break;
        }
    }

    // Check for local notes that don't exist on GitHub
    const allLocal = await StorageService.getAllNotes();
    const remoteIds = new Set(remoteNotes.map((n) => n.id));

    for (const local of allLocal) {
        if (!remoteIds.has(local.id) && local.syncStatus === "pending") {
            syncQueue.add(local.id);
        }
    }

    return conflicts;
}

/**
 * Runs initial sync on app load when GitHub is connected.
 */
export async function initialSync(
    onConflict: (conflict: ConflictData) => void
) {
    try {
        const conflicts = await fullPull();
        for (const conflict of conflicts) {
            onConflict(conflict);
        }
        syncQueue.flush();
    } catch {
        // Silently fail — user is probably offline
    }
}

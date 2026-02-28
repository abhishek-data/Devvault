import type { Note } from "../types";

export function detectConflict(local: Note, remote: Note): boolean {
    // A conflict exists when both sides changed since last sync
    return remote.version > local.version && local.syncStatus === "pending";
}

export type ConflictAction = "accept_local" | "accept_remote" | "keep_both";

/**
 * Determines the correct sync action when comparing local and remote notes.
 * Returns:
 * - "conflict" if both sides changed
 * - "pull" if remote is newer and local has no changes
 * - "push" if local is newer
 * - "none" if versions match
 */
export function determineSyncAction(
    local: Note,
    remote: Note
): "conflict" | "pull" | "push" | "none" {
    if (detectConflict(local, remote)) {
        return "conflict";
    }

    if (remote.version > local.version && local.syncStatus === "synced") {
        return "pull";
    }

    if (local.version > remote.version) {
        return "push";
    }

    return "none";
}

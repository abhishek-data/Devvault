import { toast } from "sonner";
import { StorageService } from "../db/storage";
import type { Note } from "../types";

interface QueueItem {
    noteId: string;
    action: "sync" | "delete";
    note?: Note; // Stored for deletes since note is removed from DB before queue processes
}

class SyncQueue {
    private queue: QueueItem[] = [];
    private processing = false;
    private paused = false;

    add(noteId: string) {
        // Deduplicate — if this note is already queued, don't add again
        if (!this.queue.some((item) => item.noteId === noteId && item.action === "sync")) {
            this.queue.push({ noteId, action: "sync" });
        }
        this.process();
    }

    addDelete(note: Note) {
        this.queue.push({ noteId: note.id, action: "delete", note });
        this.process();
    }

    private async process() {
        if (this.processing || this.paused || this.queue.length === 0) return;

        this.processing = true;

        while (this.queue.length > 0 && !this.paused) {
            const item = this.queue.shift()!;

            // Handle delete
            if (item.action === "delete" && item.note) {
                try {
                    const res = await fetch("/api/github/file", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ note: item.note, action: "delete" }),
                    });
                    if (res.ok) {
                        // Successfully deleted from GitHub
                    } else if (res.status === 404) {
                        // File already gone from GitHub — that's fine
                    } else {
                        toast.error("Failed to delete note from GitHub");
                    }
                } catch {
                    toast.info("Offline — note deleted locally but may persist on GitHub until next sync.");
                }
                continue;
            }

            try {
                // Fetch the full note from IndexedDB
                const note = await StorageService.getNoteById(item.noteId);
                if (!note) continue;

                // Determine action based on sync status
                const action = note.githubSha ? "update" : "create";

                const res = await fetch("/api/github/file", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ note, action }),
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.sha) {
                        await StorageService.updateSyncStatus(item.noteId, "synced", data.sha);
                    }
                } else if (res.status === 429) {
                    // Rate limited
                    this.queue.unshift(item);
                    this.paused = true;
                    toast.warning("Sync paused — rate limited. Retrying in 60s.");
                    setTimeout(() => {
                        this.paused = false;
                        this.process();
                    }, 60000);
                } else if (res.status === 401) {
                    // Auth expired
                    this.queue = [];
                    this.paused = true;
                    toast.error("GitHub session expired. Reconnect in Settings.");
                } else {
                    toast.error("GitHub unavailable. Changes saved locally.");
                }
            } catch {
                // Network error
                this.queue.unshift(item);
                this.paused = true;
                toast.info("You're offline. Changes will sync when reconnected.");

                // Auto-retry when back online
                const handler = () => {
                    window.removeEventListener("online", handler);
                    this.paused = false;
                    this.process();
                };
                window.addEventListener("online", handler);
            }
        }

        this.processing = false;
    }

    flush() {
        this.paused = false;
        this.process();
    }

    get length() {
        return this.queue.length;
    }
}

export const syncQueue = new SyncQueue();

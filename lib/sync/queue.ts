import { toast } from "sonner";

interface QueueItem {
    noteId: string;
}

class SyncQueue {
    private queue: QueueItem[] = [];
    private processing = false;
    private paused = false;

    add(noteId: string) {
        // Deduplicate — if this note is already queued, don't add again
        if (!this.queue.some((item) => item.noteId === noteId)) {
            this.queue.push({ noteId });
        }
        this.process();
    }

    private async process() {
        if (this.processing || this.paused || this.queue.length === 0) return;

        this.processing = true;

        while (this.queue.length > 0 && !this.paused) {
            const item = this.queue.shift()!;

            try {
                const res = await fetch("/api/github/file", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ noteId: item.noteId }),
                });

                if (res.ok) {
                    // Success — the API route handles updating sync status
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

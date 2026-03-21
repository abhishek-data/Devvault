"use client";

import { useEffect } from "react";
import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { ReactNode } from "react";
import type { Note } from "@/lib/types";

export function StoreInitializer({ children }: { children: ReactNode }) {
    const { loadNotes, loadFolders, upsertNote, setGitHubConnected, rebuildSearchIndex } =
        useDevVaultStore();
    const { data: session, status } = useSession();

    // Load local notes and folders from IndexedDB
    useEffect(() => {
        loadNotes();
        loadFolders();
    }, [loadNotes, loadFolders]);

    // Auto-pull from GitHub on load when connected
    useEffect(() => {
        if (status !== "authenticated" || !(session as any)?.accessToken) return;

        setGitHubConnected(true);

        const pullFromGitHub = async () => {
            try {
                const res = await fetch("/api/github/pull");
                if (!res.ok) return;

                const remoteNotes: Note[] = await res.json();
                if (!Array.isArray(remoteNotes) || remoteNotes.length === 0) return;

                // Merge remote notes into local DB
                let newCount = 0;
                let updatedCount = 0;

                for (const remote of remoteNotes) {
                    const local = await StorageService.getNoteById(remote.id);

                    if (!local) {
                        // New note from another device
                        await StorageService.saveNote({
                            ...remote,
                            syncStatus: "synced",
                        });
                        upsertNote({ ...remote, syncStatus: "synced" });
                        newCount++;
                    } else if (remote.version > local.version) {
                        // Remote is newer — update local
                        await StorageService.saveNote({
                            ...remote,
                            syncStatus: "synced",
                        });
                        upsertNote({ ...remote, syncStatus: "synced" });
                        updatedCount++;
                    }
                    // If local is same or newer, keep local
                }

                rebuildSearchIndex();

                if (newCount > 0 || updatedCount > 0) {
                    const parts = [];
                    if (newCount > 0) parts.push(`${newCount} new`);
                    if (updatedCount > 0) parts.push(`${updatedCount} updated`);
                    toast.success(`Pulled ${parts.join(", ")} note${newCount + updatedCount > 1 ? "s" : ""} from GitHub`);
                }
            } catch {
                // Silently fail — user can manually sync later
            }
        };

        pullFromGitHub();
    }, [status, session, setGitHubConnected, upsertNote, rebuildSearchIndex]);

    return <>{children}</>;
}

"use client";

import { useState, useEffect } from "react";
import { useDevVaultStore } from "@/lib/store";
import { signIn, signOut, useSession } from "next-auth/react";
import { X, Github, HardDrive, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { StorageService } from "@/lib/db/storage";

interface SettingsPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
    const { isGitHubConnected, setGitHubConnected, setNotes, setSyncStatus } =
        useDevVaultStore();
    const { data: session } = useSession();
    const [storageEstimate, setStorageEstimate] = useState<string>("Calculating...");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if ((session as any)?.accessToken) {
            setGitHubConnected(true);
        }
    }, [session, setGitHubConnected]);

    useEffect(() => {
        if (open && navigator.storage?.estimate) {
            navigator.storage.estimate().then((est) => {
                const usedMB = ((est.usage || 0) / (1024 * 1024)).toFixed(2);
                const totalMB = ((est.quota || 0) / (1024 * 1024)).toFixed(0);
                setStorageEstimate(`${usedMB} MB used of ${totalMB} MB`);
            });
        }
    }, [open]);

    const handleSync = async () => {
        setSyncStatus("syncing");
        try {
            const res = await fetch("/api/github/pull");
            if (res.ok) {
                toast.success("Sync complete");
            } else {
                toast.error("Sync failed");
            }
        } catch {
            toast.error("Sync failed — network error");
        } finally {
            setSyncStatus("idle");
        }
    };

    const handleDeleteAll = async () => {
        try {
            const notes = await StorageService.getAllNotes();
            for (const note of notes) {
                await StorageService.deleteNote(note.id);
            }
            setNotes([]);
            toast.success("All local notes deleted");
            setShowDeleteConfirm(false);
        } catch {
            toast.error("Failed to delete notes");
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[80]">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={() => onOpenChange(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-[380px] bg-zinc-900 border-l border-zinc-800 shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* GitHub Connection */}
                <div className="p-4 border-b border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                        <Github className="h-4 w-4" />
                        GitHub Connection
                    </h3>
                    {isGitHubConnected && session ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                {session.user?.image && (
                                    <img
                                        src={session.user.image}
                                        alt="avatar"
                                        className="h-8 w-8 rounded-full"
                                    />
                                )}
                                <div>
                                    <p className="text-sm text-zinc-200">{session.user?.name}</p>
                                    <a
                                        href={`https://github.com/${session.user?.name}/devvault-notes`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:underline"
                                    >
                                        devvault-notes repo
                                    </a>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSync}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Sync now
                                </button>
                                <button
                                    onClick={() => {
                                        signOut();
                                        setGitHubConnected(false);
                                    }}
                                    className="px-3 py-1.5 rounded-md text-sm border border-zinc-700 hover:bg-zinc-800 text-zinc-400 transition-colors"
                                >
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn("github")}
                            className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm transition-colors"
                        >
                            <Github className="h-4 w-4" />
                            Connect GitHub
                        </button>
                    )}
                </div>

                {/* Storage */}
                <div className="p-4 border-b border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        Storage
                    </h3>
                    <p className="text-sm text-zinc-400">{storageEstimate}</p>
                    <button
                        disabled
                        className="mt-3 px-3 py-1.5 rounded-md text-sm bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    >
                        Export all notes as ZIP — coming soon
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="p-4">
                    <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Danger Zone
                    </h3>
                    {showDeleteConfirm ? (
                        <div className="space-y-2">
                            <p className="text-sm text-zinc-400">
                                Are you sure? This will permanently delete all local notes.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDeleteAll}
                                    className="px-3 py-1.5 rounded-md text-sm bg-red-600 hover:bg-red-500 text-white transition-colors"
                                >
                                    Yes, delete all
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-3 py-1.5 rounded-md text-sm border border-zinc-700 hover:bg-zinc-800 text-zinc-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-3 py-1.5 rounded-md text-sm border border-red-800 hover:bg-red-900/30 text-red-400 transition-colors"
                        >
                            Delete all local notes
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

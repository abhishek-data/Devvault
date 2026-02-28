"use client";

import { useEffect, useCallback } from "react";
import { useDevVaultStore } from "@/lib/store";
import { Vault, Search, Settings } from "lucide-react";
import { SyncStatusIndicator } from "@/components/sync/SyncStatusIndicator";
import { SearchModal } from "@/components/search/SearchModal";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { useState } from "react";

export function Header() {
    const { setSearchOpen, isSearchOpen } = useDevVaultStore();
    const [settingsOpen, setSettingsOpen] = useState(false);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen(!isSearchOpen);
            }
        },
        [setSearchOpen, isSearchOpen]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <>
            <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
                {/* Left: Logo */}
                <div className="flex items-center gap-2">
                    <Vault className="h-5 w-5 text-blue-500" />
                    <span className="text-base font-semibold text-zinc-100 tracking-tight">
                        DevVault
                    </span>
                </div>

                {/* Center: Search trigger */}
                <button
                    onClick={() => setSearchOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-400 text-sm hover:border-zinc-600 hover:text-zinc-300 transition-colors min-w-[260px]"
                >
                    <Search className="h-4 w-4" />
                    <span>Search notes...</span>
                    <kbd className="ml-auto text-xs bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                        ⌘K
                    </kbd>
                </button>

                {/* Right: Sync + Settings */}
                <div className="flex items-center gap-3">
                    <SyncStatusIndicator />
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        <Settings className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <SearchModal />
            <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
        </>
    );
}

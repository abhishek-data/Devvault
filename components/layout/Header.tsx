"use client";

import { useEffect, useCallback } from "react";
import { useDevVaultStore } from "@/lib/store";
import { Vault, Search, Settings, PanelLeftClose, PanelLeftOpen, Sun, Moon } from "lucide-react";
import { SyncStatusIndicator } from "@/components/sync/SyncStatusIndicator";
import { SearchModal } from "@/components/search/SearchModal";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { useState } from "react";

export function Header() {
    const { setSearchOpen, isSearchOpen, toggleSidebar, sidebarCollapsed, theme, toggleTheme } =
        useDevVaultStore();
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
            <header className="h-14 border-b border-zinc-800 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
                {/* Left: Sidebar toggle + Logo */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {sidebarCollapsed ? (
                            <PanelLeftOpen className="h-5 w-5" />
                        ) : (
                            <PanelLeftClose className="h-5 w-5" />
                        )}
                    </button>
                    <Vault className="h-5 w-5 text-blue-500" />
                    <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        DevVault
                    </span>
                </div>

                {/* Center: Search trigger */}
                <button
                    onClick={() => setSearchOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-sm hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors min-w-[260px]"
                >
                    <Search className="h-4 w-4" />
                    <span>Search notes...</span>
                    <kbd className="ml-auto text-xs bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">
                        ⌘K
                    </kbd>
                </button>

                {/* Right: Theme toggle + Sync + Settings */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {theme === "dark" ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </button>
                    <SyncStatusIndicator />
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
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

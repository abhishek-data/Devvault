"use client";

import { useEffect, useCallback, useState } from "react";
import { useDevVaultStore } from "@/lib/store";
import {
  Vault,
  Search,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Link2,
} from "lucide-react";
import { SyncStatusIndicator } from "@/components/sync/SyncStatusIndicator";
import { SearchModal } from "@/components/search/SearchModal";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { QuickCapture } from "@/components/capture/QuickCapture";

export function Header() {
  const { setSearchOpen, isSearchOpen, toggleSidebar, sidebarCollapsed } =
    useDevVaultStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);

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
      <header
        className="h-[64px] flex items-center justify-between px-6 sticky top-0 z-[50] bg-[var(--bg-base)] border-b border-[var(--border-subtle)]"
      >
        <div className="flex-1 flex items-center gap-3 justify-center lg:justify-start">
          <button 
            onClick={() => toggleSidebar()} 
            className="icon-button hover:bg-[var(--bg-surface)] flex"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex w-full max-w-[400px] h-[36px] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-3 items-center gap-[8px] hover:border-[var(--border-strong)] transition-colors"
          >
            <Search className="h-[14px] w-[14px] text-[var(--text-secondary)]" />
            <span className="text-[13px] text-[var(--text-secondary)]">Search notes...</span>
            <kbd className="ml-auto hidden md:inline-block border-none bg-transparent text-[11px] text-[var(--text-tertiary)]">⌘K</kbd>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCaptureOpen(true)}
            className="icon-button hover:bg-[var(--bg-surface)]"
            title="Quick Capture (⌘⇧L)"
          >
            <Link2 className="h-[18px] w-[18px]" />
          </button>
          <SyncStatusIndicator />
          <button onClick={() => setSettingsOpen(true)} className="icon-button hover:bg-[var(--bg-surface)]">
            <Settings className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      <SearchModal />
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
      <QuickCapture open={captureOpen} onOpenChange={setCaptureOpen} />
    </>
  );
}

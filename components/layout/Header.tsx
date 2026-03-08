"use client";

import { useEffect, useCallback, useState } from "react";
import { useDevVaultStore } from "@/lib/store";
import {
  Vault,
  Search,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { SyncStatusIndicator } from "@/components/sync/SyncStatusIndicator";
import { SearchModal } from "@/components/search/SearchModal";
import { SettingsPanel } from "@/components/layout/SettingsPanel";

export function Header() {
  const { setSearchOpen, isSearchOpen, toggleSidebar, sidebarCollapsed } =
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
      <header
        className="h-[44px] border-b border-[var(--border-subtle)] backdrop-blur-[12px] backdrop-saturate-[180%] flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-[100]"
        style={{ background: "var(--header-bg)" }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            className="icon-button"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          <Vault className="h-6 w-6 text-[var(--accent-primary)]" />
          <span className="text-[14px] font-semibold text-[var(--text-primary)]">
            DevVault
          </span>
        </div>

        <button
          onClick={() => setSearchOpen(true)}
          className="w-[220px] h-7 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-[10px] flex items-center gap-[6px] hover:border-[var(--border-strong)] hover:bg-[var(--bg-overlay)]"
        >
          <Search className="h-[13px] w-[13px] text-[var(--text-tertiary)]" />
          <span className="text-[12px] text-[var(--text-tertiary)]">Search...</span>
          <kbd className="ml-auto">⌘K</kbd>
        </button>

        <div className="flex items-center gap-2">
          <SyncStatusIndicator />
          <div className="w-px h-4 bg-[var(--border-default)]" />
          <button onClick={() => setSettingsOpen(true)} className="icon-button">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      <SearchModal />
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDevVaultStore } from "@/lib/store";
import { createSearchInstance } from "@/lib/search/index";
import { SearchResult } from "./SearchResult";
import { Search, X, Clock, FileText, Code2, Bookmark, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FuseResult } from "fuse.js";
import type { SearchIndexEntry, NoteType } from "@/lib/types";

const RECENT_KEY = "devvault-recent-searches";
const MAX_RECENT = 5;

const TYPE_CHIPS: { type: NoteType; label: string; icon: React.ReactNode }[] = [
  { type: "note", label: "Notes", icon: <FileText className="h-3 w-3" /> },
  { type: "snippet", label: "Snippets", icon: <Code2 className="h-3 w-3" /> },
  { type: "bookmark", label: "Bookmarks", icon: <Bookmark className="h-3 w-3" /> },
  { type: "reference", label: "References", icon: <BookOpen className="h-3 w-3" /> },
];

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const recent = getRecentSearches().filter((q) => q !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function SearchModal() {
  const { isSearchOpen, setSearchOpen, searchIndex, folders } = useDevVaultStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FuseResult<SearchIndexEntry>[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [typeFilter, setTypeFilter] = useState<NoteType | null>(null);
  const [folderFilter, setFolderFilter] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery("");
      setResults([]);
      setSelectedIdx(0);
      setTypeFilter(null);
      setFolderFilter(null);
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const runSearch = useCallback(
    (q: string, type: NoteType | null, folder: string | null) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }

      let index = searchIndex;

      // Pre-filter the index before Fuse search
      if (type) {
        index = index.filter((e) => e.noteType === type);
      }
      if (folder) {
        index = index.filter((e) => e.folderId === folder);
      }

      const fuse = createSearchInstance(index);
      const found = fuse.search(q).slice(0, 25);

      // Deduplicate by noteId — keep best match per note
      const seen = new Set<string>();
      const deduped = found.filter((r) => {
        if (seen.has(r.item.noteId)) return false;
        seen.add(r.item.noteId);
        return true;
      });

      setResults(deduped);
      setSelectedIdx(0);
    },
    [searchIndex]
  );

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value, typeFilter, folderFilter), 120);
  };

  const handleTypeFilter = (type: NoteType) => {
    const next = typeFilter === type ? null : type;
    setTypeFilter(next);
    runSearch(query, next, folderFilter);
  };

  const handleFolderFilter = (folderId: string) => {
    const next = folderFilter === folderId ? null : folderId;
    setFolderFilter(next);
    runSearch(query, typeFilter, next);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIdx]) {
      e.preventDefault();
      navigateToResult(selectedIdx);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSearchOpen(false);
    }
  };

  const navigateToResult = (idx: number) => {
    const result = results[idx];
    if (!result) return;
    if (query.trim()) saveRecentSearch(query.trim());
    const item = result.item;
    const hash = item.blockId ? `#block-${item.blockId}` : "";
    setSearchOpen(false);
    window.location.href = `/app/notes/${item.noteId}${hash}`;
  };

  const handleRecentClick = (q: string) => {
    setQuery(q);
    runSearch(q, typeFilter, folderFilter);
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecentSearches([]);
  };

  if (!isSearchOpen) return null;

  const showEmptyState = !query.trim() && results.length === 0;
  const showNoResults = query.trim() && results.length === 0;
  const hasActiveFilters = typeFilter || folderFilter;

  return (
    <div
      className="fixed inset-0 z-[90] bg-[rgba(4,4,12,0.8)] backdrop-blur-[8px]"
      style={{ animation: "fadeIn 150ms ease" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSearchOpen(false);
      }}
    >
      <div
        className="fixed top-[10%] sm:top-[14%] left-1/2 w-[580px] md:w-[640px] max-w-[calc(100vw-24px)] max-h-[70vh] sm:max-h-[520px] -translate-x-1/2 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[var(--radius-xl)] overflow-hidden shadow-2xl flex flex-col"
        style={{
          animation: "slideDown 180ms cubic-bezier(0.16,1,0.3,1)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(167,243,208,0.15)",
        }}
      >
        {/* Search input */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex-shrink-0">
          <Search className="h-4 w-4 text-[var(--accent-primary)] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes, bookmarks, code, tags..."
            className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          />
          {(query || hasActiveFilters) && (
            <button
              onClick={() => { setQuery(""); setTypeFilter(null); setFolderFilter(null); setResults([]); }}
              className="p-1 rounded hover:bg-[var(--bg-overlay)] text-[var(--text-tertiary)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="h-5 px-1.5 bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded text-[10px] font-bold text-[var(--text-tertiary)] flex items-center flex-shrink-0">
            ESC
          </kbd>
        </div>

        {/* Filter chips */}
        <div className="px-4 py-2 flex items-center gap-1.5 border-b border-[var(--border-subtle)] flex-shrink-0 overflow-x-auto">
          {TYPE_CHIPS.map((chip) => (
            <button
              key={chip.type}
              onClick={() => handleTypeFilter(chip.type)}
              className={cn(
                "h-6 px-2 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap border",
                typeFilter === chip.type
                  ? "bg-[var(--accent-dim)] border-[var(--accent-muted)] text-[var(--text-accent)]"
                  : "border-[var(--border-default)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              )}
            >
              {chip.icon}
              {chip.label}
            </button>
          ))}

          {folders.length > 0 && (
            <>
              <span className="w-px h-4 bg-[var(--border-default)] mx-0.5" />
              {folders.slice(0, 4).map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFolderFilter(f.id)}
                  className={cn(
                    "h-6 px-2 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap border",
                    folderFilter === f.id
                      ? "bg-[var(--accent-dim)] border-[var(--accent-muted)] text-[var(--text-accent)]"
                      : "border-[var(--border-default)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                  )}
                >
                  {f.name}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Results / Empty state */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Recent searches */}
          {showEmptyState && recentSearches.length > 0 && (
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Recent</span>
                <button onClick={clearRecent} className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                  Clear
                </button>
              </div>
              {recentSearches.map((q) => (
                <button
                  key={q}
                  onClick={() => handleRecentClick(q)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-sm)] text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <Clock className="h-3 w-3 text-[var(--text-tertiary)]" />
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {showNoResults && (
            <div className="py-10 px-5 text-center flex flex-col items-center gap-2">
              <Search className="h-6 w-6 opacity-20 text-[var(--text-secondary)]" />
              <p className="text-[13px] text-[var(--text-tertiary)]">
                No results for &ldquo;{query}&rdquo;
                {hasActiveFilters && " with current filters"}
              </p>
            </div>
          )}

          {/* Results list */}
          {results.length > 0 && (
            <div className="p-1">
              {results.map((result, idx) => (
                <SearchResult
                  key={`${result.item.noteId}-${result.item.blockId || "title"}-${idx}`}
                  result={result}
                  isSelected={idx === selectedIdx}
                  onClick={() => navigateToResult(idx)}
                />
              ))}
            </div>
          )}

          {/* Empty hint */}
          {showEmptyState && recentSearches.length === 0 && (
            <div className="py-10 px-5 text-center">
              <p className="text-[12px] text-[var(--text-tertiary)]">
                Search across all notes, bookmarks, code blocks, and tags.
                <br />
                Use filters to narrow results by type or folder.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

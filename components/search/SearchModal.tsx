"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDevVaultStore } from "@/lib/store";
import { createSearchInstance } from "@/lib/search/index";
import { SearchResult } from "./SearchResult";
import { Search } from "lucide-react";
import type { FuseResult } from "fuse.js";
import type { SearchIndexEntry } from "@/lib/types";

export function SearchModal() {
  const { isSearchOpen, setSearchOpen, searchIndex } = useDevVaultStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FuseResult<SearchIndexEntry>[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery("");
      setResults([]);
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const handleSearch = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      const fuse = createSearchInstance(searchIndex);
      const found = fuse.search(q).slice(0, 20);
      setResults(found);
      setSelectedIdx(0);
    },
    [searchIndex]
  );

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(value), 150);
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
    const item = result.item;
    const hash = item.blockId ? `#block-${item.blockId}` : "";
    setSearchOpen(false);
    window.location.href = `/app/notes/${item.noteId}${hash}`;
  };

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-[rgba(4,4,12,0.8)] backdrop-blur-[8px]"
      style={{ animation: "fadeIn 150ms ease" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSearchOpen(false);
      }}
    >
      <div
        className="fixed top-[10%] sm:top-[16%] lg:top-[20%] left-1/2 w-[560px] md:w-[620px] max-w-[calc(100vw-24px)] max-h-[70vh] sm:max-h-[480px] -translate-x-1/2 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[var(--radius-xl)] overflow-hidden shadow-2xl"
        style={{
          animation: "slideDown 180ms cubic-bezier(0.16,1,0.3,1)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.3)",
        }}
      >
        <div className="px-5 py-4 flex items-center gap-[12px] border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <Search className="h-5 w-5 text-[var(--accent-primary)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes, code, tags..."
            className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium tracking-wide text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          />
          <kbd className="h-6 px-2 bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[11px] font-bold text-[var(--text-secondary)] flex items-center justify-center shadow-sm">
            ESC
          </kbd>
        </div>

        <div className="p-[6px] overflow-y-auto max-h-[380px] bg-[var(--bg-surface)]">
          {query.trim() && results.length === 0 && (
            <div className="py-12 px-5 text-center text-[13px] text-[var(--text-tertiary)] flex flex-col items-center gap-3">
              <Search className="h-8 w-8 opacity-20 text-[var(--text-secondary)]" />
              <p className="font-medium tracking-wide">No results found for "{query}"</p>
            </div>
          )}
          {results.map((result, idx) => (
            <SearchResult
              key={`${result.item.noteId}-${result.item.blockId || "title"}-${idx}`}
              result={result}
              isSelected={idx === selectedIdx}
              onClick={() => navigateToResult(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

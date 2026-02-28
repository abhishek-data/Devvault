"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDevVaultStore } from "@/lib/store";
import { createSearchInstance } from "@/lib/search/index";
import { SearchResult } from "./SearchResult";
import { Search, X } from "lucide-react";
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
        window.location.href = `/notes/${item.noteId}${hash}`;
    };

    if (!isSearchOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) setSearchOpen(false);
            }}
        >
            <div className="bg-zinc-900 border border-zinc-700 rounded-md w-full max-w-2xl mx-4 shadow-2xl overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
                    <Search className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search notes..."
                        className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
                    />
                    <button
                        onClick={() => setSearchOpen(false)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[400px] overflow-y-auto">
                    {query.trim() && results.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                            <Search className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">No results found</p>
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

                {/* Footer with keyboard hints */}
                {results.length > 0 && (
                    <div className="px-4 py-2 border-t border-zinc-800 flex items-center gap-3 text-xs text-zinc-500">
                        <span>
                            <kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700 mr-1">
                                ↑↓
                            </kbd>
                            Navigate
                        </span>
                        <span>
                            <kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700 mr-1">
                                ↵
                            </kbd>
                            Open
                        </span>
                        <span>
                            <kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-zinc-700 mr-1">
                                Esc
                            </kbd>
                            Close
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

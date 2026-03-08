"use client";

import type { SearchIndexEntry } from "@/lib/types";
import type { FuseResult } from "fuse.js";
import { cn } from "@/lib/utils";

interface SearchResultProps {
  result: FuseResult<SearchIndexEntry>;
  isSelected: boolean;
  onClick: () => void;
}

export function SearchResult({ result, isSelected, onClick }: SearchResultProps) {
  const { item, matches } = result;

  const highlightSnippet = () => {
    const text = item.snippet;
    if (!matches || matches.length === 0) return text;

    const snippetMatch = matches.find((m) => m.key === "snippet");
    if (!snippetMatch || !snippetMatch.indices) return text;

    const firstIdx = snippetMatch.indices[0];
    const matchStart = firstIdx[0];
    const start = Math.max(0, matchStart - 40);
    const end = Math.min(text.length, matchStart + 40);
    const slice = text.slice(start, end);

    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    for (const [idxStart, idxEnd] of snippetMatch.indices) {
      const adjStart = idxStart - start;
      const adjEnd = idxEnd - start + 1;

      if (adjStart < 0 || adjStart >= slice.length) continue;

      if (adjStart > lastEnd) {
        parts.push(slice.slice(lastEnd, adjStart));
      }
      parts.push(
        <span
          key={adjStart}
          className="text-[var(--text-accent)] bg-[var(--accent-dim)] rounded-[2px] px-[1px] font-medium"
        >
          {slice.slice(Math.max(0, adjStart), Math.min(slice.length, adjEnd))}
        </span>
      );
      lastEnd = Math.min(slice.length, adjEnd);
    }
    if (lastEnd < slice.length) {
      parts.push(slice.slice(lastEnd));
    }

    return (
      <>
        {start > 0 && "..."}
        {parts}
        {end < text.length && "..."}
      </>
    );
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-[10px] py-[9px] flex flex-col gap-[3px] rounded-[var(--radius-md)] cursor-pointer border-l-2 border-transparent",
        "hover:bg-[var(--bg-overlay)] hover:border-l-[var(--accent-primary)] hover:pl-2",
        isSelected && "bg-[var(--bg-overlay)] border-l-[var(--accent-primary)] pl-2"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-[var(--text-primary)]">{item.noteTitle}</span>
        {item.blockType && (
          <span className="text-[10px] font-medium uppercase tracking-[0.5px] px-[6px] py-[1px] bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[var(--text-tertiary)]">
            {item.blockType}
          </span>
        )}
      </div>
      <p className="text-[12px] text-[var(--text-secondary)] leading-[1.5] truncate">{highlightSnippet()}</p>
    </button>
  );
}

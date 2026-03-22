"use client";

import type { SearchIndexEntry } from "@/lib/types";
import type { FuseResult } from "fuse.js";
import { cn } from "@/lib/utils";
import { FileText, Code2, Bookmark, BookOpen, Link2, Globe } from "lucide-react";

const noteTypeIcons: Record<string, React.ReactNode> = {
  note: <FileText className="h-3.5 w-3.5" />,
  snippet: <Code2 className="h-3.5 w-3.5" />,
  bookmark: <Bookmark className="h-3.5 w-3.5" />,
  reference: <BookOpen className="h-3.5 w-3.5" />,
};

const blockTypeLabels: Record<string, string> = {
  paragraph: "text",
  heading: "heading",
  code: "code",
  link: "link",
};

interface SearchResultProps {
  result: FuseResult<SearchIndexEntry>;
  isSelected: boolean;
  onClick: () => void;
}

export function SearchResult({ result, isSelected, onClick }: SearchResultProps) {
  const { item, matches } = result;
  const icon = noteTypeIcons[item.noteType || "note"] || <FileText className="h-3.5 w-3.5" />;

  const highlightSnippet = () => {
    const text = item.snippet;
    if (!matches || matches.length === 0) return text;

    const snippetMatch = matches.find((m) => m.key === "snippet");
    if (!snippetMatch || !snippetMatch.indices) return text;

    const firstIdx = snippetMatch.indices[0];
    const matchStart = firstIdx[0];
    const start = Math.max(0, matchStart - 40);
    const end = Math.min(text.length, matchStart + 80);
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
        "w-full text-left px-3 py-2 flex items-start gap-2.5 rounded-[var(--radius-md)] cursor-pointer transition-colors",
        isSelected
          ? "bg-[var(--bg-overlay)]"
          : "hover:bg-[var(--bg-elevated)]"
      )}
    >
      {/* Type icon */}
      <span className="flex-shrink-0 mt-0.5 text-[var(--text-tertiary)]">{icon}</span>

      <div className="flex-1 min-w-0">
        {/* Title + badges */}
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">
            {item.noteTitle}
          </span>
          {item.blockType && item.blockType !== "paragraph" && (
            <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--bg-overlay)] text-[var(--text-tertiary)] flex-shrink-0">
              {blockTypeLabels[item.blockType] || item.blockType}
            </span>
          )}
          {item.domain && (
            <span className="text-[9px] text-[var(--text-tertiary)] flex items-center gap-0.5 flex-shrink-0">
              <Globe className="h-2.5 w-2.5" />
              {item.domain}
            </span>
          )}
        </div>

        {/* Snippet */}
        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed truncate mt-0.5">
          {highlightSnippet()}
        </p>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--bg-overlay)] text-[var(--text-tertiary)] border border-[var(--border-default)]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

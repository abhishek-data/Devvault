"use client";

import type { SearchIndexEntry } from "@/lib/types";
import type { FuseResult } from "fuse.js";
import { cn } from "@/lib/utils";
import { FileText, Heading, Code2, Minus } from "lucide-react";

const blockTypeIcons: Record<string, React.ReactNode> = {
    paragraph: <FileText className="h-3 w-3" />,
    heading: <Heading className="h-3 w-3" />,
    code: <Code2 className="h-3 w-3" />,
    divider: <Minus className="h-3 w-3" />,
};

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

        // Get all match indices for the snippet field
        const snippetMatch = matches.find((m) => m.key === "snippet");
        if (!snippetMatch || !snippetMatch.indices) return text;

        // Get a window around the first match
        const firstIdx = snippetMatch.indices[0];
        const matchStart = firstIdx[0];
        const start = Math.max(0, matchStart - 40);
        const end = Math.min(text.length, matchStart + 40);
        const slice = text.slice(start, end);

        // Adjust indices relative to the slice
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
                <span key={adjStart} className="text-blue-400 font-medium">
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
                "w-full text-left px-4 py-3 flex flex-col gap-1 hover:bg-zinc-800 transition-colors",
                isSelected && "bg-zinc-800"
            )}
        >
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-100">
                    {item.noteTitle}
                </span>
                {item.blockType && (
                    <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400">
                        {blockTypeIcons[item.blockType]}
                        {item.blockType}
                    </span>
                )}
            </div>
            <p className="text-xs text-zinc-400 line-clamp-1">
                {highlightSnippet()}
            </p>
            {item.tags.length > 0 && (
                <div className="flex gap-1">
                    {item.tags.map((tag) => (
                        <span key={tag} className="text-xs text-zinc-500">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </button>
    );
}

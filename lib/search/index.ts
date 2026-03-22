import type { SearchIndexEntry, Note, LinkBlock } from "../types";
import Fuse from "fuse.js";

export function buildSearchIndex(notes: Note[]): SearchIndexEntry[] {
    const entries: SearchIndexEntry[] = [];

    for (const note of notes) {
        // Extract domain from link blocks if present
        const linkBlock = note.blocks.find((b): b is LinkBlock => b.type === "link");
        const domain = linkBlock?.domain || "";

        const baseMeta = {
            noteId: note.id,
            noteTitle: note.title,
            tags: note.tags,
            noteType: note.noteType || "note",
            folderId: note.folderId,
            readingStatus: note.readingStatus || "unread",
            domain,
        };

        // Title-level entry
        entries.push({
            ...baseMeta,
            blockId: null,
            blockType: null,
            snippet: note.title,
        });

        // Block-level entries
        for (const block of note.blocks) {
            if (block.type === "divider") continue;

            const snippet = block.type === "link"
                ? `${block.title || ""} ${block.description || ""} ${block.url}`.trim()
                : block.text;

            entries.push({
                ...baseMeta,
                blockId: block.blockId,
                blockType: block.type,
                snippet,
            });
        }
    }

    return entries;
}

export function createSearchInstance(index: SearchIndexEntry[]) {
    return new Fuse(index, {
        keys: [
            { name: "noteTitle", weight: 0.35 },
            { name: "snippet", weight: 0.35 },
            { name: "tags", weight: 0.15 },
            { name: "domain", weight: 0.15 },
        ],
        threshold: 0.3,
        includeMatches: true,
        minMatchCharLength: 2,
    });
}

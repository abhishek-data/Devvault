import type { SearchIndexEntry, Note } from "../types";
import Fuse from "fuse.js";

export function buildSearchIndex(notes: Note[]): SearchIndexEntry[] {
    const entries: SearchIndexEntry[] = [];

    for (const note of notes) {
        // Add a title-level entry for each note
        entries.push({
            noteId: note.id,
            noteTitle: note.title,
            blockId: null,
            blockType: null,
            snippet: note.title,
            tags: note.tags,
        });

        // Add block-level entries
        for (const block of note.blocks) {
            if (block.type === "divider") continue;

            const snippet = block.type === "link"
                ? `${block.title || ""} ${block.description || ""} ${block.url}`.trim()
                : block.text;

            entries.push({
                noteId: note.id,
                noteTitle: note.title,
                blockId: block.blockId,
                blockType: block.type,
                snippet,
                tags: note.tags,
            });
        }
    }

    return entries;
}

export function createSearchInstance(index: SearchIndexEntry[]) {
    return new Fuse(index, {
        keys: [
            { name: "noteTitle", weight: 0.4 },
            { name: "snippet", weight: 0.4 },
            { name: "tags", weight: 0.2 },
        ],
        threshold: 0.3,
        includeMatches: true,
        minMatchCharLength: 2,
    });
}

export type SyncStatus = "local_only" | "synced" | "pending" | "conflict";

export type BlockType = "paragraph" | "heading" | "code" | "divider";

export interface ParagraphBlock {
    blockId: string;
    type: "paragraph";
    text: string;
}

export interface HeadingBlock {
    blockId: string;
    type: "heading";
    level: 1 | 2 | 3;
    text: string;
}

export interface CodeBlock {
    blockId: string;
    type: "code";
    language: string;
    text: string;
}

export interface DividerBlock {
    blockId: string;
    type: "divider";
}

export type Block = ParagraphBlock | HeadingBlock | CodeBlock | DividerBlock;

export interface Note {
    id: string;
    title: string;
    tags: string[];
    blocks: Block[];
    createdAt: string;
    updatedAt: string;
    syncStatus: SyncStatus;
    githubSha?: string;
    version: number;
}

export interface SearchIndexEntry {
    noteId: string;
    noteTitle: string;
    blockId: string | null;
    blockType: string | null;
    snippet: string;
    tags: string[];
}

export interface ConflictData {
    noteId: string;
    localNote: Note;
    remoteNote: Note;
}

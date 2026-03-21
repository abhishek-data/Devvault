export type SyncStatus = "local_only" | "synced" | "pending" | "conflict";

export type BlockType = "paragraph" | "heading" | "code" | "divider" | "link";

export type NoteType = "note" | "snippet" | "bookmark" | "reference";

export interface Folder {
    id: string;
    name: string;
    parentId?: string;
    icon?: string;
    color?: string;
    createdAt: string;
    updatedAt: string;
}

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

export interface LinkBlock {
    blockId: string;
    type: "link";
    url: string;
    title?: string;
    description?: string;
    image?: string;
    domain?: string;
    favicon?: string;
    contentType?: "article" | "youtube" | "github" | "tweet" | "generic";
}

export type Block = ParagraphBlock | HeadingBlock | CodeBlock | DividerBlock | LinkBlock;

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
    folderId?: string;
    noteType?: NoteType;
    isPinned?: boolean;
    isArchived?: boolean;
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

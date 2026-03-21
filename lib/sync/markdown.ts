import type { Note } from "../types";
import matter from "gray-matter";

export function noteToMarkdown(note: Note): string {
    const frontmatter: Record<string, unknown> = {
        id: note.id,
        title: note.title,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        version: note.version,
    };

    // Only include new fields when they have non-default values
    if (note.folderId) frontmatter.folderId = note.folderId;
    if (note.noteType && note.noteType !== "note") frontmatter.noteType = note.noteType;
    if (note.isPinned) frontmatter.isPinned = true;
    if (note.isArchived) frontmatter.isArchived = true;

    const lines: string[] = [];

    for (const block of note.blocks) {
        switch (block.type) {
            case "heading":
                lines.push(`<!-- block:${block.blockId}:heading:${block.level} -->`);
                lines.push(`${"#".repeat(block.level)} ${block.text}`);
                lines.push("");
                break;
            case "code":
                lines.push(`<!-- block:${block.blockId}:code:${block.language} -->`);
                lines.push("```" + block.language);
                lines.push(block.text);
                lines.push("```");
                lines.push("");
                break;
            case "paragraph":
                lines.push(`<!-- block:${block.blockId}:paragraph -->`);
                lines.push(block.text);
                lines.push("");
                break;
            case "divider":
                lines.push(`<!-- block:${block.blockId}:divider -->`);
                lines.push("---");
                lines.push("");
                break;
        }
    }

    const content = lines.join("\n");
    return matter.stringify(content, frontmatter);
}

export function markdownToNote(markdown: string, sha: string): Note {
    const { data, content } = matter(markdown);

    const blocks: Note["blocks"] = [];
    const lines = content.split("\n");

    let i = 0;
    while (i < lines.length) {
        const line = lines[i].trim();

        // Parse block comment markers
        const blockMatch = line.match(
            /^<!-- block:([^:]+):([^:]+)(?::(.+))? -->$/
        );

        if (blockMatch) {
            const blockId = blockMatch[1];
            const blockType = blockMatch[2];
            const extra = blockMatch[3];
            i++;

            switch (blockType) {
                case "heading": {
                    const level = parseInt(extra || "1", 10) as 1 | 2 | 3;
                    const headingLine = lines[i] || "";
                    const text = headingLine.replace(/^#{1,3}\s*/, "");
                    blocks.push({ blockId, type: "heading", level, text });
                    i++;
                    break;
                }
                case "code": {
                    const language = extra || "plaintext";
                    i++; // Skip opening ```language
                    const codeLines: string[] = [];
                    while (i < lines.length && !lines[i].trim().startsWith("```")) {
                        codeLines.push(lines[i]);
                        i++;
                    }
                    i++; // Skip closing ```
                    blocks.push({
                        blockId,
                        type: "code",
                        language,
                        text: codeLines.join("\n"),
                    });
                    break;
                }
                case "paragraph": {
                    const textLines: string[] = [];
                    while (
                        i < lines.length &&
                        lines[i].trim() !== "" &&
                        !lines[i].trim().startsWith("<!-- block:")
                    ) {
                        textLines.push(lines[i]);
                        i++;
                    }
                    blocks.push({
                        blockId,
                        type: "paragraph",
                        text: textLines.join("\n"),
                    });
                    break;
                }
                case "divider": {
                    blocks.push({ blockId, type: "divider" });
                    i++; // Skip ---
                    break;
                }
                default:
                    break;
            }
        } else {
            i++;
        }
    }

    return {
        id: data.id || "",
        title: data.title || "",
        tags: data.tags || [],
        blocks,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        syncStatus: "synced",
        githubSha: sha,
        version: data.version || 1,
        folderId: data.folderId || undefined,
        noteType: data.noteType || "note",
        isPinned: data.isPinned || false,
        isArchived: data.isArchived || false,
    };
}

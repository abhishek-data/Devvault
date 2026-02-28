"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { AddBlockMenu } from "./AddBlockMenu";
import type { Note, Block } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Copy, Check, ChevronDown } from "lucide-react";

const lowlight = createLowlight(common);

const LANGUAGES = [
    "plaintext",
    "bash",
    "javascript",
    "typescript",
    "python",
    "sql",
    "json",
    "yaml",
];

interface BlockEditorProps {
    note: Note;
    onSave: (note: Note) => void;
}

export function BlockEditor({ note, onSave }: BlockEditorProps) {
    const { isDirty, setDirty, isGitHubConnected, upsertNote, rebuildSearchIndex } =
        useDevVaultStore();
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const noteRef = useRef(note);
    const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

    useEffect(() => {
        noteRef.current = note;
    }, [note]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            CodeBlockLowlight.configure({
                lowlight,
                defaultLanguage: "plaintext",
            }),
        ],
        content: noteToEditorContent(note),
        editorProps: {
            attributes: {
                class: "tiptap prose-invert focus:outline-none min-h-[300px] px-1",
                "data-placeholder": "Start writing...",
            },
        },
        onUpdate: ({ editor }) => {
            setDirty(true);

            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                saveFromEditor(editor);
            }, 1500);
        },
    });

    const saveFromEditor = useCallback(
        async (editorInstance: Editor) => {
            const blocks = editorContentToBlocks(editorInstance);
            const now = new Date().toISOString();
            const updated: Note = {
                ...noteRef.current,
                blocks,
                updatedAt: now,
                version: noteRef.current.version + 1,
                syncStatus: isGitHubConnected ? "pending" : noteRef.current.syncStatus,
            };

            try {
                await StorageService.saveNote(updated);
                upsertNote(updated);
                rebuildSearchIndex();
                setDirty(false);
                noteRef.current = updated;
                onSave(updated);
            } catch {
                toast.error("Failed to save note locally. Try refreshing.");
            }
        },
        [isGitHubConnected, upsertNote, rebuildSearchIndex, setDirty, onSave]
    );

    // Manual save (⌘S)
    useEffect(() => {
        const handleSave = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault();
                if (editor) {
                    if (debounceRef.current) clearTimeout(debounceRef.current);
                    saveFromEditor(editor);
                }
            }
        };
        window.addEventListener("keydown", handleSave);
        return () => window.removeEventListener("keydown", handleSave);
    }, [editor, saveFromEditor]);

    // Update tab title for dirty state
    useEffect(() => {
        const base = note.title || "Untitled Note";
        document.title = isDirty ? `${base} •` : base;
        return () => {
            document.title = "DevVault";
        };
    }, [isDirty, note.title]);

    const handleCopyCode = async (text: string, blockId: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedBlock(blockId);
        setTimeout(() => setCopiedBlock(null), 2000);
    };

    if (!editor) return null;

    return (
        <div className="relative">
            <EditorContent editor={editor} />
            <AddBlockMenu editor={editor} />

            {/* Code block floating toolbars — rendered via portal-like approach */}
            <CodeBlockToolbars
                editor={editor}
                copiedBlock={copiedBlock}
                onCopy={handleCopyCode}
            />
        </div>
    );
}

function CodeBlockToolbars({
    editor,
    copiedBlock,
    onCopy,
}: {
    editor: Editor;
    copiedBlock: string | null;
    onCopy: (text: string, blockId: string) => void;
}) {
    const [codeBlocks, setCodeBlocks] = useState<
        { pos: number; language: string; text: string; blockId: string; element: HTMLElement | null }[]
    >([]);

    useEffect(() => {
        const update = () => {
            const blocks: typeof codeBlocks = [];
            editor.state.doc.descendants((node, pos) => {
                if (node.type.name === "codeBlock") {
                    const blockId = node.attrs.blockId || `cb-${pos}`;
                    const domNode = editor.view.nodeDOM(pos);
                    blocks.push({
                        pos,
                        language: node.attrs.language || "plaintext",
                        text: node.textContent,
                        blockId,
                        element: domNode as HTMLElement | null,
                    });
                }
            });
            setCodeBlocks(blocks);
        };

        update();
        editor.on("update", update);
        return () => {
            editor.off("update", update);
        };
    }, [editor]);

    return (
        <>
            {codeBlocks.map((block) => {
                if (!block.element) return null;
                const rect = block.element.getBoundingClientRect();
                const parentRect =
                    block.element.closest(".tiptap")?.getBoundingClientRect();
                if (!parentRect) return null;

                const top = rect.top - parentRect.top + 8;
                const right = parentRect.right - rect.right + 8;

                return (
                    <div
                        key={block.blockId}
                        className="absolute flex items-center gap-1 z-10"
                        style={{ top, right }}
                    >
                        <select
                            value={block.language}
                            onChange={(e) => {
                                editor
                                    .chain()
                                    .focus()
                                    .setCodeBlock({ language: e.target.value })
                                    .run();
                            }}
                            className="text-xs bg-zinc-700 text-zinc-300 rounded px-1.5 py-0.5 border-none outline-none cursor-pointer"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => onCopy(block.text, block.blockId)}
                            className="flex items-center gap-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded px-1.5 py-0.5 transition-colors"
                        >
                            {copiedBlock === block.blockId ? (
                                <>
                                    <Check className="h-3 w-3 text-green-400" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3 w-3" />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                );
            })}
        </>
    );
}

// Convert Note blocks to TipTap JSON content
function noteToEditorContent(note: Note) {
    if (!note.blocks || note.blocks.length === 0) {
        return {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    attrs: { blockId: uuidv4() },
                    content: [],
                },
            ],
        };
    }

    const content = note.blocks.map((block) => {
        switch (block.type) {
            case "paragraph":
                return {
                    type: "paragraph",
                    attrs: { blockId: block.blockId },
                    content: block.text ? [{ type: "text", text: block.text }] : [],
                };
            case "heading":
                return {
                    type: "heading",
                    attrs: { level: block.level, blockId: block.blockId },
                    content: block.text ? [{ type: "text", text: block.text }] : [],
                };
            case "code":
                return {
                    type: "codeBlock",
                    attrs: {
                        language: block.language,
                        blockId: block.blockId,
                    },
                    content: block.text ? [{ type: "text", text: block.text }] : [],
                };
            case "divider":
                return {
                    type: "horizontalRule",
                    attrs: { blockId: block.blockId },
                };
            default:
                return {
                    type: "paragraph",
                    content: [],
                };
        }
    });

    return { type: "doc", content };
}

// Extract blocks from TipTap editor state
function editorContentToBlocks(editor: Editor): Block[] {
    const blocks: Block[] = [];

    editor.state.doc.forEach((node) => {
        const blockId = node.attrs?.blockId || uuidv4();

        switch (node.type.name) {
            case "paragraph":
                blocks.push({
                    blockId,
                    type: "paragraph",
                    text: node.textContent,
                });
                break;
            case "heading":
                blocks.push({
                    blockId,
                    type: "heading",
                    level: (node.attrs?.level || 1) as 1 | 2 | 3,
                    text: node.textContent,
                });
                break;
            case "codeBlock":
                blocks.push({
                    blockId,
                    type: "code",
                    language: node.attrs?.language || "plaintext",
                    text: node.textContent,
                });
                break;
            case "horizontalRule":
                blocks.push({
                    blockId,
                    type: "divider",
                });
                break;
        }
    });

    return blocks;
}

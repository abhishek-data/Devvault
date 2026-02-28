"use client";

import { useState, useRef, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { Plus, Type, Heading1, Heading2, Heading3, Code2, Minus } from "lucide-react";

interface AddBlockMenuProps {
    editor: Editor;
}

const blockOptions = [
    { label: "Paragraph", icon: Type, action: (editor: Editor) => editor.chain().focus().setParagraph().run() },
    { label: "Heading 1", icon: Heading1, action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: "Heading 2", icon: Heading2, action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Heading 3", icon: Heading3, action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Code Block", icon: Code2, action: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run() },
    { label: "Divider", icon: Minus, action: (editor: Editor) => editor.chain().focus().setHorizontalRule().run() },
];

export function AddBlockMenu({ editor }: AddBlockMenuProps) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 mt-3 px-2 py-1 rounded-md text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
                <Plus className="h-4 w-4" />
                <span>Add block</span>
            </button>

            {open && (
                <div className="absolute bottom-full left-0 mb-1 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl py-1 z-20">
                    {blockOptions.map((option) => (
                        <button
                            key={option.label}
                            onClick={() => {
                                option.action(editor);
                                setOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                        >
                            <option.icon className="h-4 w-4 text-zinc-400" />
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

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
    <div className="relative mt-4" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-ghost inline-flex items-center gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add block</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-48 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] py-1 z-20">
          {blockOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => {
                option.action(editor);
                setOpen(false);
              }}
              className="w-full h-[30px] flex items-center gap-2 px-3 text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]"
            >
              <option.icon className="h-3.5 w-3.5" />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

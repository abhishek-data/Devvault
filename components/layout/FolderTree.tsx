"use client";

import { useState } from "react";
import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { cn } from "@/lib/utils";
import { ChevronRight, Folder, FolderOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { Folder as FolderType } from "@/lib/types";

export function FolderTree() {
  const { folders, activeFolderId, setActiveFolderId, upsertFolder, removeFolder, loadNotes } = useDevVaultStore();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [creatingIn, setCreatingIn] = useState<string | null | undefined>(undefined); // undefined = not creating, null = root
  const [newFolderName, setNewFolderName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const rootFolders = folders.filter((f) => !f.parentId).sort((a, b) => a.name.localeCompare(b.name));

  const getChildren = (parentId: string) =>
    folders.filter((f) => f.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name));

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async (parentId: string | undefined) => {
    const name = newFolderName.trim();
    if (!name) {
      setCreatingIn(undefined);
      return;
    }
    const now = new Date().toISOString();
    const folder: FolderType = {
      id: uuidv4().slice(0, 8),
      name,
      parentId: parentId || undefined,
      createdAt: now,
      updatedAt: now,
    };
    await StorageService.saveFolder(folder);
    upsertFolder(folder);
    if (parentId) setExpandedIds((prev) => new Set(prev).add(parentId));
    setNewFolderName("");
    setCreatingIn(undefined);
  };

  const handleRename = async (folder: FolderType) => {
    const name = editName.trim();
    if (!name || name === folder.name) {
      setEditingId(null);
      return;
    }
    const updated = { ...folder, name, updatedAt: new Date().toISOString() };
    await StorageService.saveFolder(updated);
    upsertFolder(updated);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await StorageService.deleteFolder(id);
    removeFolder(id);
    await loadNotes(); // refresh notes that lost their folderId
    setMenuOpenId(null);
  };

  const noteCountForFolder = (folderId: string): number => {
    const { notes } = useDevVaultStore.getState();
    return notes.filter((n) => n.folderId === folderId).length;
  };

  const renderFolder = (folder: FolderType, depth: number) => {
    const children = getChildren(folder.id);
    const isExpanded = expandedIds.has(folder.id);
    const isActive = activeFolderId === folder.id;
    const count = noteCountForFolder(folder.id);

    return (
      <div key={folder.id}>
        <div
          className={cn(
            "group flex items-center gap-1 px-2 py-1.5 rounded-[var(--radius-md)] cursor-pointer text-[13px] transition-colors",
            isActive
              ? "bg-[var(--bg-overlay)] text-[var(--text-primary)] font-semibold"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => setActiveFolderId(folder.id)}
        >
          {children.length > 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpand(folder.id); }}
              className="p-0.5 -ml-1 hover:bg-[var(--bg-overlay)] rounded"
            >
              <ChevronRight className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")} />
            </button>
          ) : (
            <span className="w-4" />
          )}

          {isExpanded ? (
            <FolderOpen className="h-3.5 w-3.5 flex-shrink-0 text-[var(--accent-bright)]" />
          ) : (
            <Folder className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-tertiary)]" />
          )}

          {editingId === folder.id ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleRename(folder)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename(folder);
                if (e.key === "Escape") setEditingId(null);
              }}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--text-primary)] min-w-0"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 truncate">{folder.name}</span>
          )}

          {count > 0 && editingId !== folder.id && (
            <span className="text-[10px] text-[var(--text-tertiary)] font-medium tabular-nums">{count}</span>
          )}

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(menuOpenId === folder.id ? null : folder.id);
              }}
              className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-overlay)] transition-opacity"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>

            {menuOpenId === folder.id && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                <div className="absolute right-0 top-6 z-20 w-32 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] py-1 shadow-lg">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(folder.id);
                      setEditName(folder.name);
                      setMenuOpenId(null);
                    }}
                    className="w-full px-3 py-1.5 text-left text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] flex items-center gap-2"
                  >
                    <Pencil className="h-3 w-3" /> Rename
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCreatingIn(folder.id);
                      setMenuOpenId(null);
                    }}
                    className="w-full px-3 py-1.5 text-left text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] flex items-center gap-2"
                  >
                    <Folder className="h-3 w-3" /> Subfolder
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(folder.id);
                    }}
                    className="w-full px-3 py-1.5 text-left text-[12px] text-[var(--red)] hover:bg-[var(--bg-overlay)] flex items-center gap-2"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {isExpanded && children.map((child) => renderFolder(child, depth + 1))}

        {creatingIn === folder.id && (
          <div className="flex items-center gap-1 px-2 py-1" style={{ paddingLeft: `${24 + depth * 16}px` }}>
            <Folder className="h-3.5 w-3.5 text-[var(--text-tertiary)] flex-shrink-0" />
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => handleCreate(folder.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate(folder.id);
                if (e.key === "Escape") { setCreatingIn(undefined); setNewFolderName(""); }
              }}
              placeholder="Folder name..."
              className="flex-1 bg-transparent border-none outline-none text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] min-w-0"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-0.5">
      {rootFolders.map((f) => renderFolder(f, 0))}

      {creatingIn === null && (
        <div className="flex items-center gap-1 px-2 py-1" style={{ paddingLeft: "8px" }}>
          <Folder className="h-3.5 w-3.5 text-[var(--text-tertiary)] flex-shrink-0" />
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={() => handleCreate(undefined)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate(undefined);
              if (e.key === "Escape") { setCreatingIn(undefined); setNewFolderName(""); }
            }}
            placeholder="Folder name..."
            className="flex-1 bg-transparent border-none outline-none text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] min-w-0"
          />
        </div>
      )}

      <button
        onClick={() => { setCreatingIn(null); setNewFolderName(""); }}
        className="w-full px-2 py-1.5 text-left text-[11px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors flex items-center gap-1.5"
        style={{ paddingLeft: "8px" }}
      >
        <span className="text-[13px] leading-none">+</span> New folder
      </button>
    </div>
  );
}

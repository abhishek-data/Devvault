"use client";

import { useState, useRef } from "react";
import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, FileText, Link2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note, Block } from "@/lib/types";

type ImportTab = "markdown" | "urls";

export default function ImportPage() {
  const [tab, setTab] = useState<ImportTab>("markdown");
  const { upsertNote, loadNotes, isGitHubConnected, activeFolderId } = useDevVaultStore();
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--bg-base)]">
      <div className="max-w-[700px] mx-auto px-4 sm:px-6 pt-8 pb-16">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)] mb-1">Import</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mb-6">
          Bring your existing knowledge into DevVault.
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] p-1 w-fit">
          {([
            { id: "markdown" as ImportTab, label: "Markdown Files", icon: <FileText className="h-3.5 w-3.5" /> },
            { id: "urls" as ImportTab, label: "Bulk URLs", icon: <Link2 className="h-3.5 w-3.5" /> },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "h-8 px-3 rounded-[var(--radius-sm)] text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors",
                tab === t.id
                  ? "bg-[var(--bg-overlay)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "markdown" && (
          <MarkdownImport
            isGitHubConnected={isGitHubConnected}
            activeFolderId={activeFolderId}
            onImport={async (notes) => {
              for (const note of notes) {
                await StorageService.saveNote(note);
                upsertNote(note);
              }
              await loadNotes();
            }}
          />
        )}

        {tab === "urls" && (
          <BulkUrlImport
            isGitHubConnected={isGitHubConnected}
            activeFolderId={activeFolderId}
            onImport={async (notes) => {
              for (const note of notes) {
                await StorageService.saveNote(note);
                upsertNote(note);
              }
              await loadNotes();
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── Markdown Import ──────────────────────────────────────

function MarkdownImport({
  isGitHubConnected,
  activeFolderId,
  onImport,
}: {
  isGitHubConnected: boolean;
  activeFolderId: string | null;
  onImport: (notes: Note[]) => Promise<void>;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const mdFiles = Array.from(fileList).filter(
      (f) => f.name.endsWith(".md") || f.name.endsWith(".txt")
    );
    setFiles(mdFiles);
    setImportedCount(0);
  };

  const handleImport = async () => {
    if (files.length === 0) return;
    setImporting(true);

    const notes: Note[] = [];
    for (const file of files) {
      try {
        const text = await file.text();
        const title = file.name.replace(/\.(md|txt)$/, "");
        const now = new Date().toISOString();

        // Parse markdown into blocks (simple: split by double newlines)
        const blocks: Block[] = [];
        const sections = text.split(/\n\n+/);

        for (const section of sections) {
          const trimmed = section.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("# ")) {
            blocks.push({ blockId: uuidv4(), type: "heading", level: 1, text: trimmed.slice(2) });
          } else if (trimmed.startsWith("## ")) {
            blocks.push({ blockId: uuidv4(), type: "heading", level: 2, text: trimmed.slice(3) });
          } else if (trimmed.startsWith("### ")) {
            blocks.push({ blockId: uuidv4(), type: "heading", level: 3, text: trimmed.slice(4) });
          } else if (trimmed.startsWith("```")) {
            const langMatch = trimmed.match(/^```(\w*)\n/);
            const language = langMatch?.[1] || "plaintext";
            const code = trimmed.replace(/^```\w*\n/, "").replace(/\n?```$/, "");
            blocks.push({ blockId: uuidv4(), type: "code", language, text: code });
          } else if (trimmed === "---") {
            blocks.push({ blockId: uuidv4(), type: "divider" });
          } else {
            blocks.push({ blockId: uuidv4(), type: "paragraph", text: trimmed });
          }
        }

        if (blocks.length === 0) {
          blocks.push({ blockId: uuidv4(), type: "paragraph", text: text });
        }

        notes.push({
          id: uuidv4().slice(0, 8),
          title,
          tags: [],
          blocks,
          createdAt: now,
          updatedAt: now,
          syncStatus: isGitHubConnected ? "pending" : "local_only",
          version: 1,
          folderId: activeFolderId || undefined,
          noteType: "note",
          isPinned: false,
          isArchived: false,
        });
      } catch {
        // Skip files that fail to parse
      }
    }

    await onImport(notes);
    setImportedCount(notes.length);
    setImporting(false);
    toast.success(`Imported ${notes.length} note${notes.length !== 1 ? "s" : ""}`);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-[var(--accent-primary)]"); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove("border-[var(--accent-primary)]"); }}
        onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-[var(--accent-primary)]"); handleFiles(e.dataTransfer.files); }}
        className="border-2 border-dashed border-[var(--border-default)] rounded-[var(--radius-lg)] p-8 text-center cursor-pointer hover:border-[var(--border-strong)] transition-colors"
      >
        <Upload className="h-8 w-8 text-[var(--text-tertiary)] mx-auto mb-3" />
        <p className="text-[14px] font-medium text-[var(--text-primary)] mb-1">
          Drop .md or .txt files here
        </p>
        <p className="text-[12px] text-[var(--text-tertiary)]">
          or click to browse
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".md,.txt"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-[12px] text-[var(--text-secondary)]">{files.length} file{files.length !== 1 ? "s" : ""} selected</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                <FileText className="h-3 w-3 text-[var(--text-tertiary)]" />
                <span className="truncate">{f.name}</span>
                <span className="text-[var(--text-tertiary)] ml-auto">{(f.size / 1024).toFixed(1)}KB</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full h-10 bg-[var(--accent-muted)] hover:bg-[var(--accent-bright)] text-white rounded-[var(--radius-md)] text-[13px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {importing ? "Importing..." : `Import ${files.length} file${files.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {importedCount > 0 && (
        <div className="flex items-center gap-2 text-[13px] text-[var(--green)]">
          <CheckCircle2 className="h-4 w-4" />
          {importedCount} note{importedCount !== 1 ? "s" : ""} imported successfully
        </div>
      )}
    </div>
  );
}

// ── Bulk URL Import ──────────────────────────────────────

function BulkUrlImport({
  isGitHubConnected,
  activeFolderId,
  onImport,
}: {
  isGitHubConnected: boolean;
  activeFolderId: string | null;
  onImport: (notes: Note[]) => Promise<void>;
}) {
  const [urlText, setUrlText] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0 });

  const handleImport = async () => {
    const urls = urlText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("http://") || l.startsWith("https://"));

    if (urls.length === 0) {
      toast.error("No valid URLs found");
      return;
    }

    setImporting(true);
    setProgress({ done: 0, total: urls.length, failed: 0 });

    const notes: Note[] = [];
    let failed = 0;

    for (let i = 0; i < urls.length; i++) {
      try {
        const res = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urls[i] }),
        });

        const meta = res.ok ? await res.json() : { url: urls[i], title: urls[i], description: "", image: "", domain: new URL(urls[i]).hostname, favicon: "", contentType: "generic" };
        const now = new Date().toISOString();

        notes.push({
          id: uuidv4().slice(0, 8),
          title: meta.title || meta.domain,
          tags: meta.contentType !== "generic" ? [meta.contentType] : [],
          blocks: [
            {
              blockId: uuidv4(),
              type: "link",
              url: meta.url,
              title: meta.title,
              description: meta.description,
              image: meta.image,
              domain: meta.domain,
              favicon: meta.favicon,
              contentType: meta.contentType,
            },
            { blockId: uuidv4(), type: "paragraph", text: "" },
          ],
          createdAt: now,
          updatedAt: now,
          syncStatus: isGitHubConnected ? "pending" : "local_only",
          version: 1,
          folderId: activeFolderId || undefined,
          noteType: "bookmark",
          isPinned: false,
          isArchived: false,
          readingStatus: "unread",
        });
      } catch {
        failed++;
      }

      setProgress({ done: i + 1, total: urls.length, failed });
    }

    await onImport(notes);
    setImporting(false);
    toast.success(`Imported ${notes.length} bookmark${notes.length !== 1 ? "s" : ""}${failed > 0 ? ` (${failed} failed)` : ""}`);
  };

  const urlCount = urlText.split("\n").filter((l) => l.trim().startsWith("http")).length;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 block">
          Paste URLs (one per line)
        </label>
        <textarea
          value={urlText}
          onChange={(e) => setUrlText(e.target.value)}
          placeholder={"https://example.com/article-1\nhttps://youtube.com/watch?v=abc123\nhttps://github.com/owner/repo"}
          rows={8}
          className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)] transition-colors resize-y font-mono"
        />
        {urlCount > 0 && (
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">
            {urlCount} URL{urlCount !== 1 ? "s" : ""} detected
          </p>
        )}
      </div>

      <button
        onClick={handleImport}
        disabled={importing || urlCount === 0}
        className="w-full h-10 bg-[var(--accent-muted)] hover:bg-[var(--accent-bright)] text-white rounded-[var(--radius-md)] text-[13px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
        {importing
          ? `Importing... ${progress.done}/${progress.total}`
          : `Import ${urlCount} URL${urlCount !== 1 ? "s" : ""}`}
      </button>

      {importing && progress.total > 0 && (
        <div className="w-full bg-[var(--bg-elevated)] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-[var(--accent-bright)] transition-all duration-300"
            style={{ width: `${(progress.done / progress.total) * 100}%` }}
          />
        </div>
      )}

      {!importing && progress.done > 0 && (
        <div className="flex items-center gap-2 text-[13px]">
          <CheckCircle2 className="h-4 w-4 text-[var(--green)]" />
          <span className="text-[var(--green)]">{progress.done - progress.failed} imported</span>
          {progress.failed > 0 && (
            <span className="text-[var(--red)] flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {progress.failed} failed
            </span>
          )}
        </div>
      )}
    </div>
  );
}

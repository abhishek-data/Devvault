"use client";

import { useState, useRef, useEffect } from "react";
import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { LinkCard } from "./LinkCard";
import { Link2, Loader2, X, Sparkles } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSummarize } from "@/lib/hooks/useSummarize";
import type { Note, LinkBlock, Block } from "@/lib/types";

interface QuickCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExtractedMeta {
  url: string;
  title: string;
  description: string;
  image: string;
  domain: string;
  favicon: string;
  contentType: "article" | "youtube" | "github" | "tweet" | "generic";
}

export function QuickCapture({ open, onOpenChange }: QuickCaptureProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ExtractedMeta | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { upsertNote, setActiveNote, activeFolderId, isGitHubConnected } = useDevVaultStore();
  const { summarizeUrl, loading: aiLoading, error: aiError, isConfigured: aiConfigured } = useSummarize();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setUrl("");
      setPreview(null);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "l") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange]);

  const extractMeta = async (inputUrl: string) => {
    let normalized = inputUrl.trim();
    if (!normalized) return;
    if (!normalized.startsWith("http")) normalized = "https://" + normalized;

    setLoading(true);
    setError("");
    setPreview(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to extract");
      }

      const meta: ExtractedMeta = await res.json();
      setPreview(meta);
      setUrl(normalized);
    } catch (err: any) {
      setError(err.message || "Could not fetch URL metadata");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    extractMeta(url);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (pasted.startsWith("http://") || pasted.startsWith("https://")) {
      e.preventDefault();
      setUrl(pasted);
      extractMeta(pasted);
    }
  };

  const buildNote = (extraBlocks: Block[], extraTags: string[]) => {
    if (!preview) return null;

    const id = uuidv4().slice(0, 8);
    const now = new Date().toISOString();

    const linkBlock: LinkBlock = {
      blockId: uuidv4(),
      type: "link",
      url: preview.url,
      title: preview.title,
      description: preview.description,
      image: preview.image,
      domain: preview.domain,
      favicon: preview.favicon,
      contentType: preview.contentType,
    };

    const baseTags = preview.contentType !== "generic" ? [preview.contentType] : [];
    const allTags = [...new Set([...baseTags, ...extraTags])];

    const newNote: Note = {
      id,
      title: preview.title || preview.domain,
      tags: allTags,
      blocks: [linkBlock, ...extraBlocks, { blockId: uuidv4(), type: "paragraph", text: "" }],
      createdAt: now,
      updatedAt: now,
      syncStatus: isGitHubConnected ? "pending" : "local_only",
      version: 1,
      folderId: activeFolderId || undefined,
      noteType: "bookmark",
      isPinned: false,
      isArchived: false,
    };

    return newNote;
  };

  const handleSave = async () => {
    const newNote = buildNote([], []);
    if (!newNote) return;

    await StorageService.saveNote(newNote);
    upsertNote(newNote);
    setActiveNote(newNote.id);
    onOpenChange(false);
    router.push(`/app/notes/${newNote.id}`);
    toast.success("Bookmark saved");
  };

  const handleSummarizeAndSave = async () => {
    if (!preview) return;

    const result = await summarizeUrl(preview.url);
    if (!result) return;

    // Build blocks from AI summary
    const summaryBlocks: Block[] = [
      { blockId: uuidv4(), type: "heading", level: 2, text: "Summary" },
      { blockId: uuidv4(), type: "paragraph", text: result.summary },
    ];

    if (result.keyPoints.length > 0) {
      summaryBlocks.push(
        { blockId: uuidv4(), type: "heading", level: 3, text: "Key Points" },
        { blockId: uuidv4(), type: "paragraph", text: result.keyPoints.map((p) => `• ${p}`).join("\n") }
      );
    }

    const newNote = buildNote(summaryBlocks, result.suggestedTags);
    if (!newNote) return;

    await StorageService.saveNote(newNote);
    upsertNote(newNote);
    setActiveNote(newNote.id);
    onOpenChange(false);
    router.push(`/app/notes/${newNote.id}`);
    toast.success("Bookmark saved with AI summary");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      <div
        className="fixed top-[12%] sm:top-[18%] left-1/2 -translate-x-1/2 w-[520px] max-w-[calc(100vw-24px)] bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[var(--radius-xl)] overflow-hidden shadow-2xl"
        style={{ animation: "slideDown 180ms cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--text-primary)]">
            <Link2 className="h-4 w-4 text-[var(--accent-bright)]" />
            Quick Capture
          </div>
          <div className="flex items-center gap-2">
            <kbd className="h-5 px-1.5 bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded text-[10px] font-bold text-[var(--text-tertiary)] flex items-center">
              ⌘⇧L
            </kbd>
            <button onClick={() => onOpenChange(false)} className="icon-button !w-6 !h-6">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="px-4 py-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPaste={handlePaste}
              placeholder="Paste a URL to save..."
              className="flex-1 h-9 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="h-9 px-4 bg-[var(--accent-muted)] hover:bg-[var(--accent-bright)] text-white rounded-[var(--radius-md)] text-[12px] font-semibold transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
              Fetch
            </button>
          </div>
        </form>

        {/* Error */}
        {(error || aiError) && (
          <div className="px-4 pb-3">
            <p className="text-[12px] text-[var(--red)]">{error || aiError}</p>
          </div>
        )}

        {/* Preview + Actions */}
        {preview && (
          <div className="px-4 pb-4 space-y-3">
            <LinkCard
              block={{ blockId: "preview", type: "link", ...preview }}
            />

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={aiLoading}
                className="flex-1 h-9 bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[var(--border-strong)] text-[var(--text-primary)] rounded-[var(--radius-md)] text-[12px] font-semibold transition-colors"
              >
                Save Bookmark
              </button>
              <button
                onClick={handleSummarizeAndSave}
                disabled={aiLoading || !aiConfigured}
                className="flex-1 h-9 bg-[var(--accent-muted)] hover:bg-[var(--accent-bright)] text-white rounded-[var(--radius-md)] text-[12px] font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                title={!aiConfigured ? "Add an API key in Settings to enable AI" : "Summarize with AI and save"}
              >
                {aiLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {aiLoading ? "Summarizing..." : "Summarize & Save"}
              </button>
            </div>

            {!aiConfigured && (
              <p className="text-[10px] text-[var(--text-tertiary)] text-center">
                Add a Gemini or OpenAI API key in Settings to enable AI summarization.
              </p>
            )}
          </div>
        )}

        {/* Hint */}
        {!preview && !error && !loading && (
          <div className="px-4 pb-4 text-center">
            <p className="text-[11px] text-[var(--text-tertiary)]">
              Paste any URL — YouTube videos, GitHub repos, blog posts, tweets.
              <br />
              Save as a bookmark, or summarize with AI before saving.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

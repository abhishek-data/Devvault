"use client";

import { useEffect, useState } from "react";
import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LinkCard } from "@/components/capture/LinkCard";
import {
  BookOpen,
  Circle,
  BookMarked,
  CheckCircle2,
  ExternalLink,
  FileText,
  Code2,
  Bookmark,
  Youtube,
  Github,
  Globe,
} from "lucide-react";
import type { Note, ReadingStatus, LinkBlock } from "@/lib/types";

const STATUS_FILTERS: { status: ReadingStatus | "all"; label: string; icon: React.ReactNode }[] = [
  { status: "all", label: "All", icon: <BookOpen className="h-3.5 w-3.5" /> },
  { status: "unread", label: "Unread", icon: <Circle className="h-3.5 w-3.5" /> },
  { status: "reading", label: "Reading", icon: <BookMarked className="h-3.5 w-3.5" /> },
  { status: "done", label: "Done", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
];

const contentTypeIcons: Record<string, React.ReactNode> = {
  youtube: <Youtube className="h-3 w-3 text-[#FF0000]" />,
  github: <Github className="h-3 w-3" />,
  article: <FileText className="h-3 w-3 text-[var(--accent-bright)]" />,
  generic: <Globe className="h-3 w-3" />,
};

const statusColors: Record<string, string> = {
  unread: "bg-[var(--text-tertiary)]",
  reading: "bg-[var(--sync-pending)]",
  done: "bg-[var(--green)]",
};

export default function ReferencesPage() {
  const { setReadingStatus } = useDevVaultStore();
  const router = useRouter();
  const [references, setReferences] = useState<Note[]>([]);
  const [filter, setFilter] = useState<ReadingStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StorageService.getBookmarksAndReferences().then((notes) => {
      setReferences(notes);
      setLoading(false);
    });
  }, []);

  const filtered = filter === "all"
    ? references
    : references.filter((n) => (n.readingStatus || "unread") === filter);

  const unreadCount = references.filter((n) => !n.readingStatus || n.readingStatus === "unread").length;
  const readingCount = references.filter((n) => n.readingStatus === "reading").length;

  const handleStatusChange = async (noteId: string, status: ReadingStatus) => {
    await setReadingStatus(noteId, status);
    setReferences((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, readingStatus: status } : n))
    );
  };

  const getLinkBlock = (note: Note): LinkBlock | undefined =>
    note.blocks.find((b): b is LinkBlock => b.type === "link");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-6 w-6 border-2 border-[var(--accent-bright)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--bg-base)]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-10 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-[var(--text-primary)] mb-1">References</h1>
            <p className="text-[13px] text-[var(--text-secondary)]">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}{readingCount > 0 ? ` · ${readingCount} in progress` : ""} · {references.length} total
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 mb-6">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.status}
              onClick={() => setFilter(f.status)}
              className={cn(
                "h-8 px-3 rounded-[var(--radius-md)] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors",
                filter === f.status
                  ? "bg-[var(--bg-overlay)] text-[var(--text-primary)] border border-[var(--border-strong)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-transparent"
              )}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-10 w-10 text-[var(--text-tertiary)] mx-auto mb-3 opacity-30" />
            <p className="text-[14px] text-[var(--text-secondary)]">
              {filter === "all" ? "No bookmarks or references yet" : `No ${filter} items`}
            </p>
            <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
              Use Quick Capture (⌘⇧L) to save URLs
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((note) => {
              const link = getLinkBlock(note);
              const status = note.readingStatus || "unread";

              return (
                <div
                  key={note.id}
                  className="group bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden hover:border-[var(--border-strong)] transition-colors cursor-pointer"
                  onClick={() => router.push(`/app/notes/${note.id}`)}
                >
                  {/* Thumbnail */}
                  {link?.image && (
                    <div className="h-32 bg-[var(--bg-overlay)] overflow-hidden">
                      <img
                        src={link.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}

                  <div className="p-3">
                    {/* Type + Status row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {link && contentTypeIcons[link.contentType || "generic"]}
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                          {link?.contentType || note.noteType || "link"}
                        </span>
                      </div>

                      {/* Reading status toggle */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {(["unread", "reading", "done"] as ReadingStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(note.id, s)}
                            className={cn(
                              "h-5 px-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition-colors",
                              status === s
                                ? s === "done"
                                  ? "bg-[var(--green)]/15 text-[var(--green)]"
                                  : s === "reading"
                                    ? "bg-[var(--sync-pending)]/15 text-[var(--sync-pending)]"
                                    : "bg-[var(--bg-overlay)] text-[var(--text-secondary)]"
                                : "text-[var(--text-tertiary)] opacity-0 group-hover:opacity-60 hover:!opacity-100"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-[13px] font-semibold text-[var(--text-primary)] line-clamp-2 mb-1">
                      {note.title || "Untitled"}
                    </h3>

                    {/* Description */}
                    {link?.description && (
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mb-2">
                        {link.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {link?.favicon && (
                          <img src={link.favicon} alt="" className="w-3 h-3 rounded-sm" loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        )}
                        <span className="text-[10px] text-[var(--text-tertiary)] truncate max-w-[120px]">
                          {link?.domain || ""}
                        </span>
                      </div>

                      {note.tags[0] && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--bg-overlay)] text-[var(--text-tertiary)] border border-[var(--border-default)]">
                          {note.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

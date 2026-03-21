"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDevVaultStore } from "@/lib/store";
import { StorageService } from "@/lib/db/storage";
import { v4 as uuidv4 } from "uuid";
import { Loader2, Check, Link2, FileText } from "lucide-react";
import { toast } from "sonner";
import type { Note, LinkBlock, Block } from "@/lib/types";

function isUrl(text: string): boolean {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

export default function SharePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { upsertNote, setActiveNote, activeFolderId, isGitHubConnected } = useDevVaultStore();
  const [status, setStatus] = useState<"processing" | "done" | "error">("processing");

  const sharedTitle = searchParams.get("title") || "";
  const sharedText = searchParams.get("text") || "";
  const sharedUrl = searchParams.get("url") || "";

  useEffect(() => {
    handleSharedContent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSharedContent = async () => {
    // Determine what was shared
    const url = sharedUrl || (isUrl(sharedText) ? sharedText : "");
    const text = url === sharedText ? "" : sharedText;
    const title = sharedTitle || (url ? new URL(url).hostname : "Shared Note");

    const id = uuidv4().slice(0, 8);
    const now = new Date().toISOString();
    const blocks: Block[] = [];

    // If a URL was shared, create a link block
    if (url) {
      try {
        const res = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (res.ok) {
          const meta = await res.json();
          const linkBlock: LinkBlock = {
            blockId: uuidv4(),
            type: "link",
            url: meta.url,
            title: meta.title,
            description: meta.description,
            image: meta.image,
            domain: meta.domain,
            favicon: meta.favicon,
            contentType: meta.contentType,
          };
          blocks.push(linkBlock);
        }
      } catch {
        // Fallback: just save the URL as text
        blocks.push({ blockId: uuidv4(), type: "paragraph", text: url });
      }
    }

    // Add any shared text as a paragraph
    if (text) {
      blocks.push({ blockId: uuidv4(), type: "paragraph", text });
    }

    // Always end with an empty paragraph for editing
    blocks.push({ blockId: uuidv4(), type: "paragraph", text: "" });

    const newNote: Note = {
      id,
      title: sharedTitle || (url ? title : "Shared Note"),
      tags: [],
      blocks,
      createdAt: now,
      updatedAt: now,
      syncStatus: isGitHubConnected ? "pending" : "local_only",
      version: 1,
      folderId: activeFolderId || undefined,
      noteType: url ? "bookmark" : "note",
      isPinned: false,
      isArchived: false,
    };

    try {
      await StorageService.saveNote(newNote);
      upsertNote(newNote);
      setActiveNote(id);
      setStatus("done");
      toast.success("Saved to DevVault");

      // Auto-navigate to the note after a brief moment
      setTimeout(() => {
        router.replace(`/app/notes/${id}`);
      }, 800);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
      {status === "processing" && (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-bright)]" />
          <p className="text-[14px] text-[var(--text-secondary)]">Saving shared content...</p>
        </>
      )}
      {status === "done" && (
        <>
          <div className="h-12 w-12 rounded-full bg-[var(--green)]/10 flex items-center justify-center">
            <Check className="h-6 w-6 text-[var(--green)]" />
          </div>
          <p className="text-[14px] font-semibold text-[var(--text-primary)]">Saved to DevVault</p>
          <p className="text-[12px] text-[var(--text-secondary)]">Redirecting to your note...</p>
        </>
      )}
      {status === "error" && (
        <>
          <p className="text-[14px] text-[var(--red)]">Something went wrong</p>
          <button
            onClick={() => router.replace("/app")}
            className="h-9 px-4 bg-[var(--accent-muted)] text-white rounded-[var(--radius-md)] text-[13px] font-semibold"
          >
            Go to App
          </button>
        </>
      )}
    </div>
  );
}

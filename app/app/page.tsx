"use client";

import { useDevVaultStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { StorageService } from "@/lib/db/storage";
import { Vault, Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { Note } from "@/lib/types";

export default function AppHomePage() {
  const { notes, upsertNote, setActiveNote, rebuildSearchIndex } = useDevVaultStore();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [onboardingState, setOnboardingState] = useState<"idle" | "loading" | "done">("idle");

  const handleNewNote = async () => {
    const id = uuidv4().slice(0, 8);
    const now = new Date().toISOString();
    const newNote: Note = {
      id,
      title: "Untitled Note",
      tags: [],
      blocks: [
        {
          blockId: uuidv4(),
          type: "paragraph",
          text: "",
        },
      ],
      createdAt: now,
      updatedAt: now,
      syncStatus: "local_only",
      version: 1,
    };

    await StorageService.saveNote(newNote);
    upsertNote(newNote);
    setActiveNote(id);
    router.push(`/app/notes/${id}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleNewNote();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const runOnboarding = async () => {
      const currentSession = session as any;
      if (!currentSession?.user?.isNewUser || !currentSession?.user?.username) {
        return;
      }

      const marker = `devvault-onboarded-${currentSession.user.username}`;
      if (sessionStorage.getItem(marker) === "done") {
        return;
      }

      setOnboardingState("loading");
      try {
        await fetch("/api/onboarding", { method: "POST" });

        const pullRes = await fetch("/api/github/pull");
        if (pullRes.ok) {
          const remoteNotes: Note[] = await pullRes.json();
          for (const remote of remoteNotes) {
            await StorageService.saveNote({ ...remote, syncStatus: "synced" });
            upsertNote({ ...remote, syncStatus: "synced" });
          }
          rebuildSearchIndex();
        }

        const allNotes = await StorageService.getAllNotes();
        const welcome = allNotes.find((n) => n.id === "welcome-to-devvault");
        if (welcome) {
          setActiveNote(welcome.id);
          router.push(`/app/notes/${welcome.id}`);
        }

        sessionStorage.setItem(marker, "done");
      } finally {
        setOnboardingState("done");
      }
    };

    if (status === "authenticated") {
      runOnboarding();
    }
  }, [status, session, setActiveNote, rebuildSearchIndex, upsertNote, router]);

  if (onboardingState === "loading") {
    return (
      <div className="fixed inset-0 z-[120] bg-[var(--bg-base)] flex flex-col items-center justify-center gap-4">
        <Vault className="h-10 w-10 text-[var(--accent-primary)] animate-pulse" />
        <p className="text-[14px] text-[var(--text-secondary)]">Setting up your vault...</p>
        <p className="text-[12px] text-[var(--text-tertiary)]">Creating your private GitHub repo</p>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--accent-primary)] animate-[pulse_1s_ease_infinite]" />
          <span className="h-2 w-2 rounded-full bg-[var(--accent-primary)] animate-[pulse_1s_120ms_ease_infinite]" />
          <span className="h-2 w-2 rounded-full bg-[var(--accent-primary)] animate-[pulse_1s_240ms_ease_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-44px)] flex items-center justify-center px-8">
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <Vault className="h-9 w-9 text-[var(--text-tertiary)] opacity-30" />
        <h1 className="text-[15px] font-medium text-[var(--text-secondary)]">{notes.length === 0 ? "Create your first note" : "Select a note"}</h1>
        <p className="text-[13px] text-[var(--text-tertiary)]">or press ⌘K to search</p>

        <div className="flex gap-2 mt-2">
          <kbd className="!font-medium !text-[11px] !px-2 !py-[3px]">⌘K</kbd>
          <kbd className="!font-medium !text-[11px] !px-2 !py-[3px]">⌘N</kbd>
          <kbd className="!font-medium !text-[11px] !px-2 !py-[3px]">⌘S</kbd>
        </div>

        <button onClick={handleNewNote} className="btn-ghost mt-3 inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New Note
        </button>
      </div>
    </div>
  );
}

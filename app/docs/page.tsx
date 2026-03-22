"use client";

import { ArrowLeft, Book, Folder, FileText, Code2, Bookmark, BookOpen, Link2, Sparkles, Upload, Lock, Terminal, Pin, Archive, Share2, Globe, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const sections = [
  { id: "getting-started", title: "Getting Started" },
  { id: "notes-editor", title: "Notes & Editor" },
  { id: "organization", title: "Organization" },
  { id: "quick-capture", title: "Quick Capture" },
  { id: "references", title: "References" },
  { id: "ai-features", title: "AI Features" },
  { id: "search", title: "Search" },
  { id: "import", title: "Import" },
  { id: "github-sync", title: "GitHub Sync" },
  { id: "mobile", title: "Mobile & PWA" },
  { id: "shortcuts", title: "Keyboard Shortcuts" },
];

function SectionHeading({ id, title, desc }: { id: string; title: string; desc: string }) {
  return (
    <div className="space-y-2">
      <h2 id={id} className="text-[24px] font-bold tracking-tight scroll-mt-28">{title}</h2>
      <p className="text-[14px] text-[#8F91A2] leading-[1.7]">{desc}</p>
    </div>
  );
}

function Card({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-5 bg-[#0A0A0E] border border-[#1C1C24] rounded-xl">
      <div className="h-8 w-8 rounded-lg bg-[#12121C] border border-[#1C1C24] flex items-center justify-center text-[#8B5CF6] mb-3">
        {icon}
      </div>
      <h4 className="text-[14px] font-bold mb-1">{title}</h4>
      <p className="text-[13px] text-[#8F91A2] leading-[1.6]">{desc}</p>
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3 text-[14px] text-[#A1A1B5]">
      <div className="h-6 w-6 rounded-full bg-[#12121C] border border-[#1C1C24] text-[10px] font-bold flex items-center justify-center text-[#8B5CF6] mt-0.5 flex-shrink-0">
        {n}
      </div>
      <p className="leading-[1.5]">{text}</p>
    </div>
  );
}

function ShortcutRow({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#0A0A0E] border border-[#1C1C24] rounded-lg">
      <span className="text-[13px] font-medium text-[#E2E2E9]">{label}</span>
      <kbd className="h-6 px-2 bg-[#12121C] border border-[#1C1C24] rounded-md text-[11px] font-bold text-[#8F91A2] flex items-center">
        {keys}
      </kbd>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 bg-[#0C0C14] border border-[#1E1B4B]/30 border-l-2 border-l-[#8B5CF6] rounded-lg text-[13px] text-[#A1A1B5] leading-[1.6]">
      {children}
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] overflow-x-hidden scroll-smooth selection:bg-[#6D28D9]/30">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 h-14 bg-[#000000]/80 backdrop-blur-[16px] border-b border-[#1C1C24] z-[100] flex items-center">
        <div className="w-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-4 w-4 text-[#8F91A2]" />
            <span className="text-[13px] font-medium text-[#8F91A2]">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Book className="h-4 w-4 text-[#8B5CF6]" />
            <span className="text-[14px] font-bold">Docs</span>
          </div>
          <Link href="/app" className="h-8 px-3 bg-[#FFFFFF] rounded-full text-[11px] font-bold text-[#000000] inline-flex items-center hover:bg-[#E2E2E2] transition-colors">
            Open App
          </Link>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-6 pt-28 pb-20 flex gap-10">
        {/* Sidebar Nav */}
        <aside className="w-44 hidden lg:block sticky top-28 h-fit space-y-1">
          <div className="text-[10px] font-bold text-[#6F7182] uppercase tracking-wider mb-3 px-3">Documentation</div>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="block px-3 py-1.5 rounded-md text-[12px] font-medium text-[#8F91A2] hover:bg-[#12121A] hover:text-[#FFFFFF] transition-all">
              {s.title}
            </a>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 max-w-[760px] space-y-16">

          {/* ── Getting Started ──────────────────────────── */}
          <section className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-[32px] font-black tracking-tight" id="getting-started">Getting Started</h1>
              <p className="text-[15px] leading-[1.7] text-[#8F91A2]">
                DevVault is a local-first developer knowledge OS. Store notes, code snippets, and bookmarks — then sync everything to your private GitHub repo.
              </p>
            </div>

            <div className="bg-[#0A0A0E] border border-[#1C1C24] rounded-xl p-6 space-y-3">
              <h3 className="text-[15px] font-bold">Quick Setup</h3>
              <Step n={1} text="Click 'Get Started' and sign in with your GitHub account." />
              <Step n={2} text="Start creating notes — they're saved instantly in your browser's local storage." />
              <Step n={3} text="DevVault auto-creates a private 'devvault-notes' repo and syncs your notes as Markdown files." />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Card icon={<Terminal className="h-4 w-4" />} title="Markdown Native" desc="Notes sync to GitHub as clean Markdown with frontmatter metadata — readable by any tool." />
              <Card icon={<Lock className="h-4 w-4" />} title="Local-First" desc="All data lives in IndexedDB. No server database. Notes never leave your device unless you sync." />
            </div>
          </section>

          {/* ── Notes & Editor ──────────────────────────── */}
          <section className="space-y-6 border-t border-[#1C1C24] pt-12">
            <SectionHeading id="notes-editor" title="Notes & Editor" desc="DevVault uses a block-based editor powered by Tiptap. Each note is made of blocks." />

            <div className="space-y-2">
              <h4 className="text-[14px] font-bold">Block Types</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { title: "Paragraph", desc: "Rich text paragraphs — the default block type." },
                  { title: "Heading (H1, H2, H3)", desc: "Three levels of headings for structure." },
                  { title: "Code Block", desc: "Syntax-highlighted code with language selector and one-click copy." },
                  { title: "Divider", desc: "A horizontal rule to separate content sections." },
                  { title: "Link Card", desc: "Rich URL preview with thumbnail, title, description, and favicon." },
                ].map((b, i) => (
                  <div key={i} className="p-3 bg-[#0A0A0E] border border-[#1C1C24] rounded-lg">
                    <span className="text-[13px] font-semibold text-[#FFFFFF]">{b.title}</span>
                    <p className="text-[12px] text-[#8F91A2] mt-0.5">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[14px] font-bold">Note Types</h4>
              <p className="text-[13px] text-[#8F91A2]">Every note has a type that determines its icon and how it appears in filters.</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: <FileText className="h-3.5 w-3.5" />, label: "Note", desc: "General purpose" },
                  { icon: <Code2 className="h-3.5 w-3.5" />, label: "Snippet", desc: "Code-focused" },
                  { icon: <Bookmark className="h-3.5 w-3.5" />, label: "Bookmark", desc: "Saved URLs" },
                  { icon: <BookOpen className="h-3.5 w-3.5" />, label: "Reference", desc: "Learning material" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#0A0A0E] border border-[#1C1C24] rounded-lg">
                    <span className="text-[#8B5CF6]">{t.icon}</span>
                    <span className="text-[12px] font-semibold">{t.label}</span>
                    <span className="text-[11px] text-[#6F7182]">— {t.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <InfoBox>
              Notes auto-save 1.5 seconds after you stop typing. Press <strong>⌘S</strong> to force-save immediately.
            </InfoBox>
          </section>

          {/* ── Organization ──────────────────────────── */}
          <section className="space-y-6 border-t border-[#1C1C24] pt-12">
            <SectionHeading id="organization" title="Organization" desc="Keep your knowledge structured with folders, pins, and archive." />

            <div className="grid sm:grid-cols-3 gap-3">
              <Card icon={<Folder className="h-4 w-4" />} title="Folders" desc="Create nested folders. Drag notes between them. New notes auto-assign to the active folder." />
              <Card icon={<Pin className="h-4 w-4" />} title="Pinned Notes" desc="Pin important notes to the top of any view. Toggle from the note page or sidebar." />
              <Card icon={<Archive className="h-4 w-4" />} title="Archive" desc="Archive notes you don't need right now. They're hidden from views but never deleted." />
            </div>

            <InfoBox>
              Folders and pins are stored in note metadata and sync to GitHub in the Markdown frontmatter.
            </InfoBox>
          </section>

          {/* ── Quick Capture ──────────────────────────── */}
          <section className="space-y-6 border-t border-[#1C1C24] pt-12">
            <SectionHeading id="quick-capture" title="Quick Capture" desc="Save any URL as a bookmark note in seconds. Press ⌘⇧L to open." />

            <div className="bg-[#0A0A0E] border border-[#1C1C24] rounded-xl p-6 space-y-3">
              <h4 className="text-[14px] font-bold">How it works</h4>
              <Step n={1} text="Press ⌘⇧L (or click the link icon in the header) to open Quick Capture." />
              <Step n={2} text="Paste any URL — metadata (title, description, thumbnail, favicon) is extracted automatically." />
              <Step n={3} text="Click 'Save Bookmark' for a quick save, or 'Summarize & Save' to generate an AI summary." />
            </div>

            <div className="space-y-2">
              <h4 className="text-[14px] font-bold">Supported Content Types</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: <Globe className="h-3.5 w-3.5 text-[#FF0000]" />, label: "YouTube", desc: "HD thumbnail + channel name via oEmbed" },
                  { icon: <Globe className="h-3.5 w-3.5" />, label: "GitHub", desc: "Repo/issue metadata via OG tags" },
                  { icon: <Globe className="h-3.5 w-3.5" />, label: "Articles", desc: "Title, description, OG image" },
                  { icon: <Globe className="h-3.5 w-3.5" />, label: "Any URL", desc: "Fallback to page title + favicon" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#0A0A0E] border border-[#1C1C24] rounded-lg">
                    {t.icon}
                    <span className="text-[12px] font-semibold">{t.label}</span>
                    <span className="text-[11px] text-[#6F7182]">— {t.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── References ──────────────────────────── */}
          <section className="space-y-6 border-t border-[#1C1C24] pt-12">
            <SectionHeading id="references" title="References" desc="A dedicated grid view for all your saved bookmarks and references — with reading status tracking." />

            <div className="grid sm:grid-cols-2 gap-3">
              <Card icon={<BookOpen className="h-4 w-4" />} title="Grid View" desc="Visual cards with thumbnails, content type icons, domain, and tags. Click any card to open the note." />
              <Card icon={<CheckCircle2 className="h-4 w-4" />} title="Reading Status" desc="Track what you've read: Unread → Reading → Done. Filter by status to find what you haven't consumed yet." />
            </div>

            <InfoBox>
              Access the References page from the sidebar. Bookmark and reference type notes appear here automatically.
            </InfoBox>
          </section>

          {/* ── AI Features ──────────────────────────── */}
          <section className="space-y-6 border-t border-[#1C1C24] pt-12">
            <SectionHeading id="ai-features" title="AI Features" desc="Optional AI summarization powered by your own API key. DevVault never stores or proxies your key through our servers." />

            <div className="bg-[#0A0A0E] border border-[#1C1C24] rounded-xl p-6 space-y-3">
              <h4 className="text-[14px] font-bold">Setup (BYOK — Bring Your Own Key)</h4>
              <Step n={1} text="Open Settings → AI Features section." />
              <Step n={2} text="Choose a provider: Google Gemini (free tier available) or OpenAI." />
              <Step n={3} text="Paste your API key and click Save. It's stored locally in your browser only." />
            </div>

            <div className="space-y-2">
              <h4 className="text-[14px] font-bold">What AI Can Do</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <Card icon={<Sparkles className="h-4 w-4" />} title="URL Summarization" desc="Save a URL, click 'Summarize & Save' — AI generates a TL;DR, key points, and suggested tags." />
                <Card icon={<Globe className="h-4 w-4" />} title="YouTube Summaries" desc="Paste a YouTube link — DevVault extracts the transcript and generates a summary with key points." />
              </div>
            </div>

            <InfoBox>
              <strong>Gemini 2.5 Flash</strong> offers a free tier: 250 requests/day with no credit card required. Get your key at <span className="text-[#8B5CF6]">aistudio.google.com</span>.
            </InfoBox>
          </section>

          {/* ── Search ──────────────────────────── */}
          <section className="space-y-6 border-t border-[#1C1C24] pt-12">
            <SectionHeading id="search" title="Search" desc="Fuzzy search across all notes, bookmarks, code blocks, tags, and URL domains." />

            <div className="space-y-2">
              <h4 className="text-[14px] font-bold">Features</h4>
              <ul className="space-y-2 text-[13px] text-[#A1A1B5]">
                {[
                  "Press ⌘K to open the search modal from anywhere in the app.",
                  "Filter results by note type (Notes, Snippets, Bookmarks, References) using chips.",
                  "Filter by folder to scope search to a specific area.",
                  "Recent searches are saved and shown when you reopen search.",
                  "Results show type icons, block type badges, domain names, and highlighted match snippets.",
                  "Results are deduplicated per note — you see the best match for each.",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#8B5CF6] mt-1">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Import ──────────────────────────── */}
          <section className="space-y-6 border-t border-[#1C1C24] pt-12">
            <SectionHeading id="import" title="Import" desc="Bring your existing knowledge into DevVault from files or URLs." />

            <div className="grid sm:grid-cols-2 gap-3">
              <Card icon={<Upload className="h-4 w-4" />} title="Markdown Files" desc="Drag and drop .md or .txt files. DevVault parses headings, code blocks, and paragraphs into note blocks." />
              <Card icon={<Link2 className="h-4 w-4" />} title="Bulk URLs" desc="Paste a list of URLs (one per line). DevVault batch-extracts metadata and creates bookmark notes with a progress bar." />
            </div>

            <InfoBox>
              Access the Import page from the sidebar. Imported notes go into your currently active folder.
            </InfoBox>
          </section>

          {/* ── GitHub Sync ──────────────────────────── */}
          <section className="space-y-6 border-t border-[#1C1C24] pt-12">
            <SectionHeading id="github-sync" title="GitHub Sync" desc="Your notes sync to a private GitHub repository as Markdown files — readable anywhere, no vendor lock-in." />

            <div className="space-y-2">
              <h4 className="text-[14px] font-bold">How Sync Works</h4>
              <ul className="space-y-2 text-[13px] text-[#A1A1B5]">
                {[
                  "On first sign-in, DevVault creates a private 'devvault-notes' repo in your GitHub account.",
                  "Notes are committed as Markdown files to the notes/ directory with full metadata in YAML frontmatter.",
                  "Auto-sync runs on a configurable interval (5 min, 15 min, 30 min, 1 hr, 2 hr, or manual only).",
                  "Deleting a note locally also deletes the file from GitHub on next sync.",
                  "Conflict detection: if a note is edited on two devices, DevVault shows both versions and lets you choose.",
                  "Sync status is shown per-note: local only (gray), synced (green), pending (yellow), conflict (red).",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#8B5CF6] mt-1">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Mobile & PWA ──────────────────────────── */}
          <section className="space-y-6 border-t border-[#1C1C24] pt-12">
            <SectionHeading id="mobile" title="Mobile & PWA" desc="DevVault works as an installable Progressive Web App with native Share support." />

            <div className="grid sm:grid-cols-2 gap-3">
              <Card icon={<Share2 className="h-4 w-4" />} title="Share Target" desc="On mobile, tap 'Share' from any app (YouTube, Chrome, Twitter) → pick DevVault → a bookmark note is created automatically." />
              <Card icon={<Globe className="h-4 w-4" />} title="Install as App" desc="Add DevVault to your home screen from your browser. It runs as a standalone app with offline access." />
            </div>
          </section>

          {/* ── Keyboard Shortcuts ──────────────────────────── */}
          <section className="space-y-4 border-t border-[#1C1C24] pt-12">
            <SectionHeading id="shortcuts" title="Keyboard Shortcuts" desc="Navigate faster with built-in shortcuts." />

            <div className="space-y-2">
              <ShortcutRow keys="⌘ K" label="Open search" />
              <ShortcutRow keys="⌘ ⇧ L" label="Open Quick Capture" />
              <ShortcutRow keys="⌘ S" label="Force save current note" />
              <ShortcutRow keys="⌘ N" label="Create new note" />
              <ShortcutRow keys="ESC" label="Close modals and dialogs" />
              <ShortcutRow keys="↑ ↓" label="Navigate search results" />
              <ShortcutRow keys="Enter" label="Open selected search result" />
            </div>
          </section>

        </main>
      </div>

      <footer className="border-t border-[#1C1C24] py-8 text-center text-[12px] text-[#6F7182]">
        © 2026 DevVault. Your data, your rules.
      </footer>
    </div>
  );
}

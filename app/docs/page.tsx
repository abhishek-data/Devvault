"use client";

import { ArrowLeft, Book, Github, Lock, RefreshCw, Search, Terminal } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  const sections = [
    { id: "getting-started", title: "Getting Started" },
    { id: "core-concepts", title: "Core Concepts" },
    { id: "github-sync", title: "GitHub Sync & Privacy" },
    { id: "features", title: "Features & Shortcuts" },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] overflow-x-hidden scroll-smooth selection:bg-[#6D28D9]/30">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 h-16 bg-[#000000]/80 backdrop-blur-[16px] border-b border-[#1C1C24] z-[100] flex items-center">
        <div className="w-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-4 w-4 text-[#8F91A2]" />
            <span className="text-[14px] font-medium text-[#8F91A2]">Back to landing</span>
          </Link>

          <div className="flex items-center gap-2">
            <Book className="h-5 w-5 text-[#8B5CF6]" />
            <span className="text-[15px] font-bold">Documentation</span>
          </div>

          <Link
            href="/app"
            className="h-[34px] px-4 bg-[#FFFFFF] rounded-full text-[12px] font-bold text-[#000000] inline-flex items-center gap-1 hover:bg-[#E2E2E2] transition-colors shadow-sm"
          >
            <span>Open App</span>
          </Link>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-6 pt-32 pb-20 flex gap-12">
        {/* Sticky Sidebar Navigation */}
        <aside className="w-48 hidden md:block sticky top-32 h-fit space-y-2">
          <div className="text-[11px] font-bold text-[#6F7182] uppercase tracking-wider mb-3 px-3">On this page</div>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#8F91A2] hover:bg-[#12121A] hover:text-[#FFFFFF] transition-all"
            >
              {section.title}
            </a>
          ))}
        </aside>

        {/* Documentation Content */}
        <main className="flex-1 max-w-[760px] space-y-16">
          
          {/* Section 1: Getting Started */}
          <section id="getting-started" className="space-y-6 scroll-mt-28">
            <div className="space-y-3">
              <h1 className="text-[32px] font-black tracking-tight">Getting Started</h1>
              <p className="text-[15px] leading-[1.7] text-[#8F91A2]">
                DevVault is a developer-first knowledge system that combines local note-taking with automatic backups to your private GitHub repository.
              </p>
            </div>

            <div className="bg-[#0A0A0E] border border-[#1C1C24] rounded-xl p-6 space-y-4 shadow-sm">
               <h3 className="text-[16px] font-bold text-[#FFFFFF]">Quick Setup Steps</h3>
               <div className="space-y-3">
                  {[
                    "Sign in with your GitHub account using the 'Get Started' button.",
                    "Your notes are stored locally in your browser automatically.",
                    "Open Settings to connect a private GitHub repo for cloud backup."
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-3 text-[14px] text-[#A1A1B5]">
                       <div className="h-5 p-2 w-5 rounded-full bg-[#12121C] border border-[#1C1C24] text-[10px] font-bold flex items-center justify-center text-[#8B5CF6] mt-0.5">
                         {i + 1}
                       </div>
                       <p className="leading-[1.4]">{text}</p>
                    </div>
                  ))}
               </div>
            </div>
          </section>

          {/* Section 2: Core Concepts */}
          <section id="core-concepts" className="space-y-6 scroll-mt-28 border-t border-[#1C1C24] pt-12">
             <div className="space-y-2">
                <h2 className="text-[24px] font-bold tracking-tight">Core Concepts</h2>
                <p className="text-[14px] text-[#8F91A2]">DevVault is built on an offline-first architecture — your notes are always available locally, with optional cloud sync.</p>
             </div>

             <div className="grid sm:grid-cols-2 gap-4">
               {[
                 { icon: <Terminal className="h-4 w-4" />, title: "Markdown Driven", desc: "Notes are stored as clean Markdown files with code blocks, headings, and tags — readable anywhere." },
                 { icon: <Lock className="h-4 w-4" />, title: "Local-First Storage", desc: "All data lives in your browser's IndexedDB. No server database — your notes never leave your device unless you sync." },
               ].map((item, i) => (
                 <div key={i} className="p-5 bg-[#0A0A0E] border border-[#1C1C24] rounded-xl">
                    <div className="h-8 w-8 rounded-lg bg-[#12121C] border border-[#1C1C24] flex items-center justify-center text-[#8B5CF6] mb-3">
                      {item.icon}
                    </div>
                    <h4 className="text-[14px] font-bold mb-1">{item.title}</h4>
                    <p className="text-[13px] text-[#8F91A2] leading-[1.5]">{item.desc}</p>
                 </div>
               ))}
             </div>
          </section>

          {/* Section 3: GitHub Sync & Privacy */}
          <section id="github-sync" className="space-y-6 scroll-mt-28 border-t border-[#1C1C24] pt-12">
             <div className="space-y-2">
                <h2 className="text-[24px] font-bold tracking-tight">GitHub Sync & Privacy</h2>
                <p className="text-[14px] text-[#8F91A2]">You own your data completely. Notes sync to your own private GitHub repository — no third-party storage.</p>
             </div>

             <div className="p-6 bg-[#08080A]/80 border border-[#1E1B4B]/30 border-dashed rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#4F46E5]/10 filter blur-3xl rounded-full" />
                <div className="flex items-center gap-3 mb-3">
                   <RefreshCw className="h-5 w-5 text-[#818CF8]" />
                   <h4 className="text-[15px] font-bold">Auto Synchronize Backups</h4>
                </div>
                <p className="text-[13.5px] text-[#8F91A2] leading-[1.6]">
                   DevVault auto-syncs your notes on a configurable interval (default: 5 minutes). Notes are committed as Markdown files to a `notes/` directory in your private GitHub repository.
                </p>
             </div>
          </section>

          {/* Section 4: Features & Shortcuts */}
          <section id="features" className="space-y-6 scroll-mt-28 border-t border-[#1C1C24] pt-12">
             <div className="space-y-2">
                <h2 className="text-[24px] font-bold tracking-tight">Features & Shortcuts</h2>
                <p className="text-[14px] text-[#8F91A2]">Navigate faster with built-in keyboard shortcuts.</p>
             </div>

             <div className="space-y-3">
                {[
                  { key: "CMD + K", label: "Open universal search" },
                  { key: "CMD + S", label: "Force sync to GitHub" },
                  { key: "ESC", label: "Close dialogs and modals" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-[#0A0A0E] border border-[#1C1C24] rounded-xl">
                     <span className="text-[14px] font-medium text-[#E2E2E9]">{item.label}</span>
                     <kbd className="h-7 px-2 bg-[#12121C] border border-[#1C1C24] rounded-md text-[11px] font-bold text-[#8F91A2] flex items-center shadow-sm">
                       {item.key}
                     </kbd>
                  </div>
                ))}
             </div>
          </section>

        </main>
      </div>

      {/* Mini Footer */}
      <footer className="border-t border-[#1C1C24] py-8 text-center text-[12px] text-[#6F7182]">
         © 2026 DevVault Documentation. Your data, your rules.
      </footer>
    </div>
  );
}

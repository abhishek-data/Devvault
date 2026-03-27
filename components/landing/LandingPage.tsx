"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  Vault,
  Github,
  Lock,
  FileText,
  RefreshCw,
  Search,
  Code2,
  GitBranch,
  Zap,
  ExternalLink,
  Shield,
  Smartphone,
  Terminal,
  Layers,
  Bookmark,
  Sparkles,
} from "lucide-react";

export function LandingPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mydevvault.vercel.app";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "DevVault",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description:
      "Store notes and code snippets locally. Sync to your own GitHub repo. Free forever.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] overflow-x-hidden scroll-smooth selection:bg-[#a7f3d0]/20 selection:text-[#a7f3d0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ───────────────────── Header ───────────────────── */}
      <header className="fixed top-0 inset-x-0 h-16 bg-[#000000]/80 backdrop-blur-xl border-b border-[#ffffff08] z-[100] flex items-center">
        <div className="w-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Vault className="h-6 w-6 text-[#a7f3d0]" />
            <span className="text-[16px] font-bold tracking-tight">DevVault</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#71717a]">
            <a href="#features" className="hover:text-[#FFFFFF] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#FFFFFF] transition-colors">How it works</a>
            <Link href="/docs" className="hover:text-[#FFFFFF] transition-colors">Docs</Link>
            <a href="https://github.com/abhishek-data/Devvault" target="_blank" rel="noreferrer" className="hover:text-[#FFFFFF] transition-colors inline-flex items-center gap-1">
              GitHub <ExternalLink className="h-3 w-3" />
            </a>
          </nav>

          <button
            onClick={() => signIn("github", { callbackUrl: "/app" })}
            className="h-9 px-5 bg-[#a7f3d0] rounded-full text-[13px] font-bold text-[#000000] hover:bg-[#86efac] transition-colors"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* ───────────────────── Hero (Centered) ───────────────────── */}
      <section className="relative pt-40 pb-28 flex flex-col items-center text-center px-6 max-w-[900px] mx-auto">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#a7f3d0]/[0.04] filter blur-[120px] rounded-full -z-10" />

        <div className="inline-flex items-center gap-2 bg-[#141418] border border-[#1e1e26] rounded-full px-4 py-1.5 text-[12px] font-semibold text-[#a7f3d0] tracking-wide mb-8">
          <Sparkles className="h-3 w-3" />
          Free forever · Open source · Your data stays yours
        </div>

        <h1 className="text-[clamp(36px,6vw,56px)] font-black tracking-[-2px] leading-[1.05] text-[#FFFFFF] mb-6">
          The all-in-one<br />
          <span className="bg-gradient-to-r from-[#a7f3d0] via-[#6ee7b7] to-[#34d399] bg-clip-text text-transparent">knowledge OS</span>
          {" "}for developers
        </h1>

        <p className="text-[16px] font-medium leading-[1.7] text-[#71717a] max-w-[580px] mb-10">
          Store structured notes and code snippets. Sync everything to your own private GitHub repo. Search across everything in milliseconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <button
            onClick={() => signIn("github", { callbackUrl: "/app" })}
            className="h-12 px-8 bg-[#a7f3d0] hover:bg-[#86efac] rounded-full text-[15px] font-bold text-[#000000] inline-flex items-center gap-2.5 transition-all hover:scale-[1.02] shadow-[0_0_40px_rgba(167,243,208,0.15)]"
          >
            Get Started for Free
          </button>
          <a
            href="https://github.com/abhishek-data/Devvault"
            target="_blank"
            rel="noreferrer"
            className="h-12 px-6 bg-transparent border border-[#27272a] hover:border-[#3f3f46] rounded-full text-[15px] font-semibold text-[#FFFFFF] inline-flex items-center gap-2.5 transition-all"
          >
            <Github className="h-4.5 w-4.5" />
            Star on GitHub
          </a>
        </div>

        <div className="flex items-center gap-2 text-[13px] text-[#52525b]">
          <Lock className="h-3.5 w-3.5" />
          <span>No account needed to try. Notes live in your browser.</span>
        </div>
      </section>

      {/* ───────────────────── Dashboard Visual ───────────────────── */}
      <section className="px-6 pb-32 max-w-[1000px] mx-auto">
        <div className="w-full aspect-[16/9] bg-[#0a0a0c] border border-[#1e1e26] rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.7)] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#a7f3d0]/[0.03] via-transparent to-[#a7f3d0]/[0.02] pointer-events-none" />
          
          {/* Window chrome */}
          <div className="h-10 bg-[#111113] border-b border-[#1e1e26] flex items-center px-4 gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]/50" />
            <div className="ml-4 h-5 px-3 bg-[#1a1a1e] border border-[#27272a] rounded font-mono text-[9px] text-[#52525b] flex items-center">
              mydevvault.app/dashboard
            </div>
          </div>
          
          <div className="flex h-[calc(100%-40px)]">
            {/* Sidebar mock */}
            <div className="w-44 bg-[#0c0c0e] border-r border-[#1e1e26] p-3 space-y-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`h-8 rounded-lg px-3 flex items-center ${i === 0 ? "bg-[#1a1a1e] border-l-2 border-[#a7f3d0]" : ""}`}>
                  <div className={`h-1.5 rounded-full ${i === 0 ? "bg-[#a7f3d0] w-[60%]" : "bg-[#27272a] w-full opacity-40"}`} />
                </div>
              ))}
            </div>
            {/* Content mock */}
            <div className="flex-1 bg-[#07070a] p-6 space-y-5">
              <div className="h-5 bg-[#1a1a1e] rounded-md w-[35%]" />
              <div className="flex gap-2">
                <div className="h-4 w-14 rounded-full bg-[#141418] border border-[#1e1e26]" />
                <div className="h-4 w-20 rounded-full bg-[#141418] border border-[#1e1e26]" />
              </div>
              <div className="space-y-2.5 mt-3">
                <div className="h-2.5 bg-[#1a1a1e] rounded w-[85%] opacity-50" />
                <div className="h-2.5 bg-[#1a1a1e] rounded w-[65%] opacity-50" />
                <div className="h-2.5 bg-[#1a1a1e] rounded w-[75%] opacity-50" />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={`bg-[#0e0e12] border border-[#1e1e26] rounded-xl p-4 space-y-2 ${i > 0 ? "opacity-40" : ""}`}>
                    <div className="h-3 bg-[#1a1a1e] rounded w-12" />
                    <div className="h-2 bg-[#1a1a1e] rounded w-full" />
                    <div className="h-2 bg-[#1a1a1e] rounded w-[70%]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── Feature Pillars (3-col) ───────────────────── */}
      <section className="py-20 px-6 max-w-[1200px] mx-auto text-center">
        <div className="mb-16">
          <h2 className="text-[clamp(28px,4vw,44px)] font-black tracking-[-1px] text-[#FFFFFF] mb-4">
            Leverage powerful tooling<br />with no setup
          </h2>
          <p className="text-[15px] text-[#71717a] max-w-[520px] mx-auto">
            Everything you need to capture, organise and recall developer knowledge — built into one sleek application.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-[1100px] mx-auto">
          {[
            {
              icon: <Search className="h-5 w-5" />,
              title: "Universal search",
              desc: "⌘K search across every note, code block, and tag. Results link directly to the exact block.",
              color: "#a7f3d0",
            },
            {
              icon: <Code2 className="h-5 w-5" />,
              title: "Code-first blocks",
              desc: "Syntax highlighting, language selector, and one-click copy. Built for developers who live in code.",
              color: "#93c5fd",
            },
            {
              icon: <GitBranch className="h-5 w-5" />,
              title: "GitHub sync",
              desc: "Notes are stored as readable Markdown in your own private repo. No vendor lock-in, ever.",
              color: "#a7f3d0",
            },
            {
              icon: <Zap className="h-5 w-5" />,
              title: "Works offline",
              desc: "Everything is stored locally first. GitHub sync happens in the background when you're connected.",
              color: "#fbbf24",
            },
            {
              icon: <Bookmark className="h-5 w-5" />,
              title: "Quick capture",
              desc: "Save any URL as a rich bookmark with metadata extraction. AI summarisation with your own API key.",
              color: "#c084fc",
            },
            {
              icon: <Sparkles className="h-5 w-5" />,
              title: "AI summaries",
              desc: "Paste a YouTube link or article — get a TL;DR, key takeaways, and suggested tags. Powered by BYOK.",
              color: "#f472b6",
            },
          ].map((f) => (
            <article key={f.title} className="bg-[#111113] border border-[#1e1e26] rounded-2xl p-7 text-left hover:border-[#2a2a32] transition-colors group">
              <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-[#1a1a1e] border border-[#27272a] mb-5 group-hover:border-[#3f3f46] transition-colors" style={{ color: f.color }}>
                {f.icon}
              </div>
              <h3 className="text-[16px] font-bold text-[#FFFFFF] mb-2">{f.title}</h3>
              <p className="text-[14px] leading-[1.65] text-[#71717a]">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ───────────────────── "Tons of features" Badge Grid ───────────────────── */}
      <section id="features" className="py-20 px-6 max-w-[1100px] mx-auto text-center">
        <div className="mb-16">
          <h2 className="text-[clamp(28px,4vw,44px)] font-black tracking-[-1px] text-[#FFFFFF] mb-4">
            Tons of features built-in
          </h2>
          <p className="text-[15px] text-[#71717a] max-w-[520px] mx-auto">
            DevVault ships with a ton of benefits and features built-in without writing a single line of code.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1100px] mx-auto">
          {[
            { icon: <Layers className="h-4 w-4" />, title: "Block editor", desc: "Paragraphs, headings, code blocks, dividers, and link cards." },
            { icon: <Terminal className="h-4 w-4" />, title: "Markdown native", desc: "Notes sync to GitHub as clean Markdown with frontmatter." },
            { icon: <Shield className="h-4 w-4" />, title: "Privacy-focused", desc: "Local-first IndexedDB storage. No server database." },
            { icon: <Smartphone className="h-4 w-4" />, title: "PWA ready", desc: "Install on mobile. Share Target support for quick capture." },
            { icon: <Github className="h-4 w-4" />, title: "Open source", desc: "MIT licensed. Fork it, extend it, own it." },
            { icon: <RefreshCw className="h-4 w-4" />, title: "Auto-sync", desc: "Configurable intervals: 5 min to manual only." },
            { icon: <Lock className="h-4 w-4" />, title: "Conflict detection", desc: "Two-device edits show both versions for resolution." },
            { icon: <FileText className="h-4 w-4" />, title: "Import anything", desc: "Drag-drop .md files or bulk-paste URLs to import." },
          ].map((f) => (
            <div key={f.title} className="bg-[#111113] border border-[#1e1e26] rounded-xl p-5 text-left hover:border-[#2a2a32] transition-colors">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#1a1a1e] border border-[#27272a] text-[#a7f3d0] mb-3">
                {f.icon}
              </div>
              <h4 className="text-[14px] font-bold text-[#FFFFFF] mb-1">{f.title}</h4>
              <p className="text-[12px] leading-[1.5] text-[#52525b]">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => signIn("github", { callbackUrl: "/app" })}
            className="h-11 px-8 bg-[#a7f3d0] hover:bg-[#86efac] rounded-full text-[14px] font-bold text-[#000000] transition-all"
          >
            Get Started for Free
          </button>
          <a
            href="https://github.com/abhishek-data/Devvault"
            target="_blank"
            rel="noreferrer"
            className="h-11 px-6 bg-transparent border border-[#27272a] hover:border-[#3f3f46] rounded-full text-[14px] font-semibold text-[#FFFFFF] inline-flex items-center gap-2 transition-all"
          >
            <Github className="h-4 w-4" />
            Star on GitHub
          </a>
        </div>
      </section>

      {/* ───────────────────── How It Works (Card Steps) ───────────────────── */}
      <section id="how-it-works" className="py-20 px-6 max-w-[1100px] mx-auto text-center">
        <div className="mb-16">
          <span className="text-[11px] font-bold text-[#a7f3d0] uppercase tracking-widest mb-3 block">Simple by design</span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-black tracking-[-1px] text-[#FFFFFF] mb-4">
            Up and running in 30 seconds
          </h2>
          <p className="text-[15px] text-[#71717a] max-w-[480px] mx-auto">
            No complex setup. No CLI tools. Just sign in and start building your knowledge base.
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-0">
          {[
            {
              icon: <Github className="h-6 w-6" />,
              title: "Sign in with GitHub",
              desc: "One click. No forms, no email, no password. Your GitHub account is your DevVault account.",
              gradient: "from-[#a7f3d0] to-[#6ee7b7]",
              iconColor: "#a7f3d0",
              glow: "rgba(167,243,208,0.08)",
            },
            {
              icon: <FileText className="h-6 w-6" />,
              title: "Write notes & snippets",
              desc: "Create structured notes with code blocks, headings, and paragraphs. Copy any snippet in one click.",
              gradient: "from-[#93c5fd] to-[#60a5fa]",
              iconColor: "#93c5fd",
              glow: "rgba(147,197,253,0.08)",
            },
            {
              icon: <RefreshCw className="h-6 w-6" />,
              title: "Auto-syncs to your repo",
              desc: "Every note is saved as Markdown in your own private GitHub repo. Accessible from any device, always.",
              gradient: "from-[#fbbf24] to-[#f59e0b]",
              iconColor: "#fbbf24",
              glow: "rgba(251,191,36,0.08)",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center flex-1">
              {/* Card */}
              <article className="flex-1 bg-[#111113] border border-[#1e1e26] rounded-2xl overflow-hidden hover:border-[#2a2a32] transition-all group relative">
                {/* Gradient top accent */}
                <div className={`h-1 w-full bg-gradient-to-r ${item.gradient}`} />

                <div className="p-7 pt-8 flex flex-col items-center text-center">
                  {/* Centered icon with glow ring */}
                  <div
                    className="h-14 w-14 flex items-center justify-center rounded-2xl border border-[#27272a] group-hover:border-[#3f3f46] transition-all mb-6"
                    style={{ color: item.iconColor, backgroundColor: item.glow }}
                  >
                    {item.icon}
                  </div>

                  <h3 className="text-[17px] font-bold text-[#FFFFFF] mb-2">{item.title}</h3>
                  <p className="text-[14px] leading-[1.65] text-[#71717a]">{item.desc}</p>
                </div>
              </article>

              {/* Arrow connector (between cards, desktop only) */}
              {i < 2 && (
                <div className="hidden md:flex items-center justify-center w-12 flex-shrink-0">
                  <svg width="32" height="16" viewBox="0 0 32 16" fill="none" className="text-[#27272a]">
                    <line x1="0" y1="8" x2="24" y2="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
                    <path d="M22 3L28 8L22 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Subtle CTA below steps */}
        <div className="mt-14 flex items-center justify-center gap-2 text-[13px] text-[#52525b]">
          <Lock className="h-3.5 w-3.5" />
          <span>Your data never touches our servers. Everything syncs directly to your GitHub.</span>
        </div>
      </section>

      {/* ───────────────────── Bottom CTA ───────────────────── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-[clamp(28px,5vw,48px)] font-black tracking-[-1.5px] text-[#FFFFFF] mb-4">
            Unlock your productivity
          </h2>
          <p className="text-[16px] text-[#71717a] max-w-[480px] mx-auto mb-10">
            Get started with the free DevVault application. Your notes, your GitHub, your rules.
          </p>
          <button
            onClick={() => signIn("github", { callbackUrl: "/app" })}
            className="h-12 px-10 bg-[#a7f3d0] hover:bg-[#86efac] rounded-full text-[15px] font-bold text-[#000000] transition-all hover:scale-[1.02] shadow-[0_0_50px_rgba(167,243,208,0.12)]"
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* ───────────────────── Footer ───────────────────── */}
      <footer className="border-t border-[#1e1e26] bg-[#000000] py-14">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Vault className="h-6 w-6 text-[#a7f3d0]" />
              <span className="text-[15px] font-bold">DevVault</span>
            </div>
            <p className="text-[12px] text-[#52525b] leading-relaxed">Your notes. Your GitHub.<br />Your rules.</p>
          </div>

          <div className="space-y-3 text-[13px] font-medium text-[#71717a]">
            <div className="font-bold text-[#FFFFFF] text-[11px] uppercase tracking-widest mb-2">Product</div>
            <a href="#features" className="block hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="block hover:text-white transition-colors">How it works</a>
          </div>

          <div className="space-y-3 text-[13px] font-medium text-[#71717a]">
            <div className="font-bold text-[#FFFFFF] text-[11px] uppercase tracking-widest mb-2">Resources</div>
            <Link href="/docs" className="block hover:text-white transition-colors">Documentation</Link>
            <a href="https://github.com/abhishek-data/Devvault" target="_blank" rel="noreferrer" className="block hover:text-white transition-colors">GitHub</a>
          </div>

          <div className="space-y-3 text-[13px] font-medium text-[#71717a]">
            <div className="font-bold text-[#FFFFFF] text-[11px] uppercase tracking-widest mb-2">Community</div>
            <a href="https://github.com/abhishek-data/Devvault/issues" target="_blank" rel="noreferrer" className="block hover:text-white transition-colors">Issues</a>
            <a href="https://github.com/abhishek-data/Devvault/discussions" target="_blank" rel="noreferrer" className="block hover:text-white transition-colors">Discussions</a>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 mt-12 pt-6 border-t border-[#1e1e26] flex items-center justify-between text-[12px] text-[#52525b]">
          <span>© 2026 DevVault. Made by Abhishek</span>
          <a href="https://github.com/abhishek-data/Devvault" target="_blank" rel="noreferrer" className="hover:text-white inline-flex items-center gap-1 transition-colors">
            GitHub <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}

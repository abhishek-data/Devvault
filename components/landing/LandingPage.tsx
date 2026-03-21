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
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] overflow-x-hidden scroll-smooth selection:bg-[var(--accent-dim)] selection:text-[var(--text-accent)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Visily Styled Header */}
      <header className="fixed top-0 inset-x-0 h-16 bg-[#000000]/80 backdrop-blur-[16px] border-b border-[#1C1C24] z-[100] flex items-center">
        <div className="w-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Vault className="h-6 w-6 text-[#8B5CF6]" />
            <span className="text-[16px] font-bold tracking-tight">DevVault</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-[#8F91A2]">
            <a href="#features" className="hover:text-[#FFFFFF] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#FFFFFF] transition-colors">How it works</a>
            <Link href="/docs" className="hover:text-[#FFFFFF] transition-colors">Docs</Link>
            <a href="https://github.com/abhishek-data/Devvault" target="_blank" rel="noreferrer" className="hover:text-[#FFFFFF] transition-colors inline-flex items-center gap-1">
              GitHub <ExternalLink className="h-3 w-3" />
            </a>
          </nav>

          <button
            onClick={() => signIn("github", { callbackUrl: "/app" })}
            className="h-[36px] px-4 bg-[#FFFFFF] rounded-full text-[13px] font-bold text-[#000000] inline-flex items-center gap-2 hover:bg-[#E2E2E2] transition-colors shadow-sm"
          >
            <Github className="h-4 w-4" />
            <span>Sign in with GitHub</span>
          </button>
        </div>
      </header>

      {/* Visily Hero Section (Split Layout: Left Text, Right Mockup) */}
      <section className="relative pt-36 pb-20 max-w-[1200px] mx-auto px-6 overflow-hidden">
        {/* Violet Background Glow */}
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-[#6D28D9]/10 filter blur-[100px] rounded-full -z-10" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">

          {/* Left Column: Content */}
          <div className="flex-1 text-left max-w-[560px]">
            <div className="inline-flex items-center gap-2 bg-[#0C0C12] border border-[#1C1C24] rounded-full px-4 py-1.5 text-[12px] font-bold text-[#A78BFA] tracking-wide mb-6 shadow-sm">
              Free forever • Your data stays in your GitHub
            </div>

            <h1 className="text-[clamp(38px,5vw,62px)] font-black tracking-[-1.5px] leading-[1.02] text-[#FFFFFF] mb-5">
              Your developer
              <br />
              <span className="bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#C084FC] bg-clip-text text-transparent">knowledge</span>
              <br />
              OS
            </h1>

            <p className="text-[15px] font-medium leading-[1.7] text-[#8F91A2] max-w-[460px] mb-8">
              Store structured notes and code snippets. Sync everything to your own private GitHub repo. Search across everything in milliseconds.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <button
                onClick={() => signIn("github", { callbackUrl: "/app" })}
                className="h-11 px-8 bg-[#FFFFFF] hover:bg-[#E2E2E2] rounded-xl text-[14px] font-extrabold text-[#000000] inline-flex items-center gap-2 transition-all hover:scale-[1.02] shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
              >
                Get Started for Free
              </button>
              <button
                onClick={() => signIn("github", { callbackUrl: "/app" })}
                className="h-11 px-6 bg-[#030304] border border-[#1C1C24] hover:border-[#3C3C4A] rounded-xl text-[14px] font-bold text-[#FFFFFF] inline-flex items-center gap-2 transition-all"
              >
                <Github className="h-4 w-4" />
                Sign in with GitHub
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#6F7182]">
              <Lock className="h-3.5 w-3.5" />
              <span>We never store your data. Notes live in your GitHub.</span>
            </div>
          </div>

          {/* Right Column: Visual Mockup for Dashboard preview */}
          <div className="flex-1 w-full max-w-[600px] lg:max-w-[560px]">
            <div className="w-full aspect-[4/3] bg-[#0A0A0E] border border-[#1C1C24] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.8)] overflow-hidden relative group">
              {/* Embedded Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 via-transparent to-[#38BDF8]/5 opacity-80" />

              {/* Top bar mockup wrapper support */}
              <div className="h-10 bg-[#12121A] border-b border-[#1C1C24] flex items-center px-4 gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#EF4444]/60" />
                <span className="h-2 w-2 rounded-full bg-[#F59E0B]/60" />
                <span className="h-2 w-2 rounded-full bg-[#10B981]/60" />
                <div className="ml-4 h-5 px-3 bg-[#1C1C24] border border-[#2A2A35] rounded font-mono text-[9px] text-[#6F7182] flex items-center">
                  localhost:3000/app
                </div>
              </div>

              <div className="flex h-[calc(100%-40px)]">
                {/* Mock Sidebar */}
                <div className="w-36 bg-[#09090C] border-r border-[#1C1C24] p-2 space-y-1.5 opacity-80">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`h-8 rounded px-2.5 flex items-center ${i === 0 ? "bg-[#1C1C24] border-l-2 border-[#8B5CF6]" : "bg-transparent"}`}>
                      <div className={`h-1.5 rounded w-full ${i === 0 ? "bg-[#FFFFFF]" : "bg-[#6F7182] opacity-40"}`} />
                    </div>
                  ))}
                </div>
                {/* Mock Content area dashboard grids */}
                <div className="flex-1 bg-[#050507] p-5 space-y-4 flex flex-col justify-start">
                  <div className="h-5 bg-[#1C1C24] rounded-md w-[40%]" />
                  <div className="flex gap-1.5">
                    <div className="h-4 w-12 rounded-full bg-[#12121C] border border-[#1C1C24]" />
                    <div className="h-4 w-16 rounded-full bg-[#12121C] border border-[#1C1C24]" />
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="h-2.5 bg-[#1C1C24] rounded w-[90%] opacity-60" />
                    <div className="h-2.5 bg-[#1C1C24] rounded w-[70%] opacity-60" />
                    <div className="h-2.5 bg-[#1C1C24] rounded w-[80%] opacity-60" />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 flex-1 h-full overflow-hidden">
                    <div className="bg-[#0C0C14] border border-[#1C1C24] rounded-xl p-3 flex flex-col gap-2 relative">
                      <div className="h-3 bg-[#1C1C24] rounded w-10" />
                      <div className="h-2 bg-[#1C1C24] rounded w-full opacity-40" />
                      <div className="h-2 bg-[#1C1C24] rounded w-[60%] opacity-40" />
                    </div>
                    <div className="bg-[#0C0C14] border border-[#1C1C24] rounded-xl p-3 flex flex-col gap-2 opacity-50">
                      <div className="h-3 bg-[#1C1C24] rounded w-8" />
                      <div className="h-2 bg-[#1C1C24] rounded w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Visily 6-Card Grid Layout Structure */}
      <section id="features" className="py-20 px-6 max-w-[1200px] mx-auto text-center">
        <div className="mb-14">
          <h2 className="text-[28px] md:text-[34px] font-extrabold tracking-tight text-[#FFFFFF] mb-3">
            Everything you need to build faster
          </h2>
          <p className="text-[14px] text-[#8F91A2] max-w-[460px] mx-auto">
            Powerful features strictly mapped to your developer workflow without any complex bloat.
          </p>
        </div>

        {/* Using 4 original points inside mockup card layout for exact match */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4 max-w-[1000px] mx-auto">
          {[
            {
              icon: <Search className="h-5 w-5 text-[#C084FC]" />,
              title: "Universal search",
              desc: "⌘K search across every note, code block, and tag. Results link directly to the exact block.",
            },
            {
              icon: <Code2 className="h-5 w-5 text-[#818CF8]" />,
              title: "Code-first blocks",
              desc: "Every code block has syntax highlighting, a language selector, and a one-click copy button.",
            },
            {
              icon: <GitBranch className="h-5 w-5 text-[#34D399]" />,
              title: "GitHub sync",
              desc: "Notes are stored as readable Markdown in your own private repo. No lock-in, ever.",
            },
            {
              icon: <Zap className="h-5 w-5 text-[#FBBF24]" />,
              title: "Works offline",
              desc: "Everything is stored locally first. GitHub sync happens in the background when you're connected.",
            },
          ].map((feature) => (
            <article key={feature.title} className="bg-[#0A0A0E] border border-[#1C1C24] rounded-2xl p-6 text-left hover:border-[#3C3C4A] transition-colors shadow-sm">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#12121C] border border-[#1C1C24] mb-4">
                {feature.icon}
              </div>
              <h3 className="text-[15px] font-bold text-[#FFFFFF] mb-2">{feature.title}</h3>
              <p className="text-[13px] leading-[1.6] text-[#8F91A2]">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Visily "How it Works" Connected timeline Section */}
      <section id="how-it-works" className="py-24 px-6 max-w-[1100px] mx-auto text-center">
        <div className="mb-16">
          <span className="text-[11px] font-bold text-[#8B5CF6] uppercase tracking-wider mb-2 block">Simple by design</span>
          <h2 className="text-[28px] md:text-[34px] font-extrabold tracking-tight text-[#FFFFFF]">
            Up and running in 30 seconds
          </h2>
        </div>

        <div className="relative flex flex-col md:flex-row items-start justify-between gap-12 md:gap-6">
          {/* Background connecting line dashed (desktop only) */}
          <div className="absolute top-6 left-[15%] right-[15%] h-0 border-t border-dashed border-[#1C1C24] hidden md:block -z-10" />

          {[
            {
              icon: <Github className="h-4 w-4 text-[#8B5CF6]" />,
              title: "Sign in with GitHub",
              desc: "One click. No forms, no email, no password. Your GitHub account is your DevVault account.",
              step: "01",
            },
            {
              icon: <FileText className="h-4 w-4 text-[#34D399]" />,
              title: "Write notes & snippets",
              desc: "Create structured notes with code blocks, headings, and paragraphs. Copy any snippet in one click.",
              step: "02",
            },
            {
              icon: <RefreshCw className="h-4 w-4 text-[#FBBF24]" />,
              title: "Auto-syncs to your repo",
              desc: "Every note is saved as Markdown in your own private GitHub repo. Accessible from any device, always.",
              step: "03",
            },
          ].map((item, i) => (
            <article key={i} className="flex-1 flex flex-col items-center relative group">
              {/* Node Circle */}
              <div className="h-12 w-12 rounded-full bg-[#0A0A0E] border border-[#1C1C24] flex items-center justify-center text-[12px] font-extrabold text-[#FFFFFF] mb-5 relative group-hover:border-[#30303A] transition-colors shadow-sm">
                {item.step}
              </div>

              {/* Optional Arrows on Desktop between nodes */}
              {i < 2 && (
                <div className="absolute top-5 right-[-15px] translate-x-1/2 text-[#1C1C24] hidden md:block">
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 1L19 6L14 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1 6H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}

              <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#0C0C12] border border-[#1C1C24] mb-4 text-[#FFFFFF]">
                {item.icon}
              </div>

              <h3 className="text-[15px] font-bold text-[#FFFFFF] mb-2">{item.title}</h3>
              <p className="text-[13px] leading-[1.6] text-[#8F91A2] max-w-[260px]">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Visily Bottom CTA Section */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center">
          <h3 className="text-[28px] md:text-[34px] font-extrabold tracking-tight text-[#FFFFFF] mb-3">
            Ready to supercharge your developer workflow?
          </h3>
          <p className="text-[14px] text-[#8F91A2] max-w-[420px] mb-8">
            Start building your knowledge OS today. Free forever.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => signIn("github", { callbackUrl: "/app" })}
              className="h-11 px-8 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-full text-[14px] font-bold text-white transition-all shadow-[0_0_24px_rgba(139,92,246,0.2)]"
            >
              Start Your Free Vault
            </button>
          </div>
        </div>
      </section>

      {/* Visily Layout Footer */}
      <footer className="border-t border-[#1C1C24] bg-[#050508] py-12">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Vault className="h-6 w-6 text-[#8B5CF6]" />
              <span className="text-[15px] font-bold">DevVault</span>
            </div>
            <p className="text-[12px] text-[#6F7182] leading-relaxed">Your notes. Your GitHub.<br />Your rules.</p>
          </div>

          <div className="space-y-3 text-[13px] font-medium text-[#8F91A2]">
            <div className="font-bold text-[#FFFFFF] text-[12px] uppercase tracking-wider mb-1">Product</div>
            <a href="#features" className="block hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="block hover:text-white transition-colors">How it works</a>
          </div>

          <div className="space-y-3 text-[13px] font-medium text-[#8F91A2]">
            <div className="font-bold text-[#FFFFFF] text-[12px] uppercase tracking-wider mb-1">Resources</div>
            <Link href="/docs" className="block hover:text-white transition-colors">Documentation</Link>
            <a href="https://github.com/abhishek-data/Devvault" target="_blank" rel="noreferrer" className="block hover:text-white transition-colors">GitHub</a>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 mt-12 pt-6 border-t border-[#1C1C24] flex items-center justify-between text-[12px] text-[#6F7182]">
          <span>© 2026 DevVault. Made by Abhishek</span>
          <a href="https://github.com/abhishek-data/Devvault" target="_blank" rel="noreferrer" className="hover:text-white inline-flex items-center gap-1 transition-colors">
            GitHub <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}

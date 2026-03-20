"use client";

import { signIn } from "next-auth/react";
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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-x-hidden scroll-smooth">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="fixed top-0 inset-x-0 h-14 bg-[rgba(8,8,16,0.8)] backdrop-blur-[12px] border-b border-[var(--border-subtle)] z-[100]">
        <div
          className="h-full flex items-center justify-between"
          style={{ paddingInline: "max(24px, calc((100vw - 1100px) / 2))" }}
        >
          <div className="flex items-center gap-2">
            <Vault className="h-7 w-7 text-[var(--accent-primary)]" />
            <span className="text-[15px] font-semibold text-[var(--text-primary)]">DevVault</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[var(--text-secondary)]">
            <a href="#features" className="hover:text-[var(--text-primary)]">Features</a>
            <a href="#how-it-works" className="hover:text-[var(--text-primary)]">How it works</a>
            <a href="https://github.com/abhishek-data/Devvault" target="_blank" rel="noreferrer" className="hover:text-[var(--text-primary)]">GitHub</a>
          </nav>

          <button
            onClick={() => signIn("github", { callbackUrl: "/app" })}
            className="h-[34px] px-4 bg-white rounded-[var(--radius-md)] text-[13px] font-semibold text-[#0D0D0D] inline-flex items-center gap-2 hover:bg-[rgba(255,255,255,0.88)]"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">Sign in with GitHub</span>
            <span className="sm:hidden">Sign in</span>
          </button>
        </div>
      </header>

      <section className="pt-40 pb-[100px] text-center max-w-[720px] mx-auto px-6">
        <div className="inline-flex items-center gap-2 bg-[var(--accent-dim)] border border-[var(--accent-muted)] rounded-full px-[14px] py-1 text-[11px] font-semibold text-[var(--text-accent)] tracking-[0.5px] uppercase mb-7" style={{ animation: "fadeUp 400ms ease both" }}>
          Free forever · Your data stays in your GitHub
        </div>

        <h1 className="text-[clamp(36px,6vw,62px)] font-semibold tracking-[-1.5px] leading-[1.1] text-[var(--text-primary)] mb-5" style={{ animation: "fadeUp 400ms 80ms ease both" }}>
          Your developer
          <br />
          <span className="text-[var(--text-accent)]">knowledge</span> OS
        </h1>

        <p className="text-[16px] font-normal leading-[1.7] text-[var(--text-secondary)] max-w-[480px] mx-auto mb-9" style={{ animation: "fadeUp 400ms 160ms ease both" }}>
          Store structured notes and code snippets.
          <br />
          Sync everything to your own private GitHub repo.
          <br />
          Search across everything in milliseconds.
        </p>

        <button
          onClick={() => signIn("github", { callbackUrl: "/app" })}
          className="h-11 px-7 bg-[var(--accent-primary)] rounded-[var(--radius-md)] text-[14px] font-semibold text-white inline-flex items-center gap-2.5 hover:bg-[var(--accent-bright)] hover:-translate-y-[1px]"
          style={{ boxShadow: "none", animation: "fadeUp 400ms 240ms ease both" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(124, 58, 237, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Github className="h-[18px] w-[18px]" />
          Sign in with GitHub
        </button>

        <div className="mt-4 text-[12px] text-[var(--text-tertiary)] flex items-center gap-1.5 justify-center" style={{ animation: "fadeUp 400ms 320ms ease both" }}>
          <Lock className="h-3 w-3" />
          We never store your data. Notes live in your GitHub repo.
        </div>
      </section>

      <section className="px-6 pb-[100px] max-w-[1100px] mx-auto" style={{ animation: "fadeUp 500ms 400ms ease both" }}>
        <div
          className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden"
          style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.08)" }}
        >
          <div className="h-[38px] bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] px-[14px] flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#FF5F57] opacity-60" />
            <span className="h-2 w-2 rounded-full bg-[#FEBC2E] opacity-60" />
            <span className="h-2 w-2 rounded-full bg-[#28C840] opacity-60" />
            <div className="ml-3 h-[22px] w-[240px] bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] px-[10px] text-[11px] text-[var(--text-tertiary)] flex items-center">
              mydevvault.vercel.app
            </div>
          </div>

          <div className="h-[480px] flex">
            <div className="w-[200px] bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] p-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-12 rounded-[var(--radius-md)] px-[10px] py-2 mb-0.5 ${i === 0 ? "bg-[var(--bg-overlay)] border-l-2 border-[var(--accent-primary)]" : ""}`}
                >
                  <div className="h-2.5 rounded bg-[var(--bg-overlay)] w-[80%] mb-2" />
                  <div className="h-2 rounded bg-[var(--bg-overlay)] w-[55%]" />
                </div>
              ))}
            </div>

            <div className="flex-1 bg-[var(--bg-base)] p-8 md:p-10">
              <div className="h-6 w-[60%] rounded bg-[var(--bg-elevated)]" />
              <div className="mt-3 flex gap-2">
                <div className="h-5 w-16 rounded-full bg-[var(--bg-elevated)]" />
                <div className="h-5 w-20 rounded-full bg-[var(--bg-elevated)]" />
              </div>

              <div className="mt-6 space-y-2">
                <div className="h-3 w-[90%] rounded bg-[var(--bg-elevated)]" />
                <div className="h-3 w-[74%] rounded bg-[var(--bg-elevated)]" />
                <div className="h-3 w-[82%] rounded bg-[var(--bg-elevated)]" />
              </div>

              <div className="mt-6 bg-[#0C0C18] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden">
                <div className="h-8 bg-[#0F0F1E] border-b border-[var(--border-subtle)] px-3.5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#FF5F57] opacity-60" />
                  <span className="h-2 w-2 rounded-full bg-[#FEBC2E] opacity-60" />
                  <span className="h-2 w-2 rounded-full bg-[#28C840] opacity-60" />
                  <div className="ml-3 h-4 w-14 rounded bg-[#2D2D4A]" />
                </div>
                <div className="p-[14px] px-4 space-y-[10px]">
                  <div className="h-2.5 w-[70%] rounded bg-[#2D2D4A]" />
                  <div className="h-2.5 w-[45%] rounded bg-[#2A1F4A]" />
                  <div className="h-2.5 w-[60%] rounded bg-[#2D2D4A]" />
                  <div className="h-2.5 w-[30%] rounded bg-[#2D2D4A]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="py-[100px] px-6 max-w-[900px] mx-auto text-center"
        style={{ animation: "fadeUp 500ms 520ms ease both" }}
      >
        <div className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--text-accent)] mb-4">Simple by design</div>
        <h2 className="text-[clamp(24px,4vw,36px)] font-semibold tracking-[-0.5px] text-[var(--text-primary)] mb-[60px]">
          Up and running in 30 seconds
        </h2>

        <div className="grid md:grid-cols-3 gap-2">
          {[
            {
              icon: <Github className="h-[18px] w-[18px] text-[var(--text-accent)]" />,
              title: "Sign in with GitHub",
              desc: "One click. No forms, no email, no password. Your GitHub account is your DevVault account.",
              step: "01",
            },
            {
              icon: <FileText className="h-[18px] w-[18px] text-[var(--text-accent)]" />,
              title: "Write notes & snippets",
              desc: "Create structured notes with code blocks, headings, and paragraphs. Copy any snippet in one click.",
              step: "02",
            },
            {
              icon: <RefreshCw className="h-[18px] w-[18px] text-[var(--text-accent)]" />,
              title: "Auto-syncs to your repo",
              desc: "Every note is saved as Markdown in your own private GitHub repo. Accessible from any device, always.",
              step: "03",
            },
          ].map((step) => (
            <article key={step.step} className="relative bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8 text-left">
              <span className="absolute top-5 right-5 text-[11px] font-semibold text-[var(--text-tertiary)] font-mono">{step.step}</span>
              <div className="w-10 h-10 bg-[var(--accent-dim)] border border-[var(--accent-muted)] rounded-[var(--radius-lg)] flex items-center justify-center mb-5">{step.icon}</div>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-2">{step.title}</h3>
              <p className="text-[13px] leading-[1.65] text-[var(--text-secondary)]">{step.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="features"
        className="py-[100px] px-6 max-w-[1000px] mx-auto"
        style={{ animation: "fadeUp 500ms 620ms ease both" }}
      >
        <div className="text-center mb-[60px]">
          <div className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--text-accent)] mb-4">Built for developers</div>
          <h2 className="text-[clamp(24px,4vw,36px)] font-semibold tracking-[-0.5px] text-[var(--text-primary)]">
            Everything you need, nothing you don&apos;t
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-2">
          {[
            {
              icon: <Search className="h-5 w-5 text-[var(--text-accent)]" />,
              title: "Universal search",
              desc: "⌘K search across every note, code block, and tag. Results link directly to the exact block.",
            },
            {
              icon: <Code2 className="h-5 w-5 text-[var(--text-accent)]" />,
              title: "Code-first blocks",
              desc: "Every code block has syntax highlighting, a language selector, and a one-click copy button.",
            },
            {
              icon: <GitBranch className="h-5 w-5 text-[var(--text-accent)]" />,
              title: "GitHub sync",
              desc: "Notes are stored as readable Markdown in your own private repo. No lock-in, ever.",
            },
            {
              icon: <Zap className="h-5 w-5 text-[var(--text-accent)]" />,
              title: "Works offline",
              desc: "Everything is stored locally first. GitHub sync happens in the background when you're connected.",
            },
          ].map((feature) => (
            <article key={feature.title} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-7">
              {feature.icon}
              <h3 className="mt-4 text-[14px] font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
              <p className="text-[13px] leading-[1.65] text-[var(--text-secondary)]">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="py-[100px] px-6 text-center"
        style={{ animation: "fadeUp 500ms 720ms ease both" }}
      >
        <div className="max-w-[560px] mx-auto bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] px-10 py-14 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[300px] h-[200px]"
            style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)" }}
          />
          <h3 className="relative text-2xl font-semibold tracking-[-0.3px] text-[var(--text-primary)] mb-3">
            Start building your knowledge OS
          </h3>
          <p className="relative text-[14px] text-[var(--text-secondary)] mb-7">
            Free forever. Your data, your GitHub, your rules.
          </p>
          <button
            onClick={() => signIn("github", { callbackUrl: "/app" })}
            className="relative h-11 px-7 bg-[var(--accent-primary)] rounded-[var(--radius-md)] text-[14px] font-semibold text-white inline-flex items-center gap-2.5 hover:bg-[var(--accent-bright)] whitespace-nowrap"
          >
            <Github className="h-[18px] w-[18px]" />
            Sign in with GitHub — it&apos;s free
          </button>
        </div>
      </section>

      <footer
        className="border-t border-[var(--border-subtle)]"
        style={{ animation: "fadeUp 500ms 820ms ease both" }}
      >
        <div className="max-w-[1100px] mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <Vault className="h-5 w-5 text-[var(--accent-primary)]" />
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">DevVault</span>
            </div>
            <p className="text-[12px] text-[var(--text-tertiary)] mt-2">Your notes. Your GitHub. Your rules.</p>
          </div>
          <div className="flex items-center gap-5 text-[12px] text-[var(--text-tertiary)]">
            <a className="hover:text-[var(--text-secondary)] inline-flex items-center gap-1" href="https://github.com/abhishek-data/Devvault" target="_blank" rel="noreferrer">
              GitHub <ExternalLink className="h-3 w-3" />
            </a>
            <span className="hover:text-[var(--text-secondary)]">Made by Abhishek</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

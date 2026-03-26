# DevVault — Project Instructions

## Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript (strict)
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State**: Zustand (single store in `lib/store.ts`)
- **Database**: Dexie.js (IndexedDB wrapper) in `lib/db/`
- **Editor**: Tiptap (headless, block-based)
- **Search**: Fuse.js (fuzzy search)
- **Auth**: NextAuth.js with GitHub OAuth
- **Sync**: Octokit → private GitHub repo (`devvault-notes`)
- **Icons**: Lucide React

## Commands
```
npm run dev        # Start dev server
npm run build      # Production build (also runs TypeScript check)
npm run lint       # ESLint
npx next build     # Same as npm run build
```

## Architecture
- `lib/types.ts` — Single source of truth for all TypeScript interfaces
- `lib/db/storage.ts` — All IndexedDB CRUD (never call `db` directly from components)
- `lib/store.ts` — Zustand store + `selectVisibleNotes` selector
- `lib/sync/markdown.ts` — Note ↔ Markdown conversion with frontmatter
- `lib/sync/queue.ts` — Sync queue with retry, rate-limit handling, delete support
- API routes in `app/api/` — GitHub sync, URL extraction, AI summarization
- All pages under `app/app/` are protected (require auth)

## Conventions
- All new Note fields must be optional (`?`) for backward compatibility
- CSS variables (`--bg-base`, `--accent-primary`, etc.) for theming — never hardcode colors in app components
- Link blocks render OUTSIDE Tiptap as `<LinkCard>` — editor preserves them on save
- Block IDs are UUIDs preserved through Markdown round-trips via HTML comments
- Markdown frontmatter is the source of truth for note metadata
- Use `StorageService` for all DB operations, never import `db` directly
- Always mark edited notes as `syncStatus: "pending"` when GitHub is connected
- Use `cn()` from `lib/utils` for conditional Tailwind classes

## Git Workflow
- Create feature branches: `feat/`, `fix/`, `refactor/`, `docs/`
- Merge to main with `--no-ff` for merge commits
- Commit messages: conventional commits (feat:, fix:, refactor:, docs:, chore:)

## Important: What NOT to do
- Don't add `any` types — use proper TypeScript interfaces
- Don't hardcode colors in app components — use CSS variables
- Don't import Dexie `db` directly in components — use `StorageService`
- Don't break existing Markdown sync — old notes must still parse correctly
- Don't store API keys server-side — BYOK keys live in localStorage only

# DevVault

A local-first developer knowledge OS. Store structured notes with multiple block types, search with block-level deep linking, and sync to your own private GitHub repository.

![DevVault Screenshot](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)

## Features

- **Block Editor** — TipTap-based with paragraph, heading (H1/H2/H3), code block (syntax highlighting, language selector, copy button), and divider blocks
- **Local-First** — All data stored in IndexedDB via Dexie.js. Works fully offline
- **Universal Search** — `⌘K` to search across all notes with fuzzy matching, keyboard navigation, and block-level deep linking
- **GitHub Sync** — Backs up notes to a private `devvault-notes` repo. Serial sync queue with rate limit and offline handling
- **Conflict Resolution** — Three-option modal: keep local, keep remote, or keep both
- **Auto-Save** — 1500ms debounce + `⌘S` manual save with dirty state indicator
- **Dark Theme** — Minimal, developer-native aesthetic with Inter + JetBrains Mono fonts

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | TailwindCSS + shadcn/ui |
| State | Zustand |
| Database | Dexie.js (IndexedDB) |
| Search | Fuse.js |
| Editor | TipTap + lowlight |
| Auth | NextAuth.js (GitHub OAuth) |
| GitHub API | Octokit.js |
| Notifications | sonner |
| Icons | lucide-react |

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## GitHub Sync Setup

1. Create a [GitHub OAuth App](https://github.com/settings/developers)
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
2. Fill in `.env.local`:

```env
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=<your client id>
GITHUB_CLIENT_SECRET=<your client secret>
```

3. Click **Settings → Connect GitHub** in the app

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` | Open search |
| `⌘S` | Save note |
| `⌘N` | New note |
| `Esc` | Close modal |

## License

MIT

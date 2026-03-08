import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Octokit } from "@octokit/rest";
import { authOptions } from "@/lib/auth";

function getWelcomeMarkdown(nowIso: string, username: string) {
  return `---
id: welcome-to-devvault
title: Welcome to DevVault
tags: [getting-started]
createdAt: ${nowIso}
updatedAt: ${nowIso}
version: 1
---

<!-- block:b1:heading:1 -->
# Welcome to DevVault 👋

<!-- block:b2:paragraph -->
DevVault is your personal developer knowledge OS. Store notes, code snippets, and references - everything syncs automatically to this GitHub repo.

<!-- block:b3:heading:2 -->
## Quick Start

<!-- block:b4:paragraph -->
Press ⌘K to search across all your notes. Press ⌘N to create a new note. Hit ⌘S to save.

<!-- block:b5:heading:2 -->
## Your First Code Block

<!-- block:b6:code:bash -->
\`\`\`bash
# This is a code block - click Copy to copy it instantly
git clone https://github.com/${username}/devvault-notes.git
\`\`\`

<!-- block:b7:paragraph -->
Every note you create is saved as a Markdown file in this repo. You own your data completely.

<!-- block:b8:divider -->
---

<!-- block:b9:paragraph -->
Delete this note whenever you're ready. Happy building. 🚀
`;
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const accessToken = (session as any).accessToken as string;
  const octokit = new Octokit({ auth: accessToken });

  try {
    const me = await octokit.rest.users.getAuthenticated();
    const owner = me.data.login;

    try {
      await octokit.rest.repos.get({ owner, repo: "devvault-notes" });
    } catch {
      await octokit.rest.repos.createForAuthenticatedUser({
        name: "devvault-notes",
        description: "DevVault — Developer Knowledge OS synced notes",
        private: true,
        auto_init: true,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const now = new Date().toISOString();
    const path = "notes/welcome-to-devvault.md";
    const content = getWelcomeMarkdown(now, owner);
    const encoded = Buffer.from(content).toString("base64");

    let sha: string | undefined;
    try {
      const existing = await octokit.rest.repos.getContent({
        owner,
        repo: "devvault-notes",
        path,
      });
      if (!Array.isArray(existing.data) && "sha" in existing.data) {
        sha = existing.data.sha;
      }
    } catch {
      // missing file is fine
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo: "devvault-notes",
      path,
      message: sha ? "Update welcome note" : "Add welcome note",
      content: encoded,
      ...(sha ? { sha } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed onboarding setup" },
      { status: error.status || 500 }
    );
  }
}

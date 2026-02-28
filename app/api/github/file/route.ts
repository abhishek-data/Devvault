import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Octokit } from "@octokit/rest";
import { noteToMarkdown } from "@/lib/sync/markdown";
import type { Note } from "@/lib/types";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const octokit = new Octokit({ auth: (session as any).accessToken });

    try {
        const body = await request.json();
        const { note, action } = body as { note: Note; action: "create" | "update" | "delete" };

        const user = await octokit.rest.users.getAuthenticated();
        const owner = user.data.login;
        const path = `notes/${note.id}.md`;

        if (action === "delete") {
            if (!note.githubSha) {
                return NextResponse.json({ error: "No SHA for delete" }, { status: 400 });
            }
            await octokit.rest.repos.deleteFile({
                owner,
                repo: "devvault-notes",
                path,
                message: `Delete ${note.title}`,
                sha: note.githubSha,
            });
            return NextResponse.json({ deleted: true });
        }

        const content = noteToMarkdown(note);
        const encoded = Buffer.from(content).toString("base64");

        if (action === "create") {
            const res = await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo: "devvault-notes",
                path,
                message: `Add ${note.title}`,
                content: encoded,
            });
            return NextResponse.json({
                sha: res.data.content?.sha,
            });
        }

        if (action === "update") {
            // Try to get current SHA if not provided
            let sha = note.githubSha;
            if (!sha) {
                try {
                    const existing = await octokit.rest.repos.getContent({
                        owner,
                        repo: "devvault-notes",
                        path,
                    });
                    if ("sha" in existing.data) {
                        sha = existing.data.sha;
                    }
                } catch {
                    // File doesn't exist, create instead
                    const res = await octokit.rest.repos.createOrUpdateFileContents({
                        owner,
                        repo: "devvault-notes",
                        path,
                        message: `Add ${note.title}`,
                        content: encoded,
                    });
                    return NextResponse.json({ sha: res.data.content?.sha });
                }
            }

            const res = await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo: "devvault-notes",
                path,
                message: `Update ${note.title}`,
                content: encoded,
                sha,
            });
            return NextResponse.json({
                sha: res.data.content?.sha,
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        const status = error.status || 500;
        return NextResponse.json(
            { error: error.message || "GitHub API error" },
            { status }
        );
    }
}

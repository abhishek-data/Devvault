import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Octokit } from "@octokit/rest";
import { noteToMarkdown } from "@/lib/sync/markdown";
import type { Note } from "@/lib/types";

async function ensureRepoExists(octokit: Octokit, owner: string) {
    try {
        await octokit.rest.repos.get({ owner, repo: "devvault-notes" });
    } catch {
        // Repo doesn't exist — create it
        await octokit.rest.repos.createForAuthenticatedUser({
            name: "devvault-notes",
            description: "DevVault — Developer Knowledge OS synced notes",
            private: true,
            auto_init: true,
        });
        // Small delay to allow GitHub to initialize the repo
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const octokit = new Octokit({ auth: (session as any).accessToken });

    try {
        const body = await request.json();
        const { note, action } = body as {
            note: Note;
            action: "create" | "update" | "delete";
        };

        const user = await octokit.rest.users.getAuthenticated();
        const owner = user.data.login;

        // Auto-create repo if it doesn't exist
        await ensureRepoExists(octokit, owner);

        const path = `notes/${note.id}.md`;

        if (action === "delete") {
            try {
                // Get the latest SHA in case local is stale
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
                        // File doesn't exist on GitHub — already deleted
                        return NextResponse.json({ deleted: true });
                    }
                }

                await octokit.rest.repos.deleteFile({
                    owner,
                    repo: "devvault-notes",
                    path,
                    message: `Delete ${note.title}`,
                    sha: sha!,
                });
            } catch (deleteError: any) {
                if (deleteError.status === 404 || deleteError.status === 409) {
                    // File already gone or SHA mismatch — try with fresh SHA
                    try {
                        const existing = await octokit.rest.repos.getContent({
                            owner,
                            repo: "devvault-notes",
                            path,
                        });
                        if ("sha" in existing.data) {
                            await octokit.rest.repos.deleteFile({
                                owner,
                                repo: "devvault-notes",
                                path,
                                message: `Delete ${note.title}`,
                                sha: existing.data.sha,
                            });
                        }
                    } catch {
                        // File truly doesn't exist — that's fine
                    }
                } else {
                    throw deleteError;
                }
            }
            return NextResponse.json({ deleted: true });
        }

        const content = noteToMarkdown(note);
        const encoded = Buffer.from(content).toString("base64");

        // For both create and update, try to get existing SHA first
        let sha: string | undefined = note.githubSha;

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
                // File doesn't exist yet — that's fine, create without SHA
            }
        }

        const res = await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo: "devvault-notes",
            path,
            message: sha ? `Update ${note.title}` : `Add ${note.title}`,
            content: encoded,
            ...(sha ? { sha } : {}),
        });

        return NextResponse.json({
            sha: res.data.content?.sha,
        });
    } catch (error: any) {
        const status = error.status || 500;
        return NextResponse.json(
            { error: error.message || "GitHub API error" },
            { status }
        );
    }
}

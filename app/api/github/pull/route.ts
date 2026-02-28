import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Octokit } from "@octokit/rest";
import { markdownToNote } from "@/lib/sync/markdown";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const octokit = new Octokit({ auth: (session as any).accessToken });

    try {
        const user = await octokit.rest.users.getAuthenticated();
        const owner = user.data.login;

        // Get the contents of the notes directory
        let files: any[];
        try {
            const res = await octokit.rest.repos.getContent({
                owner,
                repo: "devvault-notes",
                path: "notes",
            });
            files = Array.isArray(res.data) ? res.data : [];
        } catch {
            // Notes directory doesn't exist yet
            return NextResponse.json([]);
        }

        const notes = [];
        for (const file of files) {
            if (file.name.endsWith(".md") && file.type === "file") {
                const content = await octokit.rest.repos.getContent({
                    owner,
                    repo: "devvault-notes",
                    path: file.path,
                });

                if ("content" in content.data && typeof content.data.content === "string") {
                    const decoded = Buffer.from(content.data.content, "base64").toString("utf-8");
                    const note = markdownToNote(decoded, content.data.sha);
                    notes.push(note);
                }
            }
        }

        return NextResponse.json(notes);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to pull notes" },
            { status: error.status || 500 }
        );
    }
}

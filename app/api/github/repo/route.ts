import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Octokit } from "@octokit/rest";

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const octokit = new Octokit({ auth: (session as any).accessToken });

    try {
        // Check if repo exists
        const user = await octokit.rest.users.getAuthenticated();
        const username = user.data.login;

        try {
            await octokit.rest.repos.get({
                owner: username,
                repo: "devvault-notes",
            });
            return NextResponse.json({ exists: true, owner: username });
        } catch {
            // Create repo
            await octokit.rest.repos.createForAuthenticatedUser({
                name: "devvault-notes",
                description: "DevVault — Developer Knowledge OS synced notes",
                private: true,
                auto_init: true,
            });
            return NextResponse.json({ created: true, owner: username });
        }
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to manage repo" },
            { status: error.status || 500 }
        );
    }
}

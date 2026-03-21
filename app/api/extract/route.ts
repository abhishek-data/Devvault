import { NextRequest, NextResponse } from "next/server";

interface ExtractedMeta {
    url: string;
    title: string;
    description: string;
    image: string;
    domain: string;
    favicon: string;
    contentType: "article" | "youtube" | "github" | "tweet" | "generic";
}

function detectContentType(url: string): ExtractedMeta["contentType"] {
    const host = new URL(url).hostname.replace("www.", "");
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("github.com")) return "github";
    if (host.includes("twitter.com") || host.includes("x.com")) return "tweet";
    return "generic";
}

function extractYouTubeId(url: string): string | null {
    const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match?.[1] || null;
}

export async function POST(request: NextRequest) {
    try {
        const { url } = (await request.json()) as { url: string };

        if (!url || typeof url !== "string") {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Validate URL
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url);
        } catch {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }

        const domain = parsedUrl.hostname.replace("www.", "");
        const contentType = detectContentType(url);
        const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

        // For YouTube, use oEmbed (no API key needed)
        if (contentType === "youtube") {
            const videoId = extractYouTubeId(url);
            try {
                const oembedRes = await fetch(
                    `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
                    { signal: AbortSignal.timeout(5000) }
                );
                if (oembedRes.ok) {
                    const data = await oembedRes.json();
                    return NextResponse.json({
                        url,
                        title: data.title || "YouTube Video",
                        description: data.author_name ? `By ${data.author_name}` : "",
                        image: videoId
                            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                            : data.thumbnail_url || "",
                        domain,
                        favicon,
                        contentType,
                    } satisfies ExtractedMeta);
                }
            } catch {
                // Fall through to HTML parsing
            }
        }

        // Fetch the page HTML and extract OG tags
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        let html: string;
        try {
            const res = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; DevVault/1.0; +https://mydevvault.vercel.app)",
                    Accept: "text/html,application/xhtml+xml",
                },
                signal: controller.signal,
                redirect: "follow",
            });
            clearTimeout(timeout);

            if (!res.ok) {
                return NextResponse.json({
                    url,
                    title: domain,
                    description: "",
                    image: "",
                    domain,
                    favicon,
                    contentType,
                } satisfies ExtractedMeta);
            }

            // Only read first 50KB to avoid huge payloads
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";
            if (reader) {
                while (accumulated.length < 50000) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    accumulated += decoder.decode(value, { stream: true });
                }
                reader.cancel();
            }
            html = accumulated;
        } catch {
            clearTimeout(timeout);
            return NextResponse.json({
                url,
                title: domain,
                description: "",
                image: "",
                domain,
                favicon,
                contentType,
            } satisfies ExtractedMeta);
        }

        // Parse meta tags from HTML
        const getMetaContent = (html: string, property: string): string => {
            // Match property="..." or name="..."
            const regex = new RegExp(
                `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']|<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
                "i"
            );
            const match = html.match(regex);
            return match?.[1] || match?.[2] || "";
        };

        const getTitle = (html: string): string => {
            const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
            return match?.[1]?.trim() || "";
        };

        const title =
            getMetaContent(html, "og:title") ||
            getMetaContent(html, "twitter:title") ||
            getTitle(html) ||
            domain;

        const description =
            getMetaContent(html, "og:description") ||
            getMetaContent(html, "twitter:description") ||
            getMetaContent(html, "description");

        let image =
            getMetaContent(html, "og:image") ||
            getMetaContent(html, "twitter:image");

        // Make relative image URLs absolute
        if (image && !image.startsWith("http")) {
            image = new URL(image, url).href;
        }

        // Detect article if it has article tags
        const finalContentType =
            contentType === "generic" && html.includes("og:type") && html.includes("article")
                ? "article"
                : contentType;

        return NextResponse.json({
            url,
            title: decodeHTMLEntities(title),
            description: decodeHTMLEntities(description),
            image,
            domain,
            favicon,
            contentType: finalContentType,
        } satisfies ExtractedMeta);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to extract metadata" },
            { status: 500 }
        );
    }
}

function decodeHTMLEntities(text: string): string {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/");
}

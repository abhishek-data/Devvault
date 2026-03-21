import { useState } from "react";
import { useDevVaultStore } from "@/lib/store";

interface SummarizeResult {
    summary: string;
    keyPoints: string[];
    suggestedTags: string[];
}

export function useSummarize() {
    const { aiApiKey, aiProvider } = useDevVaultStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isConfigured = !!aiApiKey;

    const summarizeContent = async (content: string): Promise<SummarizeResult | null> => {
        if (!aiApiKey) {
            setError("No API key configured. Add one in Settings.");
            return null;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/ai/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, provider: aiProvider, apiKey: aiApiKey }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Summarization failed");
            }

            return await res.json();
        } catch (err: any) {
            setError(err.message || "Summarization failed");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const summarizeUrl = async (url: string): Promise<SummarizeResult | null> => {
        if (!aiApiKey) {
            setError("No API key configured. Add one in Settings.");
            return null;
        }

        setLoading(true);
        setError("");

        try {
            // Check if YouTube — fetch transcript first
            const isYouTube = /youtube\.com|youtu\.be/.test(url);

            let content: string;

            if (isYouTube) {
                const transcriptRes = await fetch("/api/ai/transcript", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url }),
                });

                if (transcriptRes.ok) {
                    const data = await transcriptRes.json();
                    content = `YouTube Video Transcript:\n\n${data.transcript}`;
                } else {
                    // Fallback to just URL metadata
                    content = `YouTube video at: ${url} (no transcript available)`;
                }
            } else {
                // Fetch page content for non-YouTube URLs
                const extractRes = await fetch("/api/extract", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url }),
                });

                if (extractRes.ok) {
                    const meta = await extractRes.json();
                    content = `URL: ${url}\nTitle: ${meta.title}\nDescription: ${meta.description}\n\nPlease summarize what this page is about based on the title and description.`;
                } else {
                    content = `URL: ${url}`;
                }
            }

            return await summarizeContent(content);
        } catch (err: any) {
            setError(err.message || "Summarization failed");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { summarizeContent, summarizeUrl, loading, error, isConfigured };
}

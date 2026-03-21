import { NextRequest, NextResponse } from "next/server";

interface SummarizeRequest {
    content: string;
    url?: string;
    contentType?: string;
    provider: "gemini" | "openai";
    apiKey: string;
}

interface SummarizeResponse {
    summary: string;
    keyPoints: string[];
    suggestedTags: string[];
}

const SYSTEM_PROMPT = `You are a helpful assistant that summarizes content for developers.
Given the content, produce a structured summary in this exact JSON format:
{
  "summary": "A concise 2-3 sentence TL;DR of the content",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "...up to 5 points"],
  "suggestedTags": ["tag1", "tag2", "tag3"]
}
Rules:
- Keep the summary under 100 words
- Key points should be actionable or factual, not vague
- Suggest 2-4 lowercase tags relevant to the content (e.g. "react", "debugging", "api-design")
- Return ONLY the JSON, no markdown fencing, no extra text`;

async function callGemini(apiKey: string, content: string): Promise<SummarizeResponse> {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: SYSTEM_PROMPT },
                            { text: `Content to summarize:\n\n${content.slice(0, 30000)}` },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1024,
                },
            }),
        }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return parseAiResponse(text);
}

async function callOpenAI(apiKey: string, content: string): Promise<SummarizeResponse> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Content to summarize:\n\n${content.slice(0, 30000)}` },
            ],
            temperature: 0.3,
            max_tokens: 1024,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenAI API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    return parseAiResponse(text);
}

function parseAiResponse(text: string): SummarizeResponse {
    // Strip markdown fencing if present
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    try {
        const parsed = JSON.parse(cleaned);
        return {
            summary: parsed.summary || "",
            keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
            suggestedTags: Array.isArray(parsed.suggestedTags)
                ? parsed.suggestedTags.map((t: string) => t.toLowerCase().trim())
                : [],
        };
    } catch {
        // If JSON parsing fails, treat the whole text as a summary
        return {
            summary: text.slice(0, 500),
            keyPoints: [],
            suggestedTags: [],
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as SummarizeRequest;
        const { content, provider, apiKey } = body;

        if (!content || !apiKey) {
            return NextResponse.json(
                { error: "Content and API key are required" },
                { status: 400 }
            );
        }

        let result: SummarizeResponse;

        if (provider === "openai") {
            result = await callOpenAI(apiKey, content);
        } else {
            result = await callGemini(apiKey, content);
        }

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "AI summarization failed" },
            { status: 500 }
        );
    }
}

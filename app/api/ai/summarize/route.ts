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

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

const SYSTEM_PROMPT = `You are a helpful assistant that summarizes content for developers.
Given the content, produce a structured summary as JSON with these fields:
- "summary": A concise 2-3 sentence TL;DR (under 100 words)
- "keyPoints": Array of 3-5 actionable or factual key points
- "suggestedTags": Array of 2-4 lowercase tags relevant to the content (e.g. "react", "debugging", "api-design")`;

async function callGemini(apiKey: string, content: string): Promise<SummarizeResponse> {
    const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: `Content to summarize:\n\n${content.slice(0, 30000)}` },
                    ],
                },
            ],
            systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }],
            },
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1024,
                responseMimeType: "application/json",
            },
        }),
    });

    if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        let errorMessage: string;
        try {
            const err = JSON.parse(errorText);
            errorMessage = err.error?.message || `Gemini API error: ${res.status}`;
        } catch {
            errorMessage = `Gemini API error: ${res.status} — ${errorText.slice(0, 200)}`;
        }
        throw new Error(errorMessage);
    }

    const data = await res.json();

    if (data.error) {
        throw new Error(data.error.message || "Gemini API returned an error");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error("No text in Gemini response");
    }

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

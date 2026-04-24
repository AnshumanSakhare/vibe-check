import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { model, prompt, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!model || !prompt) {
      return NextResponse.json(
        { error: "Model and prompt are required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert frontend developer. You create beautiful, modern, responsive UI components using HTML, CSS, and JavaScript. 
When asked to build a UI, respond ONLY with a complete, self-contained HTML file that includes all styles and scripts inline.
Use modern CSS features, beautiful gradients, smooth animations, and professional design patterns.
The HTML should be a complete document with <!DOCTYPE html>, <html>, <head>, and <body> tags.
Make the design visually stunning with attention to typography, spacing, colors, and micro-interactions.
Do NOT include any explanation, markdown, or code fences - ONLY output the raw HTML code.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vibe-check.app",
          "X-Title": "Vibe Check - AI UI Arena",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          max_tokens: 16000,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorData?.error?.message ||
            `OpenRouter API error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract HTML from the response (handle cases where model wraps in code fences)
    let html = content;
    const htmlMatch = content.match(/```(?:html)?\s*\n?([\s\S]*?)```/);
    if (htmlMatch) {
      html = htmlMatch[1].trim();
    }

    return NextResponse.json({
      html,
      model: data.model,
      usage: data.usage,
    });
  } catch (error: unknown) {
    console.error("Generate error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export interface OpenRouterModel {
  id: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider: {
    max_completion_tokens: number;
  };
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type: string | null;
  };
}

// Curated list of known good models for UI generation
const FEATURED_MODELS = [
  "anthropic/claude-sonnet-4",
  "anthropic/claude-opus-4",
  "google/gemini-2.5-pro-preview",
  "google/gemini-2.5-flash-preview",
  "openai/gpt-4.1",
  "openai/gpt-4.1-mini",
  "openai/gpt-4.1-nano",
  "openai/o4-mini",
  "deepseek/deepseek-v4-pro",
  "deepseek/deepseek-v4-flash",
  "deepseek/deepseek-chat-v3-0324",
  "deepseek/deepseek-r1",
  "meta-llama/llama-4-maverick",
  "meta-llama/llama-4-scout",
  "x-ai/grok-3-beta",
  "x-ai/grok-3-mini-beta",
  "qwen/qwen-2.5-coder-32b-instruct",
  "qwen/qwen3-235b-a22b",
  "mistralai/mistral-large-2411",
  "amazon/nova-pro-v1",
];

export async function GET() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    const allModels: OpenRouterModel[] = data.data || [];

    // Filter to text models and sort by featured status, then by creation date
    const textModels = allModels
      .filter(
        (m: OpenRouterModel) =>
          m.architecture?.modality?.includes("text") &&
          !m.id.includes("free") &&
          !m.id.includes("extended")
      )
      .map((m: OpenRouterModel) => ({
        id: m.id,
        name: m.name,
        created: m.created,
        contextLength: m.context_length,
        isFeatured: FEATURED_MODELS.includes(m.id),
        pricing: {
          prompt: m.pricing?.prompt || "0",
          completion: m.pricing?.completion || "0",
        },
        provider: m.id.split("/")[0],
      }))
      .sort((a: { isFeatured: boolean; created: number }, b: { isFeatured: boolean; created: number }) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.created - a.created;
      });

    return NextResponse.json({ models: textModels });
  } catch (error: unknown) {
    console.error("Models fetch error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch models";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

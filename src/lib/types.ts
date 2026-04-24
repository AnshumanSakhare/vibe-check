export interface ModelInfo {
  id: string;
  name: string;
  created: number;
  contextLength: number;
  isFeatured: boolean;
  pricing: {
    prompt: string;
    completion: string;
  };
  provider: string;
}

export interface GenerationResult {
  modelId: string;
  modelName: string;
  html: string;
  status: "idle" | "generating" | "complete" | "error";
  error?: string;
  startTime?: number;
  endTime?: number;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "#d97706",
  google: "#3b82f6",
  openai: "#10b981",
  "meta-llama": "#8b5cf6",
  deepseek: "#06b6d4",
  mistralai: "#f97316",
  "x-ai": "#ef4444",
  qwen: "#ec4899",
  amazon: "#f59e0b",
  cohere: "#6366f1",
  default: "#6b7280",
};

export const PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Anthropic",
  google: "Google",
  openai: "OpenAI",
  "meta-llama": "Meta",
  deepseek: "DeepSeek",
  mistralai: "Mistral",
  "x-ai": "xAI",
  qwen: "Qwen",
  amazon: "Amazon",
  cohere: "Cohere",
};

export const SAMPLE_PROMPTS = [
  "Build a sleek dark-mode pricing page with 3 tiers (Free, Pro, Enterprise) with hover animations and a toggle for monthly/yearly billing",
  "Create a modern dashboard with analytics charts, a sidebar navigation, user avatar, and notification bell with a badge count",
  "Design a beautiful landing page hero section for an AI startup with animated gradient background and floating 3D elements",
  "Build a social media profile card with avatar, follower stats, bio section, and a grid of recent posts thumbnails",
  "Create an e-commerce product page with image carousel, color/size selectors, add to cart button, and customer reviews section",
  "Design a music player interface with album art, playback controls, progress bar, volume slider, and a playlist sidebar",
  "Build a weather app interface showing current conditions, 7-day forecast, and animated weather icons",
  "Create a chat interface with message bubbles, typing indicator, emoji picker, and file attachment support",
];

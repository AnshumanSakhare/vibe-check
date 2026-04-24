"use client";

import { useState, useEffect, useCallback } from "react";
import ModelSelector from "@/components/ModelSelector";
import PreviewPanel from "@/components/PreviewPanel";
import {
  ModelInfo,
  GenerationResult,
  SAMPLE_PROMPTS,
  PROVIDER_COLORS,
  PROVIDER_LABELS,
} from "@/lib/types";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  // Load API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("openrouter-api-key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("openrouter-api-key", apiKey);
    }
  }, [apiKey]);

  // Fetch models
  useEffect(() => {
    async function fetchModels() {
      try {
        setModelsLoading(true);
        const res = await fetch("/api/models");
        const data = await res.json();
        if (data.models) {
          setModels(data.models);
        }
      } catch (err) {
        console.error("Failed to fetch models:", err);
      } finally {
        setModelsLoading(false);
      }
    }
    fetchModels();
  }, []);

  const handleToggleModel = useCallback(
    (modelId: string) => {
      setSelectedModels((prev) => {
        if (prev.includes(modelId)) {
          return prev.filter((id) => id !== modelId);
        }
        if (prev.length >= 4) return prev;
        return [...prev, modelId];
      });
    },
    []
  );

  const generateAll = useCallback(async () => {
    if (!apiKey || selectedModels.length === 0 || !prompt.trim()) return;

    setIsGenerating(true);
    setShowSettings(false);

    // Initialize results
    const initialResults: GenerationResult[] = selectedModels.map((modelId) => {
      const model = models.find((m) => m.id === modelId);
      return {
        modelId,
        modelName: model?.name || modelId,
        html: "",
        status: "generating",
        startTime: Date.now(),
      };
    });
    setResults(initialResults);

    // Fire all API calls concurrently
    const promises = selectedModels.map(async (modelId, index) => {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: modelId,
            prompt: prompt.trim(),
            apiKey,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setResults((prev) =>
            prev.map((r, i) =>
              i === index
                ? {
                    ...r,
                    status: "error" as const,
                    error: data.error || "Unknown error",
                    endTime: Date.now(),
                  }
                : r
            )
          );
          return;
        }

        setResults((prev) =>
          prev.map((r, i) =>
            i === index
              ? {
                  ...r,
                  status: "complete" as const,
                  html: data.html,
                  endTime: Date.now(),
                  usage: data.usage,
                }
              : r
          )
        );
      } catch (err) {
        setResults((prev) =>
          prev.map((r, i) =>
            i === index
              ? {
                  ...r,
                  status: "error" as const,
                  error: err instanceof Error ? err.message : "Network error",
                  endTime: Date.now(),
                }
              : r
          )
        );
      }
    });

    await Promise.allSettled(promises);
    setIsGenerating(false);
  }, [apiKey, selectedModels, prompt, models]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      generateAll();
    }
  };

  const randomPrompt = () => {
    const random =
      SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    setPrompt(random);
  };

  const panelCount = results.length || selectedModels.length;
  const gridClass =
    panelCount <= 2
      ? "panels-2"
      : panelCount <= 3
      ? "panels-3"
      : "panels-4";

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "1600px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 800,
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
              }}
            >
              ⚡
            </div>
            <div>
              <h1
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                <span className="gradient-text">Vibe Check</span>
              </h1>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginTop: "-1px",
                }}
              >
                AI UI Comparison Arena
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className="btn-secondary"
              onClick={() => setShowSettings(!showSettings)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                fontSize: "13px",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              {showSettings ? "Hide" : "Config"}
            </button>

            {isGenerating && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div
                  className="animate-spin"
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid var(--border-primary)",
                    borderTopColor: "var(--accent-purple)",
                    borderRadius: "50%",
                  }}
                />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Generating...
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="app-main" style={{ maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
        {/* Settings Panel */}
        {showSettings && (
          <div className="settings-panel fade-in">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {/* Left: API Key + Models */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* API Key */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    OpenRouter API Key
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="input-field"
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-or-v1-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      style={{ paddingRight: "40px" }}
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                    >
                      {showApiKey ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      color: "var(--accent-purple-light)",
                      marginTop: "4px",
                      textDecoration: "none",
                    }}
                  >
                    Get your API key →
                  </a>
                </div>

                {/* Models */}
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Models
                    <span className="tag">Select up to 4</span>
                  </label>
                  <ModelSelector
                    models={models}
                    selectedModels={selectedModels}
                    onToggleModel={handleToggleModel}
                    maxSelections={4}
                    isLoading={modelsLoading}
                  />
                </div>

                {/* Quick model picks */}
                {selectedModels.length === 0 && !modelsLoading && (
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      Quick picks:
                    </span>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {[
                        "anthropic/claude-sonnet-4",
                        "google/gemini-2.5-pro-preview",
                        "openai/gpt-4.1",
                        "deepseek/deepseek-v4-pro",
                      ].map((id) => {
                        const model = models.find((m) => m.id === id);
                        if (!model) return null;
                        return (
                          <button
                            key={id}
                            className="model-chip"
                            onClick={() => handleToggleModel(id)}
                            style={{ fontSize: "11px", padding: "5px 10px" }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background:
                                  PROVIDER_COLORS[model.provider] ||
                                  PROVIDER_COLORS.default,
                              }}
                            />
                            {model.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Prompt */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Prompt
                  </label>
                  <button
                    onClick={randomPrompt}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent-purple-light)",
                      fontSize: "11px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 3 21 3 21 8" />
                      <line x1="4" y1="20" x2="21" y2="3" />
                      <polyline points="21 16 21 21 16 21" />
                      <line x1="15" y1="15" x2="21" y2="21" />
                      <line x1="4" y1="4" x2="9" y2="9" />
                    </svg>
                    Random prompt
                  </button>
                </div>

                <textarea
                  className="prompt-textarea"
                  placeholder="Describe the UI you want to build... e.g., 'Build a modern pricing page with 3 tiers'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={4}
                  style={{ flex: 1, minHeight: "100px" }}
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                    }}
                  >
                    Ctrl + Enter to generate
                  </span>

                  <button
                    className="btn-primary"
                    onClick={generateAll}
                    disabled={
                      isGenerating ||
                      !apiKey ||
                      selectedModels.length === 0 ||
                      !prompt.trim()
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 28px",
                      fontSize: "14px",
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <div
                          className="animate-spin"
                          style={{
                            width: 14,
                            height: 14,
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "white",
                            borderRadius: "50%",
                          }}
                        />
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        Generate & Compare
                      </>
                    )}
                  </button>
                </div>

                {/* Sample prompt chips */}
                <div style={{ marginTop: "4px" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    {SAMPLE_PROMPTS.slice(0, 4).map((sp, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(sp)}
                        style={{
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-primary)",
                          borderRadius: "8px",
                          padding: "6px 10px",
                          fontSize: "11px",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s ease",
                          maxWidth: "50%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--border-accent)";
                          e.currentTarget.style.color = "var(--text-secondary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--border-primary)";
                          e.currentTarget.style.color = "var(--text-muted)";
                        }}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Area */}
        {results.length > 0 ? (
          <div style={{ flex: 1, minHeight: "500px" }}>
            {/* Prompt badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent-purple)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  &quot;{prompt}&quot;
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                  }}
                >
                  {results.filter((r) => r.status === "complete").length}/
                  {results.length} complete
                </span>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setResults([]);
                    setShowSettings(true);
                  }}
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                  New Comparison
                </button>
              </div>
            </div>

            {/* Grid of preview panels */}
            <div className={`comparison-grid ${gridClass}`} style={{ height: "calc(100vh - 200px)" }}>
              {results.map((result, i) => (
                <PreviewPanel key={`${result.modelId}-${i}`} result={result} />
              ))}
            </div>
          </div>
        ) : (
          /* Empty state */
          !showSettings && (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "400px",
              }}
            >
              <div style={{ textAlign: "center", maxWidth: "400px" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "16px",
                    background: "var(--gradient-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: "28px",
                    boxShadow: "0 0 40px rgba(139, 92, 246, 0.3)",
                  }}
                >
                  ⚡
                </div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  Ready to <span className="gradient-text">Vibe Check</span>
                </h2>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  Select models, write a prompt, and compare AI-generated UIs
                  side by side. Click Config to get started.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => setShowSettings(true)}
                  style={{ marginTop: "20px" }}
                >
                  Open Config
                </button>
              </div>
            </div>
          )
        )}

        {/* Empty state when settings is open but no results */}
        {showSettings && results.length === 0 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              borderRadius: "var(--radius-lg)",
              border: "1px dashed var(--border-primary)",
              background: "var(--gradient-card)",
            }}
          >
            <div style={{ textAlign: "center", maxWidth: "450px", padding: "40px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "20px",
                }}
              >
                {["anthropic", "google", "openai", "deepseek"].map((p) => (
                  <div
                    key={p}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      background: `${PROVIDER_COLORS[p]}15`,
                      border: `1px solid ${PROVIDER_COLORS[p]}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: PROVIDER_COLORS[p],
                    }}
                  >
                    {PROVIDER_LABELS[p]?.[0] || p[0].toUpperCase()}
                  </div>
                ))}
              </div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "var(--text-primary)",
                }}
              >
                Compare AI Models Head-to-Head
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >
                Select up to 4 models, describe the UI you want, and watch them
                compete. Perfect for finding which model builds the best
                interfaces.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

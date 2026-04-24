"use client";

import { useState, useRef, useEffect } from "react";
import { ModelInfo, PROVIDER_COLORS } from "@/lib/types";

interface ModelSelectorProps {
  models: ModelInfo[];
  selectedModels: string[];
  onToggleModel: (modelId: string) => void;
  maxSelections: number;
  isLoading: boolean;
}

export default function ModelSelector({
  models,
  selectedModels,
  onToggleModel,
  maxSelections,
  isLoading,
}: ModelSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const providers = Array.from(new Set(models.map((m) => m.provider)));

  const filteredModels = models.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase());
    const matchesProvider = activeProvider
      ? m.provider === activeProvider
      : true;
    return matchesSearch && matchesProvider;
  });

  const featuredModels = filteredModels.filter((m) => m.isFeatured);
  const otherModels = filteredModels.filter((m) => !m.isFeatured);

  const getProviderColor = (provider: string) =>
    PROVIDER_COLORS[provider] || PROVIDER_COLORS.default;

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {/* Selected models display */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {selectedModels.map((modelId) => {
          const model = models.find((m) => m.id === modelId);
          if (!model) return null;
          return (
            <div
              key={modelId}
              className="model-chip selected"
              onClick={() => onToggleModel(modelId)}
              title="Click to remove"
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: getProviderColor(model.provider),
                  flexShrink: 0,
                }}
              />
              <span>{model.name}</span>
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          );
        })}

        {selectedModels.length < maxSelections && (
          <button
            className="model-chip"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              border: "1px dashed var(--border-accent)",
              background: "transparent",
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>
              Add Model ({selectedModels.length}/{maxSelections})
            </span>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="dropdown-menu fade-in" style={{ minWidth: "360px" }}>
          {/* Search */}
          <div style={{ padding: "8px 8px 4px" }}>
            <input
              className="input-field"
              type="text"
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              style={{ fontSize: "13px", padding: "8px 12px" }}
            />
          </div>

          {/* Provider filter chips */}
          <div
            style={{
              padding: "8px",
              display: "flex",
              gap: "4px",
              flexWrap: "wrap",
            }}
          >
            <button
              className={`tab-btn ${activeProvider === null ? "active" : ""}`}
              onClick={() => setActiveProvider(null)}
              style={{ fontSize: "11px", padding: "4px 8px" }}
            >
              All
            </button>
            {providers.slice(0, 8).map((p) => (
              <button
                key={p}
                className={`tab-btn ${activeProvider === p ? "active" : ""}`}
                onClick={() =>
                  setActiveProvider(activeProvider === p ? null : p)
                }
                style={{ fontSize: "11px", padding: "4px 8px" }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: getProviderColor(p),
                    marginRight: 4,
                  }}
                />
                {p.split("/")[0]}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              <div
                className="animate-spin"
                style={{
                  width: 20,
                  height: 20,
                  border: "2px solid var(--border-primary)",
                  borderTopColor: "var(--accent-purple)",
                  borderRadius: "50%",
                  margin: "0 auto 8px",
                }}
              />
              Loading models...
            </div>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {featuredModels.length > 0 && (
                <>
                  <div
                    style={{
                      padding: "8px 12px 4px",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    ⭐ Featured Models
                  </div>
                  {featuredModels.map((model) => (
                    <button
                      key={model.id}
                      className={`dropdown-item ${
                        selectedModels.includes(model.id) ? "selected" : ""
                      }`}
                      onClick={() => {
                        onToggleModel(model.id);
                        if (
                          selectedModels.length >= maxSelections - 1 &&
                          !selectedModels.includes(model.id)
                        ) {
                          setIsOpen(false);
                        }
                      }}
                      disabled={
                        selectedModels.length >= maxSelections &&
                        !selectedModels.includes(model.id)
                      }
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: getProviderColor(model.provider),
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 500,
                            color: selectedModels.includes(model.id)
                              ? "var(--accent-purple-light)"
                              : "var(--text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {model.name}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            marginTop: 2,
                          }}
                        >
                          {model.id}
                        </div>
                      </div>
                      {selectedModels.includes(model.id) && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--accent-green)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </>
              )}

              {otherModels.length > 0 && (
                <>
                  <div
                    style={{
                      padding: "8px 12px 4px",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    All Models
                  </div>
                  {otherModels.slice(0, 50).map((model) => (
                    <button
                      key={model.id}
                      className={`dropdown-item ${
                        selectedModels.includes(model.id) ? "selected" : ""
                      }`}
                      onClick={() => {
                        onToggleModel(model.id);
                        if (
                          selectedModels.length >= maxSelections - 1 &&
                          !selectedModels.includes(model.id)
                        ) {
                          setIsOpen(false);
                        }
                      }}
                      disabled={
                        selectedModels.length >= maxSelections &&
                        !selectedModels.includes(model.id)
                      }
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: getProviderColor(model.provider),
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 500,
                            color: selectedModels.includes(model.id)
                              ? "var(--accent-purple-light)"
                              : "var(--text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {model.name}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            marginTop: 2,
                          }}
                        >
                          {model.id}
                        </div>
                      </div>
                      {selectedModels.includes(model.id) && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--accent-green)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </>
              )}

              {filteredModels.length === 0 && (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "13px",
                  }}
                >
                  No models found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

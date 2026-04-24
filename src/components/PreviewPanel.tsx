"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GenerationResult, PROVIDER_COLORS } from "@/lib/types";

interface PreviewPanelProps {
  result: GenerationResult;
}

export default function PreviewPanel({ result }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (result.status === "generating" && result.startTime) {
      const interval = setInterval(() => {
        setElapsed(Date.now() - result.startTime!);
      }, 100);
      return () => clearInterval(interval);
    }
    if (result.status === "complete" && result.startTime && result.endTime) {
      setElapsed(result.endTime - result.startTime);
    }
  }, [result.status, result.startTime, result.endTime]);

  const writeToIframe = useCallback(() => {
    if (iframeRef.current && result.html) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(result.html);
        doc.close();
      }
    }
  }, [result.html]);

  useEffect(() => {
    if (activeTab === "preview" && result.html) {
      // Small delay to ensure iframe is mounted
      const timer = setTimeout(writeToIframe, 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab, result.html, writeToIframe]);

  const handleCopy = async () => {
    if (result.html) {
      await navigator.clipboard.writeText(result.html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenInNewTab = () => {
    if (result.html) {
      const blob = new Blob([result.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, "_blank");
      // Revoke the blob URL after a delay to allow the page to load
      if (newWindow) {
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    }
  };

  const formatTime = (ms: number) => {
    const seconds = ms / 1000;
    return seconds < 1 ? `${ms}ms` : `${seconds.toFixed(1)}s`;
  };

  const providerColor =
    PROVIDER_COLORS[result.modelId.split("/")[0]] || PROVIDER_COLORS.default;

  const getStatusContent = () => {
    switch (result.status) {
      case "generating":
        return (
          <span className="status-badge generating">
            <span className="pulse-dot" style={{ background: providerColor }} />
            Generating
          </span>
        );
      case "complete":
        return (
          <span className="status-badge complete">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Done
          </span>
        );
      case "error":
        return (
          <span className="status-badge error">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Error
          </span>
        );
      default:
        return (
          <span className="status-badge" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
            Idle
          </span>
        );
    }
  };

  return (
    <div className="preview-panel fade-in">
      {/* Header */}
      <div className="preview-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: providerColor,
              flexShrink: 0,
              boxShadow: `0 0 10px ${providerColor}50`,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: "13px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {result.modelName}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {result.modelId}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {elapsed > 0 && (
            <span className="timer">{formatTime(elapsed)}</span>
          )}
          {getStatusContent()}
        </div>
      </div>

      {/* Tabs */}
      {result.status === "complete" && result.html && (
        <div className="panel-tab-bar">
          <div className="tab-group">
            <button
              className={`tab-btn ${activeTab === "preview" ? "active" : ""}`}
              onClick={() => setActiveTab("preview")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              </svg>
              Preview
            </button>
            <button
              className={`tab-btn ${activeTab === "code" ? "active" : ""}`}
              onClick={() => setActiveTab("code")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              Code
            </button>
          </div>

          <div className="action-group">
            <button
              className="open-tab-btn"
              onClick={handleOpenInNewTab}
              title="Open preview in a new browser tab"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open in Tab
            </button>
            <button className="copy-btn" onClick={handleCopy}>
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy HTML
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {result.status === "idle" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: "200px",
              color: "var(--text-muted)",
              fontSize: "14px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--border-accent)" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block", opacity: 0.5 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              Waiting for generation...
            </div>
          </div>
        )}

        {result.status === "generating" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: "200px",
              padding: "20px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: `3px solid var(--border-primary)`,
                  borderTopColor: providerColor,
                  borderRadius: "50%",
                  margin: "0 auto 16px",
                }}
                className="animate-spin"
              />
              <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>
                Generating UI...
              </div>
              <div className="timer" style={{ marginTop: 4 }}>
                {formatTime(elapsed)}
              </div>
            </div>
          </div>
        )}

        {result.status === "error" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: "200px",
              padding: "20px",
            }}
          >
            <div style={{ textAlign: "center", maxWidth: 300 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block" }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div style={{ color: "var(--accent-red)", fontSize: "14px", fontWeight: 500, marginBottom: 4 }}>
                Generation Failed
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                {result.error}
              </div>
            </div>
          </div>
        )}

        {result.status === "complete" && result.html && (
          <>
            {activeTab === "preview" && (
              <div className="preview-content" style={{ height: "100%" }}>
                <iframe
                  ref={iframeRef}
                  sandbox="allow-scripts allow-same-origin"
                  title={`Preview: ${result.modelName}`}
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              </div>
            )}
            {activeTab === "code" && (
              <div className="code-view" style={{ height: "100%", overflow: "auto" }}>
                {result.html}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer with usage stats */}
      {result.status === "complete" && result.usage && (
        <div
          style={{
            padding: "8px 12px",
            borderTop: "1px solid var(--border-primary)",
            display: "flex",
            gap: "12px",
            fontSize: "11px",
            color: "var(--text-muted)",
            background: "var(--bg-secondary)",
          }}
        >
          <span>Prompt: {result.usage.prompt_tokens} tokens</span>
          <span>Completion: {result.usage.completion_tokens} tokens</span>
          <span>Total: {result.usage.total_tokens} tokens</span>
        </div>
      )}
    </div>
  );
}

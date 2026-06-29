import { h } from "preact";
import { colors, fonts } from "./theme.js";
import { t, type Locale } from "../i18n/index.js";
import { getContextState, clearSummary, type ContextState } from "../context-manager.js";
import { getMemories, clearMemories, deleteMemory } from "../memory.js";
import type { Oc } from "../types.js";

interface ContextViewerProps {
  isOpen: boolean;
  oc: Oc;
  locale?: Locale;
  onClose: () => void;
  onRefresh: () => void;
}

export function ContextViewer({ isOpen, oc, locale, onClose, onRefresh }: ContextViewerProps) {
  if (!isOpen) return null;

  const state = getContextState(oc, "");
  const memories = getMemories(oc);
  const usagePercent = Math.min(100, Math.round((state.totalTokens / state.maxTokens) * 100));
  const isOverBudget = state.totalTokens > state.maxTokens;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        background: "rgba(0,0,0,0.85)",
        zIndex: "1000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.bg,
          padding: "16px",
          maxWidth: "420px",
          width: "92%",
          maxHeight: "80vh",
          overflowY: "auto",
          border: `1px solid ${colors.border}`,
          fontFamily: fonts.mono,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{ margin: "0", color: colors.textSecondary, fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>
            {t("context.title", locale) || "context"}
          </h3>
          <span
            onClick={onClose}
            style={{ color: colors.textMuted, cursor: "pointer", fontSize: "11px" }}
          >
            [x]
          </span>
        </div>

        {/* Token Budget Bar */}
        <div style={{ marginBottom: "14px", padding: "10px 12px", background: colors.surface1, border: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ color: colors.textSecondary, fontSize: "10px" }}>
              {t("context.tokens", locale) || "tokens"}
            </span>
            <span style={{ color: isOverBudget ? colors.statusError : colors.textMuted, fontSize: "10px" }}>
              {state.totalTokens.toLocaleString()} / {state.maxTokens.toLocaleString()}
            </span>
          </div>
          <div style={{ width: "100%", height: "4px", background: colors.surface3, position: "relative" }}>
            <div style={{
              width: `${usagePercent}%`,
              height: "100%",
              background: isOverBudget ? colors.statusError : colors.textSecondary,
              transition: "width 0.3s",
            }} />
          </div>
        </div>

        {/* Summary */}
        <div style={{ marginBottom: "14px", padding: "10px 12px", background: colors.surface1, border: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ color: colors.textSecondary, fontSize: "10px" }}>
              {t("context.summary", locale) || "summary"} ({state.summaryTokens} {t("context.tokens", locale) || "tokens"})
            </span>
            {state.summary && (
              <span
                onClick={() => { clearSummary(oc); onRefresh(); }}
                style={{ color: colors.textMuted, cursor: "pointer", fontSize: "9px" }}
              >
                [clear]
              </span>
            )}
          </div>
          <div style={{ color: colors.textMuted, fontSize: "10px", lineHeight: "1.5" }}>
            {state.summary
              ? state.summary.length > 200
                ? state.summary.slice(0, 200) + "..."
                : state.summary
              : t("context.noSummary", locale) || "no summary yet — will be generated when conversation exceeds token budget"
            }
          </div>
        </div>

        {/* Recent Messages */}
        <div style={{ marginBottom: "14px", padding: "10px 12px", background: colors.surface1, border: `1px solid ${colors.border}` }}>
          <div style={{ color: colors.textSecondary, fontSize: "10px", marginBottom: "6px" }}>
            {t("context.messages", locale) || "messages"} ({state.recentMessages.length})
          </div>
          <div style={{ maxHeight: "150px", overflowY: "auto" }}>
            {state.recentMessages.map((msg, i) => (
              <div key={i} style={{ marginBottom: "4px", fontSize: "9px" }}>
                <span style={{ color: msg.role === "user" ? colors.text : colors.textSecondary }}>
                  {msg.role === "user" ? "You" : "Agent"}:
                </span>{" "}
                <span style={{ color: colors.textMuted }}>
                  {msg.content.length > 80 ? msg.content.slice(0, 80) + "..." : msg.content}
                </span>
              </div>
            ))}
            {state.recentMessages.length === 0 && (
              <div style={{ color: colors.textMuted, fontSize: "9px" }}>
                {t("context.noMessages", locale) || "no messages yet"}
              </div>
            )}
          </div>
        </div>

        {/* Memories */}
        <div style={{ padding: "10px 12px", background: colors.surface1, border: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ color: colors.textSecondary, fontSize: "10px" }}>
              {t("context.memories", locale) || "memories"} ({memories.length})
            </span>
            {memories.length > 0 && (
              <span
                onClick={() => { clearMemories(oc); onRefresh(); }}
                style={{ color: colors.textMuted, cursor: "pointer", fontSize: "9px" }}
              >
                [clear all]
              </span>
            )}
          </div>
          <div style={{ maxHeight: "120px", overflowY: "auto" }}>
            {memories.map((mem, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3px" }}>
                <span style={{ color: colors.textMuted, fontSize: "9px", flex: "1", marginRight: "6px" }}>
                  {mem.length > 100 ? mem.slice(0, 100) + "..." : mem}
                </span>
                <span
                  onClick={() => { deleteMemory(oc, i); onRefresh(); }}
                  style={{ color: colors.textMuted, cursor: "pointer", fontSize: "9px", flexShrink: "0" }}
                >
                  [x]
                </span>
              </div>
            ))}
            {memories.length === 0 && (
              <div style={{ color: colors.textMuted, fontSize: "9px" }}>
                {t("context.noMemories", locale) || "no memories extracted yet"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

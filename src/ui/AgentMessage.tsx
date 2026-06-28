import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { colors, fonts } from "./theme.js";
import { ProcessToggle } from "./ProcessToggle.js";
import { ThinkingIndicator } from "./ThinkingIndicator.js";
import { WebSearchIndicator } from "./WebSearchIndicator.js";
import { ToolCallCard } from "./ToolCallCard.js";
import { ResponseText } from "./ResponseText.js";
import type { PanelMessage, AgentStatus } from "./types.js";

interface AgentMessageProps {
  message: PanelMessage;
  agentStatus: AgentStatus;
  compact?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  thinking: "thinking...",
  searching: "searching in web...",
  scraping: "scraping...",
  responding: "responding...",
};

export function AgentMessage({ message, agentStatus, compact }: AgentMessageProps) {
  const isActive = message.role === "agent" && agentStatus !== "idle";
  const [expanded, setExpanded] = useState(true);

  // Auto-expand when active, auto-collapse when idle (with delay)
  useEffect(() => {
    if (isActive) {
      setExpanded(true);
    } else if (message.toolCalls.length > 0 || message.content) {
      const timer = setTimeout(() => setExpanded(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isActive, message.toolCalls.length, message.content]);

  const statusLabel = STATUS_LABELS[agentStatus] ?? "";
  const showProcess = isActive || message.toolCalls.length > 0;
  const showResponse = !compact && message.content;

  return (
    <div style={{
      display: "flex",
      justifyContent: "flex-start",
      padding: "4px 4px",
      animation: "agent-slide-in 0.2s ease-out",
    }}>
      <div style={{ maxWidth: "85%", minWidth: "120px" }}>
        {/* Status shimmer bar — only when active */}
        {isActive && (
          <div className="status-shimmer" style={{
            fontSize: "10px",
            fontWeight: "600",
            letterSpacing: "0.5px",
            marginBottom: "4px",
            paddingLeft: "4px",
            color: colors.textSecondary,
          }}>
            <span className="shimmer-text">{statusLabel}</span>
          </div>
        )}

        {/* Process toggle — when active or has tool calls */}
        {showProcess && (
          <ProcessToggle
            expanded={expanded}
            onToggle={() => setExpanded(!expanded)}
            active={isActive}
            statusText={statusLabel}
            toolCount={message.toolCalls.length}
          >
            {/* Thinking indicator — during thinking with no tool calls yet */}
            {isActive && agentStatus === "thinking" && !message.content && message.toolCalls.length === 0 && <ThinkingIndicator />}

            {/* Web search indicator — during searching */}
            {isActive && agentStatus === "searching" && <WebSearchIndicator />}

            {/* Tool call cards */}
            {message.toolCalls.map((tc) => (
              <ToolCallCard key={tc.id} toolCall={tc} />
            ))}
          </ProcessToggle>
        )}

        {/* Response text — OUTSIDE toggle, always visible */}
        {showResponse && <ResponseText content={message.content} />}

        {/* Loading skeleton when active + has tool calls but no content yet */}
        {showProcess && !showResponse && isActive && message.toolCalls.length > 0 && (
          <ResponseText content="" loading />
        )}
      </div>
    </div>
  );
}

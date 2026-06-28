import { h, ComponentChildren } from "preact";
import { colors, fonts } from "./theme.js";

interface ProcessToggleProps {
  expanded: boolean;
  onToggle: () => void;
  active: boolean;
  statusText: string;
  toolCount: number;
  children: ComponentChildren;
}

export function ProcessToggle({ expanded, onToggle, active, statusText, toolCount, children }: ProcessToggleProps) {
  const chevron = expanded ? "[▾]" : "[▸]";

  const label = active ? statusText : (toolCount > 0 ? "process" : "");

  return (
    <div style={{
      border: `1px solid ${expanded ? colors.borderEmphasis : colors.border}`,
      marginBottom: "4px",
      background: colors.bg,
      animation: "agent-slide-in 0.2s ease-out",
    }}>
      <button
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "100%",
          padding: "5px 10px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontSize: "10px",
          fontFamily: fonts.mono,
          color: active ? colors.textSecondary : colors.textMuted,
        }}
      >
        <span style={{ color: colors.textMuted, fontSize: "10px" }}>{chevron}</span>
        {label && (
          <span className={active ? "shimmer-text" : ""}>
            {label}
          </span>
        )}
        {!active && toolCount > 0 && (
          <span style={{
            marginLeft: "auto",
            fontSize: "9px",
            color: colors.textMuted,
          }}>
            [{toolCount}]
          </span>
        )}
        {active && (
          <span style={{
            marginLeft: "auto",
            fontSize: "9px",
            color: colors.statusRunning,
          }}>
            ...
          </span>
        )}
      </button>

      <div
        className={`process-toggle-content ${expanded ? "expanded" : "collapsed"}`}
        style={{
          borderTop: expanded ? `1px solid ${colors.border}` : "none",
        }}
      >
        <div style={{ padding: expanded ? "6px 10px" : "0" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

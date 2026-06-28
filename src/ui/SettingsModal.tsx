import { h } from "preact";
import { useState } from "preact/hooks";
import { colors, fonts } from "./theme.js";
import { t, LOCALES, LOCALE_LABELS, type Locale } from "../i18n/index.js";

import type { PanelMode } from "./types.js";

interface SettingsModalProps {
  isOpen: boolean;
  currentKey: string;
  panelMode: PanelMode;
  inputEnabled: boolean;
  locale: Locale;
  onClose: () => void;
  onSave: (key: string) => Promise<boolean>;
  onPanelModeChange: (mode: PanelMode) => void;
  onInputEnabledChange: (enabled: boolean) => void;
  onLocaleChange: (locale: Locale) => void;
}

export function SettingsModal({ isOpen, currentKey, panelMode, inputEnabled, locale, onClose, onSave, onPanelModeChange, onInputEnabledChange, onLocaleChange }: SettingsModalProps) {
  const [key, setKey] = useState(currentKey);
  const [msg, setMsg] = useState("");

  if (!isOpen) return null;

  async function handleSave() {
    if (!key.trim()) {
      setMsg(t("settings.apiKey.error.empty", locale));
      return;
    }
    setMsg(t("settings.apiKey.validating", locale));
    const ok = await onSave(key.trim());
    setMsg(ok ? t("settings.apiKey.saved", locale) : t("settings.apiKey.error.invalid", locale));
    if (ok) setTimeout(onClose, 800);
  }

  const maskedKey = currentKey
    ? currentKey.slice(0, 8) + "..." + currentKey.slice(-4)
    : "none";

  const isCompact = panelMode === "tools-only";

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
          padding: "20px",
          maxWidth: "380px",
          width: "90%",
          border: `1px solid ${colors.border}`,
        }}
      >
        <h3 style={{ margin: "0 0 16px", color: colors.textSecondary, fontSize: "11px", fontFamily: fonts.mono, letterSpacing: "1px", textTransform: "uppercase" }}>
          {t("settings.title", locale)}
        </h3>

        {/* Language selector */}
        <div style={{ marginBottom: "14px", padding: "10px 12px", background: colors.surface1, border: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ color: colors.textSecondary, fontSize: "11px", fontFamily: fonts.mono }}>
              {t("settings.language", locale)}
            </div>
            <select
              value={locale}
              onChange={(e) => onLocaleChange((e.target as HTMLSelectElement).value as Locale)}
              style={{
                fontFamily: fonts.mono,
                fontSize: "10px",
                background: colors.surface2,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                padding: "3px 6px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {LOCALES.map((l) => (
                <option key={l} value={l}>{LOCALE_LABELS[l]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Panel mode toggle */}
        <div style={{ marginBottom: "14px", padding: "10px 12px", background: colors.surface1, border: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: colors.textSecondary, fontSize: "11px", fontFamily: fonts.mono }}>{t("settings.compactMode", locale)}</div>
              <div style={{ color: colors.textMuted, fontSize: "9px", marginTop: "2px", fontFamily: fonts.mono }}>{t("settings.compactMode.desc", locale)}</div>
            </div>
            <div
              onClick={() => onPanelModeChange(isCompact ? "full" : "tools-only")}
              style={{
                cursor: "pointer",
                fontFamily: fonts.mono,
                fontSize: "10px",
                color: isCompact ? colors.text : colors.textMuted,
                border: `1px solid ${isCompact ? colors.text : colors.border}`,
                padding: "3px 8px",
                letterSpacing: "0.5px",
                transition: "all 0.15s",
              }}
            >
              {isCompact ? t("settings.toggle.on", locale) : t("settings.toggle.off", locale)}
            </div>
          </div>
        </div>

        {/* Panel input toggle */}
        <div style={{ marginBottom: "14px", padding: "10px 12px", background: colors.surface1, border: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: colors.textSecondary, fontSize: "11px", fontFamily: fonts.mono }}>{t("settings.panelInput", locale)}</div>
              <div style={{ color: colors.textMuted, fontSize: "9px", marginTop: "2px", fontFamily: fonts.mono }}>{t("settings.panelInput.desc", locale)}</div>
            </div>
            <div
              onClick={() => onInputEnabledChange(!inputEnabled)}
              style={{
                cursor: "pointer",
                fontFamily: fonts.mono,
                fontSize: "10px",
                color: inputEnabled ? colors.text : colors.textMuted,
                border: `1px solid ${inputEnabled ? colors.text : colors.border}`,
                padding: "3px 8px",
                letterSpacing: "0.5px",
                transition: "all 0.15s",
              }}
            >
              {inputEnabled ? t("settings.toggle.on", locale) : t("settings.toggle.off", locale)}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ color: colors.textMuted, fontSize: "9px", display: "block", marginBottom: "4px", fontFamily: fonts.mono, letterSpacing: "1px", textTransform: "uppercase" }}>
            {t("settings.apiKey", locale)}
          </label>
          <input
            type="password"
            value={key}
            onInput={(e) => setKey((e.target as HTMLInputElement).value)}
            placeholder={t("settings.apiKey.placeholder", locale)}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: `1px solid ${colors.border}`,
              background: colors.surface1,
              color: colors.text,
              fontSize: "11px",
              fontFamily: fonts.mono,
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          <div style={{ color: colors.textMuted, fontSize: "9px", marginTop: "4px", fontFamily: fonts.mono }}>
            {t("settings.apiKey.current", locale).replace("{key}", maskedKey)}
          </div>
        </div>

        {msg && (
          <div style={{
            fontSize: "10px",
            marginBottom: "10px",
            color: msg.startsWith("[ok]") ? colors.textSecondary : msg.startsWith("[!!]") ? colors.statusError : colors.textMuted,
            fontFamily: fonts.mono,
          }}>
            {msg}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <button
            onClick={handleSave}
            style={{
              flex: "1",
              padding: "8px",
              border: `1px solid ${colors.text}`,
              background: "transparent",
              color: colors.text,
              fontSize: "11px",
              fontFamily: fonts.mono,
              cursor: "pointer",
              letterSpacing: "0.5px",
            }}
          >
            {t("settings.save", locale)}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: "1",
              padding: "8px",
              border: `1px solid ${colors.border}`,
              background: "transparent",
              color: colors.textMuted,
              fontSize: "11px",
              fontFamily: fonts.mono,
              cursor: "pointer",
              letterSpacing: "0.5px",
            }}
          >
            {t("settings.close", locale)}
          </button>
        </div>
      </div>
    </div>
  );
}

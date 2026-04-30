import React, { useCallback, useEffect, useState } from 'react';
import { useChannel, useParameter, useArgs } from '@storybook/manager-api';

import { PARAM_KEY, EVENT_PREFIX } from '../constants';
import type { LanguageTextEditorConfig, FieldConfig, OverridesMap } from '../types';

// ---------------------------------------------------------------------------
// Markdown escape helpers
// ---------------------------------------------------------------------------

const ALL_MD_CHARS = ['*', '_', '~', '`', '[', ']'];

export function unescapeMarkdownChars(text: string): string {
  if (!text) return text;
  return text.replace(/\\([*_~`[\]\\])/g, '$1');
}

export function escapeMarkdownChars(text: string, allowedMarkdown: string[] = []): string {
  if (!text) return text;
  const clean = unescapeMarkdownChars(text);
  const toEscape = ALL_MD_CHARS.filter((c) => !allowedMarkdown.includes(c));
  if (toEscape.length === 0) return clean;
  const pattern = new RegExp(`([${toEscape.map((c) => '\\' + c).join('')}])`, 'g');
  return clean.replace(pattern, '\\$1');
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

function readOverrides(storageKey: string): OverridesMap {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch {
    return {};
  }
}

function writeOverrides(storageKey: string, overrides: OverridesMap): void {
  localStorage.setItem(storageKey, JSON.stringify(overrides));
}

// ---------------------------------------------------------------------------
// Panel component
// ---------------------------------------------------------------------------

export function LanguageTextEditorPanel() {
  const config = useParameter<LanguageTextEditorConfig | undefined>(PARAM_KEY);
  const [args, updateArgs] = useArgs();

  const storageKey = config?.storageKey ?? '';
  const fields = config?.fields ?? [];
  const languages = config?.languages ?? [];
  const languageArgKey = config?.languageArgKey ?? 'language';
  const eventName = `${EVENT_PREFIX}:${storageKey}`;

  const [overrides, setOverrides] = useState<OverridesMap>(() => (storageKey ? readOverrides(storageKey) : {}));
  const language = (args?.[languageArgKey] as string) ?? 'en';

  const emit = useChannel({
    storyRendered: () => {
      if (storageKey) setOverrides(readOverrides(storageKey));
    },
  });

  useEffect(() => {
    if (storageKey) setOverrides(readOverrides(storageKey));
  }, [storageKey]);

  const langOverrides = overrides[language] ?? {};

  const handleLanguageChange = useCallback(
    (newLang: string) => {
      updateArgs({ [languageArgKey]: newLang });
    },
    [updateArgs, languageArgKey],
  );

  const handleChange = useCallback(
    (field: string, value: string, fieldConfig: FieldConfig) => {
      if (!storageKey) return;
      const resolved = fieldConfig?.markdown ? escapeMarkdownChars(value, fieldConfig.allowedMarkdown) : value;
      setOverrides((prev) => {
        const next: OverridesMap = {
          ...prev,
          [language]: { ...(prev[language] ?? {}), [field]: resolved || undefined },
        };
        if (!resolved) delete next[language]?.[field];
        if (next[language] && Object.keys(next[language]).length === 0) delete next[language];
        writeOverrides(storageKey, next);
        emit(eventName, next);
        return next;
      });
    },
    [language, emit, storageKey, eventName],
  );

  const handleClearAll = useCallback(() => {
    if (!storageKey) return;
    const next: OverridesMap = {};
    writeOverrides(storageKey, next);
    emit(eventName, next);
    setOverrides(next);
  }, [emit, storageKey, eventName]);

  const handleClearLanguage = useCallback(() => {
    if (!storageKey) return;
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[language];
      writeOverrides(storageKey, next);
      emit(eventName, next);
      return next;
    });
  }, [language, emit, storageKey, eventName]);

  // Re-sync when the window regains focus (e.g. multi-tab editing)
  useEffect(() => {
    const onFocus = () => {
      if (storageKey) setOverrides(readOverrides(storageKey));
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [storageKey]);

  // ── Empty state ──────────────────────────────────────────────────────
  if (!config || !storageKey || fields.length === 0) {
    return (
      <div style={{ padding: 16, color: '#999', fontSize: 13 }}>
        This story does not use the Language Text Editor.
        <br />
        Add <code>parameters.languageTextEditor</code> to enable it.
      </div>
    );
  }

  const hasLanguageOverrides = Object.keys(langOverrides).length > 0;
  const hasAnyOverrides = Object.keys(overrides).length > 0;

  const btnStyle: React.CSSProperties = {
    padding: '4px 10px',
    fontSize: 12,
    border: '1px solid #ccc',
    borderRadius: 4,
    background: '#fff',
    cursor: 'pointer',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '6px 8px',
    fontSize: 13,
    border: '1px solid #ccc',
    borderRadius: 4,
    fontFamily: 'inherit',
  };
  const selectStyle: React.CSSProperties = {
    padding: '4px 8px',
    fontSize: 13,
    border: '1px solid #ccc',
    borderRadius: 4,
    fontFamily: 'inherit',
    cursor: 'pointer',
  };

  return (
    <div style={{ padding: 16, fontFamily: 'var(--font-family-sans-serif, sans-serif)' }}>
      {/* Language selector + clear buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        {languages.length > 0 ? (
          <label style={{ fontSize: 14, fontWeight: 600 }}>
            Language:{' '}
            <select value={language} onChange={(e) => handleLanguageChange(e.target.value)} style={selectStyle}>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <strong style={{ fontSize: 14 }}>
            Language: <code style={{ color: '#029cfd' }}>{language}</code>
          </strong>
        )}
        <span style={{ flex: 1 }} />
        {hasLanguageOverrides && (
          <button onClick={handleClearLanguage} style={btnStyle}>
            Clear {language}
          </button>
        )}
        {hasAnyOverrides && (
          <button onClick={handleClearAll} style={{ ...btnStyle, color: '#d43900' }}>
            Clear all
          </button>
        )}
      </div>

      <p style={{ fontSize: 12, color: '#666', margin: '0 0 16px' }}>
        Edit text for <strong>{language}</strong>. Overrides persist per-language in localStorage. Clear a field to
        restore the default.
      </p>

      {/* Field editors */}
      {fields.map((fieldConfig) => {
        const { key, label, multiline, markdown, allowedMarkdown } = fieldConfig;
        return (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              {label || key}
              {markdown && <span style={{ color: '#888', fontWeight: 400 }}> (markdown)</span>}
              {langOverrides[key] != null && <span style={{ color: '#029cfd', fontWeight: 400 }}> (overridden)</span>}
            </label>
            {markdown && allowedMarkdown && allowedMarkdown.length > 0 && (
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>
                Supported:{' '}
                {allowedMarkdown.map((c) => (
                  <code
                    key={c}
                    style={{
                      margin: '0 2px',
                      padding: '1px 4px',
                      background: '#f0f0f0',
                      borderRadius: 3,
                    }}
                  >
                    {c}
                  </code>
                ))}
                — other markdown characters are auto-escaped
              </div>
            )}
            {multiline || markdown ? (
              <textarea
                value={markdown ? unescapeMarkdownChars(langOverrides[key] ?? '') : (langOverrides[key] ?? '')}
                placeholder={`Default ${language} content`}
                onChange={(e) => handleChange(key, e.target.value, fieldConfig)}
                rows={3}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  fontFamily: markdown ? 'monospace' : 'inherit',
                }}
              />
            ) : (
              <input
                type="text"
                value={langOverrides[key] ?? ''}
                placeholder={`Default ${language} content`}
                onChange={(e) => handleChange(key, e.target.value, fieldConfig)}
                style={inputStyle}
              />
            )}
          </div>
        );
      })}

      {/* Debug view */}
      {hasAnyOverrides && (
        <details style={{ marginTop: 16, fontSize: 12 }}>
          <summary style={{ cursor: 'pointer', color: '#029cfd' }}>
            Active overrides ({Object.keys(overrides).length} language(s))
          </summary>
          <pre
            style={{
              background: '#f6f6f6',
              color: '#000',
              padding: 8,
              borderRadius: 4,
              overflow: 'auto',
              fontSize: 11,
            }}
          >
            {JSON.stringify(overrides, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

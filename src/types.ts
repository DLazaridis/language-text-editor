/**
 * Configuration for a single text field in the Language Text Editor panel.
 */
export interface FieldConfig {
  /** The key used to store/retrieve the override value */
  key: string;
  /** Human-readable label shown in the panel */
  label?: string;
  /** If true, renders a textarea and applies markdown escaping */
  multiline?: boolean;
  /** If true, enables markdown-aware escaping */
  markdown?: boolean;
  /** List of markdown characters that should NOT be escaped (e.g. ['`']) */
  allowedMarkdown?: string[];
}

/**
 * Parameter shape for `parameters.languageTextEditor`.
 */
export interface LanguageTextEditorConfig {
  /** localStorage key where overrides are persisted */
  storageKey: string;
  /** Available language codes (shown as a dropdown) */
  languages?: string[];
  /** The args key that holds the current language. Defaults to `'language'` */
  languageArgKey?: string;
  /** Text fields to expose in the editor panel */
  fields: FieldConfig[];
}

/**
 * Map of language → field key → override value.
 */
export type OverridesMap = Record<string, Record<string, string | undefined>>;

// Re-export types for consumers
export type { FieldConfig, LanguageTextEditorConfig, OverridesMap } from './types';

// Re-export constants so consumers can reference event names, param key, etc.
export { ADDON_ID, PANEL_ID, PARAM_KEY, EVENT_PREFIX } from './constants';

// Re-export the Vue composable for preview-side consumption
export { useLanguageTextOverrides } from './composables/useLanguageTextOverrides';

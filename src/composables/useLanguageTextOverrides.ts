import { computed, onMounted, onUnmounted, ref, type Ref } from 'vue';

import { EVENT_PREFIX } from '../constants';
import type { OverridesMap } from '../types';

/**
 * Reads per-language text overrides written by the `language-text-editor`
 * Storybook addon panel. Returns a reactive record of field overrides for the
 * given language.
 *
 * @param storageKey  localStorage key — must match `parameters.languageTextEditor.storageKey`
 * @param language    reactive ref to the current language code
 *
 * @example
 * ```ts
 * const language = ref('en')
 * const overrides = useLanguageTextOverrides('my-component-overrides', language)
 * // overrides.value → { headlineText: 'Custom headline', ... }
 * ```
 */
export function useLanguageTextOverrides(
  storageKey: string,
  language: Ref<string>,
): Ref<Record<string, string | undefined>> {
  const eventName = `${EVENT_PREFIX}:${storageKey}`;

  function read(): OverridesMap {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      return {};
    }
  }

  const all = ref<OverridesMap>(read());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channel = (window as any).__STORYBOOK_ADDONS_CHANNEL__;
  const onUpdate = (data: OverridesMap) => {
    all.value = data;
  };

  onMounted(() => {
    channel?.on(eventName, onUpdate);
  });
  onUnmounted(() => {
    channel?.off(eventName, onUpdate);
  });

  return computed(() => all.value[language.value] ?? {});
}

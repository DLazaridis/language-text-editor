import { computed, onMounted, onUnmounted, ref, type Ref } from 'vue';

import { EVENT_PREFIX } from '../constants';
import type { OverridesMap } from '../types';

type AddonsChannel = {
  on: (e: string, h: (d: OverridesMap) => void) => void;
  off: (e: string, h: (d: OverridesMap) => void) => void;
};

const EMPTY_OVERRIDES: Record<string, string | undefined> = {};

/**
 * Reads per-language text overrides written by the `language-text-editor`
 * Storybook addon panel. Returns a reactive record of field overrides for the
 * given language.
 *
 * @param storageKey  localStorage key - must match `parameters.languageTextEditor.storageKey`
 * @param language    reactive ref to the current language code
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

  const onUpdate = (data: OverridesMap) => {
    all.value = data;
  };

  let channel: AddonsChannel | undefined;
  let onStorage: (() => void) | undefined;

  onMounted(() => {
    channel = (window as { __STORYBOOK_ADDONS_CHANNEL__?: AddonsChannel }).__STORYBOOK_ADDONS_CHANNEL__;
    channel?.on(eventName, onUpdate);

    onStorage = () => {
      all.value = read();
    };
    window.addEventListener('storage', onStorage);
  });

  onUnmounted(() => {
    channel?.off(eventName, onUpdate);
    if (onStorage) window.removeEventListener('storage', onStorage);
  });

  return computed(() => all.value[language.value] ?? EMPTY_OVERRIDES);
}

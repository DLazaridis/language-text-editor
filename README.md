<!-- README START -->

# storybook-addon-language-text-editor

A Storybook addon panel for **editing per-language text overrides** with localStorage persistence.  
Ideal for multilingual component libraries where content authors need to preview text changes across languages without modifying source code.

## Features

- 🌍 **Language switcher** — switch the active language directly from the panel
- 📝 **Per-field text editing** — override individual text fields per language
- 💾 **localStorage persistence** — overrides survive page reloads
- ✏️ **Markdown-aware escaping** — auto-escapes markdown characters with configurable allowlists
- 🔄 **Real-time sync** — changes push to the preview iframe via Storybook channels
- 🧩 **Vue 3 composable** — `useLanguageTextOverrides()` for consuming overrides in Vue stories

## Installation

```sh
npm install --save-dev storybook-addon-language-text-editor
```

Then register it in your Storybook configuration:

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/vue3-vite'; // or your framework

const config: StorybookConfig = {
  addons: [
    'storybook-addon-language-text-editor',
  ],
};

export default config;
```

## Usage

### 1. Configure story parameters

Add `parameters.languageTextEditor` to your story meta:

```ts
// MyComponent.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3';
import MyComponent from './MyComponent.vue';

const meta = {
  component: MyComponent,
  parameters: {
    languageTextEditor: {
      storageKey: 'my-component-overrides',
      languages: ['en', 'gr', 'fr'],
      languageArgKey: 'language', // which arg holds the current language (default: 'language')
      fields: [
        { key: 'firstText', label: 'First' },
        { key: 'mainText', label: 'Main', markdown: true, allowedMarkdown: ['~'] },
      ],
    },
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
```

### 2. Consume overrides in your story render (Vue 3)

```ts
import { ref, computed } from 'vue';
import { useLanguageTextOverrides } from 'storybook-addon-language-text-editor';

// Inside your render function or setup:
const language = ref('en');
const overrides = useLanguageTextOverrides('my-component-overrides', language);

// overrides.value → { headlineText: 'Custom headline', ... }
const headlineText = computed(() => overrides.value.headlineText ?? defaultTexts.headlineText);
```

### 3. Open the "Language Text" panel

In the Storybook UI, open the **Language Text** panel (bottom tabs). You'll see:

- A language dropdown (if `languages` is provided)
- Text inputs for each configured field
- Clear buttons per-language and globally
- A collapsible JSON view of all active overrides

## API

### Parameters (`parameters.languageTextEditor`)

| Property         | Type            | Default      | Description                                              |
| ---------------- | --------------- | ------------ | -------------------------------------------------------- |
| `storageKey`     | `string`        | **required** | localStorage key for persisting overrides                |
| `languages`      | `string[]`      | `[]`         | Available language codes shown in the dropdown           |
| `languageArgKey` | `string`        | `'language'` | The args key that holds the current language             |
| `fields`         | `FieldConfig[]` | **required** | Text fields to expose in the editor                      |

### `FieldConfig`

| Property          | Type       | Default | Description                                             |
| ----------------- | ---------- | ------- | ------------------------------------------------------- |
| `key`             | `string`   | —       | Storage key for the override value                      |
| `label`           | `string`   | `key`   | Human-readable label in the panel                       |
| `multiline`       | `boolean`  | `false` | Renders a `<textarea>` instead of `<input>`             |
| `markdown`        | `boolean`  | `false` | Enables markdown-aware escaping and monospace textarea   |
| `allowedMarkdown` | `string[]` | `[]`    | Markdown characters that should **not** be auto-escaped |

### Exports

```ts
import {
  // Vue 3 composable
  useLanguageTextOverrides,

  // Constants
  ADDON_ID,
  PANEL_ID,
  PARAM_KEY,
  EVENT_PREFIX,

  // Types
  type FieldConfig,
  type LanguageTextEditorConfig,
  type OverridesMap,
} from 'storybook-addon-language-text-editor';
```

## Development

```sh
pnpm install
pnpm run start        # watch mode + Storybook dev server
pnpm run build        # production build
```

## License

MIT

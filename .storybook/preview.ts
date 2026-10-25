import { definePreview } from '@storybook/react-vite';
import addonDocs from '@storybook/addon-docs';
import addon from '../dist/index.js';

export default definePreview({
  addons: [addonDocs(), addon()],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  initialGlobals: {
    background: { value: 'light' },
  },
});

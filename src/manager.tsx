import React from 'react';
import { addons, types } from '@storybook/manager-api';
import { AddonPanel } from '@storybook/components';

import { LanguageTextEditorPanel } from './components/Panel';
import { ADDON_ID, PANEL_ID } from './constants';

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Language Text',
    match: ({ viewMode }: { viewMode?: string }) => viewMode === 'story',
    render: ({ active }: { active?: boolean }) => (
      <AddonPanel active={active ?? false}>
        <LanguageTextEditorPanel />
      </AddonPanel>
    ),
  });
});

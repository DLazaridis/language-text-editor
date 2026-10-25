import type { ProjectAnnotations, Renderer } from 'storybook/internal/types';

/**
 * The Language Text Editor addon is manager-only (panel).
 * No preview decorators or globals are required.
 * This file is kept as a no-op entry for the preset system.
 */
const preview: ProjectAnnotations<Renderer> = {};

export default preview;

import packageJson from '../../package.json';

// Single source of truth for app version is package.json
// No need to manually update this file - version is imported directly
export const APP_VERSION = packageJson.version;
export const APP_VERSION_DISPLAY = `${APP_VERSION} (alpha)`;

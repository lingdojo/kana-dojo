// Heavy entrypoint: explicit import surface for font catalog only.
// Keep this separate from '@/features/Preferences' to avoid pulling next/font/google
// into unrelated SSR/client bundles via barrel imports.
export { default as fonts } from './data/fonts/fonts';

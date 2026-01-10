// Barrel export for Translator feature
// Components will be exported here as they are implemented

// Types
export * from './types';

// Services
export * from './services/historyService';
export * from './services/translationAPI';
export * from './services/textAnalysisAPI';

// Utilities
export * from './lib/languageDetection';
export * from './lib/csvExport';
export * from './lib/historyFilters';

// Hooks
export { useVoiceInput } from './hooks/useVoiceInput';
export { useVoiceOutput } from './hooks/useVoiceOutput';

// Store
export { default as useTranslatorStore } from './store/useTranslatorStore';

// Components
export { default as TranslatorPage } from './components/TranslatorPage';
export { default as TranslatorInput } from './components/TranslatorInput';
export { default as TranslatorOutput } from './components/TranslatorOutput';
export { default as TranslationHistory } from './components/TranslationHistory';
export { default as SEOContent } from './components/SEOContent';
export { default as ComparisonTable } from './components/ComparisonTable';
export { default as WordByWordBreakdown } from './components/WordByWordBreakdown';
export { default as TranslationAlternatives } from './components/TranslationAlternatives';

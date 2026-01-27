/**
 * AnkiConverter Feature
 *
 * Converts Anki deck files (.apkg, .tsv, .sqlite, .colpkg, .anki2)
 * into structured JSON format.
 */

// Components
export { ConverterInterface } from './components/ConverterInterface';

// Error class and enum (runtime values)
export { ConversionError, ErrorCode } from './types';

// Types
export type {
  ConversionOptions,
  ConversionResult,
  ConversionStats,
  ProgressEvent,
  ConversionStage,
  SupportedFormat,
  ErrorRecovery,
} from './types';

export type {
  ParsedAnkiData,
  Note,
  Card,
  DeckInfo,
  NoteType,
  Field,
  Template,
  AnkiMetadata,
} from './types';

export type {
  Deck,
  OutputCard,
  BasicCard,
  ClozeCard,
  CustomCard,
  ClozeVariation,
  CardStats,
  ConversionMetadata,
} from './types';

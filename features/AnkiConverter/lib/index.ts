/**
 * AnkiConverter Library
 *
 * Core utilities for Anki file conversion.
 */

export {
  createConversionPipeline,
  createErrorMessage,
  getErrorRecoveryGuidance,
  isRecoverableError,
  validateFileSize,
} from './conversionPipeline';
export type { ConversionPipeline } from './conversionPipeline';

export {
  detectFormat,
  detectFormatFromContent,
  detectFormatFromExtension,
  getFileExtension,
  isSupportedFormat,
  getSupportedExtensions,
  getAcceptString,
} from './formatDetection';
export type { FormatDetectionResult } from './formatDetection';

export {
  extractText,
  removeMediaTags,
  preserveFormatting,
  decodeHtmlEntities,
  stripHtmlTags,
  cleanWhitespace,
  containsMediaReferences,
  containsHtmlTags,
} from './textExtractor';
export type { TextExtractorOptions } from './textExtractor';

export {
  buildJson,
  extractClozeVariations,
  isValidJsonOutput,
  countTotalCards,
  flattenDeckNames,
} from './jsonBuilder';

export {
  sanitizeFilename,
  generateCollectionFilename,
  isValidFilename,
} from './filenameSanitizer';
export type { SanitizeFilenameOptions } from './filenameSanitizer';

export {
  downloadConversionResult,
  generateDownloadFilename,
  resultToJsonString,
  createJsonBlob,
  triggerBlobDownload,
  isDownloadSupported,
} from './fileDownload';
export type { DownloadOptions, DownloadResult } from './fileDownload';

// Worker module
export {
  createWorkerManager,
  getWorkerManager,
  resetWorkerManager,
  type WorkerManager,
  type ConversionCallbacks,
} from './worker';

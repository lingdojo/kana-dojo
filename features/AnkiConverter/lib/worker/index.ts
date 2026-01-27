/**
 * Web Worker Module for Anki Converter
 *
 * Exports worker management utilities for background conversion.
 *
 * @module features/AnkiConverter/lib/worker
 */

export type {
  WorkerRequestMessage,
  WorkerResponseMessage,
  WorkerConvertMessage,
  WorkerCancelMessage,
  WorkerCleanupMessage,
  WorkerProgressMessage,
  WorkerSuccessMessage,
  WorkerErrorMessage,
  WorkerReadyMessage,
  WorkerCleanupCompleteMessage,
  SerializableProgressEvent,
  SerializableError,
} from './types';

export {
  createWorkerManager,
  getWorkerManager,
  resetWorkerManager,
  type WorkerManager,
  type ConversionCallbacks,
} from './workerManager';

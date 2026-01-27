/**
 * Web Worker Types for Anki Converter
 *
 * Message types for communication between main thread and worker.
 *
 * @module features/AnkiConverter/lib/worker/types
 */

import type {
  ConversionOptions,
  ConversionResult,
  ProgressEvent,
  ConversionStage,
} from '../../types';

/**
 * Message types sent from main thread to worker
 */
export type WorkerRequestMessage =
  | WorkerConvertMessage
  | WorkerCancelMessage
  | WorkerCleanupMessage;

/**
 * Request to convert a file
 */
export interface WorkerConvertMessage {
  type: 'convert';
  id: string;
  payload: {
    buffer: ArrayBuffer;
    filename?: string;
    options: ConversionOptions;
  };
}

/**
 * Request to cancel an ongoing conversion
 */
export interface WorkerCancelMessage {
  type: 'cancel';
  id: string;
}

/**
 * Request to cleanup worker memory
 */
export interface WorkerCleanupMessage {
  type: 'cleanup';
}

/**
 * Message types sent from worker to main thread
 */
export type WorkerResponseMessage =
  | WorkerProgressMessage
  | WorkerSuccessMessage
  | WorkerErrorMessage
  | WorkerReadyMessage
  | WorkerCleanupCompleteMessage;

/**
 * Progress update from worker
 */
export interface WorkerProgressMessage {
  type: 'progress';
  id: string;
  payload: ProgressEvent;
}

/**
 * Successful conversion result
 */
export interface WorkerSuccessMessage {
  type: 'success';
  id: string;
  payload: ConversionResult;
}

/**
 * Error during conversion
 */
export interface WorkerErrorMessage {
  type: 'error';
  id: string;
  payload: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    recoverable: boolean;
  };
}

/**
 * Worker is ready to receive messages
 */
export interface WorkerReadyMessage {
  type: 'ready';
}

/**
 * Cleanup completed
 */
export interface WorkerCleanupCompleteMessage {
  type: 'cleanup-complete';
}

/**
 * Serializable progress event for worker communication
 */
export interface SerializableProgressEvent {
  stage: ConversionStage;
  progress: number;
  message: string;
}

/**
 * Serializable error for worker communication
 */
export interface SerializableError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  recoverable: boolean;
}

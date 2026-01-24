/**
 * Main Conjugation API
 *
 * This module provides the main entry point for conjugating Japanese verbs.
 * It integrates verb classification with the appropriate conjugation functions
 * and returns complete conjugation results.
 *
 * Requirements: 1.1, 1.3, 1.4, 11.2, 11.3
 */

import type {
  ConjugationResult,
  ConjugationForm,
  VerbInfo,
  ConjugationError,
  ConjugationErrorCode,
} from '../../types';
import { classifyVerb, isJapanese } from './classifyVerb';
import { conjugateGodan } from './conjugateGodan';
import { conjugateIchidan } from './conjugateIchidan';
import { conjugateIrregular } from './conjugateIrregular';

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Create a ConjugationError object
 */
function createError(
  code: ConjugationErrorCode,
  message: string,
): ConjugationError {
  return { code, message };
}

/**
 * Result type for conjugation - either success or error
 */
export type ConjugateResult =
  | { success: true; result: ConjugationResult }
  | { success: false; error: ConjugationError };

// ============================================================================
// Input Validation
// ============================================================================

/**
 * Check if input is empty or whitespace-only
 * Requirements: 1.3
 */
function isEmptyOrWhitespace(input: string): boolean {
  return !input || input.trim().length === 0;
}

/**
 * Check if input contains only valid Japanese characters
 * Requirements: 1.4
 */
function containsOnlyJapanese(input: string): boolean {
  return isJapanese(input.trim());
}

/**
 * Validate input and return error if invalid
 * Requirements: 1.3, 1.4
 */
function validateInput(input: string): ConjugationError | null {
  // Check for empty or whitespace-only input (Requirements: 1.3)
  if (isEmptyOrWhitespace(input)) {
    return createError('EMPTY_INPUT', 'Please enter a Japanese verb');
  }

  const trimmed = input.trim();

  // Check for invalid characters (Requirements: 1.4)
  if (!containsOnlyJapanese(trimmed)) {
    return createError(
      'INVALID_CHARACTERS',
      'Please enter a valid Japanese verb using hiragana, katakana, or kanji',
    );
  }

  return null;
}

// ============================================================================
// Conjugation Logic
// ============================================================================

/**
 * Get the appropriate conjugation function based on verb type
 */
function getConjugationFunction(
  verbInfo: VerbInfo,
): (verb: VerbInfo) => ConjugationForm[] {
  switch (verbInfo.type) {
    case 'godan':
      return conjugateGodan;
    case 'ichidan':
      return conjugateIchidan;
    case 'irregular':
      return conjugateIrregular;
    default:
      throw new Error(`Unknown verb type: ${verbInfo.type}`);
  }
}

// ============================================================================
// Main API
// ============================================================================

/**
 * Conjugate a Japanese verb to all forms
 *
 * This is the main entry point for the conjugation engine.
 * It validates input, classifies the verb, and returns all conjugated forms.
 *
 * @param input - The verb in dictionary form (kanji, hiragana, or mixed)
 * @returns ConjugateResult with either success (ConjugationResult) or error
 *
 * Requirements: 1.1, 1.3, 1.4, 11.2, 11.3
 *
 * Properties:
 * - Deterministic: Same input always produces same output (11.2)
 * - Pure function: No side effects, input is not modified (11.3)
 */
export function conjugate(input: string): ConjugateResult {
  // Validate input (Requirements: 1.3, 1.4)
  const validationError = validateInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    // Classify the verb (Requirements: 9.1, 9.2)
    const verbInfo = classifyVerb(input);

    // Get the appropriate conjugation function
    const conjugationFn = getConjugationFunction(verbInfo);

    // Conjugate to all forms (Requirements: 1.1, 3.1-3.13)
    const forms = conjugationFn(verbInfo);

    // Create the result (Requirements: 11.2 - deterministic)
    const result: ConjugationResult = {
      verb: verbInfo,
      forms,
      timestamp: Date.now(),
    };

    return { success: true, result };
  } catch (error) {
    // Handle classification errors
    if (error instanceof Error) {
      const message = error.message;

      // Parse error code from message if present
      if (message.startsWith('EMPTY_INPUT:')) {
        return {
          success: false,
          error: createError(
            'EMPTY_INPUT',
            message.replace('EMPTY_INPUT: ', ''),
          ),
        };
      }
      if (message.startsWith('INVALID_CHARACTERS:')) {
        return {
          success: false,
          error: createError(
            'INVALID_CHARACTERS',
            message.replace('INVALID_CHARACTERS: ', ''),
          ),
        };
      }
      if (message.startsWith('UNKNOWN_VERB:')) {
        return {
          success: false,
          error: createError(
            'UNKNOWN_VERB',
            message.replace('UNKNOWN_VERB: ', ''),
          ),
        };
      }

      // Generic conjugation failure
      return {
        success: false,
        error: createError('CONJUGATION_FAILED', message),
      };
    }

    // Unknown error
    return {
      success: false,
      error: createError(
        'CONJUGATION_FAILED',
        'An unexpected error occurred during conjugation',
      ),
    };
  }
}

/**
 * Conjugate a verb and throw on error (convenience function)
 *
 * Use this when you want exceptions instead of result types.
 *
 * @param input - The verb in dictionary form
 * @returns ConjugationResult
 * @throws Error if conjugation fails
 */
export function conjugateOrThrow(input: string): ConjugationResult {
  const result = conjugate(input);
  if (!result.success) {
    throw new Error(`${result.error.code}: ${result.error.message}`);
  }
  return result.result;
}

/**
 * Conjugate a verb to a specific form
 *
 * @param input - The verb in dictionary form
 * @param formId - The ID of the form to get (e.g., 'te', 'masu', 'potential-plain')
 * @returns The specific ConjugationForm or null if not found
 */
export function conjugateToForm(
  input: string,
  formId: string,
): ConjugationForm | null {
  const result = conjugate(input);
  if (!result.success) {
    return null;
  }

  return result.result.forms.find(form => form.id === formId) || null;
}

/**
 * Check if a string is a valid Japanese verb that can be conjugated
 *
 * @param input - The string to check
 * @returns true if the input can be conjugated
 */
export function isValidVerb(input: string): boolean {
  const result = conjugate(input);
  return result.success;
}

/**
 * Get verb info without full conjugation
 *
 * @param input - The verb in dictionary form
 * @returns VerbInfo or null if invalid
 */
export function getVerbInfo(input: string): VerbInfo | null {
  const validationError = validateInput(input);
  if (validationError) {
    return null;
  }

  try {
    return classifyVerb(input);
  } catch {
    return null;
  }
}

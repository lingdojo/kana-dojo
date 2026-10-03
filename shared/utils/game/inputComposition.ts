/**
 * Detects whether a keyboard event fired while an IME / predictive-text
 * composition session is active.
 *
 * Browsers flag in-progress composition with `isComposing`, but legacy
 * WebKit engines and several mobile keyboards only report `keyCode` 229,
 * so both signals need to be checked. Submitting an answer from a keydown
 * that happened mid-composition reads the not-yet-committed input value,
 * which is why mobile Enter presses could be marked wrong while clicking
 * the Check button later (with the committed value) is accepted.
 */
export const isComposingKeyboardEvent = (
  event: Pick<KeyboardEvent, 'isComposing' | 'keyCode'>,
): boolean => event.isComposing || event.keyCode === 229;

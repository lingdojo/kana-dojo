export type ClassicGoAction =
  | 'game-modes-modal'
  | 'manual-selection'
  | 'auto-learning';

interface ClassicGoInput {
  isFilled: boolean;
  showExperimentalModes: boolean;
}

export function resolveClassicGoAction({
  isFilled,
  showExperimentalModes,
}: ClassicGoInput): ClassicGoAction {
  if (showExperimentalModes) return 'game-modes-modal';
  if (isFilled) return 'manual-selection';
  return 'auto-learning';
}

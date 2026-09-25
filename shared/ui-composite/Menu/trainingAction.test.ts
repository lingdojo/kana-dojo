import { describe, expect, it } from 'vitest';

import { resolveClassicGoAction } from './trainingAction';

describe('resolveClassicGoAction', () => {
  it('opens the game modes menu when experimental modes are on', () => {
    expect(
      resolveClassicGoAction({
        isFilled: true,
        showExperimentalModes: true,
      }),
    ).toBe('game-modes-modal');
  });

  it('uses the selected range when one is available', () => {
    expect(
      resolveClassicGoAction({
        isFilled: true,
        showExperimentalModes: false,
      }),
    ).toBe('manual-selection');
  });

  it('uses auto-learning when no range is selected', () => {
    expect(
      resolveClassicGoAction({
        isFilled: false,
        showExperimentalModes: false,
      }),
    ).toBe('auto-learning');
  });
});

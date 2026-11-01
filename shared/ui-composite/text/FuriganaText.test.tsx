import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FuriganaText from './FuriganaText';

vi.mock('@/features/Preferences', () => ({
  useThemePreferences: () => ({ furiganaEnabled: true }),
}));

describe('FuriganaText', () => {
  it('removes the romaji prefix from data-formatted readings in both render paths', () => {
    const { rerender } = render(
      <FuriganaText text='男' reading='otoko おとこ' />,
    );

    expect(screen.getByText('おとこ')).not.toBeNull();
    expect(screen.queryByText('otoko おとこ')).toBeNull();

    rerender(
      <FuriganaText text='unused' reading='otoko おとこ'>
        男
      </FuriganaText>,
    );

    expect(screen.getByText('おとこ')).not.toBeNull();
    expect(screen.queryByText('otoko おとこ')).toBeNull();
  });

  it('leaves kana-only readings unchanged', () => {
    render(<FuriganaText text='男' reading='おとこ' />);

    expect(screen.getByText('おとこ')).not.toBeNull();
  });
});

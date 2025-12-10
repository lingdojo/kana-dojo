import clsx from 'clsx';

export const cardBorderStyles = clsx(
  'rounded-xl bg-[var(--card-color)]'
);

export const buttonBorderStyles = clsx(
  'rounded-xl bg-[var(--card-color)] hover:cursor-pointer',
  'duration-275',
  'transition-all ease-in-out',
  // 'active:scale-85 md:active:scale-90 active:duration-300',
  // 'border-b-4 border-[var(--border-color)] '
);

export const miniButtonBorderStyles = clsx(
  'rounded-xl bg-[var(--background-color)] hover:cursor-pointer',
  'duration-275',
  'transition-all ease-in-out',
  // 'active:scale-95 md:active:scale-98 active:duration-300',
  // 'border-b-4 border-[var(--border-color)] '
);

'use client';
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';
import { useThemePreferences } from '@/features/Preferences';

const actionButtonVariants = cva(
  'p-2 text-lg w-full hover:cursor-pointer flex flex-row justify-center items-center gap-2 ',
  {
    variants: {
      colorScheme: {
        main: 'bg-(--main-color) text-(--background-color)',
        secondary: 'bg-(--secondary-color) text-(--background-color)',
      },
      borderColorScheme: {
        main: 'border-(--main-color-accent)',
        secondary: 'border-(--secondary-color-accent)',
      },
      borderRadius: {
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        '4xl': 'rounded-[2rem]',
        full: 'rounded-full',
      },
      borderBottomThickness: {
        0: 'border-b-0 active:border-b-0 active:translate-y-0',
        2: 'border-b-2 active:border-b-0 active:translate-y-[2px] active:mb-[2px]',
        4: 'border-b-4 active:border-b-0 active:translate-y-[4px] active:mb-[4px]',
        6: 'border-b-6 active:border-b-0 active:translate-y-[6px] active:mb-[6px]',
        8: 'border-b-8 active:border-b-0 active:translate-y-[8px] active:mb-[8px]',
        10: 'border-b-10 active:border-b-0 active:translate-y-[10px] active:mb-[10px]',
        12: 'border-b-12 active:border-b-0 active:translate-y-[12px] active:mb-[12px]',
        14: 'border-b-14 active:border-b-0 active:translate-y-[14px] active:mb-[14px]',
        16: 'border-b-16 active:border-b-0 active:translate-y-[16px] active:mb-[16px]',
        18: 'border-b-18 active:border-b-0 active:translate-y-[18px] active:mb-[18px]',
        20: 'border-b-20 active:border-b-0 active:translate-y-[20px] active:mb-[20px]',
      },
    },
    defaultVariants: {
      colorScheme: 'main',
      borderColorScheme: 'main',
      borderRadius: '2xl',
      borderBottomThickness: 6,
    },
  },
);

export interface ActionButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof actionButtonVariants> {
  /** When true, applies a smooth gradient background (main → secondary) */
  gradient?: boolean;
  /** When true, reverses the gradient direction (secondary → main) */
  gradientReversed?: boolean;
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      className,
      colorScheme,
      borderColorScheme,
      borderRadius,
      borderBottomThickness,
      gradient = false,
      gradientReversed = false,
      children,
      ...props
    },
    ref,
  ) => {
    const { isGlassMode } = useThemePreferences();

    const gradientClass = gradientReversed
      ? 'bg-gradient-to-r from-(--secondary-color) to-(--main-color)'
      : 'bg-gradient-to-r from-(--main-color) to-(--secondary-color)';

    // When gradient is enabled, match border color to the left side of the gradient
    const effectiveBorderColorScheme = gradient
      ? gradientReversed
        ? 'secondary'
        : 'main'
      : borderColorScheme;

    return (
      <button
        type='button'
        className={cn(
          actionButtonVariants({
            colorScheme: gradient ? undefined : colorScheme,
            borderColorScheme: effectiveBorderColorScheme,
            borderRadius,
            borderBottomThickness,
            className,
          }),
          gradient && `${gradientClass} text-(--background-color)`,
          isGlassMode &&
            'opacity-80 transition-opacity duration-200 hover:opacity-90',
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);

ActionButton.displayName = 'ActionButton';

export { ActionButton, actionButtonVariants };

'use client';
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const actionButtonVariants = cva(
  'p-2  text-lg w-full hover:cursor-pointer flex flex-row justify-center items-center gap-2 ',
  {
    variants: {
      colorScheme: {
        main: 'bg-[var(--main-color)] text-[var(--background-color)]',
        secondary: 'bg-[var(--secondary-color)] text-[var(--background-color)]'
      },
      borderColorScheme: {
        main: 'border-[var(--main-color-accent)]',
        secondary: 'border-[var(--secondary-color-accent)]'
      },
      borderRadius: {
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full'
      },
      borderBottomThickness: {
        0: 'border-b-0 active:border-b-0 active:translate-y-0',
        2: 'border-b-2 active:border-b-0 active:translate-y-[2px] active:mb-[2px]',
        4: 'border-b-4 active:border-b-0 active:translate-y-[4px] active:mb-[4px]',
        6: 'border-b-6 active:border-b-0 active:translate-y-[6px] active:mb-[6px]',
        8: 'border-b-8 active:border-b-0 active:translate-y-[8px] active:mb-[8px]'
      }
    },
    defaultVariants: {
      colorScheme: 'main',
      borderColorScheme: 'main',
      borderRadius: '2xl',
      borderBottomThickness: 6
    }
  }
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
    ref
  ) => {
    const gradientClass = gradientReversed
      ? 'bg-gradient-to-r from-[var(--secondary-color)] to-[var(--main-color)]'
      : 'bg-gradient-to-r from-[var(--main-color)] to-[var(--secondary-color)]';

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
            className
          }),
          gradient && `${gradientClass} text-[var(--background-color)]`
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ActionButton.displayName = 'ActionButton';

export { ActionButton, actionButtonVariants };

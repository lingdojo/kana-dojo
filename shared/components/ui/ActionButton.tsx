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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof actionButtonVariants> {}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      className,
      colorScheme,
      borderColorScheme,
      borderRadius,
      borderBottomThickness,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        type='button'
        className={cn(
          actionButtonVariants({
            colorScheme,
            borderColorScheme,
            borderRadius,
            borderBottomThickness,
            className
          })
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

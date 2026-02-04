import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--main-color) focus-visible:ring-offset-2 focus-visible:ring-offset-(--background-color) disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-(--main-color) text-(--background-color) shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] hover:brightness-110 hover:shadow-[0_12px_36px_-16px_rgba(0,0,0,0.55)] active:brightness-95',
        destructive:
          'bg-red-500 text-white shadow-sm hover:bg-red-600 focus-visible:ring-red-500',
        outline:
          'border border-(--border-color) bg-transparent text-(--main-color) hover:bg-(--card-color) hover:text-(--main-color)',
        secondary:
          'border border-(--border-color) bg-(--card-color) text-(--main-color) shadow-sm hover:bg-(--border-color)',
        ghost:
          'bg-transparent text-(--main-color) hover:bg-(--card-color)',
        link: 'text-(--main-color) underline-offset-4 hover:text-(--secondary-color) hover:underline',
      },
      size: {
        default: 'h-10 px-5',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };

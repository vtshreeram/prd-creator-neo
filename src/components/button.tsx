import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[#374151] text-white hover:bg-[#1f2937] active:bg-[#111827]',
        primary:
          'bg-[#6366f1] text-white hover:bg-[#4f46e5] active:bg-[#4338ca]',
        destructive:
          'bg-[#dc2626] text-white hover:bg-[#b91c1c] active:bg-[#991b1b]',
        outline:
          'border border-[#e5e7eb] bg-white text-[#374151] hover:bg-[#f9fafb] active:bg-[#f3f4f6]',
        secondary:
          'bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb] active:bg-[#d1d5db]',
        ghost:
          'bg-transparent text-[#374151] hover:bg-[#f3f4f6] active:bg-[#e5e7eb]',
        link: 'text-[#6366f1] underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 py-1 text-xs',
        lg: 'h-11 px-8 py-3',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

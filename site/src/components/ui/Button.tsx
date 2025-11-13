import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  asChild?: boolean;
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2 rounded-md font-medium',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        // Variants
        variant === 'default' &&
          'bg-gray-900 text-white hover:bg-gray-800',
        variant === 'ghost' && 'hover:bg-gray-100',
        variant === 'outline' &&
          'border border-gray-300 bg-transparent hover:bg-gray-50',
        // Sizes
        size === 'default' && 'h-10 px-4 py-2',
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'lg' && 'h-12 px-6 text-lg',
        className
      )}
      {...props}
    />
  );
}

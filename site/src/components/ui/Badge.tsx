import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5',
        'text-xs font-medium transition-colors',
        variant === 'default' &&
          'bg-gray-900 text-white',
        variant === 'secondary' &&
          'bg-gray-100 text-gray-700',
        variant === 'outline' &&
          'border border-gray-300 text-gray-900',
        className
      )}
      {...props}
    />
  );
}

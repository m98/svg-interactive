import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'flex h-10 w-full items-center justify-between',
        'rounded-md border border-gray-300',
        'bg-white px-3 py-2',
        'text-sm placeholder:text-gray-500',
        'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

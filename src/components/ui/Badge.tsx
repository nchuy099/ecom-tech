import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'accent' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    brand:
      'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
    accent:
      'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60',
    warning:
      'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    danger:
      'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
    info:
      'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
    neutral:
      'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    outline:
      'bg-transparent border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium border',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium border',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 leading-none transition-colors', variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};

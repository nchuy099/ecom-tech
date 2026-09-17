import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none rounded-xl';

    const variants = {
      primary:
        'bg-brand-600 hover:bg-brand-500 text-white shadow-sm shadow-brand-600/20 focus:ring-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400 dark:text-zinc-950 dark:font-semibold',
      secondary:
        'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 focus:ring-zinc-400 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100',
      outline:
        'border border-zinc-300 hover:bg-zinc-100/70 text-zinc-800 focus:ring-zinc-400 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800/70',
      ghost:
        'hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 focus:ring-zinc-400 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:hover:text-zinc-100',
      danger:
        'bg-rose-600 hover:bg-rose-500 text-white shadow-sm focus:ring-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

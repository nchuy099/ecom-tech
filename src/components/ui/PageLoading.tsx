import React from 'react';
import { cn } from '../../utils/cn';

type PageLoadingVariant = 'cards' | 'detail' | 'list';

interface PageLoadingProps {
  variant?: PageLoadingVariant;
  className?: string;
  label?: string;
}

const Skeleton = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn('animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80 motion-reduce:animate-none', className)}
  />
);

export const LoadingCardGrid: React.FC<{ count?: number; className?: string; label?: string }> = ({
  count = 6,
  className,
  label = 'Đang tải dữ liệu',
}) => (
  <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3', className)} role="status" aria-live="polite" aria-label={label}>
    <span className="sr-only">{label}</span>
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="space-y-3 rounded-2xl border border-zinc-200/70 p-3 dark:border-zinc-800/80">
        <Skeleton className="aspect-square w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    ))}
  </div>
);

export const LoadingList: React.FC<{ count?: number; className?: string; label?: string }> = ({
  count = 4,
  className,
  label = 'Đang tải dữ liệu',
}) => (
  <div className={cn('space-y-3', className)} role="status" aria-live="polite" aria-label={label}>
    <span className="sr-only">{label}</span>
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="flex gap-4 rounded-2xl border border-zinc-200/70 p-4 dark:border-zinc-800/80">
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-3"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-1/3" /></div>
      </div>
    ))}
  </div>
);

export const PageLoading: React.FC<PageLoadingProps> = ({
  variant = 'list',
  className,
  label = 'Đang tải dữ liệu',
}) => {
  if (variant === 'detail') {
    return (
      <div className={cn('mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8', className)} role="status" aria-live="polite" aria-label={label}>
        <span className="sr-only">{label}</span>
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="space-y-5 py-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 gap-3"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className={cn('mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8', className)} role="status" aria-live="polite" aria-label={label}>
        <span className="sr-only">{label}</span>
        <div className="space-y-3"><Skeleton className="h-9 w-56" /><Skeleton className="h-4 w-80 max-w-full" /></div>
        <LoadingCardGrid count={8} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" label={label} />
      </div>
    );
  }

  return (
    <div className={cn('mx-auto max-w-5xl space-y-5 px-4 py-8 sm:px-6 lg:px-8', className)} role="status" aria-live="polite" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div className="space-y-3"><Skeleton className="h-9 w-56" /><Skeleton className="h-4 w-80 max-w-full" /></div>
      <LoadingList count={5} label={label} />
    </div>
  );
};

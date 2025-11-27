import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[#E9ECEF]', className)}
      {...props}
    />
  );
}

export { Skeleton };



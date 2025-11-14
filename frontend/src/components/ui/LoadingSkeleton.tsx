/**
 * Basic loading skeleton for text content
 * 
 * @example
 * ```tsx
 * <LoadingSkeleton />
 * ```
 */
export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-base-300 rounded w-3/4"></div>
      <div className="h-4 bg-base-300 rounded"></div>
      <div className="h-4 bg-base-300 rounded w-5/6"></div>
    </div>
  );
}

/**
 * Table loading skeleton with multiple rows
 * 
 * @param rows - Number of skeleton rows to display (default: 5)
 * 
 * @example
 * ```tsx
 * <TableSkeleton rows={10} />
 * ```
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4">
          <div className="h-12 bg-base-300 rounded flex-1"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Card loading skeleton for card-based content
 * 
 * @example
 * ```tsx
 * <CardSkeleton />
 * ```
 */
export function CardSkeleton() {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-base-300 rounded w-1/4"></div>
          <div className="h-4 bg-base-300 rounded"></div>
          <div className="h-4 bg-base-300 rounded w-5/6"></div>
          <div className="h-32 bg-base-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Shimmer loading skeleton with animated gradient
 * 
 * @example
 * ```tsx
 * <ShimmerSkeleton />
 * ```
 */
export function ShimmerSkeleton() {
  return (
    <div className="relative overflow-hidden bg-base-300 rounded">
      <div 
        className="absolute inset-0 animate-shimmer"
        style={{
          backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          backgroundSize: '1000px 100%',
        }}
      />
      <div className="h-20"></div>
    </div>
  );
}

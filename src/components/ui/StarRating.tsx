import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
  count?: number;
}

export default function StarRating({ rating, size = 'sm', showCount = false, count = 0 }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {stars.map((s) => (
          <Star
            key={s}
            className={`${iconSize} ${s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
          />
        ))}
      </div>
      {showCount && count > 0 && (
        <span className="text-xs text-gray-500 ml-1">({count})</span>
      )}
    </div>
  );
}

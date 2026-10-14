import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars: React.FC<{
  rating: number;
  numReviews?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}> = ({ rating, numReviews, size = 'sm', showNumber = true }) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= fullStars
                ? 'fill-amber-400 text-amber-400'
                : star === fullStars + 1 && hasHalfStar
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs font-semibold text-slate-700 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
      {numReviews !== undefined && (
        <span className="text-xs text-slate-400">({numReviews})</span>
      )}
    </div>
  );
};

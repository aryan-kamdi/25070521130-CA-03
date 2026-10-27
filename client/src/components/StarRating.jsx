import React from 'react';

const StarRating = ({
  rating = 0,
  maxStars = 5,
  isInteractive = false,
  onChange = () => {},
  size = 'md'
}) => {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    const isFilled = i <= Math.round(rating);

    if (isInteractive) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`star-btn ${isFilled ? 'active' : ''}`}
          onClick={() => onChange(i)}
          aria-label={`Rate ${i} of ${maxStars} stars`}
        >
          ★
        </button>
      );
    } else {
      stars.push(
        <span
          key={i}
          style={{
            color: isFilled ? 'var(--accent-gold)' : '#334155',
            fontSize: size === 'lg' ? '1.5rem' : size === 'sm' ? '0.85rem' : '1.1rem',
            lineHeight: 1
          }}
        >
          ★
        </span>
      );
    }
  }

  return (
    <div
      className={isInteractive ? 'star-rating-picker' : 'rating-badge'}
      aria-label={`Rating: ${rating} out of ${maxStars} stars`}
    >
      {stars}
      {!isInteractive && (
        <span style={{ marginLeft: '0.25rem' }}>
          {rating > 0 ? rating.toFixed(1) : 'No reviews'}
        </span>
      )}
    </div>
  );
};

export default StarRating;


import React, { useState } from 'react';
import StarRating from './StarRating';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

const ReviewForm = ({ movieId, existingReview, onReviewSubmitted, onCancel }) => {
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 5);
  const [comment, setComment] = useState(existingReview ? existingReview.comment : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!rating || rating < 1 || rating > 5) {
      setError('Please choose a rating between 1 and 5 stars.');
      return;
    }

    if (!comment.trim()) {
      setError('Please share your thoughts in a comment.');
      return;
    }

    setSubmitting(true);
    try {
      if (existingReview) {
        // Edit existing review
        const res = await api.put(`/reviews/${existingReview._id}`, {
          rating,
          comment: comment.trim()
        });
        showToast('Review updated successfully!', 'success');
        onReviewSubmitted(res.data.review);
      } else {
        // Add new review
        const res = await api.post(`/movies/${movieId}/reviews`, {
          rating,
          comment: comment.trim()
        });
        showToast('Thank you! Your review was posted.', 'success');
        onReviewSubmitted(res.data.review);
        setComment('');
        setRating(5);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit your review.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="review-card"
      style={{ background: 'var(--bg-surface)', marginTop: '1.5rem' }}
    >
      <h4 style={{ marginBottom: '1rem', color: '#fff' }}>
        {existingReview ? '✏️ Edit Your Review' : '✍️ Write a Review'}
      </h4>

      {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="form-group">
        <label className="form-label">Your Rating (1 to 5 Stars):</label>
        <StarRating
          rating={rating}
          isInteractive={true}
          onChange={(newVal) => setRating(newVal)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="review-comment" className="form-label">
          Your Review:
        </label>
        <textarea
          id="review-comment"
          className="form-textarea"
          rows={3}
          placeholder="What did you think of the direction, actors, plot, and soundtrack?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          required
        />
        <span className="form-hint" style={{ alignSelf: 'flex-end' }}>
          {comment.length} / 1000 characters
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={submitting}
        >
          {submitting
            ? 'Submitting...'
            : existingReview
            ? 'Update Review'
            : 'Post Review'}
        </button>

        {existingReview && onCancel && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;


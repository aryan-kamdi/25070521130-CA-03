import React, { useState } from 'react';
import StarRating from './StarRating';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

const ReviewList = ({ reviews = [], onReviewDeleted, onEditReview }) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    setDeletingId(reviewId);
    try {
      await api.delete(`/reviews/${reviewId}`);
      showToast('Review deleted.', 'info');
      if (onReviewDeleted) onReviewDeleted(reviewId);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete review.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '2rem 1rem' }}>
        <p>No reviews yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="reviews-list">
      {reviews.map((rev) => {
        const reviewAuthorId = rev.user?._id || rev.user;
        const currentUserId = user?.id || user?._id;
        const isAuthor = reviewAuthorId?.toString() === currentUserId?.toString();
        const canManage = isAuthor || isAdmin;
        const authorName = rev.user?.name || 'Anonymous Viewer';
        const initial = authorName.charAt(0).toUpperCase();

        return (
          <article key={rev._id} className="review-card">
            <div className="review-header">
              <div className="review-user-info">
                <div className="review-avatar" aria-hidden="true">
                  {initial}
                </div>
                <div>
                  <div className="review-author">{authorName}</div>
                  <div className="review-date">{formatDate(rev.createdAt)}</div>
                </div>
              </div>
              <StarRating rating={rev.rating} size="sm" />
            </div>

            <p className="review-text">{rev.comment}</p>

            {canManage && (
              <div className="review-actions">
                {isAuthor && onEditReview && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ minHeight: '32px', fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}
                    onClick={() => onEditReview(rev)}
                  >
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={{ minHeight: '32px', fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}
                  onClick={() => handleDelete(rev._id)}
                  disabled={deletingId === rev._id}
                >
                  {deletingId === rev._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default ReviewList;


import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/StarRating';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import LoadingSpinner from '../components/LoadingSpinner';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/movies/${id}`);
      setMovie(res.data.movie);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error('Failed to load movie details:', err);
      setError(err.response?.data?.message || 'Unable to retrieve movie details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  // Check if this movie is in the user's watchlist
  const isInWatchlist = user?.watchlist?.some(
    (item) => (item._id ? item._id.toString() : item.toString()) === id
  );

  const handleToggleWatchlist = async () => {
    if (watchlistLoading || !movie) return;

    setWatchlistLoading(true);
    try {
      if (isInWatchlist) {
        await api.delete(`/watchlist/${movie._id}`);
        const updated = (user?.watchlist || []).filter(
          (m) => (m._id ? m._id.toString() : m.toString()) !== movie._id.toString()
        );
        updateUser({ watchlist: updated });
        showToast(`Removed "${movie.title}" from your watchlist.`, 'info');
      } else {
        await api.post(`/watchlist/${movie._id}`);
        const updated = [...(user?.watchlist || []), movie._id];
        updateUser({ watchlist: updated });
        showToast(`Added "${movie.title}" to your watchlist!`, 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update watchlist.', 'error');
    } finally {
      setWatchlistLoading(false);
    }
  };

  // Called after a review is created or updated
  const handleReviewSaved = (savedReview) => {
    setReviews((prev) => {
      const existsIndex = prev.findIndex((r) => r._id === savedReview._id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = savedReview;
        return copy;
      }
      return [savedReview, ...prev];
    });

    // Recalculate average rating locally
    const updatedReviews = reviews.some((r) => r._id === savedReview._id)
      ? reviews.map((r) => (r._id === savedReview._id ? savedReview : r))
      : [savedReview, ...reviews];

    const total = updatedReviews.reduce((sum, item) => sum + item.rating, 0);
    const avg = Number((total / updatedReviews.length).toFixed(1));

    setMovie((prev) => ({
      ...prev,
      averageRating: avg,
      reviewCount: updatedReviews.length
    }));

    setEditingReview(null);
  };

  // Called after a review is deleted
  const handleReviewDeleted = (deletedId) => {
    const remaining = reviews.filter((r) => r._id !== deletedId);
    setReviews(remaining);

    const total = remaining.reduce((sum, item) => sum + item.rating, 0);
    const avg = remaining.length > 0 ? Number((total / remaining.length).toFixed(1)) : 0;

    setMovie((prev) => ({
      ...prev,
      averageRating: avg,
      reviewCount: remaining.length
    }));

    if (editingReview?._id === deletedId) {
      setEditingReview(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading movie information and reviews..." />;
  }

  if (error || !movie) {
    return (
      <main className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="empty-state">
          <span className="empty-icon" role="img" aria-label="Error">
            ⚠️
          </span>
          <h2>Film Not Found</h2>
          <p>{error || 'The requested movie does not exist in the database.'}</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            ← Back to Movie Hub
          </Link>
        </div>
      </main>
    );
  }

  // Find if user already wrote a review
  const currentUserId = user?.id || user?._id;
  const userExistingReview = reviews.find(
    (r) => (r.user?._id || r.user)?.toString() === currentUserId?.toString()
  );

  return (
    <main className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
      {/* Breadcrumb / Back Link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" className="btn btn-outline btn-sm">
          ← Back to Movies
        </Link>
      </div>

      {/* Hero Overview */}
      <section className="movie-detail-hero">
        <div className="movie-detail-grid">
          {/* Poster */}
          <div className="detail-poster-wrap">
            <img
              src={movie.poster}
              alt={`${movie.title} poster`}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
              }}
            />
          </div>

          {/* Metadata & Actions */}
          <div className="detail-content">
            <div>
              <div className="detail-meta" style={{ marginBottom: '0.75rem' }}>
                <span className="genre-tag">{movie.genre}</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                  Release Year: {movie.year}
                </span>
              </div>
              <h1 className="detail-title">{movie.title}</h1>
            </div>

            {/* Average Rating Box */}
            <div className="detail-rating-box">
              <StarRating rating={movie.averageRating || 0} size="lg" />
              <span>
                {movie.averageRating > 0 ? `${movie.averageRating} / 5` : 'No rating yet'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                ({reviews.length} {reviews.length === 1 ? 'user review' : 'user reviews'})
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#fff' }}>
                Overview
              </h3>
              <p className="detail-description">{movie.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="detail-actions">
              <button
                type="button"
                className={`btn ${isInWatchlist ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleToggleWatchlist}
                disabled={watchlistLoading}
              >
                {watchlistLoading
                  ? 'Updating...'
                  : isInWatchlist
                  ? '❌ Remove from Watchlist'
                  : '🔖 Add to Watchlist'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews & Star Rating Form Section */}
      <section className="reviews-section">
        <div className="reviews-header">
          <div>
            <h2 style={{ fontSize: '1.6rem' }}>Audience Reviews & Ratings</h2>
            <p style={{ fontSize: '0.9rem' }}>
              Read authentic opinions from the FLEXI community or submit your own.
            </p>
          </div>
        </div>

        {/* Review Form: Render either editing or new */}
        {editingReview ? (
          <ReviewForm
            movieId={movie._id}
            existingReview={editingReview}
            onReviewSubmitted={handleReviewSaved}
            onCancel={() => setEditingReview(null)}
          />
        ) : userExistingReview ? (
          <div
            className="review-card"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid rgba(245, 197, 24, 0.3)',
              marginBottom: '2rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span className="genre-tag" style={{ background: 'var(--accent-gold)', color: '#000' }}>
                  ✓ You reviewed this movie
                </span>
                <p style={{ marginTop: '0.5rem', color: '#fff', fontSize: '1rem' }}>
                  "{userExistingReview.comment}"
                </p>
                <div style={{ marginTop: '0.35rem' }}>
                  <StarRating rating={userExistingReview.rating} size="sm" />
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setEditingReview(userExistingReview)}
              >
                ✏️ Edit My Review
              </button>
            </div>
          </div>
        ) : (
          <ReviewForm
            movieId={movie._id}
            onReviewSubmitted={handleReviewSaved}
          />
        )}

        {/* Existing Reviews List */}
        <div style={{ marginTop: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
            All Reviews ({reviews.length})
          </h3>
          <ReviewList
            reviews={reviews}
            onReviewDeleted={handleReviewDeleted}
            onEditReview={(rev) => setEditingReview(rev)}
          />
        </div>
      </section>
    </main>
  );
};

export default MovieDetailsPage;


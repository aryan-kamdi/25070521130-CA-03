import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const { updateUser } = useAuth();
  const { showToast } = useToast();

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/watchlist');
      setWatchlist(res.data.watchlist || []);
      // Also update local user watchlist IDs to keep sync
      const ids = (res.data.watchlist || []).map((m) => m._id);
      updateUser({ watchlist: ids });
    } catch (err) {
      console.error('Failed to load watchlist:', err);
      showToast('Could not retrieve your watchlist.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (movieId, movieTitle) => {
    setRemovingId(movieId);
    try {
      await api.delete(`/watchlist/${movieId}`);
      const updated = watchlist.filter((m) => m._id !== movieId);
      setWatchlist(updated);
      updateUser({ watchlist: updated.map((m) => m._id) });
      showToast(`Removed "${movieTitle}" from your watchlist.`, 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove movie.', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <main className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>🔖 My Watchlist</h1>
          <p style={{ marginTop: '0.25rem' }}>
            Films you have saved to enjoy later. You can quickly view details or remove them.
          </p>
        </div>
        <span
          className="genre-tag"
          style={{
            fontSize: '0.85rem',
            padding: '0.35rem 0.85rem',
            background: 'var(--bg-surface)'
          }}
        >
          {watchlist.length} Saved {watchlist.length === 1 ? 'Movie' : 'Movies'}
        </span>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching your saved watchlist..." />
      ) : watchlist.length > 0 ? (
        <div className="movie-grid">
          {watchlist.map((movie) => (
            <div key={movie._id} className="movie-card">
              <div className="movie-poster-wrap">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="movie-poster"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
                  }}
                />
                <div className="movie-poster-overlay" />
                <button
                  type="button"
                  className="movie-watchlist-btn active"
                  onClick={() => handleRemove(movie._id, movie.title)}
                  title="Remove from Watchlist"
                  aria-label={`Remove ${movie.title} from Watchlist`}
                  disabled={removingId === movie._id}
                >
                  ✕
                </button>
              </div>

              <div className="movie-info">
                <div className="movie-meta-row">
                  <span className="genre-tag">{movie.genre}</span>
                  <span className="movie-year">{movie.year}</span>
                </div>

                <Link to={`/movie/${movie._id}`}>
                  <h3 className="movie-title" title={movie.title}>
                    {movie.title}
                  </h3>
                </Link>

                <div className="movie-rating-row">
                  <StarRating rating={movie.averageRating || 0} size="sm" />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    style={{ minHeight: '32px', fontSize: '0.78rem', padding: '0.2rem 0.65rem' }}
                    onClick={() => handleRemove(movie._id, movie.title)}
                    disabled={removingId === movie._id}
                  >
                    {removingId === movie._id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon" role="img" aria-label="Empty Watchlist">
            🎬
          </span>
          <h2>Your Watchlist is Empty</h2>
          <p style={{ maxWidth: '480px', margin: '0.5rem auto 1.5rem' }}>
            You haven't saved any movies yet. Explore the catalog and click the star icon on any movie to bookmark it!
          </p>
          <Link to="/" className="btn btn-primary">
            Explore Movies Now
          </Link>
        </div>
      )}
    </main>
  );
};

export default WatchlistPage;


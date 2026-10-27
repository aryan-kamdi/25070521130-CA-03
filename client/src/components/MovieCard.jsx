import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import StarRating from './StarRating';

const MovieCard = ({ movie, onWatchlistChange }) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [imgSrc, setImgSrc] = useState(movie.poster);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  // Check if movie is currently in user's watchlist
  const isInWatchlist = user?.watchlist?.some(
    (id) => (id._id ? id._id.toString() : id.toString()) === movie._id.toString()
  );

  const handleWatchlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loadingWatchlist) return;

    setLoadingWatchlist(true);
    try {
      if (isInWatchlist) {
        await api.delete(`/watchlist/${movie._id}`);
        const updatedWatchlist = (user?.watchlist || []).filter(
          (id) => (id._id ? id._id.toString() : id.toString()) !== movie._id.toString()
        );
        updateUser({ watchlist: updatedWatchlist });
        showToast(`Removed "${movie.title}" from watchlist.`, 'info');
        if (onWatchlistChange) onWatchlistChange(movie._id, false);
      } else {
        await api.post(`/watchlist/${movie._id}`);
        const updatedWatchlist = [...(user?.watchlist || []), movie._id];
        updateUser({ watchlist: updatedWatchlist });
        showToast(`Added "${movie.title}" to watchlist!`, 'success');
        if (onWatchlistChange) onWatchlistChange(movie._id, true);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update watchlist.', 'error');
    } finally {
      setLoadingWatchlist(false);
    }
  };

  const handleImageError = () => {
    // Elegant fallback poster placeholder
    setImgSrc(
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80'
    );
  };

  return (
    <div className="movie-card">
      <div className="movie-poster-wrap">
        <img
          src={imgSrc}
          alt={`${movie.title} poster`}
          className="movie-poster"
          loading="lazy"
          onError={handleImageError}
        />
        <div className="movie-poster-overlay" />

        {/* Watchlist Quick Toggle Button */}
        <button
          type="button"
          className={`movie-watchlist-btn ${isInWatchlist ? 'active' : ''}`}
          onClick={handleWatchlistToggle}
          title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          aria-label={isInWatchlist ? `Remove ${movie.title} from Watchlist` : `Add ${movie.title} to Watchlist`}
          disabled={loadingWatchlist}
        >
          {isInWatchlist ? '★' : '☆'}
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
          <span className="rating-count">
            {movie.reviewCount || 0} {movie.reviewCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;


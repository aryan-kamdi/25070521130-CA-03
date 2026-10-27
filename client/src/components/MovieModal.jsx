import React, { useState, useEffect } from 'react';

const MovieModal = ({ isOpen, onClose, onSave, movie = null, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Action',
    year: new Date().getFullYear(),
    poster: '',
    description: ''
  });
  const [validationError, setValidationError] = useState('');

  const genres = [
    'Action',
    'Sci-Fi',
    'Drama',
    'Comedy',
    'Thriller',
    'Crime',
    'Animation',
    'Horror',
    'Romance',
    'Adventure',
    'Fantasy',
    'Mystery'
  ];

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        genre: movie.genre || 'Action',
        year: movie.year || new Date().getFullYear(),
        poster: movie.poster || '',
        description: movie.description || ''
      });
    } else {
      setFormData({
        title: '',
        genre: 'Action',
        year: new Date().getFullYear(),
        poster: '',
        description: ''
      });
    }
    setValidationError('');
  }, [movie, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.title.trim()) {
      setValidationError('Movie title cannot be empty.');
      return;
    }
    if (!formData.poster.trim()) {
      setValidationError('Poster URL is required.');
      return;
    }
    if (!formData.description.trim()) {
      setValidationError('Description is required.');
      return;
    }
    if (!formData.year || formData.year < 1888 || formData.year > 2100) {
      setValidationError('Please provide a valid release year.');
      return;
    }

    onSave(formData);
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-modal-title"
      onClick={onClose}
    >
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="movie-modal-title">
            {movie ? '🎬 Edit Movie' : '➕ Add New Movie'}
          </h3>
          <button
            type="button"
            className="toast-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {validationError && (
              <div className="form-error" style={{ marginBottom: '1rem' }}>
                {validationError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="movie-title" className="form-label">
                Movie Title *
              </label>
              <input
                id="movie-title"
                name="title"
                type="text"
                className="form-input"
                placeholder="e.g. Inception"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="movie-genre" className="form-label">
                  Genre *
                </label>
                <select
                  id="movie-genre"
                  name="genre"
                  className="form-select"
                  value={formData.genre}
                  onChange={handleChange}
                  required
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="movie-year" className="form-label">
                  Release Year *
                </label>
                <input
                  id="movie-year"
                  name="year"
                  type="number"
                  min="1888"
                  max="2100"
                  className="form-input"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="movie-poster" className="form-label">
                Poster Image URL *
              </label>
              <input
                id="movie-poster"
                name="poster"
                type="url"
                className="form-input"
                placeholder="https://image.tmdb.org/t/p/w500/..."
                value={formData.poster}
                onChange={handleChange}
                required
              />
              <span className="form-hint">
                Provide a working image link (e.g. from TMDB or Unsplash)
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="movie-description" className="form-label">
                Description / Plot *
              </label>
              <textarea
                id="movie-description"
                name="description"
                className="form-textarea"
                rows={4}
                placeholder="Brief synopsis of the film..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : movie ? 'Update Movie' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieModal;


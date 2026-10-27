import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import MovieModal from '../components/MovieModal';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [filterText, setFilterText] = useState('');
  const { showToast } = useToast();

  const fetchAdminMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/movies');
      setMovies(res.data.movies || []);
    } catch (err) {
      console.error('Failed to fetch movies in admin:', err);
      showToast('Could not load movie inventory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminMovies();
  }, []);

  // Compute summary stats
  const stats = useMemo(() => {
    const totalMovies = movies.length;
    const genres = new Set(movies.map((m) => m.genre));
    const totalReviews = movies.reduce((sum, m) => sum + (m.reviewCount || 0), 0);
    const avgRating = totalMovies > 0
      ? (movies.reduce((sum, m) => sum + (m.averageRating || 0), 0) / totalMovies).toFixed(1)
      : 0;

    return {
      totalMovies,
      genreCount: genres.size,
      totalReviews,
      avgRating
    };
  }, [movies]);

  // Filter movies for table
  const displayedMovies = useMemo(() => {
    if (!filterText.trim()) return movies;
    const q = filterText.toLowerCase().trim();
    return movies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genre.toLowerCase().includes(q) ||
        m.year.toString().includes(q)
    );
  }, [movies, filterText]);

  // Open modal for creating movie
  const handleAddNew = () => {
    setSelectedMovie(null);
    setModalOpen(true);
  };

  // Open modal for editing movie
  const handleEdit = (movie) => {
    setSelectedMovie(movie);
    setModalOpen(true);
  };

  // Save movie (create or update)
  const handleSaveMovie = async (movieData) => {
    setSaving(true);
    try {
      if (selectedMovie) {
        // Update
        const res = await api.put(`/movies/${selectedMovie._id}`, movieData);
        setMovies((prev) =>
          prev.map((m) => (m._id === selectedMovie._id ? { ...m, ...res.data.movie } : m))
        );
        showToast(`Updated "${res.data.movie.title}" successfully.`, 'success');
      } else {
        // Create
        const res = await api.post('/movies', movieData);
        setMovies((prev) => [res.data.movie, ...prev]);
        showToast(`Created "${res.data.movie.title}" successfully.`, 'success');
      }
      setModalOpen(false);
      setSelectedMovie(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save movie.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete movie
  const handleDeleteMovie = async (movie) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${movie.title}"?\n\nThis will also remove all its reviews and delete it from all users' watchlists.`
    );
    if (!confirmed) return;

    setDeletingId(movie._id);
    try {
      await api.delete(`/movies/${movie._id}`);
      setMovies((prev) => prev.filter((m) => m._id !== movie._id));
      showToast(`Movie "${movie.title}" deleted successfully.`, 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete movie.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Top Header */}
      <div className="admin-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="admin-tag">ADMIN PRIVILEGES</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', marginTop: '0.4rem' }}>
            Movie Catalog Management
          </h1>
          <p>
            Create, modify, and delete movies. Changes immediately synchronize across client views.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddNew}
          aria-label="Add new movie"
        >
          ➕ Add New Movie
        </button>
      </div>

      {/* Metrics / Statistics Cards */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalMovies}</div>
          <div className="stat-label">Total Films</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.genreCount}</div>
          <div className="stat-label">Distinct Genres</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalReviews}</div>
          <div className="stat-label">Community Reviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.avgRating} ★</div>
          <div className="stat-label">Catalog Avg Rating</div>
        </div>
      </div>

      {/* Search and Table Filter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.25rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
          <input
            type="search"
            className="form-input"
            placeholder="Filter table by title, genre, year..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Showing {displayedMovies.length} of {movies.length} records
        </div>
      </div>

      {/* Movie Inventory Table */}
      {loading ? (
        <LoadingSpinner text="Loading admin inventory..." />
      ) : displayedMovies.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table" aria-label="Movie database table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Poster</th>
                <th>Title</th>
                <th>Genre</th>
                <th>Year</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedMovies.map((movie) => (
                <tr key={movie._id}>
                  <td>
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="table-poster-thumb"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
                      }}
                    />
                  </td>
                  <td>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>
                      {movie.title}
                    </strong>
                  </td>
                  <td>
                    <span className="genre-tag">{movie.genre}</span>
                  </td>
                  <td>{movie.year}</td>
                  <td>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
                      ★ {movie.averageRating ? movie.averageRating.toFixed(1) : '-'}
                    </span>
                  </td>
                  <td>{movie.reviewCount || 0}</td>
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleEdit(movie)}
                        aria-label={`Edit ${movie.title}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteMovie(movie)}
                        disabled={deletingId === movie._id}
                        aria-label={`Delete ${movie.title}`}
                      >
                        {deletingId === movie._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No matching movies</h3>
          <p>No films match your search filter "{filterText}".</p>
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      <MovieModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedMovie(null);
        }}
        onSave={handleSaveMovie}
        movie={selectedMovie}
        loading={saving}
      />
    </main>
  );
};

export default AdminPage;


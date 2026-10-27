import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const genresList = [
  'All Genres',
  'Action',
  'Sci-Fi',
  'Drama',
  'Crime',
  'Animation',
  'Thriller',
  'Comedy',
  'Fantasy',
  'Horror'
];

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [sortBy, setSortBy] = useState('latest');
  const { showToast } = useToast();

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/movies');
      setMovies(res.data.movies || []);
    } catch (err) {
      console.error('Failed to load movies:', err);
      showToast('Could not load movie catalog from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Live filtering without page reload
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    if (selectedGenre && selectedGenre !== 'All Genres') {
      result = result.filter(
        (m) => m.genre.toLowerCase() === selectedGenre.toLowerCase()
      );
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === 'year-desc') {
      result.sort((a, b) => b.year - a.year);
    } else if (sortBy === 'year-asc') {
      result.sort((a, b) => a.year - b.year);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [movies, searchQuery, selectedGenre, sortBy]);

  return (
    <main className="container" style={{ paddingBottom: '4rem' }}>
      {/* Hero Welcome Banner */}
      <section
        style={{
          padding: '2.75rem 2rem',
          margin: '2rem 0',
          background: 'linear-gradient(135deg, rgba(30, 34, 53, 0.8), rgba(21, 24, 36, 0.95))',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ zIndex: 1 }}>
          <span className="genre-tag" style={{ background: 'rgba(245, 197, 24, 0.15)' }}>
            🍿 College CA3 Assignment • CineHub
          </span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '0.75rem' }}>
            Discover, Review & Track Your <span style={{ color: 'var(--accent-gold)' }}>Favorite Films</span>
          </h1>
          <p style={{ maxWidth: '650px', fontSize: '1.05rem', color: '#cbd5e1' }}>
            Explore curated cinematic masterpieces, write detailed reviews with ratings, and maintain a personalized watch list.
          </p>
        </div>
      </section>

      {/* Filter and Search Controls Bar */}
      <section
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}
        aria-label="Movie filters and search"
      >
        {/* Search Box */}
        <div style={{ flex: '1 1 280px', minWidth: '220px' }}>
          <label htmlFor="search-input" className="form-label" style={{ marginBottom: '0.3rem' }}>
            Search Titles:
          </label>
          <input
            id="search-input"
            type="search"
            className="form-input"
            placeholder="Search by movie title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Genre Dropdown */}
        <div style={{ flex: '0 1 200px', minWidth: '160px' }}>
          <label htmlFor="genre-select" className="form-label" style={{ marginBottom: '0.3rem' }}>
            Filter by Genre:
          </label>
          <select
            id="genre-select"
            className="form-select"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            {genresList.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div style={{ flex: '0 1 180px', minWidth: '150px' }}>
          <label htmlFor="sort-select" className="form-label" style={{ marginBottom: '0.3rem' }}>
            Sort By:
          </label>
          <select
            id="sort-select"
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Latest Added</option>
            <option value="rating">Highest Rated</option>
            <option value="year-desc">Newest Release</option>
            <option value="year-asc">Oldest Release</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

        {/* Reset button if filters active */}
        {(searchQuery || selectedGenre !== 'All Genres' || sortBy !== 'latest') && (
          <div style={{ alignSelf: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('All Genres');
                setSortBy('latest');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Movies Grid / Content */}
      <section style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.4rem' }}>
            {selectedGenre !== 'All Genres' ? `${selectedGenre} Movies` : 'Featured Movies'}
          </h2>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 600 }}>
            Showing {filteredMovies.length} of {movies.length} movies
          </span>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching movies..." />
        ) : filteredMovies.length > 0 ? (
          <div className="movie-grid">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon" role="img" aria-label="No results">
              🔍
            </span>
            <h3>No movies found</h3>
            <p>
              We couldn't find any films matching "{searchQuery}". Try a different keyword or genre.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: '1.25rem' }}
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('All Genres');
              }}
            >
              Clear Search & Filter
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default HomePage;


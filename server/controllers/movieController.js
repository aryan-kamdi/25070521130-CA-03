const Movie = require('../models/Movie');
const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Get all movies with optional ?q= search & ?genre= filter + average ratings
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res) => {
  try {
    const { q, genre } = req.query;
    let query = {};

    // Search by title (case-insensitive)
    if (q && q.trim()) {
      query.title = { $regex: q.trim(), $options: 'i' };
    }

    // Filter by genre (case-insensitive exact or substring)
    if (genre && genre.trim() && genre.trim().toLowerCase() !== 'all') {
      query.genre = { $regex: new RegExp(`^${genre.trim()}$`, 'i') };
    }

    const movies = await Movie.find(query).sort({ createdAt: -1 }).lean();

    // Attach review stats (average rating & review count) to each movie
    const movieIds = movies.map((m) => m._id);
    const reviews = await Review.find({ movie: { $in: movieIds } }).lean();

    const statsMap = {};
    reviews.forEach((rev) => {
      const mId = rev.movie.toString();
      if (!statsMap[mId]) {
        statsMap[mId] = { totalRating: 0, count: 0 };
      }
      statsMap[mId].totalRating += rev.rating;
      statsMap[mId].count += 1;
    });

    const moviesWithStats = movies.map((m) => {
      const stats = statsMap[m._id.toString()] || { totalRating: 0, count: 0 };
      const avgRating = stats.count > 0 ? Number((stats.totalRating / stats.count).toFixed(1)) : 0;
      return {
        ...m,
        averageRating: avgRating,
        reviewCount: stats.count
      };
    });

    return res.status(200).json({
      count: moviesWithStats.length,
      movies: moviesWithStats
    });
  } catch (error) {
    console.error('getMovies error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve movies.',
      error: error.message
    });
  }
};

// @desc    Get single movie by ID with all reviews & average rating
// @route   GET /api/movies/:id
// @access  Public
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    // Fetch all reviews for this movie, populated with author's name and email
    const reviews = await Review.find({ movie: movie._id })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0);
    const averageRating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : 0;

    return res.status(200).json({
      movie: {
        ...movie.toObject(),
        averageRating,
        reviewCount: reviews.length
      },
      reviews
    });
  } catch (error) {
    console.error('getMovieById error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Movie ID format.' });
    }
    return res.status(500).json({
      message: 'Failed to retrieve movie details.',
      error: error.message
    });
  }
};

// @desc    Create a new movie (Admin only)
// @route   POST /api/movies
// @access  Private/Admin
exports.createMovie = async (req, res) => {
  try {
    const { title, genre, year, poster, description } = req.body;

    if (!title || !genre || !year || !poster || !description) {
      return res.status(400).json({
        message: 'Please provide all required fields: title, genre, year, poster, and description.'
      });
    }

    const numYear = Number(year);
    if (isNaN(numYear) || numYear < 1888 || numYear > 2100) {
      return res.status(400).json({
        message: 'Year must be a valid four-digit year (between 1888 and 2100).'
      });
    }

    const movie = await Movie.create({
      title: title.trim(),
      genre: genre.trim(),
      year: numYear,
      poster: poster.trim(),
      description: description.trim()
    });

    return res.status(201).json({
      message: 'Movie added successfully!',
      movie
    });
  } catch (error) {
    console.error('createMovie error:', error);
    return res.status(500).json({
      message: 'Failed to create movie.',
      error: error.message
    });
  }
};

// @desc    Update an existing movie (Admin only)
// @route   PUT /api/movies/:id
// @access  Private/Admin
exports.updateMovie = async (req, res) => {
  try {
    const { title, genre, year, poster, description } = req.body;

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    if (title !== undefined) movie.title = title.trim();
    if (genre !== undefined) movie.genre = genre.trim();
    if (year !== undefined) {
      const numYear = Number(year);
      if (isNaN(numYear) || numYear < 1888 || numYear > 2100) {
        return res.status(400).json({ message: 'Invalid release year provided.' });
      }
      movie.year = numYear;
    }
    if (poster !== undefined) movie.poster = poster.trim();
    if (description !== undefined) movie.description = description.trim();

    const updatedMovie = await movie.save();

    return res.status(200).json({
      message: 'Movie updated successfully!',
      movie: updatedMovie
    });
  } catch (error) {
    console.error('updateMovie error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Movie ID format.' });
    }
    return res.status(500).json({
      message: 'Failed to update movie.',
      error: error.message
    });
  }
};

// @desc    Delete a movie and associated reviews + remove from watchlists (Admin only)
// @route   DELETE /api/movies/:id
// @access  Private/Admin
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    // Delete associated reviews
    await Review.deleteMany({ movie: movie._id });

    // Pull from all users' watchlists
    await User.updateMany(
      { watchlist: movie._id },
      { $pull: { watchlist: movie._id } }
    );

    // Delete movie
    await movie.deleteOne();

    return res.status(200).json({
      message: `Movie "${movie.title}" and its associated data were deleted successfully.`
    });
  } catch (error) {
    console.error('deleteMovie error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Movie ID format.' });
    }
    return res.status(500).json({
      message: 'Failed to delete movie.',
      error: error.message
    });
  }
};


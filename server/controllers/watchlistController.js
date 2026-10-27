const User = require('../models/User');
const Movie = require('../models/Movie');
const Review = require('../models/Review');

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
exports.getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('watchlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Attach ratings to watchlist movies
    const movies = user.watchlist || [];
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

    const populatedWatchlist = movies.map((movie) => {
      const obj = movie.toObject ? movie.toObject() : movie;
      const stats = statsMap[obj._id.toString()] || { totalRating: 0, count: 0 };
      const avg = stats.count > 0 ? Number((stats.totalRating / stats.count).toFixed(1)) : 0;
      return {
        ...obj,
        averageRating: avg,
        reviewCount: stats.count
      };
    });

    return res.status(200).json({
      count: populatedWatchlist.length,
      watchlist: populatedWatchlist
    });
  } catch (error) {
    console.error('getWatchlist error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve watchlist.',
      error: error.message
    });
  }
};

// @desc    Add movie to watchlist
// @route   POST /api/watchlist/:movieId
// @access  Private
exports.addToWatchlist = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    const user = await User.findById(req.user._id);

    // Check if already in watchlist
    const isAlreadyIn = user.watchlist.some(
      (id) => id.toString() === movieId.toString()
    );

    if (isAlreadyIn) {
      return res.status(200).json({
        message: `"${movie.title}" is already in your watchlist.`,
        watchlist: user.watchlist
      });
    }

    user.watchlist.push(movie._id);
    await user.save();

    return res.status(200).json({
      message: `"${movie.title}" added to your watchlist!`,
      watchlist: user.watchlist
    });
  } catch (error) {
    console.error('addToWatchlist error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Movie ID format.' });
    }
    return res.status(500).json({
      message: 'Failed to add movie to watchlist.',
      error: error.message
    });
  }
};

// @desc    Remove movie from watchlist
// @route   DELETE /api/watchlist/:movieId
// @access  Private
exports.removeFromWatchlist = async (req, res) => {
  try {
    const { movieId } = req.params;

    const user = await User.findById(req.user._id);
    const movie = await Movie.findById(movieId);

    user.watchlist = user.watchlist.filter(
      (id) => id.toString() !== movieId.toString()
    );
    await user.save();

    const title = movie ? movie.title : 'Movie';

    return res.status(200).json({
      message: `"${title}" removed from your watchlist.`,
      watchlist: user.watchlist
    });
  } catch (error) {
    console.error('removeFromWatchlist error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Movie ID format.' });
    }
    return res.status(500).json({
      message: 'Failed to remove movie from watchlist.',
      error: error.message
    });
  }
};


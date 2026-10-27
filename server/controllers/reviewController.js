const Review = require('../models/Review');
const Movie = require('../models/Movie');

// @desc    Add review to a movie
// @route   POST /api/movies/:id/reviews
// @access  Private (logged-in user)
exports.createMovieReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const movieId = req.params.id;

    if (!rating || !comment) {
      return res.status(400).json({
        message: 'Please provide both a star rating (1-5) and a written comment.'
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        message: 'Rating must be a number between 1 and 5.'
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    // Check if user already submitted a review for this movie
    const alreadyReviewed = await Review.findOne({
      movie: movieId,
      user: req.user._id
    });

    if (alreadyReviewed) {
      // Automatically update the existing review if re-submitted
      alreadyReviewed.rating = numRating;
      alreadyReviewed.comment = comment.trim();
      await alreadyReviewed.save();

      const populated = await Review.findById(alreadyReviewed._id).populate('user', 'name email role');
      return res.status(200).json({
        message: 'Your review has been updated!',
        review: populated
      });
    }

    const review = await Review.create({
      movie: movieId,
      user: req.user._id,
      rating: numRating,
      comment: comment.trim()
    });

    const populatedReview = await Review.findById(review._id).populate('user', 'name email role');

    return res.status(201).json({
      message: 'Review submitted successfully!',
      review: populatedReview
    });
  } catch (error) {
    console.error('createMovieReview error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Movie ID.' });
    }
    return res.status(500).json({
      message: 'Failed to create review.',
      error: error.message
    });
  }
};

// @desc    Update user's own review
// @route   PUT /api/reviews/:id
// @access  Private (author or admin)
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Check authorization: must be author or admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'Forbidden. You can only edit your own reviews.'
      });
    }

    if (rating !== undefined) {
      const numRating = Number(rating);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
      }
      review.rating = numRating;
    }

    if (comment !== undefined) {
      if (!comment.trim()) {
        return res.status(400).json({ message: 'Comment cannot be blank.' });
      }
      review.comment = comment.trim();
    }

    await review.save();

    const populated = await Review.findById(review._id).populate('user', 'name email role');

    return res.status(200).json({
      message: 'Review updated successfully!',
      review: populated
    });
  } catch (error) {
    console.error('updateReview error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Review ID.' });
    }
    return res.status(500).json({
      message: 'Failed to update review.',
      error: error.message
    });
  }
};

// @desc    Delete user's own review
// @route   DELETE /api/reviews/:id
// @access  Private (author or admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Check authorization: must be author or admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'Forbidden. You can only delete your own reviews.'
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      message: 'Review deleted successfully!'
    });
  } catch (error) {
    console.error('deleteReview error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Review ID.' });
    }
    return res.status(500).json({
      message: 'Failed to delete review.',
      error: error.message
    });
  }
};


const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movieController');
const { createMovieReview } = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

// Public route to get all movies & Admin route to create movie
router
  .route('/')
  .get(getMovies)
  .post(protect, adminOnly, createMovie);

// Public route to get single movie & Admin routes to update/delete
router
  .route('/:id')
  .get(getMovieById)
  .put(protect, adminOnly, updateMovie)
  .delete(protect, adminOnly, deleteMovie);

// User route to add review to movie
router.route('/:id/reviews').post(protect, createMovieReview);

module.exports = router;


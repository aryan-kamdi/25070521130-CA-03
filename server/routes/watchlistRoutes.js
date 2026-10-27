const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');

// All watchlist routes are protected (logged-in user)
router.get('/', protect, getWatchlist);
router.post('/:movieId', protect, addToWatchlist);
router.delete('/:movieId', protect, removeFromWatchlist);

module.exports = router;


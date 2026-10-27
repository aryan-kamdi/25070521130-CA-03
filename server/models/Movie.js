const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    genre: {
      type: String,
      required: [true, 'Movie genre is required'],
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'Release year is required'],
      min: [1888, 'Year must be valid'],
      max: [2100, 'Year cannot be that far in the future']
    },
    poster: {
      type: String,
      required: [true, 'Poster image URL is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Movie', movieSchema);


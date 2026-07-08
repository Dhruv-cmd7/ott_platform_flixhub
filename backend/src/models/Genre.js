const mongoose = require('mongoose');

const GenreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a genre name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Genre', GenreSchema);

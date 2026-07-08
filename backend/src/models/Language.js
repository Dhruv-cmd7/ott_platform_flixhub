const mongoose = require('mongoose');

const LanguageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a language name'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please add a language ISO code'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Language', LanguageSchema);

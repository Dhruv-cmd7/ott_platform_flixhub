const Movie = require('../models/Movie');
const AuditLog = require('../models/AuditLog');
const { uploadToCloud } = require('../middleware/upload');
const { sendResponse } = require('../utils/response');

/**
 * @desc    Get all movies (with search, filter, pagination, sorting)
 * @route   GET /api/movies
 * @access  Public
 */
const getMovies = async (req, res, next) => {
  try {
    const { 
      search, 
      category, 
      genre, 
      language, 
      isPublished, 
      isFeatured, 
      isTrending, 
      sort, 
      page = 1, 
      limit = 10 
    } = req.query;

    // Create query
    const query = {};

    // Searching
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filtering
    if (category) query.categories = category;
    if (genre) query.genres = genre;
    if (language) query.languages = language;
    if (isPublished) query.isPublished = isPublished === 'true';
    if (isFeatured) query.isFeatured = isFeatured === 'true';
    if (isTrending) query.isTrending = isTrending === 'true';

    // Pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Sorting
    let sortBy = '-createdAt';
    if (sort) {
      sortBy = sort.split(',').join(' ');
    }

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .populate('categories')
      .populate('genres')
      .populate('languages')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit, 10));

    return sendResponse(res, 200, true, 'Movies fetched successfully', {
      movies,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single movie (increments views count)
 * @route   GET /api/movies/:id
 * @access  Public
 */
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('categories')
      .populate('genres')
      .populate('languages');

    if (!movie) {
      return sendResponse(res, 404, false, 'Movie not found');
    }

    return sendResponse(res, 200, true, 'Movie details retrieved successfully', movie);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new movie
 * @route   POST /api/movies
 * @access  Private (Content Manager / Admin)
 */
const createMovie = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      duration, 
      releaseYear, 
      ageRating, 
      categories, 
      genres, 
      languages 
    } = req.body;

    // Handle uploaded media files (Multer fields)
    let thumbnailUrl = req.body.thumbnailUrl || '';
    let bannerUrl = req.body.bannerUrl || '';
    let trailerUrl = req.body.trailerUrl || '';
    let videoUrl = req.body.videoUrl || '';

    if (req.files) {
      if (req.files.thumbnail) {
        thumbnailUrl = await uploadToCloud(req.files.thumbnail[0].path, 'movies/thumbnails');
      }
      if (req.files.banner) {
        bannerUrl = await uploadToCloud(req.files.banner[0].path, 'movies/banners');
      }
      if (req.files.trailer) {
        trailerUrl = await uploadToCloud(req.files.trailer[0].path, 'movies/trailers');
      }
      if (req.files.video) {
        videoUrl = await uploadToCloud(req.files.video[0].path, 'movies/videos');
      }
    }

    if (!thumbnailUrl || !bannerUrl) {
      return sendResponse(res, 400, false, 'Both thumbnail and banner uploads are required');
    }

    // Convert comma-separated strings to arrays if needed
    const parsedCategories = typeof categories === 'string' ? categories.split(',') : categories;
    const parsedGenres = typeof genres === 'string' ? genres.split(',') : genres;
    const parsedLanguages = typeof languages === 'string' ? languages.split(',') : languages;

    const movie = await Movie.create({
      title,
      description,
      duration,
      releaseYear,
      ageRating,
      categories: parsedCategories,
      genres: parsedGenres,
      languages: parsedLanguages,
      thumbnailUrl,
      bannerUrl,
      trailerUrl,
      videoUrl,
    });

    // Log action
    await AuditLog.create({
      admin: req.user._id,
      action: 'Create Movie',
      details: `Created movie: "${title}"`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 201, true, 'Movie created successfully', movie);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing movie
 * @route   PUT /api/movies/:id
 * @access  Private (Content Manager / Admin)
 */
const updateMovie = async (req, res, next) => {
  try {
    let movie = await Movie.findById(req.params.id);
    if (!movie) {
      return sendResponse(res, 404, false, 'Movie not found');
    }

    const updateFields = { ...req.body };

    // Handle files if uploaded
    if (req.files) {
      if (req.files.thumbnail) {
        updateFields.thumbnailUrl = await uploadToCloud(req.files.thumbnail[0].path, 'movies/thumbnails');
      }
      if (req.files.banner) {
        updateFields.bannerUrl = await uploadToCloud(req.files.banner[0].path, 'movies/banners');
      }
      if (req.files.trailer) {
        updateFields.trailerUrl = await uploadToCloud(req.files.trailer[0].path, 'movies/trailers');
      }
      if (req.files.video) {
        updateFields.videoUrl = await uploadToCloud(req.files.video[0].path, 'movies/videos');
      }
    }

    // Convert strings to array
    if (updateFields.categories && typeof updateFields.categories === 'string') {
      updateFields.categories = updateFields.categories.split(',');
    }
    if (updateFields.genres && typeof updateFields.genres === 'string') {
      updateFields.genres = updateFields.genres.split(',');
    }
    if (updateFields.languages && typeof updateFields.languages === 'string') {
      updateFields.languages = updateFields.languages.split(',');
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    // Log action
    await AuditLog.create({
      admin: req.user._id,
      action: 'Update Movie',
      details: `Updated movie ID: ${movie._id} ("${movie.title}")`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 200, true, 'Movie updated successfully', movie);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a movie
 * @route   DELETE /api/movies/:id
 * @access  Private (Admin / Super Admin)
 */
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return sendResponse(res, 404, false, 'Movie not found');
    }

    // Log action
    await AuditLog.create({
      admin: req.user._id,
      action: 'Delete Movie',
      details: `Deleted movie ID: ${movie._id} ("${movie.title}")`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 200, true, 'Movie deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle Publish Movie (Publish/Unpublish)
 * @route   PATCH /api/movies/:id/publish
 * @access  Private (Content Manager / Admin)
 */
const togglePublish = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return sendResponse(res, 404, false, 'Movie not found');
    }

    movie.isPublished = !movie.isPublished;
    await movie.save();

    // Log action
    await AuditLog.create({
      admin: req.user._id,
      action: movie.isPublished ? 'Publish Movie' : 'Unpublish Movie',
      details: `${movie.isPublished ? 'Published' : 'Unpublished'} movie ID: ${movie._id}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(
      res,
      200,
      true,
      `Movie ${movie.isPublished ? 'published' : 'unpublished'} successfully`,
      movie
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle Featured Movie
 * @route   PATCH /api/movies/:id/featured
 * @access  Private (Content Manager / Admin)
 */
const toggleFeatured = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return sendResponse(res, 404, false, 'Movie not found');
    }

    movie.isFeatured = !movie.isFeatured;
    await movie.save();

    return sendResponse(res, 200, true, 'Featured status toggled successfully', movie);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle Trending Movie
 * @route   PATCH /api/movies/:id/trending
 * @access  Private (Content Manager / Admin)
 */
const toggleTrending = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return sendResponse(res, 404, false, 'Movie not found');
    }

    movie.isTrending = !movie.isTrending;
    await movie.save();

    return sendResponse(res, 200, true, 'Trending status toggled successfully', movie);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Latest Movies
 * @route   GET /api/movies/latest
 * @access  Public
 */
const getLatestMovies = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const movies = await Movie.find({ isPublished: true })
      .sort({ releaseYear: -1, createdAt: -1 })
      .limit(limit)
      .populate('categories')
      .populate('genres')
      .populate('languages');

    return sendResponse(res, 200, true, 'Latest movies retrieved successfully', movies);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  togglePublish,
  toggleFeatured,
  toggleTrending,
  getLatestMovies,
};

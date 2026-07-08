const Series = require('../models/Series');
const Episode = require('../models/Episode');
const AuditLog = require('../models/AuditLog');
const { uploadToCloud } = require('../middleware/upload');
const { sendResponse } = require('../utils/response');

/**
 * @desc    Get all series (with search, filter, pagination, sorting)
 * @route   GET /api/series
 * @access  Public
 */
const getSeries = async (req, res, next) => {
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

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.categories = category;
    if (genre) query.genres = genre;
    if (language) query.languages = language;
    if (isPublished) query.isPublished = isPublished === 'true';
    if (isFeatured) query.isFeatured = isFeatured === 'true';
    if (isTrending) query.isTrending = isTrending === 'true';

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let sortBy = '-createdAt';
    if (sort) {
      sortBy = sort.split(',').join(' ');
    }

    const total = await Series.countDocuments(query);
    const seriesList = await Series.find(query)
      .populate('categories')
      .populate('genres')
      .populate('languages')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit, 10));

    return sendResponse(res, 200, true, 'Series fetched successfully', {
      series: seriesList,
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
 * @desc    Get single series (increments views, returns episodes structured by season)
 * @route   GET /api/series/:id
 * @access  Public
 */
const getSeriesById = async (req, res, next) => {
  try {
    const series = await Series.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('categories')
      .populate('genres')
      .populate('languages');

    if (!series) {
      return sendResponse(res, 404, false, 'Series not found');
    }

    // Fetch episodes for this series
    const episodes = await Episode.find({ series: series._id, isPublished: true }).sort({
      seasonNumber: 1,
      episodeNumber: 1,
    });

    return sendResponse(res, 200, true, 'Series details retrieved successfully', {
      series,
      episodes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new series
 * @route   POST /api/series
 * @access  Private (Content Manager / Admin)
 */
const createSeries = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      releaseYear, 
      ageRating, 
      categories, 
      genres, 
      languages, 
      cast, 
      creator 
    } = req.body;

    let thumbnailUrl = req.body.thumbnailUrl || '';
    let bannerUrl = req.body.bannerUrl || '';

    if (req.files) {
      if (req.files.thumbnail) {
        thumbnailUrl = await uploadToCloud(req.files.thumbnail[0].path, 'series/thumbnails');
      }
      if (req.files.banner) {
        bannerUrl = await uploadToCloud(req.files.banner[0].path, 'series/banners');
      }
    }

    if (!thumbnailUrl || !bannerUrl) {
      return sendResponse(res, 400, false, 'Both thumbnail and banner uploads are required');
    }

    const parsedCategories = typeof categories === 'string' ? categories.split(',') : categories;
    const parsedGenres = typeof genres === 'string' ? genres.split(',') : genres;
    const parsedLanguages = typeof languages === 'string' ? languages.split(',') : languages;
    const parsedCast = typeof cast === 'string' ? cast.split(',') : cast;

    const series = await Series.create({
      title,
      description,
      releaseYear,
      ageRating,
      categories: parsedCategories,
      genres: parsedGenres,
      languages: parsedLanguages,
      cast: parsedCast,
      creator,
      thumbnailUrl,
      bannerUrl,
    });

    await AuditLog.create({
      admin: req.user._id,
      action: 'Create Series',
      details: `Created series: "${title}"`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 201, true, 'Series created successfully', series);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing series
 * @route   PUT /api/series/:id
 * @access  Private (Content Manager / Admin)
 */
const updateSeries = async (req, res, next) => {
  try {
    let series = await Series.findById(req.params.id);
    if (!series) {
      return sendResponse(res, 404, false, 'Series not found');
    }

    const updateFields = { ...req.body };

    if (req.files) {
      if (req.files.thumbnail) {
        updateFields.thumbnailUrl = await uploadToCloud(req.files.thumbnail[0].path, 'series/thumbnails');
      }
      if (req.files.banner) {
        updateFields.bannerUrl = await uploadToCloud(req.files.banner[0].path, 'series/banners');
      }
    }

    if (updateFields.categories && typeof updateFields.categories === 'string') {
      updateFields.categories = updateFields.categories.split(',');
    }
    if (updateFields.genres && typeof updateFields.genres === 'string') {
      updateFields.genres = updateFields.genres.split(',');
    }
    if (updateFields.languages && typeof updateFields.languages === 'string') {
      updateFields.languages = updateFields.languages.split(',');
    }
    if (updateFields.cast && typeof updateFields.cast === 'string') {
      updateFields.cast = updateFields.cast.split(',');
    }

    series = await Series.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    await AuditLog.create({
      admin: req.user._id,
      action: 'Update Series',
      details: `Updated series ID: ${series._id} ("${series.title}")`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 200, true, 'Series updated successfully', series);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a series
 * @route   DELETE /api/series/:id
 * @access  Private (Admin / Super Admin)
 */
const deleteSeries = async (req, res, next) => {
  try {
    const series = await Series.findByIdAndDelete(req.params.id);
    if (!series) {
      return sendResponse(res, 404, false, 'Series not found');
    }

    // Delete all linked episodes
    await Episode.deleteMany({ series: series._id });

    await AuditLog.create({
      admin: req.user._id,
      action: 'Delete Series',
      details: `Deleted series ID: ${series._id} ("${series.title}") and all its episodes`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 200, true, 'Series and its episodes deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle Publish Series
 * @route   PATCH /api/series/:id/publish
 * @access  Private (Content Manager / Admin)
 */
const togglePublishSeries = async (req, res, next) => {
  try {
    const series = await Series.findById(req.params.id);
    if (!series) {
      return sendResponse(res, 404, false, 'Series not found');
    }

    series.isPublished = !series.isPublished;
    await series.save();

    await AuditLog.create({
      admin: req.user._id,
      action: series.isPublished ? 'Publish Series' : 'Unpublish Series',
      details: `${series.isPublished ? 'Published' : 'Unpublished'} series ID: ${series._id}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(
      res,
      200,
      true,
      `Series ${series.isPublished ? 'published' : 'unpublished'} successfully`,
      series
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSeries,
  getSeriesById,
  createSeries,
  updateSeries,
  deleteSeries,
  togglePublishSeries,
};

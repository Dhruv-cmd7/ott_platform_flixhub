const Episode = require('../models/Episode');
const Series = require('../models/Series');
const AuditLog = require('../models/AuditLog');
const { uploadToCloud } = require('../middleware/upload');
const { sendResponse } = require('../utils/response');

/**
 * @desc    Get episode by ID (increments views)
 * @route   GET /api/episodes/:id
 * @access  Public
 */
const getEpisodeById = async (req, res, next) => {
  try {
    const episode = await Episode.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('series');

    if (!episode) {
      return sendResponse(res, 404, false, 'Episode not found');
    }

    return sendResponse(res, 200, true, 'Episode details retrieved successfully', episode);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add episode to a Series
 * @route   POST /api/episodes
 * @access  Private (Content Manager / Admin)
 */
const addEpisode = async (req, res, next) => {
  try {
    const { 
      series: seriesId, 
      seasonNumber, 
      episodeNumber, 
      title, 
      description, 
      duration 
    } = req.body;

    const series = await Series.findById(seriesId);
    if (!series) {
      return sendResponse(res, 404, false, 'Associated series not found');
    }

    // Check duplicate season/episode
    const duplicate = await Episode.findOne({ series: seriesId, seasonNumber, episodeNumber });
    if (duplicate) {
      return sendResponse(res, 400, false, `Episode ${episodeNumber} of Season ${seasonNumber} already exists in this series`);
    }

    let thumbnailUrl = req.body.thumbnailUrl || '';
    let videoUrl = req.body.videoUrl || '';

    if (req.files) {
      if (req.files.thumbnail) {
        thumbnailUrl = await uploadToCloud(req.files.thumbnail[0].path, 'episodes/thumbnails');
      }
      if (req.files.video) {
        videoUrl = await uploadToCloud(req.files.video[0].path, 'episodes/videos');
      }
    }

    if (!videoUrl) {
      return sendResponse(res, 400, false, 'Episode video file is required');
    }

    const episode = await Episode.create({
      series: seriesId,
      seasonNumber,
      episodeNumber,
      title,
      description,
      duration,
      thumbnailUrl,
      videoUrl,
    });

    await AuditLog.create({
      admin: req.user._id,
      action: 'Create Episode',
      details: `Added episode: "${title}" (Season ${seasonNumber}, Ep ${episodeNumber}) to series ID: ${seriesId}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 201, true, 'Episode added successfully', episode);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing episode
 * @route   PUT /api/episodes/:id
 * @access  Private (Content Manager / Admin)
 */
const updateEpisode = async (req, res, next) => {
  try {
    let episode = await Episode.findById(req.params.id);
    if (!episode) {
      return sendResponse(res, 404, false, 'Episode not found');
    }

    const updateFields = { ...req.body };

    if (req.files) {
      if (req.files.thumbnail) {
        updateFields.thumbnailUrl = await uploadToCloud(req.files.thumbnail[0].path, 'episodes/thumbnails');
      }
      if (req.files.video) {
        updateFields.videoUrl = await uploadToCloud(req.files.video[0].path, 'episodes/videos');
      }
    }

    episode = await Episode.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    await AuditLog.create({
      admin: req.user._id,
      action: 'Update Episode',
      details: `Updated episode ID: ${episode._id} ("${episode.title}")`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 200, true, 'Episode updated successfully', episode);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an episode
 * @route   DELETE /api/episodes/:id
 * @access  Private (Admin / Super Admin)
 */
const deleteEpisode = async (req, res, next) => {
  try {
    const episode = await Episode.findByIdAndDelete(req.params.id);
    if (!episode) {
      return sendResponse(res, 404, false, 'Episode not found');
    }

    await AuditLog.create({
      admin: req.user._id,
      action: 'Delete Episode',
      details: `Deleted episode ID: ${episode._id} ("${episode.title}")`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 200, true, 'Episode deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEpisodeById,
  addEpisode,
  updateEpisode,
  deleteEpisode,
};

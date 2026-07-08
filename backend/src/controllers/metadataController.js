const Category = require('../models/Category');
const Genre = require('../models/Genre');
const Language = require('../models/Language');
const { sendResponse } = require('../utils/response');

// ================= CATEGORY CONTROLLERS =================

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find(req.query.all === 'true' ? {} : { isActive: true });
    return sendResponse(res, 200, true, 'Categories fetched successfully', categories);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    return sendResponse(res, 201, true, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return sendResponse(res, 404, false, 'Category not found');
    return sendResponse(res, 200, true, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return sendResponse(res, 404, false, 'Category not found');
    return sendResponse(res, 200, true, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ================= GENRE CONTROLLERS =================

const getGenres = async (req, res, next) => {
  try {
    const genres = await Genre.find(req.query.all === 'true' ? {} : { isActive: true });
    return sendResponse(res, 200, true, 'Genres fetched successfully', genres);
  } catch (error) {
    next(error);
  }
};

const createGenre = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const genre = await Genre.create({ name, description });
    return sendResponse(res, 201, true, 'Genre created successfully', genre);
  } catch (error) {
    next(error);
  }
};

const updateGenre = async (req, res, next) => {
  try {
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!genre) return sendResponse(res, 404, false, 'Genre not found');
    return sendResponse(res, 200, true, 'Genre updated successfully', genre);
  } catch (error) {
    next(error);
  }
};

const deleteGenre = async (req, res, next) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);
    if (!genre) return sendResponse(res, 404, false, 'Genre not found');
    return sendResponse(res, 200, true, 'Genre deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ================= LANGUAGE CONTROLLERS =================

const getLanguages = async (req, res, next) => {
  try {
    const languages = await Language.find(req.query.all === 'true' ? {} : { isActive: true });
    return sendResponse(res, 200, true, 'Languages fetched successfully', languages);
  } catch (error) {
    next(error);
  }
};

const createLanguage = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    const language = await Language.create({ name, code });
    return sendResponse(res, 201, true, 'Language created successfully', language);
  } catch (error) {
    next(error);
  }
};

const updateLanguage = async (req, res, next) => {
  try {
    const language = await Language.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!language) return sendResponse(res, 404, false, 'Language not found');
    return sendResponse(res, 200, true, 'Language updated successfully', language);
  } catch (error) {
    next(error);
  }
};

const deleteLanguage = async (req, res, next) => {
  try {
    const language = await Language.findByIdAndDelete(req.params.id);
    if (!language) return sendResponse(res, 404, false, 'Language not found');
    return sendResponse(res, 200, true, 'Language deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getGenres,
  createGenre,
  updateGenre,
  deleteGenre,
  getLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
};

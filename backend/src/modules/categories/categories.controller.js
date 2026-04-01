import {
  getCategoriesService,
  getCategoryByIdService,
  createCategoryService,
  updateCategoryService
} from './categories.service.js';

export const getCategories = async (req, res, next) => {
  try {
    const result = await getCategoriesService(req.query);
    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getCategoryByIdService(id);
    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const result = await createCategoryService(req.body);
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await updateCategoryService(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

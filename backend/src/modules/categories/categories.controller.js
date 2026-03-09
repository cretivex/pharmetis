import { getCategoriesService, getCategoryByIdService } from './categories.service.js';

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

import { saveProductService, unsaveProductService, getSavedProductsService } from './saved-products.service.js';

export const saveProduct = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const result = await saveProductService(req.user.id, productId);
    res.status(201).json({
      success: true,
      message: 'Product liked successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const unsaveProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await unsaveProductService(req.user.id, productId);
    res.status(200).json({
      success: true,
      message: 'Product unliked successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedProducts = async (req, res, next) => {
  try {
    const result = await getSavedProductsService(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Liked products retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

import { unifiedSearchService } from './search.service.js';

export const getSearch = async (req, res, next) => {
  try {
    const { q, type } = req.query;
    const result = await unifiedSearchService({ q, type: type || 'product' });
    res.status(200).json({
      success: true,
      message: 'Search completed',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

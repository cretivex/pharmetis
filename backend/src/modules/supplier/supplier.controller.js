import { getSupplierRFQsService } from '../rfqs/rfqs.service.js';

export const getSupplierRFQs = async (req, res, next) => {
  try {
    const status = req.query.status || undefined;
    const result = await getSupplierRFQsService(req.user.id, status);
    res.status(200).json({
      success: true,
      message: 'RFQs retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

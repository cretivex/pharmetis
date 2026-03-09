import { getCompanyInfoService, updateCompanyInfoService } from './company.service.js';
import { logger } from '../../utils/logger.js';

export const getCompanyInfo = async (req, res, next) => {
  try {
    const result = await getCompanyInfoService(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Company information retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Get company info controller error:', error);
    next(error);
  }
};

export const updateCompanyInfo = async (req, res, next) => {
  try {
    const result = await updateCompanyInfoService(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Company information updated successfully',
      data: result
    });
  } catch (error) {
    logger.error('Update company info controller error:', error);
    next(error);
  }
};

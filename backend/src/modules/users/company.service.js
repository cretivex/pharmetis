import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

// Get company info
export const getCompanyInfoService = async (userId) => {
  try {
    const companyInfo = await prisma.companyInfo.findUnique({
      where: { userId }
    });

    return companyInfo || {
      companyName: null,
      gstTaxId: null,
      drugLicenseNo: null,
      businessType: null,
      website: null,
      documents: null
    };
  } catch (error) {
    logger.error('Get company info service error:', error);
    throw error;
  }
};

// Update or create company info
export const updateCompanyInfoService = async (userId, data) => {
  try {
    const { companyName, gstTaxId, drugLicenseNo, businessType, website, documents } = data;

    const companyInfo = await prisma.companyInfo.upsert({
      where: { userId },
      update: {
        companyName: companyName !== undefined ? companyName : undefined,
        gstTaxId: gstTaxId !== undefined ? gstTaxId : undefined,
        drugLicenseNo: drugLicenseNo !== undefined ? drugLicenseNo : undefined,
        businessType: businessType !== undefined ? businessType : undefined,
        website: website !== undefined ? website : undefined,
        documents: documents !== undefined ? documents : undefined
      },
      create: {
        userId,
        companyName: companyName || null,
        gstTaxId: gstTaxId || null,
        drugLicenseNo: drugLicenseNo || null,
        businessType: businessType || null,
        website: website || null,
        documents: documents || null
      }
    });

    logger.info(`Company info updated for user: ${userId}`);
    return companyInfo;
  } catch (error) {
    logger.error('Update company info service error:', error);
    throw error;
  }
};

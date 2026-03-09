import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

// Get all system settings
export const getSystemSettingsService = async () => {
  try {
    const settings = await prisma.systemSettings.findMany({
      orderBy: { category: 'asc' }
    });

    // Transform to object format
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    // Get system overview data
    const activeSessions = await prisma.refreshToken.count({
      where: {
        revoked: false,
        expiresAt: { gt: new Date() }
      }
    });

    const lastModified = settings.length > 0
      ? settings.reduce((latest, s) => s.updatedAt > latest ? s.updatedAt : latest, settings[0].updatedAt)
      : new Date();

    const lastModifiedSetting = settings.find(s => s.updatedAt.getTime() === lastModified.getTime());
    const lastModifiedBy = lastModifiedSetting?.lastModifiedBy || null;

    return {
      settings: settingsObj,
      overview: {
        environment: process.env.NODE_ENV || 'development',
        apiVersion: 'v2.4.1',
        lastUpdated: lastModified,
        activeSessions,
        systemStatus: 'operational',
        lastModifiedBy
      }
    };
  } catch (error) {
    logger.error('Get system settings error:', error);
    throw error;
  }
};

// Update system settings
export const updateSystemSettingsService = async (userId, settingsData) => {
  try {
    const updates = [];

    for (const [key, value] of Object.entries(settingsData)) {
      const update = prisma.systemSettings.upsert({
        where: { key },
        update: {
          value,
          lastModifiedBy: userId,
          updatedAt: new Date()
        },
        create: {
          key,
          value,
          lastModifiedBy: userId,
          category: getCategoryForKey(key)
        }
      });
      updates.push(update);
    }

    await Promise.all(updates);

    logger.info(`System settings updated by user: ${userId}`);

    return await getSystemSettingsService();
  } catch (error) {
    logger.error('Update system settings error:', error);
    throw error;
  }
};

function getCategoryForKey(key) {
  if (key.startsWith('system.')) return 'system';
  if (key.startsWith('rfq.')) return 'rfq';
  if (key.startsWith('security.')) return 'security';
  if (key.startsWith('notifications.')) return 'notifications';
  return 'general';
}

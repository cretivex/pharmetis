import { getSystemMetrics } from './system.service.js';

export async function getMetrics(req, res, next) {
  try {
    const metrics = await getSystemMetrics();
    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
}

import { getMedicinesFiltersService } from './filters.service.js';

export async function getMedicinesFilters(req, res, next) {
  try {
    const result = await getMedicinesFiltersService();
    res.status(200).json({
      success: true,
      message: 'Filter metadata retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

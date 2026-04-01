import api from '../config/api.js';

/**
 * Fetch filter metadata for the medicines catalog.
 * Used to populate dosage form, country, therapeutic areas, manufacturer, availability, categories.
 * @returns {Promise<{ dosageForm: string[], availability: string[], country: string[], therapeuticAreas: string[], manufacturer: string[], categories: { id: string, name: string, slug: string }[] }>}
 */
export async function getMedicinesFilters() {
  const response = await api.get('/filters/medicines');
  const data = response.data?.data || response.data || response;
  return {
    dosageForm: Array.isArray(data.dosageForm) ? data.dosageForm : [],
    availability: Array.isArray(data.availability) ? data.availability : [],
    country: Array.isArray(data.country) ? data.country : [],
    therapeuticAreas: Array.isArray(data.therapeuticAreas) ? data.therapeuticAreas : [],
    manufacturer: Array.isArray(data.manufacturer) ? data.manufacturer : [],
    categories: Array.isArray(data.categories) ? data.categories : []
  };
}

export const filterService = {
  getMedicinesFilters
};

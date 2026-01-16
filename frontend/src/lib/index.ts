/**
 * @fileoverview Barrel exports for library utilities and constants.
 * @module lib
 */

// Constants and configuration
export {
  VISEU_CENTER,
  MAP_CONFIG,
  WORLD_BOUNDS,
  VISEU_CONCELHO_BOUNDS,
  VISEU_BBOX,
  isPointInViseuConcelho,
  NOMINATIM_URL,
  MAX_PHOTOS,
  MAX_PHOTO_SIZE,
  ACCEPTED_IMAGE_TYPES,
  URGENCY_LABELS,
  URGENCY_COLORS,
} from './constants';

// Categories data
export { categories } from './categories';
export { categoriesV2, urgencyOptionsV2 } from './categoriesV2';

// Utility functions
export { generateReference } from './generateReference';
export { buildEmailLink, buildEmailBody } from './buildEmailLink';

// Freguesia data
export { freguesias } from './freguesias';

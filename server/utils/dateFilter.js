/**
 * Utility functions for filtering and processing incident data
 */

/**
 * Filter incidents that occurred within the last 24 hours
 * @param {Array} incidents - Array of incident objects with timestamp field
 * @returns {Array} - Filtered incidents from last 24 hours
 */
export const filterLast24Hours = (incidents) => {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

  return incidents.filter(incident => {
    const incidentDate = new Date(incident.timestamp);
    return incidentDate >= twentyFourHoursAgo && incidentDate <= now;
  });
};

/**
 * Filter incidents by category
 * @param {Array} incidents - Array of incident objects
 * @param {Array} categories - Array of category strings to filter by
 * @returns {Array} - Filtered incidents matching the categories
 */
export const filterByCategory = (incidents, categories) => {
  if (!categories || categories.length === 0) {
    return incidents;
  }
  
  return incidents.filter(incident => 
    categories.includes(incident.category)
  );
};

/**
 * Filter incidents by severity level
 * @param {Array} incidents - Array of incident objects
 * @param {string} minSeverity - Minimum severity level ('low', 'medium', 'high', 'critical')
 * @returns {Array} - Filtered incidents matching minimum severity
 */
export const filterBySeverity = (incidents, minSeverity = 'low') => {
  const severityLevels = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'critical': 4
  };

  const minLevel = severityLevels[minSeverity] || 1;

  return incidents.filter(incident => {
    const incidentLevel = severityLevels[incident.severity] || 1;
    return incidentLevel >= minLevel;
  });
};

/**
 * Sort incidents by timestamp (newest first)
 * @param {Array} incidents - Array of incident objects
 * @returns {Array} - Sorted incidents
 */
export const sortByNewest = (incidents) => {
  return [...incidents].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
};

/**
 * Validate incident data structure
 * @param {Object} incident - Incident object to validate
 * @returns {boolean} - True if incident has required fields
 */
export const validateIncident = (incident) => {
  const requiredFields = ['id', 'title', 'category', 'location', 'coordinates', 'timestamp', 'severity'];
  
  return requiredFields.every(field => {
    return incident.hasOwnProperty(field) && incident[field] !== null && incident[field] !== undefined;
  });
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {Object} coord1 - First coordinate {lat, lng}
 * @param {Object} coord2 - Second coordinate {lat, lng}  
 * @returns {number} - Distance in kilometers
 */
export const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Filter incidents within a certain radius of a point
 * @param {Array} incidents - Array of incident objects
 * @param {Object} center - Center point {lat, lng}
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Array} - Filtered incidents within radius
 */
export const filterByRadius = (incidents, center, radiusKm = 50) => {
  return incidents.filter(incident => {
    const distance = calculateDistance(center, incident.coordinates);
    return distance <= radiusKm;
  });
};

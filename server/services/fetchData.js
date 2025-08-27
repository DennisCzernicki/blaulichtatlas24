/**
 * Service for fetching and normalizing police incident data
 * Uses the Python webscraper to retrieve current cases instead of dummy data
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

import { validateIncident } from '../utils/dateFilter.js';

const execFileAsync = promisify(execFile);

// Resolve path to the Python scraper
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PYTHON_SCRIPT = path.join(__dirname, '../../webscraper/webscraper.py');

/**
 * Fetch all incidents using the external Python webscraper
 * @returns {Promise<Array>} Array of normalized incidents
 */
export const fetchAllIncidents = async () => {
  try {
    console.log('🔍 Fetching incident data via webscraper...');

    const { stdout } = await execFileAsync('python3', [PYTHON_SCRIPT], {
      maxBuffer: 10 * 1024 * 1024,
    });

    const rawIncidents = JSON.parse(stdout);

    const incidents = rawIncidents.map((item, idx) => ({
      id: item.link || `incident_${idx}`,
      title: item.headline,
      description: item.summary,
      category: 'unknown',
      severity: 'medium',
      location: {
        city: item.location,
        state: item.agency || '',
        address: '',
      },
      coordinates: item.coordinates || null,
      timestamp: item.date || new Date().toISOString(),
      source: item.link,
      status: 'active',
    }));

    const validIncidents = incidents.filter(validateIncident);
    console.log(`✅ Fetched ${validIncidents.length} incidents`);
    return validIncidents;
  } catch (error) {
    console.error('❌ Error fetching incident data:', error);
    return [];
  }
};

/**
 * Get incidents with simple in-memory caching
 */
let cachedIncidents = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedIncidents = async () => {
  const now = new Date();

  if (cachedIncidents && lastCacheUpdate && now - lastCacheUpdate < CACHE_DURATION) {
    console.log('📋 Returning cached incident data');
    return cachedIncidents;
  }

  console.log('🔄 Cache expired, fetching fresh incident data');
  cachedIncidents = await fetchAllIncidents();
  lastCacheUpdate = now;
  return cachedIncidents;
};


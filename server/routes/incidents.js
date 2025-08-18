/**
 * API routes for police incidents
 * Handles GET /api/incidents with filtering and query parameters
 */

import express from 'express';
import { getCachedIncidents } from '../services/fetchData.js';
import { 
  filterLast24Hours, 
  filterByCategory, 
  filterBySeverity, 
  filterByRadius,
  sortByNewest 
} from '../utils/dateFilter.js';

const router = express.Router();

/**
 * GET /api/incidents
 * Returns filtered police incident data as JSON
 * 
 * Query Parameters:
 * - category: Array or comma-separated string of categories to filter by
 * - severity: Minimum severity level ('low', 'medium', 'high', 'critical')
 * - last24h: Boolean, if true only return incidents from last 24 hours (default: true)
 * - lat: Latitude for radius filtering
 * - lng: Longitude for radius filtering  
 * - radius: Radius in kilometers for location filtering (default: 50km)
 * - limit: Maximum number of incidents to return
 * - sort: Sort order ('newest', 'oldest', 'severity')
 */
router.get('/', async (req, res) => {
  try {
    // Parse query parameters
    const {
      category,
      severity = 'low',
      last24h = 'true',
      lat,
      lng,
      radius = 50,
      limit,
      sort = 'newest'
    } = req.query;

    console.log(`📊 Processing incidents request with filters:`, {
      category,
      severity,
      last24h,
      lat,
      lng,
      radius,
      limit,
      sort
    });

    // Get all incidents from cache
    let incidents = await getCachedIncidents();

    // Apply 24-hour filter by default
    if (last24h === 'true') {
      incidents = filterLast24Hours(incidents);
      console.log(`⏰ Filtered to ${incidents.length} incidents from last 24 hours`);
    }

    // Apply category filter
    if (category) {
      const categories = Array.isArray(category) 
        ? category 
        : category.split(',').map(c => c.trim());
      
      incidents = filterByCategory(incidents, categories);
      console.log(`🏷️ Filtered to ${incidents.length} incidents by category: ${categories.join(', ')}`);
    }

    // Apply severity filter
    if (severity && severity !== 'low') {
      incidents = filterBySeverity(incidents, severity);
      console.log(`⚠️ Filtered to ${incidents.length} incidents with severity >= ${severity}`);
    }

    // Apply location-based radius filter
    if (lat && lng) {
      const center = { 
        lat: parseFloat(lat), 
        lng: parseFloat(lng) 
      };
      const radiusKm = parseFloat(radius) || 50;
      
      incidents = filterByRadius(incidents, center, radiusKm);
      console.log(`📍 Filtered to ${incidents.length} incidents within ${radiusKm}km of (${lat}, ${lng})`);
    }

    // Sort incidents
    switch (sort) {
      case 'newest':
        incidents = sortByNewest(incidents);
        break;
      case 'oldest':
        incidents = [...incidents].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        break;
      case 'severity':
        const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        incidents = [...incidents].sort((a, b) => 
          (severityOrder[b.severity] || 1) - (severityOrder[a.severity] || 1)
        );
        break;
      default:
        incidents = sortByNewest(incidents);
    }

    // Apply limit if specified
    if (limit && !isNaN(parseInt(limit))) {
      const limitNum = parseInt(limit);
      incidents = incidents.slice(0, limitNum);
      console.log(`📏 Limited results to ${limitNum} incidents`);
    }

    // Prepare response with metadata
    const response = {
      success: true,
      data: incidents,
      meta: {
        total_incidents: incidents.length,
        filters_applied: {
          last24h: last24h === 'true',
          categories: category ? (Array.isArray(category) ? category : category.split(',')) : null,
          min_severity: severity,
          location_filter: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng), radius_km: parseFloat(radius) || 50 } : null,
          limit: limit ? parseInt(limit) : null,
          sort_by: sort
        },
        timestamp: new Date().toISOString(),
        cache_info: {
          message: 'Data is cached for 5 minutes for performance'
        }
      }
    };

    console.log(`✅ Returning ${incidents.length} incidents`);
    res.json(response);

  } catch (error) {
    console.error('❌ Error in incidents API:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch incidents data',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV !== 'production' && { 
          stack: error.stack,
          details: error.message 
        })
      }
    });
  }
});

/**
 * GET /api/incidents/categories
 * Get list of available incident categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      {
        id: 'violent_crime',
        name: 'Gewaltkriminalität',
        description: 'Körperverletzung, Bedrohung, gewalttätige Übergriffe',
        color: '#dc2626' // red-600
      },
      {
        id: 'burglary',
        name: 'Einbruch',
        description: 'Wohnungseinbruch, Geschäftseinbruch',
        color: '#ca8a04' // yellow-600
      },
      {
        id: 'theft',
        name: 'Diebstahl',
        description: 'Fahrraddiebstahl, Taschendiebstahl, Autoaufbruch',
        color: '#2563eb' // blue-600
      },
      {
        id: 'traffic_accident',
        name: 'Verkehrsunfall',
        description: 'Verkehrsunfälle mit und ohne Verletzte',
        color: '#16a34a' // green-600
      },
      {
        id: 'disturbance',
        name: 'Ruhestörung',
        description: 'Lärmbelästigung, Nachbarschaftsstreit',
        color: '#9333ea' // purple-600
      },
      {
        id: 'drug_related',
        name: 'Drogenkriminalität',
        description: 'Drogenhandel, Betäubungsmittel',
        color: '#be185d' // pink-600
      },
      {
        id: 'vandalism',
        name: 'Vandalismus',
        description: 'Sachbeschädigung, Graffiti',
        color: '#ea580c' // orange-600
      },
      {
        id: 'domestic_dispute',
        name: 'Häusliche Gewalt',
        description: 'Familienstreit, Partnerschaftskonflikt',
        color: '#dc2626' // red-600
      },
      {
        id: 'fraud',
        name: 'Betrug',
        description: 'Telefonbetrug, Kreditkartenbetrug, Online-Betrug',
        color: '#7c3aed' // violet-600
      },
      {
        id: 'assault',
        name: 'Körperverletzung',
        description: 'Tätliche Angriffe, körperliche Auseinandersetzungen',
        color: '#dc2626' // red-600
      },
      {
        id: 'robbery',
        name: 'Raub',
        description: 'Straßenraub, Bankraub, bewaffneter Raub',
        color: '#991b1b' // red-800
      },
      {
        id: 'suspicious_activity',
        name: 'Verdächtige Aktivität',
        description: 'Ungewöhnliche oder verdächtige Personen/Aktivitäten',
        color: '#6b7280' // gray-500
      }
    ];

    res.json({
      success: true,
      data: categories,
      meta: {
        total_categories: categories.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch categories',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/incidents/stats/summary
 * Get summary statistics about incidents
 */
router.get('/stats/summary', async (req, res) => {
  try {
    console.log('📈 Generating incident statistics...');

    const allIncidents = await getCachedIncidents();
    const last24hIncidents = filterLast24Hours(allIncidents);

    // Calculate statistics
    const stats = {
      total_all_time: allIncidents.length,
      total_last_24h: last24hIncidents.length,
      categories: {},
      severity_distribution: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      status_distribution: {
        active: 0,
        resolved: 0
      },
      cities: {},
      states: {}
    };

    // Calculate category distribution
    last24hIncidents.forEach(incident => {
      // Categories
      stats.categories[incident.category] = (stats.categories[incident.category] || 0) + 1;
      
      // Severity
      stats.severity_distribution[incident.severity] = (stats.severity_distribution[incident.severity] || 0) + 1;
      
      // Status
      stats.status_distribution[incident.status] = (stats.status_distribution[incident.status] || 0) + 1;
      
      // Cities
      if (incident.location?.city) {
        stats.cities[incident.location.city] = (stats.cities[incident.location.city] || 0) + 1;
      }
      
      // States
      if (incident.location?.state) {
        stats.states[incident.location.state] = (stats.states[incident.location.state] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: stats,
      meta: {
        generated_at: new Date().toISOString(),
        data_freshness: '5 minutes (cached)'
      }
    });

  } catch (error) {
    console.error('❌ Error generating statistics:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate statistics',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/incidents/:id
 * Get a specific incident by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Searching for incident with ID: ${id}`);

    const incidents = await getCachedIncidents();
    const incident = incidents.find(inc => inc.id === id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Incident not found',
          incident_id: id,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.json({
      success: true,
      data: incident,
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(`❌ Error fetching incident ${req.params.id}:`, error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch incident',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV !== 'production' && { 
          stack: error.stack 
        })
      }
    });
  }
});


export default router;

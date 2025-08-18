/**
 * Service for fetching and normalizing external police incident data
 * Currently returns dummy data for testing - replace with real API integrations
 */

import { validateIncident } from '../utils/dateFilter.js';

/**
 * Generate dummy police incident data for testing
 * @returns {Array} - Array of normalized incident objects
 */
const generateDummyIncidents = () => {
  const categories = [
    'violent_crime', 'burglary', 'theft', 'traffic_accident', 
    'disturbance', 'drug_related', 'vandalism', 'domestic_dispute',
    'fraud', 'assault', 'robbery', 'suspicious_activity'
  ];

  const severityLevels = ['low', 'medium', 'high', 'critical'];
  
  const germanCities = [
    { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
    { name: 'Hamburg', lat: 53.5511, lng: 9.9937 },
    { name: 'München', lat: 48.1351, lng: 11.5820 },
    { name: 'Köln', lat: 50.9375, lng: 6.9603 },
    { name: 'Frankfurt am Main', lat: 50.1109, lng: 8.6821 },
    { name: 'Stuttgart', lat: 48.7758, lng: 9.1829 },
    { name: 'Düsseldorf', lat: 51.2277, lng: 6.7735 },
    { name: 'Dortmund', lat: 51.5136, lng: 7.4653 },
    { name: 'Essen', lat: 51.4556, lng: 7.0116 },
    { name: 'Leipzig', lat: 51.3397, lng: 12.3731 },
    { name: 'Bremen', lat: 53.0793, lng: 8.8017 },
    { name: 'Dresden', lat: 51.0504, lng: 13.7373 },
    { name: 'Hannover', lat: 52.3759, lng: 9.7320 },
    { name: 'Nürnberg', lat: 49.4521, lng: 11.0767 },
    { name: 'Duisburg', lat: 51.4344, lng: 6.7623 },
    { name: 'Bochum', lat: 51.4819, lng: 7.2162 },
    { name: 'Wuppertal', lat: 51.2562, lng: 7.1508 },
    { name: 'Bielefeld', lat: 52.0302, lng: 8.5325 },
    { name: 'Bonn', lat: 50.7374, lng: 7.0982 },
    { name: 'Münster', lat: 51.9607, lng: 7.6261 }
  ];

  const incidents = [];
  const now = new Date();

  // Generate incidents from the last 48 hours (so we have some outside 24h window for testing)
  for (let i = 0; i < 50; i++) {
    const city = germanCities[Math.floor(Math.random() * germanCities.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
    
    // Random time within last 48 hours
    const randomHours = Math.random() * 48;
    const timestamp = new Date(now.getTime() - (randomHours * 60 * 60 * 1000));
    
    // Add some random offset to coordinates to spread incidents around the city
    const latOffset = (Math.random() - 0.5) * 0.1; // ~5km radius
    const lngOffset = (Math.random() - 0.5) * 0.1;
    
    const incident = {
      id: `incident_${i + 1}_${timestamp.getTime()}`,
      title: generateIncidentTitle(category),
      description: generateIncidentDescription(category),
      category: category,
      severity: severity,
      location: {
        city: city.name,
        address: generateRandomAddress(),
        state: getStateByCity(city.name)
      },
      coordinates: {
        lat: city.lat + latOffset,
        lng: city.lng + lngOffset
      },
      timestamp: timestamp.toISOString(),
      source: 'police_department',
      status: Math.random() > 0.3 ? 'active' : 'resolved',
      officers_dispatched: Math.floor(Math.random() * 5) + 1,
      reported_by: Math.random() > 0.5 ? 'citizen_call' : 'patrol_observation'
    };

    incidents.push(incident);
  }

  return incidents;
};

/**
 * Generate incident title based on category
 * @param {string} category - Incident category
 * @returns {string} - Generated title
 */
const generateIncidentTitle = (category) => {
  const titles = {
    violent_crime: [
      'Körperverletzung gemeldet',
      'Gewalttätiger Übergriff',
      'Schlägerei in Innenstadt',
      'Bedrohung mit Waffe'
    ],
    burglary: [
      'Einbruch in Wohnung',
      'Geschäftseinbruch',
      'Diebstahl aus Keller',
      'Einbruch in Bürogebäude'
    ],
    theft: [
      'Fahrraddiebstahl',
      'Taschendiebstahl',
      'Autoaufbruch',
      'Ladendiebstahl'
    ],
    traffic_accident: [
      'Verkehrsunfall mit Verletzten',
      'Auffahrunfall',
      'Unfall mit Fahrerflucht',
      'LKW-Unfall auf Autobahn'
    ],
    disturbance: [
      'Ruhestörung',
      'Lärmbelästigung',
      'Nachbarschaftsstreit',
      'Störung der öffentlichen Ordnung'
    ],
    drug_related: [
      'Drogenhandel verdacht',
      'Betäubungsmittel gefunden',
      'Drogenkonsum im Park',
      'Illegale Substanzen beschlagnahmt'
    ],
    vandalism: [
      'Sachbeschädigung an Fahrzeug',
      'Graffiti an Gebäude',
      'Zerstörung von Eigentum',
      'Vandalismus im Park'
    ],
    domestic_dispute: [
      'Häusliche Gewalt',
      'Familienstreit',
      'Partnerschaftskonflikt',
      'Häuslicher Notruf'
    ],
    fraud: [
      'Betrugsversuch am Telefon',
      'Kreditkartenbetrug',
      'Online-Betrug',
      'Identitätsdiebstahl'
    ],
    assault: [
      'Tätlicher Angriff',
      'Körperliche Auseinandersetzung',
      'Angriff auf Passant',
      'Gewalt gegen Person'
    ],
    robbery: [
      'Straßenraub',
      'Banküberfall',
      'Raubüberfall auf Geschäft',
      'Raub mit Waffengewalt'
    ],
    suspicious_activity: [
      'Verdächtige Person',
      'Ungewöhnliche Aktivität',
      'Verdächtiges Fahrzeug',
      'Mögliche kriminelle Handlung'
    ]
  };

  const categoryTitles = titles[category] || ['Polizeieinsatz'];
  return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
};

/**
 * Generate incident description based on category
 * @param {string} category - Incident category
 * @returns {string} - Generated description
 */
const generateIncidentDescription = (category) => {
  const descriptions = {
    violent_crime: 'Polizeikräfte wurden zu einer Gewaltstraftat gerufen. Ermittlungen laufen.',
    burglary: 'Einbruch gemeldet. Spurensicherung vor Ort. Zeugen gesucht.',
    theft: 'Diebstahl angezeigt. Polizei nimmt Anzeige auf und sammelt Beweise.',
    traffic_accident: 'Verkehrsunfall ereignet. Rettungskräfte und Polizei vor Ort.',
    disturbance: 'Störung der öffentlichen Ruhe. Polizei klärt Situation vor Ort.',
    drug_related: 'Drogenbezogener Vorfall. Ermittlungen der Rauschgiftfahndung.',
    vandalism: 'Sachschaden gemeldet. Polizei dokumentiert Schäden.',
    domestic_dispute: 'Häuslicher Streit. Polizei schlichtet und prüft weitere Maßnahmen.',
    fraud: 'Betrugsverdacht gemeldet. Kriminalpolizei ermittelt.',
    assault: 'Körperverletzung angezeigt. Täter wird gesucht.',
    robbery: 'Raubüberfall gemeldet. Fahndung eingeleitet.',
    suspicious_activity: 'Verdächtige Aktivität gemeldet. Polizei überprüft Lage.'
  };

  return descriptions[category] || 'Polizeieinsatz in Bearbeitung.';
};

/**
 * Generate random German address
 * @returns {string} - Random address
 */
const generateRandomAddress = () => {
  const streets = [
    'Hauptstraße', 'Bahnhofstraße', 'Kirchstraße', 'Gartenstraße', 
    'Schulstraße', 'Dorfstraße', 'Lindenstraße', 'Mühlenstraße',
    'Berliner Straße', 'Münchener Straße', 'Frankfurter Straße'
  ];
  
  const street = streets[Math.floor(Math.random() * streets.length)];
  const number = Math.floor(Math.random() * 200) + 1;
  
  return `${street} ${number}`;
};

/**
 * Get German state by city name (simplified mapping)
 * @param {string} city - City name
 * @returns {string} - State name
 */
const getStateByCity = (city) => {
  const stateMapping = {
    'Berlin': 'Berlin',
    'Hamburg': 'Hamburg',
    'München': 'Bayern',
    'Köln': 'Nordrhein-Westfalen',
    'Frankfurt am Main': 'Hessen',
    'Stuttgart': 'Baden-Württemberg',
    'Düsseldorf': 'Nordrhein-Westfalen',
    'Dortmund': 'Nordrhein-Westfalen',
    'Essen': 'Nordrhein-Westfalen',
    'Leipzig': 'Sachsen',
    'Bremen': 'Bremen',
    'Dresden': 'Sachsen',
    'Hannover': 'Niedersachsen',
    'Nürnberg': 'Bayern',
    'Duisburg': 'Nordrhein-Westfalen',
    'Bochum': 'Nordrhein-Westfalen',
    'Wuppertal': 'Nordrhein-Westfalen',
    'Bielefeld': 'Nordrhein-Westfalen',
    'Bonn': 'Nordrhein-Westfalen',
    'Münster': 'Nordrhein-Westfalen'
  };
  
  return stateMapping[city] || 'Deutschland';
};

/**
 * Fetch incidents from BKA (placeholder - replace with real API)
 * @returns {Promise<Array>} - Promise resolving to incidents array
 */
const fetchFromBKA = async () => {
  // TODO: Implement real BKA API integration
  // For now, return empty array as BKA doesn't have public real-time API
  console.log('BKA integration not yet implemented');
  return [];
};

/**
 * Fetch incidents from Twitter/X (placeholder - replace with real API)
 * @returns {Promise<Array>} - Promise resolving to incidents array
 */
const fetchFromTwitter = async () => {
  // TODO: Implement Twitter API integration for police accounts
  // This would require Twitter API keys and parsing of police tweets
  console.log('Twitter integration not yet implemented');
  return [];
};

/**
 * Fetch incidents from local police websites (placeholder)
 * @returns {Promise<Array>} - Promise resolving to incidents array
 */
const fetchFromLocalPolice = async () => {
  // TODO: Implement web scraping of local police press releases
  // This would require parsing HTML from various police department websites
  console.log('Local police website integration not yet implemented');
  return [];
};

/**
 * Normalize incident data from different sources to common format
 * @param {Object} rawIncident - Raw incident data from external source
 * @param {string} source - Source identifier
 * @returns {Object} - Normalized incident object
 */
const normalizeIncident = (rawIncident, source) => {
  // TODO: Implement normalization logic for different data sources
  // This would map different API response formats to our standard format
  return {
    id: rawIncident.id || `${source}_${Date.now()}`,
    title: rawIncident.title || 'Unbekannter Vorfall',
    description: rawIncident.description || '',
    category: rawIncident.category || 'unknown',
    severity: rawIncident.severity || 'medium',
    location: rawIncident.location || {},
    coordinates: rawIncident.coordinates || { lat: 0, lng: 0 },
    timestamp: rawIncident.timestamp || new Date().toISOString(),
    source: source,
    status: rawIncident.status || 'active'
  };
};

/**
 * Main function to fetch all incident data from various sources
 * @returns {Promise<Array>} - Promise resolving to array of normalized incidents
 */
export const fetchAllIncidents = async () => {
  try {
    console.log('🔍 Fetching incident data from all sources...');
    
    // For now, use dummy data while real integrations are developed
    const dummyIncidents = generateDummyIncidents();
    
    // TODO: Uncomment and implement when ready for production
    // const [bkaIncidents, twitterIncidents, localIncidents] = await Promise.all([
    //   fetchFromBKA(),
    //   fetchFromTwitter(), 
    //   fetchFromLocalPolice()
    // ]);
    
    // const allIncidents = [
    //   ...bkaIncidents,
    //   ...twitterIncidents,
    //   ...localIncidents,
    //   ...dummyIncidents
    // ];
    
    const allIncidents = dummyIncidents;
    
    // Validate all incidents
    const validIncidents = allIncidents.filter(validateIncident);
    
    console.log(`✅ Fetched ${validIncidents.length} valid incidents`);
    return validIncidents;
    
  } catch (error) {
    console.error('❌ Error fetching incident data:', error);
    throw new Error('Failed to fetch incident data');
  }
};

/**
 * Get incidents with caching (simple in-memory cache)
 */
let cachedIncidents = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedIncidents = async () => {
  const now = new Date();
  
  // Return cached data if it's still fresh
  if (cachedIncidents && lastCacheUpdate && (now - lastCacheUpdate) < CACHE_DURATION) {
    console.log('📋 Returning cached incident data');
    return cachedIncidents;
  }
  
  // Fetch fresh data
  console.log('🔄 Cache expired, fetching fresh incident data');
  cachedIncidents = await fetchAllIncidents();
  lastCacheUpdate = now;
  
  return cachedIncidents;
};

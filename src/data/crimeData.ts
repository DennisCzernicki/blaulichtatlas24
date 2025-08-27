import { Crime, CrimeType } from '../types/Crime';

const crimeTypes: CrimeType[] = ['theft', 'assault', 'fraud', 'burglary', 'vandalism', 'drug', 'traffic', 'other'];

const germanCities = [
  { name: 'Berlin', lat: 52.5200, lng: 13.4050, state: 'Berlin' },
  { name: 'Hamburg', lat: 53.5511, lng: 9.9937, state: 'Hamburg' },
  { name: 'Munich', lat: 48.1351, lng: 11.5820, state: 'Bavaria' },
  { name: 'Cologne', lat: 50.9375, lng: 6.9603, state: 'North Rhine-Westphalia' },
  { name: 'Frankfurt', lat: 50.1109, lng: 8.6821, state: 'Hesse' },
  { name: 'Stuttgart', lat: 48.7758, lng: 9.1829, state: 'Baden-Württemberg' },
  { name: 'Düsseldorf', lat: 51.2277, lng: 6.7735, state: 'North Rhine-Westphalia' },
  { name: 'Dortmund', lat: 51.5136, lng: 7.4653, state: 'North Rhine-Westphalia' },
  { name: 'Essen', lat: 51.4556, lng: 7.0116, state: 'North Rhine-Westphalia' },
  { name: 'Leipzig', lat: 51.3397, lng: 12.3731, state: 'Saxony' },
  { name: 'Bremen', lat: 53.0793, lng: 8.8017, state: 'Bremen' },
  { name: 'Dresden', lat: 51.0504, lng: 13.7373, state: 'Saxony' },
  { name: 'Hannover', lat: 52.3759, lng: 9.7320, state: 'Lower Saxony' },
  { name: 'Nuremberg', lat: 49.4521, lng: 11.0767, state: 'Bavaria' },
  { name: 'Duisburg', lat: 51.4344, lng: 6.7623, state: 'North Rhine-Westphalia' }
];

const generateRandomCrime = (id: string): Crime => {
  const city = germanCities[Math.floor(Math.random() * germanCities.length)];
  const type = crimeTypes[Math.floor(Math.random() * crimeTypes.length)];
  
  // Add some random offset to city coordinates
  const lat = city.lat + (Math.random() - 0.5) * 0.1;
  const lng = city.lng + (Math.random() - 0.5) * 0.1;
  
  const severities = ['low', 'medium', 'high'] as const;
  const statuses = ['reported', 'investigating', 'resolved'] as const;
  
  const descriptions: Record<CrimeType, string[]> = {
    theft: [
      'Bicycle stolen from residential area',
      'Purse snatched at shopping center',
      'Car break-in reported',
      'Shoplifting incident at retail store'
    ],
    assault: [
      'Physical altercation reported',
      'Domestic disturbance call',
      'Bar fight incident',
      'Street confrontation'
    ],
    fraud: [
      'Credit card fraud reported',
      'Online scam victim',
      'Identity theft case',
      'Bank fraud investigation'
    ],
    burglary: [
      'Residential break-in',
      'Office building burglary',
      'Warehouse break-in',
      'Commercial property theft'
    ],
    vandalism: [
      'Graffiti damage reported',
      'Property destruction',
      'Vehicle vandalism',
      'Public property damage'
    ],
    drug: [
      'Drug possession arrest',
      'Suspected drug dealing',
      'Controlled substance found',
      'Drug-related incident'
    ],
    traffic: [
      'Hit and run incident',
      'DUI arrest',
      'Traffic violation',
      'Vehicle accident'
    ],
    other: [
      'Public disturbance',
      'Noise complaint',
      'Suspicious activity',
      'General incident report'
    ]
  };
  
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  
  return {
    id,
    type,
    description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)],
    location: {
      lat,
      lng,
      address: `${Math.floor(Math.random() * 999) + 1} ${['Hauptstraße', 'Müllerstraße', 'Bahnhofstraße', 'Kirchstraße', 'Poststraße'][Math.floor(Math.random() * 5)]}`,
      city: city.name,
      state: city.state
    },
    date: date.toISOString().split('T')[0],
    time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    severity: severities[Math.floor(Math.random() * severities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    reportedBy: ['Police', 'Citizen', 'Security', 'Anonymous'][Math.floor(Math.random() * 4)]
  };
};

export const crimeData: Crime[] = Array.from({ length: 150 }, (_, i) => 
  generateRandomCrime(`crime-${i + 1}`)
);
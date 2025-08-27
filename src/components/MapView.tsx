/* eslint-disable @typescript-eslint/no-unused-vars */
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Crime, CrimeType } from '../types/Crime';
import { AlertTriangle, Clock, MapPin, User, Calendar } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  crimes: Crime[];
  selectedCrime: Crime | null;
  onCrimeSelect: (crime: Crime) => void;
}

const crimeTypeColors: Record<CrimeType, string> = {
  theft: '#ef4444',
  assault: '#dc2626',
  fraud: '#f97316',
  burglary: '#eab308',
  vandalism: '#84cc16',
  drug: '#8b5cf6',
  traffic: '#3b82f6',
  other: '#6b7280'
};

const createCustomIcon = (crimeType: CrimeType, severity: string) => {
  const color = crimeTypeColors[crimeType];
  const size = severity === 'high' ? 30 : severity === 'medium' ? 25 : 20;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="white"/>
      </svg>
    `)}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

export function MapView({ crimes, selectedCrime, onCrimeSelect }: MapViewProps) {
  return (
    <MapContainer
      center={[51.1657, 10.4515]} // Center of Germany
      zoom={6}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg shadow-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {crimes.map((crime) => (
        <Marker
          key={crime.id}
          position={[crime.location.lat, crime.location.lng]}
          icon={createCustomIcon(crime.type, crime.severity)}
          eventHandlers={{
            click: () => onCrimeSelect(crime)
          }}
        >
          <Popup className="custom-popup">
            <div className="p-2 min-w-[300px]">
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: crimeTypeColors[crime.type] }}
                />
                <h3 className="font-bold text-lg capitalize">{crime.type}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  crime.severity === 'high' ? 'bg-red-100 text-red-800' :
                  crime.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {crime.severity}
                </span>
              </div>
              
              <p className="text-gray-700 mb-3">{crime.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{crime.location.address}, {crime.location.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{crime.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{crime.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Reported by: {crime.reportedBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-gray-500" />
                  <span className="capitalize">Status: {crime.status}</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
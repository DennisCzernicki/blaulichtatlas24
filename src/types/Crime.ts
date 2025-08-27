export interface Crime {
  id: string;
  type: CrimeType;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
  };
  date: string;
  time: string;
  severity: 'low' | 'medium' | 'high';
  status: 'reported' | 'investigating' | 'resolved';
  reportedBy: string;
}

export type CrimeType = 
  | 'theft' 
  | 'assault' 
  | 'fraud' 
  | 'burglary' 
  | 'vandalism' 
  | 'drug' 
  | 'traffic' 
  | 'other';

export interface CrimeStats {
  total: number;
  byType: Record<CrimeType, number>;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
}
import { useState, useMemo } from 'react';
import { Crime, CrimeType, CrimeStats } from '../types/Crime';
import { crimeData } from '../data/crimeData';

export function useCrimeData() {
  const [selectedFilters, setSelectedFilters] = useState<CrimeType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);

  const filteredCrimes = useMemo(() => {
    let filtered = crimeData;

    // Apply type filters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(crime => selectedFilters.includes(crime.type));
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(crime =>
        crime.description.toLowerCase().includes(term) ||
        crime.location.city.toLowerCase().includes(term) ||
        crime.location.address.toLowerCase().includes(term) ||
        crime.type.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [selectedFilters, searchTerm]);

  const stats: CrimeStats = useMemo(() => {
    const byType = crimeData.reduce((acc, crime) => {
      acc[crime.type] = (acc[crime.type] || 0) + 1;
      return acc;
    }, {} as Record<CrimeType, number>);

    const bySeverity = crimeData.reduce((acc, crime) => {
      acc[crime.severity] = (acc[crime.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = crimeData.reduce((acc, crime) => {
      acc[crime.status] = (acc[crime.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: crimeData.length,
      byType,
      bySeverity,
      byStatus
    };
  }, []);

  return {
    crimes: crimeData,
    filteredCrimes,
    selectedFilters,
    setSelectedFilters,
    searchTerm,
    setSearchTerm,
    selectedCrime,
    setSelectedCrime,
    stats
  };
}
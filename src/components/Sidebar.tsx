import { Crime, CrimeType, CrimeStats } from '../types/Crime';
import { Filter, Search, BarChart3, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  crimes: Crime[];
  filteredCrimes: Crime[];
  selectedFilters: CrimeType[];
  onFilterChange: (filters: CrimeType[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  stats: CrimeStats;
}

const crimeTypeLabels: Record<CrimeType, string> = {
  theft: 'Theft',
  assault: 'Assault',
  fraud: 'Fraud',
  burglary: 'Burglary',
  vandalism: 'Vandalism',
  drug: 'Drug-related',
  traffic: 'Traffic',
  other: 'Other'
};

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

export function Sidebar({ 
  crimes, 
  filteredCrimes, 
  selectedFilters, 
  onFilterChange, 
  searchTerm, 
  onSearchChange, 
  stats 
}: SidebarProps) {
  const [showStats, setShowStats] = useState(true);

  const handleFilterToggle = (crimeType: CrimeType) => {
    if (selectedFilters.includes(crimeType)) {
      onFilterChange(selectedFilters.filter(f => f !== crimeType));
    } else {
      onFilterChange([...selectedFilters, crimeType]);
    }
  };

  return (
    <div className="bg-gray-900 text-white h-full overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Crime Map Germany</h1>
        <p className="text-gray-400 mb-6">Interactive crime incident tracking</p>
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by location or description..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Statistics Toggle */}
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2 mb-4 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          <span>{showStats ? 'Hide' : 'Show'} Statistics</span>
        </button>

        {/* Statistics */}
        {showStats && (
          <div className="mb-6 space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
                  <div className="text-sm text-gray-400">Total Incidents</div>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-2xl font-bold text-green-400">{filteredCrimes.length}</div>
                  <div className="text-sm text-gray-400">Showing</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">By Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    <span>Reported</span>
                  </div>
                  <span className="font-medium">{stats.byStatus.reported}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Investigating</span>
                  </div>
                  <span className="font-medium">{stats.byStatus.investigating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Resolved</span>
                  </div>
                  <span className="font-medium">{stats.byStatus.resolved}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4" />
            <h3 className="text-lg font-semibold">Crime Types</h3>
          </div>
          
          <div className="space-y-2">
            {Object.entries(crimeTypeLabels).map(([type, label]) => {
              const crimeType = type as CrimeType;
              const isSelected = selectedFilters.includes(crimeType);
              const count = stats.byType[crimeType];
              
              return (
                <button
                  key={type}
                  onClick={() => handleFilterToggle(crimeType)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: crimeTypeColors[crimeType] }}
                    />
                    <span>{label}</span>
                  </div>
                  <span className="font-medium">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clear Filters */}
        {selectedFilters.length > 0 && (
          <button
            onClick={() => onFilterChange([])}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}
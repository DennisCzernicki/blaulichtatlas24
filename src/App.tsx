import React from 'react';
import { MapView } from './components/MapView';
import { Sidebar } from './components/Sidebar';
import { useCrimeData } from './hooks/useCrimeData';

function App() {
  const {
    crimes,
    filteredCrimes,
    selectedFilters,
    setSelectedFilters,
    searchTerm,
    setSearchTerm,
    selectedCrime,
    setSelectedCrime,
    stats
  } = useCrimeData();

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-96 flex-shrink-0 shadow-xl z-10">
        <Sidebar
          crimes={crimes}
          filteredCrimes={filteredCrimes}
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          stats={stats}
        />
      </div>
      
      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          crimes={filteredCrimes}
          selectedCrime={selectedCrime}
          onCrimeSelect={setSelectedCrime}
        />
        
        {/* Map Info Overlay */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-bold text-gray-800 mb-2">Map Information</h3>
          <p className="text-sm text-gray-600 mb-2">
            Showing {filteredCrimes.length} of {crimes.length} crime incidents across Germany
          </p>
          <div className="text-xs text-gray-500">
            <p>• Click markers for detailed information</p>
            <p>• Use sidebar filters to refine results</p>
            <p>• Search by location or description</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
import React from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Save, X, Globe } from 'lucide-react';
import useMapAdvanced, { LocationData } from './hooks/useMapAdvanced';
import SearchBar from './searchbar';

// Dynamically import Leaflet map to avoid SSR issues
const LeafletMap = dynamic(() => import('./leafLet'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

interface AdvancedMapProps {
  onSaveLocation?: (location: LocationData) => void;
  initialLocation?: LocationData;
  className?: string;
}

const AdvancedMap: React.FC<AdvancedMapProps> = ({ 
  onSaveLocation, 
  initialLocation,
  className = "" 
}) => {
  const {
    selectedLocation,
    searchQuery,
    searchSuggestions,
    isSearching,
    mapCenter,
    zoom,
    handleMapClick,
    handleSearchChange,
    handleSuggestionSelect,
    handleSaveLocation,
    clearLocation,
    setMapRef,
    setZoom
  } = useMapAdvanced();

  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const location = handleSaveLocation();
    if (location && onSaveLocation) {
      onSaveLocation(location);
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="space-y-4 p-2">
        {/* Search Bar */}
        <div className="flex gap-2">
          <SearchBar
            searchQuery={searchQuery}
            searchSuggestions={searchSuggestions}
            isSearching={isSearching}
            onSearchChange={handleSearchChange}
            onSuggestionSelect={handleSuggestionSelect}
          />
          {selectedLocation && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearLocation}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Map */}
        <div className="relative">
          <LeafletMap
            center={mapCenter}
            zoom={zoom}
            selectedLocation={selectedLocation}
            onMapClick={handleMapClick}
            onMapRef={setMapRef}
          />
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Selected Location</p>
                <p className="text-sm text-green-700 mt-1">{selectedLocation.address}</p>
                <p className="text-xs text-green-600 mt-1">
                  Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
              <Button
                onClick={handleSave}
                size="sm"
                className="ml-2 flex-shrink-0"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Location
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!selectedLocation && (
          <div className="text-sm text-gray-600 text-center py-4">
            <p>Click on the map or search for a location to select it</p>
            <p className="text-xs text-gray-500 mt-1">
              Powered by OpenStreetMap Nominatim - Real address lookup
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedMap; 
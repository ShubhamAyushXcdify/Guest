import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationData } from './hooks/useMap';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  selectedLocation: LocationData | null;
  onMapClick: (latlng: L.LatLng) => void;
  onMapRef: (map: L.Map) => void;
}

// Component to handle map events
const MapEvents: React.FC<{
  onMapClick: (latlng: L.LatLng) => void;
  onMapRef: (map: L.Map) => void;
}> = ({ onMapClick, onMapRef }) => {
  const map = useMap();

  useEffect(() => {
    onMapRef(map);
  }, [map, onMapRef]);

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
};

const LeafletMap: React.FC<MapComponentProps> = ({
  center,
  zoom,
  selectedLocation,
  onMapClick,
  onMapRef
}) => {
  return (
    <div className="w-full h-full min-h-[30rem] w-[30rem]">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        keyboard={false}
        zoomControl={false}
        attributionControl={false}
        style={{ minHeight: '30rem', minWidth: '30rem' , height: '100%', width: '100%' }}
        className="rounded-lg z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents onMapClick={onMapClick} onMapRef={onMapRef} />
        
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>
              <div className="text-sm">
                <p className="font-medium">Selected Location</p>
                <p className="text-gray-600">{selectedLocation.address}</p>
                <p className="text-xs text-gray-500">
                  Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;

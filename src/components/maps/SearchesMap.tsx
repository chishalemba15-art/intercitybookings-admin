'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface SearchLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  searchCount: number;
}

interface SearchesMapProps {
  locations: SearchLocation[];
}

export default function SearchesMap({ locations }: SearchesMapProps) {
  // Zambia center coordinates
  const zambiaCenter: [number, number] = [-13.1339, 27.8493];

  // Filter valid locations
  const validLocations = locations.filter(
    (loc) => loc.latitude && loc.longitude && !isNaN(loc.latitude) && !isNaN(loc.longitude)
  );

  if (validLocations.length === 0) {
    return (
      <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p className="mt-2 text-sm text-slate-600">No location data available</p>
          <p className="text-xs text-slate-500 mt-1">
            Searches will appear here once users start searching
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer
        center={zambiaCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validLocations.map((location, index) => {
          // Calculate radius based on search count (logarithmic scale for better visualization)
          const radius = Math.max(8, Math.min(40, Math.log(location.searchCount + 1) * 8));
          const fillOpacity = Math.min(0.8, (location.searchCount / Math.max(...validLocations.map(l => l.searchCount))) * 0.6 + 0.2);

          return (
            <CircleMarker
              key={index}
              center={[location.latitude, location.longitude]}
              radius={radius}
              pathOptions={{
                fillColor: '#3b82f6',
                fillOpacity: fillOpacity,
                color: '#1e40af',
                weight: 2,
                opacity: 0.8,
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-sm">{location.city}</h3>
                  <p className="text-xs text-slate-600">{location.country}</p>
                  <div className="mt-2 text-xs">
                    <span className="font-semibold">{location.searchCount}</span> searches
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';
import { LocationHierarchy } from '../types';
import { LOCATION_HIERARCHY_DATA } from '../data/mockData';
import L from 'leaflet';

interface LocationPickerProps {
  initialLocation?: LocationHierarchy;
  onChange: (location: LocationHierarchy) => void;
  radiusKm?: number;
  onRadiusChange?: (radius: number) => void;
  radiusLabel?: string; // e.g. "Pickup Radius" or "Service Radius"
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation,
  onChange,
  radiusKm = 10,
  onRadiusChange,
  radiusLabel = 'Pickup Radius',
}) => {
  const [state, setState] = useState(initialLocation?.state || 'Tamil Nadu');
  const [district, setDistrict] = useState(initialLocation?.district || 'Tenkasi');
  const [place, setPlace] = useState(initialLocation?.place || 'Kadayanallur');
  const [locality, setLocality] = useState(initialLocation?.locality || 'Main Bazaar Road');
  const [address, setAddress] = useState(
    initialLocation?.address || '42 Main Bazaar Road, Kadayanallur'
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLocation?.lat || 9.0754,
    lng: initialLocation?.lng || 77.3456,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Lists based on selection
  const districts = (LOCATION_HIERARCHY_DATA.districts as Record<string, string[]>)[state] || ['Tenkasi'];
  const places = (LOCATION_HIERARCHY_DATA.places as Record<string, string[]>)[district] || ['Kadayanallur'];
  const localities = (LOCATION_HIERARCHY_DATA.localities as Record<string, string[]>)[place] || ['Main Bazaar Road', 'Town Center'];

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Pin Icon
      const customPin = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: #ef4444; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 3px solid #ffffff;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([coords.lat, coords.lng], {
        icon: customPin,
        draggable: true,
      }).addTo(map);

      // Service/Pickup radius circle
      const circle = L.circle([coords.lat, coords.lng], {
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        radius: radiusKm * 1000,
        weight: 2,
      }).addTo(map);

      marker.on('dragend', (e) => {
        const newLatLng = e.target.getLatLng();
        setCoords({ lat: newLatLng.lat, lng: newLatLng.lng });
        circle.setLatLng(newLatLng);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        circle.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    } else {
      mapInstanceRef.current.setView([coords.lat, coords.lng]);
      if (markerRef.current) {
        markerRef.current.setLatLng([coords.lat, coords.lng]);
      }
      if (circleRef.current) {
        circleRef.current.setLatLng([coords.lat, coords.lng]);
        circleRef.current.setRadius(radiusKm * 1000);
      }
    }
  }, [coords.lat, coords.lng, radiusKm]);

  // Update parent when values change
  useEffect(() => {
    onChange({
      state,
      district,
      place,
      locality,
      address,
      lat: coords.lat,
      lng: coords.lng,
    });
  }, [state, district, place, locality, address, coords, onChange]);

  // Handle place change to update coordinates
  const handlePlaceChange = (newPlace: string) => {
    setPlace(newPlace);
    const newLocs = (LOCATION_HIERARCHY_DATA.localities as Record<string, string[]>)[newPlace] || ['Main Center'];
    setLocality(newLocs[0] || 'Center');
    setAddress(`${newLocs[0] || ''}, ${newPlace}, ${district}`);

    const foundCoords = (LOCATION_HIERARCHY_DATA.coordinates as Record<string, { lat: number; lng: number }>)[newPlace];
    if (foundCoords) {
      setCoords(foundCoords);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([foundCoords.lat, foundCoords.lng], 14);
      }
    }
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const newPlaces = (LOCATION_HIERARCHY_DATA.places as Record<string, string[]>)[newDistrict] || ['Kadayanallur'];
    handlePlaceChange(newPlaces[0]);
  };

  const handleStateChange = (newState: string) => {
    setState(newState);
    const newDists = (LOCATION_HIERARCHY_DATA.districts as Record<string, string[]>)[newState] || ['Tenkasi'];
    handleDistrictChange(newDists[0]);
  };

  const handleSearch = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setAddress(`${searchQuery}, ${place}, ${district}`);
    // Tiny jitter to simulate search pin drop
    const newLat = coords.lat + (Math.random() - 0.5) * 0.004;
    const newLng = coords.lng + (Math.random() - 0.5) * 0.004;
    setCoords({ lat: newLat, lng: newLng });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([newLat, newLng], 15);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          setAddress(`Current GPS Location (${(lat ?? 0).toFixed(4)}, ${(lng ?? 0).toFixed(4)})`);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 15);
          }
        },
        () => {
          // GPS fallback
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Hierarchy Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* State */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            State
          </label>
          <select
            value={state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
          >
            {LOCATION_HIERARCHY_DATA.states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            District
          </label>
          <select
            value={district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Place / City / Town */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Place / City / Town
          </label>
          <select
            value={place}
            onChange={(e) => handlePlaceChange(e.target.value)}
            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
          >
            {places.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Area / Locality */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Area / Locality
          </label>
          <select
            value={locality}
            onChange={(e) => {
              setLocality(e.target.value);
              setAddress(`${e.target.value}, ${place}, ${district}`);
            }}
            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
          >
            {localities.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Exact Map Location Container */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
        <div className="p-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Select Exact Location
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search location or drag marker on map..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch(e);
                  }
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <Search
                onClick={() => handleSearch()}
                className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 cursor-pointer hover:text-emerald-600 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              title="Locate Me"
              className="p-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200 rounded-lg transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Map View */}
        <div className="relative h-56 sm:h-64 w-full">
          <div ref={mapContainerRef} className="h-full w-full" />
          <div className="absolute bottom-2 left-2 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Drag pin or click map to reposition</span>
          </div>
        </div>

        {/* Address and Radius row */}
        <div className="p-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex-1">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">
              Full Street Address
            </span>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full font-medium text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-emerald-500 focus:outline-none py-0.5"
            />
          </div>

          {onRadiusChange && (
            <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-3">
              <span className="text-slate-600 font-medium whitespace-nowrap">
                {radiusLabel}:
              </span>
              <select
                value={radiusKm}
                onChange={(e) => onRadiusChange(Number(e.target.value))}
                className="bg-slate-100 border border-slate-300 rounded-md px-2 py-1 font-semibold text-slate-800 text-xs"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={15}>15 km</option>
                <option value={20}>20 km</option>
                <option value={30}>30 km</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

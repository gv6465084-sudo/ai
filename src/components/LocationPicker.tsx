import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Crosshair,
  CheckCircle2,
  AlertCircle,
  Radio,
  Sliders,
  Compass,
  RefreshCw,
} from 'lucide-react';
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
  // Mode: 'live' (device GPS) vs 'manual' (hierarchical dropdowns)
  const [locationMode, setLocationMode] = useState<'live' | 'manual'>('live');

  // Location Hierarchy State
  const [state, setState] = useState(initialLocation?.state || 'Tamil Nadu');
  const [district, setDistrict] = useState(initialLocation?.district || 'Namakkal');
  const [place, setPlace] = useState(initialLocation?.place || 'Kondamanaickenpatti');
  const [locality, setLocality] = useState(initialLocation?.locality || 'Main Road');
  const [address, setAddress] = useState(
    initialLocation?.address || 'Main Road, Kondamanaickenpatti, Namakkal'
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLocation?.lat || 11.2587,
    lng: initialLocation?.lng || 78.2168,
  });

  // GPS Live Tracking State
  const [isLocating, setIsLocating] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLiveWatching, setIsLiveWatching] = useState(false);
  const [liveLastUpdated, setLiveLastUpdated] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Available options
  const districts = (LOCATION_HIERARCHY_DATA.districts as Record<string, string[]>)[state] || ['Namakkal', 'Tenkasi'];
  const places = (LOCATION_HIERARCHY_DATA.places as Record<string, string[]>)[district] || ['Kondamanaickenpatti'];
  const localities = (LOCATION_HIERARCHY_DATA.localities as Record<string, string[]>)[place] || ['Main Road', 'Town Center'];

  // Helper: Find closest known place from GPS coordinates
  const matchNearestHierarchy = (lat: number, lng: number) => {
    let closestPlace = 'Kondamanaickenpatti';
    let closestDistrict = 'Namakkal';
    let minDistance = Infinity;

    const coordsMap = LOCATION_HIERARCHY_DATA.coordinates as Record<string, { lat: number; lng: number }>;
    for (const [placeName, c] of Object.entries(coordsMap)) {
      const d = Math.hypot(c.lat - lat, c.lng - lng);
      if (d < minDistance) {
        minDistance = d;
        closestPlace = placeName;
      }
    }

    const placesMap = LOCATION_HIERARCHY_DATA.places as Record<string, string[]>;
    for (const [distName, placeList] of Object.entries(placesMap)) {
      if (placeList.includes(closestPlace)) {
        closestDistrict = distName;
        break;
      }
    }

    const locList = (LOCATION_HIERARCHY_DATA.localities as Record<string, string[]>)[closestPlace] || ['Main Road'];
    return {
      district: closestDistrict,
      place: closestPlace,
      locality: locList[0] || 'Central Area',
    };
  };

  // Initialize and Update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Pin Icon
      const customPin = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(220,38,38,0.4); border: 3px solid #ffffff; position: relative;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([coords.lat, coords.lng], {
        icon: customPin,
        draggable: true,
      }).addTo(map);

      // Service/Pickup radius circle
      const circle = L.circle([coords.lat, coords.lng], {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.12,
        radius: radiusKm * 1000,
        weight: 2,
      }).addTo(map);

      marker.on('dragend', (e) => {
        const newLatLng = e.target.getLatLng();
        setCoords({ lat: newLatLng.lat, lng: newLatLng.lng });
        circle.setLatLng(newLatLng);
        setAddress(`Pinned Location (${newLatLng.lat.toFixed(4)}, ${newLatLng.lng.toFixed(4)})`);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        circle.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        setAddress(`Selected Location (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`);
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

  // Notify parent on changes
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

  // Request Live Geolocation
  const fetchLiveGPS = () => {
    setIsLocating(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setIsLocating(false);
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        setCoords({ lat, lng });
        setGpsAccuracy(accuracy);
        setLiveLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setIsLocating(false);

        // Smart match to local catalog
        const match = matchNearestHierarchy(lat, lng);
        setDistrict(match.district);
        setPlace(match.place);
        setLocality(match.locality);
        setAddress(`Live GPS: ${match.locality}, ${match.place}, ${match.district} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
        }
      },
      (err) => {
        setIsLocating(false);
        let errMsg = 'Unable to retrieve your location.';
        if (err.code === 1) {
          errMsg = 'Location permission was denied. You can enable GPS permissions or use Manual Selection below.';
        } else if (err.code === 2) {
          errMsg = 'GPS signal unavailable. Trying approximate network location...';
        } else if (err.code === 3) {
          errMsg = 'Location request timed out. Please try again or use Manual Selection.';
        }
        setGpsError(errMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  };

  // Toggle Live continuous GPS watcher
  const toggleLiveWatching = () => {
    if (isLiveWatching) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsLiveWatching(false);
    } else {
      if (!navigator.geolocation) {
        setGpsError('Geolocation is not supported by your browser.');
        return;
      }
      setIsLiveWatching(true);
      setGpsError(null);
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          setGpsAccuracy(Math.round(pos.coords.accuracy));
          setLiveLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng]);
          }
        },
        (err) => {
          setGpsError('Live tracking stopped: ' + err.message);
          setIsLiveWatching(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // Cleanup watcher
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Handle Manual Dropdown changes
  const handlePlaceChange = (newPlace: string) => {
    setPlace(newPlace);
    const newLocs = (LOCATION_HIERARCHY_DATA.localities as Record<string, string[]>)[newPlace] || ['Main Road'];
    const defaultLoc = newLocs[0] || 'Central Area';
    setLocality(defaultLoc);
    setAddress(`${defaultLoc}, ${newPlace}, ${district}`);

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
    const newPlaces = (LOCATION_HIERARCHY_DATA.places as Record<string, string[]>)[newDistrict] || ['Namakkal Town'];
    handlePlaceChange(newPlaces[0]);
  };

  const handleStateChange = (newState: string) => {
    setState(newState);
    const newDists = (LOCATION_HIERARCHY_DATA.districts as Record<string, string[]>)[newState] || ['Namakkal'];
    handleDistrictChange(newDists[0]);
  };

  // Preset location quick select (convenient fallback)
  const applyPresetLocation = (presetPlace: string, presetDistrict: string, lat: number, lng: number) => {
    setDistrict(presetDistrict);
    setPlace(presetPlace);
    const locs = (LOCATION_HIERARCHY_DATA.localities as Record<string, string[]>)[presetPlace] || ['Main Road'];
    setLocality(locs[0]);
    setCoords({ lat, lng });
    setAddress(`${locs[0]}, ${presetPlace}, ${presetDistrict}`);
    setGpsError(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 14);
    }
  };

  const handleSearch = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setAddress(`${searchQuery}, ${place}, ${district}`);
    const newLat = coords.lat + (Math.random() - 0.5) * 0.003;
    const newLng = coords.lng + (Math.random() - 0.5) * 0.003;
    setCoords({ lat: newLat, lng: newLng });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([newLat, newLng], 15);
    }
  };

  return (
    <div className="space-y-4">
      {/* Both Manual & Live Location Selector Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Choose Location Method
          </label>
          <span className="text-[11px] text-slate-500 font-medium">
            Both Live GPS & Manual Entry supported
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
          {/* Mode 1: Live Location Tab */}
          <button
            type="button"
            onClick={() => {
              setLocationMode('live');
              fetchLiveGPS();
            }}
            className={`p-3 rounded-xl flex items-center gap-3 transition-all text-left cursor-pointer ${
              locationMode === 'live'
                ? 'bg-white text-slate-900 shadow-md ring-2 ring-emerald-500/20 border border-emerald-500/30 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                locationMode === 'live'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold block truncate">📡 Live GPS Location</span>
                {locationMode === 'live' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 block truncate">
                Auto-detect via device sensor
              </span>
            </div>
          </button>

          {/* Mode 2: Manual Location Tab */}
          <button
            type="button"
            onClick={() => setLocationMode('manual')}
            className={`p-3 rounded-xl flex items-center gap-3 transition-all text-left cursor-pointer ${
              locationMode === 'manual'
                ? 'bg-white text-slate-900 shadow-md ring-2 ring-blue-500/20 border border-blue-500/30 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                locationMode === 'manual'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">✍️ Manual Selection</span>
              <span className="text-[10px] text-slate-500 block truncate">
                State, District, Town & Area catalog
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Mode 1: Live Location Panel */}
      {locationMode === 'live' && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Crosshair className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-black text-xs text-emerald-950">
                    Live GPS Device Detection
                  </h4>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800 text-[10px] font-bold">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
                  {gpsAccuracy ? ` • Accuracy: ±${gpsAccuracy}m` : ''}
                  {liveLastUpdated ? ` • Updated ${liveLastUpdated}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={fetchLiveGPS}
                disabled={isLocating}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting GPS...' : 'Refresh Live GPS'}</span>
              </button>

              <button
                type="button"
                onClick={toggleLiveWatching}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isLiveWatching
                    ? 'bg-emerald-700 text-white border-emerald-800'
                    : 'bg-white hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
                title="Continuously track live location as device moves"
              >
                <Radio className={`w-3.5 h-3.5 ${isLiveWatching ? 'animate-pulse text-rose-300' : 'text-emerald-600'}`} />
                <span>{isLiveWatching ? 'Tracking Active' : 'Live Tracking'}</span>
              </button>
            </div>
          </div>

          {/* GPS Error or Permission Notice with Quick Fallback Presets */}
          {gpsError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{gpsError}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-bold text-amber-700">Quick GPS Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPresetLocation('Kondamanaickenpatti', 'Namakkal', 11.2587, 78.2168)}
                  className="px-2 py-0.5 rounded-md bg-white border border-amber-300 hover:bg-amber-100 text-[11px] font-semibold text-slate-800 cursor-pointer"
                >
                  Kondamanaickenpatti Hub
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetLocation('Kadayanallur', 'Tenkasi', 9.0754, 77.3456)}
                  className="px-2 py-0.5 rounded-md bg-white border border-amber-300 hover:bg-amber-100 text-[11px] font-semibold text-slate-800 cursor-pointer"
                >
                  Kadayanallur, Tenkasi
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetLocation('Namakkal Town', 'Namakkal', 11.2189, 78.1674)}
                  className="px-2 py-0.5 rounded-md bg-white border border-amber-300 hover:bg-amber-100 text-[11px] font-semibold text-slate-800 cursor-pointer"
                >
                  Namakkal Central
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Manual Hierarchy Selectors */}
      {locationMode === 'manual' && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-slate-50 border border-blue-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-black text-xs text-blue-950 flex items-center gap-1.5">
              <span>🗺️ Select Region & Locality</span>
            </h4>
            <span className="text-[10px] text-blue-600 font-semibold">
              Updates map pin automatically
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* State */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                State
              </label>
              <select
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                District
              </label>
              <select
                value={district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Place / City / Town
              </label>
              <select
                value={place}
                onChange={(e) => handlePlaceChange(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Area / Locality
              </label>
              <select
                value={locality}
                onChange={(e) => {
                  setLocality(e.target.value);
                  setAddress(`${e.target.value}, ${place}, ${district}`);
                }}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {localities.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Universal Exact Map Location Container (Interactive in both modes) */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-xs">
        {/* Map Header with search & quick locate */}
        <div className="p-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Pinpoint Exact Location on Map
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search street, landmark, or gate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch(e);
                  }
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              />
              <Search
                onClick={() => handleSearch()}
                className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 cursor-pointer hover:text-emerald-600 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={fetchLiveGPS}
              title="Locate me with Live GPS"
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Map View */}
        <div className="relative h-60 sm:h-72 w-full">
          <div ref={mapContainerRef} className="h-full w-full" />
          
          {/* Overlay Helper Badge */}
          <div className="absolute bottom-2.5 left-2.5 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl text-[11px] text-slate-700 border border-slate-200 shadow-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold">Drag red pin or click map to adjust exact spot</span>
          </div>

          {/* Coordinates Badge */}
          <div className="absolute top-2.5 right-2.5 z-20 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-mono shadow-md">
            {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
          </div>
        </div>

        {/* Address and Radius row */}
        <div className="p-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                Full Street Address
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {locationMode === 'live' ? '📡 Live Source' : '✍️ Manual Source'}
              </span>
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 42 Main Road, Near Gandhi Statue"
              className="w-full font-semibold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-emerald-500 focus:outline-none py-1"
            />
          </div>

          {onRadiusChange && (
            <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-3 shrink-0">
              <span className="text-slate-600 font-semibold whitespace-nowrap">
                {radiusLabel}:
              </span>
              <select
                value={radiusKm}
                onChange={(e) => onRadiusChange(Number(e.target.value))}
                className="bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1 font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={15}>15 km</option>
                <option value={20}>20 km</option>
                <option value={25}>25 km</option>
                <option value={30}>30 km</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

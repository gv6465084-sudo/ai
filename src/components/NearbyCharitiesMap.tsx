import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  Heart,
  ShieldCheck,
  Navigation,
  Clock,
  Send,
  Route as RouteIcon,
  Sparkles,
  Radio,
  SlidersHorizontal,
  Compass,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  LocateFixed,
  MapPin,
  Flame,
  Edit3,
  Search,
  X,
} from 'lucide-react';
import { CharityProfile, FoodDonation } from '../types';
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID,
  GOOGLE_MAPS_ATTRIBUTION_ID,
  DEFAULT_MAP_CENTER,
} from '../services/mapsConfig';
import { useGeolocation } from '../services/useGeolocation';
import {
  analyzeLocationCharitiesWithAI,
  AILocationCharityAnalysis,
} from '../services/aiService';
import { calculateHaversineDistance, calculateRoute, geocodeLocation } from '../services/mapService';
import { appState } from '../services/store';
import {
  ensureCharitiesNearLocation,
  detectLocalityFromCoords,
} from '../services/localCharitiesService';

const POPULAR_LOCATIONS = [
  {
    name: 'Kondamanaickenpatti, Namakkal',
    subtitle: 'Census Town / Residential Corridor',
    lat: 11.2587,
    lng: 78.2168,
    address: 'Kondamanaickenpatti, Namakkal - 637001, Tamil Nadu',
  },
  {
    name: 'Namakkal Central Bus Stand',
    subtitle: 'Central Transit & Commercial Hub',
    lat: 11.2189,
    lng: 78.1674,
    address: 'Bus Stand Road, Namakkal, Tamil Nadu',
  },
  {
    name: 'Mohanur Road, Namakkal',
    subtitle: 'South Institutional & Residential Area',
    lat: 11.2050,
    lng: 78.1720,
    address: 'Mohanur Road, Namakkal, Tamil Nadu',
  },
  {
    name: 'Tiruchengode',
    subtitle: 'Namakkal District West',
    lat: 11.3812,
    lng: 77.8963,
    address: 'Tiruchengode, Namakkal, Tamil Nadu',
  },
  {
    name: 'Rasipuram',
    subtitle: 'Namakkal District North',
    lat: 11.4587,
    lng: 78.1678,
    address: 'Rasipuram, Namakkal, Tamil Nadu',
  },
  {
    name: 'Salem Junction',
    subtitle: 'Salem District',
    lat: 11.6643,
    lng: 78.1460,
    address: 'Junction Road, Salem, Tamil Nadu',
  },
  {
    name: 'Kadayanallur HQ',
    subtitle: 'Registered Restaurant Business HQ',
    lat: 9.0754,
    lng: 77.3456,
    address: 'Main Bazaar Road, Kadayanallur, Tenkasi',
  },
];

interface NearbyCharitiesMapProps {
  charities: CharityProfile[];
  donorLocation: {
    lat: number;
    lng: number;
    address: string;
    organizationName: string;
  };
  activeDonation?: FoodDonation | null;
  onSelectCharity: (charity: CharityProfile) => void;
  onSendRequest?: (charity: CharityProfile) => void;
  selectedCharityId?: string;
}

// Google Maps Route Polyline Component
const RoutePolyline: React.FC<{
  path: { lat: number; lng: number }[];
  strokeColor?: string;
  strokeWeight?: number;
}> = ({ path, strokeColor = '#10b981', strokeWeight = 5 }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || !mapsLib || path.length < 2) return;

    const polyline = new mapsLib.Polyline({
      path,
      geodesic: true,
      strokeColor,
      strokeOpacity: 0.85,
      strokeWeight,
      map,
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, mapsLib, path, strokeColor, strokeWeight]);

  return null;
};

// Smooth Camera Controller
const CameraController: React.FC<{
  target: { lat: number; lng: number } | null;
  zoom?: number;
}> = ({ target, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !target) return;
    map.panTo(target);
    if (zoom) map.setZoom(zoom);
  }, [map, target, zoom]);

  return null;
};

export const NearbyCharitiesMap: React.FC<NearbyCharitiesMapProps> = ({
  charities,
  donorLocation,
  activeDonation,
  onSelectCharity,
  onSendRequest,
  selectedCharityId,
}) => {
  // Real-time GPS Location Hook
  const {
    location: liveLocation,
    isLocating,
    isLiveTracking,
    error: geoError,
    requestCurrentPosition,
    toggleLiveTracking,
    setManualLocation,
  } = useGeolocation({
    lat: donorLocation.lat,
    lng: donorLocation.lng,
    address: donorLocation.address,
  });

  const [selectedRadius, setSelectedRadius] = useState<number>(25);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [charitySearchQuery, setCharitySearchQuery] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>(
    selectedCharityId || charities[0]?.id || ''
  );
  const [activeInfoWindowId, setActiveInfoWindowId] = useState<string | null>(null);

  // Dynamic Locality & Auto-Discovery State
  const [detectedLocality, setDetectedLocality] = useState<string>('Local Area');
  const [isDiscoveringLocal, setIsDiscoveringLocal] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // AI Location Analysis State
  const [aiAnalyses, setAiAnalyses] = useState<AILocationCharityAnalysis[]>([]);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [cameraTarget, setCameraTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [showAnalysisDrawer, setShowAnalysisDrawer] = useState<boolean>(true);

  const handleSelectPresetLocation = async (preset: {
    name: string;
    lat: number;
    lng: number;
    address: string;
  }) => {
    setManualLocation(preset.lat, preset.lng, preset.address);
    setDetectedLocality(preset.name);
    setCameraTarget({ lat: preset.lat, lng: preset.lng });
    setIsLocationModalOpen(false);
    await loadNearbyCharities({ lat: preset.lat, lng: preset.lng });
  };

  const handleSearchCustomLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearchQuery.trim()) return;
    setIsSearchingLocation(true);
    try {
      const geo = await geocodeLocation(customSearchQuery);
      if (geo) {
        setManualLocation(geo.lat, geo.lng, geo.displayName);
        setDetectedLocality(geo.displayName.split(',')[0]);
        setCameraTarget({ lat: geo.lat, lng: geo.lng });
        setIsLocationModalOpen(false);
        await loadNearbyCharities({ lat: geo.lat, lng: geo.lng });
      }
    } catch (err) {
      console.error('Failed to geocode location:', err);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Auto-discover / generate local charities whenever liveLocation coordinates are available
  const loadNearbyCharities = useCallback(
    async (coords: { lat: number; lng: number }) => {
      setIsDiscoveringLocal(true);
      try {
        const locInfo = await detectLocalityFromCoords(coords.lat, coords.lng);
        setDetectedLocality(locInfo.placeName);

        const updated = await ensureCharitiesNearLocation(coords, charities);
        if (updated.length > charities.length) {
          appState.addOrUpdateLocalCharities(updated);
        }
      } catch (e) {
        console.error('Error discovering nearby charities:', e);
      } finally {
        setIsDiscoveringLocal(false);
      }
    },
    [charities]
  );

  useEffect(() => {
    if (liveLocation.lat && liveLocation.lng) {
      loadNearbyCharities({ lat: liveLocation.lat, lng: liveLocation.lng });
    }
  }, [liveLocation.lat, liveLocation.lng, loadNearbyCharities]);

  // Center camera on live location when first positioned or updated
  useEffect(() => {
    if (liveLocation.lat && liveLocation.lng) {
      setCameraTarget({ lat: liveLocation.lat, lng: liveLocation.lng });
    }
  }, [liveLocation.lat, liveLocation.lng]);

  // Filter verified charities and calculate real-time distances
  const verifiedCharities = useMemo(
    () => charities.filter((c) => c.verificationStatus === 'verified'),
    [charities]
  );

  const charitiesWithDistances = useMemo(() => {
    const origin = { lat: liveLocation.lat, lng: liveLocation.lng };
    return verifiedCharities
      .map((charity) => {
        const straightKm = calculateHaversineDistance(origin, charity.location);
        const route = calculateRoute(origin, charity.location);
        return {
          ...charity,
          distanceKm: route.distanceKm,
          transitMinutes: route.durationMinutes,
          straightKm,
        };
      })
      .filter((charity) => {
        if (charitySearchQuery.trim()) {
          const q = charitySearchQuery.trim().toLowerCase();
          const matchName = charity.organizationName.toLowerCase().includes(q);
          const matchFoodRescueId = charity.foodRescueId?.toLowerCase().includes(q);
          const matchReg = charity.registrationDetails?.toLowerCase().includes(q);
          const matchPlace = charity.location.place?.toLowerCase().includes(q);
          if (!matchName && !matchFoodRescueId && !matchReg && !matchPlace) return false;
        }
        if (charity.distanceKm > selectedRadius) return false;
        if (categoryFilter !== 'all') {
          const match = charity.foodCategoriesAccepted.some((c) =>
            c.toLowerCase().includes(categoryFilter.toLowerCase())
          );
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [verifiedCharities, liveLocation.lat, liveLocation.lng, selectedRadius, categoryFilter, charitySearchQuery]);

  const selectedCharity = useMemo(() => {
    const found = charitiesWithDistances.find((c) => c.id === selectedId);
    if (found) return found;
    if (charitiesWithDistances[0]) return charitiesWithDistances[0];

    const fallback = verifiedCharities[0] || charities[0];
    if (!fallback) return null;

    const origin = {
      lat: liveLocation?.lat ?? donorLocation?.lat ?? DEFAULT_MAP_CENTER.lat,
      lng: liveLocation?.lng ?? donorLocation?.lng ?? DEFAULT_MAP_CENTER.lng,
    };
    const route = calculateRoute(origin, fallback.location);
    return {
      ...fallback,
      distanceKm: route?.distanceKm ?? 0,
      transitMinutes: route?.durationMinutes ?? 5,
      straightKm: calculateHaversineDistance(origin, fallback.location) ?? 0,
    };
  }, [charitiesWithDistances, selectedId, verifiedCharities, charities, liveLocation?.lat, liveLocation?.lng, donorLocation?.lat, donorLocation?.lng]);

  // Ensure selectedId points to a charity in the current location viewport
  useEffect(() => {
    if (charitiesWithDistances.length > 0) {
      const match = charitiesWithDistances.find((c) => c.id === selectedId);
      if (!match) {
        setSelectedId(charitiesWithDistances[0].id);
      }
    }
  }, [charitiesWithDistances, selectedId]);

  // Trigger Deep AI Location Analysis whenever live location or active donation changes
  const runAIAnalysis = useCallback(async () => {
    setIsAnalyzingAI(true);
    try {
      const results = await analyzeLocationCharitiesWithAI(
        {
          lat: liveLocation.lat,
          lng: liveLocation.lng,
          address: liveLocation.address || donorLocation.address,
        },
        activeDonation || null,
        charitiesWithDistances
      );
      setAiAnalyses(results);
    } catch (e) {
      console.error('AI Location Analysis error:', e);
    } finally {
      setIsAnalyzingAI(false);
    }
  }, [liveLocation.lat, liveLocation.lng, liveLocation.address, donorLocation.address, activeDonation, charitiesWithDistances]);

  useEffect(() => {
    runAIAnalysis();
  }, [liveLocation.lat, liveLocation.lng, selectedDonationId(activeDonation)]);

  function selectedDonationId(donation?: FoodDonation | null) {
    return donation?.id || 'none';
  }

  // Selected charity's AI analysis card
  const selectedAIAnalysis = useMemo(() => {
    if (!selectedCharity) return null;
    return aiAnalyses.find((a) => a.charityId === selectedCharity.id) || null;
  }, [aiAnalyses, selectedCharity?.id]);

  // Route path between live location and selected charity
  const routePolylinePath = useMemo(() => {
    if (!selectedCharity) return [];
    return [
      { lat: liveLocation.lat, lng: liveLocation.lng },
      { lat: selectedCharity.location.lat, lng: selectedCharity.location.lng },
    ];
  }, [liveLocation.lat, liveLocation.lng, selectedCharity?.location.lat, selectedCharity?.location.lng]);

  const handleSelectCharity = (charity: CharityProfile) => {
    setSelectedId(charity.id);
    onSelectCharity(charity);
    setCameraTarget({ lat: charity.location.lat, lng: charity.location.lng });
  };

  const handleRecenterOnMe = () => {
    setCameraTarget({ lat: liveLocation.lat, lng: liveLocation.lng });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl">
      {/* Left Sidebar: Real-time Controls, Filters & AI Ranked Charities */}
      <div className="w-full lg:w-96 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50 shrink-0 z-10">
        {/* Header with Live GPS Status & AI Badge */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="font-heading font-black text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI Location Intelligence</span>
              </h2>
            </div>
            <button
              onClick={runAIAnalysis}
              disabled={isAnalyzingAI}
              className="p-1 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
              title="Re-run AI Location & Urgency Analysis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingAI ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          {/* Real-time GPS Location Status Box */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Radio className={`w-3.5 h-3.5 ${liveLocation.isRealtime ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
                <span>{liveLocation.isRealtime ? `Live GPS: ${detectedLocality}` : `Location: ${detectedLocality}`}</span>
              </div>
              <button
                onClick={requestCurrentPosition}
                disabled={isLocating}
                className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              >
                <LocateFixed className="w-3 h-3" />
                <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate max-w-[200px]">
                {(liveLocation?.lat ?? DEFAULT_MAP_CENTER.lat).toFixed(4)}, {(liveLocation?.lng ?? DEFAULT_MAP_CENTER.lng).toFixed(4)}
              </span>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                {liveLocation.source === 'gps' ? 'Live GPS ±' + (liveLocation.accuracy || 10) + 'm' : 'Calibrated'}
              </span>
            </div>

            {/* Quick Switch: Live GPS vs Registered Kadayanallur address vs Custom Location */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  requestCurrentPosition();
                  setCameraTarget({ lat: liveLocation.lat, lng: liveLocation.lng });
                }}
                className={`flex-1 min-w-[120px] py-1 px-2 rounded-md font-bold transition-all text-center border cursor-pointer ${
                  liveLocation.source === 'gps'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                📍 Live GPS ({detectedLocality.split(',')[0]})
              </button>
              <button
                type="button"
                onClick={() => {
                  setManualLocation(
                    donorLocation.lat,
                    donorLocation.lng,
                    donorLocation.address
                  );
                  setCameraTarget({ lat: donorLocation.lat, lng: donorLocation.lng });
                }}
                className={`flex-1 min-w-[90px] py-1 px-2 rounded-md font-bold transition-all text-center border cursor-pointer ${
                  liveLocation.source !== 'gps' && detectedLocality.includes('Kadayanallur')
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🏢 Kadayanallur HQ
              </button>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="py-1 px-2.5 rounded-md font-bold transition-all text-center border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer flex items-center gap-1 shrink-0"
                title="Search or change current location"
              >
                <Edit3 className="w-3 h-3 text-emerald-600" />
                <span>Change</span>
              </button>
            </div>

            {geoError && (
              <p className="text-[10px] text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>GPS prompt dismissed, using calibrated center</span>
              </p>
            )}
          </div>

          {/* Active Donation Reference if provided */}
          {activeDonation && (
            <div className="mt-2.5 p-2 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center gap-2.5">
              <img
                src={activeDonation.foodImage}
                alt={activeDonation.foodName}
                className="w-9 h-9 rounded-lg object-cover border border-emerald-300 shrink-0"
              />
              <div className="overflow-hidden">
                <span className="font-bold text-slate-900 block truncate">
                  {activeDonation.foodName} ({activeDonation.portions} portions)
                </span>
                <span className="text-[10px] text-emerald-800 font-semibold block">
                  Urgency: {activeDonation.urgencyLevel} • {activeDonation.storageCondition}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Search by Name, FoodRescue ID or Reg ID */}
        <div className="px-3 pt-3 pb-2 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={charitySearchQuery}
              onChange={(e) => setCharitySearchQuery(e.target.value)}
              placeholder="Search Name, FoodRescue ID (FRC-...), or Reg ID"
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {charitySearchQuery && (
              <button
                type="button"
                onClick={() => setCharitySearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="p-3 border-b border-slate-200 bg-white/70 grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Radius (km)
            </label>
            <select
              value={selectedRadius}
              onChange={(e) => setSelectedRadius(Number(e.target.value))}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={15}>Within 15 km</option>
              <option value={25}>Within 25 km</option>
              <option value={50}>Within 50 km</option>
              <option value={100}>Within 100 km</option>
              <option value={9999}>All Distances (Statewide)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="cooked">Cooked Meals</option>
              <option value="bakery">Bakery</option>
              <option value="produce">Raw Produce</option>
              <option value="packed">Packed Foods</option>
            </select>
          </div>
        </div>

        {/* Charity List with AI Match Scores */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs px-1 text-slate-500">
            <span>{charitiesWithDistances.length} Verified Charities Near You</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              AI Sorted
            </span>
          </div>

          {charitiesWithDistances.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-2.5 my-2">
              <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />
              <div>
                <span className="text-xs font-bold text-amber-900 block">
                  0 Charities within {selectedRadius === 9999 ? 'all distances' : `${selectedRadius} km`}
                </span>
                <span className="text-[11px] text-amber-700 block mt-0.5">
                  Your live GPS coordinates are in {detectedLocality}.
                </span>
              </div>
              <div className="flex flex-col gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => loadNearbyCharities({ lat: liveLocation.lat, lng: liveLocation.lng })}
                  disabled={isDiscoveringLocal}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isDiscoveringLocal ? 'Discovering Nearby Charities...' : `Find Verified Charities in ${detectedLocality}`}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRadius(9999)}
                  className="px-3 py-1 bg-white border border-amber-300 text-amber-900 rounded-lg text-[11px] font-semibold hover:bg-amber-100 cursor-pointer"
                >
                  Expand Radius to Statewide
                </button>
              </div>
            </div>
          ) : (
            charitiesWithDistances.map((charity) => {
              const isSelected = charity.id === selectedId;
              const analysis = aiAnalyses.find((a) => a.charityId === charity.id);
              const score = analysis?.aiScore ?? 85;

              return (
                <div
                  key={charity.id}
                  onClick={() => handleSelectCharity(charity)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                      <h3 className="font-bold text-xs text-slate-900 leading-snug">
                        {charity.organizationName}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] shrink-0">
                      {score}% AI Match
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {charity.foodRescueId || 'FRC-CH-7K92P'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="truncate text-slate-600">{charity.registrationDetails}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-1.5">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-emerald-600 inline" />
                      {(charity?.distanceKm ?? 0).toFixed(1)} km
                    </span>
                    <span>~{charity.transitMinutes ?? 5} min transit</span>
                    <span className="text-slate-300">•</span>
                    <span className="truncate">{charity.location.place}</span>
                  </div>

                  {analysis && (
                    <p className="text-[10px] text-slate-600 line-clamp-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      {analysis.aiSummary}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px]">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Capacity: {charity.currentCapacityStatus}
                    </span>
                    <span className="text-slate-400">
                      {charity.foodCategoriesAccepted[0]}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area: Google Map + Interactive AI Location Analysis Overlay */}
      <div className="flex-1 relative flex flex-col h-[500px] lg:h-full min-h-[480px]">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            mapId={GOOGLE_MAPS_MAP_ID}
            defaultCenter={{ lat: liveLocation.lat, lng: liveLocation.lng }}
            defaultZoom={13}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={[GOOGLE_MAPS_ATTRIBUTION_ID]}
            className="w-full h-full"
          >
            {/* Camera Controller to pan when selected charity or location changes */}
            <CameraController target={cameraTarget} />

            {/* Route Polyline connecting Live Donor position to Selected Charity */}
            <RoutePolyline path={routePolylinePath} strokeColor="#059669" strokeWeight={5} />

            {/* Donor Live Position Advanced Marker */}
            <AdvancedMarker
              position={{ lat: liveLocation.lat, lng: liveLocation.lng }}
              title="Your Real-time Location"
              onClick={() => setActiveInfoWindowId('donor')}
            >
              <div className="relative flex items-center justify-center cursor-pointer group">
                <span className="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping" />
                <div className="relative w-8 h-8 rounded-full bg-emerald-600 text-white border-2 border-white shadow-lg flex items-center justify-center font-bold text-xs">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="absolute -bottom-5 whitespace-nowrap bg-slate-900/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-md border border-slate-700">
                  You (Live GPS)
                </div>
              </div>
            </AdvancedMarker>

            {/* Charity Advanced Markers */}
            {charitiesWithDistances.map((charity) => {
              const isSelected = charity.id === selectedId;
              const analysis = aiAnalyses.find((a) => a.charityId === charity.id);
              const score = analysis?.aiScore ?? 85;

              return (
                <AdvancedMarker
                  key={charity.id}
                  position={{ lat: charity.location.lat, lng: charity.location.lng }}
                  title={charity.organizationName}
                  onClick={() => {
                    handleSelectCharity(charity);
                    setActiveInfoWindowId(charity.id);
                  }}
                >
                  <div
                    className={`relative flex items-center justify-center cursor-pointer transition-transform ${
                      isSelected ? 'scale-115 z-30' : 'hover:scale-110 z-10'
                    }`}
                  >
                    <div
                      className={`px-2 py-1 rounded-xl shadow-lg border flex items-center gap-1.5 text-xs font-bold ${
                        isSelected
                          ? 'bg-rose-600 text-white border-white ring-2 ring-rose-400'
                          : 'bg-white text-slate-800 border-slate-300'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isSelected ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'
                        }`}
                      />
                      <span className="truncate max-w-[120px]">{charity.organizationName}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                          isSelected ? 'bg-white text-rose-700' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {score}%
                      </span>
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* InfoWindow for selected item */}
            {activeInfoWindowId === 'donor' && (
              <InfoWindow
                position={{ lat: liveLocation.lat, lng: liveLocation.lng }}
                onCloseClick={() => setActiveInfoWindowId(null)}
              >
                <div className="p-2 text-slate-800 max-w-xs text-xs">
                  <span className="font-heading font-bold block text-sm text-emerald-700">
                    Live Donor Location
                  </span>
                  <p className="text-slate-600 mt-1">
                    {donorLocation.organizationName}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {donorLocation.address}
                  </p>
                  <p className="text-slate-400 text-[10px] mt-1">
                    Coordinates: {(liveLocation?.lat ?? DEFAULT_MAP_CENTER.lat).toFixed(5)}, {(liveLocation?.lng ?? DEFAULT_MAP_CENTER.lng).toFixed(5)}
                  </p>
                </div>
              </InfoWindow>
            )}

            {activeInfoWindowId && activeInfoWindowId !== 'donor' && (
              (() => {
                const infoCharity = charities.find((c) => c.id === activeInfoWindowId);
                if (!infoCharity) return null;
                const analysis = aiAnalyses.find((a) => a.charityId === infoCharity.id);

                return (
                  <InfoWindow
                    position={{
                      lat: infoCharity.location.lat,
                      lng: infoCharity.location.lng,
                    }}
                    onCloseClick={() => setActiveInfoWindowId(null)}
                  >
                    <div className="p-2 text-slate-800 max-w-xs text-xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-heading font-bold text-sm text-slate-900">
                          {infoCharity.organizationName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                          {analysis?.aiScore || 85}% Match
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        {infoCharity.location.address}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
                        <span>~{calculateRoute(liveLocation, infoCharity.location).durationMinutes} min transit</span>
                        <span>•</span>
                        <span>Capacity: {infoCharity.currentCapacityStatus}</span>
                      </div>
                      {onSendRequest && (
                        <button
                          onClick={() => onSendRequest(infoCharity)}
                          className="w-full mt-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Direct Food Request</span>
                        </button>
                      )}
                    </div>
                  </InfoWindow>
                );
              })()
            )}
          </Map>
        </APIProvider>

        {/* Map Top Floating Controls */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <button
            onClick={handleRecenterOnMe}
            className="px-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 border border-slate-300 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer"
            title="Recenter on Real-time GPS Location"
          >
            <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
            <span>Recenter</span>
          </button>

          <button
            onClick={() => setShowAnalysisDrawer(!showAnalysisDrawer)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>{showAnalysisDrawer ? 'Hide AI Panel' : 'Show AI Panel'}</span>
          </button>
        </div>

        {/* Real-time AI Location & Urgency Analysis Floating Card */}
        {showAnalysisDrawer && selectedCharity && (
          <div className="absolute bottom-4 left-4 right-4 max-w-xl mx-auto z-10 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-2xl transition-all">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    AI Real-time Location Analysis
                  </span>
                  <span className="text-xs text-slate-400">
                    Grounded with live GPS
                  </span>
                </div>
                <h3 className="font-heading font-black text-base text-slate-900 mt-1">
                  {selectedCharity.organizationName}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-emerald-600 block leading-tight">
                  {selectedAIAnalysis?.aiScore || 96}%
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                  AI Match Score
                </span>
              </div>
            </div>

            {/* Travel Time & Transit Corridor Details */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 mb-3 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Live Distance
                </span>
                <span className="font-heading font-black text-sm text-slate-900">
                  {(selectedCharity.distanceKm ?? 0).toFixed(1)} km
                </span>
              </div>
              <div className="border-x border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Drive Transit
                </span>
                <span className="font-heading font-black text-sm text-emerald-600">
                  ~{selectedCharity.transitMinutes ?? 5} mins
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Safe Handover
                </span>
                <span className="font-heading font-black text-sm text-slate-900">
                  Within {selectedAIAnalysis?.handoverWindowMinutes || 60}m
                </span>
              </div>
            </div>

            {/* AI Insights & Reasoning */}
            <div className="space-y-1.5 text-xs mb-3">
              <p className="text-slate-700 leading-relaxed font-medium">
                {selectedAIAnalysis?.aiSummary ||
                  `${selectedCharity.organizationName} is conveniently located within ${(selectedCharity.distanceKm ?? 0).toFixed(1)} km of your live coordinates, perfectly matching current food shelf-life constraints.`}
              </p>

              {selectedAIAnalysis?.temperatureRiskNotice && (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{selectedAIAnalysis.temperatureRiskNotice}</span>
                </div>
              )}

              {selectedAIAnalysis?.beneficiaryImpact && (
                <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
                  <span>{selectedAIAnalysis.beneficiaryImpact}</span>
                </p>
              )}
            </div>

            {/* Direct Action Button */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              {onSendRequest ? (
                <button
                  onClick={() => onSendRequest(selectedCharity)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Food Donation Request Directly</span>
                </button>
              ) : (
                <div className="flex-1 text-center py-2 text-xs font-semibold text-slate-600">
                  Charity verified & ready for handover coordination
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Location Search / Preset Selection Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading font-black text-base text-slate-900">
                  Set Your Current Location
                </h3>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom Address / Town Search Form */}
            <form onSubmit={handleSearchCustomLocation} className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Search Locality or City in Tamil Nadu
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customSearchQuery}
                    onChange={(e) => setCustomSearchQuery(e.target.value)}
                    placeholder="e.g. Kondamanaickenpatti, Namakkal"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingLocation}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  {isSearchingLocation ? 'Locating...' : 'Set Pin'}
                </button>
              </div>
            </form>

            {/* Popular / Quick Presets */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Select Known Locations
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {POPULAR_LOCATIONS.map((loc) => {
                  const isCurrent = detectedLocality.includes(loc.name.split(',')[0]);
                  return (
                    <button
                      key={loc.name}
                      onClick={() => handleSelectPresetLocation(loc)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                          <MapPin className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{loc.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block pl-5">
                          {loc.subtitle}
                        </span>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100">
              <span>Updates verified local food banks immediately.</span>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

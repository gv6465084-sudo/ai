import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  ExternalLink,
  Navigation,
  Truck,
  CheckCircle2,
  Share2,
  Clock,
  Phone,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { FoodDonation, UserRole } from '../types';
import { calculateRoute, RouteInfo } from '../services/mapService';
import { appState } from '../services/store';
import L from 'leaflet';

interface PickupCoordinationViewProps {
  donation: FoodDonation;
  currentUserRole?: UserRole;
}

export const PickupCoordinationView: React.FC<PickupCoordinationViewProps> = ({
  donation,
  currentUserRole = 'DONOR',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [liveLocationEnabled, setLiveLocationEnabled] = useState(
    !!donation.liveLocationSharing
  );

  // Charity coordinates (Hope Community Center default)
  const charityCoords = {
    lat: 9.0832,
    lng: 77.3524,
  };
  const donorCoords = {
    lat: donation.pickupLocation.lat || 9.0754,
    lng: donation.pickupLocation.lng || 77.3456,
  };

  useEffect(() => {
    const route = calculateRoute(donorCoords, charityCoords);
    setRouteInfo(route);
  }, [donorCoords.lat, donorCoords.lng]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [(donorCoords.lat + charityCoords.lat) / 2, (donorCoords.lng + charityCoords.lng) / 2],
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Donor Green Pin
      const donorIcon = L.divIcon({
        className: 'pickup-donor-pin',
        html: `
          <div style="background-color: #059669; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(5,150,105,0.4); border: 3px solid #fff;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      // Charity Red Pin
      const charityIcon = L.divIcon({
        className: 'pickup-charity-pin',
        html: `
          <div style="background-color: #dc2626; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(220,38,38,0.4); border: 3px solid #fff;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker([donorCoords.lat, donorCoords.lng], { icon: donorIcon })
        .addTo(map)
        .bindPopup(`<strong>${donation.donorName}</strong><br/>Pickup Origin`)
        .openPopup();

      L.marker([charityCoords.lat, charityCoords.lng], { icon: charityIcon })
        .addTo(map)
        .bindPopup(`<strong>${donation.selectedCharityName || 'Hope Community Center'}</strong><br/>1.8 km • Dropoff`);

      mapInstanceRef.current = map;
    }

    if (routeInfo && mapInstanceRef.current) {
      const poly = L.polyline(routeInfo.path, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.9,
      }).addTo(mapInstanceRef.current);

      const bounds = L.latLngBounds([
        [donorCoords.lat, donorCoords.lng],
        [charityCoords.lat, charityCoords.lng],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [35, 35] });
    }
  }, [routeInfo]);

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${donorCoords.lat},${donorCoords.lng}&destination=${charityCoords.lat},${charityCoords.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleConfirmHandover = () => {
    appState.confirmDonorHandover(donation.id);
  };

  const handleConfirmReceived = () => {
    appState.confirmCharityReceived(donation.id);
  };

  const handleToggleLiveLocation = () => {
    setLiveLocationEnabled(!liveLocationEnabled);
    appState.toggleLiveLocation(donation.id);
  };

  const charityName = donation.selectedCharityName || 'Hope Community Center';
  const isCompleted = donation.status === 'COMPLETED';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col h-full">
      {/* Header matching screenshot Bottom-Right-2 */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 leading-tight">
              Location & Route
            </h3>
            <span className="text-xs text-slate-500">
              Direct Donor ↔ Charity pickup route
            </span>
          </div>
        </div>

        {/* Live location sharing switch (Section 28) */}
        <button
          type="button"
          onClick={handleToggleLiveLocation}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            liveLocationEnabled
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
          title="Opt-in temporary live location sharing for active pickup"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{liveLocationEnabled ? 'Live GPS Active' : 'Share Live GPS'}</span>
        </button>
      </div>

      {/* Interactive Route Map */}
      <div className="relative h-64 sm:h-72 w-full bg-slate-100">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Route Card floating badge */}
        {routeInfo && (
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200 shadow-md text-xs">
            <div className="font-heading font-black text-slate-900 text-sm">
              {routeInfo.distanceKm} km • ~{routeInfo.durationMinutes} min
            </div>
            <div className="text-[11px] text-slate-500">
              Kadayanallur Highway Route
            </div>
          </div>
        )}
      </div>

      {/* Route Action Button matching reference screenshot */}
      <div className="p-4 bg-white border-t border-slate-100 space-y-3">
        <button
          type="button"
          onClick={handleOpenGoogleMaps}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm cursor-pointer"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-4 h-4" />
        </button>

        {/* Handover Confirmation Two-Way System (Section 31 requirement) */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Two-Way Handover Confirmation:
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {donation.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Donor Confirmation Box */}
            <div
              className={`p-2.5 rounded-lg border ${
                donation.donorHandoverConfirmed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-1.5">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${
                    donation.donorHandoverConfirmed
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  }`}
                />
                <span>Donor Handover</span>
              </div>
              {donation.donorHandoverConfirmed ? (
                <span className="text-[11px] font-bold text-emerald-700 block">
                  ✓ Confirmed Handed Over
                </span>
              ) : currentUserRole === 'DONOR' ? (
                <button
                  type="button"
                  onClick={handleConfirmHandover}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors"
                >
                  Confirm Handover
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 block italic">
                  Awaiting donor confirmation
                </span>
              )}
            </div>

            {/* Charity Confirmation Box */}
            <div
              className={`p-2.5 rounded-lg border ${
                donation.charityReceivedConfirmed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-1.5">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${
                    donation.charityReceivedConfirmed
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  }`}
                />
                <span>Charity Receipt</span>
              </div>
              {donation.charityReceivedConfirmed ? (
                <span className="text-[11px] font-bold text-emerald-700 block">
                  ✓ Confirmed Received
                </span>
              ) : currentUserRole === 'CHARITY' ? (
                <button
                  type="button"
                  onClick={handleConfirmReceived}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors"
                >
                  Confirm Received
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 block italic">
                  Awaiting charity confirmation
                </span>
              )}
            </div>
          </div>

          {isCompleted && (
            <div className="p-2 bg-emerald-100/70 border border-emerald-300 rounded-lg text-center text-xs font-bold text-emerald-900">
              🎉 Donation Complete! +{donation.portions} meals rescued & recorded in Impact Analytics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

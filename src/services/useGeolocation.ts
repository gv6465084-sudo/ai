import { useState, useEffect, useCallback } from 'react';

export interface RealtimeLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
  isRealtime: boolean;
  address?: string;
  source: 'gps' | 'fallback' | 'simulated';
}

export function useGeolocation(initialCoords: { lat: number; lng: number; address?: string }) {
  const [location, setLocation] = useState<RealtimeLocation>({
    lat: initialCoords.lat,
    lng: initialCoords.lng,
    accuracy: 10,
    timestamp: Date.now(),
    isRealtime: false,
    address: initialCoords.address,
    source: 'fallback',
  });

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(false);

  // Fetch real-time position once or toggle continuous tracking
  const requestCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
          isRealtime: true,
          source: 'gps',
        });
      },
      (err) => {
        setIsLocating(false);
        setError(err.message || 'Unable to retrieve location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  }, []);

  // Continuous watchPosition when isLiveTracking is enabled
  useEffect(() => {
    if (!isLiveTracking || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
          isRealtime: true,
          source: 'gps',
        });
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isLiveTracking]);

  const toggleLiveTracking = useCallback(() => {
    setIsLiveTracking((prev) => {
      const next = !prev;
      if (next && !location.isRealtime) {
        requestCurrentPosition();
      }
      return next;
    });
  }, [location.isRealtime, requestCurrentPosition]);

  const setManualLocation = useCallback((lat: number, lng: number, address?: string) => {
    setLocation({
      lat,
      lng,
      accuracy: 5,
      timestamp: Date.now(),
      isRealtime: true,
      address,
      source: 'simulated',
    });
  }, []);

  return {
    location,
    isLocating,
    isLiveTracking,
    error,
    requestCurrentPosition,
    toggleLiveTracking,
    setManualLocation,
  };
}

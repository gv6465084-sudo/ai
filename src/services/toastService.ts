import { useState, useEffect } from 'react';
import { ToastNotification, UrgencyLevel } from '../types';

type ToastListener = (toasts: ToastNotification[]) => void;

let activeToasts: ToastNotification[] = [];
const listeners = new Set<ToastListener>();

function notify() {
  listeners.forEach((listener) => listener([...activeToasts]));
}

// Gentle Web Audio API synthesizer for clean notification chimes (zero external assets needed)
function playNotificationChime(type: 'success' | 'urgent' | 'info' | 'warning' = 'info') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';

    if (type === 'success') {
      // Pleasant double ascending chord (C5 -> E5 -> G5)
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'urgent') {
      // Prompt alert tone (A5 -> D6)
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.0, now + 0.1); // A5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } else {
      // Soft gentle ping
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.09); // G5
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 600);
  } catch {
    // Audio autoplay restrictions or unsupported browser - silent fail
  }
}

export const toastService = {
  showToast(
    toast: Omit<ToastNotification, 'id' | 'createdAt'> & { sound?: boolean }
  ): string {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newToast: ToastNotification = {
      ...toast,
      id,
      duration: toast.duration ?? 6000,
      createdAt: Date.now(),
    };

    if (toast.sound !== false) {
      playNotificationChime(toast.type);
    }

    // Limit maximum stacked toasts to 5 to avoid screen clutter
    activeToasts = [newToast, ...activeToasts].slice(0, 5);
    notify();

    return id;
  },

  dismissToast(id: string) {
    activeToasts = activeToasts.filter((t) => t.id !== id);
    notify();
  },

  clearAllToasts() {
    activeToasts = [];
    notify();
  },

  /**
   * Domain Notification 1: Alert when a new food donation is available nearby
   */
  notifyNearbyDonation(data: {
    donationId?: string;
    foodName: string;
    portions: number;
    location: string;
    urgencyLevel?: UrgencyLevel | string;
    donorName?: string;
    distanceKm?: number;
    onAction?: () => void;
  }) {
    const isUrgent = data.urgencyLevel === 'HIGH' || data.urgencyLevel === 'CRITICAL';
    return this.showToast({
      title: isUrgent ? '🚨 Urgent Food Donation Nearby!' : '🍲 New Food Donation Nearby',
      message: `${data.portions} portions of ${data.foodName} from ${
        data.donorName || 'Nearby Donor'
      } in ${data.location}${data.distanceKm ? ` (${data.distanceKm.toFixed(1)} km away)` : ''}.`,
      type: isUrgent ? 'urgent' : 'info',
      badge: `${data.portions} Meals`,
      donationId: data.donationId,
      actionLabel: 'View Request',
      onAction: data.onAction,
      duration: isUrgent ? 8000 : 6500,
    });
  },

  /**
   * Domain Notification 2: Alert when a charity accepts a pickup request
   */
  notifyPickupAccepted(data: {
    donationId?: string;
    foodName: string;
    charityName: string;
    portions?: number;
    onAction?: () => void;
  }) {
    return this.showToast({
      title: '🎉 Charity Accepted Your Pickup!',
      message: `${data.charityName} accepted ${data.foodName}${
        data.portions ? ` (${data.portions} meals)` : ''
      }. Direct coordination route & chat are now live!`,
      type: 'success',
      badge: 'Accepted',
      donationId: data.donationId,
      actionLabel: 'Open Route',
      onAction: data.onAction,
      duration: 8000,
    });
  },

  /**
   * Additional Domain Notification: Charity received or completed handover
   */
  notifyHandoverComplete(data: {
    donationId?: string;
    foodName: string;
    charityName: string;
    portions: number;
  }) {
    return this.showToast({
      title: '🌟 Food Rescue Completed!',
      message: `${data.portions} meals of ${data.foodName} safely handed over to ${data.charityName}. Thank you for preventing food waste!`,
      type: 'success',
      badge: `+${data.portions} Saved`,
      duration: 7000,
    });
  },

  /**
   * Additional Domain Notification: Connection request received or accepted
   */
  notifyConnectionStatus(data: {
    title: string;
    partnerName: string;
    type?: 'info' | 'success';
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  }) {
    return this.showToast({
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      badge: 'Partner Link',
      actionLabel: data.actionLabel,
      onAction: data.onAction,
      duration: 6500,
    });
  },
};

export function useToasts(): ToastNotification[] {
  const [toasts, setToasts] = useState<ToastNotification[]>(activeToasts);

  useEffect(() => {
    const handleUpdate = (updated: ToastNotification[]) => {
      setToasts(updated);
    };

    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return toasts;
}

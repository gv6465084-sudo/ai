import { useState, useEffect } from 'react';
import {
  CharityProfile,
  DonorProfile,
  FoodDonation,
  ChatMessage,
  AppNotification,
  PlatformImpactStats,
  UserRole,
  LocationHierarchy,
  ConnectionRequest,
} from '../types';
import {
  INITIAL_CHARITIES,
  INITIAL_DONOR,
  INITIAL_DONATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_IMPACT_STATS,
  SAMPLE_DONATIONS,
  SAMPLE_MESSAGES,
  SAMPLE_NOTIFICATIONS,
  INITIAL_CONNECTION_REQUESTS,
} from '../data/mockData';
import { runAIFoodAnalysis } from './aiService';
import { toastService } from './toastService';

const STORAGE_KEYS = {
  CURRENT_ROLE: 'foodrescue_current_role',
  CURRENT_USER_ID: 'foodrescue_current_user_id',
  DONOR: 'foodrescue_donor',
  CHARITIES: 'foodrescue_charities',
  DONATIONS: 'foodrescue_donations',
  MESSAGES: 'foodrescue_messages',
  NOTIFICATIONS: 'foodrescue_notifications',
  IMPACT: 'foodrescue_impact',
  CONNECTION_REQUESTS: 'foodrescue_connection_requests',
  CONNECTED_PARTNERS: 'foodrescue_connected_partners',
};

const STORAGE_VERSION_KEY = 'foodrescue_storage_version_v4_clean';
const CURRENT_VERSION = 'v4.0_clean_slate_new';

// Automatically detect if user has old demo data cached in localStorage and wipe to fresh clean slate
if (typeof window !== 'undefined') {
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY);
    const existingDonorRaw = localStorage.getItem(STORAGE_KEYS.DONOR);
    const isOldKadayanallur = existingDonorRaw && existingDonorRaw.includes('Kadayanallur');
    if (version !== CURRENT_VERSION || isOldKadayanallur) {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
    }
  } catch {
    // ignore
  }
}

export function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or private mode
  }
}

// Global listeners for reactive store updates
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export const appState = {
  currentRole: getStored<UserRole | null>(STORAGE_KEYS.CURRENT_ROLE, 'DONOR'),
  currentUserId: getStored<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user-donor-1'),
  donor: getStored<DonorProfile>(STORAGE_KEYS.DONOR, INITIAL_DONOR),
  charities: getStored<CharityProfile[]>(STORAGE_KEYS.CHARITIES, INITIAL_CHARITIES),
  donations: getStored<FoodDonation[]>(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS),
  messages: getStored<ChatMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES),
  notifications: getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  impact: getStored<PlatformImpactStats>(STORAGE_KEYS.IMPACT, INITIAL_IMPACT_STATS),
  connectionRequests: getStored<ConnectionRequest[]>(
    STORAGE_KEYS.CONNECTION_REQUESTS,
    INITIAL_CONNECTION_REQUESTS
  ),
  connectedPartners: getStored<string[]>(STORAGE_KEYS.CONNECTED_PARTNERS, [
    'charity-praba-foundation',
  ]),

  // Actions
  setRole(role: UserRole | null, userId?: string) {
    this.currentRole = role;
    if (role === null) {
      setStored(STORAGE_KEYS.CURRENT_ROLE, null);
    } else {
      setStored(STORAGE_KEYS.CURRENT_ROLE, role);
      if (userId) {
        this.currentUserId = userId;
        setStored(STORAGE_KEYS.CURRENT_USER_ID, userId);
      } else if (role === 'DONOR') {
        this.currentUserId = 'user-donor-1';
        setStored(STORAGE_KEYS.CURRENT_USER_ID, 'user-donor-1');
      } else if (role === 'CHARITY') {
        this.currentUserId = 'user-charity-1';
        setStored(STORAGE_KEYS.CURRENT_USER_ID, 'user-charity-1');
      } else {
        this.currentUserId = 'user-admin-1';
        setStored(STORAGE_KEYS.CURRENT_USER_ID, 'user-admin-1');
      }
    }
    notify();
  },

  async createDonation(donationData: Omit<FoodDonation, 'id' | 'createdAt' | 'status' | 'urgencyLevel'>) {
    const id = `FD${Math.floor(10000 + Math.random() * 90000)}`;
    const newDonation: FoodDonation = {
      ...donationData,
      id,
      createdAt: new Date().toISOString(),
      status: 'AI_ANALYZING',
      urgencyLevel: 'MEDIUM',
    };

    // Add immediately with AI_ANALYZING state
    this.donations = [newDonation, ...this.donations];
    setStored(STORAGE_KEYS.DONATIONS, this.donations);
    notify();

    // Run AI Food Analysis
    try {
      const aiResult = await runAIFoodAnalysis({
        foodName: donationData.foodName,
        foodCategory: donationData.foodCategory,
        foodType: donationData.foodType,
        quantity: donationData.quantity,
        portions: donationData.portions,
        preparedDate: donationData.preparedDate,
        preparedTime: donationData.preparedTime,
        storageCondition: donationData.storageCondition,
        storageTemperature: donationData.storageTemperature,
        packagingStatus: donationData.packagingStatus,
        ingredients: donationData.ingredients,
        allergens: donationData.allergens,
      });

      this.donations = this.donations.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'AVAILABLE',
              urgencyLevel: aiResult.urgencyLevel,
              aiAnalysis: aiResult,
            }
          : d
      );

      // Add notification
      this.addNotification({
        userId: this.donor.userId,
        role: 'DONOR',
        title: 'AI Food Analysis Completed',
        message: `${donationData.foodName} evaluated: ${aiResult.urgencyLevel} Urgency (${aiResult.urgencyScore}/100). Recommended charities identified.`,
        type: 'success',
        donationId: id,
      });

      // Trigger Toast Alert for new nearby food donation
      toastService.notifyNearbyDonation({
        donationId: id,
        foodName: donationData.foodName,
        portions: donationData.portions,
        location:
          donationData.pickupLocation.locality ||
          donationData.pickupLocation.place ||
          'Local Neighborhood',
        urgencyLevel: aiResult.urgencyLevel,
        donorName: donationData.donorName,
      });

      // Update donor stats
      this.donor = {
        ...this.donor,
        stats: {
          ...this.donor.stats,
          activeDonations: this.donor.stats.activeDonations + 1,
        },
      };
      setStored(STORAGE_KEYS.DONOR, this.donor);
      setStored(STORAGE_KEYS.DONATIONS, this.donations);
      notify();
      return id;
    } catch {
      this.donations = this.donations.map((d) =>
        d.id === id ? { ...d, status: 'AVAILABLE' } : d
      );
      setStored(STORAGE_KEYS.DONATIONS, this.donations);
      notify();
      return id;
    }
  },

  sendDonationRequest(donationId: string, charityId: string) {
    const charity = this.charities.find((c) => c.id === charityId);
    if (!charity) return;

    this.donations = this.donations.map((d) => {
      if (d.id === donationId) {
        return {
          ...d,
          status: 'REQUEST_SENT',
          selectedCharityId: charityId,
          selectedCharityName: charity.organizationName,
          requestSentAt: new Date().toISOString(),
        };
      }
      return d;
    });

    // Notify Charity
    this.addNotification({
      userId: charity.userId,
      role: 'CHARITY',
      title: 'New Donation Request',
      message: `${this.donor.organizationName} requested to donate food for ${charity.organizationName}. Review urgency and accept.`,
      type: 'urgent',
      donationId,
    });

    // Create introductory message
    const targetDonation = this.donations.find((d) => d.id === donationId);
    if (targetDonation) {
      this.addMessage({
        donationId,
        senderId: this.donor.id,
        senderName: this.donor.organizationName,
        senderRole: 'DONOR',
        text: `Hello ${charity.organizationName}! We have ${targetDonation.portions} portions of ${targetDonation.foodName} (${targetDonation.quantity}) ready for your community. Prepared at ${targetDonation.preparedTime}.`,
      });
    }

    setStored(STORAGE_KEYS.DONATIONS, this.donations);
    notify();
  },

  charityAcceptDonation(donationId: string) {
    const targetDonation = this.donations.find((d) => d.id === donationId);
    if (!targetDonation) return;

    this.donations = this.donations.map((d) =>
      d.id === donationId
        ? {
            ...d,
            status: 'ACCEPTED',
            acceptedAt: new Date().toISOString(),
          }
        : d
    );

    // Notify Donor
    this.addNotification({
      userId: this.donor.userId,
      role: 'DONOR',
      title: 'Charity Accepted Your Donation! 🎉',
      message: `${targetDonation.selectedCharityName} accepted ${targetDonation.foodName}. Direct chat & pickup route are now available.`,
      type: 'success',
      donationId,
    });

    // Trigger Toast Notification for pickup acceptance
    toastService.notifyPickupAccepted({
      donationId,
      foodName: targetDonation.foodName,
      charityName: targetDonation.selectedCharityName || 'Charity Partner',
      portions: targetDonation.portions,
    });

    // Add confirmation message
    this.addMessage({
      donationId,
      senderId: targetDonation.selectedCharityId || 'charity-hope-center',
      senderName: targetDonation.selectedCharityName || 'Charity Partner',
      senderRole: 'CHARITY',
      text: `We are glad to accept your donation of ${targetDonation.foodName}! Our team is coordinating the vehicle for pickup. Please let us know the exact gate or handover point.`,
    });

    setStored(STORAGE_KEYS.DONATIONS, this.donations);
    notify();
  },

  charityRejectDonation(donationId: string, reason: string) {
    this.donations = this.donations.map((d) =>
      d.id === donationId
        ? {
            ...d,
            status: 'REJECTED',
            rejectedReason: reason,
          }
        : d
    );

    this.addNotification({
      userId: this.donor.userId,
      role: 'DONOR',
      title: 'Donation Request Declined',
      message: `The charity was unable to accept this request: "${reason}". You can select another nearby verified charity immediately.`,
      type: 'warning',
      donationId,
    });

    setStored(STORAGE_KEYS.DONATIONS, this.donations);
    notify();
  },

  updateDonationStatus(donationId: string, newStatus: FoodDonation['status']) {
    this.donations = this.donations.map((d) =>
      d.id === donationId ? { ...d, status: newStatus } : d
    );
    setStored(STORAGE_KEYS.DONATIONS, this.donations);
    notify();
  },

  confirmDonorHandover(donationId: string) {
    const donation = this.donations.find((d) => d.id === donationId);
    if (!donation) return;

    const isCharityAlsoConfirmed = donation.charityReceivedConfirmed;

    this.donations = this.donations.map((d) => {
      if (d.id === donationId) {
        return {
          ...d,
          donorHandoverConfirmed: true,
          status: isCharityAlsoConfirmed ? 'COMPLETED' : 'HANDED_OVER',
          completedAt: isCharityAlsoConfirmed ? new Date().toISOString() : d.completedAt,
        };
      }
      return d;
    });

    this.addMessage({
      donationId,
      senderId: this.donor.id,
      senderName: this.donor.organizationName,
      senderRole: 'DONOR',
      text: '✓ Donor confirmed: Food has been handed over safely to the charity driver.',
      isSystem: true,
    });

    if (isCharityAlsoConfirmed) {
      this.recordCompletionImpact(donation);
    }

    setStored(STORAGE_KEYS.DONATIONS, this.donations);
    notify();
  },

  confirmCharityReceived(donationId: string) {
    const donation = this.donations.find((d) => d.id === donationId);
    if (!donation) return;

    const isDonorAlsoConfirmed = donation.donorHandoverConfirmed;

    this.donations = this.donations.map((d) => {
      if (d.id === donationId) {
        return {
          ...d,
          charityReceivedConfirmed: true,
          status: isDonorAlsoConfirmed ? 'COMPLETED' : 'RECEIVED',
          completedAt: isDonorAlsoConfirmed ? new Date().toISOString() : d.completedAt,
        };
      }
      return d;
    });

    this.addMessage({
      donationId,
      senderId: donation.selectedCharityId || 'charity',
      senderName: donation.selectedCharityName || 'Charity',
      senderRole: 'CHARITY',
      text: '✓ Charity confirmed: Food successfully received and verified in clean condition.',
      isSystem: true,
    });

    if (isDonorAlsoConfirmed) {
      this.recordCompletionImpact(donation);
      toastService.notifyHandoverComplete({
        donationId,
        foodName: donation.foodName,
        charityName: donation.selectedCharityName || 'Charity Partner',
        portions: donation.portions || 30,
      });
    }

    setStored(STORAGE_KEYS.DONATIONS, this.donations);
    notify();
  },

  recordCompletionImpact(donation: FoodDonation) {
    const portions = donation.portions || 30;
    const kg = parseFloat(donation.quantity) || Math.round(portions * 0.35);

    this.impact = {
      ...this.impact,
      mealsRescued: this.impact.mealsRescued + portions,
      foodSavedKg: this.impact.foodSavedKg + kg,
      completedDonations: this.impact.completedDonations + 1,
      co2AvoidedKg: this.impact.co2AvoidedKg + Math.round(kg * 2.1),
    };
    setStored(STORAGE_KEYS.IMPACT, this.impact);

    // Update donor stats
    this.donor = {
      ...this.donor,
      stats: {
        ...this.donor.stats,
        mealsDonated: this.donor.stats.mealsDonated + portions,
        foodRescuedKg: this.donor.stats.foodRescuedKg + kg,
        completedDonations: this.donor.stats.completedDonations + 1,
        activeDonations: Math.max(0, this.donor.stats.activeDonations - 1),
      },
    };
    setStored(STORAGE_KEYS.DONOR, this.donor);

    // Update charity stats
    if (donation.selectedCharityId) {
      this.charities = this.charities.map((c) =>
        c.id === donation.selectedCharityId
          ? {
              ...c,
              stats: {
                ...c.stats,
                mealsReceived: c.stats.mealsReceived + portions,
                donationsCompleted: c.stats.donationsCompleted + 1,
              },
            }
          : c
      );
      setStored(STORAGE_KEYS.CHARITIES, this.charities);
    }

    // Add completion notification
    this.addNotification({
      userId: this.donor.userId,
      role: 'DONOR',
      title: 'Donation Completed! 🌟',
      message: `Handover complete for ${donation.foodName}! +${portions} meals rescued (+${kg} kg diverted from landfill).`,
      type: 'success',
      donationId: donation.id,
    });
  },

  addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timeStr,
    };
    this.messages = [...this.messages, newMsg];
    setStored(STORAGE_KEYS.MESSAGES, this.messages);
    notify();
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: 'Just now',
      read: false,
    };
    this.notifications = [newNotif, ...this.notifications];
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    notify();
  },

  markNotificationsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    notify();
  },

  verifyCharity(charityId: string, status: 'verified' | 'rejected') {
    this.charities = this.charities.map((c) =>
      c.id === charityId
        ? {
            ...c,
            verificationStatus: status,
            verifiedAt: status === 'verified' ? new Date().toISOString().split('T')[0] : undefined,
          }
        : c
    );
    if (status === 'verified') {
      this.impact = {
        ...this.impact,
        verifiedCharitiesCount: this.impact.verifiedCharitiesCount + 1,
      };
      setStored(STORAGE_KEYS.IMPACT, this.impact);
    }
    setStored(STORAGE_KEYS.CHARITIES, this.charities);
    notify();
  },

  addOrUpdateLocalCharities(newCharities: CharityProfile[]) {
    const existingIds = new Set(this.charities.map((c) => c.id));
    const toAdd = newCharities.filter((c) => !existingIds.has(c.id));
    if (toAdd.length > 0) {
      this.charities = [...this.charities, ...toAdd];
      setStored(STORAGE_KEYS.CHARITIES, this.charities);
      notify();
    }
  },

  registerDonor(donorData: Omit<DonorProfile, 'id' | 'userId' | 'stats'>) {
    const id = `donor-${Date.now()}`;
    const newDonor: DonorProfile = {
      ...donorData,
      id,
      userId: `user-donor-${Date.now()}`,
      stats: {
        activeDonations: 0,
        pendingPickup: 0,
        mealsDonated: 0,
        foodRescuedKg: 0,
        completedDonations: 0,
      },
    };
    this.donor = newDonor;
    this.currentRole = 'DONOR';
    this.currentUserId = newDonor.userId;
    setStored(STORAGE_KEYS.DONOR, this.donor);
    setStored(STORAGE_KEYS.CURRENT_ROLE, 'DONOR');
    setStored(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    notify();
    return newDonor;
  },

  registerCharity(
    charityData: Omit<
      CharityProfile,
      'id' | 'userId' | 'stats' | 'verificationStatus' | 'foodRescueId'
    > & { foodRescueId?: string }
  ) {
    const id = `charity-${Date.now()}`;
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const foodRescueId = charityData.foodRescueId || `FRC-CH-${randomSuffix}`;
    const newCharity: CharityProfile = {
      ...charityData,
      id,
      foodRescueId,
      userId: `user-charity-${Date.now()}`,
      verificationStatus: 'pending', // Starts pending admin verification as required!
      stats: {
        mealsReceived: 0,
        donationsCompleted: 0,
        donorsConnected: 0,
      },
    };
    this.charities = [...this.charities, newCharity];
    this.currentRole = 'CHARITY';
    this.currentUserId = newCharity.userId;
    setStored(STORAGE_KEYS.CHARITIES, this.charities);
    setStored(STORAGE_KEYS.CURRENT_ROLE, 'CHARITY');
    setStored(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    notify();
    return newCharity;
  },

  toggleLiveLocation(donationId: string) {
    this.donations = this.donations.map((d) =>
      d.id === donationId ? { ...d, liveLocationSharing: !d.liveLocationSharing } : d
    );
    setStored(STORAGE_KEYS.DONATIONS, this.donations);
    notify();
  },

  deleteDonation(donationId: string) {
    this.donations = this.donations.filter((d) => d.id !== donationId);
    this.messages = this.messages.filter((m) => m.donationId !== donationId);
    this.notifications = this.notifications.filter((n) => n.donationId !== donationId);
    this.donor = {
      ...this.donor,
      stats: {
        ...this.donor.stats,
        activeDonations: this.donations.filter((d) => d.status !== 'COMPLETED' && d.status !== 'REJECTED').length,
      },
    };
    setStored(STORAGE_KEYS.DONATIONS, this.donations);
    setStored(STORAGE_KEYS.MESSAGES, this.messages);
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    setStored(STORAGE_KEYS.DONOR, this.donor);
    notify();
  },

  updateDonorProfile(updates: Partial<DonorProfile>) {
    this.donor = {
      ...this.donor,
      ...updates,
      location: {
        ...this.donor.location,
        ...(updates.location || {}),
      },
    };
    setStored(STORAGE_KEYS.DONOR, this.donor);
    notify();
  },

  loadSampleDonations() {
    const now = new Date();
    const freshSamples = SAMPLE_DONATIONS.map((d, index) => ({
      ...d,
      id: `FD${Math.floor(20000 + Math.random() * 80000)}`,
      createdAt: new Date(Date.now() - index * 1800000).toISOString(),
      preparedDate: now.toISOString().split('T')[0],
      preparedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    this.donations = freshSamples;
    this.messages = SAMPLE_MESSAGES;
    this.notifications = SAMPLE_NOTIFICATIONS;
    this.donor = {
      ...this.donor,
      stats: {
        ...this.donor.stats,
        activeDonations: freshSamples.length,
      },
    };
    setStored(STORAGE_KEYS.DONATIONS, this.donations);
    setStored(STORAGE_KEYS.MESSAGES, this.messages);
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    setStored(STORAGE_KEYS.DONOR, this.donor);
    notify();
  },

  clearAllDemoData() {
    this.donations = [];
    this.messages = [];
    this.notifications = [];
    this.donor = {
      ...INITIAL_DONOR,
      stats: {
        activeDonations: 0,
        pendingPickup: 0,
        mealsDonated: 0,
        foodRescuedKg: 0,
        completedDonations: 0,
      },
    };
    this.charities = INITIAL_CHARITIES;
    this.impact = {
      mealsRescued: 0,
      foodSavedKg: 0,
      verifiedCharitiesCount: this.charities.filter((c) => c.verificationStatus === 'verified').length,
      donorPartnersCount: 1,
      completedDonations: 0,
      co2AvoidedKg: 0,
      averageResponseMinutes: 0,
    };

    setStored(STORAGE_KEYS.DONATIONS, []);
    setStored(STORAGE_KEYS.MESSAGES, []);
    setStored(STORAGE_KEYS.NOTIFICATIONS, []);
    setStored(STORAGE_KEYS.DONOR, this.donor);
    setStored(STORAGE_KEYS.CHARITIES, this.charities);
    setStored(STORAGE_KEYS.IMPACT, this.impact);
    notify();
  },

  // -------------------------------------------------------------
  // Manual Charity ID & Connection Request System
  // -------------------------------------------------------------
  findCharityByIdOrReg(searchTerm: string): CharityProfile | undefined {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return undefined;

    return this.charities.find((c) => {
      const matchFoodRescueId =
        c.foodRescueId?.toLowerCase() === q ||
        c.foodRescueId?.toLowerCase().replace(/-/g, '') === q.replace(/-/g, '');
      const matchReg =
        c.registrationDetails?.toLowerCase() === q ||
        c.registrationDetails?.toLowerCase().replace(/\//g, '') === q.replace(/\//g, '') ||
        c.registrationDetails?.toLowerCase().includes(q);
      const matchName = c.organizationName.toLowerCase().includes(q);
      const matchId = c.id.toLowerCase() === q;

      return matchFoodRescueId || matchReg || matchName || matchId;
    });
  },

  sendConnectionRequest(charityId: string, reason?: string) {
    const charity = this.charities.find((c) => c.id === charityId);
    if (!charity) return null;

    // Check if already connected or pending
    const existing = this.connectionRequests.find(
      (r) =>
        r.donorId === this.donor.id &&
        r.charityId === charityId &&
        (r.status === 'PENDING' || r.status === 'ACCEPTED')
    );
    if (existing) {
      return existing;
    }

    const newRequest: ConnectionRequest = {
      id: `req-conn-${Date.now()}`,
      donorId: this.donor.id,
      donorName: this.donor.organizationName,
      donorOrganizationType: this.donor.organizationType,
      donorLocation: this.donor.location.address || `${this.donor.location.locality}, ${this.donor.location.place}`,
      donorPhone: this.donor.phone,
      donorCompletedDonations: this.donor.stats.completedDonations,
      charityId: charity.id,
      charityName: charity.organizationName,
      charityFoodRescueId: charity.foodRescueId || 'FRC-CH-UNKNOWN',
      reason: reason || 'Regular surplus food donation partner',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.connectionRequests = [newRequest, ...this.connectionRequests];
    setStored(STORAGE_KEYS.CONNECTION_REQUESTS, this.connectionRequests);

    // Notify Charity
    this.addNotification({
      userId: charity.userId,
      role: 'CHARITY',
      title: 'New Connection Request 🤝',
      message: `${this.donor.organizationName} (${this.donor.organizationType}) wants to connect using your FoodRescue ID / Registration ID.`,
      type: 'info',
    });

    notify();
    return newRequest;
  },

  acceptConnectionRequest(requestId: string) {
    const req = this.connectionRequests.find((r) => r.id === requestId);
    if (!req) return;

    this.connectionRequests = this.connectionRequests.map((r) =>
      r.id === requestId
        ? { ...r, status: 'ACCEPTED', respondedAt: new Date().toISOString() }
        : r
    );

    // Add to connected partners
    if (!this.connectedPartners.includes(req.charityId)) {
      this.connectedPartners = [...this.connectedPartners, req.charityId];
      setStored(STORAGE_KEYS.CONNECTED_PARTNERS, this.connectedPartners);
    }

    // Update Charity's connected donors count
    this.charities = this.charities.map((c) =>
      c.id === req.charityId
        ? {
            ...c,
            connectedDonorIds: Array.from(new Set([...(c.connectedDonorIds || []), req.donorId])),
            stats: {
              ...c.stats,
              donorsConnected: (c.stats.donorsConnected || 0) + 1,
            },
          }
        : c
    );
    setStored(STORAGE_KEYS.CHARITIES, this.charities);

    // Update Donor's connected charities
    this.donor = {
      ...this.donor,
      connectedCharityIds: Array.from(
        new Set([...(this.donor.connectedCharityIds || []), req.charityId])
      ),
    };
    setStored(STORAGE_KEYS.DONOR, this.donor);
    setStored(STORAGE_KEYS.CONNECTION_REQUESTS, this.connectionRequests);

    // Notify Donor
    this.addNotification({
      userId: req.donorId,
      role: 'DONOR',
      title: 'Connection Accepted! 🤝',
      message: `${req.charityName} accepted your connection request. You can now send direct donations and messages anytime.`,
      type: 'success',
    });

    notify();
  },

  rejectConnectionRequest(requestId: string, reason?: string) {
    const req = this.connectionRequests.find((r) => r.id === requestId);
    if (!req) return;

    this.connectionRequests = this.connectionRequests.map((r) =>
      r.id === requestId
        ? { ...r, status: 'REJECTED', respondedAt: new Date().toISOString() }
        : r
    );
    setStored(STORAGE_KEYS.CONNECTION_REQUESTS, this.connectionRequests);

    this.addNotification({
      userId: req.donorId,
      role: 'DONOR',
      title: 'Connection Request Update',
      message: `${req.charityName} was unable to establish a direct connection at this time${reason ? `: "${reason}"` : '.'}`,
      type: 'info',
    });

    notify();
  },

  isPartnerConnected(charityId: string): boolean {
    return (
      this.connectedPartners.includes(charityId) ||
      (this.donor.connectedCharityIds || []).includes(charityId)
    );
  },

  getConnectedCharities(): CharityProfile[] {
    const connectedIds = new Set([
      ...this.connectedPartners,
      ...(this.donor.connectedCharityIds || []),
    ]);
    return this.charities.filter((c) => connectedIds.has(c.id));
  },

  getPendingConnectionRequests(charityId?: string): ConnectionRequest[] {
    return this.connectionRequests.filter(
      (r) =>
        r.status === 'PENDING' &&
        (!charityId || r.charityId === charityId)
    );
  },

  resetDemoData() {
    this.clearAllDemoData();
  },
};

export function useAppState() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return appState;
}

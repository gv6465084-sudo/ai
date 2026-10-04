export type UserRole = 'DONOR' | 'CHARITY' | 'ADMIN';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'REVIEW REQUIRED';

export type DonationStatus =
  | 'CREATED'
  | 'AI_ANALYZING'
  | 'AVAILABLE'
  | 'REQUEST_SENT'
  | 'ACCEPTED'
  | 'PICKUP_COORDINATION'
  | 'READY_FOR_HANDOVER'
  | 'HANDED_OVER'
  | 'RECEIVED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationHierarchy {
  state: string;
  district: string;
  place: string;
  locality: string;
  address: string;
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  organizationName: string;
  organizationType: string;
  location: LocationHierarchy;
  isVerified?: boolean;
}

export interface DonorProfile {
  id: string;
  userId: string;
  organizationName: string;
  organizationType: 'Restaurant' | 'Hotel' | 'Marriage Hall' | 'Catering Company' | 'Bakery' | 'Canteen' | 'Event Organizer' | 'Food Business';
  contactPerson: string;
  phone: string;
  email: string;
  location: LocationHierarchy;
  foodCategories: string[];
  operatingHours: string;
  description: string;
  pickupRadiusKm: number;
  connectedCharityIds?: string[];
  stats: {
    activeDonations: number;
    pendingPickup: number;
    mealsDonated: number;
    foodRescuedKg: number;
    completedDonations: number;
  };
}

export interface CharityProfile {
  id: string;
  foodRescueId: string; // Unique FoodRescue Platform ID (e.g. FRC-CH-7K92P)
  userId: string;
  organizationName: string;
  organizationType: 'NGO' | 'Shelter' | 'Community Kitchen' | 'Food Bank' | 'Charity Organization';
  registrationDetails: string; // Legal / NGO Darpan Registration ID (e.g. TN/NGO/2019/004821)
  contactPerson: string;
  phone: string;
  email: string;
  location: LocationHierarchy;
  serviceRadiusKm: number;
  foodCategoriesAccepted: string[];
  dailyCapacity: number; // in portions
  currentCapacityStatus: 'Available' | 'Limited' | 'Full';
  operatingHours: string;
  isOpenNow: boolean;
  serviceAreas: string[];
  description: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  verifiedAt?: string;
  imageUrl?: string;
  connectedDonorIds?: string[];
  stats: {
    mealsReceived: number;
    donationsCompleted: number;
    donorsConnected: number;
  };
}

export interface ConnectionRequest {
  id: string;
  donorId: string;
  donorName: string;
  donorOrganizationType: string;
  donorLocation: string;
  donorPhone: string;
  donorCompletedDonations: number;
  charityId: string;
  charityName: string;
  charityFoodRescueId: string;
  reason: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  respondedAt?: string;
}

export interface NutritionEstimate {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  notes: string;
}

export interface AIFoodAnalysisResult {
  foodAge: string;
  donationWindow: string; // e.g. "Next 2 - 4 hours"
  urgencyLevel: UrgencyLevel;
  urgencyScore: number; // 0 - 100
  pickupPriority: string; // "Prioritize connecting with a nearby charity"
  reasoning: string[];
  nutrition: NutritionEstimate;
  storageSafetyAssessment: string;
  allergensDetected: string[];
}

export interface CharityMatch {
  charity: CharityProfile;
  matchScore: number; // e.g. 95%
  distanceKm: number;
  estimatedDriveMinutes: number;
  reasons: string[];
}

export interface FoodDonation {
  id: string;
  donorId: string;
  donorName: string;
  donorOrganizationType: string;
  donorPhone: string;
  foodName: string;
  foodCategory: 'Cooked Meal' | 'Bakery' | 'Packed Food' | 'Raw Produce' | 'Dairy & Desserts' | 'Other';
  foodType: 'Vegetarian' | 'Non-Veg' | 'Vegan' | 'Egg';
  quantity: string; // e.g. "12 kg"
  portions: number; // e.g. 30 portions
  preparedDate: string;
  preparedTime: string; // e.g. "5:20 PM"
  storageCondition: 'Room Temperature' | 'Refrigerated' | 'Hot Holding' | 'Frozen';
  storageTemperature?: string;
  packagingStatus: 'Packed' | 'Bulk Containers' | 'Individually Sealed' | 'Open Tray';
  ingredients: string;
  allergens: string[];
  foodImage: string;
  pickupLocation: LocationHierarchy;
  additionalNotes?: string;
  createdAt: string;

  // AI Analysis
  aiAnalysis?: AIFoodAnalysisResult;
  urgencyLevel: UrgencyLevel;

  // Lifecycle
  status: DonationStatus;
  selectedCharityId?: string;
  selectedCharityName?: string;
  requestSentAt?: string;
  acceptedAt?: string;
  donorHandoverConfirmed?: boolean;
  charityReceivedConfirmed?: boolean;
  completedAt?: string;
  rejectedReason?: string;
  liveLocationSharing?: boolean;
}

export interface ChatMessage {
  id: string;
  donationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  role: UserRole;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  donationId?: string;
  timestamp: string;
  read: boolean;
}

export interface SurplusPrediction {
  dayOfWeek: string;
  expectedSurplusPortionsMin: number;
  expectedSurplusPortionsMax: number;
  likelyCategory: string;
  recommendation: string;
  optimalTimeWindow: string;
  suggestedCharities: string[];
}

export interface PlatformImpactStats {
  mealsRescued: number;
  foodSavedKg: number;
  verifiedCharitiesCount: number;
  donorPartnersCount: number;
  completedDonations: number;
  co2AvoidedKg: number;
  averageResponseMinutes: number;
}

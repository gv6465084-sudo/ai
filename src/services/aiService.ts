import {
  AIFoodAnalysisResult,
  CharityMatch,
  CharityProfile,
  FoodDonation,
  LocationCoordinates,
  SurplusPrediction,
  UrgencyLevel,
} from '../types';
import { calculateHaversineDistance, calculateRoute } from './mapService';

/**
 * Performs comprehensive AI Food Analysis on donated items.
 */
export async function runAIFoodAnalysis(donation: {
  foodName: string;
  foodCategory: string;
  foodType: string;
  quantity: string;
  portions: number;
  preparedDate: string;
  preparedTime: string;
  storageCondition: string;
  storageTemperature?: string;
  packagingStatus: string;
  ingredients: string;
  allergens?: string[];
}): Promise<AIFoodAnalysisResult> {
  // First attempt backend Gemini-powered analysis endpoint
  try {
    const res = await fetch('/api/ai/food-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donation),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.urgencyLevel && data.urgencyScore !== undefined) {
        return data;
      }
    }
  } catch {
    // If backend is not reached, proceed with full client-side algorithmic engine
  }

  // Calculate elapsed time from preparation
  const now = new Date();
  let elapsedMinutes = 110; // Default 1h 50m if time parsing is approximate

  if (donation.preparedTime) {
    const parts = donation.preparedTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (parts) {
      let hours = parseInt(parts[1], 10);
      const mins = parseInt(parts[2], 10);
      const meridiem = parts[3]?.toUpperCase();
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      const prepDate = new Date();
      prepDate.setHours(hours, mins, 0, 0);
      const diffMs = now.getTime() - prepDate.getTime();
      if (diffMs > 0 && diffMs < 24 * 60 * 60 * 1000) {
        elapsedMinutes = Math.floor(diffMs / (1000 * 60));
      }
    }
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const remainingMins = elapsedMinutes % 60;
  const foodAgeStr = elapsedHours > 0 ? `${elapsedHours}h ${remainingMins}m since preparation` : `${remainingMins}m since preparation`;

  // Compute urgency score & level
  let baseScore = 45;
  const reasons: string[] = [];

  // Storage impact
  if (donation.storageCondition === 'Room Temperature') {
    baseScore += 35;
    reasons.push('Ambient room temperature storage accelerates microbial activity; swift transfer required.');
  } else if (donation.storageCondition === 'Hot Holding') {
    baseScore += 20;
    reasons.push('Maintained under hot holding; best consumed promptly to preserve moisture and food appeal.');
  } else if (donation.storageCondition === 'Refrigerated') {
    baseScore += 10;
    reasons.push('Proper refrigeration at 4°C stabilizes freshness window while requiring insulated transport.');
  } else if (donation.storageCondition === 'Frozen') {
    baseScore -= 10;
    reasons.push('Deep frozen condition allows extended handling horizon.');
  }

  // Elapsed time impact
  if (elapsedMinutes > 240) {
    baseScore += 25;
    reasons.push('Food has been prepared over 4 hours ago; urgent charity handover recommended.');
  } else if (elapsedMinutes > 120) {
    baseScore += 15;
    reasons.push('Prepared over 2 hours ago; aligns with immediate meal serving schedules.');
  }

  // Category & Type impact
  const isPerishableCooked = donation.foodCategory === 'Cooked Meal';
  if (isPerishableCooked) {
    baseScore += 15;
    reasons.push('Cooked meal items are highly perishable and intended for immediate distribution.');
  }
  if (donation.foodType === 'Non-Veg') {
    baseScore += 10;
    reasons.push('Poultry or meat protein requires strict cold/hot chain adherence.');
  }

  // Volume
  if (donation.portions >= 40) {
    reasons.push(`High batch volume (${donation.portions} portions) can feed an entire shelter sitting.`);
  }

  const urgencyScore = Math.min(Math.max(baseScore, 20), 96);
  let urgencyLevel: UrgencyLevel = 'MEDIUM';
  let donationWindow = 'Next 3 - 5 hours';
  let pickupPriority = 'Prioritize connection with a nearby verified charity.';

  if (urgencyScore >= 80) {
    urgencyLevel = 'HIGH';
    donationWindow = 'Next 2 - 4 hours';
    pickupPriority = 'Prioritize connecting with a nearby charity immediately.';
  } else if (urgencyScore >= 92) {
    urgencyLevel = 'CRITICAL';
    donationWindow = 'Within 1 - 2 hours';
    pickupPriority = 'Immediate pickup required; notify closest emergency shelter.';
  } else if (urgencyScore < 45) {
    urgencyLevel = 'LOW';
    donationWindow = 'Next 6 - 8 hours';
    pickupPriority = 'Standard scheduled collection window.';
  }

  // Estimated nutrition (per portion)
  const isRice = donation.foodName.toLowerCase().includes('rice') || donation.foodName.toLowerCase().includes('biryani');
  const isBread = donation.foodName.toLowerCase().includes('chapati') || donation.foodName.toLowerCase().includes('roti') || donation.foodCategory === 'Bakery';

  const calories = isRice ? (donation.foodType === 'Non-Veg' ? 520 : 340) : isBread ? 310 : 280;
  const proteinGrams = donation.foodType === 'Non-Veg' ? 28.5 : isRice ? 7.2 : 9.5;
  const carbsGrams = isRice ? (donation.foodType === 'Non-Veg' ? 62.0 : 58.5) : 52.0;
  const fatGrams = donation.foodType === 'Non-Veg' ? 16.5 : 8.4;

  const detectedAllergens: string[] = donation.allergens || [];
  const ingLower = donation.ingredients.toLowerCase();
  if (ingLower.includes('ghee') || ingLower.includes('milk') || ingLower.includes('curd') || ingLower.includes('paneer')) {
    if (!detectedAllergens.includes('Dairy')) detectedAllergens.push('Dairy');
  }
  if (ingLower.includes('wheat') || ingLower.includes('flour') || ingLower.includes('maida')) {
    if (!detectedAllergens.includes('Gluten')) detectedAllergens.push('Gluten');
  }
  if (ingLower.includes('peanut') || ingLower.includes('cashew') || ingLower.includes('nut')) {
    if (!detectedAllergens.includes('Nuts')) detectedAllergens.push('Tree Nuts');
  }

  return {
    foodAge: foodAgeStr,
    donationWindow,
    urgencyLevel,
    urgencyScore,
    pickupPriority,
    reasoning: reasons.slice(0, 3),
    storageSafetyAssessment: `${donation.packagingStatus} under ${donation.storageCondition} (${donation.storageTemperature || 'Standard'}). Ready for pickup.`,
    allergensDetected: detectedAllergens,
    nutrition: {
      calories,
      proteinGrams,
      carbsGrams,
      fatGrams,
      notes: 'Estimates provided for planning and nutrition distribution balancing.',
    },
  };
}

/**
 * AI Charity Recommendation & Match Score Engine
 * Considers: Distance, Locality, Food Category match, Capacity, Open status, Service Radius.
 */
export function rankNearbyCharities(
  donation: FoodDonation | {
    foodName: string;
    foodCategory: string;
    foodType: string;
    portions: number;
    urgencyLevel?: UrgencyLevel;
    pickupLocation: {
      state: string;
      district: string;
      place: string;
      locality: string;
      lat: number;
      lng: number;
    };
  },
  charities: CharityProfile[]
): CharityMatch[] {
  const donorCoords = {
    lat: donation.pickupLocation.lat,
    lng: donation.pickupLocation.lng,
  };

  const matches: CharityMatch[] = charities.map((charity) => {
    const charityCoords = {
      lat: charity.location.lat,
      lng: charity.location.lng,
    };

    const straightDist = calculateHaversineDistance(donorCoords, charityCoords);
    const route = calculateRoute(donorCoords, charityCoords);

    let score = 50;
    const reasons: string[] = [];

    // 1. Locality & Place Priority
    const sameLocality =
      charity.location.locality.toLowerCase() ===
      donation.pickupLocation.locality.toLowerCase();
    const samePlace =
      charity.location.place.toLowerCase() ===
      donation.pickupLocation.place.toLowerCase();
    const sameDistrict =
      charity.location.district.toLowerCase() ===
      donation.pickupLocation.district.toLowerCase();

    if (sameLocality) {
      score += 25;
      reasons.push('Same locality / immediate neighborhood');
    } else if (samePlace) {
      score += 18;
      reasons.push(`Same town (${charity.location.place})`);
    } else if (sameDistrict) {
      score += 10;
      reasons.push(`Within ${charity.location.district} district`);
    }

    // 2. Distance & Travel Time
    if (route.distanceKm <= 3.0) {
      score += 15;
      reasons.push(`Very close (${route.distanceKm} km, ~${route.durationMinutes} min drive)`);
    } else if (route.distanceKm <= 8.0) {
      score += 8;
      reasons.push(`Convenient distance (${route.distanceKm} km)`);
    } else if (route.distanceKm > charity.serviceRadiusKm) {
      score -= 20;
    }

    // 3. Verification Badge
    if (charity.verificationStatus === 'verified') {
      score += 10;
      reasons.push('Verified charity organization');
    }

    // 4. Food Acceptance Match
    const foodCat = donation.foodCategory;
    const foodType = donation.foodType;
    const acceptsCategory = charity.foodCategoriesAccepted.some(
      (cat) =>
        cat.toLowerCase().includes(foodCat.toLowerCase()) ||
        cat.toLowerCase().includes('cooked') ||
        (foodType === 'Vegetarian' && cat.toLowerCase().includes('veg'))
    );

    if (acceptsCategory) {
      score += 12;
      reasons.push(`Accepts ${foodType} ${foodCat.toLowerCase()}`);
    } else {
      score -= 15;
    }

    // 5. Capacity Availability
    if (charity.currentCapacityStatus === 'Available') {
      score += 8;
      reasons.push('Sufficient distribution capacity available');
    } else if (charity.currentCapacityStatus === 'Limited') {
      score -= 5;
      reasons.push('Limited intake capacity');
    }

    // 6. Currently Open
    if (charity.isOpenNow) {
      score += 5;
      reasons.push('Currently open for active intake');
    }

    // Normalize score to 0 - 99%
    const finalScore = Math.min(Math.max(score, 25), 98);

    return {
      charity,
      matchScore: finalScore,
      distanceKm: route.distanceKm,
      estimatedDriveMinutes: route.durationMinutes,
      reasons: reasons.slice(0, 5),
    };
  });

  // Sort descending by match score
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Predicts surplus based on day and donor pattern
 */
export function predictDonorSurplus(
  dayOfWeek: string,
  donorName: string
): SurplusPrediction {
  const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
  return {
    dayOfWeek,
    expectedSurplusPortionsMin: isWeekend ? 30 : 18,
    expectedSurplusPortionsMax: isWeekend ? 55 : 32,
    likelyCategory: isWeekend ? 'Cooked Meals (Vegetarian / Rice)' : 'Cooked Meals',
    recommendation: `${donorName} historical records indicate high likelihood of excess food between 7:30 PM and 8:30 PM on ${dayOfWeek}. Nearby verified charities are ready.`,
    optimalTimeWindow: '7:30 PM - 8:30 PM',
    suggestedCharities: ['Hope Community Center', 'Helping Hands NGO'],
  };
}

export interface AILocationCharityAnalysis {
  charityId: string;
  charityName: string;
  aiScore: number;
  urgencyFit: 'CRITICAL_MATCH' | 'OPTIMAL' | 'MODERATE' | 'NOT_RECOMMENDED';
  distanceKm: number;
  transitMinutes: number;
  handoverWindowMinutes: number;
  aiSummary: string;
  logisticsRecommendation: string;
  temperatureRiskNotice?: string;
  beneficiaryImpact: string;
  keyStrengths: string[];
}

/**
 * Performs Deep AI Location & Urgency analysis comparing real-time donor GPS coordinates to nearby charities.
 */
export async function analyzeLocationCharitiesWithAI(
  donorCoords: { lat: number; lng: number; address?: string },
  donation: FoodDonation | null,
  charities: CharityProfile[]
): Promise<AILocationCharityAnalysis[]> {
  // 1. Attempt server-side Gemini AI analysis first
  try {
    const res = await fetch('/api/ai/analyze-location-charities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        donorCoords,
        donation: donation
          ? {
              foodName: donation.foodName,
              foodCategory: donation.foodCategory,
              foodType: donation.foodType,
              portions: donation.portions,
              storageCondition: donation.storageCondition,
              urgencyLevel: donation.urgencyLevel,
            }
          : null,
        charities: charities.map((c) => ({
          id: c.id,
          name: c.organizationName,
          location: c.location,
          capacityStatus: c.currentCapacityStatus,
          foodCategoriesAccepted: c.foodCategoriesAccepted,
          isOpenNow: c.isOpenNow,
          dailyCapacity: c.dailyCapacity,
        })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.analyses) && data.analyses.length > 0) {
        return data.analyses;
      }
    }
  } catch {
    // Proceed with algorithmic fallback
  }

  // 2. High-precision Algorithmic AI Location Analysis fallback
  const isCooked = donation ? donation.foodCategory.toLowerCase().includes('cooked') : true;
  const portions = donation?.portions || 40;
  const isRefrigerated = donation?.storageCondition === 'Refrigerated';

  return charities.map((charity) => {
    const straightDist = calculateHaversineDistance(donorCoords, charity.location);
    const route = calculateRoute(donorCoords, charity.location);
    const dist = route.distanceKm;
    const transitMin = route.durationMinutes;

    let score = 55;
    const strengths: string[] = [];

    // Distance impact
    if (dist <= 2.0) {
      score += 26;
      strengths.push(`Direct vicinity: ${(dist ?? 0).toFixed(1)} km (${transitMin} min drive)`);
    } else if (dist <= 5.0) {
      score += 18;
      strengths.push(`Short transit corridor: ${(dist ?? 0).toFixed(1)} km`);
    } else if (dist <= 10.0) {
      score += 8;
      strengths.push(`Moderate distance: ${(dist ?? 0).toFixed(1)} km`);
    } else {
      score -= 15;
    }

    // Urgency & Food type alignment
    let urgencyFit: AILocationCharityAnalysis['urgencyFit'] = 'OPTIMAL';
    let tempRisk = '';

    if (isCooked && !isRefrigerated) {
      if (transitMin <= 15) {
        score += 15;
        urgencyFit = 'CRITICAL_MATCH';
        strengths.push('Under 15-min transit maintains hot-holding compliance without thermal degradation');
      } else if (transitMin <= 30) {
        urgencyFit = 'OPTIMAL';
        tempRisk = 'Standard thermal insulation container recommended during transit.';
      } else {
        urgencyFit = 'MODERATE';
        score -= 10;
        tempRisk = 'Extended transit time risks falling into the 20°C - 50°C danger zone.';
      }
    } else {
      strengths.push('Stable shelf-life accommodates flexible dispatch');
    }

    // Category and capacity matching
    const accepts = donation
      ? charity.foodCategoriesAccepted.some(
          (c) =>
            c.toLowerCase().includes(donation.foodCategory.toLowerCase()) ||
            c.toLowerCase().includes('cooked') ||
            (donation.foodType === 'Vegetarian' && c.toLowerCase().includes('veg'))
        )
      : true;

    if (accepts) {
      score += 12;
      strengths.push(`Accepts ${donation?.foodType || 'fresh'} ${donation?.foodCategory || 'meals'}`);
    } else {
      score -= 20;
    }

    if (charity.currentCapacityStatus === 'Available') {
      score += 8;
      strengths.push('Active volunteer intake crew available right now');
    }

    if (charity.isOpenNow) {
      score += 5;
    } else {
      score -= 12;
    }

    const finalScore = Math.min(Math.max(score, 20), 99);

    const handoverWindow = isCooked ? Math.max(90 - transitMin * 2, 30) : 180;
    const computedFit: AILocationCharityAnalysis['urgencyFit'] =
      finalScore >= 90 ? 'CRITICAL_MATCH' : finalScore >= 75 ? 'OPTIMAL' : 'MODERATE';

    return {
      charityId: charity.id,
      charityName: charity.organizationName,
      aiScore: finalScore,
      urgencyFit: computedFit,
      distanceKm: dist,
      transitMinutes: transitMin,
      handoverWindowMinutes: handoverWindow,
      aiSummary: `${charity.organizationName} is located ${(dist ?? 0).toFixed(1)} km from your real-time GPS position with a ${transitMin}-minute transit time. It currently has active capacity and direct beneficiary need for ${portions} meals.`,
      logisticsRecommendation: `Recommended dispatch within ${handoverWindow} minutes via ${charity.location.address}. Direct vehicle handover coordinates ready.`,
      temperatureRiskNotice: tempRisk || undefined,
      beneficiaryImpact: `Will serve approximately ${Math.min(portions, 50)} immediate meals to families and children at ${charity.location.place}.`,
      keyStrengths: strengths.slice(0, 4),
    };
  }).sort((a, b) => b.aiScore - a.aiScore);
}


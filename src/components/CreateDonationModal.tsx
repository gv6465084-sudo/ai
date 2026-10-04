import React, { useState, useEffect } from 'react';
import {
  Utensils,
  X,
  Sparkles,
  MapPin,
  Clock,
  Package,
  Thermometer,
  AlertTriangle,
  Upload,
  Mic,
} from 'lucide-react';
import { LocationHierarchy, CharityProfile } from '../types';
import { LocationPicker } from './LocationPicker';
import { appState, useAppState } from '../services/store';
import { ParsedFoodDonation } from '../services/voiceParser';

interface CreateDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (donationId: string) => void;
  initialParsedData?: ParsedFoodDonation | null;
  onOpenVoiceModal?: () => void;
  preselectedCharity?: CharityProfile | null;
}

export const CreateDonationModal: React.FC<CreateDonationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialParsedData,
  onOpenVoiceModal,
  preselectedCharity,
}) => {
  const state = useAppState();
  const donor = state.donor;

  const [foodName, setFoodName] = useState('');
  const [foodCategory, setFoodCategory] = useState<
    'Cooked Meal' | 'Bakery' | 'Packed Food' | 'Raw Produce' | 'Dairy & Desserts' | 'Other'
  >('Cooked Meal');
  const [foodType, setFoodType] = useState<'Vegetarian' | 'Non-Veg' | 'Vegan' | 'Egg'>('Vegetarian');
  const [quantity, setQuantity] = useState('');
  const [portions, setPortions] = useState(25);
  const [preparedDate, setPreparedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [preparedTime, setPreparedTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [storageCondition, setStorageCondition] = useState<
    'Room Temperature' | 'Refrigerated' | 'Hot Holding' | 'Frozen'
  >('Hot Holding');
  const [storageTemperature, setStorageTemperature] = useState('65°C');
  const [packagingStatus, setPackagingStatus] = useState<
    'Packed' | 'Bulk Containers' | 'Individually Sealed' | 'Open Tray'
  >('Packed');
  const [ingredients, setIngredients] = useState('');
  const [allergens, setAllergens] = useState<string[]>([]);
  const [foodImage, setFoodImage] = useState(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  );
  const [useRegisteredLocation, setUseRegisteredLocation] = useState(true);
  const [customLocation, setCustomLocation] = useState<LocationHierarchy>(donor.location);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with initialParsedData whenever it changes
  useEffect(() => {
    if (initialParsedData) {
      if (initialParsedData.foodName) setFoodName(initialParsedData.foodName);
      if (initialParsedData.foodCategory) setFoodCategory(initialParsedData.foodCategory);
      if (initialParsedData.foodType) setFoodType(initialParsedData.foodType);
      if (initialParsedData.quantity) setQuantity(initialParsedData.quantity);
      if (initialParsedData.portions) setPortions(initialParsedData.portions);
      if (initialParsedData.storageCondition) setStorageCondition(initialParsedData.storageCondition);
      if (initialParsedData.storageTemperature) setStorageTemperature(initialParsedData.storageTemperature);
      if (initialParsedData.packagingStatus) setPackagingStatus(initialParsedData.packagingStatus);
      if (initialParsedData.preparedTime) setPreparedTime(initialParsedData.preparedTime);
      if (initialParsedData.ingredients) setIngredients(initialParsedData.ingredients);
      if (initialParsedData.additionalNotes) setAdditionalNotes(initialParsedData.additionalNotes);

      // Select relevant sample image
      const fLower = initialParsedData.foodName.toLowerCase();
      if (fLower.includes('biryani')) {
        setFoodImage('https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80');
      } else if (fLower.includes('chapati') || fLower.includes('curry')) {
        setFoodImage('https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80');
      } else if (fLower.includes('bread') || initialParsedData.foodCategory === 'Bakery') {
        setFoodImage('https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80');
      }
    }
  }, [initialParsedData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const pickupLoc = useRegisteredLocation ? donor.location : customLocation;
      const newId = await appState.createDonation({
        donorId: donor.id,
        donorName: donor.organizationName,
        donorOrganizationType: donor.organizationType,
        donorPhone: donor.phone,
        foodName,
        foodCategory,
        foodType,
        quantity,
        portions,
        preparedDate,
        preparedTime,
        storageCondition,
        storageTemperature,
        packagingStatus,
        ingredients,
        allergens,
        foodImage,
        pickupLocation: pickupLoc,
        additionalNotes,
      });

      setIsSubmitting(false);
      if (preselectedCharity) {
        appState.sendDonationRequest(newId, preselectedCharity.id);
      }
      onSuccess(newId);
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  const sampleImages = [
    {
      label: 'Vegetable Rice',
      url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Biryani Feast',
      url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Chapati & Curry',
      url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Bakery Loaves',
      url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">
                Create Food Donation
              </h3>
              <p className="text-xs text-slate-500">
                Enter surplus preparation details for immediate AI urgency & charity matching
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenVoiceModal && (
              <button
                type="button"
                onClick={onOpenVoiceModal}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Speak food details with Web Speech API"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Voice Input</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {preselectedCharity && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <span className="text-base">❤️</span>
                <div>
                  <span className="font-bold block">
                    Directly Targeting: {preselectedCharity.organizationName}
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    FoodRescue ID: <strong>{preselectedCharity.foodRescueId || 'FRC-CH-7K92P'}</strong> • {preselectedCharity.location.place}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                Pre-Assigned
              </span>
            </div>
          )}

          {/* Row 1: Food Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Food Name *
                </label>
                {onOpenVoiceModal && (
                  <button
                    type="button"
                    onClick={onOpenVoiceModal}
                    className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Mic className="w-3 h-3 inline" />
                    <span>Speak</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Vegetable Rice"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Food Category *
              </label>
              <select
                value={foodCategory}
                onChange={(e) => setFoodCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Cooked Meal">Cooked Meal</option>
                <option value="Bakery">Bakery</option>
                <option value="Packed Food">Packed Food</option>
                <option value="Raw Produce">Raw Produce</option>
                <option value="Dairy & Desserts">Dairy & Desserts</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Food Type *
              </label>
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Veg">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Egg">Egg</option>
              </select>
            </div>
          </div>

          {/* Row 2: Portions & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Number of Portions / Servings *
              </label>
              <input
                type="number"
                min={1}
                value={portions}
                onChange={(e) => setPortions(Number(e.target.value))}
                placeholder="e.g. 30"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Weight / Quantity
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 12 kg or 3 trays"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Prepared Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preparation Date
              </label>
              <input
                type="date"
                value={preparedDate}
                onChange={(e) => setPreparedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preparation Time * (Crucial for AI Food Age)
              </label>
              <input
                type="text"
                value={preparedTime}
                onChange={(e) => setPreparedTime(e.target.value)}
                placeholder="e.g. 5:20 PM"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Row 4: Storage Condition & Packaging */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Storage Condition *
              </label>
              <select
                value={storageCondition}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setStorageCondition(val);
                  if (val === 'Refrigerated') setStorageTemperature('4°C');
                  else if (val === 'Hot Holding') setStorageTemperature('65°C');
                  else if (val === 'Frozen') setStorageTemperature('-18°C');
                  else setStorageTemperature('24°C');
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Refrigerated">Refrigerated</option>
                <option value="Hot Holding">Hot Holding</option>
                <option value="Room Temperature">Room Temperature</option>
                <option value="Frozen">Frozen</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Storage Temperature
              </label>
              <input
                type="text"
                value={storageTemperature}
                onChange={(e) => setStorageTemperature(e.target.value)}
                placeholder="e.g. 4°C"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Packaging Status *
              </label>
              <select
                value={packagingStatus}
                onChange={(e) => setPackagingStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Packed">Packed in Sealed Containers</option>
                <option value="Bulk Containers">Bulk Food Warmers/Pots</option>
                <option value="Individually Sealed">Individually Meal Boxed</option>
                <option value="Open Tray">Open Trays</option>
              </select>
            </div>
          </div>

          {/* Row 5: Ingredients & Allergens */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Key Ingredients (Helps AI calculate nutrition & allergies)
            </label>
            <textarea
              rows={2}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g. Basmati rice, carrots, green beans, peas, ghee..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Image Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Food Photo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {sampleImages.map((img) => (
                <div
                  key={img.label}
                  onClick={() => setFoodImage(img.url)}
                  className={`p-1.5 rounded-xl border cursor-pointer transition-all ${
                    foodImage === img.url
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-16 object-cover rounded-lg mb-1"
                  />
                  <span className="text-[11px] font-semibold text-slate-700 text-center block truncate">
                    {img.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pickup Location Selector (Section 11) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Pickup Location
            </label>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="pickupLoc"
                  checked={useRegisteredLocation}
                  onChange={() => setUseRegisteredLocation(true)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>Use Registered Location ({donor.organizationName}, Kadayanallur)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="pickupLoc"
                  checked={!useRegisteredLocation}
                  onChange={() => setUseRegisteredLocation(false)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>Use Different Location</span>
              </label>
            </div>

            {!useRegisteredLocation && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <LocationPicker
                  initialLocation={customLocation}
                  onChange={setCustomLocation}
                />
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Handover Instructions & Additional Notes
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Please pick up at the rear kitchen dock on Main Bazaar Road"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI will evaluate urgency & find matching charities instantly</span>
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Analyzing Food...' : 'Create & Run AI Analysis'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

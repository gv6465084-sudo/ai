import React, { useState } from 'react';
import { Store, X, ArrowRight, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { LocationHierarchy } from '../types';
import { LocationPicker } from './LocationPicker';
import { appState } from '../services/store';

interface DonorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess: () => void;
}

export const DonorAuthModal: React.FC<DonorAuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [step, setStep] = useState<number>(1);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration fields
  const [orgName, setOrgName] = useState('ABC Restaurant');
  const [orgType, setOrgType] = useState<
    'Restaurant' | 'Hotel' | 'Marriage Hall' | 'Catering Company' | 'Bakery' | 'Canteen' | 'Event Organizer' | 'Food Business'
  >('Restaurant');
  const [managerName, setManagerName] = useState('Karthik Subramanian');
  const [phone, setPhone] = useState('+91 98410 44211');
  const [operatingHours, setOperatingHours] = useState('10:00 AM - 11:00 PM');
  const [pickupRadius, setPickupRadius] = useState(10);
  const [description, setDescription] = useState(
    'Family dining restaurant committed to zero food waste and neighborhood community kitchens.'
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Cooked Meal',
    'Bakery',
    'Packed Food',
  ]);

  const [location, setLocation] = useState<LocationHierarchy>({
    state: 'Tamil Nadu',
    district: 'Tenkasi',
    place: 'Kadayanallur',
    locality: 'Main Bazaar Road',
    address: '42 Main Bazaar Road, Kadayanallur',
    lat: 9.0754,
    lng: 77.3456,
  });

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    appState.setRole('DONOR', 'user-donor-1');
    onSuccess();
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    appState.registerDonor({
      organizationName: orgName,
      organizationType: orgType,
      contactPerson: managerName,
      phone,
      email,
      location,
      foodCategories: selectedCategories,
      operatingHours,
      description,
      pickupRadiusKm: pickupRadius,
    });
    onSuccess();
    onClose();
  };

  const categoriesList = [
    'Cooked Meal',
    'Bakery',
    'Packed Food',
    'Raw Produce',
    'Dairy & Desserts',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">
                {mode === 'login' ? 'Donor Sign In' : 'Donor Registration'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'login'
                  ? 'Access your food donation dashboard & manage surplus'
                  : 'Register your restaurant, hotel, or business to donate surplus food'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper for Registration */}
        {mode === 'register' && (
          <div className="px-6 py-3 bg-slate-100/60 border-b border-slate-200 flex items-center justify-center gap-6 text-xs font-semibold">
            <div
              className={`flex items-center gap-2 ${
                step >= 1 ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                  step >= 1 ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                1
              </span>
              <span>Location</span>
            </div>
            <span className="text-slate-300">──</span>
            <div
              className={`flex items-center gap-2 ${
                step >= 2 ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                  step >= 2 ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                2
              </span>
              <span>Organization</span>
            </div>
            <span className="text-slate-300">──</span>
            <div
              className={`flex items-center gap-2 ${
                step >= 3 ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                  step >= 3 ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                3
              </span>
              <span>Details</span>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6">
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Donor Login</span>
              </button>

              <div className="text-center text-xs text-slate-500 pt-2">
                Don't have a registered donor account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setStep(1);
                  }}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Register Donor Organization
                </button>
              </div>
            </form>
          ) : (
            <div>
              {/* Step 1: Location */}
              {step === 1 && (
                <div className="space-y-4">
                  <LocationPicker
                    initialLocation={location}
                    onChange={setLocation}
                    radiusKm={pickupRadius}
                    onRadiusChange={setPickupRadius}
                    radiusLabel="Pickup Radius"
                  />
                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Organization */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="e.g. Royal Palace Caterers"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Organization Type
                      </label>
                      <select
                        value={orgType}
                        onChange={(e) => setOrgType(e.target.value as any)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Restaurant">Restaurant</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Marriage Hall">Marriage Hall</option>
                        <option value="Catering Company">Catering Company</option>
                        <option value="Bakery">Bakery</option>
                        <option value="Canteen">Canteen</option>
                        <option value="Event Organizer">Event Organizer</option>
                        <option value="Food Business">Food Business</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Owner / Manager Name
                      </label>
                      <input
                        type="text"
                        value={managerName}
                        onChange={(e) => setManagerName(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Create Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Details */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Food Categories Typically Donated
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categoriesList.map((cat) => {
                        const isSelected = selectedCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setSelectedCategories((prev) =>
                                isSelected
                                  ? prev.filter((c) => c !== cat)
                                  : [...prev, cat]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Operating Hours
                      </label>
                      <input
                        type="text"
                        value={operatingHours}
                        onChange={(e) => setOperatingHours(e.target.value)}
                        placeholder="e.g. 10:00 AM - 11:00 PM"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pickup Radius Coverage
                      </label>
                      <input
                        type="text"
                        value={`${pickupRadius} km`}
                        readOnly
                        className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 text-slate-600 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Organization Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief note on your surplus food donation commitment..."
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Direct donor coordination enabled. Your location coordinates are strictly safeguarded and shared only with charities whose requests you approve.
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRegisterSubmit}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Registration</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100 mt-4">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Sign In to Donor Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

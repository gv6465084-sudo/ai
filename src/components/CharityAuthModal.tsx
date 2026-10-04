import React, { useState } from 'react';
import { Heart, X, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { LocationHierarchy } from '../types';
import { LocationPicker } from './LocationPicker';
import { appState } from '../services/store';

interface CharityAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess: () => void;
}

export const CharityAuthModal: React.FC<CharityAuthModalProps> = ({
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
  const [orgName, setOrgName] = useState('Hope Community Center');
  const [orgType, setOrgType] = useState<
    'NGO' | 'Shelter' | 'Community Kitchen' | 'Food Bank' | 'Charity Organization'
  >('Community Kitchen');
  const [regDetails, setRegDetails] = useState('TN/NGO/2019/004821');
  const [contactPerson, setContactPerson] = useState('Sister Mary & Mr. Rahman');
  const [phone, setPhone] = useState('+91 94431 88200');
  const [operatingHours, setOperatingHours] = useState('7:00 AM - 10:30 PM');
  const [serviceRadius, setServiceRadius] = useState(15);
  const [dailyCapacity, setDailyCapacity] = useState(250);
  const [description, setDescription] = useState(
    'Providing freshly served hot meals and emergency food parcels to migrant workers and underprivileged families.'
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Vegetarian',
    'Cooked Meals',
    'Packed Food',
    'Bakery',
  ]);

  const [location, setLocation] = useState<LocationHierarchy>({
    state: 'Tamil Nadu',
    district: 'Tenkasi',
    place: 'Kadayanallur',
    locality: 'Hospital Road',
    address: '15 Hospital Road, Near Government Hospital, Kadayanallur',
    lat: 9.0832,
    lng: 77.3524,
  });

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    appState.setRole('CHARITY', 'user-charity-1');
    onSuccess();
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    appState.registerCharity({
      organizationName: orgName,
      organizationType: orgType,
      registrationDetails: regDetails,
      contactPerson,
      phone,
      email,
      location,
      serviceRadiusKm: serviceRadius,
      foodCategoriesAccepted: selectedCategories,
      dailyCapacity,
      currentCapacityStatus: 'Available',
      operatingHours,
      isOpenNow: true,
      serviceAreas: [location.place, location.district],
      description,
    });
    onSuccess();
    onClose();
  };

  const categoriesList = [
    'Vegetarian',
    'Non-Veg',
    'Cooked Meals',
    'Packed Food',
    'Bakery',
    'Raw Produce',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs">
              <Heart className="w-5 h-5 fill-blue-600 text-blue-600" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">
                {mode === 'login' ? 'Charity Partner Sign In' : 'Charity Registration'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'login'
                  ? 'Access surplus food requests & direct donor coordination'
                  : 'Register your NGO, shelter, or community kitchen to receive surplus food'}
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
          <div className="px-6 py-3 bg-blue-50/50 border-b border-blue-100 flex items-center justify-center gap-6 text-xs font-semibold">
            <div
              className={`flex items-center gap-2 ${
                step >= 1 ? 'text-blue-700' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                  step >= 1 ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                1
              </span>
              <span>Location</span>
            </div>
            <span className="text-slate-300">──</span>
            <div
              className={`flex items-center gap-2 ${
                step >= 2 ? 'text-blue-700' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                  step >= 2 ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                2
              </span>
              <span>Organization</span>
            </div>
            <span className="text-slate-300">──</span>
            <div
              className={`flex items-center gap-2 ${
                step >= 3 ? 'text-blue-700' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                  step >= 3 ? 'bg-blue-600' : 'bg-slate-300'
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
                  Registered Charity Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Charity Login</span>
              </button>

              <div className="text-center text-xs text-slate-500 pt-2">
                New NGO or charity organization?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setStep(1);
                  }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Register as Charity Partner
                </button>
              </div>
            </form>
          ) : (
            <div>
              {/* Step 1: Location & Service Radius */}
              {step === 1 && (
                <div className="space-y-4">
                  <LocationPicker
                    initialLocation={location}
                    onChange={setLocation}
                    radiusKm={serviceRadius}
                    onRadiusChange={setServiceRadius}
                    radiusLabel="Service Radius"
                  />
                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Organization Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Charity / NGO Name
                      </label>
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="e.g. Hope Community Kitchen"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Organization Type
                      </label>
                      <select
                        value={orgType}
                        onChange={(e) => setOrgType(e.target.value as any)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Community Kitchen">Community Kitchen</option>
                        <option value="NGO">NGO</option>
                        <option value="Shelter">Shelter</option>
                        <option value="Food Bank">Food Bank</option>
                        <option value="Charity Organization">Charity Organization</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Legal Reg. Number / Trust ID
                      </label>
                      <input
                        type="text"
                        value={regDetails}
                        onChange={(e) => setRegDetails(e.target.value)}
                        placeholder="e.g. TN/NGO/2021/049182"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Primary Contact Person
                      </label>
                      <input
                        type="text"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Official Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Official Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Details & Verification Pipeline */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Food Categories Accepted
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
                                ? 'bg-blue-50 border-blue-300 text-blue-800'
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
                        Daily Intake Capacity (Portions / Meals)
                      </label>
                      <input
                        type="number"
                        value={dailyCapacity}
                        onChange={(e) => setDailyCapacity(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Operating Hours
                      </label>
                      <input
                        type="text"
                        value={operatingHours}
                        onChange={(e) => setOperatingHours(e.target.value)}
                        placeholder="e.g. 7:00 AM - 10:30 PM"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Organization Mission & Feeding Target
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe target beneficiary community..."
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Verification Pipeline Notice (Section 8) */}
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Charity Verification Workflow</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      To safeguard donated food distribution, new registrations undergo admin review. Once verified, your organization receives the <strong className="text-amber-900">✓ VERIFIED</strong> badge and appears at the top of donor AI matching recommendations.
                    </p>
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
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit for Verification</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100 mt-4">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Sign In to Charity Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

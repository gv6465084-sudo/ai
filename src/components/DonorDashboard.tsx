import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  Utensils,
  Map as MapIcon,
  MessageSquare,
  BarChart3,
  User,
  LogOut,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  MapPin,
  Mic,
  History,
  Menu,
  X,
  RotateCcw,
  Trash2,
  Edit3,
  Save,
  Building,
} from 'lucide-react';
import { FoodDonation, CharityProfile, DonorProfile } from '../types';
import { useAppState, appState } from '../services/store';
import { rankNearbyCharities } from '../services/aiService';
import { AIFoodAnalysisCard } from './AIFoodAnalysisCard';
import { RecommendedCharitiesList } from './RecommendedCharitiesList';
import { NearbyCharitiesMap } from './NearbyCharitiesMap';
import { DirectChatModal } from './DirectChatModal';
import { PickupCoordinationView } from './PickupCoordinationView';
import { CreateDonationModal } from './CreateDonationModal';
import { ImpactAnalyticsView } from './ImpactAnalyticsView';
import { VoiceToTextModal } from './VoiceToTextModal';
import { DonationHistory } from './DonationHistory';
import { ConnectByCharityIdModal } from './ConnectByCharityIdModal';
import { toastService } from '../services/toastService';
import { ParsedFoodDonation } from '../services/voiceParser';

interface DonorDashboardProps {
  onLogout: () => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ onLogout }) => {
  const state = useAppState();
  const donor = state.donor;
  const donations = state.donations;
  const charities = state.charities;

  // Active view tab inside dashboard
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'nearby' | 'donations' | 'map' | 'messages' | 'analytics' | 'profile'
  >('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<{
    organizationName: string;
    organizationType: DonorProfile['organizationType'];
    contactPerson: string;
    phone: string;
    address: string;
  }>({
    organizationName: donor.organizationName,
    organizationType: donor.organizationType,
    contactPerson: donor.contactPerson,
    phone: donor.phone,
    address: donor.location.address,
  });

  // Keep profileForm in sync with donor
  useEffect(() => {
    setProfileForm({
      organizationName: donor.organizationName,
      organizationType: donor.organizationType,
      contactPerson: donor.contactPerson,
      phone: donor.phone,
      address: donor.location.address,
    });
  }, [donor]);

  // Currently inspected/selected donation
  const [selectedDonationId, setSelectedDonationId] = useState<string>(
    donations[0]?.id || ''
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [preselectedCharityForDonation, setPreselectedCharityForDonation] = useState<CharityProfile | null>(null);
  const [voiceParsedData, setVoiceParsedData] = useState<ParsedFoodDonation | null>(null);
  const [showDirectChat, setShowDirectChat] = useState(false);
  const [showPickupCoord, setShowPickupCoord] = useState(false);

  // Keep selectedDonationId in sync when donations list changes
  useEffect(() => {
    if (donations.length > 0 && !donations.some((d) => d.id === selectedDonationId)) {
      setSelectedDonationId(donations[0].id);
    }
  }, [donations, selectedDonationId]);

  const selectedDonation =
    donations.find((d) => d.id === selectedDonationId) || donations[0] || null;

  // Calculate AI Recommended Charities for selected donation
  const recommendedMatches = selectedDonation
    ? rankNearbyCharities(selectedDonation, charities)
    : [];

  const handleSelectCharityFromMap = (charity: CharityProfile) => {
    // Charity chosen on map
  };

  const handleSendDonationRequest = (charity: CharityProfile) => {
    if (!selectedDonation) return;
    appState.sendDonationRequest(selectedDonation.id, charity.id);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'create',
      label: 'Create Donation',
      icon: PlusCircle,
      action: () => {
        setPreselectedCharityForDonation(null);
        setVoiceParsedData(null);
        setIsCreateModalOpen(true);
      },
    },
    {
      id: 'voice',
      label: 'Voice-to-Text Intake',
      icon: Mic,
      action: () => setIsVoiceModalOpen(true),
      highlight: true,
    },
    {
      id: 'connect-id',
      label: 'Connect by Charity ID',
      icon: Users,
      action: () => setIsConnectModalOpen(true),
      highlight: true,
    },
    { id: 'nearby', label: 'Nearby Charities', icon: Users },
    { id: 'donations', label: 'Donation History', icon: History },
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar (hidden on mobile, fixed on desktop) */}
      <aside className="hidden md:flex md:w-64 md:h-screen md:sticky md:top-0 bg-slate-900 text-slate-300 flex-col shrink-0 border-r border-slate-800 z-20">
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-black text-white text-base tracking-tight block">
                FoodRescue
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Donor Portal
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation list */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setActiveTab(item.id as any);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : item.highlight
                    ? 'text-emerald-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.highlight ? 'text-emerald-400 animate-pulse' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Footer profile & logout */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0">
                {donor.organizationName.substring(0, 2)}
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-white block truncate">
                  {donor.organizationName}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {donor.location.place}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top App Bar (< md) */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white px-4 h-14 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <span className="font-heading font-black text-white text-sm tracking-tight block leading-tight">
              FoodRescue
            </span>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block leading-tight">
              Donor Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Voice Intake trigger */}
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="p-2 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Voice Intake"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Mobile Hamburger toggle button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl z-10 border-r border-slate-800">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-heading font-black text-white text-base tracking-tight block">
                    FoodRescue
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Donor Portal
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Navigation List */}
            <nav className="p-3 space-y-1 flex-1 overflow-y-auto text-xs font-semibold">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else {
                        setActiveTab(item.id as any);
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : item.highlight
                        ? 'text-emerald-400 hover:text-white hover:bg-slate-800'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${item.highlight ? 'text-emerald-400 animate-pulse' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Drawer Footer profile & logout */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/90">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0">
                    {donor.organizationName.substring(0, 2)}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-white block truncate">
                      {donor.organizationName}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {donor.location.place}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
        {/* Top Header matching reference image: "Good Afternoon 👋 ABC Restaurant" */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Good Afternoon 👋
            </span>
            <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
              {donor.organizationName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {donor.location.address} • {donor.location.place}, {donor.location.district}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="px-3 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm rounded-xl transition-all border border-emerald-300 shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Connect directly to a charity using FoodRescue ID or Legal Registration ID"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>🆔 Connect by ID</span>
            </button>

            <button
              type="button"
              onClick={() => {
                toastService.notifyPickupAccepted({
                  foodName: '30 Meals Veg Biryani & Curry',
                  charityName: 'Praba Foundation',
                  portions: 30,
                  onAction: () => setActiveTab('donations'),
                });
              }}
              className="px-3 py-2.5 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm rounded-xl transition-all border border-emerald-200 shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Test toast alert for charity accepting a pickup"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>🎉 Test Pickup Alert</span>
            </button>

            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="px-3.5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm rounded-xl transition-all border border-emerald-300 shadow-xs flex items-center gap-2 cursor-pointer"
              title="Describe food surplus using Web Speech API"
            >
              <Mic className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Voice-to-Text</span>
            </button>

            <button
              onClick={() => {
                setVoiceParsedData(null);
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create Donation</span>
            </button>
          </div>
        </div>

        {/* Tab: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Clean Slate / Data Status Banner */}
            {donations.length === 0 ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-heading font-black text-sm text-slate-900">
                        Clean Slate Active — Zero Demo Records
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Ready for New Data
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      All previous demo items cleared. Create your first real surplus food donation in{' '}
                      <strong>Kondamanaickenpatti, Namakkal</strong>.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setVoiceParsedData(null);
                      setIsCreateModalOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Log First Donation</span>
                  </button>
                  <button
                    onClick={() => appState.loadSampleDonations()}
                    className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 font-semibold text-xs rounded-xl cursor-pointer transition-all"
                    title="Load a realistic sample meal to test the system"
                  >
                    <span>+ Load Sample</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>
                    Tracking <strong>{donations.length}</strong> active food donation{donations.length > 1 ? 's' : ''} in Kondamanaickenpatti, Namakkal
                  </span>
                </div>
              </div>
            )}

            {/* Stat Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Active Donations */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <Utensils className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-heading font-black text-2xl text-slate-900 block leading-tight">
                    {donations.filter((d) => d.status !== 'COMPLETED' && d.status !== 'REJECTED').length}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Active Donations
                  </span>
                </div>
              </div>

              {/* Card 2: Pending Pickup */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-heading font-black text-2xl text-slate-900 block leading-tight">
                    {donations.filter((d) => d.status === 'ACCEPTED' || d.status === 'PICKUP_COORDINATION' || d.status === 'READY_FOR_HANDOVER').length}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Pending Pickup
                  </span>
                </div>
              </div>

              {/* Card 3: Meals Donated */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-heading font-black text-2xl text-slate-900 block leading-tight">
                    {state.impact.mealsRescued.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Meals Donated
                  </span>
                </div>
              </div>

              {/* Card 4: Food Rescued */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-heading font-black text-2xl text-slate-900 block leading-tight">
                    {state.impact.foodSavedKg} kg
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Food Rescued
                  </span>
                </div>
              </div>
            </div>

            {/* Split Section: My Donations on Left, AI Analysis & Recommended on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: My Donations Table matching screenshot */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    My Donations
                  </h3>
                  <button
                    onClick={() => setActiveTab('donations')}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>View Donation History</span>
                    <span>→</span>
                  </button>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px]">
                  {donations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 space-y-3 my-auto">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                        <PlusCircle className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">Clean Slate — Ready for New Donations</h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        All previous demo data cleared. Click below to create your fresh surplus donation in Kondamanaickenpatti.
                      </p>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                      >
                        + Create First Donation
                      </button>
                    </div>
                  ) : (
                    donations.map((item) => {
                      const isSelected = item.id === selectedDonationId;
                    const urgencyClass = {
                      LOW: 'bg-emerald-100 text-emerald-800',
                      MEDIUM: 'bg-amber-100 text-amber-800',
                      HIGH: 'bg-orange-500 text-white',
                      CRITICAL: 'bg-rose-600 text-white',
                      'REVIEW REQUIRED': 'bg-slate-200 text-slate-800',
                    }[item.urgencyLevel];

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedDonationId(item.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.foodImage}
                            alt={item.foodName}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <h4 className="font-heading font-bold text-sm text-slate-900 truncate">
                                {item.foodName}
                              </h4>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wider ${urgencyClass}`}
                              >
                                {item.urgencyLevel}
                              </span>
                            </div>

                            <div className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5">
                              <span>{item.portions} portions</span>
                              <span>•</span>
                              <span>1.8 km</span>
                              <span>•</span>
                              <span>Today, {item.preparedTime}</span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1 font-semibold text-emerald-700">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span>
                                  {item.status === 'ACCEPTED'
                                    ? `Charity Accepted • ${item.selectedCharityName}`
                                    : item.status === 'PICKUP_COORDINATION'
                                    ? `Pickup Coordination • ${item.selectedCharityName}`
                                    : item.status === 'COMPLETED'
                                    ? `Completed • ${item.selectedCharityName}`
                                    : item.status.replace('_', ' ')}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Delete donation "${item.foodName}"?`)) {
                                      appState.deleteDonation(item.id);
                                    }
                                  }}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete donation"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                </div>
              </div>

              {/* Right Column: AI Food Analysis & Recommended Charities */}
              <div className="lg:col-span-6 space-y-6">
                {selectedDonation ? (
                  <>
                    <AIFoodAnalysisCard donation={selectedDonation} />

                    {/* 3-Way Multi-Channel Connect Selector (Map, List, ID) */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Find Charity:</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveTab('map')}
                          className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>🗺️ Map</span>
                        </button>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <span>📋 AI List</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsConnectModalOpen(true)}
                          className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>🆔 Charity ID</span>
                        </button>
                      </div>
                    </div>

                    <RecommendedCharitiesList
                      matches={recommendedMatches}
                      activeDonation={selectedDonation}
                      onSelectCharity={handleSelectCharityFromMap}
                      onSendRequest={handleSendDonationRequest}
                      onViewOnMap={() => setActiveTab('map')}
                    />
                  </>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                      <h3 className="font-heading font-black text-xl text-slate-900">
                        Zero Food Waste Engine Ready
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        No demo items loaded. Create your fresh food donation to get instant AI shelf-life assessment, nutritional analysis, and direct routing to verified shelters in <strong>Kondamanaickenpatti, Namakkal</strong>.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setVoiceParsedData(null);
                          setIsCreateModalOpen(true);
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>+ Create Food Donation</span>
                      </button>

                      <button
                        onClick={() => setIsVoiceModalOpen(true)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Mic className="w-4 h-4 text-emerald-600 animate-pulse" />
                        <span>Voice-to-Text Surplus</span>
                      </button>
                    </div>

                    <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-800 block text-xs">5 Shelters</span>
                        <span className="text-[10px] text-slate-500">Active in Namakkal</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-800 block text-xs">&lt; 15 min</span>
                        <span className="text-[10px] text-slate-500">Avg Pickup Speed</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-800 block text-xs">100% Free</span>
                        <span className="text-[10px] text-slate-500">Zero Commission</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Chat & Location Route quick panel if accepted */}
            {selectedDonation &&
              (selectedDonation.status === 'ACCEPTED' ||
                selectedDonation.status === 'PICKUP_COORDINATION' ||
                selectedDonation.status === 'HANDED_OVER') && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                  <div className="lg:col-span-6">
                    <DirectChatModal
                      donation={selectedDonation}
                      currentUserRole="DONOR"
                    />
                  </div>
                  <div className="lg:col-span-6">
                    <PickupCoordinationView
                      donation={selectedDonation}
                      currentUserRole="DONOR"
                    />
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Tab: Nearby Charities (Matching Top-Right of reference image) */}
        {activeTab === 'nearby' && (
          <div className="h-[700px]">
            <NearbyCharitiesMap
              charities={charities}
              donorLocation={{
                lat: donor.location.lat,
                lng: donor.location.lng,
                address: donor.location.address,
                organizationName: donor.organizationName,
              }}
              activeDonation={selectedDonation}
              onSelectCharity={handleSelectCharityFromMap}
              onSendRequest={handleSendDonationRequest}
            />
          </div>
        )}

        {/* Tab: Map */}
        {activeTab === 'map' && (
          <div className="h-[700px]">
            <NearbyCharitiesMap
              charities={charities}
              donorLocation={{
                lat: donor.location.lat,
                lng: donor.location.lng,
                address: donor.location.address,
                organizationName: donor.organizationName,
              }}
              activeDonation={selectedDonation}
              onSelectCharity={handleSelectCharityFromMap}
              onSendRequest={handleSendDonationRequest}
            />
          </div>
        )}

        {/* Tab: Donation History */}
        {activeTab === 'donations' && (
          <DonationHistory
            donations={donations}
            charities={charities}
            onSelectDonation={(id) => {
              setSelectedDonationId(id);
              setActiveTab('dashboard');
            }}
            onViewOnMap={(charityId) => {
              setActiveTab('map');
            }}
            onOpenChat={(donationId) => {
              setSelectedDonationId(donationId);
              setActiveTab('messages');
            }}
            onNewDonation={() => setIsCreateModalOpen(true)}
          />
        )}

        {/* Tab: Messages */}
        {activeTab === 'messages' && (
          <div className="max-w-3xl mx-auto">
            {selectedDonation ? (
              <DirectChatModal
                donation={selectedDonation}
                currentUserRole="DONOR"
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-heading font-bold text-slate-800 text-base">
                  No Active Food Donation Selected
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When a verified charity accepts a donation request, real-time coordination chat opens here automatically.
                </p>
                <button
                  onClick={() => {
                    setVoiceParsedData(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Create Food Donation</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab: Analytics */}
        {activeTab === 'analytics' && <ImpactAnalyticsView />}

        {/* Tab: Profile */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-bold text-xl text-slate-900">
                  Donor Organization Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Business and contact details used for food donation receipts and charity coordination
                </p>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold mb-0.5">
                  Organization / Business Name
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {donor.organizationName}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold mb-0.5">Category</span>
                <span className="font-bold text-slate-800 text-sm">
                  {donor.organizationType}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold mb-0.5">
                  Contact Person
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {donor.contactPerson}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold mb-0.5">Phone</span>
                <span className="font-bold text-slate-800 text-sm">
                  {donor.phone}
                </span>
              </div>
              <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold mb-0.5">
                  Registered Location
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {donor.location.address}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 flex items-center justify-around px-2 shadow-xl pb-safe">
        {/* 1. Dashboard */}
        <button
          onClick={() => {
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* 2. Nearby Charities */}
        <button
          onClick={() => {
            setActiveTab('nearby');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'nearby' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Nearby</span>
        </button>

        {/* 3. Central Prominent Quick Action Button: + Create */}
        <button
          onClick={() => {
            setVoiceParsedData(null);
            setIsCreateModalOpen(true);
          }}
          className="relative -top-3 w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 ring-4 ring-slate-100 transition-transform active:scale-95 cursor-pointer"
          aria-label="Create Food Donation"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        {/* 4. Donation History */}
        <button
          onClick={() => {
            setActiveTab('donations');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'donations' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">History</span>
        </button>

        {/* 5. Messages */}
        <button
          onClick={() => {
            setActiveTab('messages');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl relative transition-colors cursor-pointer ${
            activeTab === 'messages' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Messages</span>
        </button>
      </nav>

      {/* Voice-to-Text Speech Modal */}
      <VoiceToTextModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onParsedResult={(parsed) => {
          setVoiceParsedData(parsed);
          setIsCreateModalOpen(true);
        }}
      />

      {/* Connect by Charity ID Modal */}
      <ConnectByCharityIdModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSelectForDonation={(charity) => {
          setPreselectedCharityForDonation(charity);
          setVoiceParsedData(null);
          setIsCreateModalOpen(true);
        }}
        onOpenChatWithCharity={(charityId) => {
          setActiveTab('messages');
        }}
      />

      {/* Create Donation Modal */}
      <CreateDonationModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setPreselectedCharityForDonation(null);
          setVoiceParsedData(null);
        }}
        preselectedCharity={preselectedCharityForDonation}
        initialParsedData={voiceParsedData}
        onOpenVoiceModal={() => {
          setIsCreateModalOpen(false);
          setIsVoiceModalOpen(true);
        }}
        onSuccess={(id) => {
          setSelectedDonationId(id);
          setActiveTab('dashboard');
        }}
      />

      {/* Edit Organization Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading font-black text-base text-slate-900">
                  Edit Organization Profile
                </h3>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                appState.updateDonorProfile({
                  organizationName: profileForm.organizationName,
                  organizationType: profileForm.organizationType,
                  contactPerson: profileForm.contactPerson,
                  phone: profileForm.phone,
                  location: {
                    ...donor.location,
                    address: profileForm.address,
                  },
                });
                setIsEditProfileOpen(false);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Organization / Kitchen Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.organizationName}
                  onChange={(e) => setProfileForm({ ...profileForm, organizationName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="e.g. My Restaurant / Catering Kitchen"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Organization Type
                  </label>
                  <select
                    value={profileForm.organizationType}
                    onChange={(e) => setProfileForm({ ...profileForm, organizationType: e.target.value as DonorProfile['organizationType'] })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Marriage Hall">Marriage Hall / Wedding Venue</option>
                    <option value="Catering Company">Catering Company</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Canteen">Canteen / Cafeteria</option>
                    <option value="Event Organizer">Event Organizer</option>
                    <option value="Food Business">Food Business</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="+91 94431 00000"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.contactPerson}
                  onChange={(e) => setProfileForm({ ...profileForm, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="Manager / Owner Name"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Address in Kondamanaickenpatti, Namakkal
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="Street, Landmark, Kondamanaickenpatti, Namakkal - 637001"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

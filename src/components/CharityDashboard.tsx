import React, { useState } from 'react';
import {
  Heart,
  LayoutDashboard,
  Bell,
  MessageSquare,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  BarChart3,
  User,
  LogOut,
  AlertTriangle,
  Utensils,
  Navigation,
  Menu,
  X,
  RotateCcw,
  Copy,
  Check,
  Users,
  Share2,
} from 'lucide-react';
import { useAppState, appState } from '../services/store';
import { FoodDonation } from '../types';
import { DirectChatModal } from './DirectChatModal';
import { PickupCoordinationView } from './PickupCoordinationView';
import { ImpactAnalyticsView } from './ImpactAnalyticsView';

interface CharityDashboardProps {
  onLogout: () => void;
}

export const CharityDashboard: React.FC<CharityDashboardProps> = ({
  onLogout,
}) => {
  const state = useAppState();
  const charity =
    state.charities.find((c) => c.userId === state.currentUserId) ||
    state.charities[0];
  const donations = state.donations;

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'requests' | 'connections' | 'pickups' | 'messages' | 'notifications' | 'impact' | 'profile'
  >('dashboard');

  const [selectedDonationId, setSelectedDonationId] = useState<string>(
    donations[0]?.id || ''
  );
  const [rejectReasonModal, setRejectReasonModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Capacity limit reached for tonight');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedDonation =
    donations.find((d) => d.id === selectedDonationId) || donations[0] || null;

  // Pending connection requests for this charity
  const pendingConnections = state.connectionRequests.filter(
    (r) => r.status === 'PENDING' && (r.charityId === charity.id || r.charityFoodRescueId === charity.foodRescueId)
  );

  const handleCopyId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Donations requested for this charity
  const incomingRequests = donations.filter(
    (d) =>
      d.selectedCharityId === charity.id ||
      d.status === 'AVAILABLE' ||
      d.status === 'REQUEST_SENT'
  );

  const activePickups = donations.filter(
    (d) =>
      d.selectedCharityId === charity.id &&
      (d.status === 'ACCEPTED' ||
        d.status === 'PICKUP_COORDINATION' ||
        d.status === 'HANDED_OVER')
  );

  const handleAccept = (donationId: string) => {
    appState.charityAcceptDonation(donationId);
    setSelectedDonationId(donationId);
    setActiveTab('pickups');
  };

  const handleReject = (donationId: string) => {
    appState.charityRejectDonation(donationId, rejectReason);
    setRejectReasonModal(null);
  };

  const unreadMessagesCount = state.messages.filter(
    (m) => m.senderRole === 'DONOR'
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'requests',
      label: 'Donation Requests',
      icon: Bell,
      badge: incomingRequests.length,
      badgeColor: 'bg-blue-500',
    },
    {
      id: 'connections',
      label: 'Connection Requests',
      icon: Users,
      badge: pendingConnections.length,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'pickups',
      label: 'Active Pickups',
      icon: Truck,
      badge: activePickups.length,
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'messages',
      label: 'Direct Chat',
      icon: MessageSquare,
      badge: unreadMessagesCount,
      badgeColor: 'bg-rose-500',
    },
    { id: 'impact', label: 'Impact Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Charity Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar (hidden on mobile, fixed on desktop) */}
      <aside className="hidden md:flex md:w-64 md:h-screen md:sticky md:top-0 bg-slate-900 text-slate-300 flex-col shrink-0 border-r border-slate-800 z-20">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/30">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="font-heading font-black text-white text-base tracking-tight block">
                FoodRescue
              </span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                Charity Portal
              </span>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1 flex-1 overflow-y-auto text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => (item.action ? item.action() : setActiveTab(item.id as any))}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-white text-[10px] font-bold ${item.badgeColor || 'bg-blue-500'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white font-bold flex items-center justify-center shrink-0">
              {charity.organizationName.substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">
                {charity.organizationName}
              </span>
              <span className="text-[10px] text-blue-400 block truncate flex items-center gap-1">
                ✓ Verified Partner
              </span>
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
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/30">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <div>
            <span className="font-heading font-black text-white text-sm tracking-tight block leading-tight">
              FoodRescue
            </span>
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider block leading-tight">
              Charity Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {incomingRequests.length > 0 && (
            <button
              onClick={() => setActiveTab('requests')}
              className="px-2 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{incomingRequests.length}</span>
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-blue-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl z-10 border-r border-slate-800">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/30">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <span className="font-heading font-black text-white text-base tracking-tight block">
                    FoodRescue
                  </span>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                    Charity Portal
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-white text-[10px] font-bold ${item.badgeColor || 'bg-blue-500'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-white font-bold flex items-center justify-center shrink-0">
                  {charity.organizationName.substring(0, 2)}
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-white block truncate">
                    {charity.organizationName}
                  </span>
                  <span className="text-[10px] text-blue-400 block truncate flex items-center gap-1">
                    ✓ Verified Partner
                  </span>
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

      {/* Main Charity Content */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500">
                Good Afternoon 👋
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                ✓ Verified Charity
              </span>
            </div>
            <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
              {charity.organizationName}
            </h1>
            <p className="text-xs text-slate-500">
              {charity.location.address} • Service Radius: {charity.serviceRadiusKm} km
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-semibold">Intake Status:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              Capacity Available ({charity.dailyCapacity} meals/day)
            </span>
          </div>
        </div>

        {/* Tab: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats row matching Section 23 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                  <Utensils className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-heading font-black text-2xl text-slate-900 block leading-tight">
                    {donations.length}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Nearby Donations
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-heading font-black text-2xl text-slate-900 block leading-tight">
                    {donations.filter((d) => d.urgencyLevel === 'HIGH' || d.urgencyLevel === 'CRITICAL').length}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Urgent Donations
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-heading font-black text-2xl text-slate-900 block leading-tight">
                    {incomingRequests.length}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Pending Requests
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6 fill-emerald-600" />
                </div>
                <div>
                  <span className="font-heading font-black text-2xl text-slate-900 block leading-tight">
                    {charity.stats.mealsReceived.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Meals Received
                  </span>
                </div>
              </div>
            </div>

            {/* Incoming Requests Section matching Section 24 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-heading font-bold text-base text-slate-900">
                  New Donation Requests
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Direct donor connection • Verified charities only
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donations.filter(
                  (d) =>
                    d.status === 'REQUEST_SENT' ||
                    d.status === 'ACCEPTED' ||
                    d.status === 'AVAILABLE'
                ).length === 0 ? (
                  <div className="col-span-1 md:col-span-2 p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-2">
                    <Utensils className="w-8 h-8 text-slate-300 mx-auto" />
                    <h4 className="font-heading font-bold text-sm text-slate-800">
                      No Pending Donation Requests
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Your organization is active and verified in{' '}
                      <strong>Kondamanaickenpatti, Namakkal</strong>. When donors register surplus food, new pickup requests will appear here instantly.
                    </p>
                  </div>
                ) : (
                  donations
                    .filter(
                      (d) =>
                        d.status === 'REQUEST_SENT' ||
                        d.status === 'ACCEPTED' ||
                        d.status === 'AVAILABLE'
                    )
                    .map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.foodImage}
                          alt={item.foodName}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-blue-700 uppercase tracking-wide">
                              {item.donorName}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                                item.urgencyLevel === 'HIGH'
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.urgencyLevel} URGENCY
                            </span>
                          </div>

                          <h4 className="font-heading font-bold text-base text-slate-900 mt-0.5">
                            {item.portions} {item.foodType} Meals ({item.foodName})
                          </h4>

                          <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                            <span>Prepared: <strong>{item.preparedTime}</strong></span>
                            <span>•</span>
                            <span>1.8 km distance</span>
                            <span>•</span>
                            <span>{item.pickupLocation.place}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                        {item.status === 'ACCEPTED' ? (
                          <div className="w-full flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Accepted • Coordination Active
                            </span>
                            <button
                              onClick={() => {
                                setSelectedDonationId(item.id);
                                setActiveTab('pickups');
                              }}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
                            >
                              View Route & Chat
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAccept(item.id)}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept Donation</span>
                            </button>

                            <button
                              onClick={() => setRejectReasonModal(item.id)}
                              className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl transition-all"
                            >
                              Reject
                            </button>

                            <button
                              onClick={() => {
                                setSelectedDonationId(item.id);
                                setActiveTab('messages');
                              }}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                            >
                              Chat
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active Pickups row */}
            {selectedDonation && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                <div className="lg:col-span-6">
                  <DirectChatModal
                    donation={selectedDonation}
                    currentUserRole="CHARITY"
                  />
                </div>
                <div className="lg:col-span-6">
                  <PickupCoordinationView
                    donation={selectedDonation}
                    currentUserRole="CHARITY"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Requests */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-lg text-slate-900">
              Incoming Surplus Food Donation Requests
            </h3>
            <div className="space-y-3">
              {incomingRequests.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-bold text-xs text-blue-600 uppercase">
                      {item.donorName}
                    </span>
                    <h4 className="font-heading font-bold text-base text-slate-900">
                      {item.portions} portions of {item.foodName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.pickupLocation.address} • Prepared {item.preparedTime}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAccept(item.id)}
                    className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
                  >
                    Accept & Coordinate Pickup
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Pickups */}
        {activeTab === 'pickups' && selectedDonation && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <PickupCoordinationView
                donation={selectedDonation}
                currentUserRole="CHARITY"
              />
            </div>
            <div className="lg:col-span-6">
              <DirectChatModal
                donation={selectedDonation}
                currentUserRole="CHARITY"
              />
            </div>
          </div>
        )}

        {/* Tab: Messages */}
        {activeTab === 'messages' && selectedDonation && (
          <div className="max-w-3xl mx-auto">
            <DirectChatModal
              donation={selectedDonation}
              currentUserRole="CHARITY"
            />
          </div>
        )}

        {/* Tab: Impact */}
        {activeTab === 'impact' && <ImpactAnalyticsView />}

        {/* Tab: Connections */}
        {activeTab === 'connections' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2">
                    <span>Partner Connection Requests</span>
                    {pendingConnections.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        {pendingConnections.length} New
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Donors who found your organization via your FoodRescue ID or Registration ID and requested to connect
                  </p>
                </div>
              </div>

              {pendingConnections.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="font-bold text-slate-700 text-sm">
                    No Pending Connection Requests
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Share your FoodRescue ID <strong>{charity.foodRescueId || 'FRC-CH-7K92P'}</strong> with restaurants and hotels to receive direct connection requests.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingConnections.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-base text-slate-900">
                              {req.donorName}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                              {req.donorOrganizationType}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span>📍 {req.donorLocation}</span>
                            <span>•</span>
                            <span>📞 {req.donorPhone}</span>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400 font-semibold">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {req.reason && (
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                            Reason for connection:
                          </span>
                          "{req.reason}"
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => appState.rejectConnectionRequest(req.id)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => appState.acceptConnectionRequest(req.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Partner</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shareable ID helper */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Your Public FoodRescue Connect ID
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Ready to Share
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl border border-white/10">
                <span className="font-mono font-black text-xl text-emerald-300 tracking-wider">
                  {charity.foodRescueId || 'FRC-CH-7K92P'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyId(charity.foodRescueId || 'FRC-CH-7K92P')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === (charity.foodRescueId || 'FRC-CH-7K92P') ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Provide this ID to local donors, marriage halls, and catering businesses so they can send priority surplus food donation requests directly to your kitchen.
              </p>
            </div>
          </div>
        )}

        {/* Tab: Profile */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <h3 className="font-heading font-bold text-xl text-slate-900">
                Verified Charity Profile
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">
                    Charity Name
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {charity.organizationName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5 flex items-center justify-between">
                    <span>FoodRescue ID</span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(charity.foodRescueId || 'FRC-CH-7K92P')}
                      className="text-blue-600 hover:text-blue-700 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                    >
                      {copiedId === (charity.foodRescueId || 'FRC-CH-7K92P') ? '✓ Copied' : 'Copy'}
                    </button>
                  </span>
                  <span className="font-bold text-emerald-700 font-mono text-sm">
                    {charity.foodRescueId || 'FRC-CH-7K92P'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5 flex items-center justify-between">
                    <span>Registration ID</span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(charity.registrationDetails || 'TN/NGO/2019/004821')}
                      className="text-blue-600 hover:text-blue-700 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                    >
                      {copiedId === (charity.registrationDetails || 'TN/NGO/2019/004821') ? '✓ Copied' : 'Copy'}
                    </button>
                  </span>
                  <span className="font-bold text-slate-800 font-mono text-sm">
                    {charity.registrationDetails || 'TN/NGO/2019/004821'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">
                    Verification Status
                  </span>
                  <span className="font-bold text-blue-600 text-sm">
                    ✓ Verified by Admin
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">
                    Service Radius
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {charity.serviceRadiusKm} km
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">
                    Daily Capacity
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {charity.dailyCapacity} portions
                  </span>
                </div>
              </div>

              {/* Shareable ID callout */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-slate-800 block">
                    Direct Partner Connection Enabled
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Donors can connect with you instantly using your FoodRescue ID <strong>{charity.foodRescueId || 'FRC-CH-7K92P'}</strong> or Legal Registration ID <strong>{charity.registrationDetails}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyId(charity.foodRescueId || 'FRC-CH-7K92P')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === (charity.foodRescueId || 'FRC-CH-7K92P') ? 'Copied!' : 'Copy ID'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar for Charity (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 flex items-center justify-around px-2 shadow-xl pb-safe">
        {/* 1. Dashboard */}
        <button
          onClick={() => {
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* 2. Requests */}
        <button
          onClick={() => {
            setActiveTab('requests');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl relative transition-colors cursor-pointer ${
            activeTab === 'requests' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-5 h-5" />
          {incomingRequests.length > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {incomingRequests.length}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Requests</span>
        </button>

        {/* 3. Pickups */}
        <button
          onClick={() => {
            setActiveTab('pickups');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl relative transition-colors cursor-pointer ${
            activeTab === 'pickups' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-5 h-5" />
          {activePickups.length > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 bg-emerald-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {activePickups.length}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Pickups</span>
        </button>

        {/* 4. Chat */}
        <button
          onClick={() => {
            setActiveTab('messages');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl relative transition-colors cursor-pointer ${
            activeTab === 'messages' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {unreadMessagesCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Chat</span>
        </button>

        {/* 5. More / Impact */}
        <button
          onClick={() => {
            setActiveTab('impact');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'impact' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Analytics</span>
        </button>
      </nav>

      {/* Reject Reason Modal */}
      {rejectReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-3">
            <h4 className="font-heading font-bold text-base text-slate-900">
              Decline Donation Request
            </h4>
            <p className="text-xs text-slate-500">
              Select reason so the donor can be swiftly matched with another nearby verified charity:
            </p>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
            >
              <option value="Capacity limit reached for tonight">
                Capacity limit reached for tonight
              </option>
              <option value="No transport vehicle available right now">
                No transport vehicle available right now
              </option>
              <option value="Outside immediate service radius">
                Outside immediate service radius
              </option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectReasonModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectReasonModal)}
                className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

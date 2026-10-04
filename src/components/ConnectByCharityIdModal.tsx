import React, { useState } from 'react';
import {
  X,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  Users,
  Check,
  Copy,
  Sparkles,
  AlertCircle,
  Building,
  Heart,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { CharityProfile } from '../types';
import { appState, useAppState } from '../services/store';

interface ConnectByCharityIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForDonation?: (charity: CharityProfile) => void;
  onOpenChatWithCharity?: (charityId: string) => void;
}

export const ConnectByCharityIdModal: React.FC<ConnectByCharityIdModalProps> = ({
  isOpen,
  onClose,
  onSelectForDonation,
  onOpenChatWithCharity,
}) => {
  const state = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedCharity, setSearchedCharity] = useState<CharityProfile | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [connectReason, setConnectReason] = useState('Regular surplus food donation partner');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [requestSentSuccess, setRequestSentSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'connected'>('search');

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setHasSearched(true);
    setRequestSentSuccess(false);
    const found = appState.findCharityByIdOrReg(searchTerm);
    setSearchedCharity(found || null);
  };

  const handleQuickSelect = (id: string) => {
    setSearchTerm(id);
    setHasSearched(true);
    setRequestSentSuccess(false);
    const found = appState.findCharityByIdOrReg(id);
    setSearchedCharity(found || null);
  };

  const handleSendConnectionRequest = () => {
    if (!searchedCharity) return;
    setIsSendingRequest(true);
    try {
      appState.sendConnectionRequest(searchedCharity.id, connectReason);
      setIsSendingRequest(false);
      setRequestSentSuccess(true);
    } catch {
      setIsSendingRequest(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const connectedCharities = appState.getConnectedCharities();
  const isCurrentlyConnected = searchedCharity
    ? appState.isPartnerConnected(searchedCharity.id)
    : false;

  const existingPending = searchedCharity
    ? state.connectionRequests.find(
        (r) =>
          r.charityId === searchedCharity.id &&
          r.donorId === state.donor.id &&
          r.status === 'PENDING'
      )
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold text-base shadow-inner">
              🆔
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
                <span>Connect by Charity ID</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                  Verified Trust Link
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Directly connect to a known charity using FoodRescue ID or Legal Registration ID
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch: Search ID vs My Connected Partners */}
        <div className="px-5 pt-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/70">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'search'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🆔 Find by Charity ID</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('connected')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'connected'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🤝 Connected Partners</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              {connectedCharities.length}
            </span>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {activeTab === 'search' ? (
            <>
              {/* Architecture Explanation Card */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">
                    3 Flexible Ways to Connect with Charities:
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                    <span className="flex items-center gap-1">
                      🗺️ <strong>Map:</strong> Live GPS proximity
                    </span>
                    <span className="flex items-center gap-1">
                      📋 <strong>List:</strong> AI-ranked match
                    </span>
                    <span className="flex items-center gap-1">
                      🆔 <strong>Charity ID:</strong> Direct trusted link
                    </span>
                  </div>
                </div>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Enter FoodRescue Charity ID or Legal Registration ID
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="e.g. FRC-CH-7K92P or TN/NGO/2019/004821"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <span>FIND CHARITY</span>
                  </button>
                </div>

                {/* Quick Test Chips */}
                <div className="pt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-400">Try Sample IDs:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickSelect('FRC-CH-7K92P')}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-mono text-[10px] font-bold border border-slate-200 transition-colors cursor-pointer"
                  >
                    FRC-CH-7K92P (Praba Foundation)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelect('TN/NGO/2019/004821')}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-mono text-[10px] font-bold border border-slate-200 transition-colors cursor-pointer"
                  >
                    TN/NGO/2019/004821 (Legal ID)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelect('FRC-CH-1A402')}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-mono text-[10px] font-bold border border-slate-200 transition-colors cursor-pointer"
                  >
                    FRC-CH-1A402 (Annadhanam Trust)
                  </button>
                </div>
              </form>

              {/* Result Area */}
              {hasSearched && (
                <div className="pt-2">
                  {searchedCharity ? (
                    <div className="rounded-2xl border-2 border-emerald-500/80 bg-white p-5 shadow-lg space-y-4">
                      {/* Top Header Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">❤️</span>
                            <h4 className="font-heading font-black text-lg text-slate-900">
                              {searchedCharity.organizationName}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                            <ShieldCheck className="w-4 h-4 fill-blue-50 text-blue-600" />
                            <span>✓ Verified by FoodRescue Admin</span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {searchedCharity.organizationType}
                        </span>
                      </div>

                      {/* 2-Column ID Badge Box (Platform ID vs Legal Registration ID) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            FoodRescue ID (Platform Identity)
                          </span>
                          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                            <span className="font-mono font-black text-emerald-700 text-sm">
                              {searchedCharity.foodRescueId || 'FRC-CH-7K92P'}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(searchedCharity.foodRescueId || 'FRC-CH-7K92P')
                              }
                              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                              title="Copy FoodRescue ID"
                            >
                              {copiedId === (searchedCharity.foodRescueId || 'FRC-CH-7K92P') ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Registration ID (Legal / NGO Darpan)
                          </span>
                          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                            <span className="font-mono font-bold text-slate-800 text-xs">
                              {searchedCharity.registrationDetails}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(searchedCharity.registrationDetails)}
                              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                              title="Copy Legal Registration ID"
                            >
                              {copiedId === searchedCharity.registrationDetails ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Location & Details */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-start gap-2 text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800 block">
                              {searchedCharity.location.place}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {searchedCharity.location.address}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">
                            Service Radius
                          </span>
                          <span className="font-bold text-slate-800 text-sm">
                            {searchedCharity.serviceRadiusKm} km
                          </span>
                        </div>
                      </div>

                      {/* Compatibility Checklist */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                        <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                          Food Category Compatibility:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {searchedCharity.foodCategoriesAccepted.map((cat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{cat}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Connection / Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 space-y-3">
                        {isCurrentlyConnected ? (
                          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>✓ You are already connected with {searchedCharity.organizationName}</span>
                            </div>
                            <div className="flex gap-2">
                              {onSelectForDonation && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSelectForDonation(searchedCharity);
                                    onClose();
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  🍲 Send Food Now
                                </button>
                              )}
                              {onOpenChatWithCharity && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onOpenChatWithCharity(searchedCharity.id);
                                    onClose();
                                  }}
                                  className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  💬 Chat
                                </button>
                              )}
                            </div>
                          </div>
                        ) : existingPending || requestSentSuccess ? (
                          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-amber-600" />
                              <span>Connection Request Pending Charity Approval</span>
                            </div>
                            <p className="text-[11px] text-amber-700">
                              {searchedCharity.organizationName} has received your connection request. Once they accept, they will appear in your Connected Partners list for 1-click surplus food donation.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Connection Request Reason / Note:
                              </label>
                              <input
                                type="text"
                                value={connectReason}
                                onChange={(e) => setConnectReason(e.target.value)}
                                placeholder="e.g. Regular surplus food donation partner from our restaurant"
                                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-2.5">
                              <button
                                type="button"
                                onClick={handleSendConnectionRequest}
                                disabled={isSendingRequest}
                                className="w-full sm:flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Users className="w-4 h-4" />
                                <span>{isSendingRequest ? 'Sending Request...' : 'SEND CONNECTION REQUEST'}</span>
                              </button>

                              {onSelectForDonation && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSelectForDonation(searchedCharity);
                                    onClose();
                                  }}
                                  className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <span>🍲 Direct Food Donation</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                      <div className="font-bold text-slate-800 text-sm">
                        No Charity Found for "{searchTerm}"
                      </div>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Please check the FoodRescue ID (e.g. <code>FRC-CH-7K92P</code>) or Legal Registration ID (e.g. <code>TN/NGO/2019/004821</code>).
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Connected Partners Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>{connectedCharities.length} Verified Connected Partners</span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Mutual Trust Established
                </span>
              </div>

              {connectedCharities.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="font-bold text-slate-700 text-sm">
                    No Connected Partners Yet
                  </div>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Use the "Find by Charity ID" tab to look up a charity by their ID and send them a connection request.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {connectedCharities.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            c.imageUrl ||
                            'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=120&q=80'
                          }
                          alt={c.organizationName}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-heading font-bold text-sm text-slate-900 truncate">
                              {c.organizationName}
                            </h5>
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 inline shrink-0" />
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-700">
                              {c.foodRescueId || 'FRC-CH-UNKNOWN'}
                            </span>
                            <span>•</span>
                            <span>{c.location.place}</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-semibold">
                              {c.currentCapacityStatus} Capacity
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {onSelectForDonation && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectForDonation(c);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            🍲 Donate
                          </button>
                        )}
                        {onOpenChatWithCharity && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenChatWithCharity(c.id);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            💬
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>FoodRescue AI Multi-Channel Connection Protocol</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Utensils,
  CheckCircle2,
  Clock,
  Truck,
  Heart,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  MapPin,
  Calendar,
  Sparkles,
  FileText,
  XCircle,
  AlertCircle,
  Download,
  Share2,
  Printer,
  ChevronRight,
  Map as MapIcon,
  Flame,
  Award,
  Trash2,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';
import { FoodDonation, CharityProfile, DonationStatus } from '../types';
import { appState } from '../services/store';

interface DonationHistoryProps {
  donations: FoodDonation[];
  charities: CharityProfile[];
  onSelectDonation?: (donationId: string) => void;
  onViewOnMap?: (charityId?: string) => void;
  onOpenChat?: (donationId: string) => void;
  onNewDonation?: () => void;
}

type FilterStatusGroup = 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'CANCELLED';

export const DonationHistory: React.FC<DonationHistoryProps> = ({
  donations,
  charities,
  onSelectDonation,
  onViewOnMap,
  onOpenChat,
  onNewDonation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatusGroup>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedDonationForReceipt, setSelectedDonationForReceipt] = useState<FoodDonation | null>(null);
  const [inspectedDonation, setInspectedDonation] = useState<FoodDonation | null>(null);

  // Map charity lookup for rapid access
  const charityMap = useMemo(() => {
    const map = new Map<string, CharityProfile>();
    charities.forEach((c) => map.set(c.id, c));
    return map;
  }, [charities]);

  // Aggregate high-level metrics
  const stats = useMemo(() => {
    const total = donations.length;
    const completed = donations.filter((d) => d.status === 'COMPLETED' || d.status === 'RECEIVED' || d.status === 'HANDED_OVER').length;
    const inProgress = donations.filter(
      (d) =>
        d.status === 'ACCEPTED' ||
        d.status === 'PICKUP_COORDINATION' ||
        d.status === 'READY_FOR_HANDOVER' ||
        d.status === 'REQUEST_SENT'
    ).length;
    const pending = donations.filter((d) => d.status === 'AVAILABLE' || d.status === 'CREATED' || d.status === 'AI_ANALYZING').length;
    const totalPortions = donations.reduce((sum, d) => sum + (d.portions || 0), 0);
    const totalKg = donations.reduce((sum, d) => {
      const match = d.quantity.match(/(\d+(\.\d+)?)/);
      return sum + (match ? parseFloat(match[1]) : 10);
    }, 0);

    return { total, completed, inProgress, pending, totalPortions, totalKg };
  }, [donations]);

  // Filter donations
  const filteredDonations = useMemo(() => {
    return donations.filter((donation) => {
      // Search query (Food Name, ID, or Charity Name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = donation.foodName.toLowerCase().includes(query);
        const matchesId = donation.id.toLowerCase().includes(query);
        const matchesCharity = donation.selectedCharityName?.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesCharity) return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && donation.foodCategory !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'COMPLETED') {
        return donation.status === 'COMPLETED' || donation.status === 'RECEIVED' || donation.status === 'HANDED_OVER';
      }
      if (statusFilter === 'IN_PROGRESS') {
        return (
          donation.status === 'ACCEPTED' ||
          donation.status === 'PICKUP_COORDINATION' ||
          donation.status === 'READY_FOR_HANDOVER' ||
          donation.status === 'REQUEST_SENT'
        );
      }
      if (statusFilter === 'PENDING') {
        return donation.status === 'AVAILABLE' || donation.status === 'CREATED' || donation.status === 'AI_ANALYZING';
      }
      if (statusFilter === 'CANCELLED') {
        return donation.status === 'CANCELLED' || donation.status === 'REJECTED';
      }

      return true;
    });
  }, [donations, searchQuery, statusFilter, categoryFilter]);

  // Status Badge Helper
  const getStatusBadge = (status: DonationStatus) => {
    switch (status) {
      case 'COMPLETED':
      case 'RECEIVED':
      case 'HANDED_OVER':
        return {
          label: 'Completed & Received',
          icon: CheckCircle2,
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
        };
      case 'PICKUP_COORDINATION':
      case 'READY_FOR_HANDOVER':
        return {
          label: 'Pickup Coordination',
          icon: Truck,
          className: 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20 animate-pulse',
        };
      case 'ACCEPTED':
        return {
          label: 'Accepted by Charity',
          icon: CheckCircle2,
          className: 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/20',
        };
      case 'REQUEST_SENT':
        return {
          label: 'Request Sent (Pending Response)',
          icon: Clock,
          className: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20',
        };
      case 'AVAILABLE':
      case 'CREATED':
      case 'AI_ANALYZING':
        return {
          label: 'Pending Charity Match',
          icon: Sparkles,
          className: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20',
        };
      case 'REJECTED':
      case 'CANCELLED':
      default:
        return {
          label: 'Cancelled / Rejected',
          icon: XCircle,
          className: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Impact Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-700/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                Audit Trail & History
              </span>
              <span className="text-xs text-slate-400">
                Kadayanallur Food Recovery Network
              </span>
            </div>
            <h2 className="font-heading font-black text-2xl text-white tracking-tight">
              Donation History & Lifecycle Records
            </h2>
            <p className="text-slate-300 text-xs mt-1">
              Track past surplus food handovers, real-time collection statuses, and community charity impact.
            </p>
          </div>

          {onNewDonation && (
            <button
              onClick={onNewDonation}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
            >
              <Utensils className="w-4 h-4" />
              <span>Donate New Surplus Food</span>
            </button>
          )}
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Recorded Donations
            </span>
            <span className="font-heading font-black text-2xl text-white mt-1 block">
              {stats.total}
            </span>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">
              {stats.completed} successfully collected
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Meals Provided
            </span>
            <span className="font-heading font-black text-2xl text-emerald-400 mt-1 block">
              {stats.totalPortions} portions
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Nutritious food saved from landfills
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Food Rescued Weight
            </span>
            <span className="font-heading font-black text-2xl text-white mt-1 block">
              {stats.totalKg.toFixed(0)} kg
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              ~{(stats.totalKg * 2.5).toFixed(0)} kg CO₂ avoided
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              In-Progress Recoveries
            </span>
            <span className="font-heading font-black text-2xl text-amber-400 mt-1 block">
              {stats.inProgress + stats.pending}
            </span>
            <span className="text-[10px] text-amber-300 mt-0.5 block">
              {stats.inProgress} active pickup • {stats.pending} pending
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by food, charity, or #ID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              Category:
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">All Categories</option>
              <option value="Cooked Meal">Cooked Meal</option>
              <option value="Bakery">Bakery</option>
              <option value="Raw Produce">Raw Produce</option>
              <option value="Packed Food">Packed Food</option>
              <option value="Dairy & Desserts">Dairy & Desserts</option>
            </select>
          </div>
        </div>

        {/* Status Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs font-bold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Statuses ({donations.length})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed ({stats.completed})</span>
          </button>
          <button
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'IN_PROGRESS'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>In-Transit / Active ({stats.inProgress})</span>
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Match ({stats.pending})</span>
          </button>
        </div>
      </div>

      {/* Donation History List */}
      <div className="space-y-4">
        {donations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-heading font-black text-slate-900 text-lg">
                Clean Slate — Zero Donation Records
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All mock history has been wiped. You can register your first live food donation in Kondamanaickenpatti, Namakkal now.
              </p>
            </div>
            {onNewDonation && (
              <button
                onClick={onNewDonation}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Log First Donation</span>
              </button>
            )}
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-heading font-bold text-slate-800 text-base">
              No matching donations found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Try adjusting your search criteria or switch the status filter to view other past records.
            </p>
          </div>
        ) : (
          filteredDonations.map((item) => {
            const statusConfig = getStatusBadge(item.status);
            const StatusIcon = statusConfig.icon;
            const associatedCharity = item.selectedCharityId
              ? charityMap.get(item.selectedCharityId)
              : null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all p-5 shadow-sm hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
              >
                {/* Left Block: Food Info & Timestamps */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={item.foodImage}
                      alt={item.foodName}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shadow-2xs group-hover:scale-102 transition-transform"
                    />
                    <span className="absolute -top-1.5 -left-1.5 px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[9px] font-black font-mono shadow-xs">
                      #{item.id}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading font-bold text-slate-900 text-base leading-snug">
                        {item.foodName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                          item.foodType === 'Vegetarian'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.foodType === 'Vegan'
                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.foodType === 'Vegetarian'
                              ? 'bg-emerald-600'
                              : item.foodType === 'Vegan'
                              ? 'bg-teal-600'
                              : 'bg-amber-600'
                          }`}
                        />
                        {item.foodType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="font-bold text-slate-700">
                        {item.portions} portions ({item.quantity})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {item.preparedDate} at {item.preparedTime}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-slate-400" />
                        {item.storageCondition}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="pt-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${statusConfig.className}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>{statusConfig.label}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle Block: Associated Charity Details */}
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 min-w-[260px] lg:max-w-xs text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Associated Charity
                    </span>
                    {associatedCharity && (
                      <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-bold rounded flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3 text-blue-600 inline" />
                        Verified
                      </span>
                    )}
                  </div>

                  {item.selectedCharityName ? (
                    <div>
                      <div className="font-heading font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                        <span className="truncate">{item.selectedCharityName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {associatedCharity
                          ? `${associatedCharity.organizationType} • ${associatedCharity.location.place}`
                          : 'Kadayanallur Community Partner'}
                      </p>
                      {item.completedAt && (
                        <p className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Collected on {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(item.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="py-1">
                      <span className="text-slate-600 font-semibold block">
                        No charity assigned yet
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Food is listed and ready for nearby organizations.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Block: Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 lg:flex-col lg:items-end justify-end">
                  <button
                    onClick={() => setInspectedDonation(item)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>AI Analysis</span>
                  </button>

                  {item.status === 'COMPLETED' ? (
                    <button
                      onClick={() => setSelectedDonationForReceipt(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Receipt & Proof</span>
                    </button>
                  ) : (
                    item.selectedCharityId && onOpenChat && (
                      <button
                        onClick={() => onOpenChat(item.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span>Chat Charity</span>
                      </button>
                    )
                  )}

                  {onViewOnMap && (
                    <button
                      onClick={() => onViewOnMap(item.selectedCharityId)}
                      className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <MapIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>View Route</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete donation #${item.id} (${item.foodName})?`)) {
                        appState.deleteDonation(item.id);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Delete donation from history"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Digital Receipt / Proof of Handover Modal */}
      {selectedDonationForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6">
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-lg text-white">
                      Official Food Handover Certificate
                    </h3>
                    <span className="text-[11px] text-emerald-200">
                      FoodRescue Network • Verified Verification Token
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDonationForReceipt(null)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Certificate Content */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Certificate ID
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    CERT-{selectedDonationForReceipt.id}-{new Date().getFullYear()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Handover Status
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                    ✓ Legally Documented & Completed
                  </span>
                </div>
              </div>

              {/* Donor & Charity Pair */}
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Donor Organization
                  </span>
                  <span className="font-heading font-bold text-slate-900 block text-sm mt-0.5">
                    {selectedDonationForReceipt.donorName}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {selectedDonationForReceipt.donorOrganizationType} • Kadayanallur
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Recipient Charity
                  </span>
                  <span className="font-heading font-bold text-emerald-800 block text-sm mt-0.5">
                    {selectedDonationForReceipt.selectedCharityName || 'Verified Charity Partner'}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Authorized Volunteer Intake
                  </span>
                </div>
              </div>

              {/* Food Item Breakdown */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  Food Inventory & Portion Audit:
                </span>
                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-900">{selectedDonationForReceipt.foodName}</span>
                    <span className="text-emerald-700">{selectedDonationForReceipt.portions} portions ({selectedDonationForReceipt.quantity})</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Category: {selectedDonationForReceipt.foodCategory} ({selectedDonationForReceipt.foodType})</span>
                    <span>Storage: {selectedDonationForReceipt.storageCondition}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    Prepared at {selectedDonationForReceipt.preparedTime} on {selectedDonationForReceipt.preparedDate}
                  </div>
                </div>
              </div>

              {/* Environmental and Community Impact */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center">
                <div>
                  <span className="text-[10px] text-emerald-800 font-bold block uppercase">
                    Meals Rescued
                  </span>
                  <span className="font-heading font-black text-emerald-900 text-base">
                    {selectedDonationForReceipt.portions}
                  </span>
                </div>
                <div className="border-x border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-bold block uppercase">
                    Food Rescued
                  </span>
                  <span className="font-heading font-black text-emerald-900 text-base">
                    {selectedDonationForReceipt.quantity}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-800 font-bold block uppercase">
                    Carbon Averted
                  </span>
                  <span className="font-heading font-black text-emerald-900 text-base">
                    ~24 kg CO₂
                  </span>
                </div>
              </div>

              {/* Signatures and Disclaimer */}
              <div className="pt-2 text-[10px] text-slate-400 space-y-1">
                <p>
                  This digital certificate verifies that the listed surplus food was collected under Good Samaritan Food Donation safety guidelines and delivered directly to the designated community partner.
                </p>
                <div className="flex justify-between pt-3 font-mono text-[9px] text-slate-500 border-t border-slate-100">
                  <span>Cryptographic Hash: SHA256-FD902-{selectedDonationForReceipt.id}</span>
                  <span>Verified via FoodRescue Protocol</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => setSelectedDonationForReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Food Analysis Detail Modal */}
      {inspectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  AI Food Analysis • #{inspectedDonation.id}
                </h3>
              </div>
              <button
                onClick={() => setInspectedDonation(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={inspectedDonation.foodImage}
                  alt={inspectedDonation.foodName}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-heading font-bold text-sm text-slate-900">
                    {inspectedDonation.foodName}
                  </h4>
                  <p className="text-slate-500">
                    {inspectedDonation.portions} portions ({inspectedDonation.quantity}) • {inspectedDonation.foodCategory}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Storage: {inspectedDonation.storageCondition} ({inspectedDonation.storageTemperature || 'Standard'})
                  </p>
                </div>
              </div>

              {inspectedDonation.aiAnalysis ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <span className="font-bold block text-xs mb-1">
                      Urgency Evaluation & Donation Window:
                    </span>
                    <p className="text-xs">
                      {inspectedDonation.aiAnalysis.donationWindow} • {inspectedDonation.aiAnalysis.pickupPriority}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 block mb-1">
                      Reasoning & Safety Parameters:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      {inspectedDonation.aiAnalysis.reasoning.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {inspectedDonation.aiAnalysis.nutrition && (
                    <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Calories</span>
                        <span className="font-bold text-slate-900">{inspectedDonation.aiAnalysis.nutrition.calories} kcal</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Protein</span>
                        <span className="font-bold text-slate-900">{inspectedDonation.aiAnalysis.nutrition.proteinGrams}g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Carbs</span>
                        <span className="font-bold text-slate-900">{inspectedDonation.aiAnalysis.nutrition.carbsGrams}g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Fat</span>
                        <span className="font-bold text-slate-900">{inspectedDonation.aiAnalysis.nutrition.fatGrams}g</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500">No AI evaluation records available for this donation.</p>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectedDonation(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

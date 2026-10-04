import React, { useState } from 'react';
import {
  ShieldCheck,
  Send,
  Sparkles,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CharityMatch, CharityProfile, FoodDonation } from '../types';

interface RecommendedCharitiesListProps {
  matches: CharityMatch[];
  onSelectCharity: (charity: CharityProfile) => void;
  onSendRequest: (charity: CharityProfile) => void;
  onViewOnMap?: () => void;
  activeDonation?: FoodDonation | null;
}

export const RecommendedCharitiesList: React.FC<RecommendedCharitiesListProps> = ({
  matches,
  onSelectCharity,
  onSendRequest,
  onViewOnMap,
  activeDonation,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5">
      {/* Header matching reference image */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900">
            Recommended Charities
          </h3>
        </div>
        {onViewOnMap && (
          <button
            type="button"
            onClick={onViewOnMap}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>View on Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Match Cards List */}
      <div className="space-y-3">
        {matches.slice(0, 3).map((match, idx) => {
          const { charity, matchScore, distanceKm, reasons } = match;
          const isExpanded = expandedId === charity.id;

          const isAlreadyRequested =
            activeDonation?.selectedCharityId === charity.id &&
            (activeDonation.status === 'REQUEST_SENT' ||
              activeDonation.status === 'ACCEPTED' ||
              activeDonation.status === 'PICKUP_COORDINATION');

          return (
            <div
              key={charity.id}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all bg-slate-50/50 hover:bg-white group"
            >
              <div className="flex items-center gap-3">
                {/* Number Badge (1, 2, 3) matching montage */}
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-heading font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {idx + 1}
                </div>

                {/* Charity Thumbnail */}
                <img
                  src={
                    charity.imageUrl ||
                    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=120&q=80'
                  }
                  alt={charity.organizationName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h4 className="font-heading font-bold text-sm text-slate-900 truncate">
                      {charity.organizationName}
                    </h4>
                    <span title="Verified">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 inline fill-blue-50" />
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mb-1.5">
                    <span>{(distanceKm ?? 0).toFixed(1)} km</span>
                    <span className="mx-1">•</span>
                    <span>{charity.location.place}</span>
                  </div>

                  {/* Badges row matching screenshot */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-800 rounded-md border border-slate-200" title={`Legal Registration: ${charity.registrationDetails}`}>
                      {charity.foodRescueId || 'FRC-CH-7K92P'}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                      Verified
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                      Open
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded-md">
                      Accepts {charity.foodCategoriesAccepted[0]}
                    </span>
                  </div>
                </div>

                {/* Actions & Match Score */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSendRequest(charity)}
                    disabled={isAlreadyRequested}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 ${
                      isAlreadyRequested
                        ? 'bg-slate-200 text-slate-600 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAlreadyRequested ? 'Requested' : 'Send Request'}</span>
                  </button>

                  <div className="text-right min-w-[54px]">
                    <span className="font-heading font-black text-sm text-emerald-700 block">
                      {matchScore}%
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                      Match
                    </span>
                  </div>
                </div>
              </div>

              {/* Explainable Match Criteria (Section 18 requirement) */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : charity.id)}
                  className="text-slate-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Why {matchScore}% match?</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
                <span>Capacity: {charity.currentCapacityStatus}</span>
              </div>

              {isExpanded && (
                <div className="mt-2 p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1">
                  <div className="font-bold text-slate-700 mb-1">
                    Explainable AI Match Factors:
                  </div>
                  {reasons.map((r, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  AlertTriangle,
  Flame,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';
import { FoodDonation } from '../types';

interface AIFoodAnalysisCardProps {
  donation: FoodDonation;
  onViewDetails?: () => void;
}

export const AIFoodAnalysisCard: React.FC<AIFoodAnalysisCardProps> = ({
  donation,
  onViewDetails,
}) => {
  const [expanded, setExpanded] = useState(false);
  const ai = donation.aiAnalysis;

  if (!ai) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center">
        <Sparkles className="w-6 h-6 text-emerald-600 mx-auto mb-2 animate-spin" />
        <h4 className="font-heading font-bold text-slate-800">
          AI Food Analysis Engine Running...
        </h4>
        <p className="text-xs text-slate-500">
          Evaluating food urgency, microbial window & distribution parameters
        </p>
      </div>
    );
  }

  const urgencyColors = {
    LOW: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      bar: 'bg-emerald-500',
    },
    MEDIUM: {
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      bar: 'bg-amber-500',
    },
    HIGH: {
      badge: 'bg-orange-500 text-white border-orange-600',
      bar: 'bg-orange-500',
    },
    CRITICAL: {
      badge: 'bg-rose-600 text-white border-rose-700',
      bar: 'bg-rose-600',
    },
    'REVIEW REQUIRED': {
      badge: 'bg-slate-200 text-slate-800 border-slate-300',
      bar: 'bg-slate-400',
    },
  }[ai.urgencyLevel] || {
    badge: 'bg-orange-500 text-white border-orange-600',
    bar: 'bg-orange-500',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 relative overflow-hidden transition-all">
      {/* Card Header matching reference image */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900">
            AI Food Analysis
          </h3>
        </div>
        <button
          type="button"
          onClick={() => {
            setExpanded(!expanded);
            if (onViewDetails) onViewDetails();
          }}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>{expanded ? 'Hide Details' : 'View Details'}</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Main Analysis Card Body matching montage layout */}
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
        {/* Food Thumbnail */}
        <img
          src={donation.foodImage}
          alt={donation.foodName}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
        />

        {/* Center details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-heading font-extrabold text-lg text-slate-900 leading-tight truncate">
              {donation.foodName}
            </h4>
            <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md">
              {donation.portions} portions
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mb-2">
            <span>Prepared: <strong className="text-slate-800">{donation.preparedTime}</strong></span>
            <span className="text-slate-300">•</span>
            <span>Current: <strong className="text-slate-800">{ai.foodAge}</strong></span>
          </div>

          <div className="text-xs text-slate-700 font-medium">
            <span className="text-slate-500">Estimated donation window: </span>
            <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
              {ai.donationWindow}
            </strong>
          </div>
        </div>

        {/* Urgency Score & Badge */}
        <div className="sm:border-l sm:border-slate-100 sm:pl-4 flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Urgency Level
            </span>
            <span
              className={`px-3 py-1 text-xs font-black rounded-lg border shadow-xs inline-block tracking-wider uppercase ${urgencyColors.badge}`}
            >
              {ai.urgencyLevel}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Score
            </span>
            <span className="font-heading font-extrabold text-slate-900 text-lg sm:text-xl">
              {ai.urgencyScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </span>
          </div>
        </div>
      </div>

      {/* Recommendation banner */}
      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-slate-800 flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong className="text-emerald-900">Recommendation: </strong>
            {ai.pickupPriority}
          </span>
        </div>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
          {/* Nutrition Estimates */}
          {ai.nutrition && (
            <div>
              <span className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Estimated Nutritional Value (per portion)</span>
              </span>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Calories
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {ai.nutrition.calories} kcal
                  </span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Protein
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {ai.nutrition.proteinGrams}g
                  </span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Carbs
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {ai.nutrition.carbsGrams}g
                  </span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Fat
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {ai.nutrition.fatGrams}g
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* AI Reasoning */}
          <div>
            <span className="font-bold text-slate-700 block mb-1">
              AI Evaluation Reasoning:
            </span>
            <ul className="space-y-1 text-slate-600 pl-4 list-disc">
              {ai.reasoning.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          {/* Safety & Compliance Disclaimer (Mandated by Section 16) */}
          <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-[11px] text-slate-500 flex items-start gap-1.5">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Food Safety Notice:</strong> AI assessments provide handling urgency estimations based on preparation time, category, and temperature. They do not replace professional sensory inspection or mandatory statutory food-safety practices.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

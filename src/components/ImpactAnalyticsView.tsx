import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  Calendar,
  Utensils,
  Award,
  Leaf,
  Clock,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useAppState } from '../services/store';
import { INITIAL_SURPLUS_PREDICTIONS } from '../data/mockData';

export const ImpactAnalyticsView: React.FC = () => {
  const state = useAppState();
  const impact = state.impact;
  const [selectedDay, setSelectedDay] = useState('Saturday');

  const prediction =
    INITIAL_SURPLUS_PREDICTIONS.find((p) => p.dayOfWeek === selectedDay) ||
    INITIAL_SURPLUS_PREDICTIONS[0];

  const categoryBreakdown = [
    { name: 'Cooked Meals', percentage: 65, color: 'bg-emerald-500' },
    { name: 'Bakery & Bread', percentage: 18, color: 'bg-amber-500' },
    { name: 'Packed Food', percentage: 12, color: 'bg-blue-500' },
    { name: 'Raw Produce', percentage: 5, color: 'bg-teal-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Stats matching Section 37 */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-3xl mb-6">
          <span className="px-3 py-1 bg-emerald-700/60 rounded-full text-xs font-bold text-emerald-200 border border-emerald-500/30 uppercase tracking-wider inline-block mb-2">
            FoodRescue AI Live Impact
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tight leading-tight">
            Preventing Waste. Nourishing Communities.
          </h2>
          <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
            Real-time environmental and humanitarian metrics across Tamil Nadu & regional charity partners.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-emerald-700/50">
          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase block mb-1">
              Meals Rescued
            </span>
            <span className="font-heading font-black text-3xl sm:text-4xl text-white">
              {impact.mealsRescued.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase block mb-1">
              Food Diverted
            </span>
            <span className="font-heading font-black text-3xl sm:text-4xl text-white">
              {impact.foodSavedKg.toLocaleString()} kg
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase block mb-1">
              Completed Handover
            </span>
            <span className="font-heading font-black text-3xl sm:text-4xl text-white">
              {impact.completedDonations.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase block mb-1">
              CO₂ Emissions Saved
            </span>
            <span className="font-heading font-black text-3xl sm:text-4xl text-emerald-300">
              {impact.co2AvoidedKg.toLocaleString()} kg
            </span>
          </div>
        </div>
      </div>

      {/* AI Surplus Prediction Section (Section 33 & 34) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Predictive Surplus Food Forecast
              </h3>
              <p className="text-xs text-slate-500">
                AI pattern analysis on historical banquet and preparation trends
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['Saturday', 'Sunday'].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedDay === day
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {day} Forecast
              </button>
            ))}
          </div>
        </div>

        {/* Prediction Card */}
        <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200/70 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-purple-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                Expected Surplus
              </span>
              <span className="font-heading font-black text-lg text-purple-900">
                {prediction.expectedSurplusPortionsMin}–{prediction.expectedSurplusPortionsMax} portions
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                Likely Category
              </span>
              <span className="font-bold text-slate-800 text-sm">
                {prediction.likelyCategory}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                Optimal Donation Window
              </span>
              <span className="font-bold text-slate-800 text-sm">
                {prediction.optimalTimeWindow}
              </span>
            </div>
          </div>

          <div className="text-xs text-purple-900 bg-white p-3.5 rounded-xl border border-purple-100">
            <strong>AI Recommendation: </strong>
            {prediction.recommendation}
          </div>

          <div className="text-[11px] text-slate-500 italic">
            * Predictions are estimates derived from historical culinary donor patterns.
          </div>
        </div>
      </div>

      {/* Categories & Efficiency Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900">
            Rescued Food Category Breakdown
          </h3>
          <div className="space-y-3">
            {categoryBreakdown.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{item.name}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coordination Efficiency */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900">
            Donor–Charity Connection Efficiency
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                Avg. Charity Response
              </span>
              <span className="font-heading font-black text-2xl text-slate-900">
                14 mins
              </span>
              <span className="text-[11px] text-emerald-600 block mt-1">
                ✓ 28% faster than city average
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                Handover Success Rate
              </span>
              <span className="font-heading font-black text-2xl text-emerald-600">
                98.4%
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Direct coordinator chat
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

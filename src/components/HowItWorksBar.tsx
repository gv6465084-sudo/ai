import React from 'react';
import {
  Utensils,
  Cpu,
  MapPin,
  Send,
  Heart,
  MessageSquare,
  Truck,
  BarChart3,
} from 'lucide-react';

export const HowItWorksBar: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Create Donation',
      desc: 'Add food details and location',
      icon: Utensils,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      num: '2',
      title: 'AI Analysis',
      desc: 'Estimate urgency and donation window',
      icon: Cpu,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      num: '3',
      title: 'Find Nearby Charities',
      desc: 'View verified charities on map',
      icon: MapPin,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    },
    {
      num: '4',
      title: 'Send Request',
      desc: 'Choose a charity and send donation request',
      icon: Send,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      num: '5',
      title: 'Charity Accepts',
      desc: 'Charity reviews and accepts the donation',
      icon: Heart,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
    {
      num: '6',
      title: 'Direct Coordination',
      desc: 'Chat and plan pickup directly',
      icon: MessageSquare,
      color: 'bg-sky-50 text-sky-600 border-sky-200',
    },
    {
      num: '7',
      title: 'Handover & Confirm',
      desc: 'Donor and charity confirm handover',
      icon: Truck,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      num: '8',
      title: 'Impact Recorded',
      desc: 'Meals rescued and impact analytics',
      icon: BarChart3,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
  ];

  return (
    <div className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-slate-900 text-base">How It Works?</span>
            <span className="text-slate-500 text-xs sm:text-sm font-medium">
              From surplus food to social impact — in just a few simple steps.
            </span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 self-start sm:self-auto">
            Direct Coordination • No Volunteer Lag
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative flex flex-col p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-emerald-200 hover:shadow-xs transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${step.color} shadow-xs`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    0{step.num}
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-slate-800 leading-tight mb-1 group-hover:text-emerald-700 transition-colors">
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                  {step.desc}
                </p>
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300 pointer-events-none">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

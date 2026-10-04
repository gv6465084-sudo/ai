import React from 'react';
import {
  Utensils,
  Heart,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { HowItWorksBar } from './HowItWorksBar';

interface LandingPageProps {
  onOpenDonorAuth: (mode?: 'login' | 'register') => void;
  onOpenCharityAuth: (mode?: 'login' | 'register') => void;
  onOpenAdminAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenDonorAuth,
  onOpenCharityAuth,
  onOpenAdminAuth,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation matching reference image */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <span className="font-heading font-black text-xl text-white tracking-tight">
              FoodRescue
            </span>
          </div>

          {/* Nav Links matching top banner */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#home" className="text-white hover:text-emerald-400 transition-colors">
              Home
            </a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
              How It Works
            </a>
            <a href="#impact" className="hover:text-emerald-400 transition-colors">
              Impact
            </a>
            <a href="#about" className="hover:text-emerald-400 transition-colors">
              About
            </a>
            <a href="#contact" className="hover:text-emerald-400 transition-colors">
              Contact
            </a>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAdminAuth}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section matching reference image top-left */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Subtle Ambient Background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mb-12">
          {/* Main Headline */}
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] mb-4">
            Rescue Food.
            <br />
            Connect <span className="text-emerald-400">Communities.</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            Turn surplus food into hope. We connect restaurants, hotels and event organizers directly with verified local charities using AI-powered urgency analysis and interactive routing.
          </p>
        </div>

        {/* Two Prominent Split Cards matching reference montage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Card 1: For Donors (Green) */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-700/80 hover:border-emerald-500/60 transition-all duration-300 group flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Utensils className="w-7 h-7" />
                </div>
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80"
                  alt="Restaurant"
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700 opacity-80"
                />
              </div>

              <h2 className="font-heading font-bold text-2xl text-white mb-2">
                For Donors
              </h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Donate surplus cooked meals, banquet food & produce. AI evaluates food age, storage urgency & alerts nearby verified organizations instantly.
              </p>
            </div>

            <div className="relative z-10 space-y-3">
              <button
                onClick={() => onOpenDonorAuth('login')}
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer"
              >
                <span>Donor Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-slate-400">
                New donor?{' '}
                <button
                  onClick={() => onOpenDonorAuth('register')}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Register Restaurant or Business
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: For Charities (Blue) */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-700/80 hover:border-blue-500/60 transition-all duration-300 group flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <Heart className="w-7 h-7 fill-blue-400" />
                </div>
                <img
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=200&q=80"
                  alt="Community Kitchen"
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700 opacity-80"
                />
              </div>

              <h2 className="font-heading font-bold text-2xl text-white mb-2">
                For Charities
              </h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Receive surplus food and serve vulnerable communities. Verified NGOs, shelters & community kitchens coordinate direct pickup with zero intermediaries.
              </p>
            </div>

            <div className="relative z-10 space-y-3">
              <button
                onClick={() => onOpenCharityAuth('login')}
                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer"
              >
                <span>Charity Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-slate-400">
                New charity organization?{' '}
                <button
                  onClick={() => onOpenCharityAuth('register')}
                  className="text-blue-400 font-bold hover:underline"
                >
                  Register for Verification
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row matching screenshot bottom bar */}
        <div className="mt-14 pt-8 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-black text-xl text-white block">
                12,480
              </span>
              <span className="text-xs text-slate-400">Meals Rescued</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-black text-xl text-white block">
                3,250 kg
              </span>
              <span className="text-xs text-slate-400">Food Saved</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-black text-xl text-white block">
                42
              </span>
              <span className="text-xs text-slate-400">Verified Charities</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-black text-xl text-white block">
                1,280
              </span>
              <span className="text-xs text-slate-400">Donor Partners</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Workflow Bar matching screenshot footer */}
      <div id="how-it-works">
        <HowItWorksBar />
      </div>
    </div>
  );
};

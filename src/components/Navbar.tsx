import React, { useState } from 'react';
import {
  Utensils,
  Heart,
  ShieldAlert,
  Bell,
  LogOut,
  ChevronDown,
  User,
  Sparkles,
} from 'lucide-react';
import { useAppState, appState } from '../services/store';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenDonorAuth: () => void;
  onOpenCharityAuth: () => void;
  onOpenAdminAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDonorAuth,
  onOpenCharityAuth,
  onOpenAdminAuth,
}) => {
  const state = useAppState();
  const currentRole = state.currentRole;
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const notifications = state.notifications.filter(
    (n) => currentRole && n.role === currentRole
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSwitchRole = (role: UserRole) => {
    appState.setRole(role);
    setShowRoleMenu(false);
  };

  const handleLogout = () => {
    appState.setRole(null);
    setShowRoleMenu(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleLogout()}
            className="flex items-center gap-2 text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <svg
                width="18"
                height="18"
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
            <div>
              <span className="font-heading font-black text-slate-900 text-lg tracking-tight block leading-tight">
                FoodRescue
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">
                Direct Connection Platform
              </span>
            </div>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentRole ? (
            <>
              {/* Notifications Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse"></span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
                      <span className="font-bold text-slate-800">Notifications</span>
                      <button
                        onClick={() => appState.markNotificationsRead()}
                        className="text-emerald-600 hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">
                          No notifications yet
                        </p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            className={`p-2 rounded-lg text-xs border ${
                              n.read
                                ? 'bg-slate-50 border-slate-100'
                                : 'bg-emerald-50/60 border-emerald-200'
                            }`}
                          >
                            <span className="font-bold text-slate-800 block">
                              {n.title}
                            </span>
                            <span className="text-slate-600 text-[11px] block mt-0.5">
                              {n.message}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Role Switcher Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-bold text-slate-800 shadow-2xs cursor-pointer"
                >
                  {currentRole === 'DONOR' ? (
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <Utensils className="w-3.5 h-3.5" />
                      <span>Donor: ABC Restaurant</span>
                    </span>
                  ) : currentRole === 'CHARITY' ? (
                    <span className="flex items-center gap-1.5 text-blue-700">
                      <Heart className="w-3.5 h-3.5 fill-blue-600" />
                      <span>Charity: Hope Center</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-purple-700">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Admin Mode</span>
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 text-xs font-semibold">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Switch Role Portal
                    </div>

                    <button
                      onClick={() => handleSwitchRole('DONOR')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                        currentRole === 'DONOR'
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Utensils className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span>Donor (ABC Restaurant)</span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Create donations & AI analysis
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSwitchRole('CHARITY')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                        currentRole === 'CHARITY'
                          ? 'bg-blue-50 text-blue-800 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Heart className="w-4 h-4 text-blue-600 fill-blue-600" />
                      <div>
                        <span>Charity (Hope Center)</span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Accept requests & direct chat
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSwitchRole('ADMIN')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                        currentRole === 'ADMIN'
                          ? 'bg-purple-50 text-purple-800 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4 text-purple-600" />
                      <div>
                        <span>Admin Console</span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Verify charities & audit trail
                        </span>
                      </div>
                    </button>

                    <div className="border-t border-slate-100 my-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out to Landing</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenDonorAuth}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
              >
                Donor Login
              </button>
              <button
                onClick={onOpenCharityAuth}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
              >
                Charity Login
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

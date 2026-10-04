import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Users,
  Utensils,
  MapPin,
  RefreshCw,
  Clock,
  ShieldCheck,
  Building,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { useAppState, appState } from '../services/store';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const state = useAppState();
  const charities = state.charities;
  const donations = state.donations;

  const pendingCharities = charities.filter(
    (c) => c.verificationStatus === 'pending'
  );
  const verifiedCharities = charities.filter(
    (c) => c.verificationStatus === 'verified'
  );

  const handleVerify = (id: string) => {
    appState.verifyCharity(id, 'verified');
  };

  const handleReject = (id: string) => {
    appState.verifyCharity(id, 'rejected');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-black text-xl">
                  FoodRescue Platform Administration
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Charity verification pipeline, live audit trail & platform governance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => appState.loadSampleDonations()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate Sample Data</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Pending Charity Verifications
            </span>
            <span className="font-heading font-black text-2xl text-amber-600">
              {pendingCharities.length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Active Verified Charities
            </span>
            <span className="font-heading font-black text-2xl text-blue-600">
              {verifiedCharities.length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Active Donations Tracked
            </span>
            <span className="font-heading font-black text-2xl text-emerald-600">
              {donations.length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Meals Rescued Today
            </span>
            <span className="font-heading font-black text-2xl text-slate-900">
              {state.impact.mealsRescued.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Verification Queue (Section 8) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                <span>Charity Verification Queue</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  {pendingCharities.length} Pending Review
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Charities must be authenticated with legal registration IDs before receiving donor food
              </p>
            </div>
          </div>

          {pendingCharities.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
              All charity organizations have been reviewed and verified.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCharities.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-heading font-bold text-base text-slate-900">
                        {item.organizationName}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Pending Admin Verification
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5">
                      <div>
                        <strong>Reg ID:</strong> {item.registrationDetails} •{' '}
                        <strong>Type:</strong> {item.organizationType}
                      </div>
                      <div>
                        <strong>Contact:</strong> {item.contactPerson} ({item.phone})
                      </div>
                      <div>
                        <strong>Location:</strong> {item.location.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerify(item.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Verify (✓)</span>
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Verified Charity Partners list */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-lg text-slate-900">
            Active Verified Charities ({verifiedCharities.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifiedCharities.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-sm text-slate-900 truncate">
                    {c.organizationName}
                  </h4>
                  <span className="text-blue-600 font-bold text-[11px] flex items-center gap-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 fill-blue-50" />
                    Verified
                  </span>
                </div>
                <div className="text-slate-500">
                  {c.location.locality}, {c.location.place}
                </div>
                <div className="text-slate-600">
                  Radius: <strong>{c.serviceRadiusKm} km</strong> • Capacity:{' '}
                  <strong>{c.currentCapacityStatus}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

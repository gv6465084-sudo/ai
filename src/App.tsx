/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppState, appState } from './services/store';
import { LandingPage } from './components/LandingPage';
import { DonorDashboard } from './components/DonorDashboard';
import { CharityDashboard } from './components/CharityDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DonorAuthModal } from './components/DonorAuthModal';
import { CharityAuthModal } from './components/CharityAuthModal';

export default function App() {
  const state = useAppState();
  const currentRole = state.currentRole;

  // Auth modal states
  const [donorModalOpen, setDonorModalOpen] = useState(false);
  const [donorModalMode, setDonorModalMode] = useState<'login' | 'register'>('login');

  const [charityModalOpen, setCharityModalOpen] = useState(false);
  const [charityModalMode, setCharityModalMode] = useState<'login' | 'register'>('login');

  const handleOpenDonorAuth = (mode: 'login' | 'register' = 'login') => {
    setDonorModalMode(mode);
    setDonorModalOpen(true);
  };

  const handleOpenCharityAuth = (mode: 'login' | 'register' = 'login') => {
    setCharityModalMode(mode);
    setCharityModalOpen(true);
  };

  const handleOpenAdmin = () => {
    appState.setRole('ADMIN');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Main Role-Specific View */}
      <div className="flex-1 flex flex-col">
        {!currentRole ? (
          <LandingPage
            onOpenDonorAuth={handleOpenDonorAuth}
            onOpenCharityAuth={handleOpenCharityAuth}
            onOpenAdminAuth={handleOpenAdmin}
          />
        ) : currentRole === 'DONOR' ? (
          <DonorDashboard onLogout={() => appState.setRole(null)} />
        ) : currentRole === 'CHARITY' ? (
          <CharityDashboard onLogout={() => appState.setRole(null)} />
        ) : (
          <AdminDashboard onLogout={() => appState.setRole(null)} />
        )}
      </div>

      {/* Donor Auth Modal */}
      <DonorAuthModal
        isOpen={donorModalOpen}
        onClose={() => setDonorModalOpen(false)}
        defaultMode={donorModalMode}
        onSuccess={() => {
          setDonorModalOpen(false);
        }}
      />

      {/* Charity Auth Modal */}
      <CharityAuthModal
        isOpen={charityModalOpen}
        onClose={() => setCharityModalOpen(false)}
        defaultMode={charityModalMode}
        onSuccess={() => {
          setCharityModalOpen(false);
        }}
      />
    </div>
  );
}

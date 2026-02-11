
import React, { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { PortalPage } from './pages/PortalPage';
import { AdminPage } from './pages/AdminPage';
import { LoginModal, ApplyModal } from './components/Modals';

const App: React.FC = () => {
  const state = useAppState();
  const [view, setView] = useState<'landing' | 'portal' | 'admin'>('landing');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [targetSessionId, setTargetSessionId] = useState('');

  // Handle Internal Routing Actions
  const openApply = async (sessionId?: string) => {
    setTargetSessionId(sessionId || '');
    // Fetch fresh data from API only upon opening the inquiry form
    await Promise.all([
      state.fetchSessionsFromApi(),
      state.fetchRoomsFromApi()
    ]);
    setShowApplyModal(true);
  };

  const handleAdminLogin = (password: string) => {
    if (password === "admin") {
      setIsAdminLoggedIn(true);
      setShowLoginModal(false);
      setView('admin');
    }
  };

  const exitPortal = () => {
    setView('landing');
    window.history.replaceState({}, '', '/');
  };

  // Render Admin View Directly (Bypasses MainLayout)
  if (view === 'admin' && isAdminLoggedIn) {
    return (
      <AdminPage 
        onExit={() => setView('landing')} 
        applications={state.applications} 
        setApplications={state.setApplications} 
        fetchInquiriesFromApi={state.fetchInquiriesFromApi}
        rooms={state.rooms} 
        setRooms={state.setRooms} 
        sessions={state.sessions} 
        setSessions={state.setSessions} 
        itinerary={state.itinerary} 
        setItinerary={state.setItinerary} 
        faqs={state.faqs} 
        setFaqs={state.setFaqs} 
        portalConfig={state.portalConfig} 
        setPortalConfig={state.setPortalConfig} 
      />
    );
  }

  // Root Content Switcher
  return (
    <MainLayout 
      isPortalView={view === 'portal'} 
      activePortalGuest={state.activePortalGuest} 
      onPortalClick={() => setView('portal')} 
      onAdminClick={() => setShowLoginModal(true)}
      onExitPortal={exitPortal}
    >
      {view === 'portal' && state.activePortalGuest ? (
        <PortalPage 
          guest={state.activePortalGuest} 
          session={state.sessions.find(s => s.id === state.activePortalGuest?.sessionId)} 
          room={state.rooms.find(r => r.id === state.activePortalGuest?.roomPreferenceId)} 
          portalConfig={state.portalConfig} 
        />
      ) : (
        <LandingPage 
          sessions={state.sessions} 
          rooms={state.rooms} 
          itinerary={state.itinerary} 
          faqs={state.faqs} 
          promoVideoUrl={state.portalConfig.promoVideoUrl} 
          onApplyClick={openApply} 
        />
      )}

      {/* Global Modals Controlled by App Router */}
      {showLoginModal && (
        <LoginModal 
          onLogin={handleAdminLogin} 
          onClose={() => setShowLoginModal(false)} 
        />
      )}

      {showApplyModal && (
        <ApplyModal 
          sessions={state.sessions} 
          rooms={state.rooms} 
          initialSessionId={targetSessionId} 
          onSubmit={state.submitApplication} 
          onClose={() => setShowApplyModal(false)} 
        />
      )}
    </MainLayout>
  );
};

export default App;

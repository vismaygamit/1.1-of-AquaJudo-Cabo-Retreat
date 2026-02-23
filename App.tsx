
import React, { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { PortalPage } from './pages/PortalPage';
import { AdminPage } from './pages/AdminPage';
import { PaymentSuccessPage, PaymentFailPage } from './pages/PaymentStatusPages';
import { LoginModal, ApplyModal } from './components/Modals';
import { Toast } from './components/Shared';
import { API_BASE_URL } from './constants';

const App: React.FC = () => {
  const state = useAppState();
  const [view, setView] = useState<'landing' | 'portal' | 'admin' | 'payment-success' | 'payment-fail'>('landing');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [targetSessionId, setTargetSessionId] = useState('');
  const [targetRoomId, setTargetRoomId] = useState('');
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // Handle Internal Routing Actions
  const openApply = async (sessionId?: string, roomId?: string) => {
    setTargetSessionId(sessionId || '');
    setTargetRoomId(roomId || '');
    // Fetch fresh data from API only upon opening the inquiry form
    await Promise.all([
      state.fetchSessionsFromApi(),
      state.fetchRoomsFromApi()
    ]);
    setShowApplyModal(true);
  };

  const handleAdminLogin = async (password: string) => {
    setIsLoggingIn(true);
    try {
      const response = await fetch(`${API_BASE_URL}/adminAuth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ pin: password.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        setIsAdminLoggedIn(true);
        setShowLoginModal(false);
        setView('admin');
        showToast("CURATOR ACCESS GRANTED", "success");
      } else {
        showToast(result.message || "INVALID CREDENTIALS", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("AUTHENTICATION SERVICE UNAVAILABLE", "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const exitPortal = () => {
    setView('landing');
    window.history.replaceState({}, '', '/');
  };

  // Detect Payment Status from URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    if (paymentStatus === 'success') {
      setView('payment-success');
    } else if (paymentStatus === 'fail' || paymentStatus === 'cancel') {
      setView('payment-fail');
    }
  }, []);

  // Render Admin View Directly (Bypasses MainLayout)
  if (view === 'admin' && isAdminLoggedIn) {
    return (
      <div className="relative">
        <AdminPage 
          onExit={() => setView('landing')} 
          applications={state.applications} 
          pagination={state.pagination}
          setApplications={state.setApplications} 
          fetchInquiriesFromApi={state.fetchInquiriesFromApi}
          fetchSessionsFromApi={state.fetchSessionsFromApi}
          fetchRoomsFromApi={state.fetchRoomsFromApi}
          fetchItineraryFromApi={state.fetchItineraryFromApi}
          fetchFaqsFromApi={state.fetchFaqsFromApi}
          fetchPortalConfigFromApi={state.fetchPortalConfigFromApi}
          savePortalConfigToApi={state.savePortalConfigToApi}
          saveFaqToApi={state.saveFaqToApi}
          deleteFaqFromApi={state.deleteFaqFromApi}
          saveItineraryToApi={state.saveItineraryToApi}
          saveSessionToApi={state.saveSessionToApi}
          deleteSessionFromApi={state.deleteSessionFromApi}
          deleteInquiryFromApi={state.deleteInquiryFromApi}
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
          showToast={showToast}
        />
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // Root Content Switcher
  const renderContent = () => {
    if (view === 'payment-success') {
      return <PaymentSuccessPage onReturn={() => setView('landing')} />;
    }
    if (view === 'payment-fail') {
      return <PaymentFailPage onReturn={() => setView('landing')} />;
    }
    if (view === 'portal' && state.activePortalGuest) {
      return (
        <PortalPage 
          guest={state.activePortalGuest} 
          session={state.sessions.find(s => s.id === state.activePortalGuest?.sessionId)} 
          room={state.rooms.find(r => r.id === state.activePortalGuest?.roomPreferenceId)} 
          portalConfig={state.portalConfig} 
        />
      );
    }
    return (
      <LandingPage 
        sessions={state.sessions} 
        rooms={state.rooms} 
        itinerary={state.itinerary} 
        faqs={state.faqs} 
        promoVideoUrl={state.portalConfig.promoVideoUrl} 
        onApplyClick={openApply} 
      />
    );
  };

  return (
    <MainLayout 
      isPortalView={view === 'portal'} 
      activePortalGuest={state.activePortalGuest} 
      onPortalClick={() => setView('portal')} 
      onAdminClick={() => setShowLoginModal(true)}
      onExitPortal={exitPortal}
    >
      {renderContent()}

      {/* Global Modals Controlled by App Router */}
      {showLoginModal && (
        <LoginModal 
          onLogin={handleAdminLogin} 
          onClose={() => setShowLoginModal(false)} 
          isLoading={isLoggingIn}
        />
      )}

      {showApplyModal && (
        <ApplyModal 
          sessions={state.sessions} 
          rooms={state.rooms} 
          initialSessionId={targetSessionId} 
          initialRoomId={targetRoomId}
          onSubmit={state.submitApplication} 
          onClose={() => setShowApplyModal(false)}
          showToast={showToast}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </MainLayout>
  );
};

export default App;

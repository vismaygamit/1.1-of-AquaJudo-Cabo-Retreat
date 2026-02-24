
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
  const hasFetchedPayment = React.useRef(false);
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = React.useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

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
        body: JSON.stringify({ pin: password.trim() }),
        credentials: 'include'
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
    state.setMagicLinkStatus('idle');
    window.history.replaceState({}, '', '/');
  };

  // Detect Payment Status from URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    if (paymentStatus === 'success') {
      setView('payment-success');
      if (sessionId && !hasFetchedPayment.current) {
        hasFetchedPayment.current = true;
        state.fetchPaymentDetails(sessionId);
      }
    } else if (paymentStatus === 'fail' || paymentStatus === 'cancel') {
      setView('payment-fail');
    }
  }, []);

  // Handle Magic Link Token
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const isAccessPath = window.location.pathname === '/booking/access';

    if (token && isAccessPath) {
      state.verifyMagicLink(token).then(success => {
        if (success) {
          setView('portal');
        }
      });
    }
  }, [state.verifyMagicLink]);

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
    if (state.magicLinkStatus === 'verifying') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-parchment">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-aqua-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone/40">Verifying Access...</p>
          </div>
        </div>
      );
    }

    if (state.magicLinkStatus === 'invalid') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-parchment p-6">
          <div className="bg-white p-12 rounded-[1rem] shadow-xl max-w-md w-full text-center space-y-6 border border-red-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-light uppercase tracking-tight text-stone">Link expired or invalid</h2>
              <p className="text-stone/50 text-sm">The access link you used is no longer valid. Please contact the estate curator for a new one.</p>
            </div>
            <button 
              onClick={() => {
                setView('landing');
                state.setMagicLinkStatus('idle');
                window.history.replaceState({}, '', '/');
              }}
              className="w-full py-4 bg-stone text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-aqua-primary hover:text-stone transition-all"
            >
              Return to Landing
            </button>
          </div>
        </div>
      );
    }

    if (view === 'payment-success') {
      return <PaymentSuccessPage onReturn={() => setView('landing')} paymentDetails={state.paymentDetails} showToast={showToast} />;
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
          itinerary={state.itinerary}
          onExit={exitPortal}
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

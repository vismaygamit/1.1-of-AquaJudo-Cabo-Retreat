
import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Plus, Trash2, Copy, Image as ImageIcon, CheckCircle2, XCircle, Clock, Upload, Film, MessageSquare, MapPin, Package, ShieldCheck, RefreshCw, Calendar, Home, Quote, ChevronLeft, ChevronRight, Save, AlertCircle, Loader2 } from 'lucide-react';
import { AdminSectionHeader, Logo } from '../components/Shared';
import { DeleteConfirmModal } from '../components/Modals';
import { ApplicationStatus, Room, Application } from '../types';
import { PaginationInfo } from '../hooks/useAppState';

interface AdminPageProps {
  onExit: () => void;
  applications: Application[];
  pagination: PaginationInfo | null;
  setApplications: any;
  fetchInquiriesFromApi: (page?: number, limit?: number, force?: boolean) => Promise<void>;
  fetchSessionsFromApi: (force?: boolean) => Promise<void>;
  fetchRoomsFromApi: (force?: boolean) => Promise<void>;
  saveSessionToApi: (session: any) => Promise<any>;
  deleteSessionFromApi: (id: string) => Promise<any>;
  rooms: Room[];
  setRooms: any;
  sessions: any[];
  setSessions: any;
  itinerary: any[];
  setItinerary: any;
  faqs: any[];
  setFaqs: any;
  portalConfig: any;
  setPortalConfig: any;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

type TabType = 'applications' | 'sessions' | 'rooms' | 'itinerary' | 'faqs' | 'portal';

const ITEMS_PER_PAGE = 5;

export const AdminPage: React.FC<AdminPageProps> = ({ 
  onExit, applications, pagination, setApplications, fetchInquiriesFromApi, fetchSessionsFromApi, fetchRoomsFromApi, saveSessionToApi, deleteSessionFromApi, rooms, setRooms, 
  sessions, setSessions, itinerary, setItinerary, 
  faqs, setFaqs, portalConfig, setPortalConfig, showToast
}) => {
  const [tab, setTab] = useState<TabType>('applications');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: TabType, label: string } | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Ref to track if we've done the initial load for the current tab
  const initialLoadDone = useRef<Record<string, boolean>>({});

  // Unified fetch logic for tabs
  useEffect(() => {
    if (!initialLoadDone.current[tab]) {
      if (tab === 'applications') {
        fetchInquiriesFromApi(1, ITEMS_PER_PAGE, false);
        initialLoadDone.current[tab] = true;
      } else if (tab === 'sessions') {
        fetchSessionsFromApi(false);
        initialLoadDone.current[tab] = true;
      } else if (tab === 'rooms') {
        fetchRoomsFromApi(false);
        initialLoadDone.current[tab] = true;
      }
    }
  }, [tab, fetchInquiriesFromApi, fetchSessionsFromApi, fetchRoomsFromApi]);

  const updateStorage = (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val));

  const handleStatusChange = (id: string, newStatus: ApplicationStatus) => {
    const next = applications.map(a => a.id === id ? { ...a, status: newStatus } : a);
    setApplications(next);
    updateStorage('aj_apps', next);
    showToast(`Inquiry status updated to ${newStatus.toUpperCase()}.`, 'success');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (tab === 'applications') {
        await fetchInquiriesFromApi(pagination?.page || 1, ITEMS_PER_PAGE, true);
      } else if (tab === 'sessions') {
        await fetchSessionsFromApi(true);
      } else if (tab === 'rooms') {
        await fetchRoomsFromApi(true);
      }
      showToast('Registry data synchronized with backend.', 'success');
    } catch (e) {
      showToast('Synchronization failed.', 'error');
    }
    setIsRefreshing(false);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const next = { ...portalConfig, promoVideoUrl: base64String };
        setPortalConfig(next);
        updateStorage('aj_portal_config', next);
        showToast('Portal promo video updated locally.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoomImageUpload = (roomId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const next = rooms.map(r => r.id === roomId ? { ...r, image: base64String } : r);
        setRooms(next);
        updateStorage('aj_rooms', next);
        showToast('Sanctuary visual updated locally.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs: TabType[] = ['applications', 'sessions', 'rooms', 'itinerary', 'faqs', 'portal'];

  const goToPage = (page: number) => {
    fetchInquiriesFromApi(page, ITEMS_PER_PAGE, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSessionErrors = (s: any) => {
    const errors: Record<string, string> = {};
    if (!s.startDate) errors.startDate = "Required";
    if (!s.endDate) errors.endDate = "Required";
    if (s.startDate && s.endDate && new Date(s.startDate) >= new Date(s.endDate)) {
      errors.endDate = "Must be after start date";
    }
    if (!s.maxGuests || s.maxGuests < 1) {
      errors.maxGuests = "Min 1";
    }
    return errors;
  };

  const handleSaveSession = async (s: any) => {
    const errors = getSessionErrors(s);
    if (Object.keys(errors).length > 0) {
      showToast('Validation errors must be corrected.', 'error');
      return;
    }

    setIsSaving(prev => ({ ...prev, [s.id]: true }));
    try {
      await saveSessionToApi(s);
      showToast('Residency window synchronized successfully.', 'success');
    } catch (e) {
      console.error(e);
      showToast('Synchronization failed. Backend service error.', 'error');
    } finally {
      setIsSaving(prev => ({ ...prev, [s.id]: false }));
    }
  };

  const handleConfirmedDelete = async () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;

    if (type === 'sessions') {
      const isLocalOnly = id.length < 15 && !isNaN(Number(id));
      if (isLocalOnly) {
        const next = sessions.filter(s => s.id !== id);
        setSessions(next);
        updateStorage('aj_sessions', next);
        showToast('Local draft discarded.', 'info');
        setDeleteTarget(null);
        return;
      }

      setIsSaving(prev => ({ ...prev, [id]: true }));
      try {
        await deleteSessionFromApi(id);
        showToast('Residency window purged from registry.', 'success');
      } catch (e) {
        console.error(e);
        showToast('Purge failed. Registry entry may already be removed.', 'error');
      } finally {
        setIsSaving(prev => ({ ...prev, [id]: false }));
        setDeleteTarget(null);
      }
    } else if (type === 'rooms') {
      const next = rooms.filter(r => r.id !== id);
      setRooms(next);
      updateStorage('aj_rooms', next);
      showToast('Sanctuary entry removed.', 'info');
      setDeleteTarget(null);
    } else if (type === 'faqs') {
      const next = faqs.filter(f => f.id !== id);
      setFaqs(next);
      updateStorage('aj_faqs', next);
      showToast('Intelligence entry removed.', 'info');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans text-stone">
      <aside className="w-full bg-[#faf9f6]/95 backdrop-blur-md text-stone p-6 flex items-center justify-between border-b border-stone/5 sticky top-0 z-[100]">
        <div className="flex items-center gap-4">
          <Logo className="w-10 h-10" />
          <div className="leading-tight">
            <h2 className="text-[10px] tracking-[0.5em] font-black uppercase">Registry Console</h2>
            <p className="text-[8px] tracking-[0.2em] font-bold text-aqua-primary uppercase opacity-70">Estate Management</p>
          </div>
        </div>
        <button onClick={onExit} className="px-6 py-2 bg-[#111] text-white rounded-full text-[10px] uppercase font-bold tracking-widest hover:bg-stone-light transition-all flex items-center gap-2 shadow-sm">
          <LogOut size={12} /> Exit Console
        </button>
      </aside>
      
      <main className="flex-1 p-8 md:p-16 max-w-6xl mx-auto w-full space-y-12 animate-reveal">
        {/* Navigation Tabs */}
        <div className="flex justify-center gap-8 border-b border-stone/5 pb-8 overflow-x-auto no-scrollbar">
           {tabs.map(t => (
             <button 
               key={t} 
               onClick={() => setTab(t)} 
               className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 px-4 py-2 whitespace-nowrap ${
                 tab === t 
                 ? 'text-aqua-primary bg-white rounded-full border border-aqua-primary/20 shadow-sm' 
                 : 'text-stone/30 hover:text-stone/50'
               }`}
             >
               {tab === t && <div className="w-1.5 h-1.5 rounded-full bg-aqua-primary" />}
               {t === 'portal' ? 'Portal Settings' : t}
             </button>
           ))}
        </div>

        {tab === 'applications' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase tracking-tight text-stone">GUEST INQUIRIES</h3>
                {pagination && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone/20">
                    Showing {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.total, pagination.page * pagination.limit)} of {pagination.total} Registry Entries
                  </p>
                )}
              </div>
              <button 
                onClick={handleRefresh}
                className={`p-3 rounded-full text-stone/40 hover:text-aqua-primary transition-all ${isRefreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCw size={18} />
              </button>
            </div>
            
            <div className="grid gap-8">
              {applications.length === 0 ? (
                <div className="p-20 text-center bg-white rounded-[3rem] border border-stone/5 border-dashed">
                  <p className="text-stone/20 font-black uppercase tracking-widest text-[10px]">No active inquiries</p>
                </div>
              ) : (
                <>
                  {applications.map(app => (
                    <div key={app.id} className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-stone/5 flex flex-col gap-10 shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="space-y-4">
                          <div className="flex items-center gap-5">
                            <p className="text-3xl font-black uppercase text-stone leading-none tracking-tight">{app.guestName}</p>
                            <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                              app.status === 'Approved' ? 'bg-[#e6f9f7] text-[#4fd1c5]' : 
                              app.status === 'Confirmed' ? 'bg-green-50 text-green-500' : 
                              'bg-stone/5 text-stone/30'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-stone/40 font-bold uppercase tracking-widest">
                            <span className="text-aqua-primary">{app.id}</span>
                            <span>{app.email}</span>
                            <span>{app.phone}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <button onClick={() => handleStatusChange(app.id, 'Approved')} className="px-6 py-4 bg-[#f9f9f9] text-stone rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#111] hover:text-white transition-all">APPROVE</button>
                          <button onClick={() => handleStatusChange(app.id, 'Declined')} className="px-6 py-4 bg-[#f9f9f9] text-stone rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">DECLINE</button>
                          <button onClick={() => handleStatusChange(app.id, 'Confirmed')} className="px-6 py-4
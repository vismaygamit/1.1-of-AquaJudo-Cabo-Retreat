
import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Plus, Trash2, Copy, Image as ImageIcon, CheckCircle2, XCircle, Clock, Upload, Film, MessageSquare, MapPin, Package, ShieldCheck, RefreshCw, Calendar, Home, Quote, ChevronLeft, ChevronRight, Save, AlertCircle, Loader2 } from 'lucide-react';
import { AdminSectionHeader, Logo } from '../components/Shared';
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
}

type TabType = 'applications' | 'sessions' | 'rooms' | 'itinerary' | 'faqs' | 'portal';

const ITEMS_PER_PAGE = 5;

export const AdminPage: React.FC<AdminPageProps> = ({ 
  onExit, applications, pagination, setApplications, fetchInquiriesFromApi, fetchSessionsFromApi, fetchRoomsFromApi, saveSessionToApi, rooms, setRooms, 
  sessions, setSessions, itinerary, setItinerary, 
  faqs, setFaqs, portalConfig, setPortalConfig 
}) => {
  const [tab, setTab] = useState<TabType>('applications');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
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
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (tab === 'applications') {
      await fetchInquiriesFromApi(pagination?.page || 1, ITEMS_PER_PAGE, true);
    } else if (tab === 'sessions') {
      await fetchSessionsFromApi(true);
    } else if (tab === 'rooms') {
      await fetchRoomsFromApi(true);
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
      alert('Please correct the validation errors before saving.');
      return;
    }

    setIsSaving(prev => ({ ...prev, [s.id]: true }));
    try {
      await saveSessionToApi(s);
      alert('Residency window synchronized with backend registry.');
    } catch (e) {
      console.error(e);
      alert('Sync failed. Backend service may be unreachable.');
    } finally {
      setIsSaving(prev => ({ ...prev, [s.id]: false }));
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
                          <button onClick={() => handleStatusChange(app.id, 'Confirmed')} className="px-6 py-4 bg-[#f9f9f9] text-stone rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">CONFIRM</button>
                          {(app.status === 'Approved' || app.status === 'Confirmed') && (
                            <button 
                              onClick={() => {
                                const link = `${window.location.origin}${window.location.pathname}?portal=${app.id}`;
                                navigator.clipboard.writeText(link);
                                alert('Portal magic link copied.');
                              }} 
                              className="px-8 py-4 bg-aqua-primary text-stone rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl"
                            >
                              <Copy size={14} /> MAGIC LINK
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="h-px bg-stone/5 w-full"></div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[10px] font-black text-stone/20 uppercase tracking-widest">
                            <Home size={12} /> Sanctuary Request
                          </div>
                          <p className="text-[15px] font-black uppercase text-stone tracking-tight">
                            {app.roomName || rooms.find(r => r.id === app.roomPreferenceId)?.name || 'ONYX SANCTUARY'}
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[10px] font-black text-stone/20 uppercase tracking-widest">
                            <Calendar size={12} /> Residency Window
                          </div>
                          <p className="text-[15px] font-black uppercase text-stone tracking-tight">
                            {app.residencyDate ? new Date(app.residencyDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'TBD'}
                          </p>
                        </div>
                        <div className="space-y-3 lg:col-span-1">
                          <div className="flex items-center gap-2 text-[10px] font-black text-stone/20 uppercase tracking-widest">
                            <Quote size={12} /> Narrative Preview
                          </div>
                          <p className="text-[13px] font-serif italic text-stone/40 line-clamp-2 leading-relaxed">
                            {app.healthNotes || "No background narrative provided."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination Controls */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-12 pb-20">
                      <button 
                        onClick={() => goToPage(Math.max(1, pagination.page - 1))}
                        disabled={pagination.page === 1}
                        className="w-12 h-12 rounded-full border border-stone/5 flex items-center justify-center text-stone/40 hover:text-stone hover:border-stone/20 disabled:opacity-20 disabled:hover:border-stone/5 transition-all"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      
                      <div className="flex items-center gap-2 px-4">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`w-10 h-10 rounded-full text-[10px] font-black transition-all ${
                              pagination.page === pageNum 
                              ? 'bg-[#111] text-white shadow-lg' 
                              : 'text-stone/30 hover:text-stone hover:bg-stone/5'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={() => goToPage(Math.min(pagination.totalPages, pagination.page + 1))}
                        disabled={pagination.page === pagination.totalPages}
                        className="w-12 h-12 rounded-full border border-stone/5 flex items-center justify-center text-stone/40 hover:text-stone hover:border-stone/20 disabled:opacity-20 disabled:hover:border-stone/5 transition-all"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {tab === 'rooms' && (
          <div className="space-y-8 animate-fade-in">
            <AdminSectionHeader title="Sanctuary Management" onAdd={() => {
              const newId = `room-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
              const next = [...rooms, { id: newId, name: "NEW SANCTUARY", basePrice: 5000, description: "", image: "", location: "Main Floor", bedType: "King Bed", maxOccupancy: 2, bathType: 'private' }];
              setRooms(next); updateStorage('aj_rooms', next);
            }}>
              <button 
                onClick={handleRefresh}
                className={`p-3 rounded-full text-stone/40 hover:text-aqua-primary transition-all ${isRefreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCw size={18} />
              </button>
            </AdminSectionHeader>
            <div className="space-y-10">
              {rooms.map((room, idx) => (
                <div key={room.id} className="bg-white p-10 rounded-[2.5rem] border border-stone/5 shadow-2xl shadow-stone/5 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <p className="text-[9px] font-black text-aqua-primary uppercase tracking-widest">Sanctuary ID: {room.id.toUpperCase()}</p>
                      <input value={room.name} onChange={e => {
                        const next = [...rooms]; next[idx].name = e.target.value;
                        setRooms(next);
                      }} className="text-3xl font-black uppercase tracking-tight text-stone w-full bg-transparent outline-none focus:text-aqua-primary" />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <label className="block text-[8px] font-black text-stone/20 uppercase tracking-widest mb-1">Base Price (USD)</label>
                        <input type="number" value={room.basePrice} onChange={e => {
                          const next = [...rooms]; next[idx].basePrice = parseInt(e.target.value);
                          setRooms(next);
                        }} className="bg-[#faf9f6] px-4 py-2 rounded-xl text-xl font-black text-stone outline-none border border-stone/5 w-32 text-center" />
                      </div>
                      <div className="flex flex-col gap-2 mt-4">
                        <button 
                          onClick={() => {
                            updateStorage('aj_rooms', rooms);
                            alert(`Sanctuary "${room.name}" configuration persisted.`);
                          }}
                          className="px-4 py-2 bg-[#111] text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-stone-light transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={12} /> Save
                        </button>
                        <button onClick={() => {
                          const next = rooms.filter(r => r.id !== room.id);
                          setRooms(next); updateStorage('aj_rooms', next);
                        }} className="p-2 text-stone/10 hover:text-red-500 transition-colors flex justify-center"><Trash2 size={18}/></button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[8px] font-black text-stone/20 uppercase tracking-widest">Description</label>
                      <textarea value={room.description} onChange={e => {
                        const next = [...rooms]; next[idx].description = e.target.value;
                        setRooms(next);
                      }} className="w-full bg-[#faf9f6] p-6 rounded-[1.5rem] border border-stone/5 text-[13px] font-serif italic text-stone/40 outline-none resize-none min-h-[180px]" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[8px] font-black text-stone/20 uppercase tracking-widest">Sanctuary Visual</label>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <input value={room.image || ''} onChange={e => {
                            const next = [...rooms]; next[idx].image = e.target.value;
                            setRooms(next);
                          }} className="flex-1 bg-[#faf9f6] px-4 py-3 rounded-xl text-[10px] border border-stone/5 outline-none font-serif italic text-stone/40" placeholder="Image URL" />
                          <input type="file" accept="image/*" className="hidden" ref={el => { fileInputRefs.current[room.id] = el; }} onChange={e => handleRoomImageUpload(room.id, e)} />
                          <button onClick={() => fileInputRefs.current[room.id]?.click()} className="bg-stone text-white px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-stone-light transition-all">
                             <Upload size={14}/>
                          </button>
                        </div>
                        <div className="aspect-[2/1] bg-[#faf9f6] rounded-[1.5rem] border border-stone/5 overflow-hidden shadow-inner">
                          {room.image ? <img src={room.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-5"><ImageIcon size={48}/></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'sessions' && (
          <div className="space-y-8 animate-fade-in">
            <AdminSectionHeader title="Residency Windows" onAdd={() => {
              const next = [...sessions, { id: Date.now().toString(), startDate: '2026-07-01', endDate: '2026-07-08', status: 'Open', maxGuests: 4 }];
              setSessions(next); updateStorage('aj_sessions', next);
            }}>
              <button 
                onClick={handleRefresh}
                className={`p-3 rounded-full text-stone/40 hover:text-aqua-primary transition-all ${isRefreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCw size={18} />
              </button>
            </AdminSectionHeader>
            <div className="grid gap-6">
              {sessions.map((s, idx) => {
                const sessionErrors = getSessionErrors(s);
                const hasErrors = Object.keys(sessionErrors).length > 0;
                const isLoading = isSaving[s.id];
                
                return (
                  <div key={s.id} className={`bg-white p-8 rounded-[2rem] border ${hasErrors ? 'border-red-100' : 'border-stone/5'} shadow-lg flex flex-col md:flex-row items-center gap-8 group transition-all`}>
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
                      <div className="space-y-2">
                        <label className="flex items-center justify-between text-[8px] font-black text-stone/20 uppercase tracking-widest">
                          Start Date
                          {sessionErrors.startDate && <span className="text-red-400 normal-case">{sessionErrors.startDate}</span>}
                        </label>
                        <input 
                          type="date" 
                          value={s.startDate} 
                          onChange={e => {
                            const next = [...sessions]; next[idx].startDate = e.target.value;
                            setSessions(next);
                          }} 
                          className={`w-full bg-[#faf9f6] p-4 rounded-xl border ${sessionErrors.startDate ? 'border-red-200 focus:border-red-400' : 'border-stone/5 focus:border-aqua-primary'} text-xs outline-none transition-colors`} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between text-[8px] font-black text-stone/20 uppercase tracking-widest">
                          End Date
                          {sessionErrors.endDate && <span className="text-red-400 normal-case">{sessionErrors.endDate}</span>}
                        </label>
                        <input 
                          type="date" 
                          value={s.endDate} 
                          onChange={e => {
                            const next = [...sessions]; next[idx].endDate = e.target.value;
                            setSessions(next);
                          }} 
                          className={`w-full bg-[#faf9f6] p-4 rounded-xl border ${sessionErrors.endDate ? 'border-red-200 focus:border-red-400' : 'border-stone/5 focus:border-aqua-primary'} text-xs outline-none transition-colors`} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between text-[8px] font-black text-stone/20 uppercase tracking-widest">
                          Capacity
                          {sessionErrors.maxGuests && <span className="text-red-400 normal-case">{sessionErrors.maxGuests}</span>}
                        </label>
                        <input 
                          type="number" 
                          value={s.maxGuests} 
                          min="1"
                          onChange={e => {
                            const next = [...sessions]; next[idx].maxGuests = parseInt(e.target.value);
                            setSessions(next);
                          }} 
                          className={`w-full bg-[#faf9f6] p-4 rounded-xl border ${sessionErrors.maxGuests ? 'border-red-200 focus:border-red-400' : 'border-stone/5 focus:border-aqua-primary'} text-xs outline-none text-center transition-colors`} 
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                      <button 
                        onClick={() => handleSaveSession(s)} 
                        disabled={hasErrors || isLoading}
                        className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2 ${
                          hasErrors || isLoading 
                          ? 'bg-stone/5 text-stone/20 cursor-not-allowed opacity-50' 
                          : 'bg-[#111] text-white hover:bg-stone-light'
                        }`}
                      >
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        SAVE
                      </button>
                      <button onClick={() => {
                        const next = sessions.filter(item => item.id !== s.id);
                        setSessions(next); updateStorage('aj_sessions', next);
                      }} className="p-4 text-stone/10 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'itinerary' && (
           <div className="space-y-8 animate-fade-in">
             <AdminSectionHeader title="Technical Pathway">
               <button 
                  onClick={() => {
                    updateStorage('aj_itinerary', itinerary);
                    alert('Full itinerary narrative saved successfully.');
                  }}
                  className="px-6 py-2.5 bg-aqua-primary text-stone rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                >
                  <Save size={14} /> Save Pathway
                </button>
             </AdminSectionHeader>
             <div className="space-y-6">
               {itinerary.map((day, idx) => (
                 <div key={day.day} className="bg-white p-10 rounded-[2.5rem] border border-stone/5 shadow-xl flex flex-col md:flex-row gap-8 items-start">
                   <div className="w-24 pt-3 flex flex-col items-center">
                     <span className="text-[12px] font-black text-aqua-primary uppercase tracking-[0.4em]">Day</span>
                     <span className="text-4xl font-black text-stone opacity-10 leading-none">0{day.day}</span>
                   </div>
                   <div className="flex-1 space-y-6">
                     <div className="space-y-2">
                       <label className="text-[8px] font-black text-stone/20 uppercase tracking-widest">Focus Title</label>
                       <input value={day.title} onChange={e => {
                         const next = [...itinerary]; next[idx].title = e.target.value;
                         setItinerary(next);
                       }} className="text-2xl font-black uppercase text-stone w-full bg-transparent outline-none focus:text-aqua-primary" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[8px] font-black text-stone/20 uppercase tracking-widest">Narrative Description</label>
                       <textarea value={day.desc} onChange={e => {
                         const next = [...itinerary]; next[idx].desc = e.target.value;
                         setItinerary(next);
                       }} className="w-full bg-[#faf9f6] p-6 rounded-2xl text-[14px] font-serif italic text-stone/60 outline-none resize-none min-h-[100px]" />
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {tab === 'faqs' && (
          <div className="space-y-8 animate-fade-in">
            <AdminSectionHeader title="Estate Intelligence" onAdd={() => {
              const next = [...faqs, { id: Date.now().toString(), q: "New Question?", a: "New Answer." }];
              setFaqs(next); updateStorage('aj_faqs', next);
            }} />
            <div className="grid gap-6">
              {faqs.map((faq, idx) => (
                <div key={faq.id} className="bg-white p-10 rounded-[2.5rem] border border-stone/5 shadow-lg space-y-6 group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-stone/20">Guest Inquiry</label>
                      <input value={faq.q} onChange={e => {
                        const next = [...faqs]; next[idx].q = e.target.value;
                        setFaqs(next);
                      }} className="text-[15px] font-black uppercase text-stone w-full bg-transparent outline-none border-b border-stone/5 pb-3 focus:border-aqua-primary" />
                    </div>
                    <div className="flex flex-col gap-2 pt-6">
                      <button 
                        onClick={() => {
                          updateStorage('aj_faqs', faqs);
                          alert('Intelligence entry updated.');
                        }}
                        className="p-2 bg-[#111] text-white rounded-lg hover:bg-stone-light transition-colors flex items-center justify-center"
                      >
                        <Save size={14} />
                      </button>
                      <button onClick={() => {
                        const next = faqs.filter(f => f.id !== faq.id);
                        setFaqs(next); updateStorage('aj_faqs', next);
                      }} className="text-stone/10 group-hover:text-red-500 transition-colors flex items-center justify-center"><Trash2 size={18}/></button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-stone/20">Official Response</label>
                    <textarea value={faq.a} onChange={e => {
                      const next = [...faqs]; next[idx].a = e.target.value;
                      setFaqs(next);
                    }} className="w-full bg-[#faf9f6] p-6 rounded-2xl text-[14px] font-serif italic text-stone/50 outline-none min-h-[80px] resize-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'portal' && (
          <div className="space-y-16 animate-fade-in pb-20">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase tracking-tight text-stone">Portal Settings</h3>
              <button 
                onClick={() => {
                  updateStorage('aj_portal_config', portalConfig);
                  alert('Global portal configuration has been synchronized.');
                }}
                className="px-10 py-3 bg-[#111] text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-aqua-primary hover:text-stone transition-all shadow-2xl flex items-center gap-3"
              >
                <Save size={16} /> Synchronize All Portal Settings
              </button>
            </div>

            {/* Estate Narrative Video */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-stone/5 shadow-2xl shadow-stone/5 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-aqua-primary/5 flex items-center justify-center text-aqua-primary">
                  <Film size={14} />
                </div>
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-stone/40">Estate Narrative Video</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-stone/20 uppercase tracking-widest">Video Source URL</label>
                    <input 
                      value={portalConfig.promoVideoUrl} 
                      onChange={e => {
                        const next = { ...portalConfig, promoVideoUrl: e.target.value };
                        setPortalConfig(next);
                      }}
                      className="w-full bg-[#faf9f6] px-6 py-4 rounded-xl border border-stone/5 text-xs font-serif italic text-stone/60 outline-none" 
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[8px] font-black text-stone/20 uppercase tracking-widest block">Upload Local Video</label>
                    <input type="file" accept="video/*" className="hidden" ref={videoInputRef} onChange={handleVideoUpload} />
                    <button 
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full bg-[#111] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-stone-light transition-all"
                    >
                      <Upload size={14} /> SELECT VIDEO FILE
                    </button>
                    <p className="text-[7px] text-stone/20 font-bold uppercase tracking-widest text-center italic">Storage limit: 2MB for local files. Use URLs for larger professional videos.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[8px] font-black text-stone/20 uppercase tracking-widest">Preview</label>
                  <div className="aspect-video bg-[#faf9f6] rounded-[1.5rem] border border-stone/5 overflow-hidden flex items-center justify-center shadow-inner">
                    {portalConfig.promoVideoUrl ? (
                      <video key={portalConfig.promoVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover">
                        <source src={portalConfig.promoVideoUrl} />
                      </video>
                    ) : (
                      <Film size={24} className="text-stone/5" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-stone/5 shadow-2xl shadow-stone/5 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-aqua-primary/5 flex items-center justify-center text-aqua-primary">
                  <MessageSquare size={14} />
                </div>
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-stone/40">Welcome Message</h4>
              </div>
              <textarea 
                value={portalConfig.welcomeParagraph}
                onChange={e => {
                  const next = { ...portalConfig, welcomeParagraph: e.target.value };
                  setPortalConfig(next);
                }}
                className="w-full bg-[#faf9f6] p-8 rounded-[1.5rem] border border-stone/5 text-[13px] font-serif italic text-stone/60 outline-none min-h-[120px] resize-none"
              />
            </div>

            {/* Arrival Logistics */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-stone/5 shadow-2xl shadow-stone/5 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-aqua-primary/5 flex items-center justify-center text-aqua-primary">
                  <MapPin size={14} />
                </div>
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-stone/40">Arrival Logistics</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-stone/20 uppercase tracking-widest">Estate Address</label>
                  <input 
                    value={portalConfig.logistics.address} 
                    onChange={e => {
                      const next = { ...portalConfig, logistics: { ...portalConfig.logistics, address: e.target.value } };
                      setPortalConfig(next);
                    }}
                    className="w-full bg-[#faf9f6] px-6 py-4 rounded-xl border border-stone/5 text-xs text-stone outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-stone/20 uppercase tracking-widest">Check-In Window</label>
                  <input 
                    value={portalConfig.logistics.checkInWindow} 
                    onChange={e => {
                      const next = { ...portalConfig, logistics: { ...portalConfig.logistics, checkInWindow: e.target.value } };
                      setPortalConfig(next);
                    }}
                    className="w-full bg-[#faf9f6] px-6 py-4 rounded-xl border border-stone/5 text-xs text-stone outline-none" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-stone/20 uppercase tracking-widest">Gated Access Instructions</label>
                <textarea 
                  value={portalConfig.logistics.gateInstructions}
                  onChange={e => {
                    const next = { ...portalConfig, logistics: { ...portalConfig.logistics, gateInstructions: e.target.value } };
                    setPortalConfig(next);
                  }}
                  className="w-full bg-[#faf9f6] p-8 rounded-[1.5rem] border border-stone/5 text-[13px] font-serif italic text-stone/60 outline-none min-h-[100px] resize-none"
                />
              </div>
            </div>

            {/* Packing Inventory */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-stone/5 shadow-2xl shadow-stone/5 space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-aqua-primary/5 flex items-center justify-center text-aqua-primary">
                    <Package size={14} />
                  </div>
                  <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-stone/40">Packing Inventory</h4>
                </div>
                <button 
                  onClick={() => {
                    const next = { ...portalConfig, packingList: [...portalConfig.packingList, "NEW ITEM"] };
                    setPortalConfig(next);
                  }}
                  className="bg-[#111] text-white px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-stone-light transition-all"
                >
                  <Plus size={10} /> Add Item
                </button>
              </div>
              <div className="space-y-3">
                {portalConfig.packingList.map((item: string, idx: number) => (
                  <div key={idx} className="flex gap-4 items-center group">
                    <input 
                      value={item} 
                      onChange={e => {
                        const nextList = [...portalConfig.packingList];
                        nextList[idx] = e.target.value;
                        const next = { ...portalConfig, packingList: nextList };
                        setPortalConfig(next);
                      }}
                      className="flex-1 bg-[#faf9f6] px-6 py-3 rounded-xl border border-stone/5 text-[11px] font-black uppercase tracking-widest text-stone outline-none focus:border-aqua-primary transition-all"
                    />
                    <button 
                      onClick={() => {
                        const nextList = portalConfig.packingList.filter((_: any, i: number) => i !== idx);
                        const next = { ...portalConfig, packingList: nextList };
                        setPortalConfig(next);
                      }}
                      className="p-2 text-stone/5 group-hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Registry Guidelines */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-stone/5 shadow-2xl shadow-stone/5 space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-aqua-primary/5 flex items-center justify-center text-aqua-primary">
                    <ShieldCheck size={14} />
                  </div>
                  <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-stone/40">Registry Guidelines</h4>
                </div>
                <button 
                  onClick={() => {
                    const next = { ...portalConfig, houseGuidelines: [...portalConfig.houseGuidelines, { title: "NEW GUIDELINE", desc: "Description here." }] };
                    setPortalConfig(next);
                  }}
                  className="bg-[#111] text-white px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-stone-light transition-all"
                >
                  <Plus size={10} /> Add Guideline
                </button>
              </div>
              <div className="space-y-6">
                {portalConfig.houseGuidelines.map((guideline: any, idx: number) => (
                  <div key={idx} className="bg-[#faf9f6] p-8 rounded-[1.5rem] border border-stone/5 relative group space-y-3">
                    <button 
                      onClick={() => {
                        const nextList = portalConfig.houseGuidelines.filter((_: any, i: number) => i !== idx);
                        const next = { ...portalConfig, houseGuidelines: nextList };
                        setPortalConfig(next);
                      }}
                      className="absolute top-8 right-8 text-stone/5 group-hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <input 
                      value={guideline.title} 
                      onChange={e => {
                        const nextList = [...portalConfig.houseGuidelines];
                        nextList[idx].title = e.target.value;
                        const next = { ...portalConfig, houseGuidelines: nextList };
                        setPortalConfig(next);
                      }}
                      className="bg-transparent text-[13px] font-black uppercase tracking-[0.1em] text-stone outline-none w-[80%] focus:text-aqua-primary transition-all"
                    />
                    <textarea 
                      value={guideline.desc} 
                      onChange={e => {
                        const nextList = [...portalConfig.houseGuidelines];
                        nextList[idx].desc = e.target.value;
                        const next = { ...portalConfig, houseGuidelines: nextList };
                        setPortalConfig(next);
                      }}
                      className="w-full bg-white p-4 rounded-xl border border-stone/5 text-[12px] font-serif italic text-stone/50 outline-none min-h-[60px] resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-stone/10 text-center py-20">Registry Interface End</p>
      </main>
    </div>
  );
};

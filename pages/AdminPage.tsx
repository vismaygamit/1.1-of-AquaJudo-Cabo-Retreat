
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
  
  const initialLoadDone = useRef<Record<string, boolean>>({});

  // Handle Tab Navigation and Immediate Data Fetching
  const handleTabClick = (t: TabType) => {
    setTab(t);
    
    if (t === 'applications') {
      fetchInquiriesFromApi(1, ITEMS_PER_PAGE, true);
      initialLoadDone.current[t] = true;
    } else if (t === 'sessions') {
      fetchSessionsFromApi(true);
      initialLoadDone.current[t] = true;
    } else if (t === 'rooms') {
      // Fetch rooms every time the tab is clicked to ensure fresh data
      fetchRoomsFromApi(true);
      initialLoadDone.current[t] = true;
    } else if (!initialLoadDone.current[t]) {
      // For other tabs, just mark as initially loaded
      initialLoadDone.current[t] = true;
    }
  };

  // Initial Load on mount for the default tab
  useEffect(() => {
    if (!initialLoadDone.current[tab]) {
      handleTabClick(tab);
    }
  }, []);

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
      showToast('Registry synchronized.', 'success');
    } catch (e) {
      showToast('Synchronization failed.', 'error');
    }
    setIsRefreshing(false);
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
        showToast('Residency window purged.', 'success');
      } catch (e) {
        showToast('Purge failed.', 'error');
      } finally {
        setIsSaving(prev => ({ ...prev, [id]: false }));
        setDeleteTarget(null);
      }
    } else if (type === 'rooms') {
      const next = rooms.filter(r => r.id !== id);
      setRooms(next);
      updateStorage('aj_rooms', next);
      showToast('Sanctuary removed.', 'info');
      setDeleteTarget(null);
    } else if (type === 'faqs') {
      const next = faqs.filter(f => f.id !== id);
      setFaqs(next);
      updateStorage('aj_faqs', next);
      showToast('Intelligence entry removed.', 'info');
      setDeleteTarget(null);
    }
  };

  const handleSaveSession = async (s: any) => {
    const errors: any = {};
    if (!s.startDate || !s.endDate) errors.dates = true;
    if (Object.keys(errors).length > 0) {
      showToast('Please verify all fields.', 'error');
      return;
    }

    setIsSaving(prev => ({ ...prev, [s.id]: true }));
    try {
      await saveSessionToApi(s);
      showToast('Residency window synchronized.', 'success');
    } catch (e) {
      showToast('Save failed.', 'error');
    } finally {
      setIsSaving(prev => ({ ...prev, [s.id]: false }));
    }
  };

  const tabs: TabType[] = ['applications', 'sessions', 'rooms', 'itinerary', 'faqs', 'portal'];
  const today = new Date().toISOString().split('T')[0];

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
        <div className="flex justify-center gap-8 border-b border-stone/5 pb-8 overflow-x-auto no-scrollbar">
           {tabs.map(t => (
             <button 
               key={t} 
               onClick={() => handleTabClick(t)} 
               className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 px-4 py-2 whitespace-nowrap ${tab === t ? 'text-aqua-primary bg-white rounded-full border border-aqua-primary/20 shadow-sm' : 'text-stone/30 hover:text-stone/50'}`}
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
                {pagination && <p className="text-[10px] font-black uppercase tracking-widest text-stone/20">Showing {applications.length} of {pagination.total} Entries</p>}
              </div>
              <button onClick={handleRefresh} className={`p-3 rounded-full text-stone/40 hover:text-aqua-primary transition-all ${isRefreshing ? 'animate-spin' : ''}`}>
                <RefreshCw size={18} />
              </button>
            </div>
            <div className="grid gap-8">
              {applications.length === 0 ? (
                <div className="p-20 text-center bg-white rounded-[3rem] border border-stone/5 border-dashed">
                  <p className="text-stone/20 font-black uppercase tracking-widest text-[10px]">No active inquiries found</p>
                </div>
              ) : (
                applications.map(app => (
                  <div key={app.id} className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-stone/5 flex flex-col gap-10 shadow-sm hover:shadow-xl transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-5">
                          <p className="text-3xl font-black uppercase text-stone leading-none tracking-tight">{app.guestName}</p>
                          <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${app.status === 'Approved' ? 'bg-[#e6f9f7] text-[#4fd1c5]' : 'bg-stone/5 text-stone/30'}`}>{app.status}</span>
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
                        <button onClick={() => {
                          const link = `${window.location.origin}${window.location.pathname}?portal=${app.id}`;
                          navigator.clipboard.writeText(link);
                          showToast('Magic link copied.', 'success');
                        }} className="px-8 py-4 bg-aqua-primary text-stone rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl">
                          <Copy size={14} /> MAGIC LINK
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === 'sessions' && (
          <div className="space-y-8 animate-fade-in">
            <AdminSectionHeader title="Residency Windows" onAdd={() => {
              const next = [...sessions, { id: Date.now().toString(), startDate: today, endDate: '', status: 'Open', maxGuests: 4 }];
              setSessions(next);
              showToast('Draft window added.', 'info');
            }} />
            <div className="grid gap-6">
              {sessions.map((s, idx) => (
                <div key={s.id} className="bg-white p-8 rounded-[2rem] border border-stone/5 shadow-lg flex flex-col md:flex-row items-center gap-8 group">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-stone/20 px-1">Start Date</label>
                      <input type="date" min={today} value={s.startDate} onChange={e => { const next = [...sessions]; next[idx].startDate = e.target.value; setSessions(next); }} className="w-full bg-[#faf9f6] p-4 rounded-xl border border-stone/5 text-xs outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-stone/20 px-1">End Date</label>
                      <input type="date" min={s.startDate || today} value={s.endDate} onChange={e => { const next = [...sessions]; next[idx].endDate = e.target.value; setSessions(next); }} className="w-full bg-[#faf9f6] p-4 rounded-xl border border-stone/5 text-xs outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-stone/20 px-1 text-center block">Max Guests</label>
                      <input type="number" min="1" value={s.maxGuests} onChange={e => { const next = [...sessions]; next[idx].maxGuests = parseInt(e.target.value); setSessions(next); }} className="w-full bg-[#faf9f6] p-4 rounded-xl border border-stone/5 text-xs outline-none text-center" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-4 md:pt-0">
                    <button onClick={() => handleSaveSession(s)} disabled={isSaving[s.id]} className="px-6 py-3 bg-[#111] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-stone-light transition-all shadow-md min-w-[80px] flex items-center justify-center">
                      {isSaving[s.id] ? <Loader2 size={14} className="animate-spin" /> : 'SAVE'}
                    </button>
                    <button onClick={() => setDeleteTarget({ id: s.id, type: 'sessions', label: `Residency starting ${s.startDate}` })} className="p-4 text-stone/10 hover:text-red-500 transition-all">
                      <Trash2 size={20}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'rooms' && (
          <div className="space-y-8 animate-fade-in">
            <AdminSectionHeader title="Sanctuaries" onAdd={() => {
              const next = [...rooms, { id: `room-${Date.now()}`, name: "NEW SANCTUARY", basePrice: 5000, description: "", location: "Main Floor", bedType: "King Bed", maxOccupancy: 2, bathType: 'private' }];
              setRooms(next);
              showToast('Draft sanctuary added.', 'info');
            }} />
            <div className="space-y-10">
              {rooms.map((room, idx) => (
                <div key={room.id} className="bg-white p-10 rounded-[2.5rem] border border-stone/5 shadow-xl space-y-8">
                  <div className="flex justify-between items-start">
                    <input value={room.name} onChange={e => { const next = [...rooms]; next[idx].name = e.target.value; setRooms(next); }} className="text-3xl font-black uppercase tracking-tight text-stone w-full bg-transparent outline-none focus:text-aqua-primary" />
                    <button onClick={() => setDeleteTarget({ id: room.id, type: 'rooms', label: room.name })} className="p-2 text-stone/10 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <textarea value={room.description} onChange={e => { const next = [...rooms]; next[idx].description = e.target.value; setRooms(next); }} className="w-full bg-[#faf9f6] p-6 rounded-[1.5rem] border border-stone/5 text-[13px] font-serif italic text-stone/40 outline-none resize-none min-h-[120px]" />
                    <div className="space-y-4">
                      <input type="number" value={room.basePrice} onChange={e => { const next = [...rooms]; next[idx].basePrice = parseInt(e.target.value); setRooms(next); }} className="bg-[#faf9f6] px-4 py-2 rounded-xl text-xl font-black text-stone outline-none border border-stone/5 w-full" />
                      <button onClick={() => { updateStorage('aj_rooms', rooms); showToast('Sanctuary updated locally.', 'success'); }} className="w-full py-4 bg-[#111] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">SAVE CHANGES</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'itinerary' && (
           <div className="space-y-8 animate-fade-in">
             <AdminSectionHeader title="Technical Pathway" />
             <div className="space-y-6">
               {itinerary.map((day, idx) => (
                 <div key={day.day} className="bg-white p-10 rounded-[2.5rem] border border-stone/5 shadow-xl flex flex-col md:flex-row gap-8 items-start">
                   <div className="w-24 pt-3 flex flex-col items-center">
                     <span className="text-4xl font-black text-stone opacity-10">0{day.day}</span>
                   </div>
                   <div className="flex-1 space-y-4">
                     <input value={day.title} onChange={e => { const next = [...itinerary]; next[idx].title = e.target.value; setItinerary(next); }} className="text-2xl font-black uppercase text-stone w-full bg-transparent outline-none" />
                     <textarea value={day.desc} onChange={e => { const next = [...itinerary]; next[idx].desc = e.target.value; setItinerary(next); }} className="w-full bg-[#faf9f6] p-6 rounded-2xl text-[14px] font-serif italic text-stone/60 outline-none resize-none" />
                   </div>
                 </div>
               ))}
               <button onClick={() => { updateStorage('aj_itinerary', itinerary); showToast('Pathway updated.', 'success'); }} className="w-full py-6 bg-aqua-primary text-stone rounded-full font-black uppercase tracking-widest shadow-xl">SYNCHRONIZE PATHWAY</button>
             </div>
           </div>
        )}

        {tab === 'faqs' && (
          <div className="space-y-8 animate-fade-in">
            <AdminSectionHeader title="Estate Intelligence" onAdd={() => { const next = [...faqs, { id: Date.now().toString(), q: "Question?", a: "Answer." }]; setFaqs(next); showToast('New FAQ added.', 'info'); }} />
            <div className="grid gap-6">
              {faqs.map((faq, idx) => (
                <div key={faq.id} className="bg-white p-10 rounded-[2.5rem] border border-stone/5 shadow-lg space-y-6">
                  <div className="flex justify-between items-start gap-4">
                    <input value={faq.q} onChange={e => { const next = [...faqs]; next[idx].q = e.target.value; setFaqs(next); }} className="text-[15px] font-black uppercase text-stone w-full bg-transparent border-b border-stone/5 pb-3 outline-none" />
                    <button onClick={() => setDeleteTarget({ id: faq.id, type: 'faqs', label: faq.q })} className="text-stone/10 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  </div>
                  <textarea value={faq.a} onChange={e => { const next = [...faqs]; next[idx].a = e.target.value; setFaqs(next); }} className="w-full bg-[#faf9f6] p-6 rounded-2xl text-[14px] font-serif italic text-stone/50 outline-none min-h-[80px]" />
                </div>
              ))}
              <button onClick={() => { updateStorage('aj_faqs', faqs); showToast('Intelligence updated.', 'success'); }} className="w-full py-6 bg-[#111] text-white rounded-full font-black uppercase tracking-widest">SAVE INTELLIGENCE</button>
            </div>
          </div>
        )}

        {tab === 'portal' && (
          <div className="space-y-12 animate-fade-in pb-20">
            <div className="bg-white p-10 rounded-[3rem] border border-stone/5 space-y-8 shadow-xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone/40">Portal Content Settings</h4>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-stone/20 px-2">Welcome Paragraph</label>
                  <textarea value={portalConfig.welcomeParagraph} onChange={e => setPortalConfig({...portalConfig, welcomeParagraph: e.target.value})} className="w-full bg-[#faf9f6] p-8 rounded-2xl border border-stone/5 text-sm font-serif italic text-stone/60 outline-none min-h-[120px]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-stone/20 px-2">Narrative Video URL</label>
                  <input value={portalConfig.promoVideoUrl} onChange={e => setPortalConfig({...portalConfig, promoVideoUrl: e.target.value})} className="w-full bg-[#faf9f6] px-8 py-4 rounded-xl border border-stone/5 text-xs font-serif italic text-stone/60 outline-none" />
                </div>
                <button onClick={() => { updateStorage('aj_portal_config', portalConfig); showToast('Portal settings synchronized.', 'success'); }} className="w-full py-5 bg-[#111] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">SAVE PORTAL SETTINGS</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <DeleteConfirmModal 
        isOpen={!!deleteTarget}
        title="Confirm Purge"
        description={`Are you sure you want to permanently remove "${deleteTarget?.label}"? This action cannot be reversed within the estate registry.`}
        isLoading={deleteTarget ? isSaving[deleteTarget.id] : false}
        onConfirm={handleConfirmedDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

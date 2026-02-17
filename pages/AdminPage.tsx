
import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Plus, Trash2, Copy, Image as ImageIcon, CheckCircle2, XCircle, Clock, Upload, Film, MessageSquare, MapPin, Package, ShieldCheck, RefreshCw, Calendar, Home, Quote, ChevronLeft, ChevronRight, Save, AlertCircle, Loader2, Video, X } from 'lucide-react';
import { DateTime } from 'luxon';
import { AdminSectionHeader, Logo } from '../components/Shared';
import { DeleteConfirmModal } from '../components/Modals';
import { ApplicationStatus, Room, Application } from '../types';
import { PaginationInfo } from '../hooks/useAppState';
import { API_BASE_URL } from '../constants';

interface AdminPageProps {
  onExit: () => void;
  applications: Application[];
  pagination: PaginationInfo | null;
  setApplications: any;
  fetchInquiriesFromApi: (page?: number, limit?: number, force?: boolean) => Promise<void>;
  fetchSessionsFromApi: (force?: boolean) => Promise<void>;
  fetchRoomsFromApi: (force?: boolean) => Promise<void>;
  fetchItineraryFromApi: (force?: boolean) => Promise<void>;
  fetchFaqsFromApi: (force?: boolean) => Promise<void>;
  fetchPortalConfigFromApi: (force?: boolean) => Promise<void>;
  savePortalConfigToApi: (config: any, videoFile?: File) => Promise<any>;
  saveFaqToApi: (faq: { id: string, q: string, a: string }) => Promise<any>;
  deleteFaqFromApi: (id: string) => Promise<any>;
  saveItineraryToApi: (days: any[]) => Promise<any>;
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

const formatRegistryDateText = (iso?: string) => {
  if (!iso) return 'TBD';
  try {
    const dt = DateTime.fromISO(iso, { zone: 'utc' });
    if (!dt.isValid) return 'TBD';
    return dt.toFormat('MMM dd, yyyy').toUpperCase();
  } catch (e) {
    return 'TBD';
  }
};

const formatRegistryDateForInput = (iso?: string) => {
  if (!iso) return '';
  try {
    if (iso.length === 10 && !iso.includes('T')) return iso;
    const dt = DateTime.fromISO(iso, { zone: 'utc' });
    return dt.isValid ? dt.toFormat('yyyy-MM-dd') : '';
  } catch (e) {
    return '';
  }
};

export const AdminPage: React.FC<AdminPageProps> = ({ 
  onExit, applications, pagination, setApplications, fetchInquiriesFromApi, fetchSessionsFromApi, fetchRoomsFromApi, fetchItineraryFromApi, fetchFaqsFromApi, fetchPortalConfigFromApi, savePortalConfigToApi, saveFaqToApi, deleteFaqFromApi, saveItineraryToApi, saveSessionToApi, deleteSessionFromApi, rooms, setRooms, 
  sessions, setSessions, itinerary, setItinerary, 
  faqs, setFaqs, portalConfig, setPortalConfig, showToast
}) => {
  const [tab, setTab] = useState<TabType>('applications');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: TabType, label: string } | null>(null);
  const [roomErrors, setRoomErrors] = useState<Record<string, boolean>>({});
  const [roomFiles, setRoomFiles] = useState<Record<string, File>>({});
  const [roomVideoFiles, setRoomVideoFiles] = useState<Record<string, File>>({});
  const [stagedVideoFile, setStagedVideoFile] = useState<File | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const videoInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  
  const initialLoadDone = useRef<Record<string, boolean>>({});

  const handleTabClick = (t: TabType) => {
    setTab(t);
    if (t === 'applications') {
      fetchInquiriesFromApi(1, ITEMS_PER_PAGE, true);
    } else if (t === 'sessions') {
      fetchSessionsFromApi(true);
    } else if (t === 'rooms') {
      fetchRoomsFromApi(true);
    } else if (t === 'itinerary') {
      fetchItineraryFromApi(true);
    } else if (t === 'faqs') {
      fetchFaqsFromApi(true);
    } else if (t === 'portal') {
      fetchPortalConfigFromApi(true);
    }
    initialLoadDone.current[t] = true;
  };

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
      } else if (tab === 'itinerary') {
        await fetchItineraryFromApi(true);
      } else if (tab === 'faqs') {
        await fetchFaqsFromApi(true);
      } else if (tab === 'portal') {
        await fetchPortalConfigFromApi(true);
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
      const isLocalOnly = id.startsWith('room-');
      if (isLocalOnly) {
        const next = rooms.filter(r => r.id !== id);
        setRooms(next);
        showToast('Local draft discarded.', 'info');
        setDeleteTarget(null);
        return;
      }
      setIsSaving(prev => ({ ...prev, [id]: true }));
      try {
        const response = await fetch(`${API_BASE_URL}/deleteRoom/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
          showToast(result.message || 'Sanctuary purged from registry.', 'success');
          await fetchRoomsFromApi(true);
        } else {
          throw new Error(result.message || 'Purge failed');
        }
      } catch (e) {
        showToast('Purge failed: Registry unreachable.', 'error');
      } finally {
        setIsSaving(prev => ({ ...prev, [id]: false }));
        setDeleteTarget(null);
      }
    } else if (type === 'faqs') {
      const isLocalOnly = id.length < 15 && !isNaN(Number(id));
      if (isLocalOnly) {
        const next = faqs.filter(f => f.id !== id);
        setFaqs(next);
        showToast('Local draft discarded.', 'info');
        setDeleteTarget(null);
        return;
      }
      setIsSaving(prev => ({ ...prev, [id]: true }));
      try {
        await deleteFaqFromApi(id);
        showToast('Intelligence entry purged.', 'success');
      } catch (e: any) {
        showToast(e.message || 'Purge failed.', 'error');
      } finally {
        setIsSaving(prev => ({ ...prev, [id]: false }));
        setDeleteTarget(null);
      }
    }
  };

  const handleSaveSession = async (s: any) => {
    if (!s.startDate || !s.endDate) {
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

  const handleSaveFaq = async (faq: any) => {
    if (!faq.q || !faq.a) {
      showToast('Both question and answer are required.', 'error');
      return;
    }
    setIsSaving(prev => ({ ...prev, [faq.id]: true }));
    try {
      await saveFaqToApi({ id: faq.id, q: faq.q, a: faq.a });
      showToast('Intelligence entry synchronized.', 'success');
    } catch (e) {
      showToast('Failed to synchronize intelligence.', 'error');
    } finally {
      setIsSaving(prev => ({ ...prev, [faq.id]: false }));
    }
  };

  const handleSaveRoom = async (idx: number) => {
    const room = rooms[idx];
    const isNew = room.id.startsWith('room-');
    const newErrors: Record<string, boolean> = { ...roomErrors };
    let hasError = false;

    if (!room.name || !room.name.trim()) {
      showToast('SANCTUARY NAME IS REQUIRED.', 'error');
      newErrors[`${room.id}-name`] = true;
      hasError = true;
    }
    if (!room.description || !room.description.trim()) {
      if (!hasError) showToast('TECHNICAL DESCRIPTION IS REQUIRED.', 'error');
      newErrors[`${room.id}-description`] = true;
      hasError = true;
    }
    if (!room.basePrice || room.basePrice <= 0) {
      if (!hasError) showToast('A VALID BASE PRICE IS REQUIRED.', 'error');
      newErrors[`${room.id}-basePrice`] = true;
      hasError = true;
    }
    if (isNew && !roomFiles[room.id]) {
      if (!hasError) showToast('A VISUAL ASSET (IMAGE) IS REQUIRED.', 'error');
      newErrors[`${room.id}-image`] = true;
      hasError = true;
    }

    setRoomErrors(newErrors);
    if (hasError) return;

    setIsSaving(prev => ({ ...prev, [room.id]: true }));
    try {
      const data = new FormData();
      data.append('name', room.name);
      data.append('price', room.basePrice.toString());
      data.append('description', room.description);
      
      const cleanArray = (arr?: string[]) => Array.from(new Set((arr || []).map(f => f.trim()).filter(f => f.length > 0)));
      data.append('facilities', JSON.stringify(cleanArray(room.facilities)));
      
      const file = roomFiles[room.id];
      if (file) data.append('image', file);
      const videoFile = roomVideoFiles[room.id];
      if (videoFile) data.append('video', videoFile);

      const url = isNew ? `${API_BASE_URL}/createRoom` : `${API_BASE_URL}/updateRoom/${room.id}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const response = await fetch(url, { method, body: data });
      const result = await response.json();

      if (result.success) {
        showToast(result.message || (isNew ? 'Sanctuary created' : 'Sanctuary updated'), 'success');
        setRoomFiles(prev => { const n = {...prev}; delete n[room.id]; return n; });
        setRoomVideoFiles(prev => { const n = {...prev}; delete n[room.id]; return n; });
        await fetchRoomsFromApi(true);
      } else {
        throw new Error(result.message || 'Registry error');
      }
    } catch (e: any) {
      showToast(e.message || 'Sync failed.', 'error');
    } finally {
      setIsSaving(prev => ({ ...prev, [room.id]: false }));
    }
  };

  const handleSyncItinerary = async () => {
    setIsSaving(prev => ({ ...prev, itinerary: true }));
    try {
      await saveItineraryToApi(itinerary);
      showToast('Technical Pathway synchronized.', 'success');
    } catch (e) {
      showToast('Failed to synchronize pathway.', 'error');
    } finally {
      setIsSaving(prev => ({ ...prev, itinerary: false }));
    }
  };

  const handleImageUpload = (roomId: string, file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      showToast('INVALID FORMAT.', 'error');
      return;
    }
    setRoomFiles(prev => ({ ...prev, [roomId]: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const next = rooms.map(r => r.id === roomId ? { ...r, image: base64String } : r);
      setRooms(next);
      setRoomErrors(prev => ({ ...prev, [`${roomId}-image`]: false }));
      showToast('Asset staged.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleRoomVideoUpload = (roomId: string, file: File) => {
    setRoomVideoFiles(prev => ({ ...prev, [roomId]: file }));
    const objectUrl = URL.createObjectURL(file);
    const next = rooms.map(r => r.id === roomId ? { ...r, video: objectUrl } : r);
    setRooms(next);
    showToast('Video staged.', 'info');
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStagedVideoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPortalConfig({ ...portalConfig, promoVideoUrl: objectUrl });
      showToast("Local video staged.", "info");
    }
  };

  const handleSavePortalConfig = async () => {
    setIsSaving(prev => ({ ...prev, portal: true }));
    try {
      await savePortalConfigToApi(portalConfig, stagedVideoFile || undefined);
      setStagedVideoFile(null);
      showToast('Portal settings synchronized.', 'success');
    } catch (e: any) {
      showToast('Failed to synchronize portal settings.', 'error');
    } finally {
      setIsSaving(prev => ({ ...prev, portal: false }));
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
                applications.map(app => {
                  const sLabel = formatRegistryDateText(app.sessionStartDate);
                  const eLabel = formatRegistryDateText(app.sessionEndDate);
                  const sessionRange = (sLabel !== 'TBD' && eLabel !== 'TBD') ? `${sLabel} — ${eLabel}` : 'DATES PENDING';
                  return (
                    <div key={app.id} className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-stone/5 flex flex-col gap-10 shadow-sm hover:shadow-xl transition-all">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="space-y-4">
                          <div className="flex items-center gap-5">
                            <p className="text-3xl font-black uppercase text-stone leading-none tracking-tight">{app.guestName}</p>
                            <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
                              app.status === 'Approved' ? 'bg-aqua-primary/10 text-aqua-primary' : 
                              app.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-stone/5 text-stone/30'
                            }`}>{app.status}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-stone/40 font-bold uppercase tracking-widest items-center">
                            <span className="text-aqua-primary font-black">{app.id}</span>
                            {app.roomName && <span className="text-stone font-black italic">{app.roomName.toUpperCase()}</span>}
                            <span className="flex items-center gap-2 text-stone font-black bg-[#faf9f6] px-4 py-1.5 rounded-full shadow-sm">
                              <Calendar size={12} className="text-aqua-primary" />
                              {sessionRange}
                            </span>
                            <span>{app.email}</span>
                            <span>{app.phone}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <button onClick={() => handleStatusChange(app.id, 'Pending')} className="px-6 py-4 bg-[#f9f9f9] text-stone rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-sm">PENDING</button>
                          <button onClick={() => handleStatusChange(app.id, 'Approved')} className="px-6 py-4 bg-[#f9f9f9] text-stone rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#111] hover:text-white transition-all shadow-sm">APPROVE</button>
                          <button onClick={() => handleStatusChange(app.id, 'Declined')} className="px-6 py-4 bg-[#f9f9f9] text-stone rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm">DECLINE</button>
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
                  );
                })
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
            <div className="grid gap-8">
              {sessions.map((s, idx) => {
                const sLabelText = formatRegistryDateText(s.startDate);
                const eLabelText = formatRegistryDateText(s.endDate);
                const localizedRangeText = (sLabelText !== 'TBD' && eLabelText !== 'TBD') ? `${sLabelText} — ${eLabelText}` : 'RESIDENCY WINDOW DRAFT';
                return (
                  <div key={s.id} className="bg-white p-10 rounded-[3rem] border border-stone/5 shadow-xl flex flex-col gap-8 group">
                    <div className="flex items-center gap-3 pb-4 border-b border-stone/5">
                      <Calendar size={18} className="text-aqua-primary" />
                      <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-stone">{localizedRangeText}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-stone/20 px-1">Start Date</label>
                        <input 
                          type="date" 
                          value={formatRegistryDateForInput(s.startDate)} 
                          onChange={e => { const n = [...sessions]; n[idx].startDate = e.target.value; setSessions(n); }} 
                          className="w-full bg-[#faf9f6] p-5 rounded-2xl border border-stone/5 text-xs outline-none focus:border-aqua-primary/40 transition-all font-sans" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-stone/20 px-1">End Date</label>
                        <input 
                          type="date" 
                          value={formatRegistryDateForInput(s.endDate)} 
                          onChange={e => { const n = [...sessions]; n[idx].endDate = e.target.value; setSessions(n); }} 
                          className="w-full bg-[#faf9f6] p-5 rounded-2xl border border-stone/5 text-xs outline-none focus:border-aqua-primary/40 transition-all font-sans" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-stone/20 px-1 text-center block">Max Guests</label>
                        <input 
                          type="number" 
                          min="1" 
                          value={s.maxGuests} 
                          onChange={e => { const n = [...sessions]; n[idx].maxGuests = parseInt(e.target.value) || 0; setSessions(n); }} 
                          className="w-full bg-[#faf9f6] p-5 rounded-2xl border border-stone/5 text-xs outline-none text-center focus:border-aqua-primary/40 transition-all font-sans" 
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <button onClick={() => setDeleteTarget({ id: s.id, type: 'sessions', label: localizedRangeText })} className="p-4 text-stone/10 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                        <Trash2 size={22}/>
                      </button>
                      <button onClick={() => handleSaveSession(s)} disabled={isSaving[s.id]} className="px-10 py-4 bg-[#111] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-aqua-primary transition-all shadow-xl min-w-[120px] flex items-center justify-center gap-2">
                        {isSaving[s.id] ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        SYNCHRONIZE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'rooms' && (
          <div className="space-y-10 animate-fade-in">
            <AdminSectionHeader title="Sanctuaries" onAdd={() => {
              const next = [...rooms, { id: `room-${Date.now()}`, name: "", basePrice: 0, description: "", image: "", location: "Estate Wing", bedType: "Restorative Sanctuary", maxOccupancy: 2, bathType: 'private', facilities: [] }];
              setRooms(next);
              showToast('Draft sanctuary added.', 'info');
            }} />
            <div className="space-y-12">
              {rooms.map((room, idx) => {
                const isNew = room.id.startsWith('room-');
                const hasNameError = roomErrors[`${room.id}-name`];
                const hasDescError = roomErrors[`${room.id}-description`];
                const hasPriceError = roomErrors[`${room.id}-basePrice`];
                const hasImageError = roomErrors[`${room.id}-image`];
                const isRoomSaving = isSaving[room.id];
                return (
                  <div key={room.id} className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-stone/5 shadow-2xl space-y-12 group transition-all hover:shadow-aqua-primary/5">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                      <div className="flex-1 space-y-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <input 
                              value={room.name} 
                              disabled={isRoomSaving}
                              onChange={e => { 
                                const n = [...rooms]; n[idx].name = e.target.value; setRooms(n);
                                if (e.target.value.trim()) setRoomErrors(p => ({ ...p, [`${room.id}-name`]: false }));
                              }} 
                              className={`text-3xl md:text-4xl font-black uppercase tracking-tight text-stone w-full bg-transparent border-b-2 outline-none focus:text-aqua-primary transition-colors ${hasNameError ? 'border-red-400 text-red-500' : 'border-transparent'}`} 
                              placeholder="Sanctuary Name *"
                              required
                            />
                            <button 
                              disabled={isRoomSaving}
                              onClick={() => setDeleteTarget({ id: room.id, type: 'rooms', label: room.name || 'Unnamed Sanctuary' })} 
                              className="p-3 text-stone/10 hover:text-red-500 hover:bg-red-50 rounded-full transition-all disabled:opacity-30"
                            >
                              <Trash2 size={22}/>
                            </button>
                          </div>
                          <textarea 
                            value={room.description} 
                            disabled={isRoomSaving}
                            onChange={e => { 
                              const n = [...rooms]; n[idx].description = e.target.value; setRooms(n);
                              if (e.target.value.trim()) setRoomErrors(p => ({ ...p, [`${room.id}-description`]: false }));
                            }} 
                            className={`w-full bg-[#faf9f6] p-8 rounded-[2rem] border text-[15px] font-serif italic text-stone/60 outline-none resize-none min-h-[140px] leading-relaxed ${hasDescError ? 'border-red-400 bg-red-50/10' : 'border-stone/5'}`} 
                            placeholder="Provide a technical description... *"
                            required
                          />
                        </div>

                        {/* Facilities Management Section - Dynamic Array textboxes */}
                        <div className="space-y-6">
                          <div className="flex items-center justify-between border-b border-stone/5 pb-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-aqua-primary">SANCTUARY HIGHLIGHTS (FACILITIES)</p>
                            <button 
                              disabled={isRoomSaving}
                              onClick={() => {
                                const n = [...rooms];
                                n[idx].facilities = [...(n[idx].facilities || []), ""];
                                setRooms(n);
                                showToast('New facility textbox added.', 'info');
                              }}
                              className="text-[10px] font-black uppercase text-aqua-primary hover:text-aqua-deep transition-all flex items-center gap-2"
                            >
                              <Plus size={12} /> ADD FACILITY
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(room.facilities || []).map((fac, fIdx) => (
                              <div key={`fac-${fIdx}`} className="flex items-center gap-2 group/fac animate-fade-in">
                                <div className="flex-1">
                                  <input 
                                    value={fac}
                                    disabled={isRoomSaving}
                                    onChange={e => {
                                      const n = [...rooms];
                                      const nFacs = [...(n[idx].facilities || [])];
                                      nFacs[fIdx] = e.target.value;
                                      n[idx].facilities = nFacs;
                                      setRooms(n);
                                    }}
                                    placeholder={`Facility Item ${fIdx + 1}`}
                                    className="w-full bg-[#faf9f6] px-5 py-3 rounded-xl border border-stone/5 text-[11px] font-bold uppercase tracking-widest text-stone outline-none focus:border-aqua-primary/30 transition-all shadow-sm"
                                  />
                                </div>
                                <button 
                                  disabled={isRoomSaving}
                                  onClick={() => {
                                    const n = [...rooms];
                                    n[idx].facilities = n[idx].facilities?.filter((_, i) => i !== fIdx);
                                    setRooms(n);
                                    showToast('Facility textbox removed.', 'info');
                                  }}
                                  className="p-3 text-stone/10 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                            {(room.facilities || []).length === 0 && (
                              <p className="col-span-full text-[10px] font-serif italic text-stone/20 py-4 text-center border border-dashed border-stone/5 rounded-xl">No facilities added (length wise textboxes will appear here).</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-80 space-y-6">
                        <div className="space-y-2">
                          <p className="text-[8px] font-black uppercase tracking-widest text-stone/10 px-1">Image Asset *</p>
                          <div className={`aspect-[4/3] rounded-[2.5rem] bg-[#faf9f6] overflow-hidden border relative group/img shadow-inner transition-all ${hasImageError ? 'border-red-400 ring-4 ring-red-400/10' : 'border-stone/5'}`}>
                            {room.image ? (
                              <img src={room.image} className="w-full h-full object-cover opacity-90" alt={room.name} />
                            ) : (
                              <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${hasImageError ? 'text-red-400' : 'text-stone/10'}`}>
                                <ImageIcon size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Image Req.</span>
                              </div>
                            )}
                            <input 
                              type="file" 
                              disabled={isRoomSaving}
                              ref={el => { fileInputRefs.current[room.id] = el; }}
                              className="hidden" 
                              accept=".jpg,.jpeg,.png"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(room.id, file);
                              }}
                            />
                            <button 
                              disabled={isRoomSaving}
                              onClick={() => fileInputRefs.current[room.id]?.click()}
                              className="absolute inset-0 bg-stone/20 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center disabled:hidden"
                            >
                               <div className="p-4 bg-white rounded-full shadow-xl">
                                  <Upload size={20} className="text-stone" />
                               </div>
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[8px] font-black uppercase tracking-widest text-stone/10 px-1">Video Asset</p>
                          <div className="aspect-video rounded-[2rem] bg-[#faf9f6] overflow-hidden border relative group/video shadow-inner border-stone/5">
                            {room.video ? (
                              <video key={room.video} src={room.video} className="w-full h-full object-cover opacity-80" muted playsInline loop autoPlay />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone/10">
                                <Video size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Add Video</span>
                              </div>
                            )}
                            <input 
                              type="file" 
                              disabled={isRoomSaving}
                              ref={el => { videoInputRefs.current[room.id] = el; }}
                              className="hidden" 
                              accept="video/*"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleRoomVideoUpload(room.id, file);
                              }}
                            />
                            <button 
                              disabled={isRoomSaving}
                              onClick={() => videoInputRefs.current[room.id]?.click()}
                              className="absolute inset-0 bg-stone/20 opacity-0 group-hover/video:opacity-100 transition-all flex items-center justify-center disabled:hidden"
                            >
                               <div className="p-4 bg-white rounded-full shadow-xl">
                                  <Upload size={20} className="text-stone" />
                               </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 max-w-xs">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-stone/20 px-1">Base Price (USD) *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/30 font-black">$</span>
                          <input 
                            type="number" 
                            disabled={isRoomSaving}
                            value={room.basePrice} 
                            onChange={e => { 
                              const n = [...rooms]; n[idx].basePrice = parseInt(e.target.value) || 0; setRooms(n); 
                              if (parseInt(e.target.value) > 0) setRoomErrors(p => ({ ...p, [`${room.id}-basePrice`]: false }));
                            }} 
                            className={`w-full bg-[#faf9f6] pl-8 pr-4 py-4 rounded-2xl border text-lg font-black text-stone outline-none focus:border-aqua-primary/40 transition-all shadow-sm ${hasPriceError ? 'border-red-400 bg-red-50/10' : 'border-stone/5'}`} 
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 flex justify-end">
                      <button 
                        disabled={isRoomSaving}
                        onClick={() => handleSaveRoom(idx)} 
                        className={`px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl transition-all flex items-center gap-3 active:scale-[0.98] ${isNew ? 'bg-aqua-primary text-stone hover:bg-aqua-deep hover:text-white' : 'bg-[#111] text-white hover:bg-aqua-primary hover:text-stone'} disabled:opacity-50`}
                      >
                        {isRoomSaving ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Synchronizing...
                          </>
                        ) : (
                          <>
                            <Save size={16} /> {isNew ? 'Add Sanctuary' : 'Update Sanctuary'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
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
                     <input value={day.title} onChange={e => { const n = [...itinerary]; n[idx].title = e.target.value; setItinerary(n); }} className="text-2xl font-black uppercase text-stone w-full bg-transparent outline-none" />
                     <textarea value={day.desc} onChange={e => { const n = [...itinerary]; n[idx].desc = e.target.value; setItinerary(n); }} className="w-full bg-[#faf9f6] p-6 rounded-2xl text-[14px] font-serif italic text-stone/60 outline-none resize-none" />
                   </div>
                 </div>
               ))}
               <button 
                onClick={handleSyncItinerary} 
                disabled={isSaving.itinerary}
                className="w-full py-6 bg-aqua-primary text-stone rounded-full font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-aqua-deep hover:text-white transition-all disabled:opacity-50"
               >
                 {isSaving.itinerary ? <Loader2 size={18} className="animate-spin" /> : 'SYNCHRONIZE PATHWAY'}
               </button>
             </div>
           </div>
        )}

        {tab === 'faqs' && (
          <div className="space-y-8 animate-fade-in">
            <AdminSectionHeader title="Estate Intelligence" onAdd={() => { const next = [...faqs, { id: Date.now().toString(), q: "Question?", a: "Answer." }]; setFaqs(next); showToast('Draft added.', 'info'); }} />
            <div className="grid gap-6">
              {faqs.map((faq, idx) => {
                const isItemSaving = isSaving[faq.id];
                const isNew = faq.id.length < 15 && !isNaN(Number(faq.id));
                return (
                  <div key={faq.id} className="bg-white p-10 rounded-[2.5rem] border border-stone/5 shadow-lg space-y-6 group">
                    <div className="flex justify-between items-start gap-4">
                      <input value={faq.q} onChange={e => { const n = [...faqs]; n[idx].q = e.target.value; setFaqs(n); }} className="text-[15px] font-black uppercase text-stone w-full bg-transparent border-b border-stone/5 pb-3 outline-none focus:border-aqua-primary/30" />
                      <button onClick={() => setDeleteTarget({ id: faq.id, type: 'faqs', label: faq.q })} className="p-2 text-stone/10 hover:text-red-400 transition-colors"><Trash2 size={18}/></button>
                    </div>
                    <textarea value={faq.a} onChange={e => { const n = [...faqs]; n[idx].a = e.target.value; setFaqs(n); }} className="w-full bg-[#faf9f6] p-6 rounded-2xl text-[14px] font-serif italic text-stone/50 outline-none min-h-[80px]" />
                    <div className="pt-2 flex justify-end">
                      <button onClick={() => handleSaveFaq(faq)} disabled={isItemSaving} className="px-8 py-3 bg-aqua-primary text-stone rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-aqua-deep hover:text-white transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                        {isItemSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {isNew ? 'Sync to Registry' : 'SAVE CHANGES'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'portal' && (
          <div className="space-y-12 animate-fade-in pb-20">
            <h3 className="text-4xl font-black uppercase tracking-tight text-stone">PORTAL SETTINGS</h3>
            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-stone/5 space-y-16 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-aqua-primary opacity-20"></div>
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <Video size={18} className="text-aqua-primary" />
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone/20">ESTATE NARRATIVE VIDEO</h5>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-stone/10 px-1">VIDEO SOURCE URL</label>
                      <input value={portalConfig.promoVideoUrl} onChange={e => setPortalConfig({...portalConfig, promoVideoUrl: e.target.value})} className="w-full bg-[#faf9f6] px-6 py-4 rounded-xl border border-stone/5 text-xs font-sans outline-none focus:border-aqua-primary/30 transition-all" />
                    </div>
                    <div className="space-y-4">
                      <p className="text-[8px] font-black uppercase tracking-widest text-stone/10 px-1">UPLOAD LOCAL VIDEO</p>
                      <input type="file" ref={videoFileInputRef} onChange={handleVideoFileChange} accept="video/*" className="hidden" />
                      <button onClick={() => videoFileInputRef.current?.click()} className="w-full py-4 bg-[#111] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-stone-light transition-all">
                        <Upload size={14} /> SELECT VIDEO FILE
                      </button>
                    </div>
                  </div>
                  <div className="aspect-video bg-[#faf9f6] rounded-[2rem] border border-stone/5 overflow-hidden flex items-center justify-center relative">
                    {portalConfig.promoVideoUrl ? (
                      <video key={portalConfig.promoVideoUrl} className="w-full h-full object-cover opacity-80" muted playsInline loop autoPlay>
                        <source src={portalConfig.promoVideoUrl} />
                      </video>
                    ) : (
                      <Video size={32} className="text-stone/5" />
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MessageSquare size={16} className="text-aqua-primary" />
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone/20">WELCOME MESSAGE</h5>
                </div>
                <textarea value={portalConfig.welcomeParagraph} onChange={e => setPortalConfig({...portalConfig, welcomeParagraph: e.target.value})} className="w-full bg-[#faf9f6] p-10 rounded-[2.5rem] border border-stone/5 text-sm font-serif italic text-stone/50 outline-none min-h-[140px] leading-relaxed resize-none focus:border-aqua-primary/30 transition-all shadow-inner" />
              </div>
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-aqua-primary" />
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone/20">ARRIVAL LOGISTICS</h5>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-stone/10 px-1">ESTATE ADDRESS</label>
                    <input value={portalConfig.logistics.address} onChange={e => setPortalConfig({...portalConfig, logistics: {...portalConfig.logistics, address: e.target.value}})} className="w-full bg-[#faf9f6] px-6 py-4 rounded-xl border border-stone/5 text-xs outline-none focus:border-aqua-primary/30 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-stone/10 px-1">CHECK-IN WINDOW</label>
                    <input value={portalConfig.logistics.checkInWindow} onChange={e => setPortalConfig({...portalConfig, logistics: {...portalConfig.logistics, checkInWindow: e.target.value}})} className="w-full bg-[#faf9f6] px-6 py-4 rounded-xl border border-stone/5 text-xs outline-none focus:border-aqua-primary/30 transition-all" />
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package size={16} className="text-aqua-primary" />
                    <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone/20">PACKING INVENTORY</h5>
                  </div>
                  <button onClick={() => setPortalConfig({...portalConfig, packingList: [...portalConfig.packingList, 'New Item']})} className="px-6 py-2 bg-[#111] text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-md">
                    <Plus size={12} /> ADD ITEM
                  </button>
                </div>
                <div className="space-y-3">
                  {portalConfig.packingList.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="flex-1 bg-[#faf9f6] px-8 py-4 rounded-2xl border border-stone/5 shadow-sm transition-all group-hover:border-stone/10">
                        <input value={item} onChange={e => { const n = [...portalConfig.packingList]; n[idx] = e.target.value; setPortalConfig({...portalConfig, packingList: n}); }} className="w-full bg-transparent text-[11px] font-black uppercase tracking-widest text-stone outline-none" />
                      </div>
                      <button onClick={() => { const n = portalConfig.packingList.filter((_: any, i: number) => i !== idx); setPortalConfig({...portalConfig, packingList: n}); }} className="p-3 text-stone/10 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-10 flex flex-col items-center gap-6">
                <button onClick={handleSavePortalConfig} disabled={isSaving.portal} className="w-full max-w-md py-6 bg-aqua-primary text-stone rounded-full font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-aqua-deep hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                  {isSaving.portal ? <Loader2 className="animate-spin" size={20} /> : 'SYNCHRONIZE PORTAL SETTINGS'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <DeleteConfirmModal isOpen={!!deleteTarget} title="Confirm Purge" description={`Are you sure you want to permanently remove "${deleteTarget?.label}"?`} isLoading={deleteTarget ? isSaving[deleteTarget.id] : false} onConfirm={handleConfirmedDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Plus, Trash2, Copy, Image as ImageIcon, CheckCircle2, XCircle, Clock, Upload, Film, MessageSquare, MapPin, Package, ShieldCheck, RefreshCw, Calendar, Home, Quote, ChevronLeft, ChevronRight, Save, AlertCircle, Loader2, Video } from 'lucide-react';
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
  const [roomImageFiles, setRoomImageFiles] = useState<Record<string, File>>({});
  const [roomVideoFiles, setRoomVideoFiles] = useState<Record<string, File>>({});
  const [stagedVideoFile, setStagedVideoFile] = useState<File | null>(null);
  
  const imageInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
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
      if (typeof fetchPortalConfigFromApi === 'function') {
        fetchPortalConfigFromApi(true);
      }
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
        setSessions(sessions.filter(s => s.id !== id));
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
        setRooms(rooms.filter(r => r.id !== id));
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
        setFaqs(faqs.filter(f => f.id !== id));
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
      newErrors[`${room.id}-description`] = true;
      hasError = true;
    }
    if (!room.basePrice || room.basePrice <= 0) {
      newErrors[`${room.id}-basePrice`] = true;
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
      
      const imgFile = roomImageFiles[room.id];
      if (imgFile) data.append('image', imgFile);
      
      const vidFile = roomVideoFiles[room.id];
      if (vidFile) data.append('video', vidFile);

      const url = isNew ? `${API_BASE_URL}/createRoom` : `${API_BASE_URL}/updateRoom/${room.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const response = await fetch(url, { method, body: data });
      const result = await response.json();
      if (result.success) {
        showToast(result.message || (isNew ? 'Sanctuary added.' : 'Sanctuary updated.'), 'success');
        setRoomImageFiles(prev => { const n = { ...prev }; delete n[room.id]; return n; });
        setRoomVideoFiles(prev => { const n = { ...prev }; delete n[room.id]; return n; });
        await fetchRoomsFromApi(true);
      } else {
        throw new Error(result.message || 'Operation failed');
      }
    } catch (e) {
      showToast('Network error: Sanctuary could not be synchronized.', 'error');
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

  const handleRoomImageUpload = (roomId: string, file: File) => {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('IMAGE FILE TOO LARGE. MAXIMUM SIZE IS 5MB.', 'error');
      return;
    }
    setRoomImageFiles(prev => ({ ...prev, [roomId]: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      const next = rooms.map(r => r.id === roomId ? { ...r, image: reader.result as string } : r);
      setRooms(next);
      showToast('Image staged for sync.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleRoomVideoUpload = (roomId: string, file: File) => {
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('VIDEO FILE TOO LARGE. MAXIMUM SIZE IS 100MB.', 'error');
      return;
    }
    setRoomVideoFiles(prev => ({ ...prev, [roomId]: file }));
    const objectUrl = URL.createObjectURL(file);
    const next = rooms.map(r => r.id === roomId ? { ...r, video: objectUrl } : r);
    setRooms(next);
    showToast('Video staged for preview.', 'info');
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        showToast("FILE EXCEEDS 100MB LIMIT.", "error");
        return;
      }
      setStagedVideoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPortalConfig({ ...portalConfig, promoVideoUrl: objectUrl });
    }
  };

  const handleSavePortalConfig = async () => {
    setIsSaving(prev => ({ ...prev, portal: true }));
    try {
      if (typeof savePortalConfigToApi === 'function') {
        await savePortalConfigToApi(portalConfig, stagedVideoFile || undefined);
        setStagedVideoFile(null);
        showToast('Portal settings synchronized.', 'success');
      }
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
        <div className="flex items-center gap-4">
           {tab === 'rooms' && (
             <button 
              onClick={() => {
                const next = [...rooms, { id: `room-${Date.now()}`, name: "", basePrice: 0, description: "", image: "", location: "Estate", bedType: "Foundational Sanctuary", maxOccupancy: 2, bathType: 'private' }];
                setRooms(next);
                showToast('Draft sanctuary added.', 'info');
              }}
              className="px-6 py-2 bg-aqua-primary text-stone rounded-full text-[10px] uppercase font-black tracking-widest shadow-sm flex items-center gap-2"
             >
               <Plus size={12} /> NEW SANCTUARY
             </button>
           )}
           <button onClick={onExit} className="px-6 py-2 bg-[#111] text-white rounded-full text-[10px] uppercase font-bold tracking-widest hover:bg-stone-light transition-all flex items-center gap-2 shadow-sm">
             <LogOut size={12} /> Exit Console
           </button>
        </div>
      </aside>
      
      <main className="flex-1 p-8 md:p-16 max-w-7xl mx-auto w-full space-y-12 animate-reveal">
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

        {tab === 'rooms' && (
          <div className="space-y-16 animate-fade-in">
            {rooms.length === 0 && (
              <div className="py-24 text-center bg-white rounded-[4rem] border border-stone/5 border-dashed">
                <p className="text-stone/10 font-black uppercase tracking-[0.5em] text-[12px]">Registry contains no sanctuary records</p>
              </div>
            )}
            {rooms.map((room, idx) => {
              const isRoomSaving = isSaving[room.id];
              const sanctuaryId = room.name.split(' ')[0].toUpperCase() || 'NEW';
              return (
                <div key={room.id} className="bg-white p-12 md:p-16 rounded-[4rem] border border-stone/5 shadow-2xl space-y-16 relative overflow-hidden group">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                    {/* Header: Title & ID */}
                    <div className="flex-1 space-y-6 w-full">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-aqua-primary">SANCTUARY ID: {sanctuaryId}</p>
                        <input 
                          value={room.name} 
                          disabled={isRoomSaving}
                          onChange={e => { 
                            const next = [...rooms]; 
                            next[idx].name = e.target.value.toUpperCase(); 
                            setRooms(next); 
                          }} 
                          className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-stone w-full bg-transparent border-b border-stone/5 pb-4 outline-none focus:border-aqua-primary transition-all" 
                          placeholder="SANCTUARY NAME"
                        />
                      </div>
                    </div>

                    {/* Registry Controls */}
                    <div className="flex items-center gap-8">
                       <div className="space-y-2">
                         <p className="text-[8px] font-black uppercase tracking-[0.3em] text-stone/20 text-right">BASE REGISTRY (USD)</p>
                         <div className="bg-[#faf9f6] px-8 py-5 rounded-[2rem] border border-stone/5 shadow-inner">
                           <input 
                              type="number" 
                              value={room.basePrice} 
                              onChange={e => { const n = [...rooms]; n[idx].basePrice = parseInt(e.target.value) || 0; setRooms(n); }}
                              className="w-24 bg-transparent text-center text-xl font-black text-stone outline-none"
                           />
                         </div>
                       </div>
                       <button 
                        onClick={() => setDeleteTarget({ id: room.id, type: 'rooms', label: room.name || 'Unnamed' })}
                        className="p-4 text-stone/10 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                       >
                         <Trash2 size={24} />
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Description Area */}
                    <div className="space-y-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone/10 px-2">DESCRIPTION</p>
                      <textarea 
                        value={room.description} 
                        onChange={e => { const n = [...rooms]; n[idx].description = e.target.value; setRooms(n); }}
                        className="w-full h-full bg-[#faf9f6] p-10 rounded-[3rem] border border-stone/5 text-lg font-serif italic text-stone/40 leading-relaxed outline-none resize-none shadow-inner min-h-[280px]"
                        placeholder="Provide a technical description..."
                      />
                    </div>

                    {/* Media Management */}
                    <div className="space-y-12">
                      {/* Sanctuary Visual */}
                      <div className="space-y-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone/10 px-2">SANCTUARY VISUAL</p>
                        <div className="flex items-center gap-4">
                           <input 
                            value={room.image || ''} 
                            readOnly 
                            className="flex-1 bg-[#faf9f6] px-6 py-4 rounded-2xl border border-stone/5 text-[10px] text-stone/20 font-mono truncate outline-none" 
                            placeholder="Visual asset path..."
                           />
                           <input 
                            type="file" 
                            ref={el => imageInputRefs.current[room.id] = el}
                            onChange={e => e.target.files?.[0] && handleRoomImageUpload(room.id, e.target.files[0])}
                            className="hidden" 
                            accept="image/*"
                           />
                           <button 
                            onClick={() => imageInputRefs.current[room.id]?.click()}
                            className="px-8 py-4 bg-[#111] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-stone-light transition-all shadow-xl"
                           >
                             <Upload size={14} /> IMAGE
                           </button>
                        </div>
                      </div>

                      {/* Presentation Video */}
                      <div className="space-y-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone/10 px-2">PRESENTATION VIDEO</p>
                        <div className="flex items-center gap-4">
                           <input 
                            value={room.video || ''} 
                            readOnly 
                            className="flex-1 bg-[#faf9f6] px-6 py-4 rounded-2xl border border-stone/5 text-[10px] text-stone/20 font-mono truncate outline-none" 
                            placeholder="Technical video narrative..."
                           />
                           <input 
                            type="file" 
                            ref={el => videoInputRefs.current[room.id] = el}
                            onChange={e => e.target.files?.[0] && handleRoomVideoUpload(room.id, e.target.files[0])}
                            className="hidden" 
                            accept="video/*"
                           />
                           <button 
                            onClick={() => videoInputRefs.current[room.id]?.click()}
                            className="px-8 py-4 bg-[#111] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-stone-light transition-all shadow-xl"
                           >
                             <Film size={14} /> VIDEO
                           </button>
                        </div>
                      </div>

                      {/* Visual Preview Window */}
                      <div className="aspect-[16/9] rounded-[3rem] bg-[#faf9f6] border border-stone/5 overflow-hidden shadow-2xl relative group/preview">
                         {room.video ? (
                           <video src={room.video} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" />
                         ) : room.image ? (
                           <img src={room.image} className="w-full h-full object-cover opacity-80" alt="Preview" />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-stone/5">
                             <ImageIcon size={48} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Preview Unavailable</span>
                           </div>
                         )}
                         {/* Save Button Floating */}
                         <div className="absolute bottom-8 right-8">
                            <button 
                              onClick={() => handleSaveRoom(idx)}
                              disabled={isRoomSaving}
                              className="bg-aqua-primary text-stone px-10 py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] shadow-3xl hover:bg-aqua-deep hover:text-white transition-all flex items-center gap-4 active:scale-95"
                            >
                              {isRoomSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                              SYNCHRONIZE
                            </button>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Other tabs remain largely identical but could benefit from subtle card layout improvements */}
        {tab === 'sessions' && (
          <div className="space-y-8 animate-fade-in">
            <AdminSectionHeader title="Residency Windows" onAdd={() => {
              const next = [...sessions, { id: Date.now().toString(), startDate: today, endDate: '', status: 'Open', maxGuests: 4 }];
              setSessions(next);
            }} />
            <div className="grid gap-6">
              {sessions.map((s, idx) => (
                <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border border-stone/5 shadow-lg flex flex-col md:flex-row items-center gap-8 group">
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
                      <input type="number" min="1" value={s.maxGuests} onChange={e => { const next = [...sessions]; next[idx].maxGuests = parseInt(e.target.value) || 0; setSessions(next); }} className="w-full bg-[#faf9f6] p-4 rounded-xl border border-stone/5 text-xs outline-none text-center" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleSaveSession(s)} disabled={isSaving[s.id]} className="px-8 py-3 bg-[#111] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-stone-light transition-all shadow-md">
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
               <button onClick={handleSyncItinerary} disabled={isSaving.itinerary} className="w-full py-6 bg-aqua-primary text-stone rounded-full font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                 {isSaving.itinerary ? <Loader2 size={18} className="animate-spin" /> : 'SYNCHRONIZE PATHWAY'}
               </button>
             </div>
           </div>
        )}

        {tab === 'faqs' && (
          <div className="space-y-8 animate-fade-in">
            <AdminSectionHeader title="Estate Intelligence" onAdd={() => setFaqs([...faqs, { id: Date.now().toString(), q: "New Question?", a: "New Answer." }])} />
            <div className="grid gap-6">
              {faqs.map((faq, idx) => (
                <div key={faq.id} className="bg-white p-10 rounded-[2.5rem] border border-stone/5 shadow-lg space-y-6">
                  <div className="flex justify-between items-start gap-4">
                    <input value={faq.q} onChange={e => { const n = [...faqs]; n[idx].q = e.target.value; setFaqs(n); }} className="text-[15px] font-black uppercase text-stone w-full bg-transparent border-b border-stone/5 pb-3 outline-none focus:border-aqua-primary/30" />
                    <button onClick={() => setDeleteTarget({ id: faq.id, type: 'faqs', label: faq.q })} className="p-2 text-stone/10 hover:text-red-400"><Trash2 size={18}/></button>
                  </div>
                  <textarea value={faq.a} onChange={e => { const n = [...faqs]; n[idx].a = e.target.value; setFaqs(n); }} className="w-full bg-[#faf9f6] p-6 rounded-2xl text-[14px] font-serif italic text-stone/50 outline-none min-h-[80px]" />
                  <div className="pt-2 flex justify-end">
                    <button onClick={() => handleSaveFaq(faq)} disabled={isSaving[faq.id]} className="px-8 py-3 bg-aqua-primary text-stone rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-aqua-deep transition-all shadow-md">
                      {isSaving[faq.id] ? <Loader2 size={14} className="animate-spin" /> : 'SAVE CHANGES'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'portal' && (
          <div className="space-y-12 animate-fade-in pb-20">
            <h3 className="text-4xl font-black uppercase tracking-tight text-stone">PORTAL SETTINGS</h3>
            <div className="bg-white p-14 rounded-[4rem] border border-stone/5 space-y-16 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-aqua-primary opacity-20"></div>
              {/* Narrative Video */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <Video size={18} className="text-aqua-primary" />
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone/20">ESTATE NARRATIVE VIDEO</h5>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-stone/10 px-1">VIDEO SOURCE URL</label>
                      <input value={portalConfig.promoVideoUrl} onChange={e => setPortalConfig({...portalConfig, promoVideoUrl: e.target.value})} className="w-full bg-[#faf9f6] px-6 py-4 rounded-xl border border-stone/5 text-xs outline-none" />
                    </div>
                    <div className="space-y-4">
                      <p className="text-[8px] font-black uppercase tracking-widest text-stone/10 px-1">UPLOAD LOCAL VIDEO</p>
                      <input type="file" ref={videoFileInputRef} onChange={handleVideoFileChange} accept="video/*" className="hidden" />
                      <button onClick={() => videoFileInputRef.current?.click()} className="w-full py-4 bg-[#111] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
                        <Upload size={14} /> SELECT VIDEO FILE
                      </button>
                    </div>
                  </div>
                  <div className="aspect-video bg-[#faf9f6] rounded-[2rem] border border-stone/5 overflow-hidden">
                    {portalConfig.promoVideoUrl && <video src={portalConfig.promoVideoUrl} className="w-full h-full object-cover" autoPlay loop muted />}
                  </div>
                </div>
              </div>
              
              {/* Other settings same as before... */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MessageSquare size={16} className="text-aqua-primary" />
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone/20">WELCOME MESSAGE</h5>
                </div>
                <textarea value={portalConfig.welcomeParagraph} onChange={e => setPortalConfig({...portalConfig, welcomeParagraph: e.target.value})} className="w-full bg-[#faf9f6] p-10 rounded-[2.5rem] border border-stone/5 text-sm font-serif italic text-stone/50 outline-none min-h-[140px] leading-relaxed resize-none shadow-inner" />
              </div>

              <div className="pt-10 flex flex-col items-center">
                <button onClick={handleSavePortalConfig} disabled={isSaving.portal} className="w-full max-w-md py-6 bg-aqua-primary text-stone rounded-full font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-aqua-deep hover:text-white transition-all">
                  {isSaving.portal ? <Loader2 className="animate-spin" size={20} /> : 'SYNCHRONIZE SETTINGS'}
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
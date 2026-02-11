import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Lock, LogOut, Shield, Check, Zap, 
  Calendar, ChevronDown, Users, Coffee, Waves, Map, 
  CreditCard, Settings, Sun, ArrowRight,
  ShieldCheck, HelpCircle, Anchor, Wind, Plus, Trash2, Edit3, Save, Upload,
  ExternalLink, Copy, Key, Info, MapPin, AlertCircle, Clock, BookOpen, Package, MessageSquare, FileText, Play, Film
} from 'lucide-react';
import { 
  VILLA_ROOMS as DEFAULT_ROOMS, 
  RESIDENCY_SESSIONS as DEFAULT_SESSIONS,
  FAQS as DEFAULT_FAQS,
  ITINERARY_DAYS as DEFAULT_ITINERARY
} from './constants';
import { BookingState, Room, ResidencySession, Application, FAQItem } from './types';

const HERO_VIDEO_URL = "https://player.vimeo.com/external/494294683.hd.mp4?s=d038743f38c3933c16a3f169f4935f8d29837a7b&profile_id=174";
const INITIAL_PROMO_VIDEO_URL = "https://player.vimeo.com/external/517042307.hd.mp4?s=d946d0a7a4073a9e34c9c7379201509a2503254e&profile_id=174";

const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div className={`relative ${className} flex items-center justify-center border border-stone/10 rounded-full bg-white shadow-sm`}>
    <svg viewBox="0 0 100 100" className="w-5 h-5">
      <path d="M30,60 Q50,30 70,60" fill="none" stroke="#4fd1c5" strokeWidth="12" strokeLinecap="round" />
    </svg>
  </div>
);

// --- UTILITY COMPONENTS ---

const ClockIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

interface AdminSectionHeaderProps {
  title: string;
  onAdd?: () => void;
}

const AdminSectionHeader = ({ title, onAdd }: AdminSectionHeaderProps) => (
  <div className="flex items-center justify-between mb-8">
    <h3 className="text-2xl font-black uppercase tracking-tighter text-stone">{title}</h3>
    {onAdd && (
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAdd();
        }} 
        className="flex items-center gap-2 px-6 py-2 bg-stone text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-stone-light transition-all cursor-pointer active:scale-95 z-50"
      >
        <Plus size={14} /> Add New
      </button>
    )}
  </div>
);

interface PortalSectionProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  icon?: any;
}

const PortalSection = ({ title, subtitle, children, icon: Icon }: PortalSectionProps) => (
  <section className="py-20 border-b border-stone/5 animate-fade-in">
    <div className="space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          {Icon && <div className="w-10 h-10 rounded-full bg-aqua-primary/5 flex items-center justify-center text-aqua-primary"><Icon size={20} /></div>}
          <h2 className="text-3xl font-display font-light uppercase tracking-tighter text-stone">{title}</h2>
        </div>
        {subtitle && <p className="text-[12px] font-black uppercase tracking-[0.4em] text-stone/30">{subtitle}</p>}
      </header>
      <div className="max-w-3xl">
        {children}
      </div>
    </div>
  </section>
);

type AdminTab = 'applications' | 'sessions' | 'rooms' | 'itinerary' | 'faqs' | 'portal-config';
type AppView = 'landing' | 'portal';

interface PortalConfig {
  welcomeParagraph: string;
  packingList: string[];
  houseGuidelines: { title: string; desc: string }[];
  experiences: { name: string; desc: string; level: string; freq: string }[];
  logistics: { address: string; gateInstructions: string; checkInWindow: string };
  promoVideoUrl: string;
}

const DEFAULT_PORTAL_CONFIG: PortalConfig = {
  welcomeParagraph: "Our team is standing by to ensure your technical immersion is seamless and restorative. We look forward to your arrival at the estate.",
  packingList: [
    'Lightweight Judo Gi (available for rent)',
    'Rash guard / Compression shorts',
    'Water-appropriate movement gear',
    'High-SPF mineral sunscreen',
    'Grip-soled sandals / Reef shoes',
    'Personal technical journal',
    'Polarized sunglasses',
    'Reusable hydration flask'
  ],
  houseGuidelines: [
    { title: 'Alcohol-Free Estate', desc: 'Strict commitment to a metabolic recovery environment. No alcohol permitted on grounds.' },
    { title: 'Quiet Hours', desc: 'Restorative silence from 9:00 PM to 7:00 AM daily.' },
    { title: 'Shared Space Etiquette', desc: 'Please leave technical areas and common rooms exactly as you found them.' },
    { title: 'Respect for Structure', desc: 'The estate is a shared home for foundational study. Please be mindful of the physical structure.' }
  ],
  experiences: [
    { name: 'Ukemi on the Shore', desc: 'Mastering the art of safe falling on soft coastal sands, aligning breath with movement.', level: 'Beginner', freq: 'Daily' },
    { name: 'Balandra Integration', desc: 'A full-day expedition to the shallow lagoons for floating technical drills.', level: 'Restorative', freq: 'Once' },
    { name: 'Coastal Bouldering', desc: 'Natural terrain integration focusing on balance and weight distribution.', level: 'Technical', freq: 'Once' }
  ],
  logistics: {
    address: 'Calle Vista al Mar 104, Pedregal, Cabo San Lucas',
    gateInstructions: 'Present your registry ID to the Pedregal security gate. Mention "Estate Judo 104".',
    checkInWindow: 'Access begins at 3:00 PM on your arrival date. Private SJD transfer is pre-coordinated.'
  },
  promoVideoUrl: INITIAL_PROMO_VIDEO_URL
};

const App: React.FC = () => {
  // --- STATE ---
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [applications, setApplications] = useState<Application[]>([]);
  const [sessions, setSessions] = useState<ResidencySession[]>([]);
  const [villaRooms, setVillaRooms] = useState<Room[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [portalConfig, setPortalConfig] = useState<PortalConfig>(DEFAULT_PORTAL_CONFIG);
  
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('applications');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyStep, setApplyStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [myAppId, setMyAppId] = useState<string | null>(localStorage.getItem('my_app_id'));
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [showLegalModal, setShowLegalModal] = useState<'privacy' | 'terms' | null>(null);

  // Portal Specific
  const [activePortalGuest, setActivePortalGuest] = useState<Application | null>(null);

  const [form, setForm] = useState<BookingState>({
    sessionId: '', guestName: '', guestEmail: '', guestPhone: '', gender: '',
    bookingType: 'solo', companionName: '', roomPreferenceId: 'onyx',
    healthNotes: '', oneOnOneInterest: false, bathroomConsent: false,
    alcoholConsent: false, language: 'English', notes: '', isConfirmed: false
  });

  const [lastSubmittedApp, setLastSubmittedApp] = useState<Application | null>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const get = (key: string) => localStorage.getItem(key);
    
    try {
      // Load data from storage
      setApplications(JSON.parse(get('aj_apps') || '[]'));
      setSessions(JSON.parse(get('aj_sessions') || JSON.stringify(DEFAULT_SESSIONS)));
      setVillaRooms(JSON.parse(get('aj_rooms') || JSON.stringify(DEFAULT_ROOMS)));
      setFaqs(JSON.parse(get('aj_faqs') || JSON.stringify(DEFAULT_FAQS)));
      setItinerary(JSON.parse(get('aj_itinerary') || JSON.stringify(DEFAULT_ITINERARY)));
      setPortalConfig(JSON.parse(get('aj_portal_config') || JSON.stringify(DEFAULT_PORTAL_CONFIG)));
    } catch (e) {
      console.warn("Storage corruption detected, resetting to defaults.");
    }

    // Magic Link Detection
    const params = new URLSearchParams(window.location.search);
    const portalId = params.get('portal');
    if (portalId) {
      const storedApps = JSON.parse(get('aj_apps') || '[]');
      const guest = storedApps.find((a: Application) => a.id === portalId);
      if (guest && (guest.status === 'Confirmed' || guest.status === 'Approved')) {
        setActivePortalGuest(guest);
        setCurrentView('portal');
        window.history.replaceState({}, '', window.location.pathname + '?portal=' + portalId);
      } else {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const saveToStorage = (key: string, val: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.error("Storage limit exceeded. This usually happens with large local file uploads.");
        alert("Action failed: Browser storage is full. Please try a smaller file or use an external URL link instead of a local upload.");
      } else {
        console.error("Storage error:", e);
      }
    }
  };

  // --- UPDATE HELPERS ---
  const handleUpdateSessions = (next: ResidencySession[] | ((prev: ResidencySession[]) => ResidencySession[])) => {
    setSessions(prev => {
      const result = typeof next === 'function' ? next(prev) : next;
      saveToStorage('aj_sessions', result);
      return result;
    });
  };

  const handleUpdateRooms = (next: Room[] | ((prev: Room[]) => Room[])) => {
    setVillaRooms(prev => {
      const result = typeof next === 'function' ? next(prev) : next;
      saveToStorage('aj_rooms', result);
      return result;
    });
  };

  const handleUpdateFaqs = (next: FAQItem[] | ((prev: FAQItem[]) => FAQItem[])) => {
    setFaqs(prev => {
      const result = typeof next === 'function' ? next(prev) : next;
      saveToStorage('aj_faqs', result);
      return result;
    });
  };

  const handleUpdateItinerary = (next: any[] | ((prev: any[]) => any[])) => {
    setItinerary(prev => {
      const result = typeof next === 'function' ? next(prev) : next;
      saveToStorage('aj_itinerary', result);
      return result;
    });
  };

  const handleUpdatePortalConfig = (next: PortalConfig | ((prev: PortalConfig) => PortalConfig)) => {
    setPortalConfig(prev => {
      const result = typeof next === 'function' ? next(prev) : next;
      saveToStorage('aj_portal_config', result);
      return result;
    });
  };

  const handleAdminLogin = () => {
    if (loginInput === "admin") {
      setIsAdminOpen(true);
      setShowLoginModal(false);
      setLoginInput("");
    }
  };

  const sessionsWithStats = useMemo(() => {
    return sessions.map(s => {
      const confirmedGuests = applications.filter(a => a.sessionId === s.id && (a.status === 'Confirmed' || a.status === 'Approved')).length;
      return { 
        ...s, 
        confirmedGuests, 
        status: confirmedGuests >= s.maxGuests ? 'Full' : (confirmedGuests >= s.maxGuests - 1 ? 'Limited' : 'Open') 
      };
    });
  }, [sessions, applications]);

  const submitApplication = async () => {
    setLoading(true);
    const newId = `AJ-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const selectedRoom = villaRooms.find(r => r.id === form.roomPreferenceId);
    
    const newApp: Application = {
      id: newId,
      sessionId: form.sessionId,
      guestName: form.guestName,
      email: form.guestEmail,
      phone: form.guestPhone,
      gender: form.gender as any,
      roomPreferenceId: form.roomPreferenceId,
      bookingType: form.bookingType,
      status: 'Pending',
      consentBathroom: form.bathroomConsent,
      consentAlcohol: form.alcoholConsent,
      totalPrice: selectedRoom?.basePrice || 0,
      depositPaid: false,
      timestamp: Date.now(),
      language: form.language,
      oneOnOneInterest: form.oneOnOneInterest,
      healthNotes: form.healthNotes
    };
    
    setApplications(prev => {
      const next = [newApp, ...prev];
      saveToStorage('aj_apps', next);
      return next;
    });
    setLastSubmittedApp(newApp);
    setMyAppId(newId);
    localStorage.setItem('my_app_id', newId);
    setApplyStep(5);
    setLoading(false);
  };

  const updateAppStatus = (id: string, status: any) => {
    setApplications(prev => {
      const next = prev.map(a => a.id === id ? { ...a, status } : a);
      saveToStorage('aj_apps', next);
      return next;
    });
  };

  const openInquiry = (sessionId?: string) => {
    const initialSessionId = sessionId || sessionsWithStats.find(s => s.status !== 'Full')?.id || (sessions[0]?.id || '');
    const firstRoomId = villaRooms[0]?.id || 'onyx';
    
    setForm(prev => ({ 
      ...prev, 
      sessionId: initialSessionId,
      roomPreferenceId: firstRoomId
    }));
    setApplyStep(1);
    setShowApplyModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check image size (limit to 1MB to prevent QuotaExceededError)
      if (file.size > 1024 * 1024) {
        alert("Image too large. Please use a file under 1MB to stay within browser storage limits.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleUpdateRooms(prev => {
          const next = [...prev];
          next[idx].image = base64String;
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Browsers usually have a 5-10MB localStorage limit total.
      // We strict limit to 2MB for local base64 to leave room for other data.
      if (file.size > 2 * 1024 * 1024) {
        alert("Local video file is too large for browser memory (Max: 2MB). \nPlease upload to a service like Vimeo/YouTube and use the URL link instead.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleUpdatePortalConfig(prev => ({ ...prev, promoVideoUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- ADMIN PANEL RENDER ---
  if (isAdminOpen) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans text-stone selection:bg-aqua-primary/20">
        <aside className="w-full bg-[#faf9f6]/95 backdrop-blur-md text-stone p-6 flex items-center justify-between border-b border-stone/5 sticky top-0 z-[100]">
          <div className="flex items-center gap-4">
            <Logo className="w-10 h-10" />
            <div className="leading-tight">
              <h2 className="text-[12px] tracking-[0.5em] font-black uppercase">Registry Console</h2>
              <p className="text-[8px] tracking-[0.2em] text-aqua-primary font-bold uppercase">Estate Management</p>
            </div>
          </div>
          <button onClick={() => setIsAdminOpen(false)} className="px-6 py-2.5 bg-stone text-white rounded-full text-[10px] uppercase font-bold tracking-widest hover:bg-stone-light transition-all flex items-center gap-2">
            <LogOut size={12} /> Exit Console
          </button>
        </aside>
        
        <main className="flex-1 p-8 md:p-16 max-w-6xl mx-auto w-full space-y-12 animate-reveal">
          {/* Admin Tabs */}
          <div className="flex flex-wrap gap-4 border-b border-stone/5 pb-8 overflow-x-auto no-scrollbar">
             {(['applications', 'sessions', 'rooms', 'itinerary', 'faqs', 'portal-config'] as AdminTab[]).map(tab => (
               <button 
                 key={tab} 
                 onClick={() => setAdminTab(tab)} 
                 className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap rounded-2xl border ${
                   adminTab === tab 
                   ? 'text-aqua-primary bg-white border-aqua-primary/30 shadow-[0_0_40px_rgba(79,209,197,0.1)]' 
                   : 'text-stone/40 border-transparent hover:text-stone hover:bg-white hover:border-stone/5'
                 }`}
               >
                 <div className="flex items-center gap-3">
                   {adminTab === tab && (
                     <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua-primary opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-aqua-primary"></span>
                     </span>
                   )}
                   {tab === 'portal-config' ? 'Portal Settings' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                 </div>
               </button>
             ))}
          </div>

          {/* Applications View */}
          {adminTab === 'applications' && (
            <div className="space-y-6">
              <AdminSectionHeader title="Guest Inquiries" />
              {applications.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-stone/5 rounded-[2rem] bg-white">
                  <p className="text-[14px] font-serif italic text-stone/20">Awaiting registry inquiries...</p>
                </div>
              ) : (
                applications.map(app => (
                  <div key={app.id} className="bg-white p-8 rounded-[2rem] border border-stone/5 flex flex-col md:flex-row md:items-center justify-between gap-8 group shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-1">
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-black uppercase tracking-tight text-stone">{app.guestName}</p>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${app.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : app.status === 'Confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-stone/5 text-stone/20'}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone/40 font-bold uppercase tracking-widest">{app.id} • {app.email} • {app.phone}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {['Approve', 'Decline', 'Confirm'].map(action => (
                        <button key={action} onClick={() => updateAppStatus(app.id, (action === 'Approve' ? 'Approved' : action === 'Decline' ? 'Declined' : 'Confirmed') as any)} className="px-4 py-2 bg-stone/5 hover:bg-stone text-stone hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                          {action}
                        </button>
                      ))}
                      {(app.status === 'Confirmed' || app.status === 'Approved') && (
                        <button 
                          onClick={() => {
                            const link = `${window.location.origin}${window.location.pathname}?portal=${app.id}`;
                            navigator.clipboard.writeText(link);
                            alert('Magic link copied to clipboard.');
                          }}
                          className="px-4 py-2 bg-aqua-primary/10 text-aqua-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-aqua-primary hover:text-stone transition-all flex items-center gap-2"
                        >
                          <Copy size={12} /> Magic Link
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Portal Config Tab */}
          {adminTab === 'portal-config' && (
            <div className="space-y-12 pb-24">
              <AdminSectionHeader title="Portal Settings" />
              
              <div className="bg-white p-10 rounded-[3rem] border border-stone/5 space-y-12 shadow-sm">
                
                {/* Estate Narrative Video Upload Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Film size={16} className="text-aqua-primary" />
                    <h4 className="text-[10px] font-black text-stone/40 uppercase tracking-[0.3em]">Estate Narrative Video</h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">Video Source URL</p>
                      <input 
                        value={portalConfig.promoVideoUrl} 
                        onChange={e => handleUpdatePortalConfig(prev => ({ ...prev, promoVideoUrl: e.target.value }))}
                        placeholder="Direct MP4 URL"
                        className="w-full bg-parchment text-stone p-4 rounded-xl border border-stone/5 text-sm outline-none focus:border-aqua-primary shadow-inner"
                      />
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">Upload Local Video</p>
                        <label className="w-full p-4 bg-stone text-white rounded-xl cursor-pointer hover:bg-stone-light transition-all flex items-center justify-center gap-3">
                          <Upload size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Select Video File</span>
                          <input type="file" accept="video/mp4,video/webm,video/ogg" className="hidden" onChange={handleVideoUpload} />
                        </label>
                        <p className="text-[9px] font-serif italic text-stone/30">Storage limit: 2MB for local files. Use URLs for larger professional videos.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">Preview</p>
                      <div className="aspect-video rounded-[2rem] overflow-hidden bg-parchment border border-stone/5 relative group shadow-inner">
                        <video key={portalConfig.promoVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover">
                          <source src={portalConfig.promoVideoUrl} />
                        </video>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <Play size={24} className="text-white fill-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-stone/5" />

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-aqua-primary" />
                    <h4 className="text-[10px] font-black text-stone/40 uppercase tracking-[0.3em]">Welcome Message</h4>
                  </div>
                  <textarea 
                    value={portalConfig.welcomeParagraph} 
                    onChange={e => handleUpdatePortalConfig(prev => ({ ...prev, welcomeParagraph: e.target.value }))}
                    className="w-full bg-parchment text-stone p-6 rounded-2xl border border-stone/5 text-sm font-serif italic h-32 outline-none focus:border-aqua-primary transition-all shadow-inner"
                  />
                </div>

                <div className="h-px bg-stone/5" />

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-aqua-primary" />
                    <h4 className="text-[10px] font-black text-stone/40 uppercase tracking-[0.3em]">Arrival Logistics</h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">Estate Address</p>
                      <input 
                        value={portalConfig.logistics.address} 
                        onChange={e => handleUpdatePortalConfig(prev => ({ ...prev, logistics: { ...prev.logistics, address: e.target.value } }))}
                        className="w-full bg-parchment text-stone p-4 rounded-xl border border-stone/5 text-sm outline-none focus:border-aqua-primary shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">Check-in Window</p>
                      <input 
                        value={portalConfig.logistics.checkInWindow} 
                        onChange={e => handleUpdatePortalConfig(prev => ({ ...prev, logistics: { ...prev.logistics, checkInWindow: e.target.value } }))}
                        className="w-full bg-parchment text-stone p-4 rounded-xl border border-stone/5 text-sm outline-none focus:border-aqua-primary shadow-inner"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">Gated Access Instructions</p>
                      <textarea 
                        value={portalConfig.logistics.gateInstructions} 
                        onChange={e => handleUpdatePortalConfig(prev => ({ ...prev, logistics: { ...prev.logistics, gateInstructions: e.target.value } }))}
                        className="w-full bg-parchment text-stone p-4 rounded-xl border border-stone/5 text-sm h-24 outline-none focus:border-aqua-primary shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-stone/5" />

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package size={16} className="text-aqua-primary" />
                      <h4 className="text-[10px] font-black text-stone/40 uppercase tracking-[0.3em]">Packing Inventory</h4>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleUpdatePortalConfig(prev => ({ ...prev, packingList: [...prev.packingList, 'New Item'] }));
                      }}
                      className="px-4 py-2 bg-stone text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-stone-light transition-all cursor-pointer active:scale-95"
                    >+ Add Item</button>
                  </div>
                  <div className="grid gap-4">
                    {portalConfig.packingList.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <input 
                          value={item} 
                          onChange={e => {
                            const val = e.target.value;
                            handleUpdatePortalConfig(prev => {
                              const newList = [...prev.packingList];
                              newList[idx] = val;
                              return { ...prev, packingList: newList };
                            });
                          }}
                          className="flex-1 bg-parchment text-stone p-4 rounded-xl border border-stone/5 text-xs outline-none focus:border-aqua-primary shadow-inner"
                        />
                        <button 
                          onClick={() => {
                            handleUpdatePortalConfig(prev => {
                              const newList = prev.packingList.filter((_, i) => i !== idx);
                              return { ...prev, packingList: newList };
                            });
                          }}
                          className="p-4 text-red-500/30 hover:text-red-500 transition-colors"
                        ><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-stone/5" />

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield size={16} className="text-aqua-primary" />
                      <h4 className="text-[10px] font-black text-stone/40 uppercase tracking-[0.3em]">Registry Guidelines</h4>
                    </div>
                    <button 
                      onClick={() => handleUpdatePortalConfig(prev => ({ 
                        ...prev, 
                        houseGuidelines: [...prev.houseGuidelines, { title: 'New Guideline', desc: 'Protocol description...' }] 
                      }))}
                      className="px-4 py-2 bg-stone text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-stone-light transition-all cursor-pointer active:scale-95"
                    >+ Add Guideline</button>
                  </div>
                  <div className="grid gap-6">
                    {portalConfig.houseGuidelines.map((item, idx) => (
                      <div key={idx} className="bg-parchment p-6 rounded-2xl border border-stone/5 space-y-4 shadow-inner">
                        <div className="flex justify-between items-center gap-4">
                          <input 
                            value={item.title} 
                            onChange={e => {
                              const val = e.target.value;
                              handleUpdatePortalConfig(prev => {
                                const newRules = [...prev.houseGuidelines];
                                newRules[idx] = { ...newRules[idx], title: val };
                                return { ...prev, houseGuidelines: newRules };
                              });
                            }}
                            className="flex-1 bg-transparent text-stone font-black uppercase tracking-tight outline-none border-b border-stone/10 pb-1"
                          />
                          <button onClick={() => {
                            handleUpdatePortalConfig(prev => {
                              const newRules = prev.houseGuidelines.filter((_, i) => i !== idx);
                              return { ...prev, houseGuidelines: newRules };
                            });
                          }} className="text-red-500/30 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                        <textarea 
                          value={item.desc} 
                          onChange={e => {
                            const val = e.target.value;
                            handleUpdatePortalConfig(prev => {
                              const newRules = [...prev.houseGuidelines];
                              newRules[idx] = { ...newRules[idx], desc: val };
                              return { ...prev, houseGuidelines: newRules };
                            });
                          }}
                          className="w-full bg-white text-stone/50 p-4 rounded-xl border border-stone/5 text-sm h-20 outline-none focus:border-aqua-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {adminTab === 'sessions' && (
            <div className="space-y-6">
              <AdminSectionHeader title="Residency Windows" onAdd={() => {
                const newS: ResidencySession = { 
                  id: `s-${Date.now()}`, 
                  startDate: new Date().toISOString().split('T')[0], 
                  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
                  status: 'Open', 
                  maxGuests: 4 
                };
                handleUpdateSessions(prev => [...prev, newS]);
              }} />
              <div className="grid gap-4">
                {sessions.map((s, idx) => (
                  <div key={s.id} className="bg-white p-8 rounded-[2rem] border border-stone/5 grid grid-cols-1 md:grid-cols-4 gap-6 items-center shadow-sm">
                    <input type="date" value={s.startDate} onChange={e => {
                      const val = e.target.value;
                      handleUpdateSessions(prev => {
                        const next = [...prev]; next[idx].startDate = val; return next;
                      });
                    }} className="bg-parchment text-stone p-3 rounded-xl border border-stone/5 text-xs outline-none focus:border-aqua-primary shadow-inner" />
                    <input type="date" value={s.endDate} onChange={e => {
                      const val = e.target.value;
                      handleUpdateSessions(prev => {
                        const next = [...prev]; next[idx].endDate = val; return next;
                      });
                    }} className="bg-parchment text-stone p-3 rounded-xl border border-stone/5 text-xs outline-none focus:border-aqua-primary shadow-inner" />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-stone/20">Max:</span>
                      <input type="number" value={s.maxGuests} onChange={e => {
                        const val = parseInt(e.target.value);
                        handleUpdateSessions(prev => {
                          const next = [...prev]; next[idx].maxGuests = val; return next;
                        });
                      }} className="w-20 bg-parchment text-stone p-3 rounded-xl border border-stone/5 text-xs outline-none focus:border-aqua-primary shadow-inner" />
                    </div>
                    <button onClick={() => handleUpdateSessions(prev => prev.filter(item => item.id !== s.id))} className="text-red-500/50 hover:text-red-500 self-center justify-self-end"><Trash2 size={18}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rooms Tab */}
          {adminTab === 'rooms' && (
            <div className="space-y-6">
              <AdminSectionHeader title="Sanctuary Management" onAdd={() => {
                const newR: Room = {
                  id: `r-${Date.now()}`,
                  name: "New Sanctuary",
                  location: "Estate Wing",
                  bedType: "King Bed",
                  description: "A newly curated technical resting sanctuary.",
                  basePrice: 3500,
                  maxOccupancy: 2,
                  bathType: 'shared',
                  image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1200'
                };
                handleUpdateRooms(prev => [...prev, newR]);
              }} />
              <div className="grid gap-8">
                {villaRooms.map((room, idx) => (
                  <div key={room.id} className="bg-white p-10 rounded-[3rem] border border-stone/5 space-y-8 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-aqua-primary">Sanctuary ID: {room.id}</p>
                        <input value={room.name} onChange={e => {
                          const val = e.target.value;
                          handleUpdateRooms(prev => { const next = [...prev]; next[idx].name = val; return next; });
                        }} className="w-full bg-transparent text-3xl font-black uppercase tracking-tighter text-stone outline-none border-b border-stone/10 focus:border-aqua-primary pb-2" />
                      </div>
                      <div className="text-right flex items-center gap-6">
                         <div className="text-right">
                           <span className="text-[10px] font-black uppercase text-stone/20">Base Registry (USD)</span>
                           <input type="number" value={room.basePrice} onChange={e => {
                             const val = parseInt(e.target.value);
                             handleUpdateRooms(prev => { const next = [...prev]; next[idx].basePrice = val; return next; });
                           }} className="block w-32 bg-parchment text-stone p-4 rounded-2xl border border-stone/5 text-xl font-black outline-none focus:border-aqua-primary mt-2 shadow-inner" />
                         </div>
                         <button onClick={() => handleUpdateRooms(prev => prev.filter(r => r.id !== room.id))} className="text-red-500/30 hover:text-red-500 transition-colors mt-6"><Trash2 size={24}/></button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">Description</p>
                        <textarea value={room.description} onChange={e => {
                          const val = e.target.value;
                          handleUpdateRooms(prev => { const next = [...prev]; next[idx].description = val; return next; });
                        }} className="w-full bg-parchment text-stone/60 p-6 rounded-2xl border border-stone/5 text-sm font-serif italic outline-none focus:border-aqua-primary h-40 shadow-inner" />
                      </div>
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">Sanctuary Visual</p>
                        <div className="flex gap-4 items-center">
                          <input value={room.image} onChange={e => {
                            const val = e.target.value;
                            handleUpdateRooms(prev => { const next = [...prev]; next[idx].image = val; return next; });
                          }} className="flex-1 bg-parchment text-stone/40 p-4 rounded-xl border border-stone/5 text-[10px] outline-none shadow-inner" />
                          <label className="p-4 bg-stone text-white rounded-xl cursor-pointer hover:bg-stone-light transition-all flex items-center gap-2">
                             <Upload size={14} />
                             <span className="text-[10px] font-black uppercase">Local File</span>
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, idx)} />
                          </label>
                        </div>
                        <div className="aspect-video rounded-2xl overflow-hidden bg-parchment relative shadow-inner group">
                          <img src={room.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary Tab */}
          {adminTab === 'itinerary' && (
            <div className="space-y-6">
              <AdminSectionHeader title="7-Day Technical Pathway" />
              <div className="grid gap-4">
                {itinerary.map((day, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[2rem] border border-stone/5 space-y-4 shadow-sm">
                    <div className="flex items-center gap-6">
                       <span className="text-xl font-black text-aqua-primary">0{day.day}</span>
                       <input value={day.title} onChange={e => {
                         const val = e.target.value;
                         handleUpdateItinerary(prev => { const next = [...prev]; next[idx].title = val; return next; });
                       }} className="flex-1 bg-transparent text-stone font-black uppercase tracking-tight outline-none border-b border-stone/10 focus:border-aqua-primary" />
                    </div>
                    <textarea value={day.desc} onChange={e => {
                      const val = e.target.value;
                      handleUpdateItinerary(prev => { const next = [...prev]; next[idx].desc = val; return next; });
                    }} className="w-full bg-parchment text-stone/40 p-4 rounded-xl border border-stone/5 text-sm font-serif italic outline-none focus:border-aqua-primary shadow-inner" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs Tab */}
          {adminTab === 'faqs' && (
            <div className="space-y-6">
              <AdminSectionHeader title="Knowledge Base" onAdd={() => {
                const newF: FAQItem = { id: `f-${Date.now()}`, q: 'New Registry Question', a: 'Detailed policy answer goes here.' };
                handleUpdateFaqs(prev => [...prev, newF]);
              }} />
              <div className="grid gap-4">
                {faqs.map((faq, idx) => (
                  <div key={faq.id} className="bg-white p-8 rounded-[2rem] border border-stone/5 space-y-4 shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                      <input value={faq.q} onChange={e => {
                        const val = e.target.value;
                        handleUpdateFaqs(prev => { const next = [...prev]; next[idx].q = val; return next; });
                      }} className="flex-1 bg-transparent text-stone font-black uppercase tracking-tight outline-none border-b border-stone/10 focus:border-aqua-primary pb-1" />
                      <button onClick={() => handleUpdateFaqs(prev => prev.filter(item => item.id !== faq.id))} className="text-red-500/30 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                    <textarea value={faq.a} onChange={e => {
                      const val = e.target.value;
                      handleUpdateFaqs(prev => { const next = [...prev]; next[idx].a = val; return next; });
                    }} className="w-full bg-parchment text-stone/40 p-5 rounded-xl border border-stone/5 text-sm font-serif italic outline-none focus:border-aqua-primary h-24 shadow-inner" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- GUEST PORTAL RENDER ---
  if (currentView === 'portal' && activePortalGuest) {
    const session = sessions.find(s => s.id === activePortalGuest.sessionId);
    const room = villaRooms.find(r => r.id === activePortalGuest.roomPreferenceId);
    const isPastResidency = session && new Date() > new Date(new Date(session.endDate).getTime() + 48 * 60 * 60 * 1000);

    return (
      <div className="min-h-screen bg-[#faf9f6] text-stone font-sans selection:bg-aqua-primary/10 overflow-x-hidden">
        <nav className="fixed top-0 w-full z-[100] px-8 py-4 flex items-center justify-between bg-[#faf9f6]/95 backdrop-blur-md border-b border-stone/5">
          <div className="flex items-center gap-4">
            <Logo className="w-8 h-8" />
            <div className="leading-tight">
              <h1 className="text-[10px] tracking-[0.5em] font-black text-stone uppercase">AQUA JUDO</h1>
              <p className="text-[7px] tracking-[0.2em] font-bold text-aqua-primary uppercase opacity-70">GUEST PORTAL</p>
            </div>
          </div>
          <button onClick={() => { setActivePortalGuest(null); setCurrentView('landing'); window.history.replaceState({}, '', window.location.pathname); }} className="px-6 py-2 bg-stone text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-stone-light transition-all">
            EXIT PORTAL
          </button>
        </nav>

        <main className="max-w-4xl mx-auto px-8 pt-32 pb-40 divide-y divide-stone/5">
          {isPastResidency ? (
            <section className="py-40 text-center space-y-12 animate-fade-in">
              <h2 className="text-4xl font-display font-light uppercase tracking-tighter text-stone">Thank You, {activePortalGuest.guestName.split(' ')[0]}</h2>
              <p className="text-lg font-serif italic text-stone/40 leading-relaxed max-w-md mx-auto">
                Your residency has concluded. This portal is now read-only.
              </p>
            </section>
          ) : (
            <>
              <section className="pb-20 space-y-8 animate-fade-in">
                <header className="space-y-4">
                  <p className="text-[12px] font-black uppercase tracking-[0.4em] text-aqua-primary">GUEST REGISTRY</p>
                  <h1 className="text-5xl md:text-7xl font-display font-light uppercase tracking-tighter text-stone">
                    Greetings, {activePortalGuest.guestName.split(' ')[0]}
                  </h1>
                </header>
                <div className="grid md:grid-cols-2 gap-8 pt-8">
                  <div className="p-10 bg-white rounded-[2.5rem] border border-stone/5 space-y-6 shadow-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">RESIDENCY WINDOW</p>
                      <p className="text-xl font-black uppercase tracking-tight text-stone">
                        {session ? `${new Date(session.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${new Date(session.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Dates pending'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">ASSIGNED SANCTUARY</p>
                      <p className="text-xl font-black uppercase tracking-tight text-aqua-primary">{room?.name || 'Sanctuary TBD'}</p>
                    </div>
                  </div>
                  <div className="p-10 bg-white rounded-[2.5rem] border border-stone/5 space-y-6 shadow-sm flex flex-col justify-center">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">EMERGENCY CURATOR</p>
                      <p className="text-xl font-black uppercase tracking-tight text-stone">+52 624 555 0192</p>
                    </div>
                    <p className="text-[13px] font-serif italic text-stone/40 leading-relaxed">
                      "{portalConfig.welcomeParagraph}"
                    </p>
                  </div>
                </div>
              </section>

              {/* GUEST PORTAL PROMO VIDEO */}
              <PortalSection title="The Experience" subtitle="Estate Narrative" icon={Film}>
                <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl bg-parchment">
                  <video 
                    key={portalConfig.promoVideoUrl}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover"
                  >
                    <source src={portalConfig.promoVideoUrl} />
                  </video>
                  <div className="absolute bottom-10 left-10 space-y-2 pointer-events-none">
                    <p className="text-[9px] font-black text-white uppercase tracking-[0.4em] opacity-60 shadow-sm">VISUAL ORIENTATION</p>
                  </div>
                </div>
              </PortalSection>

              <PortalSection title="Residency Rhythm" subtitle="7-Day technical flow" icon={ClockIcon}>
                <div className="space-y-12">
                  <p className="text-lg font-serif italic text-stone/50 leading-relaxed">
                    The AquaJudo rhythm is designed to balance restorative technical movement with deep coastal immersion.
                  </p>
                  <div className="space-y-8">
                    {[
                      { time: 'Morning', activity: 'Sunrise ukemi & foundational principles' },
                      { time: 'Midday', activity: 'Coastal restoration & pool-side technical study' },
                      { time: 'Afternoon', activity: 'Signature oceanic immersion (Balandra, Land\'s End)' },
                      { time: 'Evening', activity: 'Quiet reflection & metabolic recovery' }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-8 items-start group">
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-aqua-primary w-24 pt-1">{item.time}</span>
                        <p className="text-base font-black uppercase tracking-tight text-stone/60 group-hover:text-stone transition-colors">{item.activity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </PortalSection>

              <PortalSection title="Your Sanctuary" icon={Coffee}>
                {room ? (
                  <div className="space-y-10">
                    <div className="aspect-[2/1] rounded-[3rem] overflow-hidden shadow-2xl relative">
                      <img src={room.image} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone/60 to-transparent"></div>
                      <div className="absolute bottom-10 left-10">
                        <h3 className="text-3xl font-display font-light text-white uppercase tracking-tighter">{room.name}</h3>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <p className="text-base font-serif italic text-stone/50 leading-relaxed">{room.description}</p>
                        <div className="flex flex-wrap gap-4">
                          {[room.bedType, `${room.bathType} Bathroom`, room.location].map(f => (
                            <span key={f} className="px-5 py-2 bg-white border border-stone/5 rounded-full text-[10px] font-black uppercase tracking-widest">{f}</span>
                          ))}
                        </div>
                      </div>
                      <div className="p-8 bg-aqua-primary/5 rounded-[2rem] space-y-4 border border-aqua-primary/10">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-aqua-primary">Quiet Expectations</h5>
                        <p className="text-sm text-stone/60 leading-relaxed">
                          This sanctuary is designed for deep recovery. Silence after 9:00 PM is requested.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 bg-white border border-stone/5 rounded-[3rem] text-center">
                    <p className="text-lg font-serif italic text-stone/30">Sanctuary details are being finalized.</p>
                  </div>
                )}
              </PortalSection>

              <PortalSection title="House Guidelines" icon={ShieldCheck}>
                <div className="space-y-8">
                  {portalConfig.houseGuidelines.map((rule, i) => (
                    <div key={i} className="flex gap-6 items-start">
                      <div className="mt-1"><Check size={18} className="text-aqua-primary" /></div>
                      <div className="space-y-1">
                        <h6 className="text-base font-black uppercase tracking-tight">{rule.title}</h6>
                        <p className="text-sm font-serif italic text-stone/40 leading-relaxed">{rule.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </PortalSection>

              <PortalSection title="Packing Inventory" icon={Package}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  {portalConfig.packingList.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 py-2 border-b border-stone/5">
                      <div className="w-2 h-2 rounded-full bg-aqua-primary/30" />
                      <span className="text-[13px] font-black uppercase tracking-widest text-stone/60">{item}</span>
                    </div>
                  ))}
                </div>
              </PortalSection>

              <PortalSection title="Arrival & Access" icon={MapPin}>
                <div className="p-10 bg-stone rounded-[2.5rem] text-white space-y-6 shadow-xl">
                  <div className="space-y-2">
                    <h6 className="text-[10px] font-black text-aqua-primary uppercase tracking-widest">ESTATE ADDRESS</h6>
                    <p className="text-xl font-black uppercase tracking-tight">{portalConfig.logistics.address}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-2">
                      <h6 className="text-[10px] font-black text-white/30 uppercase tracking-widest">GATED ACCESS</h6>
                      <p className="text-sm text-white/60 leading-relaxed">{portalConfig.logistics.gateInstructions}</p>
                    </div>
                    <div className="space-y-2">
                      <h6 className="text-[10px] font-black text-white/30 uppercase tracking-widest">CHECK-IN WINDOW</h6>
                      <p className="text-sm text-white/60 leading-relaxed">{portalConfig.logistics.checkInWindow}</p>
                    </div>
                  </div>
                </div>
              </PortalSection>
            </>
          )}
        </main>
      </div>
    );
  }

  // --- LANDING PAGE RENDER ---
  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone font-sans selection:bg-aqua-primary/10 overflow-x-hidden">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-[100] px-8 py-4 flex items-center justify-between bg-[#faf9f6]/95 backdrop-blur-md border-b border-stone/5">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <Logo className="w-10 h-10" />
          <div className="leading-tight">
            <h1 className="text-[12px] tracking-[0.5em] font-black text-stone uppercase">AQUA JUDO</h1>
            <p className="text-[8px] tracking-[0.2em] font-bold text-aqua-primary uppercase opacity-70">ESTATE RESIDENCY</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {activePortalGuest && (
             <button onClick={() => setCurrentView('portal')} className="px-6 py-2.5 bg-aqua-primary text-stone rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl">
               <Key size={14} /> ACTIVE PORTAL
             </button>
           )}
           <button onClick={() => setShowLoginModal(true)} className="px-6 py-2.5 bg-[#111] text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-stone-light transition-all shadow-xl">
             <ShieldCheck size={14} className="text-aqua-primary" /> PORTAL
           </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none scale-100"><source src={HERO_VIDEO_URL} type="video/mp4" /></video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#faf9f6]/80 via-transparent to-[#faf9f6]"></div>
        
        <div className="relative z-10 space-y-8 max-w-4xl animate-fade-in pt-24 md:pt-32">
          <div className="space-y-4">
            <p className="text-[14px] md:text-[16px] tracking-[0.4em] text-stone font-black uppercase whitespace-nowrap">CABO SAN LUCAS • MEXICO</p>
            <h1 className="text-5xl md:text-7xl font-display font-light uppercase tracking-tighter leading-tight text-stone">
              AquaJudo Cabo <br/> 
              <span className="text-aqua-primary italic font-serif lowercase tracking-normal text-2xl md:text-4xl block mt-2">A 7-Day Private Coastal Residency</span>
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-stone-light/60 font-serif italic max-w-xl mx-auto leading-relaxed">
            Restorative movement and coastal exploration in a founder-led, alcohol-free estate.
          </p>
          
          <div className="pt-6">
             <button onClick={() => openInquiry()} className="bg-[#111] text-white px-10 py-4 rounded-full text-[12px] tracking-[0.3em] font-black uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group mx-auto">
               APPLY FOR RESIDENCY <Zap size={16} className="text-aqua-primary group-hover:rotate-12 transition-transform" />
             </button>
          </div>
        </div>
      </header>

      {/* PROMOTIONAL EXPERIENCE VIDEO (AUTOPLAYS ON ENTRY) */}
      <section className="py-24 px-6 bg-white border-t border-stone/5">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <p className="text-[11px] tracking-[0.5em] text-aqua-deep font-black uppercase opacity-40">ESTATE NARRATIVE</p>
            <h2 className="text-3xl md:text-5xl font-display font-light uppercase tracking-tighter">The Experience</h2>
          </div>
          
          <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl group cursor-pointer bg-parchment">
            <video 
              key={portalConfig.promoVideoUrl}
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90 group-hover:opacity-100"
            >
              <source src={portalConfig.promoVideoUrl} />
            </video>
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-transparent transition-colors">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                <Play size={28} className="text-white fill-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-10 left-10 md:bottom-12 md:left-12 space-y-2 pointer-events-none">
              <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] opacity-60">TECHNICAL IMMERSION</p>
              <h3 className="text-2xl md:text-4xl font-display font-light text-white uppercase tracking-tighter">Restoration in Motion</h3>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE GRID */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {villaRooms.map((room) => (
            <div key={room.id} className="relative group rounded-[2rem] overflow-hidden aspect-[1.8/1] md:aspect-[2/1] shadow-xl transition-all hover:shadow-2xl">
               <img src={room.image} alt={room.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
               <div className="absolute inset-0 bg-gradient-to-t from-stone/80 via-transparent to-transparent"></div>
               <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-10">
                  <h4 className="text-xl md:text-2xl font-black uppercase leading-tight text-white tracking-tighter">
                    {room.name}
                  </h4>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* ITINERARY */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-4xl mx-auto space-y-16">
           <div className="text-center space-y-4">
             <p className="text-[11px] tracking-[0.5em] text-aqua-deep font-black uppercase opacity-40">RESIDENCY RHYTHM</p>
             <h2 className="text-3xl md:text-5xl font-display font-light uppercase tracking-tighter">A 7-Day Technical Pathway</h2>
           </div>
           
           <div className="space-y-10">
             {itinerary.map((day: any) => (
               <div key={day.day} className="flex flex-col md:flex-row gap-6 items-start group border-b border-stone/5 pb-8 last:border-0">
                  <div className="md:w-1/4">
                    <span className="text-[12px] font-black uppercase tracking-[0.4em] text-aqua-primary opacity-50">DAY 0{day.day}</span>
                  </div>
                  <div className="md:w-3/4 space-y-2">
                    <h4 className="text-lg md:text-xl font-black uppercase leading-none tracking-tighter group-hover:text-aqua-primary transition-colors">{day.title}</h4>
                    <p className="text-base font-serif italic text-stone/40 leading-relaxed max-w-xl">{day.desc}</p>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* RESIDENCY WINDOWS */}
      <section className="py-24 bg-[#faf9f6] px-6 border-t border-stone/5">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <p className="text-[11px] tracking-[0.5em] text-aqua-deep font-black uppercase opacity-40">AVAILABILITY</p>
            <h2 className="text-3xl md:text-5xl font-display font-light uppercase tracking-tighter">Residency Windows</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Exactly three slots as requested */}
            {sessionsWithStats.slice(0, 3).map((s) => (
              <div key={s.id} className="bg-white p-10 rounded-[3rem] border border-stone/5 space-y-8 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between relative overflow-hidden">
                {s.status === 'Limited' && (
                  <div className="absolute top-0 right-0 px-6 py-2 bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-2xl">
                    ALMOST FULL
                  </div>
                )}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-aqua-primary">{new Date(s.startDate).toLocaleDateString('en-US', { year: 'numeric' })}</p>
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      s.status === 'Open' ? 'bg-green-500/10 text-green-600' : 
                      s.status === 'Limited' ? 'bg-amber-500/10 text-amber-600' : 
                      'bg-red-500/10 text-red-600'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-3xl font-black uppercase tracking-tighter text-stone group-hover:text-aqua-primary transition-colors">
                      {new Date(s.startDate).toLocaleDateString('en-US', { month: 'long' })}
                    </h4>
                    <p className="text-sm font-serif italic text-stone/40">
                      {new Date(s.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(s.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="h-px w-8 bg-stone/10 group-hover:w-full transition-all duration-500" />
                </div>
                
                <div className="space-y-6">
                  <p className="text-[11px] font-black uppercase tracking-widest text-stone/30">
                    {s.status === 'Full' ? 'NO SLOTS REMAINING' : `ONLY ${s.maxGuests - s.confirmedGuests} SLOTS REMAINING`}
                  </p>
                  <button 
                    onClick={() => openInquiry(s.id)}
                    disabled={s.status === 'Full'}
                    className={`w-full py-5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ${
                      s.status === 'Full' 
                        ? 'bg-stone/5 text-stone/20 cursor-not-allowed border border-stone/5' 
                        : 'bg-stone text-white hover:bg-aqua-primary hover:text-stone active:scale-95'
                    }`}
                  >
                    {s.status === 'Full' ? 'WAITLIST ONLY' : 'REQUEST ENTRY'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING REGISTRY */}
      <section className="py-24 bg-[#faf9f6] px-6">
        <div className="max-w-2xl mx-auto space-y-16">
          <div className="text-center space-y-4">
             <p className="text-[11px] tracking-[0.5em] text-aqua-deep font-black uppercase opacity-40">REGISTRY PRICING</p>
             <h2 className="text-3xl md:text-5xl font-display font-light uppercase tracking-tighter">Room Sanctuaries</h2>
          </div>
          
          <div className="divide-y divide-stone/10 border-t border-b border-stone/10">
            {villaRooms.map(room => (
              <div key={room.id} className="py-8 flex flex-col md:flex-row justify-between items-baseline md:items-center group cursor-pointer" onClick={() => openInquiry()}>
                 <div className="space-y-1">
                    <h4 className="text-2xl font-black uppercase tracking-tighter leading-none group-hover:text-aqua-primary transition-colors">{room.name}</h4>
                    <p className="text-[12px] font-serif italic text-stone/40">{room.bedType} • {room.bathType} Bath</p>
                 </div>
                 <div className="text-right mt-4 md:mt-0">
                    <p className="text-3xl md:text-4xl font-black tracking-tighter text-stone flex items-center justify-end">
                       <span className="text-base opacity-40 mr-1.5 font-bold">$</span>
                       {room.basePrice.toLocaleString()}
                    </p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-stone/5 bg-white">
        <div className="max-w-2xl mx-auto space-y-12">
          <div className="text-center space-y-3">
             <h2 className="text-[12px] font-black uppercase tracking-[0.6em] text-stone/20">ELIGIBILITY VERIFICATION</h2>
          </div>
          <div className="space-y-4">
             {faqs.map(faq => (
               <div key={faq.id} className="border-b border-stone/10 pb-6 last:border-0">
                  <button onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)} className="w-full text-left flex justify-between items-center group py-2">
                    <span className="text-base font-black uppercase tracking-tight group-hover:text-aqua-primary transition-colors">{faq.q}</span>
                    <ChevronDown size={18} className={`text-stone/20 transition-transform duration-300 ${openFaqId === faq.id ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaqId === faq.id && (
                    <div className="mt-4 text-[15px] font-serif italic text-stone/40 leading-relaxed animate-fade-in pr-6">
                      {faq.a}
                    </div>
                  )}
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 bg-white text-center border-t border-stone/10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-12">
          <Logo className="w-10 h-10 opacity-30 grayscale" />
          <p className="text-[11px] tracking-[0.8em] font-black text-stone/20 uppercase">AQUA JUDO ESTATE CABO</p>
          <div className="flex gap-8">
            <button onClick={() => setShowLegalModal('privacy')} className="text-[9px] font-bold uppercase tracking-widest text-stone/30 hover:text-aqua-primary transition-colors">Privacy Policy</button>
            <button onClick={() => setShowLegalModal('terms')} className="text-[9px] font-bold uppercase tracking-widest text-stone/30 hover:text-aqua-primary transition-colors">Terms of Use</button>
          </div>
        </div>
      </footer>

      {/* LEGAL MODALS */}
      {showLegalModal && (
        <div className="fixed inset-0 z-[1100] bg-[#111]/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-2xl p-12 rounded-[3rem] space-y-8 relative shadow-3xl max-h-[80vh] overflow-y-auto no-scrollbar">
            <button onClick={() => setShowLegalModal(null)} className="absolute top-8 right-8 text-stone/20 hover:text-stone transition-all"><X size={20}/></button>
            <h4 className="text-2xl font-black uppercase tracking-tighter text-stone">{showLegalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Use'}</h4>
            <div className="space-y-6 text-sm text-stone/50 font-serif leading-relaxed italic">
              {showLegalModal === 'privacy' ? (
                <>
                  <p>Your privacy is central to the Aqua Judo experience. We only collect essential registry information to facilitate your coastal residency and technical journey.</p>
                  <p>Information collected includes: Legal Name, Contact Information, and Technical Narrative. This data is never shared with third-party technical providers or marketing entities.</p>
                  <p>Residency data is stored securely on our estate management systems and is automatically archived 180 days following the conclusion of your residency.</p>
                </>
              ) : (
                <>
                  <p>By applying for an Aqua Judo residency, you agree to the estate technical protocols and foundational commitments.</p>
                  <p>Residencies are strictly alcohol-free. Non-compliance results in immediate revocation of sanctuary access without reimbursement of registry fees.</p>
                  <p>All technical sessions are introduction-level. Participants are responsible for disclosing physical limitations during the registry phase.</p>
                  <p>Registry deposits are non-refundable but transferable to future residency windows with 60-day notice.</p>
                </>
              )}
            </div>
            <button onClick={() => setShowLegalModal(null)} className="w-full py-5 bg-[#111] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-stone-light transition-all">Understood</button>
          </div>
        </div>
      )}

      {/* APPLICATION SYSTEM */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[600] bg-[#111]/98 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-[#faf9f6] w-full max-w-2xl rounded-[3rem] shadow-3xl overflow-hidden animate-reveal border border-stone/10">
            <div className="p-10 md:p-14 space-y-10 max-h-[90vh] overflow-y-auto no-scrollbar">
              <header className="flex justify-between items-start sticky top-0 bg-[#faf9f6] z-10 pb-4">
                <div>
                  <h2 className="text-3xl font-display font-light uppercase tracking-tighter text-stone">{applyStep === 5 ? 'Registry Confirmed' : 'Inquiry'}</h2>
                  {applyStep < 5 && <p className="text-[11px] font-black uppercase text-aqua-primary tracking-widest mt-2">Registry Phase {applyStep} of 4</p>}
                </div>
                <button onClick={() => setShowApplyModal(false)} className="p-4 bg-stone/5 rounded-full hover:bg-stone hover:text-white transition-all"><X size={18}/></button>
              </header>

              {applyStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">GUEST REGISTRY</p>
                    <input placeholder="FULL NAME" value={form.guestName} onChange={e => setForm({...form, guestName: e.target.value})} className="w-full bg-white rounded-2xl p-5 border border-stone/10 text-[13px] font-black uppercase tracking-tight outline-none focus:border-aqua-primary transition-colors shadow-sm" />
                  </div>
                  <input placeholder="EMAIL ADDRESS" type="email" value={form.guestEmail} onChange={e => setForm({...form, guestEmail: e.target.value})} className="w-full bg-white rounded-2xl p-5 border border-stone/10 text-[13px] outline-none focus:border-aqua-primary transition-colors shadow-sm" />
                  <input placeholder="PHONE / WHATSAPP" value={form.guestPhone} onChange={e => setForm({...form, guestPhone: e.target.value})} className="w-full bg-white rounded-2xl p-5 border border-stone/10 text-[13px] outline-none focus:border-aqua-primary transition-colors shadow-sm" />
                  <button onClick={() => setApplyStep(2)} className="w-full bg-[#111] text-white py-5 rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl mt-6 hover:bg-stone-light transition-all">NEXT PHASE</button>
                </div>
              )}

              {applyStep === 2 && (
                <div className="space-y-8 animate-fade-in">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest text-center">CHOOSE YOUR RESIDENCY WINDOW</p>
                    <div className="grid gap-3">
                      {sessionsWithStats.map(s => (
                        <button 
                          key={s.id} 
                          onClick={() => setForm({...form, sessionId: s.id})}
                          disabled={s.status === 'Full'}
                          className={`w-full p-5 rounded-3xl border flex items-center justify-between transition-all ${form.sessionId === s.id ? 'bg-aqua-primary/10 border-aqua-primary' : 'bg-white border-stone/10 hover:border-stone/30'} ${s.status === 'Full' ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          <div className="text-left">
                            <p className="text-sm font-black uppercase tracking-tight">{new Date(s.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                            <p className="text-[10px] font-serif italic text-stone/40">{new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${s.status === 'Open' ? 'bg-green-100 text-green-700' : s.status === 'Limited' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {s.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest text-center">SELECT YOUR SANCTUARY</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {villaRooms.map(r => (
                        <button 
                          key={r.id} 
                          onClick={() => setForm({...form, roomPreferenceId: r.id})}
                          className={`p-6 rounded-[2.5rem] border text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[140px] shadow-sm ${form.roomPreferenceId === r.id ? 'bg-aqua-primary/5 border-aqua-primary ring-1 ring-aqua-primary' : 'bg-white border-stone/10 hover:border-stone/20'}`}
                        >
                          <div className="z-10">
                            <p className="text-xs font-black uppercase tracking-widest mb-1">{r.name}</p>
                            <p className="text-[10px] font-serif italic text-stone/40">{r.bedType}</p>
                          </div>
                          <div className="z-10 mt-4 flex items-end justify-between">
                             <p className="text-lg font-black tracking-tighter text-stone">${r.basePrice.toLocaleString()}</p>
                             {form.roomPreferenceId === r.id && <Check size={16} className="text-aqua-primary" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setApplyStep(3)} 
                    disabled={!form.sessionId || !form.roomPreferenceId}
                    className="w-full bg-[#111] text-white py-5 rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl mt-4 disabled:opacity-20"
                  >
                    NEXT PHASE
                  </button>
                </div>
              )}

              {applyStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest text-center">ELIGIBILITY PROTOCOLS</p>
                  <div className="space-y-4">
                    <label className="flex items-start gap-5 p-6 border border-stone/10 bg-white rounded-3xl cursor-pointer hover:bg-stone/5 transition-colors group shadow-sm">
                      <input type="checkbox" className="mt-1 w-5 h-5 rounded border-stone/20 text-aqua-primary focus:ring-aqua-primary" checked={form.bathroomConsent} onChange={e => setForm({...form, bathroomConsent: e.target.checked})} />
                      <div className="space-y-1">
                        <span className="text-[12px] font-black uppercase tracking-widest text-stone group-hover:text-aqua-primary transition-colors">Shared Bathroom Protocol</span>
                        <p className="text-[10px] font-serif italic text-stone/40">I understand that the Balance and Flow sanctuaries use a shared protocol based on gender/group alignment.</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-5 p-6 border border-stone/10 bg-white rounded-3xl cursor-pointer hover:bg-stone/5 transition-colors group shadow-sm">
                      <input type="checkbox" className="mt-1 w-5 h-5 rounded border-stone/20 text-aqua-primary focus:ring-aqua-primary" checked={form.alcoholConsent} onChange={e => setForm({...form, alcoholConsent: e.target.checked})} />
                      <div className="space-y-1">
                        <span className="text-[12px] font-black uppercase tracking-widest text-stone group-hover:text-aqua-primary transition-colors">Alcohol-Free Commitment</span>
                        <p className="text-[10px] font-serif italic text-stone/40">I commit to maintaining an alcohol-free environment during the residency to support recovery and focus.</p>
                      </div>
                    </label>
                  </div>
                  <button onClick={() => setApplyStep(4)} disabled={!form.bathroomConsent || !form.alcoholConsent} className="w-full bg-[#111] text-white py-5 rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl mt-6 disabled:opacity-20 transition-all">CONTINUE</button>
                </div>
              )}

              {applyStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest text-center">FINAL NARRATIVE</p>
                    <textarea 
                      placeholder="Tell us briefly about your technical background and what draws you to this coastal residency..." 
                      value={form.healthNotes} 
                      onChange={e => setForm({...form, healthNotes: e.target.value})} 
                      className="w-full bg-white rounded-[2rem] p-8 border border-stone/10 text-[14px] font-serif italic min-h-[220px] outline-none focus:border-aqua-primary shadow-sm" 
                    />
                  </div>
                  <button onClick={submitApplication} disabled={loading} className="w-full bg-aqua-primary text-stone py-5 rounded-full text-[12px] font-black uppercase tracking-[0.3em] shadow-3xl active:scale-95 transition-all">TRANSMIT APPLICATION</button>
                </div>
              )}

              {applyStep === 5 && lastSubmittedApp && (
                <div className="space-y-8 animate-fade-in">
                  <div className="bg-white p-10 rounded-[2.5rem] border border-stone/5 space-y-8 shadow-sm">
                    <div className="flex items-center gap-4 border-b border-stone/5 pb-6">
                      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                        <Check size={28} className="text-green-500" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black uppercase tracking-tighter text-stone">Registry Received</h4>
                        <p className="text-[11px] font-black text-aqua-primary uppercase tracking-[0.3em] mt-1">Pending curator verification</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">REGISTRY ID</p>
                          <p className="text-lg font-black uppercase tracking-tight text-stone">{lastSubmittedApp.id}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">GUEST NAME</p>
                          <p className="text-lg font-black uppercase tracking-tight text-stone">{lastSubmittedApp.guestName}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">RESIDENCY WINDOW</p>
                          <p className="text-lg font-black uppercase tracking-tight text-stone">
                             {sessions.find(s => s.id === lastSubmittedApp.sessionId) 
                               ? `${new Date(sessions.find(s => s.id === lastSubmittedApp.sessionId)!.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${new Date(sessions.find(s => s.id === lastSubmittedApp.sessionId)!.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                               : 'Pending'}
                          </p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">SANCTUARY REQUEST</p>
                          <p className="text-lg font-black uppercase tracking-tight text-aqua-primary">{villaRooms.find(r => r.id === lastSubmittedApp.roomPreferenceId)?.name || 'Sanctuary TBD'}</p>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-stone/5 space-y-4">
                       <div className="flex items-center gap-3 text-stone/30">
                          <Info size={14} />
                          <p className="text-[10px] font-black uppercase tracking-widest">Next Steps</p>
                       </div>
                       <p className="text-sm font-serif italic text-stone/40 leading-relaxed">
                          Our curators will review your technical narrative within 48 hours. If approved, you will receive a magic link via email to access your guest portal and complete the registry deposit.
                       </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => {
                      const linkText = `Registry ID: ${lastSubmittedApp.id}\nWindow: ${sessions.find(s => s.id === lastSubmittedApp.sessionId)?.startDate}\nStatus: Pending`;
                      navigator.clipboard.writeText(linkText);
                      alert('Registry summary copied.');
                    }} className="flex-1 bg-white text-stone border border-stone/10 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-stone hover:text-white transition-all">
                      <Copy size={14} /> Copy Summary
                    </button>
                    <button onClick={() => setShowApplyModal(false)} className="flex-1 bg-[#111] text-white py-5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-stone-light transition-all">Return to Estate</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[1000] bg-[#111]/98 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-sm p-12 rounded-[3rem] space-y-8 text-center relative shadow-3xl">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-8 right-8 text-stone/20 hover:text-stone transition-all"><X size={20}/></button>
            <div className="space-y-2">
              <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-stone/30">ESTATE CURATOR</h4>
              <p className="text-[9px] font-bold text-aqua-primary uppercase tracking-widest">Administrative Verification</p>
            </div>
            <input 
              type="password" 
              placeholder="••••" 
              value={loginInput} 
              onChange={e => setLoginInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} 
              className="w-full bg-[#faf9f6] rounded-[2rem] px-6 py-5 text-center text-2xl font-display tracking-[0.4em] outline-none border border-stone/10 shadow-inner" 
              autoFocus 
            />
            <button onClick={handleAdminLogin} className="w-full py-5 bg-[#111] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-aqua-primary transition-all">ACCESS CONSOLE</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
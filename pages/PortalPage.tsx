
import React, { useState } from 'react';
import { 
  Anchor, Coffee, Zap, Shield, Clock, Compass, CheckCircle2, 
  MapPin, Home, Info, Calendar, ShieldCheck, Phone, 
  ArrowRight, ExternalLink, Check, Send, X, AlertCircle
} from 'lucide-react';
import { Logo } from '../components/Shared';

interface PortalPageProps {
  guest: any;
  session: any;
  room: any;
  portalConfig: any;
  itinerary: any[];
  onExit: () => void;
}

export const PortalPage: React.FC<PortalPageProps> = ({ guest, session, room, portalConfig, itinerary, onExit }) => {
  const [travelForm, setTravelForm] = useState({
    airline: '',
    flightNumber: '',
    arrivalTime: '',
    departureTime: '',
    emergencyContact: ''
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Dates pending';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-10 h-10 rounded-full bg-aqua-primary/10 flex items-center justify-center text-aqua-primary">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-aqua-primary">{subtitle || 'PROTOCOL'}</p>
        <h2 className="text-2xl font-display font-light uppercase tracking-tight text-stone">{title}</h2>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone font-sans selection:bg-aqua-primary/30">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <div className="hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone">AQUA JUDO</p>
            <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-stone/40">GUEST PORTAL</p>
          </div>
        </div>
        <button 
          onClick={onExit}
          className="px-6 py-2 bg-stone text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-aqua-primary hover:text-stone transition-all"
        >
          EXIT PORTAL
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-6 sm:px-12 pt-12 pb-12 space-y-12">
        
        {/* Welcome Header */}
        <section className="space-y-8 animate-reveal">
          <header className="space-y-4">
            <p className="text-[12px] font-black uppercase tracking-[0.4em] text-aqua-primary">GUEST PORTAL</p>
            <h1 className="text-6xl md:text-8xl font-display font-light uppercase tracking-tighter text-stone">
              Welcome, {guest.guestName.split(' ')[0]}
            </h1>
          </header>

          {/* Message from Founder */}
          <div className="space-y-6">
            {portalConfig.portalNote && (
              <div className="bg-aqua-primary/5 border border-aqua-primary/20 p-6 rounded-2xl flex items-start gap-4 animate-fade-in">
                <AlertCircle size={20} className="text-aqua-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-aqua-primary">IMPORTANT NOTICE</p>
                  <p className="text-sm font-serif italic text-stone/60 leading-relaxed">{portalConfig.portalNote}</p>
                </div>
              </div>
            )}
            
            <div className="bg-white p-8 md:p-12 rounded-[1rem] border border-stone/5 shadow-sm flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-aqua-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-xl">
              <img src="https://picsum.photos/seed/founder/200/200" alt="Founder" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-4 relative">
              <p className="text-[10px] font-black text-aqua-primary uppercase tracking-widest">A MESSAGE FROM THE FOUNDER</p>
              <p className="text-xl md:text-2xl font-serif italic text-stone/60 leading-relaxed">
                "{portalConfig.welcomeParagraph}"
              </p>
              <p className="text-[11px] font-black uppercase tracking-widest text-stone/30">— FOUNDER, AQUA JUDO CABO</p>
            </div>
          </div>
        </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-10 rounded-[1rem] border border-stone/5 shadow-sm flex flex-col justify-between h-full">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">RESIDENCY WINDOW</p>
                <p className="text-2xl font-black uppercase tracking-tight text-stone">
                  {formatDate(session?.startDate)} — {formatDate(session?.endDate)}
                </p>
              </div>
              <div className="pt-8 border-t border-stone/5 mt-8">
                <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">ASSIGNED CHAMBER</p>
                <p className="text-2xl font-black uppercase tracking-tight text-aqua-primary">{room?.name || 'ONYX SANCTUARY'}</p>
              </div>
            </div>
            <div className="bg-white p-10 rounded-[1rem] border border-stone/5 shadow-sm grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">CHECK-IN</p>
                <p className="text-2xl font-black uppercase tracking-tight text-stone">{portalConfig.logistics.checkInWindow || '3:00 PM'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">CHECK-OUT</p>
                <p className="text-2xl font-black uppercase tracking-tight text-stone">{portalConfig.logistics.checkOutTime || '11:00 AM'}</p>
              </div>
              <div className="col-span-2 pt-4">
                <p className="text-[11px] font-serif italic text-stone/40 leading-relaxed">
                  This page contains all necessary information for your stay. Please review it fully before arrival.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Residency */}
        <section className="space-y-8">
          <SectionHeader icon={Anchor} title="The Residency" subtitle="THE EXPERIENCE" />
          <div className="max-w-2xl space-y-6">
            <p className="text-lg font-serif italic text-stone/60 leading-relaxed">
              Aqua Judo Cabo is a 7-day private coastal residency limited to three guests.
            </p>
            <p className="text-sm font-black uppercase tracking-widest text-stone leading-loose">
              EACH MORNING BEGINS WITH FOUNDATIONAL JUDO ON SAND.<br />
              DAYS EXTEND TO THE WATER — PADDLE BOARDING, SWIMMING, AND COASTAL MOVEMENT.<br />
              EVENINGS ALLOW RECOVERY AND REST.
            </p>
            <p className="text-[11px] font-serif italic text-stone/30">
              The residency is structured, small by design, and alcohol-free.
            </p>
          </div>
        </section>

        {/* Your Chamber */}
        <section className="space-y-8">
          <SectionHeader icon={Coffee} title={`Your Chamber — ${room?.name || 'Onyx Sanctuary'}`} subtitle="ACCOMMODATION" />
          <p className="text-lg font-serif italic text-stone/60">You have been assigned {room?.name || 'Onyx Sanctuary'}.</p>
          
          <div className="relative aspect-[21/9] rounded-[1rem] overflow-hidden shadow-2xl group">
            <img 
              src={room?.image || "https://picsum.photos/seed/chamber/1200/600"} 
              alt="Chamber" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone/80 via-stone/20 to-transparent" />
            <div className="absolute bottom-12 left-12">
              <h3 className="text-4xl font-display font-light text-white uppercase tracking-tighter">{room?.name || 'ONYX SANCTUARY'}</h3>
            </div>
          </div>

          <div className="max-w-2xl space-y-6 pt-4">
            <p className="text-sm text-stone/50 leading-relaxed">
              Full chamber details, materials, and layout are described on the main website. If your chamber includes a shared bathroom, it is shared only with another guest within this residency.
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-aqua-primary">
              RESPECT FOR SHARED SPACE IS EXPECTED AT ALL TIMES.
            </p>
          </div>
        </section>

        {/* Estate Experiences */}
        <section className="space-y-8">
          <SectionHeader icon={Zap} title="Estate Experiences" subtitle="CURATED ACTIVITIES" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(portalConfig.experiences || []).map((exp: any, i: number) => (
              <div key={i} className="bg-white p-10 rounded-[1rem] border border-stone/5 shadow-sm space-y-6">
                <div className="flex justify-between items-start">
                  <h4 className="text-[14px] font-black uppercase tracking-tight text-stone">{exp.title}</h4>
                  <span className="text-[8px] font-black px-2 py-1 bg-aqua-primary/10 text-aqua-primary rounded-full tracking-widest">{exp.technicalLevel?.toUpperCase()}</span>
                </div>
                <p className="text-[13px] font-serif italic text-stone/40 leading-relaxed">{exp.description}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-stone/20">FREQUENCY: {exp.frequency?.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </section>

        {/* House Guidelines */}
        <section className="space-y-8">
          <SectionHeader icon={Shield} title="House Guidelines" subtitle="ESTATE PROTOCOL" />
          <div className="space-y-4">
            {portalConfig.houseGuidelines.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-8 p-8 bg-white rounded-[2.5rem] border border-stone/5 shadow-sm group hover:border-aqua-primary/20 transition-all">
                <div className="w-12 h-12 rounded-full bg-stone/5 flex items-center justify-center text-stone/20 font-display text-xl group-hover:bg-aqua-primary/10 group-hover:text-aqua-primary transition-all">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="space-y-2">
                  <h4 className="text-[14px] font-black uppercase tracking-tight text-stone">{item.title}</h4>
                  <p className="text-[13px] font-serif italic text-stone/40 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-aqua-primary pt-4">
            ADHERENCE TO THESE GUIDELINES ENSURES A FOCUSED ENVIRONMENT FOR ALL GUESTS.
          </p>
        </section>

        {/* 7-Day Rhythm */}
        <section className="space-y-8">
          <SectionHeader icon={Clock} title="7-Day Rhythm" subtitle="ITINERARY" />
          <div className="space-y-2">
            {itinerary.map((day: any, i: number) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-12 py-8 border-b border-stone/5 items-start">
                <p className="text-[10px] font-black uppercase tracking-widest text-aqua-primary">DAY {day.day}</p>
                <div className="md:col-span-3 space-y-2">
                  <h4 className="text-[14px] font-black uppercase tracking-tight text-stone">{day.title}</h4>
                  <p className="text-[13px] font-serif italic text-stone/40 leading-relaxed">{day.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-stone/20 pt-4">
            SCHEDULE MAY ADJUST BASED ON OCEAN AND WEATHER CONDITIONS.
          </p>
        </section>

        {/* Preparation */}
        <section className="space-y-8">
          <SectionHeader icon={Compass} title="Preparation" subtitle="LOGISTICS" />
          
          <div className="space-y-8">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-stone/30">WHAT TO BRING</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {portalConfig.packingList.map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-stone/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-aqua-primary" />
                  <span className="text-[12px] font-black uppercase tracking-widest text-stone/60">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8 pt-8">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-stone/30">PHYSICAL READINESS</h5>
            <div className="space-y-4">
              <p className="text-[13px] font-serif italic text-stone/50">You must be:</p>
              {[
                'COMFORTABLE SWIMMING',
                'CAPABLE OF MODERATE PHYSICAL ACTIVITY',
                'HONEST ABOUT ANY INJURIES OR LIMITATIONS'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Check size={14} className="text-aqua-primary" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-stone">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] font-serif italic text-stone/30 pt-4">
              If you have not already disclosed medical considerations, notify us immediately.
            </p>
          </div>
        </section>

        {/* What is Provided */}
        <section className="space-y-8">
          <SectionHeader icon={CheckCircle2} title="What is Provided" subtitle="ESTATE AMENITIES" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'PADDLE BOARDS', 'MASKS AND SNORKELS', 'BEACH SEATING', 
              'STRUCTURED INSTRUCTION', 'ACCOMMODATION AS ASSIGNED'
            ].map((item, i) => (
              <div key={i} className="bg-white px-8 py-6 rounded-2xl border border-stone/5 shadow-sm flex items-center gap-4">
                <Check size={16} className="text-aqua-primary" />
                <span className="text-[11px] font-black uppercase tracking-widest text-stone">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Travel & Arrival */}
        <section className="space-y-8">
          <SectionHeader icon={MapPin} title="Travel & Arrival" subtitle="TRANSPORTATION" />
          
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone/30">AIRPORT</p>
              <p className="text-[13px] font-serif italic text-stone/50">Closest airport:</p>
              <p className="text-2xl font-black uppercase tracking-tight text-stone">LOS CABOS INTERNATIONAL AIRPORT (SJD)</p>
              <p className="text-[11px] font-serif italic text-stone/30">Plan arrival to allow time for transport and settling before check-in.</p>
            </div>

            <div className="space-y-6 pt-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone/30">TRANSPORTATION</p>
              <p className="text-[13px] font-serif italic text-stone/50">You may choose:</p>
              <div className="flex flex-wrap gap-4">
                {['TAXI FROM AIRPORT', 'PRIVATE TRANSFER', 'RENTAL CAR (RECOMMENDED)'].map((opt, i) => (
                  <div key={i} className="px-6 py-4 bg-white rounded-xl border border-stone/5 text-[10px] font-black uppercase tracking-widest text-stone shadow-sm">
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Property Address */}
        <section className="space-y-8">
          <SectionHeader icon={Home} title="Property Address" subtitle="LOCATION" />
          <div className="bg-stone p-12 rounded-[1rem] text-white space-y-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-aqua-primary/10 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-aqua-primary/20 transition-all duration-1000" />
            <div className="space-y-2 relative">
              <p className="text-[10px] font-black text-aqua-primary uppercase tracking-widest">EXACT ADDRESS</p>
              <p className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight">
                {portalConfig.logistics.address}
              </p>
            </div>
            <a 
              href={portalConfig.logistics.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(portalConfig.logistics.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 w-fit"
            >
              <MapPin size={14} className="text-aqua-primary" /> GOOGLE MAPS LINK <ExternalLink size={12} />
            </a>
            <p className="text-[11px] font-serif italic opacity-40 relative">Please use the exact address provided above.</p>
          </div>
        </section>

        {/* Check-in Instructions */}
        <section className="space-y-8">
          <SectionHeader icon={Info} title="Check-in Instructions" subtitle="ARRIVAL" />
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone/30">ARRIVAL WINDOW</p>
              <p className="text-2xl font-black uppercase tracking-tight text-stone">{portalConfig.logistics.checkInWindow}</p>
            </div>
            <div className="space-y-6">
              <p className="text-[13px] font-serif italic text-stone/50">Upon arrival:</p>
              <div className="bg-white p-8 rounded-2xl border border-stone/5 shadow-sm">
                <p className="text-[14px] font-black uppercase tracking-widest text-stone leading-relaxed">
                  {portalConfig.logistics.gateInstructions}
                </p>
              </div>
            </div>
            <p className="text-[11px] font-serif italic text-stone/30">If delayed, notify via WhatsApp immediately.</p>
          </div>
        </section>

        {/* Policies & Agreements */}
        <section className="space-y-8">
          <SectionHeader icon={ShieldCheck} title="Policies & Agreements" subtitle="LEGAL" />
          <div className="space-y-6">
            <p className="text-[13px] font-serif italic text-stone/50">By participating, you acknowledge:</p>
            <div className="space-y-4">
              {[
                'THIS RESIDENCY IS ALCOHOL-FREE.',
                'YOU ACCEPT THE INHERENT RISKS OF OCEAN AND PHYSICAL ACTIVITY.',
                'YOU WILL FOLLOW ALL SAFETY INSTRUCTIONS.',
                'RESPECT FOR OTHER GUESTS AND SHARED SPACES IS REQUIRED.'
              ].map((policy, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Check size={14} className="text-aqua-primary" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-stone">{policy}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-stone/20 pt-8 border-t border-stone/5">
              SIGNED AGREEMENTS ARE RETAINED ON FILE.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-8">
          <SectionHeader icon={Phone} title="Contact" subtitle="CONCIERGE" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-stone/30">PRIMARY WHATSAPP</p>
              <p className="text-[16px] font-black uppercase tracking-tight text-stone">{portalConfig.logistics.whatsappContact}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-stone/30">EMAIL</p>
              <p className="text-[16px] font-black uppercase tracking-tight text-stone">{portalConfig.logistics.emailContact}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-red-400/40">EMERGENCY ONLY</p>
              <p className="text-[16px] font-black uppercase tracking-tight text-red-400">{portalConfig.logistics.emergencyPhone}</p>
            </div>
          </div>
          <p className="text-[11px] font-serif italic text-stone/30">Please review this page before reaching out with questions.</p>
        </section>

        {/* Footer */}
        <footer className="pt-12 text-center space-y-8">
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-stone/20">PORTAL ACCESS</p>
            <p className="text-[11px] font-serif italic text-stone/30">Your access to this page will expire three days after the residency concludes.</p>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone/10">END OF PORTAL</p>
          <div className="pt-6 opacity-10">
            <Logo className="w-12 h-12 mx-auto" />
          </div>
        </footer>

      </main>
    </div>
  );
};

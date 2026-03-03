
import React, { useState, useRef } from 'react';
import { Zap, Play, ChevronDown, Pause, MapPin } from 'lucide-react';
import { RoomDetailModal } from '../components/Modals';
import { Room } from '../types';

const HERO_VIDEO_URL = "https://player.vimeo.com/external/494294683.hd.mp4?s=d038743f38c3933c16a3f169f4935f8d29837a7b&profile_id=174";

interface LandingPageProps {
  sessions: any[];
  rooms: Room[];
  itinerary: any[];
  faqs: any[];
  promoVideoUrl: string;
  residenceVideoUrl: string;
  onApplyClick: (sessionId?: string, roomId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ sessions, rooms, itinerary, faqs, promoVideoUrl, residenceVideoUrl, onApplyClick }) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [selectedRoomDetail, setSelectedRoomDetail] = useState<Room | null>(null);
  const [isPromoPlaying, setIsPromoPlaying] = useState(false);
  const [isResidenceVideoPlaying, setIsResidenceVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const residenceVideoRef = useRef<HTMLVideoElement>(null);
  const availabilityRef = useRef<HTMLElement>(null);

  const scrollToAvailability = () => {
    availabilityRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const togglePromoPlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        videoRef.current.muted = false; // Unmute when user explicitly plays
        setIsPromoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPromoPlaying(false);
      }
    }
  };

  const toggleResidenceVideoPlay = () => {
    if (residenceVideoRef.current) {
      if (residenceVideoRef.current.paused) {
        residenceVideoRef.current.play();
        residenceVideoRef.current.muted = false;
        setIsResidenceVideoPlaying(true);
      } else {
        residenceVideoRef.current.pause();
        setIsResidenceVideoPlaying(false);
      }
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const activeSessions = sessions.filter(s => s.startDate >= today);

  const handleRequestAccessFromModal = (roomId: string) => {
    setSelectedRoomDetail(null);
    onApplyClick(undefined, roomId);
  };

  return (
    <main>
      {/* HERO SECTION - Updated to match attached image style */}
      <header className="relative flex flex-col items-center justify-center text-center px-6 bg-[#faf9f6] overflow-hidden pt-12 pb-4 sm:pt-20 sm:pb-6">
        {/* Extremely subtle background video to maintain the "clean" image look while keeping the feature available */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-[0.03] pointer-events-none"
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>

        <div className="relative z-10 space-y-6 sm:space-y-8 max-w-5xl animate-fade-in flex flex-col items-center pt-10 sm:pt-4 pb-6">
          <div className="space-y-4 sm:space-y-6">
            <p className="text-[10px] sm:text-[12px] md:text-[14px] tracking-[0.3em] sm:tracking-[0.6em] text-stone font-black uppercase opacity-90">
              CABO SAN LUCAS • MEXICO
            </p>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-medium uppercase tracking-tight text-stone leading-[0.95] sm:leading-[0.9]">
                AQUA JUDO CABO
              </h1>
              <p className="text-aqua-primary italic font-serif lowercase text-xl sm:text-3xl md:text-4xl tracking-normal">
                A 7-day private coastal residency for men who want a reset
              </p>
            </div>
          </div>

          <div className="pt-4 w-full flex justify-center">
            <button
              onClick={scrollToAvailability}
              className="bg-[#111] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full text-[11px] sm:text-[13px] tracking-[0.15em] sm:tracking-[0.2em] font-black uppercase shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 sm:gap-4 group whitespace-nowrap"
            >
              APPLY FOR RESIDENCY
              <Zap size={18} className="text-aqua-primary fill-aqua-primary group-hover:rotate-12 transition-transform shrink-0" />
            </button>
          </div>
        </div>
      </header>

      {/* PROMO VIDEO */}
      <section className="py-12 px-6 bg-white border-t border-stone/5">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <p className="text-[11px] tracking-[0.5em] text-aqua-deep font-black uppercase">ESSATE NARRATIVE</p>
            <h2 className="text-3xl md:text-5xl font-display font-light uppercase tracking-tighter">The Experience</h2>
          </div>
          <div className="text-center space-y-4">
            <p className="text-[15px] font-medium tracking-tight text-stone leading-[0.95] sm:leading-[0.9] font-black">Ocean-based training and judo fundamentals for structural recalibration</p>
          </div>
          <div
            className="relative aspect-[13/9] sm:aspect-video rounded-[1rem] overflow-hidden shadow-2xl group cursor-pointer bg-parchment"
            onClick={() => {
              if (!isPromoPlaying) togglePromoPlay();
            }}
          >
            <video
              ref={videoRef}
              key={promoVideoUrl}
              src={promoVideoUrl}
              loop
              muted
              playsInline
              controls={isPromoPlaying}
              onPlay={() => setIsPromoPlaying(true)}
              onPause={() => setIsPromoPlaying(false)}
              className={`w-full h-full object-cover transition-transform duration-1000 opacity-90 ${!isPromoPlaying ? 'group-hover:scale-105' : ''}`}
            />
            {!isPromoPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-2xl transform group-hover:scale-110 transition-transform">
                  <Play size={32} className="text-white fill-white ml-1" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ROOMS GRID */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-6 mb-20 animate-fade-in">
          <p className="text-[11px] tracking-[0.5em] text-aqua-deep font-black uppercase opacity-40">Three guest chambers. One private residence.</p>
          <h2 className="text-3xl md:text-5xl font-display font-light uppercase tracking-tighter">THE RESIDENCE</h2>
        </div>
        <div className="text-center space-y-4 mb-12">
          <p className="text-[15px] font-medium tracking-tight text-stone leading-[0.95] sm:leading-[0.9] font-black">A private coastal sanctuary in the gated community of Cabo Bello with semi-private beach access.</p>
        </div>

        {/* RESIDENCE OVERVIEW VIDEO */}
        <div 
          className="relative aspect-[16/9] md:aspect-[21/9] rounded-[1rem] overflow-hidden shadow-2xl group mb-16 bg-stone/5"
          onClick={() => {
            if (!isResidenceVideoPlaying) toggleResidenceVideoPlay();
          }}
        >
          <video
            ref={residenceVideoRef}
            key={residenceVideoUrl}
            src={residenceVideoUrl}
            loop
            muted
            playsInline
            controls={isResidenceVideoPlaying}
            onEnded={() => setIsResidenceVideoPlaying(false)}
            onPlay={() => setIsResidenceVideoPlaying(true)}
            onPause={() => setIsResidenceVideoPlaying(false)}
            className={`w-full h-full object-cover transition-transform duration-1000 ${!isResidenceVideoPlaying ? 'group-hover:scale-105' : ''}`}
          />
          {!isResidenceVideoPlaying && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group/overlay">
              <div className="w-20 h-20 md:w-28 md:h-28 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                <Play size={40} className="text-white fill-white ml-1" />
              </div>

              <h3 className="absolute bottom-6 md:bottom-10 left-0 right-0 text-center text-xl md:text-4xl font-display font-light text-white uppercase tracking-[0.3em] opacity-90">PROPERTY OVERVIEW</h3>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoomDetail(room)}
              className="relative group rounded-[2.5rem] overflow-hidden aspect-[3/2] shadow-2xl text-left"
            >
              <img src={room.image} alt={room.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone/90 via-stone/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-8 left-8 z-10">
                <h4 className="text-2xl font-black uppercase leading-tight text-white tracking-tighter">{room.name}</h4>
              </div>
            </button>
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

      {/* SESSIONS */}
      <section ref={availabilityRef} className="py-24 bg-[#faf9f6] px-6 border-t border-stone/5">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <p className="text-[11px] tracking-[0.5em] text-aqua-deep font-black uppercase opacity-40">AVAILABILITY</p>
            <h2 className="text-3xl md:text-5xl font-display font-light uppercase tracking-tighter">Residency Windows</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activeSessions.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[1rem] border border-stone/5 border-dashed">
                <p className="text-stone/20 font-black uppercase tracking-widest text-[11px]">No upcoming residency windows scheduled</p>
              </div>
            ) : (
              activeSessions.map((s) => (
                <div key={s.id} className="bg-white p-10 rounded-[1rem] border border-stone/5 space-y-8 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-aqua-primary">{new Date(s.startDate).getFullYear()}</p>
                      <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-stone/5">{s.status}</span>
                    </div>
                    <h4 className="text-3xl font-black uppercase tracking-tighter text-stone">{new Date(s.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4>
                    <p className="text-sm font-serif italic text-stone/40">{new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => onApplyClick(s.id)}
                    disabled={s.status === 'Full'}
                    className={`w-full py-5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-lg transition-all ${s.status === 'Full' ? 'bg-stone/5 text-stone/20 cursor-not-allowed' : 'bg-stone text-white hover:bg-aqua-primary hover:text-stone'}`}
                  >
                    {s.status === 'Full' ? 'WAITLIST ONLY' : 'REQUEST ENTRY'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* REGISTRY PRICING - Sanctuary Selections */}
      <section className="py-24 px-6 border-t border-stone/5 bg-white">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <p className="text-[11px] tracking-[0.5em] text-aqua-deep font-black uppercase opacity-40">REGISTRY PRICING</p>
            <h2 className="text-3xl md:text-5xl font-display font-light uppercase tracking-tighter">Sanctuary Selections</h2>
          </div>
          <div className="divide-y divide-stone/10 border-t border-stone/10">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoomDetail(room)}
                className="w-full py-12 flex flex-col md:flex-row justify-between items-baseline gap-4 group text-left hover:bg-stone/5 transition-colors px-4 rounded-xl"
              >
                <div className="space-y-1">
                  <h4 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-stone">{room.name}</h4>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-light text-stone/40">$</span>
                    <span className="text-4xl md:text-5xl font-bold tracking-tight text-stone">
                      {room.basePrice.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-sm md:text-base font-black text-stone/20 tracking-[0.2em] uppercase">USD</span>
                </div>
              </button>
            ))}
          </div>
          <div className="pt-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-aqua-primary/60">Registry inclusions: Private SJD Transfer • All-Inclusive Estate Dining • Technical Guidance</p>
          </div>
        </div>
      </section>

      {/* ARRIVAL LOGISTICS */}
      <section className="py-24 px-6 border-t border-stone/5 bg-[#faf9f6]">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex items-center gap-3">
            <MapPin size={20} className="text-aqua-primary" />
            <h2 className="text-[11px] tracking-[0.5em] text-aqua-deep font-black uppercase opacity-40">ARRIVAL LOGISTICS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {/* Estate Address */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone/40">ESTATE ADDRESS</label>
              <div className="bg-white p-5 rounded-xl border border-stone/5 text-stone font-medium">
                Calle Vista al Mar 104, Pedregal, Cabo San Lucas
              </div>
            </div>

            {/* Google Maps Link */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone/40">GOOGLE MAPS LINK</label>
              <a 
                href="https://maps.google.com/?q=Calle+Vista+al+Mar+104,+Pedregal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-white p-5 rounded-xl border border-aqua-primary/50 text-aqua-deep font-medium hover:bg-aqua-primary/5 transition-colors truncate"
              >
                https://maps.google.com/?q=Calle+Vista+al+Mar+104,+Pedregal
              </a>
            </div>

            {/* Check-in Window */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone/40">CHECK-IN WINDOW</label>
              <div className="bg-white p-5 rounded-xl border border-stone/5 text-stone font-medium">
                3:00 PM
              </div>
            </div>

            {/* Check-out Time */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone/40">CHECK-OUT TIME</label>
              <div className="bg-white p-5 rounded-xl border border-stone/5 text-stone font-medium">
                11:00 AM
              </div>
            </div>

            {/* WhatsApp Contact */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone/40">WHATSAPP CONTACT</label>
              <div className="bg-white p-5 rounded-xl border border-stone/5 text-stone font-medium">
                +52 624 555 0192
              </div>
            </div>

            {/* Email Contact */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone/40">EMAIL CONTACT</label>
              <div className="bg-white p-5 rounded-xl border border-stone/5 text-stone font-medium">
                concierge@aquajudo-cabo.com
              </div>
            </div>

            {/* Emergency Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone/40">EMERGENCY PHONE</label>
              <div className="bg-white p-5 rounded-xl border border-stone/5 text-stone font-medium">
                +52 624 555 9999
              </div>
            </div>

            {/* Gated Access Instructions */}
            <div className="col-span-full space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone/40">GATED ACCESS INSTRUCTIONS</label>
              <div className="bg-white p-5 rounded-xl border border-stone/5 text-stone font-medium leading-relaxed">
                Present your registry ID to the Pedregal security gate. Mention "Estate Judo 104".
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-stone/5 bg-white">
        <div className="max-w-2xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <p className="text-[11px] tracking-[0.5em] text-aqua-deep font-black uppercase opacity-40">ELIGIBILITY VERIFICATION</p>
            <h2 className="text-3xl md:text-5xl font-display font-light uppercase tracking-tighter">Common Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map(faq => (
              <div key={faq.id} className="border-b border-stone/10 pb-6 last:border-0">
                <button onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)} className="w-full text-left flex justify-between items-center group py-2">
                  <span className="text-base font-black uppercase tracking-tight group-hover:text-aqua-primary transition-colors">{faq.q}</span>
                  <ChevronDown size={18} className={`text-stone/20 transition-transform ${openFaqId === faq.id ? 'rotate-180' : ''}`} />
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

      {/* Room Detail Modal */}
      {selectedRoomDetail && (
        <RoomDetailModal
          room={selectedRoomDetail}
          onClose={() => setSelectedRoomDetail(null)}
          onRequestAccess={handleRequestAccessFromModal}
        />
      )}
    </main>
  );
};

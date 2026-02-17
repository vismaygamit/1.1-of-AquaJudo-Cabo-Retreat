
import React, { useState } from 'react';
import { Zap, Play, ChevronDown } from 'lucide-react';
import { RoomDetailModal } from '../components/Modals';
import { Room } from '../types';

const HERO_VIDEO_URL = "https://player.vimeo.com/external/494294683.hd.mp4?s=d038743f38c3933c16a3f169f4935f8d29837a7b&profile_id=174";

interface LandingPageProps {
  sessions: any[];
  rooms: Room[];
  itinerary: any[];
  faqs: any[];
  promoVideoUrl: string;
  onApplyClick: (sessionId?: string, roomId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ sessions, rooms, itinerary, faqs, promoVideoUrl, onApplyClick }) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [selectedRoomDetail, setSelectedRoomDetail] = useState<Room | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const activeSessions = sessions.filter(s => s.startDate >= today);

  const handleRequestAccessFromModal = (roomId: string) => {
    setSelectedRoomDetail(null);
    onApplyClick(undefined, roomId);
  };

  return (
    <main>
      {/* HERO SECTION - Updated to match attached image style */}
      <header className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 bg-[#faf9f6] overflow-hidden">
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

        <div className="relative z-10 space-y-10 max-w-5xl animate-fade-in flex flex-col items-center">
          <div className="space-y-6">
            <p className="text-[12px] md:text-[14px] tracking-[0.6em] text-stone font-black uppercase opacity-90">
              CABO SAN LUCAS • MEXICO
            </p>
            
            <div className="space-y-2">
              <h1 className="text-6xl md:text-8xl font-display font-medium uppercase tracking-tight text-stone leading-[0.9]">
                AQUA JUDO CABO
              </h1>
              <p className="text-aqua-primary italic font-serif lowercase text-3xl md:text-4xl tracking-normal">
                a 7-day private coastal residency
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={() => onApplyClick()} 
              className="bg-[#111] text-white px-12 py-5 rounded-full text-[13px] tracking-[0.2em] font-black uppercase shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group"
            >
              APPLY FOR RESIDENCY 
              <Zap size={18} className="text-aqua-primary fill-aqua-primary group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* PROMO VIDEO */}
      <section className="py-24 px-6 bg-white border-t border-stone/5">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <p className="text-[11px] tracking-[0.5em] text-aqua-deep font-black uppercase opacity-40">ESTATE NARRATIVE</p>
            <h2 className="text-3xl md:text-5xl font-display font-light uppercase tracking-tighter">The Experience</h2>
          </div>
          <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl group cursor-pointer bg-parchment">
            <video 
              key={promoVideoUrl}
              src={promoVideoUrl}
              autoPlay 
              loop 
              muted 
              playsInline 
              controls
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-transparent transition-colors pointer-events-none">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                <Play size={28} className="text-white fill-white ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROOMS GRID */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <button 
              key={room.id} 
              onClick={() => setSelectedRoomDetail(room)}
              className="relative group rounded-[2rem] overflow-hidden aspect-[1.8/1] md:aspect-[2/1] shadow-xl text-left"
            >
               <img src={room.image} alt={room.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
               <div className="absolute inset-0 bg-gradient-to-t from-stone/80 via-transparent to-transparent"></div>
               <div className="absolute bottom-6 left-6 z-10">
                  <h4 className="text-xl md:text-2xl font-black uppercase leading-tight text-white tracking-tighter">{room.name}</h4>
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
      <section className="py-24 bg-[#faf9f6] px-6 border-t border-stone/5">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <p className="text-[11px] tracking-[0.5em] text-aqua-deep font-black uppercase opacity-40">AVAILABILITY</p>
            <h2 className="text-3xl md:text-5xl font-display font-light uppercase tracking-tighter">Residency Windows</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activeSessions.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-stone/5 border-dashed">
                <p className="text-stone/20 font-black uppercase tracking-widest text-[11px]">No upcoming residency windows scheduled</p>
              </div>
            ) : (
              activeSessions.map((s) => (
                <div key={s.id} className="bg-white p-10 rounded-[3rem] border border-stone/5 space-y-8 shadow-sm flex flex-col justify-between">
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
                  <p className="text-sm md:text-base font-serif italic text-stone/30">
                    {room.bedType} • <span className="lowercase">{room.bathType} Bath</span>
                  </p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-light text-stone/40">$</span>
                  <span className="text-4xl md:text-5xl font-bold tracking-tight text-stone">
                    {room.basePrice.toLocaleString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="pt-8 text-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-aqua-primary/60">Registry inclusions: Private SJD Transfer • All-Inclusive Estate Dining • Technical Guidance</p>
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

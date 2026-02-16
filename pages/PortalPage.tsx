
import React from 'react';
import { Film, Clock, Coffee, ShieldCheck, Package, MapPin, Info } from 'lucide-react';
import { PortalSection } from '../components/Shared';

interface PortalPageProps {
  guest: any;
  session: any;
  room: any;
  portalConfig: any;
}

export const PortalPage: React.FC<PortalPageProps> = ({ guest, session, room, portalConfig }) => {
  return (
    <main className="max-w-4xl mx-auto px-8 pt-32 pb-40 divide-y divide-stone/5">
      <section className="pb-20 space-y-8 animate-fade-in">
        <header className="space-y-4">
          <p className="text-[12px] font-black uppercase tracking-[0.4em] text-aqua-primary">GUEST REGISTRY</p>
          <h1 className="text-5xl md:text-7xl font-display font-light uppercase tracking-tighter text-stone">
            Greetings, {guest.guestName.split(' ')[0]}
          </h1>
        </header>
        <div className="grid md:grid-cols-2 gap-8 pt-8">
          <div className="p-10 bg-white rounded-[2.5rem] border border-stone/5 space-y-6 shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">RESIDENCY WINDOW</p>
              <p className="text-xl font-black uppercase tracking-tight text-stone">
                {session ? `${new Date(session.startDate).toLocaleDateString()} — ${new Date(session.endDate).toLocaleDateString()}` : 'Dates pending'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-stone/20 uppercase tracking-widest">ASSIGNED SANCTUARY</p>
              <p className="text-xl font-black uppercase tracking-tight text-aqua-primary">{room?.name || 'Sanctuary TBD'}</p>
            </div>
          </div>
          <div className="p-10 bg-white rounded-[2.5rem] border border-stone/5 space-y-6 shadow-sm flex flex-col justify-center">
            <p className="text-[13px] font-serif italic text-stone/40 leading-relaxed">
              "{portalConfig.welcomeParagraph}"
            </p>
          </div>
        </div>
      </section>

      <PortalSection title="The Experience" subtitle="Estate Narrative" icon={Film}>
        <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl bg-parchment">
          <video 
            key={portalConfig.promoVideoUrl}
            src={portalConfig.promoVideoUrl}
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          />
        </div>
      </PortalSection>

      <PortalSection title="Your Sanctuary" icon={Coffee}>
        {room && (
          <div className="space-y-10">
            <div className="aspect-[2/1] rounded-[3rem] overflow-hidden shadow-2xl relative">
              <img src={room.image} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone/60 to-transparent"></div>
              <div className="absolute bottom-10 left-10">
                <h3 className="text-3xl font-display font-light text-white uppercase tracking-tighter">{room.name}</h3>
              </div>
            </div>
          </div>
        )}
      </PortalSection>

      <PortalSection title="House Guidelines" subtitle="Estate Protocol" icon={ShieldCheck}>
        <div className="grid gap-6">
          {portalConfig.houseGuidelines.map((item: any, i: number) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-stone/5 shadow-sm space-y-3">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-aqua-primary">{item.title}</h5>
              <p className="text-[14px] font-serif italic text-stone/50 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </PortalSection>

      <PortalSection title="Packing Inventory" icon={Package}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          {portalConfig.packingList.map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-stone/5">
              <div className="w-2 h-2 rounded-full bg-aqua-primary/30" />
              <span className="text-[13px] font-black uppercase tracking-widest text-stone/60">{item}</span>
            </div>
          ))}
        </div>
      </PortalSection>

      <PortalSection title="Arrival & Access" icon={MapPin}>
        <div className="space-y-6">
          <div className="p-10 bg-stone rounded-[3rem] text-white space-y-8 shadow-xl">
            <div className="space-y-2">
              <h6 className="text-[10px] font-black text-aqua-primary uppercase tracking-widest">ESTATE ADDRESS</h6>
              <p className="text-xl md:text-2xl font-black uppercase tracking-tight">{portalConfig.logistics.address}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h6 className="text-[10px] font-black text-aqua-primary/40 uppercase tracking-widest">SECURITY PROTOCOL</h6>
                <p className="text-[13px] font-serif italic opacity-70 leading-relaxed">{portalConfig.logistics.gateInstructions}</p>
              </div>
              <div className="space-y-2">
                <h6 className="text-[10px] font-black text-aqua-primary/40 uppercase tracking-widest">CHECK-IN WINDOW</h6>
                <p className="text-[13px] font-serif italic opacity-70 leading-relaxed">{portalConfig.logistics.checkInWindow}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 px-8 py-4 bg-aqua-primary/5 rounded-2xl text-aqua-primary border border-aqua-primary/10">
            <div className="flex-shrink-0">
              <Info size={18} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest">Present your registry ID for gate access.</p>
          </div>
        </div>
      </PortalSection>
    </main>
  );
};

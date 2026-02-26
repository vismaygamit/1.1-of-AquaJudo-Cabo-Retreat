
import React from 'react';
import { ShieldCheck, Key } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  activePortalGuest?: any;
  onPortalClick: () => void;
  onAdminClick: () => void;
  isPortalView?: boolean;
  onExitPortal?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  activePortalGuest, 
  onPortalClick, 
  onAdminClick, 
  isPortalView,
  onExitPortal 
}) => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone font-sans selection:bg-aqua-primary/10 overflow-x-hidden">
      <nav className="fixed top-0 w-full z-[100] px-8 py-4 flex items-center justify-between bg-[#faf9f6]/95 backdrop-blur-md border-b border-stone/5">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="leading-tight">
            <h1 className="text-[16px] sm:text-[18px] tracking-[0.2em] font-serif italic text-stone">AQUA JUDO</h1>
            <p className="text-[8px] tracking-[0.4em] font-black text-aqua-primary uppercase opacity-70">
              {isPortalView ? 'GUEST PORTAL' : 'ESTATE RESIDENCY'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {isPortalView ? (
             <button onClick={onExitPortal} className="px-6 py-2 bg-stone text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-stone-light transition-all">
               EXIT PORTAL
             </button>
           ) : (
             <>
               {activePortalGuest && (
                 <button onClick={onPortalClick} className="px-6 py-2.5 bg-aqua-primary text-stone rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl">
                   <Key size={14} /> ACTIVE PORTAL
                 </button>
               )}
               <button onClick={onAdminClick} className="px-6 py-2.5 bg-[#111] text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-stone-light transition-all shadow-xl">
                 <ShieldCheck size={14} className="text-aqua-primary" /> ADMIN
               </button>
             </>
           )}
        </div>
      </nav>

      {children}

      <footer className="py-20 bg-white text-center border-t border-stone/10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-12">
          <div className="text-center">
            <h2 className="text-[24px] tracking-[0.2em] font-serif italic text-stone opacity-40">AQUA JUDO</h2>
            <p className="text-[10px] tracking-[0.6em] font-black text-stone/20 uppercase">ESTATE CABO</p>
          </div>
          <div className="flex gap-8">
            <button className="text-[9px] font-bold uppercase tracking-widest text-stone/30 hover:text-aqua-primary transition-colors">Privacy Policy</button>
            <button className="text-[9px] font-bold uppercase tracking-widest text-stone/30 hover:text-aqua-primary transition-colors">Terms of Use</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

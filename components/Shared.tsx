
import React from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';

export const Logo = ({ className = "w-8 h-8", light = false }: { className?: string; light?: boolean }) => (
  <div className={`relative ${className} flex items-center justify-center border ${light ? 'border-white/20' : 'border-stone/10'} rounded-full ${light ? 'bg-transparent' : 'bg-white'} shadow-sm`}>
    <svg viewBox="0 0 100 100" className="w-5 h-5">
      <path d="M30,60 Q50,30 70,60" fill="none" stroke="#4fd1c5" strokeWidth="12" strokeLinecap="round" />
    </svg>
  </div>
);

export const AdminSectionHeader = ({ title, onAdd }: { title: string; onAdd?: () => void }) => (
  <div className="flex items-center justify-between mb-12">
    <h3 className="text-2xl font-black uppercase tracking-tight text-stone">{title}</h3>
    {onAdd && (
      <button 
        type="button"
        onClick={onAdd} 
        className="flex items-center gap-2 px-6 py-2.5 bg-[#111] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-stone-light transition-all cursor-pointer active:scale-95 shadow-lg"
      >
        <Plus size={14} /> Add New
      </button>
    )}
  </div>
);

export const PortalSection = ({ title, subtitle, children, icon: Icon }: { title: string; subtitle?: string; children?: React.ReactNode; icon?: any }) => (
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

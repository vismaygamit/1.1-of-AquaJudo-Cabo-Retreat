
import React, { useEffect } from 'react';
import { Check, ChevronDown, Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Logo = ({ className = "w-8 h-8", light = false }: { className?: string; light?: boolean }) => (
  <div className={`relative ${className} flex items-center justify-center border ${light ? 'border-white/20' : 'border-stone/10'} rounded-full ${light ? 'bg-transparent' : 'bg-white'} shadow-sm`}>
    <svg viewBox="0 0 100 100" className="w-5 h-5">
      <path d="M30,60 Q50,30 70,60" fill="none" stroke="#4fd1c5" strokeWidth="12" strokeLinecap="round" />
    </svg>
  </div>
);

export const AdminSectionHeader = ({ title, onAdd, children }: { title: string; onAdd?: () => void; children?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-12">
    <h3 className="text-2xl font-black uppercase tracking-tight text-stone">{title}</h3>
    <div className="flex items-center gap-4">
      {onAdd && (
        <button 
          type="button"
          onClick={onAdd} 
          className="flex items-center gap-2 px-6 py-2.5 bg-[#111] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-stone-light transition-all cursor-pointer active:scale-95 shadow-lg whitespace-nowrap"
        >
          <Plus size={14} /> Add New
        </button>
      )}
      {children}
    </div>
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

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type, onClose, duration = 4000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle2 className="text-aqua-primary" size={18} />,
    error: <AlertCircle className="text-red-500" size={18} />,
    info: <Logo className="w-5 h-5" />
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[2000] animate-reveal">
      <div className="bg-white/90 backdrop-blur-xl border border-stone/5 shadow-2xl rounded-full px-6 py-4 flex items-center gap-4 min-w-[320px]">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <p className="flex-1 text-[11px] font-black uppercase tracking-widest text-stone leading-none">
          {message}
        </p>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-stone/5 rounded-full transition-colors text-stone/20 hover:text-stone"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

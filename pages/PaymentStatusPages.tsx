
import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, Home, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/Shared';

interface PaymentStatusPageProps {
  onReturn: () => void;
}

export const PaymentSuccessPage: React.FC<PaymentStatusPageProps> = ({ onReturn }) => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-8 py-20 bg-[#faf9f6]">
      <div className="max-w-2xl w-full space-y-12 text-center animate-reveal">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-aqua-primary/10 rounded-full flex items-center justify-center text-aqua-primary shadow-inner">
            <CheckCircle2 size={48} strokeWidth={1.5} />
          </div>
        </div>
        
        <header className="space-y-4">
          <p className="text-[12px] font-black uppercase tracking-[0.4em] text-aqua-primary">PAYMENT SECURED</p>
          <h1 className="text-5xl md:text-7xl font-display font-light uppercase tracking-tighter text-stone">
            Registry Confirmed
          </h1>
          <p className="text-lg md:text-xl font-serif italic text-stone/40 max-w-lg mx-auto leading-relaxed">
            Your foundational deposit has been processed. Your place at the estate is now officially secured.
          </p>
        </header>

        <div className="grid gap-6 pt-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone/5 shadow-sm flex items-center gap-6 text-left">
            <div className="w-12 h-12 rounded-full bg-stone/5 flex items-center justify-center text-stone/40">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-stone/20">NEXT STEPS</h4>
              <p className="text-[14px] font-black uppercase tracking-tight text-stone">Access your guest portal for logistics and packing inventory.</p>
            </div>
          </div>
        </div>

        <div className="pt-12 flex flex-col md:flex-row items-center justify-center gap-6">
          <button 
            onClick={onReturn}
            className="px-10 py-5 bg-[#111] text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-aqua-primary hover:text-stone transition-all shadow-xl flex items-center gap-3"
          >
            <Home size={16} /> RETURN TO ESTATE
          </button>
          <button 
            onClick={onReturn}
            className="px-10 py-5 bg-white text-stone border border-stone/5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-stone/5 transition-all shadow-sm flex items-center gap-3"
          >
            VIEW PORTAL <ArrowRight size={16} />
          </button>
        </div>

        <div className="pt-20 opacity-20">
          <Logo className="w-12 h-12 mx-auto" />
        </div>
      </div>
    </main>
  );
};

export const PaymentFailPage: React.FC<PaymentStatusPageProps> = ({ onReturn }) => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-8 py-20 bg-[#faf9f6]">
      <div className="max-w-2xl w-full space-y-12 text-center animate-reveal">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-inner">
            <XCircle size={48} strokeWidth={1.5} />
          </div>
        </div>
        
        <header className="space-y-4">
          <p className="text-[12px] font-black uppercase tracking-[0.4em] text-red-400">TRANSACTION HALTED</p>
          <h1 className="text-5xl md:text-7xl font-display font-light uppercase tracking-tighter text-stone">
            Payment Failed
          </h1>
          <p className="text-lg md:text-xl font-serif italic text-stone/40 max-w-lg mx-auto leading-relaxed">
            We were unable to process your registry deposit. Your sanctuary remains on hold, but your place is not yet secured.
          </p>
        </header>

        <div className="bg-white p-8 rounded-[2.5rem] border border-red-100 bg-red-50/10 shadow-sm text-left">
          <p className="text-[13px] font-serif italic text-red-400/80 leading-relaxed">
            Common reasons include insufficient funds, incorrect billing details, or bank-side security flags. Please verify your information and attempt the transaction again.
          </p>
        </div>

        <div className="pt-12 flex flex-col md:flex-row items-center justify-center gap-6">
          <button 
            onClick={onReturn}
            className="px-12 py-5 bg-[#111] text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-500 transition-all shadow-xl flex items-center gap-3"
          >
            RETRY PAYMENT
          </button>
          <button 
            onClick={onReturn}
            className="px-10 py-5 bg-white text-stone border border-stone/5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-stone/5 transition-all shadow-sm"
          >
            CONTACT CONCIERGE
          </button>
        </div>

        <div className="pt-20 opacity-20">
          <Logo className="w-12 h-12 mx-auto" />
        </div>
      </div>
    </main>
  );
};

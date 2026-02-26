
import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, Home, ShieldCheck, Calendar, MapPin, CreditCard, Hash, Clock } from 'lucide-react';
import { Logo } from '../components/Shared';
import { PaymentDetails } from '../types';

interface PaymentStatusPageProps {
  onReturn: () => void;
  paymentDetails?: PaymentDetails | null;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const PaymentSuccessPage: React.FC<PaymentStatusPageProps> = ({ onReturn, paymentDetails, showToast }) => {
  const hasShownToast = React.useRef(false);

  React.useEffect(() => {
    if (paymentDetails && showToast && !hasShownToast.current) {
      showToast("Your receipt has been sent to your email successfully.", "success");
      hasShownToast.current = true;
    }
  }, [paymentDetails, showToast]);

  if (!paymentDetails) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6]">
        <div className="text-center space-y-6 animate-reveal">
          <div className="w-16 h-16 border-4 border-aqua-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            <p className="text-[12px] font-black uppercase tracking-[0.4em] text-aqua-primary">SECURE PROTOCOL</p>
            <h2 className="text-2xl font-display font-light uppercase tracking-tight text-stone">Verifying Registry...</h2>
          </div>
        </div>
      </main>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <main className="min-h-[40vh] flex flex-col items-center px-4 sm:px-8 pt-16 pb-12 bg-[#faf9f6]">
      <div className="max-w-3xl w-full space-y-4 text-center animate-reveal">
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
          <p className="text-lg md:text-xl font-serif italic text-stone/40 max-w-lg mx-auto leading-relaxed pt-4">
            Your foundational deposit has been processed. Your place at the estate is now officially secured.
          </p>
        </header>

        {/* Detailed Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Booking Details */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone/5 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-stone/20 border-b border-stone/5 pb-4">BOOKING PROTOCOL</h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Hash size={16} className="text-aqua-primary mt-1" />
                <div>
                  <p className="text-[9px] font-black uppercase text-stone/30">REFERENCE ID</p>
                  <p className="text-[14px] font-black uppercase tracking-tight text-stone">{paymentDetails?.referenceId || 'PENDING'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin size={16} className="text-aqua-primary mt-1" />
                <div>
                  <p className="text-[9px] font-black uppercase text-stone/30">SANCTUARY</p>
                  <p className="text-[14px] font-black uppercase tracking-tight text-stone">{paymentDetails?.roomName || 'ASSIGNED ON ARRIVAL'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Calendar size={16} className="text-aqua-primary mt-1" />
                <div>
                  <p className="text-[9px] font-black uppercase text-stone/30">RESIDENCY WINDOW</p>
                  <p className="text-[14px] font-black uppercase tracking-tight text-stone">
                    {formatDate(paymentDetails?.checkInDate)} — {formatDate(paymentDetails?.checkOutDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone/5 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-stone/20 border-b border-stone/5 pb-4">TRANSACTION LOG</h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <CreditCard size={16} className="text-aqua-primary mt-1" />
                <div>
                  <p className="text-[9px] font-black uppercase text-stone/30">TRANSACTION ID</p>
                  <p className="text-[14px] font-black uppercase tracking-tight text-stone break-all">{paymentDetails?.id || '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock size={16} className="text-aqua-primary mt-1" />
                <div>
                  <p className="text-[9px] font-black uppercase text-stone/30">TIMESTAMP</p>
                  <p className="text-[14px] font-black uppercase tracking-tight text-stone">{formatDate(paymentDetails?.transactionDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <ShieldCheck size={16} className="text-aqua-primary mt-1" />
                <div>
                  <p className="text-[9px] font-black uppercase text-stone/30">STATUS & AMOUNT</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-black uppercase tracking-tight text-stone">
                      {typeof paymentDetails?.amount === 'string' 
                        ? paymentDetails.amount 
                        : `$${paymentDetails?.amount.toLocaleString()}`}
                    </span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-500 text-[8px] font-black uppercase rounded-full border border-green-100">
                      {paymentDetails?.status || 'SUCCESS'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-6">
          <button 
            onClick={onReturn}
            className="w-full md:w-auto px-10 py-5 bg-[#111] text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-aqua-primary hover:text-stone transition-all shadow-xl flex items-center justify-center gap-3"
          >
            <Home size={16} /> RETURN TO ESTATE
          </button>
        </div>

      </div>
    </main>
  );
};

export const PaymentFailPage: React.FC<PaymentStatusPageProps> = ({ onReturn }) => {
  return (
    <main className="min-h-[40vh] flex flex-col items-center px-8 pt-20 pb-12 bg-[#faf9f6]">
      <div className="max-w-2xl w-full space-y-4 text-center animate-reveal">
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

        <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-6">
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

      </div>
    </main>
  );
};


import React, { useState } from 'react';
import { X, Check, Info, Copy, ChevronLeft, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { BookingState, Room, ResidencySession } from '../types';

interface LoginModalProps {
  onLogin: (password: string) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose }) => {
  const [input, setInput] = useState("");
  return (
    <div className="fixed inset-0 z-[1000] bg-[#111]/98 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-sm p-12 rounded-[3rem] space-y-8 text-center relative shadow-3xl">
        <button onClick={onClose} className="absolute top-8 right-8 text-stone/20 hover:text-stone transition-all"><X size={20}/></button>
        <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-stone/30">ESTATE CURATOR</h4>
        <input type="password" placeholder="••••" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && onLogin(input)} className="w-full bg-[#faf9f6] rounded-[2rem] px-6 py-5 text-center text-2xl font-display tracking-[0.4em] outline-none border border-stone/10" autoFocus />
        <button onClick={() => onLogin(input)} className="w-full py-5 bg-[#111] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-aqua-primary transition-all">ACCESS CONSOLE</button>
      </div>
    </div>
  );
};

export const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}> = ({ isOpen, title, description, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1100] bg-stone/20 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-sm p-10 rounded-[3rem] space-y-8 text-center shadow-3xl border border-white">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-black uppercase tracking-tight text-stone">{title}</h4>
          <p className="text-[13px] font-serif italic text-stone/40 leading-relaxed px-4">
            {description}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onCancel} 
            disabled={isLoading}
            className="flex-1 py-4 bg-[#faf9f6] text-stone rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone/5 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isLoading}
            className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export const RoomDetailModal: React.FC<{
  room: Room;
  onClose: () => void;
  onRequestAccess: (roomId: string) => void;
}> = ({ room, onClose, onRequestAccess }) => {
  return (
    <div className="fixed inset-0 z-[1200] bg-[#111]/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-fade-in">
      <div className="bg-[#1a1a1a] w-full max-w-6xl h-full max-h-[85vh] md:max-h-[700px] rounded-[3rem] overflow-hidden flex flex-col md:flex-row relative shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-8 right-8 z-[1300] w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-all">
          <X size={24} />
        </button>

        {/* Left: Video / Image Player */}
        <div className="w-full md:w-3/5 bg-black/40 flex items-center justify-center relative overflow-hidden h-64 md:h-auto">
          {room.video ? (
            <video 
              src={room.video} 
              className="w-full h-full object-cover opacity-80" 
              controls 
              autoPlay 
              loop 
              muted 
              playsInline
            />
          ) : room.image ? (
            <img src={room.image} className="w-full h-full object-cover opacity-80" alt={room.name} />
          ) : (
            <div className="text-white/10 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin" size={32} />
              <span className="text-[10px] uppercase font-black tracking-widest">Asset Loading</span>
            </div>
          )}
        </div>

        {/* Right: Info Panel */}
        <div className="w-full md:w-2/5 p-12 md:p-16 flex flex-col justify-between overflow-y-auto no-scrollbar bg-[#1a1a1a]">
          <div className="space-y-10">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-aqua-primary">SANCTUARY OVERVIEW</p>
              <h2 className="text-4xl font-bold uppercase tracking-tighter text-white leading-none">{room.name}</h2>
            </div>
            
            <p className="text-sm md:text-base font-serif italic text-white/40 leading-relaxed">
              {room.description}
            </p>

            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white/60">
                <div className="w-1 h-1 rounded-full bg-aqua-primary/50" />
                <span className="text-[10px] font-black uppercase tracking-widest">{room.bedType}</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <div className="w-1 h-1 rounded-full bg-aqua-primary/50" />
                <span className="text-[10px] font-black uppercase tracking-widest">{room.bathType} BATHROOM</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <div className="w-1 h-1 rounded-full bg-aqua-primary/50" />
                <span className="text-[10px] font-black uppercase tracking-widest">{room.location.toUpperCase()}</span>
              </li>
              {/* Added dynamic features list */}
              {room.features && room.features.length > 0 && room.features.map((feat, i) => feat.trim() && (
                <li key={i} className="flex items-center gap-3 text-white/60">
                  <div className="w-1 h-1 rounded-full bg-aqua-primary/80" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-aqua-primary/80">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-12 space-y-8 border-t border-white/5 mt-10">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-light text-white/20">$</span>
              <span className="text-4xl font-bold tracking-tighter text-white">{room.basePrice.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => onRequestAccess(room.id)}
              className="w-full bg-white text-stone py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-aqua-primary transition-all active:scale-[0.98]"
            >
              REQUEST ACCESS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ApplyModalProps {
  sessions: ResidencySession[];
  rooms: Room[];
  initialSessionId: string;
  initialRoomId?: string;
  onSubmit: (form: BookingState) => Promise<any>;
  onClose: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ sessions, rooms, initialSessionId, initialRoomId, onSubmit, onClose, showToast }) => {
  // Fix: Guests must always start at phase 1 (Identity) to capture details correctly.
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<BookingState>({
    sessionId: initialSessionId, guestName: '', guestEmail: '', guestPhone: '', gender: '',
    bookingType: 'solo', companionName: '', roomPreferenceId: initialRoomId || '',
    healthNotes: '', oneOnOneInterest: false, bathroomConsent: false,
    alcoholConsent: false, language: 'English', notes: '', isConfirmed: false
  });

  const validatePhase1 = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (form.guestName.trim().length < 3) {
      newErrors.guestName = "Please enter your full name (min 3 chars).";
    }
    if (!emailRegex.test(form.guestEmail)) {
      newErrors.guestEmail = "Please enter a valid email address.";
    }
    if (form.guestPhone.trim().length < 8) {
      newErrors.guestPhone = "Please enter a valid phone number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextPhase1 = () => {
    if (validatePhase1()) {
      setStep(2);
    }
  };

  const handleStepSubmit = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      try {
        const result = await onSubmit(form);
        setSubmittedId(result.refId || result.id);
        showToast("INQUIRY TRANSMITTED SUCCESSFULLY", "success");
        setStep(5);
      } catch (e) {
        showToast("TRANSMISSION FAILED: REGISTRY UNREACHABLE", "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const availableSessions = sessions.filter(s => s.startDate >= today);
  const selectedSession = sessions.find(s => s.id === form.sessionId);
  const selectedRoom = rooms.find(r => r.id === form.roomPreferenceId);

  return (
    <div className="fixed inset-0 z-[1500] bg-stone/20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-reveal border border-white">
        <div className={`p-10 md:p-14 space-y-8 max-h-[95vh] overflow-y-auto no-scrollbar relative ${step === 5 ? 'bg-[#fcfcfc]' : ''}`}>
          
          {step < 5 && (
            <header className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <h2 className="text-4xl font-display font-light uppercase tracking-tight text-stone">Inquiry</h2>
                <p className="text-[11px] font-black uppercase tracking-widest text-aqua-primary">Registry Phase {step} of 4</p>
              </div>
              {!isSubmitting && (
                <button onClick={onClose} className="w-12 h-12 bg-stone/5 rounded-full flex items-center justify-center text-stone hover:bg-stone hover:text-white transition-all">
                  <X size={20}/>
                </button>
              )}
            </header>
          )}

          {/* PHASE 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-10 animate-fade-in">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone/20 px-1">Guest Registry</label>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <input 
                      placeholder="FULL NAME" 
                      value={form.guestName} 
                      onChange={e => {
                        setForm({...form, guestName: e.target.value});
                        if (errors.guestName) setErrors({...errors, guestName: ''});
                      }} 
                      className={`w-full bg-white rounded-2xl px-8 py-6 border ${errors.guestName ? 'border-red-400' : 'border-stone/10'} text-[13px] font-black uppercase tracking-tight outline-none focus:border-stone/20 shadow-sm placeholder:text-stone/30 transition-all`} 
                    />
                    {errors.guestName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-2 px-2"><AlertCircle size={10} /> {errors.guestName}</p>}
                  </div>

                  <div className="space-y-2">
                    <input 
                      placeholder="EMAIL ADDRESS" 
                      type="email" 
                      value={form.guestEmail} 
                      onChange={e => {
                        setForm({...form, guestEmail: e.target.value});
                        if (errors.guestEmail) setErrors({...errors, guestEmail: ''});
                      }} 
                      className={`w-full bg-white rounded-2xl px-8 py-6 border ${errors.guestEmail ? 'border-red-400' : 'border-stone/10'} text-[13px] font-black uppercase tracking-tight outline-none focus:border-stone/20 shadow-sm placeholder:text-stone/30 transition-all`} 
                    />
                    {errors.guestEmail && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-2 px-2"><AlertCircle size={10} /> {errors.guestEmail}</p>}
                  </div>

                  <div className="space-y-2">
                    <input 
                      placeholder="PHONE / WHATSAPP" 
                      value={form.guestPhone} 
                      onChange={e => {
                        setForm({...form, guestPhone: e.target.value});
                        if (errors.guestPhone) setErrors({...errors, guestPhone: ''});
                      }} 
                      className={`w-full bg-white rounded-2xl px-8 py-6 border ${errors.guestPhone ? 'border-red-400' : 'border-stone/10'} text-[13px] font-black uppercase tracking-tight outline-none focus:border-stone/20 shadow-sm placeholder:text-stone/30 transition-all`} 
                    />
                    {errors.guestPhone && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-2 px-2"><AlertCircle size={10} /> {errors.guestPhone}</p>}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleNextPhase1} 
                className="w-full bg-[#111] text-white py-6 rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-xl transition-all hover:bg-stone-light active:scale-[0.98]"
              >
                Next Phase
              </button>
            </div>
          )}

          {/* PHASE 2: SELECTION */}
          {step === 2 && (
            <div className="space-y-12 animate-fade-in py-4">
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone/30 text-center">Choose your residency window</p>
                <div className="space-y-4">
                  {availableSessions.length === 0 ? (
                    <div className="p-10 text-center bg-stone/5 rounded-[2rem] border border-stone/10 border-dashed">
                      <p className="text-[11px] font-black uppercase tracking-widest text-stone/30 leading-relaxed">No future windows are currently available for registry.</p>
                    </div>
                  ) : (
                    availableSessions.map(s => {
                      const startDate = new Date(s.startDate);
                      const endDate = new Date(s.endDate);
                      const isSelected = form.sessionId === s.id;
                      return (
                        <button 
                          key={s.id} 
                          onClick={() => setForm({...form, sessionId: s.id})}
                          className={`w-full p-8 rounded-[2rem] border transition-all text-left flex justify-between items-center group ${isSelected ? 'bg-aqua-primary/5 border-aqua-primary' : 'bg-white border-stone/10 hover:border-stone/20'}`}
                        >
                          <div className="space-y-1">
                            <p className="text-[14px] font-black uppercase tracking-tight text-stone">
                              {startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                            <p className="text-[11px] font-serif italic text-stone/30">
                              {startDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })} — {endDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${s.status === 'Full' ? 'bg-stone/5 text-stone/20' : 'bg-green-50 text-green-500'}`}>
                            {s.status}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone/30 text-center">Select your sanctuary</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rooms.map(r => {
                    const isSelected = form.roomPreferenceId === r.id;
                    return (
                      <button 
                        key={r.id} 
                        onClick={() => setForm({...form, roomPreferenceId: r.id})} 
                        className={`relative p-10 rounded-[2.5rem] border transition-all text-left flex flex-col justify-between aspect-square group ${isSelected ? 'bg-aqua-primary/5 border-aqua-primary' : 'bg-white border-stone/10 hover:border-stone/20'}`}
                      >
                        <div className="space-y-1">
                          <p className="text-[12px] font-black uppercase tracking-tight text-stone">{r.name}</p>
                          <p className="text-[11px] font-serif italic text-stone/30">{r.bedType}</p>
                        </div>
                        <div>
                          <p className="text-2xl font-black tracking-tight text-stone">${r.basePrice.toLocaleString()}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute bottom-10 right-10 text-aqua-primary">
                            <Check size={20} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)} 
                  className="flex-1 bg-[#faf9f6] text-stone py-6 rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-sm hover:bg-stone/5 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button 
                  onClick={() => setStep(3)} 
                  disabled={!form.sessionId || !form.roomPreferenceId} 
                  className="flex-[2] bg-[#111] text-white py-6 rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-20 transition-all hover:bg-stone-light"
                >
                  Next Phase
                </button>
              </div>
            </div>
          )}

          {/* PHASE 3: COMMITMENT */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <label className="text-[10px] font-black text-stone/20 uppercase tracking-[0.2em] px-1">Commitment Protocols</label>
                <div className="space-y-4">
                  <label className="flex items-center gap-5 p-6 border border-stone/10 bg-white rounded-[2rem] cursor-pointer hover:border-aqua-primary/40 transition-all">
                    <input type="checkbox" checked={form.bathroomConsent} onChange={e => setForm({...form, bathroomConsent: e.target.checked})} className="w-5 h-5 accent-aqua-primary" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-stone/60 leading-tight">Accept Shared Bathroom protocol</span>
                  </label>
                  <label className="flex items-center gap-5 p-6 border border-stone/10 bg-white rounded-[2rem] cursor-pointer hover:border-aqua-primary/40 transition-all">
                    <input type="checkbox" checked={form.alcoholConsent} onChange={e => setForm({...form, alcoholConsent: e.target.checked})} className="w-5 h-5 accent-aqua-primary" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-stone/60 leading-tight">Accept Alcohol-Free commitment</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(2)} 
                  className="flex-1 bg-[#faf9f6] text-stone py-6 rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-sm hover:bg-stone/5 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button 
                  onClick={() => setStep(4)} 
                  disabled={!form.bathroomConsent || !form.alcoholConsent} 
                  className="flex-[2] bg-[#111] text-white py-6 rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-20 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* PHASE 4: NARRATIVE & SUBMIT */}
          {step === 4 && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-stone/20 uppercase tracking-[0.2em] px-1">Technical Narrative</label>
                <textarea 
                  placeholder="Movement background, goals, or health notes..." 
                  value={form.healthNotes} 
                  disabled={isSubmitting}
                  onChange={e => setForm({...form, healthNotes: e.target.value})} 
                  className="w-full bg-white rounded-[2rem] p-8 border border-stone/10 text-[14px] font-serif italic min-h-[160px] outline-none focus:border-stone/20 shadow-sm disabled:opacity-50" 
                />
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(3)} 
                  disabled={isSubmitting}
                  className="flex-1 bg-[#faf9f6] text-stone py-6 rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-sm hover:bg-stone/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button 
                  onClick={handleStepSubmit} 
                  disabled={isSubmitting}
                  className="flex-[2] bg-aqua-primary text-stone py-6 rounded-full text-[13px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-aqua-primary/50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Transmitting...
                    </>
                  ) : (
                    'Transmit Inquiry'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS VIEW: PHASE 5 */}
          {step === 5 && (
            <div className="space-y-12 animate-fade-in relative pb-4">
              <button onClick={onClose} className="absolute -top-6 -right-6 text-stone/10 hover:text-stone transition-all">
                <X size={24}/>
              </button>

              {/* Status Header */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-[#f1fdf9] rounded-full flex items-center justify-center border border-[#e2f9f1]">
                  <Check size={42} className="text-[#20d489]" strokeWidth={3} />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-[28px] md:text-[34px] font-black uppercase tracking-tight text-stone leading-none">REGISTRY RECEIVED</h4>
                  <p className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.4em] text-[#4fd1c5]">PENDING CURATOR VERIFICATION</p>
                </div>
              </div>

              <div className="w-full h-px bg-stone/5"></div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-stone/20 uppercase tracking-[0.2em]">REGISTRY ID</p>
                  <p className="text-2xl md:text-3xl font-black uppercase text-stone tracking-tighter">{submittedId}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-stone/20 uppercase tracking-[0.2em]">GUEST NAME</p>
                  <p className="text-2xl md:text-3xl font-black uppercase text-stone tracking-tighter">
                    {(form.guestName.split(' ')[0] || 'GUEST').toUpperCase()}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-stone/20 uppercase tracking-[0.2em]">RESIDENCY WINDOW</p>
                  <p className="text-[18px] md:text-[20px] font-black uppercase text-stone tracking-tight">
                    {selectedSession ? (
                      <>
                        {new Date(selectedSession.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()} — {new Date(selectedSession.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </>
                    ) : 'TBD'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-stone/20 uppercase tracking-[0.2em]">SANCTUARY REQUEST</p>
                  <p className="text-[18px] md:text-[20px] font-black uppercase text-[#4fd1c5] tracking-tight">
                    {(selectedRoom?.name || 'ONYX SANCTUARY').toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="w-full h-px bg-stone/5"></div>

              {/* Next Steps Narrative */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-stone/20">
                  <Info size={18} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">NEXT STEPS</p>
                </div>
                <p className="text-[16px] md:text-[18px] font-serif italic text-stone/40 leading-relaxed max-w-xl">
                  Our curators will review your technical narrative within 48 hours. If approved, you will receive a magic link via email to access your guest portal and complete the registry deposit.
                </p>
              </div>

              {/* Action */}
              <button 
                onClick={onClose} 
                className="w-full bg-[#999] text-white py-6 rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-stone transition-all mt-4"
              >
                RETURN TO ESTATE
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

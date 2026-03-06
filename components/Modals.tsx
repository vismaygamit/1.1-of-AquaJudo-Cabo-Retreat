
import React, { useState, useEffect } from 'react';
import { X, Check, Info, Copy, ChevronLeft, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { BookingState, Room, ResidencySession } from '../types';
import { API_BASE_URL } from '../constants';

interface LoginModalProps {
  onLogin: (password: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose, isLoading }) => {
  const [input, setInput] = useState("");
  return (
    <div className="fixed inset-0 z-[1000] bg-[#111]/98 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-sm p-12 rounded-[1rem] space-y-8 text-center relative shadow-3xl">
        <button onClick={onClose} disabled={isLoading} className="absolute top-8 right-8 text-stone/20 hover:text-stone transition-all disabled:opacity-0"><X size={20} /></button>
        <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-stone/30">ESTATE CURATOR</h4>
        <input 
          type="password" 
          placeholder="••••" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && !isLoading && onLogin(input)} 
          className="w-full bg-[#faf9f6] rounded-[2rem] px-6 py-5 text-center text-2xl font-display tracking-[0.4em] outline-none border border-stone/10 disabled:opacity-50" 
          autoFocus 
          disabled={isLoading}
        />
        <button 
          onClick={() => onLogin(input)} 
          disabled={isLoading || !input}
          className="w-full py-5 bg-[#111] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-aqua-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          {isLoading ? 'VERIFYING...' : 'ACCESS CONSOLE'}
        </button>
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
      <div className="bg-white w-full max-w-sm p-10 rounded-[1rem] space-y-8 text-center shadow-3xl border border-white">
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

export const PrivacyPolicyModal: React.FC<{ isOpen?: boolean; onClose: () => void }> = ({ isOpen = true, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[2000] bg-stone/40 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-2xl p-12 rounded-[2rem] space-y-8 relative shadow-3xl border border-white overflow-y-auto max-h-[90vh] no-scrollbar">
        <button onClick={onClose} className="absolute top-8 right-8 text-stone/20 hover:text-stone transition-all"><X size={24} /></button>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-display font-light uppercase tracking-tight text-stone">Privacy Policy</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone/30">Effective Date: March 05, 2026</p>
          </div>

          <div className="space-y-6 text-stone/60 font-serif italic text-sm leading-relaxed">
            <p>Aqua Judo Cabo respects your privacy and is committed to protecting the personal information you provide through this website and guest portal.</p>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">Information We Collect</h3>
              <p>We may collect personal information including:</p>
              <ul className="list-disc pl-5 space-y-1 not-italic text-[12px] font-sans font-medium uppercase tracking-tight text-stone/40">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Travel details and arrival information</li>
                <li>Health disclosures related to residency participation</li>
                <li>Emergency contact information</li>
              </ul>
              <p>This information is provided voluntarily when submitting an application, completing guest forms, or communicating with us.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">How We Use Your Information</h3>
              <p>Personal information is used only for purposes related to the residency, including:</p>
              <ul className="list-disc pl-5 space-y-1 not-italic text-[12px] font-sans font-medium uppercase tracking-tight text-stone/40">
                <li>Processing residency applications</li>
                <li>Preparing for guest arrivals</li>
                <li>Safety and health considerations</li>
                <li>Communication before and during the residency</li>
                <li>Administrative record keeping</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">Health Information</h3>
              <p>Health disclosures provided through the guest portal are used solely to support participant safety and program preparation. This information is treated as confidential and is not used for any other purpose.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">Information Sharing</h3>
              <p>We do not sell, rent, or distribute your personal information to third parties.</p>
              <p>Information may only be shared when necessary for operational purposes, such as transportation coordination or emergency medical assistance.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">Data Security</h3>
              <p>Reasonable measures are taken to protect personal information submitted through this website and guest portal. However, no online system can guarantee absolute security.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">Cookies and Website Analytics</h3>
              <p>The website may use basic cookies or analytics tools to understand website usage and improve functionality. These tools do not collect sensitive personal information.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">Your Privacy Rights</h3>
              <p>You may request to review, update, or remove your personal information by contacting us directly.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">Contact</h3>
              <p className="not-italic">
                Aqua Judo Cabo<br />
                <a href="mailto:residency@aquajudo.com" className="text-aqua-primary hover:underline">residency@aquajudo.com</a>
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">Policy Updates</h3>
              <p>This policy may be updated periodically. Any changes will be reflected on this page.</p>
            </section>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-5 bg-stone text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-aqua-primary transition-all"
        >
          ACKNOWLEDGE
        </button>
      </div>
    </div>
  );
};

export const TermsModal: React.FC<{ isOpen?: boolean; onClose: () => void }> = ({ isOpen = true, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[2000] bg-stone/40 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-2xl p-12 rounded-[2rem] space-y-8 relative shadow-3xl border border-white overflow-y-auto max-h-[90vh] no-scrollbar">
        <button onClick={onClose} className="absolute top-8 right-8 text-stone/20 hover:text-stone transition-all"><X size={24} /></button>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-display font-light uppercase tracking-tight text-stone">Terms of Use</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone/30">Effective Date: March 05, 2026</p>
          </div>

          <div className="space-y-6 text-stone/60 font-serif italic text-sm leading-relaxed">
            <p>These Terms of Use govern access to and use of the Aqua Judo Cabo website and guest portal. By using this website or submitting information through the portal, you agree to these terms.</p>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">Use of the Website</h3>
              <p>The content provided on this website is for informational purposes related to Aqua Judo Cabo and its residency programs.</p>
              <p>Users agree to use the website lawfully and not to misuse, copy, reproduce, or distribute website content without permission.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">Residency Applications</h3>
              <p>Submitting an application through this website does not guarantee acceptance into the residency.</p>
              <p>Participation in Aqua Judo Cabo programs is subject to review and approval.</p>
              <p>Aqua Judo Cabo reserves the right to accept or decline applications at its discretion.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">Participation Requirements</h3>
              <p>Residency participation involves physical activity, ocean environments, and outdoor conditions.</p>
              <p>Participants are responsible for ensuring they are physically capable of participating and must disclose relevant health information before arrival.</p>
              <p>Completion of required health disclosures and liability documentation may be required prior to participation.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">No Medical or Professional Advice</h3>
              <p>Information presented on this website is for general informational purposes only and does not constitute medical, health, or professional advice.</p>
              <p>Participation in physical activities is undertaken at the participant’s own risk.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">Intellectual Property</h3>
              <p>All website content, including text, images, branding, and design elements, are the property of Aqua Judo Cabo unless otherwise stated.</p>
              <p>Content may not be reproduced or used without prior written permission.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">Limitation of Liability</h3>
              <p>Aqua Judo Cabo is not responsible for any direct, indirect, or incidental damages arising from the use of this website or reliance on its content.</p>
              <p>Participation in residency activities is subject to separate agreements and waivers provided to participants.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">External Links</h3>
              <p>This website may contain links to external websites. Aqua Judo Cabo is not responsible for the content or privacy practices of third-party websites.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">Changes to Terms</h3>
              <p>These Terms of Use may be updated periodically. Continued use of the website constitutes acceptance of any updated terms.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-stone font-black uppercase text-[10px] tracking-widest not-italic">Contact</h3>
              <p className="not-italic">
                Aqua Judo Cabo<br />
                <a href="mailto:residency@aquajudo.com" className="text-aqua-primary hover:underline">residency@aquajudo.com</a>
              </p>
            </section>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-5 bg-stone text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-aqua-primary transition-all"
        >
          ACKNOWLEDGE
        </button>
      </div>
    </div>
  );
};

export const ResidencyAgreementModal: React.FC<{ onAccept: () => void; onCancel: () => void }> = ({ onAccept, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[2100] bg-stone/40 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-2xl p-12 rounded-[2rem] space-y-8 relative shadow-3xl border border-white overflow-y-auto max-h-[90vh] no-scrollbar">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-display font-light uppercase tracking-tight text-stone">Residency Participation Agreement</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone/30">Aqua Judo Cabo • Liability & Safety</p>
          </div>

          <div className="space-y-6 text-stone/60 font-serif italic text-sm leading-relaxed">
            <p>Aqua Judo Cabo is a private coastal residency involving physical training, ocean activity, and outdoor movement, including judo practice, swimming, paddle boarding, snorkeling, and terrain-based movement.</p>
            
            <p>Participation is voluntary. By continuing, you confirm that you are physically capable of moderate activity and comfortable in ocean environments.</p>
            
            <p>Residents are responsible for their own participation and must disclose any medical conditions or injuries that could affect their ability to take part. Aqua Judo Cabo does not provide medical treatment or supervision.</p>
            
            <p>Activities take place in natural coastal environments where ocean conditions, terrain, and weather may vary. Participants agree to follow safety guidance and act within their personal limits.</p>
            
            <p>Residents must respect the property, shared spaces, and residency guidelines provided in the guest portal.</p>
            
            <p>Failure to follow safety guidance or residency standards may result in removal from activities or dismissal from the residency.</p>
            
            <p>By selecting Accept, you confirm that you have read and understood this agreement and accept responsibility for your participation.</p>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-5 bg-[#faf9f6] text-stone rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-stone/5 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onAccept}
            className="flex-[2] py-5 bg-stone text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-aqua-primary hover:text-stone transition-all shadow-xl"
          >
            Accept & Continue
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
    <div className="fixed inset-0 z-[1200] bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-[#1a1a1a] w-full max-w-4xl max-h-[95vh] rounded-[1rem] overflow-hidden flex flex-col relative shadow-2xl border border-white/5">
        
        {/* Close button - Top right floating */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-[1350] w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
        >
          <X size={20} />
        </button>

        {/* Media Container - Optimized Aspect Ratios */}
        <div className="w-full relative bg-black flex-shrink-0 flex items-center justify-center overflow-hidden aspect-[4/3] sm:aspect-video md:h-[500px]">
          {room.video ? (
            <video
              src={room.video}
              className="w-full h-full object-contain"
              controls
              autoPlay
              loop
              muted
              playsInline
            />
          ) : room.image ? (
            <img src={room.image} className="w-full h-full object-contain" alt={room.name} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 gap-2">
              <Loader2 className="animate-spin" size={32} />
              <span className="text-[10px] uppercase font-black tracking-widest">Asset Loading</span>
            </div>
          )}
        </div>

        {/* Content Area - Matches Screenshot Aesthetic */}
        <div className="flex-1 flex flex-col p-8 sm:p-14 overflow-y-auto no-scrollbar relative">
          <div className="space-y-10 pb-28">
            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-aqua-primary">SANCTUARY OVERVIEW</p>
              <h2 className="text-4xl sm:text-6xl font-bold uppercase tracking-tighter text-white leading-none">
                {room.name}
              </h2>
            </div>

            <p className="text-base sm:text-lg font-serif italic text-white/50 leading-relaxed max-w-2xl">
              {room.description}
            </p>

            <ul className="space-y-4 pt-2">
              {room.facilities && room.facilities.length > 0 && room.facilities.map((fac, i) => fac.trim() && (
                <li key={`fac-${i}`} className="flex items-center gap-4 text-white/80 animate-fade-in">
                  <div className="w-1.5 h-1.5 rounded-full bg-aqua-primary shadow-[0_0_8px_rgba(79,209,197,0.8)]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">{fac}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer - Optimized for small screens to prevent overlap */}
          <div className="sticky bottom-0 left-0 w-full pt-6 pb-2 mt-auto flex flex-row items-end justify-between bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a] to-transparent gap-4">
            <div className="flex items-baseline gap-1 group flex-shrink-0">
              <span className="text-lg sm:text-xl font-light text-white/30">$</span>
              <span className="text-4xl sm:text-7xl font-bold tracking-tighter text-white leading-none">
                {room.basePrice.toLocaleString()} USD
              </span>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => onRequestAccess(room.id)}
                className="bg-white text-[#1a1a1a] px-6 sm:px-12 py-3.5 sm:py-5 rounded-2xl text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] shadow-2xl hover:bg-aqua-primary transition-all active:scale-[0.98] whitespace-nowrap mb-0.5"
              >
                REQUEST ACCESS
              </button>
            </div>
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
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [form, setForm] = useState<BookingState>({
    sessionId: initialSessionId, guestName: '', guestEmail: '', guestPhone: '', gender: '',
    bookingType: 'solo', companionName: '', roomPreferenceId: initialRoomId || '',
    healthNotes: '', oneOnOneInterest: false, bathroomConsent: false,
    alcoholConsent: false, residencyAgreement: false, language: 'English', notes: '', isConfirmed: false
  });

  useEffect(() => {
    if (!form.sessionId) {
      setAvailableRooms([]);
      return;
    }

    const fetchAvailableRooms = async () => {
      setIsLoadingRooms(true);
      try {
        const response = await fetch(`${API_BASE_URL}/session/${form.sessionId}/getAvailableRoomsBySession`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const mappedRooms: Room[] = result.data.map((apiRoom: any) => {
            const fullRoom = rooms.find(r => r.id === apiRoom._id || r.name === apiRoom.name);
            return {
              id: apiRoom._id,
              name: apiRoom.name,
              basePrice: apiRoom.price,
              description: fullRoom?.description || '',
              image: fullRoom?.image || '',
              video: fullRoom?.video || '',
              maxOccupancy: fullRoom?.maxOccupancy || 2,
              facilities: fullRoom?.facilities || []
            };
          });
          setAvailableRooms(mappedRooms);
          
          // If current roomPreferenceId is not in available rooms, reset it
          if (form.roomPreferenceId && !mappedRooms.find(r => r.id === form.roomPreferenceId)) {
            setForm(prev => ({ ...prev, roomPreferenceId: '' }));
          }
        }
      } catch (error) {
        console.error("Error fetching available rooms:", error);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchAvailableRooms();
  }, [form.sessionId, rooms]);

  const validatePhase1 = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.guestName.trim().length < 3) newErrors.guestName = "Name too short.";
    if (!emailRegex.test(form.guestEmail)) newErrors.guestEmail = "Invalid email.";
    if (form.guestPhone.trim().length < 8) newErrors.guestPhone = "Invalid phone.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStepSubmit = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      try {
        const result = await onSubmit(form);
        setSubmittedId(result.refId || result.id);
        showToast("INQUIRY TRANSMITTED", "success");
        setStep(5);
      } catch (e) {
        showToast("TRANSMISSION FAILED", "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const availableSessions = sessions.filter(s => s.startDate >= today);

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
              {!isSubmitting && <button onClick={onClose} className="w-12 h-12 bg-stone/5 rounded-full flex items-center justify-center text-stone hover:bg-stone hover:text-white transition-all"><X size={20} /></button>}
            </header>
          )}

          {step === 1 && (
            <div className="space-y-10 animate-fade-in">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone/20 px-1">Guest Registry</label>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <input placeholder="FULL NAME" value={form.guestName} onChange={e => setForm({...form, guestName: e.target.value})} className={`w-full bg-white rounded-2xl px-8 py-6 border ${errors.guestName ? 'border-red-400' : 'border-stone/10'} text-[13px] font-black uppercase tracking-tight outline-none focus:border-stone/20 shadow-sm`} />
                    {errors.guestName && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.guestName}</p>}
                  </div>
                  <div className="space-y-2">
                    <input placeholder="EMAIL ADDRESS" type="email" value={form.guestEmail} onChange={e => setForm({...form, guestEmail: e.target.value})} className={`w-full bg-white rounded-2xl px-8 py-6 border ${errors.guestEmail ? 'border-red-400' : 'border-stone/10'} text-[13px] font-black uppercase tracking-tight outline-none focus:border-stone/20 shadow-sm`} />
                    {errors.guestEmail && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.guestEmail}</p>}
                  </div>
                  <div className="space-y-2">
                    <input placeholder="PHONE / WHATSAPP" value={form.guestPhone} onChange={e => setForm({...form, guestPhone: e.target.value})} className={`w-full bg-white rounded-2xl px-8 py-6 border ${errors.guestPhone ? 'border-red-400' : 'border-stone/10'} text-[13px] font-black uppercase tracking-tight outline-none focus:border-stone/20 shadow-sm`} />
                    {errors.guestPhone && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.guestPhone}</p>}
                  </div>
                </div>
              </div>
              <button onClick={() => validatePhase1() && setStep(2)} className="w-full bg-[#111] text-white py-6 rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-stone-light">Next Phase</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12 animate-fade-in py-4">
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone/20 px-1">Residency Window</p>
                <div className="space-y-3">
                  {availableSessions.map(s => (
                    <button 
                      key={s.id} 
                      onClick={() => setForm({...form, sessionId: s.id})} 
                      disabled={s.status === 'Full'}
                      className={`w-full px-8 py-6 rounded-2xl border transition-all text-left flex justify-between items-center ${
                        form.sessionId === s.id 
                          ? 'bg-[#E0F7F6] border-aqua-primary' 
                          : s.status === 'Full' 
                            ? 'bg-stone/5 border-stone/5 cursor-not-allowed opacity-60' 
                            : 'bg-white border-stone/10 hover:border-stone/20'
                      }`}
                    >
                      <p className={`text-[13px] font-black uppercase tracking-tight ${s.status === 'Full' ? 'text-stone/30' : 'text-stone'}`}>
                        {new Date(s.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        s.status === 'Full' 
                          ? 'text-stone/30' 
                          : s.status === 'Limited' 
                            ? 'text-amber-500' 
                            : 'text-stone/40'
                      }`}>{s.status}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone/20 px-1">Sanctuary Preference</p>
                {isLoadingRooms ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 bg-stone/5 rounded-2xl border border-stone/5 border-dashed">
                    <Loader2 className="animate-spin text-aqua-primary" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone/20">Fetching Availability</p>
                  </div>
                ) : availableRooms.length === 0 ? (
                  <div className="py-20 text-center bg-stone/5 rounded-2xl border border-stone/5 border-dashed">
                    <p className="text-stone/20 font-black uppercase tracking-widest text-[11px]">No sanctuaries available for this window</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableRooms.map(r => (
                      <button 
                        key={r.id} 
                        onClick={() => setForm({...form, roomPreferenceId: r.id})} 
                        className={`w-full px-8 py-6 rounded-2xl border transition-all text-left flex flex-col justify-center ${
                          form.roomPreferenceId === r.id 
                            ? 'bg-[#E0F7F6] border-aqua-primary' 
                            : 'bg-white border-stone/10 hover:border-stone/20'
                        }`}
                      >
                        <p className="text-[13px] font-black uppercase tracking-tight text-stone">{r.name}</p>
                        <p className="text-[11px] font-black text-stone/30 tracking-widest mt-0.5">${r.basePrice.toLocaleString()} USD</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setStep(1)} className="flex-1 bg-[#faf9f6] text-stone py-6 rounded-full text-[12px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"><ChevronLeft size={16} /> Back</button>
                <button onClick={() => setStep(3)} disabled={!form.sessionId || !form.roomPreferenceId} className="flex-[2] bg-[#111] text-white py-6 rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-20">Next Phase</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <label className="text-[10px] font-black text-stone/20 uppercase tracking-[0.2em] px-1">Commitment Protocols</label>
                <div className="space-y-4">
                  <label className="flex items-center gap-5 p-6 border border-stone/10 bg-white rounded-[2rem] cursor-pointer">
                    <input type="checkbox" checked={form.bathroomConsent} onChange={e => setForm({...form, bathroomConsent: e.target.checked})} className="w-5 h-5 accent-aqua-primary" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-stone/60">Accept Shared Bathroom protocol</span>
                  </label>
                  <label className="flex items-center gap-5 p-6 border border-stone/10 bg-white rounded-[2rem] cursor-pointer">
                    <input type="checkbox" checked={form.alcoholConsent} onChange={e => setForm({...form, alcoholConsent: e.target.checked})} className="w-5 h-5 accent-aqua-primary" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-stone/60">Accept Alcohol-Free commitment</span>
                  </label>
                  <label className="flex items-center gap-5 p-6 border border-stone/10 bg-white rounded-[2rem] cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={form.residencyAgreement} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setShowAgreementModal(true);
                        } else {
                          setForm({...form, residencyAgreement: false});
                        }
                      }} 
                      className="w-5 h-5 accent-aqua-primary" 
                    />
                    <span className="text-[11px] font-black uppercase tracking-widest text-stone/60">Residency Participation Agreement</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 bg-[#faf9f6] text-stone py-6 rounded-full text-[12px] font-black uppercase flex items-center justify-center gap-2"><ChevronLeft size={16} /> Back</button>
                <button onClick={() => setStep(4)} disabled={!form.bathroomConsent || !form.alcoholConsent || !form.residencyAgreement} className="flex-[2] bg-[#111] text-white py-6 rounded-full text-[12px] font-black uppercase shadow-xl disabled:opacity-20">Continue</button>
              </div>

              {showAgreementModal && (
                <ResidencyAgreementModal 
                  onAccept={() => {
                    setForm({...form, residencyAgreement: true});
                    setShowAgreementModal(false);
                  }}
                  onCancel={() => {
                    setShowAgreementModal(false);
                  }}
                />
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-stone/20 uppercase tracking-[0.2em] px-1">Technical Narrative</label>
                <textarea placeholder="Movement background, goals..." value={form.healthNotes} disabled={isSubmitting} onChange={e => setForm({...form, healthNotes: e.target.value})} className="w-full bg-white rounded-[2rem] p-8 border border-stone/10 text-[14px] font-serif italic min-h-[160px] outline-none shadow-sm disabled:opacity-50" />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(3)} disabled={isSubmitting} className="flex-1 bg-[#faf9f6] text-stone py-6 rounded-full text-[12px] font-black uppercase flex items-center justify-center gap-2"><ChevronLeft size={16} /> Back</button>
                <button onClick={handleStepSubmit} disabled={isSubmitting} className="flex-[2] bg-aqua-primary text-stone py-6 rounded-full text-[13px] font-black uppercase shadow-2xl flex items-center justify-center gap-3 disabled:bg-aqua-primary/50">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Transmit Inquiry'}
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-12 animate-fade-in relative pb-4 text-center">
              <button onClick={onClose} className="absolute -top-6 -right-6 text-stone/10 hover:text-stone"><X size={24} /></button>
              <div className="w-24 h-24 bg-[#f1fdf9] rounded-full flex items-center justify-center border border-[#e2f9f1] mx-auto">
                <Check size={42} className="text-[#20d489]" strokeWidth={3} />
              </div>
              <h4 className="text-[34px] font-black uppercase text-stone leading-none">REGISTRY RECEIVED</h4>
              <div className="space-y-3">
                <p className="text-[13px] font-black uppercase tracking-[0.4em] text-[#4fd1c5]">PENDING CURATOR VERIFICATION</p>
                <p className="text-[16px] font-black uppercase tracking-[0.2em] text-stone/30">PLEASE WAIT 28-48 HOURS</p>
              </div>
              <div className="grid grid-cols-2 gap-10 text-left border-y border-stone/5 py-10">
                <div className="space-y-1"><p className="text-[10px] font-black text-stone/20 uppercase">ID</p><p className="text-2xl font-black text-stone">{submittedId}</p></div>
                <div className="space-y-1"><p className="text-[10px] font-black text-stone/20 uppercase">GUEST</p><p className="text-2xl font-black text-stone">{form.guestName.split(' ')[0].toUpperCase()}</p></div>
              </div>
              <button onClick={onClose} className="w-full bg-[#999] text-white py-6 rounded-full text-[11px] font-black uppercase shadow-xl hover:bg-stone transition-all">RETURN TO ESTATE</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

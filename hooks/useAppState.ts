
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  VILLA_ROOMS as DEFAULT_ROOMS, 
  RESIDENCY_SESSIONS as DEFAULT_SESSIONS,
  FAQS as DEFAULT_FAQS,
  ITINERARY_DAYS as DEFAULT_ITINERARY
} from '../constants';
import { BookingState, Room, ResidencySession, Application, FAQItem, ApplicationStatus } from '../types';

const INITIAL_PROMO_VIDEO_URL = "https://player.vimeo.com/external/517042307.hd.mp4?s=d946d0a7a4073a9e34c9c7379201509a2503254e&profile_id=174";

const DEFAULT_PORTAL_CONFIG = {
  welcomeParagraph: "Our team is standing by to ensure your technical immersion is seamless and restorative. We look forward to your arrival at the estate.",
  packingList: [
    'Lightweight Judo Gi (available for rent)',
    'Rash guard / Compression shorts',
    'Water-appropriate movement gear',
    'High-SPF mineral sunscreen',
    'Grip-soled sandals / Reef shoes',
    'Personal technical journal',
    'Polarized sunglasses',
    'Reusable hydration flask'
  ],
  houseGuidelines: [
    { 
      title: 'ALCOHOL-FREE ESTATE', 
      desc: 'Strict commitment to a metabolic recovery environment. No alcohol permitted on grounds.' 
    },
    { 
      title: 'QUIET HOURS', 
      desc: 'Restorative silence from 9:00 PM to 7:00 AM daily.' 
    },
    { 
      title: 'SHARED SPACE ETIQUETTE', 
      desc: 'Please leave technical areas and common rooms exactly as you found them.' 
    },
    { 
      title: 'RESPECT FOR STRUCTURE', 
      desc: 'The estate is a shared home for foundational study. Please be mindful of the physical structure.' 
    }
  ],
  logistics: {
    address: 'Calle Vista al Mar 104, Pedregal, Cabo San Lucas',
    gateInstructions: 'Present your registry ID to the Pedregal security gate. Mention "Estate Judo 104".',
    checkInWindow: 'Access begins at 3:00 PM on your arrival date. Private SJD transfer included.'
  },
  promoVideoUrl: INITIAL_PROMO_VIDEO_URL
};

export const useAppState = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [sessions, setSessions] = useState<ResidencySession[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [portalConfig, setPortalConfig] = useState(DEFAULT_PORTAL_CONFIG);
  const [activePortalGuest, setActivePortalGuest] = useState<Application | null>(null);

  // Guards to prevent duplicate concurrent calls
  const isFetchingInquiries = useRef(false);
  const isFetchingRooms = useRef(false);
  const isFetchingSessions = useRef(false);

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const fetchInquiriesFromApi = useCallback(async () => {
    if (isFetchingInquiries.current) return;
    isFetchingInquiries.current = true;
    
    try {
      const response = await fetch('http://localhost:8000/api/inquiries');
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        const mappedInquiries: Application[] = result.data.map((apiInquiry: any) => ({
          id: apiInquiry.refId || apiInquiry._id,
          sessionId: apiInquiry.sessionId || '', 
          guestName: apiInquiry.fullName,
          email: apiInquiry.email,
          phone: apiInquiry.phone,
          gender: '', 
          roomPreferenceId: apiInquiry.roomId,
          roomName: apiInquiry.roomName,
          residencyDate: apiInquiry.date,
          bookingType: 'solo', 
          status: (apiInquiry.status.charAt(0).toUpperCase() + apiInquiry.status.slice(1)) as ApplicationStatus,
          consentBathroom: apiInquiry.isBathroomProtocolChecked,
          consentAlcohol: apiInquiry.isAlcoholFreeEstateChecked,
          totalPrice: 0, 
          depositPaid: false,
          timestamp: new Date(apiInquiry.createdAt).getTime(),
          healthNotes: apiInquiry.backgroundDescription
        }));
        setApplications(mappedInquiries);
        saveToStorage('aj_apps', mappedInquiries);
      }
    } catch (error) {
      console.warn("Inquiries API unavailable:", error);
    } finally {
      isFetchingInquiries.current = false;
    }
  }, []);

  const fetchRoomsFromApi = useCallback(async () => {
    if (isFetchingRooms.current) return;
    isFetchingRooms.current = true;
    
    try {
      const response = await fetch('http://localhost:8000/api/getAllRooms');
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        const mappedRooms: Room[] = result.data.map((apiRoom: any) => ({
          id: apiRoom._id,
          name: apiRoom.name,
          description: apiRoom.description,
          location: "Estate Wing", 
          bedType: apiRoom.bedType,
          basePrice: apiRoom.price,
          image: apiRoom.imgPath.startsWith('http') ? apiRoom.imgPath : `http://localhost:8000${apiRoom.imgPath}`,
          maxOccupancy: 2,
          bathType: apiRoom.bathRoomType.toLowerCase().includes('shared') ? 'shared' : 'private'
        }));
        setRooms(mappedRooms);
        saveToStorage('aj_rooms', mappedRooms);
      }
    } catch (error) {
      console.warn("Rooms API unavailable:", error);
    } finally {
      isFetchingRooms.current = false;
    }
  }, []);

  const fetchSessionsFromApi = useCallback(async () => {
    if (isFetchingSessions.current) return;
    isFetchingSessions.current = true;
    
    try {
      const response = await fetch('http://localhost:8000/api/session/getAllSessions');
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        const mappedSessions: ResidencySession[] = result.data.map((apiSession: any) => ({
          id: apiSession._id,
          startDate: apiSession.startDate,
          endDate: apiSession.endDate,
          status: 'Open', // Default to Open as API doesn't provide status
          maxGuests: apiSession.maxGuests
        }));
        setSessions(mappedSessions);
        saveToStorage('aj_sessions', mappedSessions);
      }
    } catch (error) {
      console.warn("Sessions API unavailable:", error);
    } finally {
      isFetchingSessions.current = false;
    }
  }, []);

  useEffect(() => {
    const get = (key: string) => localStorage.getItem(key);
    const storedApps = JSON.parse(get('aj_apps') || '[]');
    setApplications(storedApps);
    
    const localSessions = JSON.parse(get('aj_sessions') || JSON.stringify(DEFAULT_SESSIONS));
    setSessions(localSessions);
    
    const localRooms = JSON.parse(get('aj_rooms') || JSON.stringify(DEFAULT_ROOMS));
    setRooms(localRooms);

    setFaqs(JSON.parse(get('aj_faqs') || JSON.stringify(DEFAULT_FAQS)));
    setItinerary(JSON.parse(get('aj_itinerary') || JSON.stringify(DEFAULT_ITINERARY)));
    setPortalConfig(JSON.parse(get('aj_portal_config') || JSON.stringify(DEFAULT_PORTAL_CONFIG)));

    const portalId = new URLSearchParams(window.location.search).get('portal');
    if (portalId) {
      const guest = storedApps.find((a: Application) => a.id === portalId);
      if (guest && (guest.status === 'Confirmed' || guest.status === 'Approved')) {
        setActivePortalGuest(guest);
      }
    }
  }, []);

  const submitApplication = async (form: BookingState) => {
    const selectedSession = sessions.find(s => s.id === form.sessionId);
    const payload = {
      fullName: form.guestName,
      email: form.guestEmail,
      phone: form.guestPhone,
      date: selectedSession ? selectedSession.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      roomId: form.roomPreferenceId,
      isBathroomProtocolChecked: form.bathroomConsent,
      isAlcoholFreeEstateChecked: form.alcoholConsent,
      backgroundDescription: form.healthNotes
    };

    try {
      const response = await fetch('http://localhost:8000/api/inquiries/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || "Failed to transmit inquiry");
      }
    } catch (error) {
      console.error("Transmission Error:", error);
      throw error;
    }
  };

  const updateAppStatus = (id: string, status: ApplicationStatus) => {
    const updated = applications.map(a => a.id === id ? { ...a, status } : a);
    setApplications(updated);
    saveToStorage('aj_apps', updated);
  };

  return {
    applications, setApplications,
    sessions, setSessions,
    rooms, setRooms,
    faqs, setFaqs,
    itinerary, setItinerary,
    portalConfig, setPortalConfig,
    activePortalGuest, setActivePortalGuest,
    submitApplication,
    updateAppStatus,
    saveToStorage,
    fetchInquiriesFromApi,
    fetchRoomsFromApi,
    fetchSessionsFromApi
  };
};

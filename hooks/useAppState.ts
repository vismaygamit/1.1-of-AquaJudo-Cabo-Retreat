
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FAQS as DEFAULT_FAQS,
  ITINERARY_DAYS as DEFAULT_ITINERARY,
  API_BASE_URL,
  API_ROOT
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

const FETCH_THROTTLE_MS = 10000;

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useAppState = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [sessions, setSessions] = useState<ResidencySession[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [portalConfig, setPortalConfig] = useState(DEFAULT_PORTAL_CONFIG);
  const [activePortalGuest, setActivePortalGuest] = useState<Application | null>(null);

  const isFetchingInquiries = useRef(false);
  const isFetchingRooms = useRef(false);
  const isFetchingSessions = useRef(false);
  
  const lastInquiryFetch = useRef(0);
  const lastInquiryPage = useRef(0);
  const lastRoomFetch = useRef(0);
  const lastSessionFetch = useRef(0);

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const fetchInquiriesFromApi = useCallback(async (page = 1, limit = 5, force = false) => {
    const now = Date.now();
    if (isFetchingInquiries.current) return;
    
    const isSamePage = lastInquiryPage.current === page;
    const isWithinThrottle = (now - lastInquiryFetch.current < FETCH_THROTTLE_MS);
    
    if (!force && isWithinThrottle && isSamePage) return;
    
    isFetchingInquiries.current = true;
    lastInquiryFetch.current = now;
    lastInquiryPage.current = page;
    
    try {
      const response = await fetch(`${API_BASE_URL}/inquiries?page=${page}&limit=${limit}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const inquiriesData = result.data.inquiries || [];
        const paginationData = result.data.pagination || null;

        const mappedInquiries: Application[] = inquiriesData.map((apiInquiry: any) => ({
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
        setPagination(paginationData);
        if (page === 1) {
          saveToStorage('aj_apps', mappedInquiries);
        }
      }
    } catch (error) {
      console.warn("Inquiries API unavailable:", error);
    } finally {
      isFetchingInquiries.current = false;
    }
  }, []);

  const fetchRoomsFromApi = useCallback(async (force = false) => {
    const now = Date.now();
    if (isFetchingRooms.current) return;
    if (!force && (now - lastRoomFetch.current < FETCH_THROTTLE_MS)) return;

    isFetchingRooms.current = true;
    lastRoomFetch.current = now;
    
    try {
      const response = await fetch(`${API_BASE_URL}/getAllRooms`);
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        const mappedRooms: Room[] = result.data.map((apiRoom: any) => ({
          id: apiRoom._id,
          name: apiRoom.name,
          description: apiRoom.description,
          location: "Estate Wing", 
          bedType: apiRoom.bedType || 'Restorative Sanctuary',
          basePrice: apiRoom.price,
          image: apiRoom.imgPath.startsWith('http') ? apiRoom.imgPath : `${API_ROOT}${apiRoom.imgPath}`,
          maxOccupancy: 2,
          bathType: apiRoom.bathRoomType?.toLowerCase().includes('shared') ? 'shared' : 'private'
        }));
        setRooms(mappedRooms);
      }
    } catch (error) {
      console.warn("Rooms API unavailable:", error);
    } finally {
      isFetchingRooms.current = false;
    }
  }, []);

  const fetchSessionsFromApi = useCallback(async (force = false) => {
    const now = Date.now();
    if (isFetchingSessions.current) return;
    if (!force && (now - lastSessionFetch.current < FETCH_THROTTLE_MS)) return;

    isFetchingSessions.current = true;
    lastSessionFetch.current = now;
    
    try {
      const response = await fetch(`${API_BASE_URL}/session/getAllSessions`);
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        const mappedSessions: ResidencySession[] = result.data.map((apiSession: any) => ({
          id: apiSession._id,
          startDate: apiSession.startDate.split('T')[0],
          endDate: apiSession.endDate.split('T')[0],
          status: 'Open', 
          maxGuests: apiSession.maxGuests
        }));
        setSessions(mappedSessions);
      }
    } catch (error) {
      console.warn("Sessions API unavailable:", error);
    } finally {
      isFetchingSessions.current = false;
    }
  }, []);

  useEffect(() => {
    const get = (key: string) => localStorage.getItem(key);
    
    // Identity/Apps still use storage for magic link lookups
    const storedApps = JSON.parse(get('aj_apps') || '[]');
    setApplications(storedApps);
    
    // Sessions and Rooms strictly start empty, no local constants or storage
    setSessions([]);
    setRooms([]);

    // Other settings still use storage as placeholders
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
      const response = await fetch(`${API_BASE_URL}/inquiries/add`, {
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

  const saveSessionToApi = async (session: any) => {
    const isNew = !session.id || (session.id.length < 15 && !isNaN(Number(session.id)));
    const url = isNew 
      ? `${API_BASE_URL}/session/add` 
      : `${API_BASE_URL}/session/update/${session.id}`;
    const method = isNew ? 'POST' : 'PATCH';

    const payload = {
      startDate: session.startDate,
      endDate: session.endDate,
      maxGuests: session.maxGuests
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success && result.data) {
        const updatedSession: ResidencySession = {
          id: result.data._id,
          startDate: result.data.startDate.split('T')[0],
          endDate: result.data.endDate.split('T')[0],
          status: 'Open',
          maxGuests: result.data.maxGuests
        };
        const next = isNew 
          ? sessions.map(s => s.id === session.id ? updatedSession : s)
          : sessions.map(s => s.id === result.data._id ? updatedSession : s);
        
        setSessions(next);
        return result.data;
      } else {
        throw new Error(result.message || "Failed to synchronize residency window");
      }
    } catch (error) {
      console.error("Save Session Error:", error);
      throw error;
    }
  };

  const deleteSessionFromApi = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/session/delete/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        const next = sessions.filter(s => s.id !== id);
        setSessions(next);
        return true;
      } else {
        throw new Error(result.message || "Failed to delete residency window");
      }
    } catch (error) {
      console.error("Delete Session Error:", error);
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
    pagination, setPagination,
    sessions, setSessions,
    rooms, setRooms,
    faqs, setFaqs,
    itinerary, setItinerary,
    portalConfig, setPortalConfig,
    activePortalGuest, setActivePortalGuest,
    submitApplication,
    saveSessionToApi,
    deleteSessionFromApi,
    updateAppStatus,
    saveToStorage,
    fetchInquiriesFromApi,
    fetchRoomsFromApi,
    fetchSessionsFromApi
  };
};

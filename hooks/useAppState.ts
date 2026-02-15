import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  API_BASE_URL,
  API_ROOT
} from '../constants';
import { BookingState, Room, ResidencySession, Application, FAQItem, ApplicationStatus } from '../types';

const INITIAL_PROMO_VIDEO_URL = "https://player.vimeo.com/external/517042307.hd.mp4?s=d946d0a7a4073a9e34c9c7379201509a2503254e&profile_id=174";

const INITIAL_FAQS: FAQItem[] = [
  { id: 'f1', q: "How do shared bathrooms work?", a: "Shared bathrooms are assigned strictly by same-gender or to guests booking together as a private group. Curation ensures a respectful and aligned environment." },
  { id: 'f2', q: "Is the estate alcohol-free?", a: "Yes. To prioritize technical focus, metabolic recovery, and mental clarity, we maintain a strictly alcohol-free residency environment." },
  { id: 'f3', q: "What is the fitness expectation?", a: "This is a foundational technical residency suitable for beginners. While active, the pace is restorative and focused on alignment rather than intensity." },
  { id: 'f4', q: "Why is an application required?", a: "With only 4 guests per residency, curation is essential to ensure a high-quality, aligned, and respectful group experience for all participants." }
];

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

// Custom hook to manage the global application state and synchronization with the backend API
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
  const isFetchingItinerary = useRef(false);
  const isFetchingFaqs = useRef(false);
  
  const lastInquiryFetch = useRef(0);
  const lastInquiryPage = useRef(0);
  const lastRoomFetch = useRef(0);
  const lastSessionFetch = useRef(0);
  const lastItineraryFetch = useRef(0);
  const lastFaqFetch = useRef(0);

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
        const t = Date.now();
        const mappedRooms: Room[] = result.data.map((apiRoom: any) => ({
          id: apiRoom._id,
          name: apiRoom.name,
          description: apiRoom.description,
          location: "Estate Wing", 
          bedType: apiRoom.bedType || 'Restorative Sanctuary',
          basePrice: apiRoom.price,
          image: `${apiRoom.imgPath.startsWith('http') ? apiRoom.imgPath : `${API_ROOT}${apiRoom.imgPath}`}?t=${t}`,
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

  const fetchItineraryFromApi = useCallback(async (force = false) => {
    const now = Date.now();
    if (isFetchingItinerary.current) return;
    if (!force && (now - lastItineraryFetch.current < FETCH_THROTTLE_MS)) return;

    isFetchingItinerary.current = true;
    lastItineraryFetch.current = now;

    try {
      const response = await fetch(`${API_BASE_URL}/itinerary`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setItinerary(result.data);
      }
    } catch (error) {
      console.warn("Itinerary API unavailable:", error);
    } finally {
      isFetchingItinerary.current = false;
    }
  }, []);

  /**
   * Fetches the Estate Intelligence (FAQs) from the registry.
   */
  const fetchFaqsFromApi = useCallback(async (force = false) => {
    const now = Date.now();
    if (isFetchingFaqs.current) return;
    if (!force && (now - lastFaqFetch.current < FETCH_THROTTLE_MS)) return;

    isFetchingFaqs.current = true;
    lastFaqFetch.current = now;

    try {
      const response = await fetch(`${API_BASE_URL}/faq`, {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE'
        }
      });
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const mappedFaqs: FAQItem[] = result.data.map((apiFaq: any) => ({
          id: apiFaq._id,
          q: apiFaq.que,
          a: apiFaq.ans
        }));
        setFaqs(mappedFaqs);
        saveToStorage('aj_faqs', mappedFaqs);
      }
    } catch (error) {
      console.warn("FAQ API unavailable:", error);
    } finally {
      isFetchingFaqs.current = false;
    }
  }, []);

  /**
   * Synchronizes an intelligence entry (FAQ) with the backend registry.
   */
  const saveFaqToApi = async (faq: { id: string, q: string, a: string }) => {
    const isNew = faq.id.length < 15 && !isNaN(Number(faq.id));
    const url = isNew ? `${API_BASE_URL}/faq` : `${API_BASE_URL}/faq/${faq.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const response = await fetch(url, {
      method: method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify({
        que: faq.q,
        ans: faq.a
      })
    });
    const result = await response.json();
    if (result.success) {
      await fetchFaqsFromApi(true);
    } else {
      throw new Error(result.message || "Failed to synchronize intelligence entry");
    }
    return result;
  };

  /**
   * Purges an intelligence entry from the registry.
   */
  const deleteFaqFromApi = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/faq/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer YOUR_TOKEN_HERE' }
    });
    const result = await response.json();
    if (result.success) {
      await fetchFaqsFromApi(true);
    } else {
      throw new Error(result.message || "Purge failed");
    }
    return result;
  };

  /**
   * Synchronizes the technical pathway with the registry.
   */
  const saveItineraryToApi = async (days: any[]) => {
    const url = `${API_BASE_URL}/itinerary`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 
        'Authorization': 'Bearer YOUR_CLERK_TOKEN',
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ days })
    });
    const result = await response.json();
    if (result.success) {
      setItinerary(result.data);
      saveToStorage('aj_itinerary', result.data);
    } else {
      throw new Error(result.message || "Failed to synchronize pathway");
    }
    return result;
  };

  // Save or update a residency window on the backend
  const saveSessionToApi = async (session: any) => {
    const isNew = session.id.length < 15 && !isNaN(Number(session.id));
    const url = isNew ? `${API_BASE_URL}/session/createSession` : `${API_BASE_URL}/session/updateSession/${session.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: session.startDate,
        endDate: session.endDate,
        maxGuests: session.maxGuests
      })
    });
    const result = await response.json();
    if (result.success) {
      await fetchSessionsFromApi(true);
    }
    return result;
  };

  // Remove a residency window from the backend registry
  const deleteSessionFromApi = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/session/deleteSession/${id}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    if (result.success) {
      await fetchSessionsFromApi(true);
    }
    return result;
  };

  // Transmit a new guest inquiry to the server
  const submitApplication = async (form: BookingState) => {
    const response = await fetch(`${API_BASE_URL}/inquiry/createInquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.guestName,
        email: form.guestEmail,
        phone: form.guestPhone,
        roomId: form.roomPreferenceId,
        sessionId: form.sessionId,
        backgroundDescription: form.healthNotes,
        // Fix: accessing bathroomConsent and alcoholConsent from form (BookingState)
        isBathroomProtocolChecked: form.bathroomConsent,
        isAlcoholFreeEstateChecked: form.alcoholConsent
      })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Submission failed');
    return result.data;
  };

  useEffect(() => {
    const get = (key: string) => localStorage.getItem(key);
    
    const storedApps = JSON.parse(get('aj_apps') || '[]');
    setApplications(storedApps);
    
    // Initial content fetch for the landing page
    fetchRoomsFromApi();
    fetchSessionsFromApi();
    fetchItineraryFromApi();
    fetchFaqsFromApi();

    const storedFaqs = JSON.parse(get('aj_faqs') || 'null');
    if (storedFaqs) setFaqs(storedFaqs);
    else setFaqs(INITIAL_FAQS);

    const storedPortal = JSON.parse(get('aj_portal_config') || 'null');
    if (storedPortal) setPortalConfig(storedPortal);

    // Resolve portal guest if magic link is detected in URL
    const urlParams = new URLSearchParams(window.location.search);
    const portalId = urlParams.get('portal');
    if (portalId) {
      const found = storedApps.find((a: Application) => a.id === portalId);
      if (found) setActivePortalGuest(found);
    }
  }, [fetchRoomsFromApi, fetchSessionsFromApi, fetchItineraryFromApi, fetchFaqsFromApi]);

  return {
    applications,
    pagination,
    setApplications,
    sessions,
    setSessions,
    rooms,
    setRooms,
    faqs,
    setFaqs,
    itinerary,
    setItinerary,
    portalConfig,
    setPortalConfig,
    activePortalGuest,
    fetchInquiriesFromApi,
    fetchRoomsFromApi,
    fetchSessionsFromApi,
    fetchItineraryFromApi,
    fetchFaqsFromApi,
    saveFaqToApi,
    deleteFaqFromApi,
    saveItineraryToApi,
    saveSessionToApi,
    deleteSessionFromApi,
    submitApplication
  };
};
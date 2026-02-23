
import { useState, useEffect, useCallback, useRef } from 'react';
import {
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

const FETCH_THROTTLE_MS = 2000;

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
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const isFetchingInquiries = useRef(false);
  const isFetchingRooms = useRef(false);
  const isFetchingSessions = useRef(false);
  const isFetchingItinerary = useRef(false);
  const isFetchingFaqs = useRef(false);
  const isFetchingPortal = useRef(false);

  const lastInquiryFetch = useRef(0);
  const lastInquiryPage = useRef(0);
  const lastRoomFetch = useRef(0);
  const lastSessionFetch = useRef(0);
  const lastItineraryFetch = useRef(0);
  const lastFaqFetch = useRef(0);
  const lastPortalFetch = useRef(0);

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
      const response = await fetch(`${API_BASE_URL}/inquiries?page=${page}&limit=${limit}`, { credentials: 'omit' });
      const result = await response.json();
      if (result.success && result.data) {
        const inquiriesData = result.data.inquiries || [];
        const mappedInquiries: Application[] = inquiriesData.map((apiInquiry: any) => {
          const sStart = apiInquiry.sessionStartDate || apiInquiry.startDate || (apiInquiry.session && (apiInquiry.session.startDate || apiInquiry.session.start_date));
          const sEnd = apiInquiry.sessionEndDate || apiInquiry.endDate || (apiInquiry.session && (apiInquiry.session.endDate || apiInquiry.session.end_date));
          
          return {
            refId: apiInquiry.refId,
            id: apiInquiry._id,
            sessionId: apiInquiry.sessionId || (apiInquiry.session && apiInquiry.session._id) || '',
            guestName: apiInquiry.fullName,
            email: apiInquiry.email,
            phone: apiInquiry.phone,
            gender: '',
            roomPreferenceId: apiInquiry.roomId,
            roomName: apiInquiry.roomName,
            residencyDate: apiInquiry.date,
            sessionStartDate: sStart,
            sessionEndDate: sEnd,
            bookingType: 'solo',
            status: (apiInquiry.status.charAt(0).toUpperCase() + apiInquiry.status.slice(1)) as ApplicationStatus,
            consentBathroom: apiInquiry.isBathroomProtocolChecked,
            consentAlcohol: apiInquiry.isAlcoholFreeEstateChecked,
            totalPrice: 0,
            depositPaid: false,
            timestamp: new Date(apiInquiry.createdAt).getTime(),
            healthNotes: apiInquiry.backgroundDescription
          };
        });
        setApplications(mappedInquiries);
        setPagination(result.data.pagination || null);
        
        // If searching for a portalId on initial load
        const urlParams = new URLSearchParams(window.location.search);
        const portalId = urlParams.get('portal');
        if (portalId) {
          const found = mappedInquiries.find(a => a.id === portalId);
          if (found) setActivePortalGuest(found);
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
      const response = await fetch(`${API_BASE_URL}/getAllRooms`, { credentials: 'omit' });
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const t = Date.now();
        const mappedRooms: Room[] = result.data.map((apiRoom: any) => {
          const parseArrayField = (field: any) => {
            if (Array.isArray(field)) return field;
            if (typeof field === 'string' && field.trim()) {
              try {
                return JSON.parse(field);
              } catch (e) {
                return field.split(',').map((s: string) => s.trim());
              }
            }
            return [];
          };

          return {
            id: apiRoom._id,
            name: apiRoom.name,
            description: apiRoom.description,
            basePrice: apiRoom.price,
            image: apiRoom.imgPath ? (apiRoom.imgPath.startsWith('http') ? apiRoom.imgPath : `${API_ROOT}${apiRoom.imgPath}`) + `?t=${t}` : undefined,
            video: apiRoom.videoPath ? (apiRoom.videoPath.startsWith('http') ? apiRoom.videoPath : `${API_ROOT}${apiRoom.videoPath}`) + `?t=${t}` : undefined,
            maxOccupancy: apiRoom.maxOccupancy || 2,
            facilities: parseArrayField(apiRoom.facilities)
          };
        });
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
      const response = await fetch(`${API_BASE_URL}/session/getAllSessionsForAdmin`, { credentials: 'omit' });
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const mappedSessions: ResidencySession[] = result.data.map((apiSession: any) => ({
          id: apiSession._id,
          startDate: apiSession.startDate,
          endDate: apiSession.endDate,
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
      const response = await fetch(`${API_BASE_URL}/itinerary`, { credentials: 'omit' });
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

  const fetchFaqsFromApi = useCallback(async (force = false) => {
    const now = Date.now();
    if (isFetchingFaqs.current) return;
    if (!force && (now - lastFaqFetch.current < FETCH_THROTTLE_MS)) return;
    isFetchingFaqs.current = true;
    lastFaqFetch.current = now;
    try {
      const response = await fetch(`${API_BASE_URL}/faq`, { credentials: 'omit' });
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const mappedFaqs: FAQItem[] = result.data.map((apiFaq: any) => ({
          id: apiFaq._id,
          q: apiFaq.que,
          a: apiFaq.ans
        }));
        setFaqs(mappedFaqs);
      }
    } catch (error) {
      console.warn("FAQ API unavailable:", error);
    } finally {
      isFetchingFaqs.current = false;
    }
  }, []);

  const fetchPortalConfigFromApi = useCallback(async (force = false) => {
    const now = Date.now();
    if (isFetchingPortal.current) return;
    if (!force && (now - lastPortalFetch.current < FETCH_THROTTLE_MS)) return;
    isFetchingPortal.current = true;
    lastPortalFetch.current = now;
    try {
      const response = await fetch(`${API_BASE_URL}/getPortalSettings`, { credentials: 'omit' });
      if (!response.ok) throw new Error(`Portal GET Error ${response.status}`);
      const result = await response.json();

      if (result.success && result.data) {
        const api = result.data;
        const mappedPortal = {
          welcomeParagraph: api.welcomeMessage || DEFAULT_PORTAL_CONFIG.welcomeParagraph,
          packingList: (Array.isArray(api.packingInventory) && api.packingInventory.length > 0)
            ? api.packingInventory
            : DEFAULT_PORTAL_CONFIG.packingList,
          houseGuidelines: (Array.isArray(api.registryGuidelines) && api.registryGuidelines.length > 0)
            ? api.registryGuidelines.map((g: any) => ({
              title: g.title,
              desc: g.description
            }))
            : DEFAULT_PORTAL_CONFIG.houseGuidelines,
          logistics: {
            address: api.arrivalLogistics?.estateAddress || DEFAULT_PORTAL_CONFIG.logistics.address,
            gateInstructions: api.arrivalLogistics?.gatedAccessInstructions || DEFAULT_PORTAL_CONFIG.logistics.gateInstructions,
            checkInWindow: api.arrivalLogistics?.checkInWindow || DEFAULT_PORTAL_CONFIG.logistics.checkInWindow
          },
          promoVideoUrl: api.estateNarrativeVideoPath 
            ? (api.estateNarrativeVideoPath.startsWith('http') ? api.estateNarrativeVideoPath : `${API_ROOT}${api.estateNarrativeVideoPath}`) 
            : DEFAULT_PORTAL_CONFIG.promoVideoUrl
        };
        setPortalConfig(mappedPortal);
      }
    } catch (error) {
      console.warn("Portal API fetch failed:", error);
    } finally {
      isFetchingPortal.current = false;
    }
  }, []);

  const savePortalConfigToApi = async (config: typeof DEFAULT_PORTAL_CONFIG, videoFile?: File) => {
    const formData = new FormData();
    if (videoFile) formData.append('estateNarrativeVideo', videoFile);
    formData.append('welcomeMessage', config.welcomeParagraph);
    formData.append('arrivalLogistics', JSON.stringify({
      estateAddress: config.logistics.address,
      checkInWindow: config.logistics.checkInWindow,
      gatedAccessInstructions: config.logistics.gateInstructions
    }));
    formData.append('packingInventory', JSON.stringify(config.packingList));
    formData.append('registryGuidelines', JSON.stringify(config.houseGuidelines.map(g => ({
      title: g.title,
      description: g.desc
    }))));

    const response = await fetch(`${API_BASE_URL}/updatePortalSettings`, {
      method: 'PUT',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) throw new Error(`Registry refused sync: ${response.status}`);
    const result = await response.json();
    if (result.success) await fetchPortalConfigFromApi(true);
    return result;
  };

  const saveFaqToApi = async (faq: { id: string, q: string, a: string }) => {
    const isNew = faq.id.length < 15 && !isNaN(Number(faq.id));
    const url = isNew ? `${API_BASE_URL}/faq` : `${API_BASE_URL}/faq/${faq.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ que: faq.q, ans: faq.a }),
      credentials: 'include'
    });
    const result = await response.json();
    if (result.success) await fetchFaqsFromApi(true);
    return result;
  };

  const deleteFaqFromApi = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/faq/${id}`, { method: 'DELETE', credentials: 'include' });
    const result = await response.json();
    if (result.success) await fetchFaqsFromApi(true);
    return result;
  };

  const saveItineraryToApi = async (days: any[]) => {
    const response = await fetch(`${API_BASE_URL}/itinerary`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days }),
      credentials: 'include'
    });
    const result = await response.json();
    if (result.success) setItinerary(result.data);
    return result;
  };

  const saveSessionToApi = async (session: any) => {
    const isNew = session.id.length < 15 && !isNaN(Number(session.id));
    const url = isNew ? `${API_BASE_URL}/session/add` : `${API_BASE_URL}/session/update/${session.id}`;
    const method = isNew ? 'POST' : 'PATCH';
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: session.startDate, endDate: session.endDate, maxGuests: session.maxGuests }),
      credentials: 'include'
    });
    const result = await response.json();
    if (result.success) await fetchSessionsFromApi(true);
    return result;
  };

  const deleteSessionFromApi = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/session/delete/${id}`, { method: 'DELETE', credentials: 'include' });
    const result = await response.json();
    if (result.success) await fetchSessionsFromApi(true);
    return result;
  };

  const deleteInquiryFromApi = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/inquiries/${id}`, { method: 'DELETE', credentials: 'include' });
    const result = await response.json();
    if (result.success) await fetchInquiriesFromApi(pagination?.page || 1, 5, true);
    return result;
  };

  const submitApplication = async (form: BookingState) => {
    const response = await fetch(`${API_BASE_URL}/inquiries/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.guestName,
        email: form.guestEmail,
        phone: form.guestPhone,
        roomId: form.roomPreferenceId,
        sessionId: form.sessionId,
        backgroundDescription: form.healthNotes,
        isBathroomProtocolChecked: form.bathroomConsent,
        isAlcoholFreeEstateChecked: form.alcoholConsent
      }),
      credentials: 'omit'
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Submission failed');
    return result.data;
  };

  const fetchPaymentDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/paymentdetails?session_id=${sessionId}`, { credentials: 'omit' });
      const result = await response.json();
      if (result.success && result.data) {
        setPaymentId(result.data.id);
        return result.data;
      }
    } catch (error) {
      console.warn("Payment details API unavailable:", error);
    }
    return null;
  };

  useEffect(() => {
    fetchRoomsFromApi();
    fetchSessionsFromApi();
    fetchItineraryFromApi();
    fetchFaqsFromApi();
    fetchPortalConfigFromApi();

    const urlParams = new URLSearchParams(window.location.search);
    const portalId = urlParams.get('portal');
    if (portalId) {
      // If we are looking for a portal ID, we should try to fetch inquiries as well
      fetchInquiriesFromApi(1, 50); // Higher limit to increase chances of finding it
    }
  }, [fetchRoomsFromApi, fetchSessionsFromApi, fetchItineraryFromApi, fetchFaqsFromApi, fetchPortalConfigFromApi, fetchInquiriesFromApi]);

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
    paymentId,
    fetchInquiriesFromApi,
    fetchRoomsFromApi,
    fetchSessionsFromApi,
    fetchItineraryFromApi,
    fetchFaqsFromApi,
    fetchPortalConfigFromApi,
    savePortalConfigToApi,
    saveFaqToApi,
    deleteFaqFromApi,
    saveItineraryToApi,
    saveSessionToApi,
    deleteSessionFromApi,
    deleteInquiryFromApi,
    submitApplication,
    fetchPaymentDetails
  };
};

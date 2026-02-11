
import { AddOn, Room, FAQItem, ResidencySession } from './types';
// https://aquajudo-backend.onrender.com/
// http://localhost:8000
export const API_ROOT = 'https://aquajudo-backend.onrender.com';
export const API_BASE_URL = `${API_ROOT}/api`;

export const RESIDENCY_SESSIONS: ResidencySession[] = [
  { id: 's1', startDate: '2026-04-07', endDate: '2026-04-14', status: 'Limited', maxGuests: 4 },
  { id: 's2', startDate: '2026-05-05', endDate: '2026-05-12', status: 'Open', maxGuests: 4 },
  { id: 's3', startDate: '2026-06-02', endDate: '2026-06-09', status: 'Full', maxGuests: 4 },
];

export const VILLA_ROOMS: Room[] = [
  {
    id: 'onyx',
    name: "Onyx Sanctuary",
    location: "Main Floor",
    bedType: "Queen Bed",
    description: "A private ground-level sanctuary defined by a sculptural onyx stone headboard and a tranquil water feature. Ideal for guests seeking deeper privacy and uninterrupted rest.",
    basePrice: 4400,
    maxOccupancy: 2,
    bathType: 'private',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'balance',
    name: "Balance Sanctuary",
    location: "Second Level",
    bedType: "King Bed",
    description: "Features a king-size bed and opens onto a shared balcony. Same-gender or same-group shared bathroom protocol applies.",
    basePrice: 3800,
    maxOccupancy: 2,
    bathType: 'shared',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'flow',
    name: "Flow Sanctuary",
    location: "Second Level",
    bedType: "Queen Bed",
    description: "Offers a queen-size bed and shared balcony access. Same-gender or same-group shared bathroom protocol applies.",
    basePrice: 3400,
    maxOccupancy: 2,
    bathType: 'shared',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'
  }
];

export const ITINERARY_DAYS = [
  { day: 1, title: "Arrival & Foundational Rhythm", desc: "Private SJD transfer, estate orientation, and a calm introductory sunset dinner." },
  { day: 2, title: "Paddle to the Arch", desc: "Early-morning beach judo followed by a private guided paddle excursion to Land's End." },
  { day: 3, title: "Playa Balandra & La Paz", desc: "Full-day coastal immersion at the crystal lagoons of Balandra, integrating technical movement with natural terrain." },
  { day: 4, title: "Sanctuary Pause", desc: "Extended recovery meditation, pool-side technical study, and optional private 1:1 clinical sessions." },
  { day: 5, title: "Pelican Rock Immersion", desc: "Technical session followed by snorkeling and coastal exploration near Pelican Rock's marine sanctuary." },
  { day: 6, title: "Bouldering & Integration", desc: "Technical movement integrated with coastal bouldering. Closing sunset fire pit reflection." },
  { day: 7, title: "Departure & Integration", desc: "Final technical brunch, residency reflection, and private transfer for integration into home life." }
];

export const FAQS: FAQItem[] = [
  { id: 'f1', q: "How do shared bathrooms work?", a: "Shared bathrooms are assigned strictly by same-gender or to guests booking together as a private group. Curation ensures a respectful and aligned environment." },
  { id: 'f2', q: "Is the estate alcohol-free?", a: "Yes. To prioritize technical focus, metabolic recovery, and mental clarity, we maintain a strictly alcohol-free residency environment." },
  { id: 'f3', q: "What is the fitness expectation?", a: "This is a foundational technical residency suitable for beginners. While active, the pace is restorative and focused on alignment rather than intensity." },
  { id: 'f4', q: "Why is an application required?", a: "With only 4 guests per residency, curation is essential to ensure a high-quality, aligned, and respectful group experience for all participants." }
];

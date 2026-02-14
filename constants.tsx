
import { AddOn, Room, FAQItem, ResidencySession } from './types';

// API Configuration
export const API_ROOT = 'https://aquajudo-backend.onrender.com';
export const API_BASE_URL = `${API_ROOT}/api`;

// Sessions and Rooms are now exclusively fetched from the API.
// Local constants have been removed to prevent stale or hardcoded data.

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

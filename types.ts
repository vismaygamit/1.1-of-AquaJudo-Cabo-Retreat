
export type SessionStatus = 'Open' | 'Limited' | 'Full';
export type ApplicationStatus = 'Pending' | 'Approved' | 'Declined' | 'Waitlisted' | 'Confirmed';

export interface ResidencySession {
  id: string;
  startDate: string;
  endDate: string;
  status: SessionStatus;
  maxGuests: number;
}

export interface Application {
  id: string;
  sessionId: string;
  guestName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other' | '';
  roomPreferenceId: string;
  roomName?: string;
  residencyDate?: string;
  sessionStartDate?: string;
  sessionEndDate?: string;
  bookingType: 'solo' | 'couple' | 'group';
  companionName?: string;
  status: ApplicationStatus;
  assignedRoomId?: string;
  consentBathroom: boolean;
  consentAlcohol: boolean;
  healthNotes?: string;
  language?: string;
  oneOnOneInterest?: boolean;
  totalPrice: number;
  depositPaid: boolean;
  timestamp: number;
  notes?: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image?: string;
  video?: string;
  maxOccupancy: number;
  facilities?: string[];
}

export interface MediaAsset {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption: string;
}

export interface Review {
  id: string;
  author: string;
  role: string;
  stayDate: string;
  content: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  q: string;
  a: string;
}

export interface AddOn {
  id: string;
  title: string;
  description: string;
  price: number;
  duration?: string;
  level?: string;
  image?: string;
  isShareable?: boolean;
  capacity?: number;
}

export interface BookingState {
  sessionId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  gender: 'male' | 'female' | 'other' | '';
  bookingType: 'solo' | 'couple' | 'group';
  companionName: string;
  roomPreferenceId: string;
  healthNotes: string;
  oneOnOneInterest: boolean;
  bathroomConsent: boolean;
  alcoholConsent: boolean;
  language: string;
  notes: string;
  isConfirmed: boolean;
}

export interface PaymentDetails {
  id: string;
  referenceId: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  transactionDate: string;
  amount: string | number;
  status: string;
  inquiryId: string;
  magicUrl?: string;
}

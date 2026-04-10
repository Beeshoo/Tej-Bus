
export enum BusType {
  STANDARD = 'اقتصادية',
  VIP = 'كبار الشخصيات',
  ROYAL = 'رويال الملكية'
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  DRIVER = 'driver'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  role: UserRole;
  loggedIn: boolean;
  licenseNumber?: string;
  assignedBus?: string;
  status?: 'active' | 'on-leave';
  photoUrl?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  assignedBus?: string;
  status: 'active' | 'on-leave';
  photoUrl?: string;
}

export interface TripSchedule {
  id: string;
  departureTime: string;
  arrivalTime: string;
  label: string; // تسمية الفترة: صبحي، مسائي، إلخ
}

export interface Ticket {
  id: string;
  userId: string;
  from: string;
  to: string;
  busType: BusType;
  date: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  selectedSeats: number[];
  status: 'upcoming' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending';
  paymentId?: string;
  rating?: number;
  review?: string;
  driverId?: string;
  driverName?: string;
  driverPhoto?: string;
}

export interface BookingState {
  from: string;
  to: string;
  busType: BusType;
  date: string;
  departureTime: string;
  arrivalTime: string;
  selectedSeats: number[];
}

export interface Complaint {
  id?: number;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved' | 'ignored';
  createdAt: string;
}

export type UserRole = 'attendee' | 'organizer' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  organizer?: Organizer;
}

export interface Organizer {
  id: string;
  userId: string;
  companyName?: string;
  taxId?: string;
  verified: boolean;
  createdAt: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'attendee' | 'organizer';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

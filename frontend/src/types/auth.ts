export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'member' | 'mentor' | 'mentee' | 'moderator' | 'admin';
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login?: string;
  profile_picture?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role?: 'member' | 'mentor' | 'mentee';
}

export interface AuthResponse {
  user: User;
  sessionid: string;
  message?: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
}

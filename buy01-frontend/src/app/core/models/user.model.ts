/** The two roles the platform knows. CLIENT browses; SELLER manages a catalog and its media. */
export type Role = 'CLIENT' | 'SELLER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Resolved media URL, or null when the seller has not uploaded one. */
  avatarUrl: string | null;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterRequest extends Credentials {
  name: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
  user: User;
}

export interface ProfileUpdate {
  name: string;
  avatarUrl: string | null;
}

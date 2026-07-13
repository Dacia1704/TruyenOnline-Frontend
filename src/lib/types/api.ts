export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  roles?: string[];
}

export interface AuthTokenResponse {
  id: string;
  accessToken: string;
  refreshToken: string;
  email: string;
  username: string;
  avatarUrl?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

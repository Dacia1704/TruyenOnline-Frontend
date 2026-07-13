export interface LoginResponse {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  roles: string[];
  permissions: string[];
  accessToken: string;
  refreshToken: string;
}

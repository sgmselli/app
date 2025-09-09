import type { GetCurrentUserResponse } from "./profile";

export type AuthContextType = {
  user: GetCurrentUserResponse | null;
  loadingUser: boolean;
  loginUser: (requestData: LoginRequest) => Promise<LoginResponse>;
  logoutUser: () => void;
  isAuthenticated: () => boolean;
};

export interface LoginRequest{
    email: string
    password: string
}

export interface LoginResponse{
    id: number
    username: string;
    has_profile: boolean;
    is_bank_connected: boolean;
}

export interface RegisterRequest{
    email: string
    username: string
    password: string
    confirm_password: string
}

export interface RegisterResponse{
    int: number
    username: string
    email: string
}

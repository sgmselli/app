import { createContext, useContext, useState, useEffect } from "react";

import type { AuthContextType, LoginRequest, LoginResponse } from "../types/auth";
import type { GetCurrentUserResponse } from "../types/profile";
import { login, logout } from "../api/auth";
import { getMyProfileData } from "../api/profile";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<GetCurrentUserResponse | null>(null);
    const [loadingUser, setLoadingUser] = useState<boolean>(true);

    useEffect(() => {
        const handleFetch = async () => {
            try {
                const data = await getMyProfileData();
                setUser(data);
            } catch (err) {
                if (user) {
                    logoutUser();
                }
            } finally {
                setLoadingUser(false);
            }
        }
        handleFetch();
    }, []);

    const loginUser = async (requestData: LoginRequest): Promise<LoginResponse> => {
        const { id, username, has_profile, is_bank_connected } = await login({email: requestData.email, password: requestData.password});
        const userData = {id: id, username: username, email: requestData.email, has_profile: has_profile, is_bank_connected: is_bank_connected}
        setUser(userData);
        return userData
    };

    const logoutUser = async () => {
        await logout();
        setUser(null);
    };

     const isAuthenticated = () => !!user && !loadingUser;

    return (
        <AuthContext.Provider value={{ loadingUser, user, loginUser, logoutUser, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext)!;
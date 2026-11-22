import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthenticatedUserResponse, LoginRequest } from '../types/api';
import { authApi } from '../api/auth';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
    user: AuthenticatedUserResponse | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthenticatedUserResponse | null>(null);
    const [token, setToken] = useState<string | null>(() => {
        const t = sessionStorage.getItem('pulsepass_token');
        if (!t || t === 'undefined' || t === 'null') return null;
        return t;
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const queryClient = useQueryClient();

    useEffect(() => {
        const initAuth = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const userData = await authApi.getMeWithToken(token);
                setUser(userData);
            } catch {
                sessionStorage.removeItem('pulsepass_token');
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, [token]);

    const login = async (data: LoginRequest) => {
        try {
            const response = await authApi.login(data);

            // El backend lo envía en "accessToken"
            const tokenRecibido = response.accessToken;

            if (!tokenRecibido || tokenRecibido === 'undefined') {
                throw new Error("El servidor no devolvió un token válido.");
            }

            sessionStorage.setItem('pulsepass_token', tokenRecibido);
            setToken(tokenRecibido);

            const userData = await authApi.getMeWithToken(tokenRecibido);
            setUser(userData);
        } catch (error) {
            console.error("Error en login:", error);
            throw error;
        }
    };

    const logout = () => {
        sessionStorage.removeItem('pulsepass_token');
        setToken(null);
        setUser(null);
        queryClient.clear();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token && !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
    return context;
};
import { httpClient } from '../lib/http';
import {
    UserResponseSchema,
    type LoginRequest,
    type AuthResponse,
    type AuthenticatedUserResponse,
    type UserResponse,
} from '../types/api';

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        return httpClient<AuthResponse>('/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Función para pedir los datos pasando el token manualmente
    getMeWithToken: async (token: string): Promise<AuthenticatedUserResponse> => {
        return httpClient<AuthenticatedUserResponse>('/v1/auth/me', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },

    getUserByEmail: async (email: string): Promise<UserResponse> => {
        const data = await httpClient<unknown>(
            `/v1/users/by-email?email=${encodeURIComponent(email)}`,
            { method: 'GET' }
        );
        return UserResponseSchema.parse(data);
    },

    getUserByUsername: async (username: string): Promise<UserResponse> => {
        const data = await httpClient<unknown>(
            `/v1/users/by-username?username=${encodeURIComponent(username)}`,
            { method: 'GET' }
        );
        return UserResponseSchema.parse(data);
    },

    register: async (data: unknown): Promise<string> => {
        return httpClient<string>('/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};
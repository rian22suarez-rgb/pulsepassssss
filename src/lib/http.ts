import { ErrorResponseSchema, type ErrorResponse } from '../types/api';

export class ApiError extends Error {
    public status: number;
    public details?: Record<string, string>;

    constructor(data: ErrorResponse) {
        super(data.message);
        this.name = 'ApiError';
        this.status = data.status;
        this.details = data.details;
    }
}

// FIX: Nos aseguramos de que no devuelva strings basura como "undefined"
const getToken = () => {
    const t = sessionStorage.getItem('pulsepass_token');
    if (!t || t === 'undefined' || t === 'null' || t === '') return null;
    return t;
};

export const httpClient = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = getToken();

    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    // Si hay un token válido y no se ha enviado uno manualmente, lo añadimos
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = { ...options, headers };

    try {
        const response = await fetch(`/api${endpoint}`, config);

        if (!response.ok) {
            let errorData;
            try {
                const json = await response.json();
                errorData = ErrorResponseSchema.parse(json);
            } catch {
                errorData = {
                    timestamp: new Date().toISOString(),
                    status: response.status,
                    error: response.statusText,
                    message: 'Ocurrió un error inesperado en el servidor',
                };
            }
            throw new ApiError(errorData as ErrorResponse);
        }

        if (response.status === 204) return {} as T;

        const data = await response.json();
        return data as T;

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError({
            timestamp: new Date().toISOString(),
            status: 0,
            error: 'Network Error',
            message: 'No se pudo conectar con el servidor.',
        });
    }
};
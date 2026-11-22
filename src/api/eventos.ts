import { httpClient } from '../lib/http';
import type { EventSummaryResponse, EventResponse } from '../types/api';

export const eventosApi = {
    getPublicados: async (): Promise<EventSummaryResponse[]> => {
        return httpClient<EventSummaryResponse[]>('/events/published', { method: 'GET' });
    },
    getById: async (eventCode: string): Promise<EventResponse> => {
        return httpClient<EventResponse>(`/events/${eventCode}`, { method: 'GET' });
    },
    crear: async (data: any): Promise<EventResponse> => {
        return httpClient<EventResponse>('/events', { method: 'POST', body: JSON.stringify(data) });
    },
    publicar: async (eventCode: string): Promise<EventResponse> => {
        return httpClient<EventResponse>(`/events/${eventCode}/publish`, { method: 'PATCH' });
    },
    asociarArtista: async (eventCode: string, artistId: number): Promise<EventResponse> => {
        return httpClient<EventResponse>(`/events/${eventCode}/artists/${artistId}`, { method: 'POST' });
    },
    getByArtist: async (stageName: string): Promise<EventSummaryResponse[]> => {
        return httpClient<EventSummaryResponse[]>(`/events/by-artist?stageName=${stageName}`, { method: 'GET' });
    }
};
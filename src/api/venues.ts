import { httpClient } from '../lib/http';
import type { VenueResponse } from '../types/api';

export interface CreateVenueRequest {
    code: string;
    name: string;
    city: string;
    capacity: number;
    active?: boolean;
}

export const venuesApi = {
    getActive: async (): Promise<VenueResponse[]> => {
        return httpClient<VenueResponse[]>('/venues/active', { method: 'GET' });
    },
    getByCode: async (code: string): Promise<VenueResponse> => {
        return httpClient<VenueResponse>(`/venues/${code}`, { method: 'GET' });
    },
    create: async (data: CreateVenueRequest): Promise<VenueResponse> => {
        return httpClient<VenueResponse>('/venues', {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                active: data.active ?? true,
            }),
        });
    },
};
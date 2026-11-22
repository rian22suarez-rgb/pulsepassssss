import { httpClient } from '../lib/http';
import type { ArtistResponse } from '../types/api';

export const artistsApi = {
    getActive: async (): Promise<ArtistResponse[]> => {
        return httpClient<ArtistResponse[]>('/artists/active', { method: 'GET' });
    },
    getById: async (id: number): Promise<ArtistResponse> => {
        return httpClient<ArtistResponse>(`/artists/${id}`, { method: 'GET' });
    },
    getByStageName: async (stageName: string): Promise<ArtistResponse> => {
        return httpClient<ArtistResponse>(`/artists/by-stage-name?stageName=${stageName}`, { method: 'GET' });
    }
};
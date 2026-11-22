import { httpClient } from '../lib/http';
import type { TicketResponse } from '../types/api';

export const ticketsApi = {
    comprar: async (data: { userEmail: string; eventCode: string; type: string }): Promise<TicketResponse> => {
        return httpClient<TicketResponse>('/tickets', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getByUser: async (email: string): Promise<TicketResponse[]> => {
        return httpClient<TicketResponse[]>(`/tickets/user/${email}`);
    },

    cancelar: async (ticketCode: string): Promise<TicketResponse> => {
        return httpClient<TicketResponse>(`/tickets/${ticketCode}/cancel`, {
            method: 'PATCH',
        });
    },

    getByCode: async (ticketCode: string): Promise<TicketResponse> => {
        return httpClient<TicketResponse>(`/tickets/${ticketCode}`);
    },

    marcarUsado: async (ticketCode: string): Promise<TicketResponse> => {
        return httpClient<TicketResponse>(`/tickets/${ticketCode}/use`, {
            method: 'PATCH',
        });
    },
    getPaidByEvent: async (eventCode: string): Promise<TicketResponse[]> => {
        return httpClient<TicketResponse[]>(`/tickets/event/${eventCode}/paid`);
    }

};
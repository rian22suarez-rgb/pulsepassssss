import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets';

export const useComprarTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ticketsApi.comprar,
        onSuccess: () => {
            // Refrescamos la lista de tickets cuando compramos uno
            queryClient.invalidateQueries({ queryKey: ['mis-tickets'] });
        },
    });
};

export const useMisTickets = (email: string) => {
    return useQuery({
        queryKey: ['mis-tickets', email],
        queryFn: () => ticketsApi.getByUser(email),
        enabled: !!email,
    });
};

export const useCancelarTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ticketsApi.cancelar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mis-tickets'] });
        },
    });
};
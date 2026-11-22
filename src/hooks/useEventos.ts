import { useQuery } from '@tanstack/react-query';
import { eventosApi } from '../api/eventos';

export const useEventosPublicados = () => {
    return useQuery({
        queryKey: ['eventos-publicados'],
        queryFn: eventosApi.getPublicados,
        staleTime: 1000 * 60 * 5,
    });
};

// NUEVO HOOK
export const useEventoDetalle = (eventCode: string) => {
    return useQuery({
        queryKey: ['evento', eventCode],
        queryFn: () => eventosApi.getById(eventCode),
        enabled: !!eventCode, // Solo se ejecuta si hay un código en la URL
    });
};
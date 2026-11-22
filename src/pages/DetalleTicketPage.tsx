import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets';
import { RUTAS } from '../lib/rutas';

export const DetalleTicketPage = () => {
    const { ticketCode } = useParams<{ ticketCode: string }>();

    const { data: ticket, isLoading, isError } = useQuery({
        queryKey: ['ticket', ticketCode],
        queryFn: () => ticketsApi.getByCode(ticketCode!),
        enabled: !!ticketCode,
    });

    if (isLoading) return <div className="text-center py-20">Cargando ticket...</div>;

    if (isError || !ticket) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ticket no encontrado</h2>
                <p className="text-gray-600 mb-4">No tienes permiso para ver este ticket o no existe.</p>
                <Link to={RUTAS.misTickets} className="text-indigo-600 hover:underline">
                    &larr; Volver a mis tickets
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Ticket {ticket.type}</h1>
                    <p className="text-indigo-200 mt-1">Evento: {ticket.eventCode}</p>
                </div>
                <span className="bg-white text-indigo-600 px-4 py-2 rounded-full font-bold">
          {ticket.status}
        </span>
            </div>

            <div className="p-8 space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                    <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider font-semibold">Código de Entrada</p>
                    <p className="text-4xl font-mono font-bold text-gray-900 tracking-widest">{ticket.ticketCode}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Asistente</p>
                        <p className="font-medium text-gray-900">{ticket.userEmail}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Fecha de Compra</p>
                        <p className="font-medium text-gray-900">{new Date(ticket.purchaseDate).toLocaleDateString('es-ES')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Precio</p>
                        <p className="font-medium text-gray-900">${ticket.price}</p>
                    </div>
                </div>

                <div className="pt-6 border-t flex justify-center">
                    <Link to={RUTAS.misTickets} className="text-indigo-600 hover:underline">
                        &larr; Volver a mis tickets
                    </Link>
                </div>
            </div>
        </div>
    );
};
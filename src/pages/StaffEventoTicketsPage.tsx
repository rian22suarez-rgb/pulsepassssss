import { useParams, Link } from 'react-router';
import { useQueries, useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets';
import { authApi } from '../api/auth';
import { RUTAS } from '../lib/rutas';

export const StaffEventoTicketsPage = () => {
    const { eventCode } = useParams<{ eventCode: string }>();

    const { data: tickets, isLoading, isError } = useQuery({
        queryKey: ['tickets-paid', eventCode],
        queryFn: () => ticketsApi.getPaidByEvent(eventCode!),
        enabled: !!eventCode,
    });

    const correosUnicos = Array.from(new Set((tickets ?? []).map((t) => t.userEmail)));

    const consultasUsuarios = useQueries({
        queries: correosUnicos.map((email) => ({
            queryKey: ['asistente-email', email],
            queryFn: () => authApi.getUserByEmail(email),
            retry: false,
        })),
    });

    const mapaNombres = new Map<string, string>();
    correosUnicos.forEach((email, idx) => {
        const username = consultasUsuarios[idx]?.data?.username;
        mapaNombres.set(email, username || email.split('@')[0]);
    });

    if (isLoading) return <div className="text-center py-20">Cargando tickets del evento...</div>;
    if (isError) return <div className="text-center py-20 text-red-500">Error al cargar los tickets.</div>;

    return (
        <div className="max-w-5xl mx-auto mt-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Tickets Pagados: {eventCode}</h1>
                <Link to={RUTAS.staffIngreso} className="text-indigo-600 hover:underline">
                    &larr; Volver a validar
                </Link>
            </div>

            {!tickets || tickets.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No hay tickets pagados para este evento.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
                            <th className="p-4 border-b">Código</th>
                            <th className="p-4 border-b">Asistente</th>
                            <th className="p-4 border-b">Tipo</th>
                            <th className="p-4 border-b">Precio</th>
                            <th className="p-4 border-b">Estado</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {tickets.map((ticket) => (
                            <tr key={ticket.ticketCode} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-900">{ticket.ticketCode}</td>
                                <td className="p-4">
                                    <p className="font-semibold text-gray-900">
                                        {mapaNombres.get(ticket.userEmail) || ticket.userEmail.split('@')[0]}
                                    </p>
                                    <p className="text-xs text-gray-500">{ticket.userEmail}</p>
                                </td>
                                <td className="p-4 text-gray-600">{ticket.type}</td>
                                <td className="p-4 text-gray-600">${ticket.price}</td>
                                <td className="p-4">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-bold ${
                                                ticket.status === 'PAID'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            {ticket.status}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};